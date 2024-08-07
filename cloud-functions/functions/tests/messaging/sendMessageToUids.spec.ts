/**
 * Unit Test Only
 */
import { expect } from "chai";
import "mocha";
import { initializeFirebaseOnce } from "../initialize-firebase-once";
import { MessagingService } from "../../src/messaging/messaging.service"
import { getDatabase } from "firebase-admin/database";
import { Config } from "../../src/config";


initializeFirebaseOnce();

describe("Send messages to Tokens", () => {

    it("sendMessageToUids", async () => {
        // save some tokens with some uid.
        const uidA = "uid-a";
        const uidB = "uid-b";
        const tokensForUidA = ["token-a", "token-b"];
        const tokensForUidB = ["token-c", "token-d", "ea9BfwxMEkN3v_epKD989P:APA91bGo80j_E6Ta1o7f_koYoGxWg0VPzfWZ8QasfqVZ6K8ouSveFicIvXgy_TPK3QPYO7QVZSOPBtD3Nha5hEjv8NmWVj4LbDHBRulgx-6sIaV_04uRKtZNipnPPGqgvRnh8r8tFi8A"];

        const db = getDatabase();
        db.ref(Config.fcmTokens).child(tokensForUidA[0]).set(uidA);
        db.ref(Config.fcmTokens).child(tokensForUidA[1]).set(uidA);
        db.ref(Config.fcmTokens).child(tokensForUidB[0]).set(uidB);
        db.ref(Config.fcmTokens).child(tokensForUidB[1]).set(uidB);
        db.ref(Config.fcmTokens).child(tokensForUidB[2]).set(uidB);


        const re = await MessagingService.sendMessageToUids({
            title: "title - (sendMessageToUids) - " + new Date().toISOString(),
            body: "body",
            uids: [uidA, uidB]
        });

        expect(re).to.be.an('array');
        console.log(re);
        expect(re.length).equal(4);
    });

});


