import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

const app = initializeApp(
    {
        databaseURL: 'https://withcenter-school-default-rtdb.asia-southeast1.firebasedatabase.app',
    }
);



let count = 0;
const batch = 100;

/// This function will list all users in the Firebase project
const listAllUsers = async (nextPageToken?) => {
    try {
        // List batch of users, 1000 at a time.
        const listUsersResult = await getAuth().listUsers(batch, nextPageToken);
        count += listUsersResult.users.length;
        listUsersResult.users.forEach(async (userRecord) => {
            const json = userRecord.toJSON();
            console.log('user: uid: ', json['uid'], 'phoneNumber: ', json['phoneNumber']);
            if (json['phoneNumber']) {
                await getDatabase().ref('user-phone-sign-in-numbers').child(json['phoneNumber']).set((new Date).getTime());
            }
        });
        if (listUsersResult.pageToken) {
            // List next batch of users.
            await listAllUsers(listUsersResult.pageToken);
        }
    } catch (error) {
        console.log('Error listing users:', error);
    }
};

// Start listing users from the beginning, 1000 at a time.
const main = async () => {
    await listAllUsers();
    console.log('number of users', count);
    process.exit(0);
};
main();
