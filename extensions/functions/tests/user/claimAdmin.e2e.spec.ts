/**
 * E2E 테스트를 하는 코드
 * 
 * Write a e2e test code for claimAdmin firebase cloud function of onCall event trigger using mocha and chai.
 */

import { expect } from "chai";
import "mocha";

import * as admin from "firebase-admin";

import { initializeFirebaseOnce } from "../initialize-firebase-once";


import * as userFunctions from "../../src/user/user.functions";
import { UserModel } from "../../src/user/user.model";

const test = require("firebase-functions-test")({
    databaseURL: "https://withcenter-test-5-default-rtdb.firebaseio.com/",
    storageBucket: "withcenter-test-5.appspot.com",
    projectId: "withcenter-test-5",
}, "/Users/thruthesky/Documents/Keys/Firebase-Service-Accounts/withcenter-test-5/withcenter-test-5-firebase-adminsdk-9zljh-18e4b81cc6.json");

initializeFirebaseOnce();

describe("Claim Admin", () => {
    it("Should be admin", async () => {
        const db = admin.firestore();

        /// Delete existing admin
        const snapshot = await db.collection('users').where('admin', '==', true).get();
        if (snapshot.size > 0) {
            snapshot.docs.forEach(async (doc) => {
                await doc.ref.update({ admin: false });
            });
        }

        const user = await UserModel.createUser();

        const wrapped = test.wrap(userFunctions.claimAdmin);
        const result = await wrapped({},
            {
                auth: {
                    uid: user.uid,
                }
            });

        expect(result).equals(user.uid);

        const user2 = await UserModel.createUser();

        try {
            await wrapped({},
                {
                    auth: {
                        uid: user2.uid,
                    }
                });
        } catch (e: any) {
            console.log('e:', e.code);
            expect(e.code).equals('already-exists');
        }

    });
});
