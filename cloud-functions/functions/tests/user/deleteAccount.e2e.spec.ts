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


        /// Create a user
        const user = await UserModel.createUserAccount();

        const before = await admin.auth().getUser(user.uid);
        expect(before.uid).equals(user.uid);


        const wrapped = test.wrap(userFunctions.deleteAccount);
        const result = await wrapped({},
            {
                auth: {
                    uid: user.uid,
                }
            });

        expect(result.uid).equals(user.uid);


        /// Delete it again
        try {
            await wrapped({},
                {
                    auth: {
                        uid: user.uid,
                    }
                });
        } catch (e: any) {
            // console.log('e:', e.code);
            expect(e.code).equals('auth/user-not-found');
        }

    });
});
