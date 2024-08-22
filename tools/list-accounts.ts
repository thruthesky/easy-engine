import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const app = initializeApp();

getAuth()
  .listUsers(1000)
  .then((listUsersResult) => {
    listUsersResult.users.forEach((userRecord) => {

      if (!userRecord.email && !userRecord.phoneNumber) {
        console.log('---> delete', userRecord.uid);
        getAuth().deleteUser(userRecord.uid)
          .then(() => {
            console.log('Successfully deleted user');
          })
          .catch((error) => {
            console.log('Error deleting user:', error);
          });
      }
    });
  })
  .catch((error) => {
    console.log('Error listing users:', error);
  });