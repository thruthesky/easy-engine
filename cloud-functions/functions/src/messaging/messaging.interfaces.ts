

import {AndroidConfig, ApnsConfig, FcmOptions, WebpushConfig} from "firebase-admin/messaging";

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
    data?: {
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
export interface SendMessageRequest {
    title: string;
    body: string;
    image?: string;
    data?: { [key: string]: string };
    tokens: Array<string>;
}


export interface SendMessageToSubscription {
    title: string;
    body: string;
    image?: string;
    data?: { [key: string]: string };
    subscription: string;
}
