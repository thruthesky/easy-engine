import { Config } from "../config";
import { chunk, dog } from "../library";
import {
  Payload,
  PayloadNotification,
  SendMessageRequest,
  SendMessageToSubscription,
  SendMessageToUidsRequest,
} from "./messaging.interfaces";
import { SendResponse, getMessaging } from "firebase-admin/messaging";
import { getDatabase } from "firebase-admin/database";

/**
 * MessagingService
 */
export class MessagingService {
  /**
   * Android configuration for the message.
   *
   * This is thee default configuration for the message.
   */
  static android = {
    notification: {
      sound: "default",
    },
  };

  /**
   * APNS configuration for the message
   *
   * This is the default configuration for the message.
   */
  static apns = {
    payload: {
      aps: {
        sound: "default",
      },
    },
  };

  /**
   * 사용자의 uid 들을 입력받아, 그 사용자들의 토큰으로 메시지 전송
   *
   * Send message to users
   *
   * 1. This gets the user tokens from '/user-fcm-tokens/{uid}'.
   * 2. Then it chunks the tokens into 500 tokens per chunk.
   * 3. Then delete the tokens that are not valid.
   *
   * @param {Array<string>} req.uids - The list of user uids to send the message to.
   * @param {number} req.concurrentConnections - The size of chunk. Default 500. 한번에 보낼 메시지 수. 최대 500개.
   * 그런데 500개씩 하니까 좀 느리다. 256씩 두번 보내는 것이 500개 한번 보내는 것보다 더 빠르다.
   * 256 묶음으로 두 번 보내면 총 (두 번 포함) 22초.
   * 500 묵음으로 한 번 보내면 총 90초.
   * 128 묶음으로 4번 보내면 총 18 초
   *
   * 예제
   * ```
   * await MessagingService.sendNotificationToUids(['uid-a', 'uid-b'], 128, "title", "body");
   * ```
   *
   * 더 많은 예제는 firebase/functions/tests/message/sendNotificationToUids.spec.ts 참고
   *
   * @param {SendMessageToUidsRequest} req
   *
   * @param {string} req.title - The title of the message.
   *
   * @param {string} req.body - The body of the message.
   *
   * @param {string} req.image - The image of the message.
   *
   * @param {object} req.data - The extra data of the message.
   *
   * @param {string} req.action - The action of the message. This is used to log the message.
   *
   * @param {string} req.targetId - The target id of the message. This is used to log the message.
   *
   * @param {string} req.concurrentConnections - The size of chunk. Default 500.
   * 기본 500 개 단위로 chunk. sendEach() 가 최대 500개 까지 지원
   *
   * @return {string | undefined} - 로그를 기록하고 그 결과를 리턴한다.
   */
  static async sendMessageToUids(
    req: SendMessageToUidsRequest
  ): Promise<string[]> {
    // prepare the parameters
    let { uids, concurrentConnections, title, body, image, data } = req;
    data = data ?? {};

    concurrentConnections = Math.min(concurrentConnections || 500, 500);

    const tokenChunks = await this.getTokensFromUids(
      uids,
      concurrentConnections
    );

    // dog("----> sendNotificationToUids() -> tokenChunks:", tokenChunks);

    // 토큰 메시지 작성. 이미지는 옵션.
    const notification: PayloadNotification = { title, body };
    if (image) {
      notification["image"] = image;
    }

    let tokensWithError: Array<string> = [];

    // chunk (concurrentConnection) 단위로 메시지 작성해서 전송
    for (const tokenChunk of tokenChunks) {
      const messages: Array<Payload> = [];
      for (const token of tokenChunk) {
        messages.push({
          notification,
          data,
          token,
        });
      }
      tokensWithError = [
        ...tokensWithError,
        ...(await this.sendMessageToTokens(messages)),
      ];
    }

    if (Config.logSendingPushNotificationResult) {
      // 모든 토큰을 하나의 배열로 합친다.
      const tokens = tokenChunks.flat();

      // console.log("tokensWithError:", tokensWithError);

      // / 결과를 /push-notification-logs 에 저장한다.
      const logData = {
        title,
        body,
        createdAt: Date.now(),
        // 전체 토큰 목록에서 에러가 없는 것만 기록
        tokens: tokens.filter((token) => !tokensWithError.includes(token)),
        // 에러가 있는 토큰 목록
        tokensWithError: tokensWithError,
      };
      // console.log(logData);
      await getDatabase().ref(Config.fcmSendingResults).push(logData);
    }
    return tokensWithError;
  }

