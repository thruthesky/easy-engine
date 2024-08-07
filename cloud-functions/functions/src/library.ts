import {logger} from "firebase-functions/v2";
import * as express from "express";

/**
 * Debug console log
 *
 * @param {unknown[]} args arguments to be logged to the console
 */
export function dog(...args: unknown[]) {
  console.log("-- dog;", ...args);
}

/**
 * Returns a string that is cut to the length.
 *
 * @param {any[]} arr array to cut
 * @param {number} size size of the chunk
 * @return {any[]}
 */
export const chunk = (
  arr: any[], // eslint-disable-line
  size: number
): any[] => // eslint-disable-line
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Array.from({length: Math.ceil(arr.length / size)}, (_: any, i: number) =>
    arr.slice(i * size, i * size + size)
  );

/**
 * Handle HTTP error
 *
 * @param {Error|unknown} e error
 * @param {express.Response} response response
 * @return {void} void
 */
export function handleHttpError(
  e: Error | unknown,
  response: express.Response
): void {
  logger.error(e);
  if (e instanceof Error) {
    response.send({error: e.message});
  } else {
    response.send({error: "unknown error"});
  }
}
