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
        databaseURL: "https://withcenter-test-5-default-rtdb.firebaseio.com/",
    });
};
