import {onCall} from "firebase-functions/v1/https";
import {UserModel} from "./user.model";

/**
 * Claim a user as admin
 *
 * Set the admin field of the user to true to make him an admin.
 *
 * @param {string} uid User ID
 *
 * @returns {string} User ID
 */

export const claimAdmin = onCall(async (data, context): Promise<string> => {
    return await UserModel.claimAdmin(context.auth?.uid ?? "");
});

