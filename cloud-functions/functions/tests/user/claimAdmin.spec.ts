/**
 * Unit Test Only
 */
import { expect } from "chai";
import "mocha";
import * as admin from "firebase-admin";
import { initializeFirebaseOnce } from "../initialize-firebase-once";
import { UserModel } from "../../src/user/user.model";

initializeFirebaseOnce();

describe("Claim admin", () => {
    it("Claim as admin.", async () => {
        const db = admin.firestore();

        /// Delete existing admin
        const snapshot = await db.collection('users').where('admin', '==', true).get();
        if (snapshot.size > 0) {
            snapshot.docs.forEach(async (doc) => {
                await doc.ref.update({ admin: false });
            });
        }


        /// Create a user
        const user = await UserModel.createUserDocument();

        /// Claim him as admin
        await UserModel.claimAdmin(user.uid);

        const snapshot2 = await db.collection('users').where('admin', '==', true).get();
        const size = snapshot.size;
        expect(size).equals(1);
        expect(snapshot2.docs[0].id).equals(user.uid);
    });
});

