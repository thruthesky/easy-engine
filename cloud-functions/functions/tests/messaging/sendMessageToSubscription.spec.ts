/**
 * Unit Test Only
 */
import { expect } from "chai";
import "mocha";
import { initializeFirebaseOnce } from "../initialize-firebase-once";
import { MessagingService } from "../../src/messaging/messaging.service";
import { getDatabase } from "firebase-admin/database";
import { Config } from "../../src/config";

initializeFirebaseOnce();

describe("Send messages to Subscriptions", () => {
  it("Check input subscription", async () => {
    try {
      const re = await MessagingService.sendMessageToSubscription({
        subscription: "",
        title: "",
        body: "",
      });
      expect.fail("must fail, subscription is empty " + re);
    } catch (e: any) {
      expect(e.message).equal("subscription-must-not-be-empty");
    }
  });

  it("Check input title", async () => {
    try {
      const re = await MessagingService.sendMessageToSubscription({
        subscription: "subscriptionXYZ123----",
        title: "",
        body: "",
      });
      expect.fail("must fail, title is empty " + re);
    } catch (e: any) {
      expect(e.message).equal("title-must-not-be-empty");
    }
  });

  it("Check input body", async () => {
    try {
      const re = await MessagingService.sendMessageToSubscription({
        subscription: "subscriptionXYZ123----",
        title: "title - (sendMessageToUids) - " + new Date().toISOString(),
        body: "",
      });
      expect.fail("must fail, body is empty " + re);
    } catch (e: any) {
      expect(e.message).equal("body-must-not-be-empty");
    }
  });

  it("Check input subscription not exist", async () => {
    try {
      const re = await MessagingService.sendMessageToSubscription({
        subscription: "subscriptionXYZ123----",
        title: "title - (sendMessageToUids) - " + new Date().toISOString(),
        body: "body",
      });
      expect.fail("must fail, subscription not found is empty " + re);
    } catch (e: any) {
      expect(e.message).equal("subscription-not-found");
    }
  });
  it("Check input subscription exist", async () => {
    const db = getDatabase();
    await db
      .ref(Config.fcmSubscriptions)
      .child("subscriptionABC123")
      .child("uid-ABC123")
      .set(true);

    const re = await MessagingService.sendMessageToSubscription({
      subscription: "subscriptionABC123",
      title: "title - (subscriptionABC123) - " + new Date().toISOString(),
      body: "body",
    });
    expect(re).to.be.an("array");
    expect(re.length).equal(0);
  });

  it("Send message to subscription", async () => {
    const db = getDatabase();
    // save some uid with some subscription.
    const subscriptionEFG = ["uid-EFG-a", "uid-EFG-b"];
    const subscriptionHIJ = ["uid-HIJ-c", "uid-HIJ-d", "uid-HIJ-e"];
    for (const uid of subscriptionEFG) {
      await db
        .ref(Config.fcmSubscriptions)
        .child("subscriptionEFG123")
        .child(uid)
        .set(true);
    }
    for (const uid of subscriptionHIJ) {
      await db
        .ref(Config.fcmSubscriptions)
        .child("subscriptionHIJ")
        .child(uid)
        .set(true);
    }

    // save some good tokens and bad tokens
    await db.ref(Config.fcmTokens).child("token-EFG-a").set("uid-EFG-a");
    await db.ref(Config.fcmTokens).child("token-EFG-b").set("uid-EFG-b");
    await db.ref(Config.fcmTokens).child("token-HIJ-c").set("uid-HIJ-c");
    await db.ref(Config.fcmTokens).child("token-HIJ-d").set("uid-HIJ-d");
    await db.ref(Config.fcmTokens).child("token-HIJ-e").set("uid-HIJ-e");
    // must be a valid token
    await db
      .ref(Config.fcmTokens)
      .child(
        "eXR2KTonTn2je2feP7K0AC:APA91bGXYxLIPhuMpia5xWphMbNHGVwcodcUPfdDUO7e8kXmbcSui40SJJjF5CuZxcYagfRQe1Y-Eo3hqOF8YsmjfeutCMAODGmB-xbE4UrnCkLJ4m3plW-_53431M6xGAC1zAftJFgP"
      )
      .set("uid-HIJ-e");

    const re = await MessagingService.sendMessageToSubscription({
      title: "title - subscriptionEFG123 - " + new Date().toISOString(),
      body: "body - (sendMessageToSubcription)",
      subscription: "subscriptionEFG123",
    });
    expect(re).to.be.an("array");
    expect(re.length).equal(2);

    const re2 = await MessagingService.sendMessageToSubscription({
      title: "title - subscriptionHIJ - " + new Date().toISOString(),
      body: "body (sendMessageToSubcription)",
      subscription: "subscriptionHIJ",
    });
    expect(re2).to.be.an("array");
    expect(re2.length).equal(3);
  });
});
