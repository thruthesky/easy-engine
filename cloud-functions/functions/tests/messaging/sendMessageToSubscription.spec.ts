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
        // save some uid with some subscription.
        const subscriptionA = ["uid-a", "uid-b"];
        const subscriptionB = ["uid-c", "uid-d", "uid-e"];

        const db = getDatabase();

        for (const uid of subscriptionA) {
            await db.ref(Config.fcmSubscriptions).child('subscriptionA').child(uid).set(subscriptionA);
        }
        for (const uid of subscriptionB) {
            await db.ref(Config.fcmSubscriptions).child('subscriptionB').child(uid).set(subscriptionA);
        }

        // save some good tokens and bad tokens
        await db.ref(Config.fcmTokens).child('token-a').set('uid-a');
        await db.ref(Config.fcmTokens).child('token-b').set('uid-b');
        await db.ref(Config.fcmTokens).child('token-c').set('uid-c');
        await db.ref(Config.fcmTokens).child('token-d').set('uid-d');
        await db.ref(Config.fcmTokens).child('token-e').set('uid-e');
        await db.ref(Config.fcmTokens).child('ea9BfwxMEkN3v_epKD989P:APA91bGo80j_E6Ta1o7f_koYoGxWg0VPzfWZ8QasfqVZ6K8ouSveFicIvXgy_TPK3QPYO7QVZSOPBtD3Nha5hEjv8NmWVj4LbDHBRulgx-6sIaV_04uRKtZNipnPPGqgvRnh8r8tFi8A').set('uid-e');



        const re = await MessagingService.sendMessageToSubscription({
            title: "title - (sendMessageToUids) - " + new Date().toISOString(),
            body: "body",
            subscription: 'subscriptionA'
        });
        expect(re).to.be.an('array');
        expect(re.length).equal(2);


        const re2 = await MessagingService.sendMessageToSubscription({
            title: "title - (sendMessageToUids) - " + new Date().toISOString(),
            body: "body",
            subscription: 'subscriptionB'
        });
        expect(re2).to.be.an('array');
        expect(re2.length).equal(3);
    });

});