  /**
   * Send messages with tokens
   *
   * This method gets the list of tokens and  title, body, image, and data.
   * Then it sends the message to the list of tokens using the
   * sendMessageToTokens method.
   *
   * Use this method if you have token list. Don't use the
   * sendMessageToTokens directly.
   *
   * @param {MessageRequest} params - The parameters for sending messages.
   * params.tokens - The list of tokens to send the message to.
   * params.title - The title of the message.
   * params.body - The body of the message.
   * params.image - The image of the message.
   * params.data - The extra data of the message.
   *
   *
   * It returns the error results of push notification in a map like
   * below. And it only returns the tokens that has error results.
   * The tokens that succeed (without error) will not be returned.
   *
   * ```
   * {
   *   'fVWDxKs1kEzx...Lq2Vs': '',
   *   'wrong-token': 'messaging/invalid-argument;addiontional error message',
   * }
   * ```
   *
   * If there is no error with the token, the value will be empty
   * string. Otherwise, there will be a error message.
   *
   *
   *
   */
  static async sendMessage(params: SendMessageRequest): Promise<string[]> {
    if (typeof params.tokens != "object") {
      throw new Error("tokens must be an array of string");
    }
    if (params.tokens.length == 0) {
      throw new Error("tokens must not be empty");
    }
    if (!params.title) {
      throw new Error("title must not be empty");
    }
    if (!params.body) {
      throw new Error("body must not be empty");
    }

    // Remove empty tokens
    const tokens = params.tokens.filter((token) => !!token);

    // Image is optional
    const notification: PayloadNotification = {
      title: params.title,
      body: params.body,
    };
    if (params.image) {
      notification.image = params.image;
    }

    const payloads: Array<Payload> = [];

    // send the notification message to the list of tokens
    for (const token of tokens) {
      payloads.push({
        notification: notification,
        data: params.data ?? {},
        token: token,
      });
    }

    return await this.sendMessageToTokens(payloads);
  }

  /**
   * Send messages to the list of tokens.
   *
   * This method adds the default android and apns configuration to the message.
   *
   * @param {Array<Payload>} messages messages to send
   * @return {Promise<string[]>} an array of tokens that have errors.
   * The return value is an array of tokens that have errors.
   */
  static async sendMessageToTokens(
    messages: Array<Payload>
  ): Promise<string[]> {
    const messaging = getMessaging();

    // Add apns priority in the message
    for (const message of messages) {
      message.android = {
        ...message.android,
        ...MessagingService.android,
      };
      message.apns = {
        ...message.apns,
        ...MessagingService.apns,
      };
    }

    // print the messages
    // for (const message of messages) {
    //     console.log("message:", message);
    // }

    // dog("-----> sendNotificationToUids -> sendEach()");
    const res = await messaging.sendEach(messages);
    dog(
      "-----> sendNotificationToUids -> sendEach() result:",
      "successCount",
      res.successCount,
      "failureCount",
      res.failureCount
    );

    // chunk 단위로 전송 - 결과 확인 및 에러 토큰 삭제
    for (let i = 0; i < messages.length; i++) {
      const response = res.responses[i] as SendResponse;
      if (response.success == false) {
        // 에러 토큰 표시
        messages[i].success = false;
        messages[i].code = response.error?.code;
        // console.log("error code:", response.error?.code);
        // console.log("error message:", response.error?.message);
      }
    }

    // 전송 결과에서 에러가 있는 토큰을 골라낸다.
    const tokensWithError: string[] = messages
      .filter((message) => {
        if (message.success !== false) return false;
        // 푸시 토큰이 잘못되었을 때는 아래의 세개 중 한개의 에러 메시지가 나타난다.
        if (message.code === "messaging/invalid-argument") return true;
        else if (message.code === "messaging/invalid-registration-token") {
          return true;
        } else if (
          message.code === "messaging/registration-token-not-registered"
        ) {
          return true;
        }
        return false;
      })
      .map((message) => message.token);
    // dog("에러가 있는 토큰 목록(삭제될 토큰 목록):", tokensWithError);

    // 에러가 있는 토큰 삭제 옵션이 설정되어져 있으면, 에러가 있는 토큰을 DB 에서 삭제한다.
    if (Config.removeTokensWithErrors) {
      const promisesToRemove = [];
      for (let i = 0; i < tokensWithError.length; i++) {
        promisesToRemove.push(
          getDatabase()
            .ref(`${Config.fcmTokens}/${tokensWithError[i]}`)
            .remove()
        );
      }
      await Promise.allSettled(promisesToRemove);
    }

    return tokensWithError;
  }

