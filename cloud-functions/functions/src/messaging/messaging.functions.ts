import { onRequest } from "firebase-functions/v2/https";
import { MessagingService } from "./messaging.service";
import { logger } from "firebase-functions/v2";
import { handleHttpError } from "../library";

/**
 * Send message with tokens
 *
 */
export const sendMessageToTokens = onRequest(async (request, response) => {
  logger.info("request.query of sendMessageToTokens", request.body);

  try {
    const res = await MessagingService.sendMessage(request.body);
    response.send(res);
  } catch (e) {
    handleHttpError(e, response);
  }
});

/**
 * Send message with user uids.
 *
 */
export const sendMessageToUids = onRequest(async (request, response) => {
  logger.info("request.query of sendMessageToUids", request.body);

  try {
    const res = await MessagingService.sendMessageToUids(request.body);
    response.send(res);
  } catch (e) {
    handleHttpError(e, response);
  }
});

/**
 * Send message with user tokens.
 *
 */
export const sendMessageToSubscription = onRequest(
  async (request, response) => {
    logger.info("request.query of sendMessageToSubscription", request.body);

    try {
      const res = await MessagingService.sendMessageToSubscription(
        request.body
      );
      response.send(res);
    } catch (e) {
      handleHttpError(e, response);
    }
  }
);
