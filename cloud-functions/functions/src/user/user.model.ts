import {UserDocument} from "./user.interfaces";
import * as admin from "firebase-admin";
import {getAuth, UserRecord} from "firebase-admin/auth";
import * as functions from "firebase-functions";


/**
 * UserDocument model
 */
export class UserModel {
    /**
     * Create a user document in the Firestore and returns the user object.
     *
     * Note that, it does not create the user account in the FirebaseAuth.
     *
     * @return {Promise<UserDocument>} UserDocument object
     */
    static async createUserDocument(): Promise<UserDocument> {
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
     * Create a user account in the FirebaseAuth and returns the user record.
     *
     * Note that, it does not create the user document in the Firestore.
     *
     * @return {Promise<UserRecord>} User Record of the Firebase Auth
     */
    static async createUserAccount(): Promise<UserRecord> {
        const auth = getAuth();
        const user = await auth.createUser({
            email: "test" + new Date().getTime() + "@example.com",
            password: "password,*12345a",
        });
        return user;
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
     * @return {Promise} the user uid
     */
    static async claimAdmin(uid: string): Promise<{ uid: string }> {
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
        return {uid};
    }


    /**
     * Delete the user account from FirebaseAuth
     *
     *
     * @param {string} uid uid of the user
     * @return {Promise} the user uid
     */
    static async deleteAccount(uid: string): Promise<{ uid: string }> {
        if (!uid) {
            throw new functions.https.HttpsError("invalid-argument", "The uid is empty on deleteAccount.");
        }
        const auth = getAuth();
        await auth.deleteUser(uid);
        return {uid};
    }
}

