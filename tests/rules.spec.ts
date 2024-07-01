import {
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from "@firebase/rules-unit-testing";
import firebase from 'firebase/compat/app';
import { doc, getDoc, setDoc, serverTimestamp, setLogLevel, Firestore } from 'firebase/firestore';
import { readFileSync, createWriteStream } from "node:fs";
import { before } from "mocha";


/****** SETUP ********/
const PROJECT_ID = 'withcenter-test-5'; // 실제 프로젝트 ID로 지정해야 한다.
const host = '127.0.0.1'; // localhost 로 하면 안된다.
const port = 8080; // 터미날에 표시되는 포트로 적절히 지정해야 한다.
let testEnv: RulesTestEnvironment;

// 로그인 하지 않은, unauthenticated context 를 글로벌에 저장해서, 타이핑을 줄이고 간소화 한다.
let unauthedDb: firebase.firestore.Firestore;

// 각 사용자별 로그인 context 를 저장한다.
let appleDb: firebase.firestore.Firestore;
let bananaDb: firebase.firestore.Firestore;
let cherryDb: firebase.firestore.Firestore;
let durianDb: firebase.firestore.Firestore;



describe('Firestore rules', async () => {


  before(async () => {
    // Silence expected rules rejections from Firestore SDK. Unexpected rejections
    // will still bubble up and will be thrown as an error (failing the tests).
    setLogLevel('error');

    /// 테스트가 처음 실행 될 때, 파이어베이스 접속 초기화.
    testEnv = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        host: '127.0.0.1',
        port: 8080,
        rules: readFileSync('firestore.rules', 'utf8')
      },
    });


  });

  // 각 테스트를 하기 전에, 로컬 Firestore 의 데이터를 모두 지운다.
  beforeEach(async () => {
    await testEnv.clearFirestore();



    // 셋업: Security Rules 를 적용하지 않고, 테스트 데이터를 미리 좀 저장해 놓는다.
    // withSecurityRulesDisabled 는 한번에 하나의 쿼리만 실행해야 한다. 그렇지 않으면,
    // Firestore has already been started and its settings can no longer be change 에러가 발생한다.
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/apple'), { name: 'apple', no: 1 });
    });

    // 각 사용자 정보를 미리 저장해 둔다.
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/apple/user_meta/private'), { email: 'apple@email.com', phoneNumber: '000-1111-1111' });
    });
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/banana'), { name: 'banana', no: 2 });
    });
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/banana/user_meta/private'), { email: 'banana@email.com', phoneNumber: '000-2222-2222' });
    });
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/cherry'), { name: 'cherry', no: 3 });
    });
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/cherry/user_meta/private'), { email: 'cherry@email.com', phoneNumber: '000-3333-3333' });
    });
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/durian'), { name: 'cherry', no: 4 });
    });
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users/durian/user_meta/private'), { email: 'durian@email.com', phoneNumber: '000-4444-4444' });
    });


    // 주의: 캐시 문제를 피하기 위해서, 각 테스트마다 새로운 unauthenticated context 로 DB 를 생성해야 한다.
    unauthedDb = testEnv.unauthenticatedContext().firestore();

    // 사용자별 DB 액세스 context 저장. 캐시 문제로 각 테스트 전에 새로 생성해야 한다.
    appleDb = testEnv.authenticatedContext('apple').firestore();
    bananaDb = testEnv.authenticatedContext('banana').firestore();
    cherryDb = testEnv.authenticatedContext('cherry').firestore();
    durianDb = testEnv.authenticatedContext('durian').firestore();

  });

  it('공개 프로필 읽기 테스트 - 성공 - 로그인 하지 않고 참조', async () => {
    await assertSucceeds(getDoc(doc(unauthedDb, '/users/apple')));
  });
  it('비공개 프로필 읽기 테스트 - 성공', async () => {
    await assertSucceeds(getDoc(doc(appleDb, '/users/apple/user_meta/private')));
  });
  it('비공개 프로필 읽기 테스트 - 실패 - 다른 사용자 비공개 정보 읽기', async () => {
    await assertFails(getDoc(doc(appleDb, '/users/banana/user_meta/private')));
  });

  it("공개 정보 생성 - alice", async () => {
    const context = testEnv.authenticatedContext("alice", { email: "alice@email.com", });
    await assertSucceeds(setDoc(doc(context.firestore(), '/users/alice'), { name: 'Alice' }));
  });
});
