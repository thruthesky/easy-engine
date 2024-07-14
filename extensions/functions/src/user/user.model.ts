import {UserDocument} from "./user.interfaces";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";


/**
 * UserDocument model
 */
export class UserModel {
    /**
     * Create a user in the Firestore and returns the user
     *
     * @return {Promise<UserDocument>} UserDocument object
     */
    static async createUser(): Promise<UserDocument> {
        const ref = admin.firestore().collection("users").doc();
        const user: Partial<UserDocument> = {
            displayName: "Test UserDocument",
            photoUrl: "https://example.com/photo.jpg",
            admin: false,
        };

        await ref.set(user);
        return await this.getUser(ref.id);
    }

    /**
     * Get a user from Firestore
     *
     * @param {string} uid UserDocument ID
     *
     * @return {any} UserDocument object
     */
    static async getUser(uid: string): Promise<UserDocument> {
        const snapshot = await admin.firestore().collection("users").doc(uid).get();
        const data = snapshot.data() as Partial<UserDocument>;
        return {
            uid,
            ...data,
        } as UserDocument;
    }

    /**
     * Set the admin field of the user to true to make him an admin.
     *
     * If there is a user with the admin field set to true, it will throw an error.
     *
     * @param {string} uid uid of the user
     * @return {Promise<string>} the user uid
     */
    static async claimAdmin(uid: string): Promise<string> {
        if (!uid) {
            throw new functions.https.HttpsError("invalid-argument", "The function must be called with " +
                "one arguments 'uid' containing the user id to claim as admin");
        }
        const snapshot = await admin.firestore().collection("users").where("admin", "==", true).get();
        if (snapshot.size > 0) {
            throw new functions.https.HttpsError("already-exists", "There is already an admin");
        }
        await admin.firestore().collection("users").doc(uid).update({
            admin: true,
        });
        return uid;
    }
}

