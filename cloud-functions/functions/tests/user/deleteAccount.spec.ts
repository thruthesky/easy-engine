/**
 * Unit Test Only
 */
import { expect } from "chai";
import "mocha";
import * as admin from "firebase-admin";
import { initializeFirebaseOnce } from "../initialize-firebase-once";
import { UserModel } from "../../src/user/user.model";


initializeFirebaseOnce();

describe("Delete account", () => {
    it("Delete the login user's account", async () => {


        /// Create a user
        const user = await UserModel.createUserAccount();

        const before = await admin.auth().getUser(user.uid);
        expect(before.uid).equals(user.uid);

        /// Claim him as admin
        const result = await UserModel.deleteAccount(user.uid);
        expect(result.uid).equals(user.uid);

        try {
            await admin.auth().getUser(user.uid);
            expect.fail('Should not be here');
        } catch (e: any) {
            console.log('e:', e.code);
            expect(e.code).equals('auth/user-not-found');
        }
    });
});


