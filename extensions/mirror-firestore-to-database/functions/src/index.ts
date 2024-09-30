/*
 * This template contains a HTTP function that responds
 * with a greeting when called
 *
 * Reference PARAMETERS in your functions code with:
 * `process.env.<parameter-name>`
 * Learn more about building extensions in the docs:
 * https://firebase.google.com/docs/extensions/publishers
 */

import * as functions from "firebase-functions";
import { isCreate, isDelete, isUpdate } from "./library";






/**
 * Mirror Firestore to Database
 */
export const postSummariesOnPostWrite = functions.database.ref(`{collection}/{document}`)
    .onWrite(async (change: functions.Change<functions.database.DataSnapshot>, context: functions.EventContext<{
        collection: string;
        document: string;
    }>) => {
        if (isCreate(change)) {
        } else if (isUpdate(change)) {
            return;
        } else if (isDelete(change)) {
        }
    });