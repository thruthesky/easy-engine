import {onRequest} from "firebase-functions/v2/https";
import {MessagingService} from "./messaging.service";
import {logger} from "firebase-functions/v2";
import {handleHttpError} from "../library";

/**
 * Send message with tokens
 *
 * TODO: Unit test
 */
export const sendMessage = onRequest(async (request, response) => {
  logger.info("request.query of sendPushNotifications", request.body);

  try {
    const body =
      typeof request.body === "string" ?
        JSON.parse(request.body) :
        request.body;
    const res = await MessagingService.sendMessage(body);
    response.send(res);
  } catch (e) {
    handleHttpError(e, response);
  }
});

/**
 * Send message with user uids.
 *
 * TDOO: Unit test
 */
export const sendMessageToUids = onRequest(async (request, response) => {
  logger.info("request.query of sendPushNotifications", request.body);

  try {
    const body =
      typeof request.body === "string" ?
        JSON.parse(request.body) :
        request.body;
    const res = await MessagingService.sendMessageToUids(body);
    response.send(res);
  } catch (e) {
    handleHttpError(e, response);
  }
});

/**
 * Send message with user tokens.
 *
 * TDOO: Unit test
 */
export const sendMessageToSubscription = onRequest(
  async (request, response) => {
    logger.info("request.query of sendPushNotifications", request.body);

    try {
      const body =
        typeof request.body === "string" ?
          JSON.parse(request.body) :
          request.body;
      const res = await MessagingService.sendMessageToSubscription(body);
      response.send(res);
    } catch (e) {
      handleHttpError(e, response);
    }
  }
);
