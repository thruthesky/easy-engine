import * as admin from "firebase-admin";

let initialized = false;

export const initializeFirebaseOnce = () => {
  if (admin.apps.length > 0) {
    return;
  }

  if (initialized) {
    return;
  }

  initialized = true;
  admin.initializeApp({
    //   databaseURL:
    //     "https://withcenter-test-5-default-rtdb.asia-southeast1.firebasedatabase.app",

    databaseURL:
      "https://withcenter-test-3-default-rtdb.us-central1.firebasedatabase.app",
  });
};
