import {
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from "@firebase/rules-unit-testing"
import { doc, getDoc, setDoc, serverTimestamp, setLogLevel } from 'firebase/firestore';
import { readFileSync, createWriteStream } from "node:fs";
import { before } from "mocha";


/****** SETUP ********/
const PROJECT_ID = 'withcenter-test-5'; // 실제 프로젝트 ID로 지정해야 한다.
const host = '127.0.0.1'; // localhost 로 하면 안된다.
const port = 8080; // 터미날에 표시되는 포트로 적절히 지정해야 한다.
let testEnv: RulesTestEnvironment;


describe('Firestore rules', async () => {

  before(async () => {
    // Silence expected rules rejections from Firestore SDK. Unexpected rejections
    // will still bubble up and will be thrown as an error (failing the tests).
    setLogLevel('error');

    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        host: '127.0.0.1',
        port: 8080,
        rules: readFileSync('firestore.rules', 'utf8')
      },
    });

  });

  it('should allow a user to write their own data', async () => {
    const context = testEnv.authenticatedContext("alice", { email: "alice@email.com", });
    await assertSucceeds(setDoc(doc(context.firestore(), '/users/alice'), { name: 'Alice' }));
  });
});
