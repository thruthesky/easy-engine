/**
 * Unit Test Only
 */
import { expect } from "chai";
import "mocha";
import { initializeFirebaseOnce } from "../initialize-firebase-once";
import { MessagingService } from "../../src/messaging/messaging.service"
import { Payload } from "../../src/messaging/messaging.interfaces";
import { getDatabase } from "firebase-admin/database";
import { Config } from "../../src/config";


initializeFirebaseOnce();

describe("Send messages to Tokens", () => {
    it("sendMessageToTokens - failure test", async () => {
        const re = await MessagingService.sendMessageToTokens([{
            notification: {
                title: "title",
                body: "body"
            },
            token: "token-a"
        }] as Payload[]);
        expect(re).to.be.an('array');
        expect(re[0]).equal('token-a');
    });
    it("sendMessageToTokens - 1 success and 2 failure test", async () => {
        const re = await MessagingService.sendMessageToTokens([
            {
                notification: {
                    title: "title",
                    body: "body"
                },
                token: "token-a"
            },
            {
                notification: {
                    title: "title",
                    body: "body"
                },
                token: "token-b"
            },
            {
                notification: {
                    title: "title from test - " + new Date().toISOString(),
                    body: "body test"
                },
                token: "ea9BfwxMEkN3v_epKD989P:APA91bGo80j_E6Ta1o7f_koYoGxWg0VPzfWZ8QasfqVZ6K8ouSveFicIvXgy_TPK3QPYO7QVZSOPBtD3Nha5hEjv8NmWVj4LbDHBRulgx-6sIaV_04uRKtZNipnPPGqgvRnh8r8tFi8A"
            },
        ] as Payload[]);
        expect(re).to.be.an('array');
        expect(re.length).equal(2);
        expect(re[0]).equal('token-a');
        expect(re[1]).equal('token-b');
    });

    it("sendMessage - 2 success test, 3 failure test", async () => {
        const re = await MessagingService.sendMessage({
            title: "title - (2) - " + new Date().toISOString(),
            body: "body",
            tokens: [
                "token-a",
                "token-b",
                "ea9BfwxMEkN3v_epKD989P:APA91bGo80j_E6Ta1o7f_koYoGxWg0VPzfWZ8QasfqVZ6K8ouSveFicIvXgy_TPK3QPYO7QVZSOPBtD3Nha5hEjv8NmWVj4LbDHBRulgx-6sIaV_04uRKtZNipnPPGqgvRnh8r8tFi8A",
                "dG1WavwFs0L2vO5gM7LQP0:APA91bGXEEmgh-euobqJceIOIGQM9K3kApODnPeyaz4GXjW0ezy60xmo-fsSv3QoTV4fLKVYVcbqfzN0Zs8oBdLgcIdaL2_0zVgo0G1N4mQxf_txyESvq5onRgpTLJ2-5iz6LtrcGSAt",
                "token-c",
            ],
        });

        expect(re).to.be.an('array');
        console.log(re);
        expect(re.length).equal(3);
        expect(re[0]).equal('token-a');
        expect(re[1]).equal('token-b');
        expect(re[2]).equal('token-c');
    });

});