  /**
   * Returns the list of tokens under '/user-fcm-tokens/{uid}'.
   *
   * @param {Array<string>} uids uids of users
   * @param {number} chunkSize chunk size - default 128.
   * chunk 가 128 이고, 총 토큰의 수가 129 이면, 첫번째 배열에 128 개의 토큰 두번째 배열에 1개의 토큰이 들어간다.
   * 예를 들어, 토큰이 a, b, c, d, e 와 같이 5개인데, chunkSize 가 2 이면, 리턴 값은 [a, b], [c, d], [e] 가 된다.
   *
   * @return {Promise<Array<Array<string>>>} - Array of tokens.
   * 리턴 값은 2차원 배열이다. 각 배열은 최대 [chunkSize] 개의 토큰을 담고 있다.
   *
   * @see the example of `tests/messaging/sendMessageToUids.spec.ts` for more details.
   */
  static async getTokensFromUids(
    uids: Array<string>,
    chunkSize = 128
  ): Promise<Array<Array<string>>> {
    const promises = [];

    if (uids.length == 0) return [];

    const db = getDatabase();

    // uid 사용자 별 모든 토큰을 가져온다.
    for (const uid of uids) {
      promises.push(db.ref(Config.fcmTokens).orderByValue().equalTo(uid).get());
    }
    const settled = await Promise.allSettled(promises);

    // console.log('settled:', settled);

    // 토큰을 배열에 담는다.

    const tokens: Array<string> = [];
    for (const res of settled) {
      if (res.status == "fulfilled") {
        res.value.forEach((token) => {
          tokens.push(token.key);
        });
      }
    }

    // 토큰을 chunk 단위로 나누어 리턴
    return chunk(tokens, chunkSize);
  }

  /**
   * Send message to the list of user uids in the subscription.
   *
   * @param {*} req request
   * @return {string[]} - The list of tokens that have errors.
   */
  static async sendMessageToSubscription(
    req: SendMessageToSubscription
  ): Promise<string[]> {
    // 1. Get the list of user uids of the subscriptions
    const db = getDatabase();
    const ref = db.ref(Config.fcmSubscriptions).child(req.subscription);
    const snapshot = await ref.get();
    if (!snapshot.exists()) {
      throw new Error("Subscription not found");
    }
    const uids = Object.keys(snapshot.val());

    // dog('uids:', uids);

    // 2. send the messages
    const data: SendMessageToUidsRequest = {
      uids: uids,
      concurrentConnections: 500,
      title: req.title,
      body: req.body,
      image: req.image,
      data: req.data,
    };
    return await this.sendMessageToUids(data);
  }
}
