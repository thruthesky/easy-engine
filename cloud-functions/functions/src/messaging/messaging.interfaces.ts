

import { AndroidConfig, ApnsConfig, FcmOptions, WebpushConfig } from "firebase-admin/messaging";

/**
 * Inteface for sendNotificationToUids
 *
 * @uids: Array of uids to send the message to
 * @title: Title of the message
 * @body: Body of the message
 * @data: Additional data to be sent
 */
export interface SendMessageToUidsRequest {
    uids: Array<string>;
    concurrentConnections?: number;
    title: string;
    body: string;
    image?: string;
    data?: { [key: string]: string };
    // 푸시 알림을 전송하는 목적.  정해진 값은 없다, 적절히 client 가 입력해서 전달하면 된다. 클라이언트가 직접 만들어 사용하는 프로토콜이다.
    // - 로그를 기록할 때 사용한다.
    // 이 값에는 'post', 'comment', 'like', 'chat', 'profile'
    // 등 어떤 액션에 대한 알림인지를 지정한다.
    // 'post' 는 새 글 작성 알림, 'comment' 는 새 코멘트 작성 알림,
    // 'like' 는 좋아요 알림, 'chat' 은 채팅 알림,
    action: string;
    // 알림을 받는 대상의 객체 ID 이다. 정해진 값은 없다, 적절히 client 가 입력해서 전달하면 된다.
    // action 이 'post' 이면 글 ID, 'comment' 이면 comment ID, 'like' 이면 like 를 받는 상대방의 ID, 'chat' 이면 채팅방 ID,
    // 'profile' 이면 프로필 사용자 ID 이다.
    targetId: string;
}



/**
 * Basic interface for sending a message
 *
 * Note that, the image is optional and is not the required
 * field for sending a message
 */
export interface PayloadNotification {
    title: string;
    body: string;
    image?: string;
}



/**
 * Interface for push notification payload.
 */
export interface Payload {
    notification: PayloadNotification;
    data: {
        [key: string]: string;
    };
    token: string;
    success?: boolean;
    code?: string;

    android?: AndroidConfig;
    webpush?: WebpushConfig;
    apns?: ApnsConfig;
    fcmOptions?: FcmOptions;
}





/**
 *
 */
export interface SendMessageRequest extends SendMessageToUidsRequest {
    tokens: Array<string>;
}


export interface SendMessageToSubscription extends SendMessageToUidsRequest {
    subscription: string;
}