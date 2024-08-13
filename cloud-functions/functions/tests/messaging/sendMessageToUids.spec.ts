/**
 * Unit Test Only
 */
import { expect } from "chai";
import "mocha";
import { initializeFirebaseOnce } from "../initialize-firebase-once";
import { MessagingService } from "../../src/messaging/messaging.service";
import { Config } from "../../src/config";
import { getDatabase } from "firebase-admin/database";
// import { getDatabase } from "firebase-admin/database";
// import { Config } from "../../src/config";

initializeFirebaseOnce();

describe("Send messages to uids", () => {
  // it("Check input uids empty string", async () => {
  //   try {
  //     const re = await MessagingService.sendMessageToUids({
  //       uids: "",
  //       title: "",
  //       body: "",
  //     });
  //     expect.fail("must fail, uids is empty " + re);
  //   } catch (e: any) {
  //     expect(e.message).equal("uids-must-not-be-empty");
  //   }
  // });
  // it("Check input uids empty array", async () => {
  //   try {
  //     const re = await MessagingService.sendMessageToUids({
  //       uids: [],
  //       title: "",
  //       body: "",
  //     });
  //     expect.fail("must fail, uids is empty " + re);
  //   } catch (e: any) {
  //     expect(e.message).equal("uids-must-not-be-empty");
  //   }
  // });

  // it("Check input uid exsit but title", async () => {
  //   try {
  //     const re = await MessagingService.sendMessageToUids({
  //       uids: "uids-ABC123-uids",
  //       title: "",
  //       body: "",
  //     });
  //     expect.fail("must fail, uid exist but title is empty " + re);
  //   } catch (e: any) {
  //     expect(e.message).equal("title-must-not-be-empty");
  //   }
  // });

  // it("Check input body", async () => {
  //   try {
  //     const re = await MessagingService.sendMessageToUids({
  //       uids: "uids-ABC123-uids",
  //       title: "title - (sendMessageToUids) - " + new Date().toISOString(),
  //       body: "",
  //     });
  //     expect.fail("must fail, body is empty " + re);
  //   } catch (e: any) {
  //     expect(e.message).equal("body-must-not-be-empty");
  //   }
  // });

  // it("Check input success with 0 tokens", async () => {
  //   const re = await MessagingService.sendMessageToUids({
  //     uids: "uids-ABC123-uids",
  //     title: "title - uids-ABC123-uids - " + new Date().toISOString(),
  //     body: "body (sendMessageToUids)",
  //   });
  //   expect(re).to.be.an("array");
  //   expect(re.length).equal(0);
  // });

  // it("Check input success with 1 tokens", async () => {
  //   const db = getDatabase();
  //   db.ref(Config.fcmTokens).child("token-DEF123-uids").set("uids-DEF123-uids");
  //   const re = await MessagingService.sendMessageToUids({
  //     uids: "uids-DEF123-uids",
  //     title: "title -uids-DEF123-uids - " + new Date().toISOString(),
  //     body: "body (sendMessageToUids)",
  //   });
  //   expect(re).to.be.an("array");
  //   expect(re.length).equal(1);
  // });

  // it("Check input success with valid tokens", async () => {
  //   const db = getDatabase();
  //   db.ref(Config.fcmTokens)
  //     .child(MessagingConfig.validToken)
  //     .set("uids-GHI123-uids");
  //   const re = await MessagingService.sendMessageToUids({
  //     uids: "uids-GHI123-uids",
  //     title: "title -uids-GHI123-uids - " + new Date().toISOString(),
  //     body: "body (sendMessageToUids)",
  //   });

  //   expect(re).to.be.an("array");
  //   expect(re.length).equal(0);
  // });

  // it("sendMessageToUids", async () => {
  //   // save some tokens with some uid.
  //   const uidA = "uid-a";
  //   const uidB = "uid-b";
  //   const tokensForUidA = ["token-a", "token-b"];
  //   const tokensForUidB = ["token-c", "token-d", MessagingConfig.validToken];

  //   const db = getDatabase();
  //   db.ref(Config.fcmTokens).child(tokensForUidA[0]).set(uidA);
  //   db.ref(Config.fcmTokens).child(tokensForUidA[1]).set(uidA);
  //   db.ref(Config.fcmTokens).child(tokensForUidB[0]).set(uidB);
  //   db.ref(Config.fcmTokens).child(tokensForUidB[1]).set(uidB);
  //   db.ref(Config.fcmTokens).child(tokensForUidB[2]).set(uidB);

  //   const re = await MessagingService.sendMessageToUids({
  //     title: "title - (sendMessageToUids) - " + new Date().toISOString(),
  //     body: "body",
  //     uids: [uidA, uidB, "GatA8bgsNlcGDEmQ5m4N3xhkVmZ2"],
  //   });

  //   expect(re).to.be.an("array");

  //   expect(re.length).equal(5);
  // });

  it("Send message to uids with/without exclude subsribers", async () => {
    const db = getDatabase();
    const userA = "-subs-exclude-uid-a";
    const userB = "-subs-include-uid-b";
    const subscriptionName = "-subs-exclude-subscribe-name-uid-a";

    /// subscribe userA only
    await db
      .ref(Config.fcmSubscriptions)
      .child(subscriptionName)
      .child(userA)
      .set(true);

    await db
      .ref(Config.fcmSubscriptions)
      .child(subscriptionName)
      .child(userB)
      .remove();

    await db.ref(Config.fcmTokens).child("-sub1-tokens").set(userA);
    await db.ref(Config.fcmTokens).child("-sub2-tokens").set(userA);
    await db.ref(Config.fcmTokens).child("-sub3-tokens").set(userA);
    await db.ref(Config.fcmTokens).child("-sub4-tokens").set(userB);

    let re1 = await MessagingService.sendMessageToUids({
      uids: [userA, userB],
      title: "subs with exclude uids - " + new Date().toISOString(),
      body: "body (sendMessageToUids)",
    });

    expect(re1).to.be.an("array");
    expect(re1.length).equal(4);

    let re2 = await MessagingService.sendMessageToUids({
      uids: [userA, userB],
      excludeSubscribers: true,
      subscriptionName: subscriptionName,
      title: "subs with exclude uids - " + new Date().toISOString(),
      body: "body (sendMessageToUids)",
    });

    expect(re2).to.be.an("array");
    expect(re2.length).equal(1);
  });
});
