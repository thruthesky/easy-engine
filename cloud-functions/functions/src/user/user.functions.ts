import {onCall} from "firebase-functions/v1/https";
import {UserModel} from "./user.model";

/**
 * Claim a user as admin
 *
 * Set the admin field of the user to true to make him an admin.
 *
 * @returns {Promise<{uid: string}>} User ID
 */

export const claimAdmin = onCall(async (data, context): Promise<{ uid: string }> => {
    return await UserModel.claimAdmin(context.auth?.uid ?? "");
});


/**
 * Delete the login user's account from Firebase Auth.
 *
 * Set the admin field of the user to false to remove his admin rights.
 *
 * @returns {Promise<{uid: string}>} User ID
 */
export const deleteAccount = onCall(async (data, context): Promise<{ uid: string }> => {
    return await UserModel.deleteAccount(context.auth?.uid ?? "");
});
