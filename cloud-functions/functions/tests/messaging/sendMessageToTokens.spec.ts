/**
 * Unit Test Only
 */
import { expect } from "chai";
import "mocha";
import { initializeFirebaseOnce } from "../initialize-firebase-once";
import { MessagingService } from "../../src/messaging/messaging.service";
import { MessagingConfig } from "../messaging.config";
import { Payload } from "../../src/messaging/messaging.interfaces";
import { getDatabase } from "firebase-admin/database";
import { Config } from "../../src/config";

initializeFirebaseOnce();

describe("Send messages to Tokens", () => {
  it("Check input Tokens empty string", async () => {
    try {
      const re = await MessagingService.sendMessage({
        tokens: [],
        title: "",
        body: "",
      });
      expect.fail("must fail, tokens is empty " + re);
    } catch (e: any) {
      expect(e.message).equal("tokens-must-not-be-empty");
    }
  });
  it("Check input tokens empty array", async () => {
    try {
      const re = await MessagingService.sendMessage({
        tokens: [],
        title: "",
        body: "",
      });
      expect.fail("must fail, tokens is empty array " + re);
    } catch (e: any) {
      expect(e.message).equal("tokens-must-not-be-empty");
    }
  });

  it("Check input uid exsit but title", async () => {
    try {
      const re = await MessagingService.sendMessage({
        tokens: ["token-ABC123-tokens"],
        title: "",
        body: "",
      });
      expect.fail("must fail, has tokens but title is empty " + re);
    } catch (e: any) {
      expect(e.message).equal("title-must-not-be-empty");
    }
  });

  it("Check input body", async () => {
    try {
      const re = await MessagingService.sendMessage({
        tokens: ["token-ABC123-tokens"],
        title: "title - (sendMessage) - " + new Date().toISOString(),
        body: "",
      });
      expect.fail("must fail, body is empty " + re);
    } catch (e: any) {
      expect(e.message).equal("body-must-not-be-empty");
    }
  });

  it("Success with 1 tokens error", async () => {
    const re = await MessagingService.sendMessage({
      tokens: ["token-ABC123-tokens"],
      title: "title - token-ABC123-tokens - " + new Date().toISOString(),
      body: "body (sendMessage)",
    });
    expect(re).to.be.an("array");
    expect(re.length).equal(1);
  });

  it("Success with array tokens, 1 tokens error 1 success", async () => {
    const re = await MessagingService.sendMessage({
      tokens: ["token-ABC123-tokens", MessagingConfig.validToken],
      title: "title - token-ABC123-tokens - " + new Date().toISOString(),
      body: "body (sendMessage)",
    });
    expect(re).to.be.an("array");
    expect(re.length).equal(1);
  });

  it("Success with string tokens, 1 tokens error 1 success", async () => {
    const re = await MessagingService.sendMessage({
      tokens: ["token-ABC123-tokens", MessagingConfig.validToken],
      title: "title - token-ABC123-tokens - " + new Date().toISOString(),
      body: "body (sendMessage)",
    });
    expect(re).to.be.an("array");
    expect(re.length).equal(1);
  });

  it("Check input success with 1 tokens", async () => {
    const db = getDatabase();
    db.ref(Config.fcmTokens).child("token-DEF123-uids").set("uids-DEF123-uids");
    const re = await MessagingService.sendMessageToUids({
      uids: ["uids-DEF123-uids"],
      title: "title -uids-DEF123-uids - " + new Date().toISOString(),
      body: "body (sendMessageToUids)",
    });
    expect(re).to.be.an("array");
    expect(re.length).equal(1);
  });

  it("sendMessageToTokens - failure test", async () => {
    const re = await MessagingService.sendMessageToTokens([
      {
        notification: {
          title: "title",
          body: "body",
        },
        token: "token-a",
      },
    ] as Payload[]);
    expect(re).to.be.an("array");
    expect(re[0]).equal("token-a");
  });
  it("sendMessageToTokens - 1 success and 2 failure test", async () => {
    const re = await MessagingService.sendMessageToTokens([
      {
        notification: {
          title: "title",
          body: "body",
        },
        token: "token-a",
      },
      {
        notification: {
          title: "title",
          body: "body",
        },
        token: "token-b",
      },
      {
        notification: {
          title: "title from test - " + new Date().toISOString(),
          body: "body test",
        },
        token: MessagingConfig.validToken,
      },
    ] as Payload[]);
    expect(re).to.be.an("array");
    expect(re.length).equal(2);
    expect(re[0]).equal("token-a");
    expect(re[1]).equal("token-b");
  });

  it("sendMessage - 2 success test, 3 failure test", async () => {
    const re = await MessagingService.sendMessage({
      title: "title - (2) - " + new Date().toISOString(),
      body: "body",
      tokens: ["token-a", "token-b", MessagingConfig.validToken, "token-c"],
    });

    expect(re).to.be.an("array");
    expect(re.length).equal(3);
    expect(re[0]).equal("token-a");
    expect(re[1]).equal("token-b");
    expect(re[2]).equal("token-c");
  });
});
