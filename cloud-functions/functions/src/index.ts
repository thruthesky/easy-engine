import * as admin from "firebase-admin";
import {setGlobalOptions} from "firebase-functions/v2";
import {Config} from "./config";

admin.initializeApp();

// set region
setGlobalOptions({
  region: Config.region,
});

export * from "./user/user.functions";
export * from "./messaging/messaging.functions";
