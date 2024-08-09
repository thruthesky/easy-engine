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
  it("Check input uids empty string", async () => {
    try {
      const re = await MessagingService.sendMessageToUids({
        uids: "",
        title: "",
        body: "",
      });
      expect.fail("must fail, uids is empty " + re);
    } catch (e: any) {
      expect(e.message).equal("uids-must-not-be-empty");
    }
  });
  it("Check input uids empty array", async () => {
    try {
      const re = await MessagingService.sendMessageToUids({
        uids: [],
        title: "",
        body: "",
      });
      expect.fail("must fail, uids is empty " + re);
    } catch (e: any) {
      expect(e.message).equal("uids-must-not-be-empty");
    }
  });

  it("Check input uid exsit but title", async () => {
    try {
      const re = await MessagingService.sendMessageToUids({
        uids: "uids-ABC123-uids",
        title: "",
        body: "",
      });
      expect.fail("must fail, uid exist but title is empty " + re);
    } catch (e: any) {
      expect(e.message).equal("title-must-not-be-empty");
    }
  });

  it("Check input body", async () => {
    try {
      const re = await MessagingService.sendMessageToUids({
        uids: "uids-ABC123-uids",
        title: "title - (sendMessageToUids) - " + new Date().toISOString(),
        body: "",
      });
      expect.fail("must fail, body is empty " + re);
    } catch (e: any) {
      expect(e.message).equal("body-must-not-be-empty");
    }
  });

  it("Check input success with 0 tokens", async () => {
    const re = await MessagingService.sendMessageToUids({
      uids: "uids-ABC123-uids",
      title: "title - uids-ABC123-uids - " + new Date().toISOString(),
      body: "body (sendMessageToUids)",
    });
    expect(re).to.be.an("array");
    expect(re.length).equal(0);
  });

  it("Check input success with 1 tokens", async () => {
    const db = getDatabase();
    db.ref(Config.fcmTokens).child("token-DEF123-uids").set("uids-DEF123-uids");
    const re = await MessagingService.sendMessageToUids({
      uids: "uids-DEF123-uids",
      title: "title -uids-DEF123-uids - " + new Date().toISOString(),
      body: "body (sendMessageToUids)",
    });
    expect(re).to.be.an("array");
    expect(re.length).equal(1);
  });

  it("Check input success with valid tokens", async () => {
    const db = getDatabase();
    db.ref(Config.fcmTokens)
      .child(
        "eXR2KTonTn2je2feP7K0AC:APA91bGXYxLIPhuMpia5xWphMbNHGVwcodcUPfdDUO7e8kXmbcSui40SJJjF5CuZxcYagfRQe1Y-Eo3hqOF8YsmjfeutCMAODGmB-xbE4UrnCkLJ4m3plW-_53431M6xGAC1zAftJFgP"
      )
      .set("uids-GHI123-uids");
    const re = await MessagingService.sendMessageToUids({
      uids: "uids-GHI123-uids",
      title: "title -uids-GHI123-uids - " + new Date().toISOString(),
      body: "body (sendMessageToUids)",
    });

    expect(re).to.be.an("array");
    expect(re.length).equal(0);
  });

  it("sendMessageToUids", async () => {
    // save some tokens with some uid.
    const uidA = "uid-a";
    const uidB = "uid-b";
    const tokensForUidA = ["token-a", "token-b"];
    const tokensForUidB = [
      "token-c",
      "token-d",
      "eXR2KTonTn2je2feP7K0AC:APA91bGXYxLIPhuMpia5xWphMbNHGVwcodcUPfdDUO7e8kXmbcSui40SJJjF5CuZxcYagfRQe1Y-Eo3hqOF8YsmjfeutCMAODGmB-xbE4UrnCkLJ4m3plW-_53431M6xGAC1zAftJFgP",
    ];

    const db = getDatabase();
    db.ref(Config.fcmTokens).child(tokensForUidA[0]).set(uidA);
    db.ref(Config.fcmTokens).child(tokensForUidA[1]).set(uidA);
    db.ref(Config.fcmTokens).child(tokensForUidB[0]).set(uidB);
    db.ref(Config.fcmTokens).child(tokensForUidB[1]).set(uidB);
    db.ref(Config.fcmTokens).child(tokensForUidB[2]).set(uidB);

    const re = await MessagingService.sendMessageToUids({
      title: "title - (sendMessageToUids) - " + new Date().toISOString(),
      body: "body",
      uids: [uidA, uidB, "RdKOm7K30ggcaH5YzG8AomfRMTe2"],
    });

    expect(re).to.be.an("array");

    expect(re.length).equal(4);
  });
});
