import {
    RulesTestEnvironment,
    assertFails,
    assertSucceeds,
    initializeTestEnvironment,
} from "@firebase/rules-unit-testing";
import firebase from "firebase/compat/app";
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    setLogLevel,
    arrayUnion,
    arrayRemove,
} from "firebase/firestore";
import { readFileSync } from "node:fs";
import { before, test } from "mocha";
import { taskRef, Task, randomTaskId } from "./task/task";
import { randomTaskGroupId, TaskGroup, taskGroupRef } from "./task/task-group";
import { randomAssignId, TaskAssign, taskAssignRef } from "./task/task-assign";

/****** SETUP ********/
const PROJECT_ID = "withcenter-test-3"; // Set your firebase project ID here
const host = "127.0.0.1"; // Don't user "localhost" unless you have a reasion.
const port = 8080; // 터미날에 표시되는 포트로 적절히 지정해야 한다.
/****** UNTIL HERE */

let testEnv: RulesTestEnvironment;

// 로그인 하지 않은, unauthenticated context 를 글로벌에 저장해서, 타이핑을 줄이고 간소화 한다.
let unauthedDb: firebase.firestore.Firestore;

// 각 사용자별 로그인 context 를 저장해 놓고 편하게 사용한다.
let appleDb: firebase.firestore.Firestore;
let bananaDb: firebase.firestore.Firestore;
let cherryDb: firebase.firestore.Firestore;
let durianDb: firebase.firestore.Firestore;

describe("Task and Task Group Test", async () => {
    // 모든 테스트를 시작하기 전에 실행되는 콜백 함수.
    // 여기에 initializeTestEnvironment() 를 호출해서, Firestore 접속을 초기화 하면 된다.
    // watch 코드가 수정될 경우, 전체 테스트를 다시 실행하면, 이 함수도 다시 호출 된다.
    before(async () => {
        setLogLevel("error"); // 로그 레벨을 설정한다.
        /// 모든 테스트를 실행하기 전에, 파이어베이스 접속 초기화.
        testEnv = await initializeTestEnvironment({
            projectId: PROJECT_ID,
            firestore: {
                host,
                port,
                // Firestore Security Rules 파일을 읽어서, 테스트 환경에 적용한다.
                // 즉, Security Rules 파일을 수정하고, 테스트를 다시 실행하면, 수정된 Rules 이 적용되므로,
                // mocha watch 를 하는 경우, 소스 코드를 수정 필요 없이 저장만 한번 해 주면 된다.
                rules: readFileSync("firestore.rules", "utf8"),
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
            await setDoc(doc(context.firestore(), "users/apple"), {
                name: "apple",
                no: 1,
            });
        });

        // 주의: 캐시 문제를 피하기 위해서, 각 테스트마다 새로운 unauthenticated context 로 DB 를 생성해야 한다.
        unauthedDb = testEnv.unauthenticatedContext().firestore();

        // 사용자별 DB 액세스 context 저장. 캐시 문제로 각 테스트 전에 새로 생성해야 한다.
        appleDb = testEnv.authenticatedContext("apple").firestore();
        bananaDb = testEnv.authenticatedContext("banana").firestore();
        cherryDb = testEnv.authenticatedContext("cherry").firestore();
        durianDb = testEnv.authenticatedContext("durian").firestore();
    });
    it("[Fail] User signed in anonymously and tried to read a task doc", async () => {
        await assertFails(getDoc(doc(unauthedDb, "/task/task1")));
    });
    it("[Fail] User signed in to read a task but wrong spelling of path (tasks instead of task)", async () => {
        await assertFails(getDoc(doc(appleDb, "/tasks/task1")));
    });
    it("[Pass] User signed in to read a task", async () => {
        await assertSucceeds(getDoc(doc(appleDb, "/task/task1")));
    });
    it("[Fail] User not signed in and tried to create a task", async () => {
        const taskCreateUnAuth: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            status: "open"
        };
        await assertFails(
            setDoc(doc(unauthedDb, taskRef()), taskCreateUnAuth)
        );
    });
    it("[Pass] User signed in to create a task", async () => {
        const taskCreateApple: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "apple",
            status: "open"
        };
        await assertSucceeds(
            setDoc(doc(appleDb, taskRef()), taskCreateApple)
        );
    });
    it("[Fail] Unauth user tried to make a task but in task, there is a creator", async () => {
        const taskCreateUnauthWithCreatedBy: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "apple",
            status: "open"
        };
        await assertFails(
            setDoc(doc(unauthedDb, taskRef()), taskCreateUnauthWithCreatedBy)
        );
    });
    it("[Fail] User used a different uid as the creator of the task upon creating it", async () => {
        const taskCreateAuthWithDifferentUid: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "IAmNotApple",
            status: "open"
        };
        await assertFails(
            setDoc(doc(appleDb, taskRef()), taskCreateAuthWithDifferentUid)
        );
    });
    it("[Pass] User created task and used his/her uid as the creator of the task", async () => {
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open"
        };
        await assertSucceeds(
            setDoc(doc(bananaDb, taskRef()), taskCreateBanana)
        );
    });
    it("[Fail] User created a task group without a moderator, without creator.", async () => {
        const taskGroupCreateNoModeratorNoCreator: TaskGroup = {
            name: "Task Group 1",
        };
        await assertFails(
            setDoc(doc(appleDb, taskGroupRef()), taskGroupCreateNoModeratorNoCreator)
        );
    });


    it("[Fail] Unauth user tried create a group with moderator, with creator (not his id)", async () => {
        const taskGroupCreateUnauthed: TaskGroup = {
            name: "Task Group 2",
            moderatorUsers: ["unauthed"],
            creator: "apple"
        };
        await assertFails(
            setDoc(doc(unauthedDb, taskGroupRef()), taskGroupCreateUnauthed)
        );
    });


    it("[Fail] User tried to create group with moderator, but without creator", async () => {
        const taskGroupCreateWithHerAsModerator: TaskGroup = {
            name: "Task Group 3",
            moderatorUsers: ["apple"],
        };
        await assertFails(
            setDoc(doc(appleDb, taskGroupRef()), taskGroupCreateWithHerAsModerator)
        );

    });
    it("[Pass] User create a group without moderator, but with he/she as creator", async () => {
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await assertSucceeds(
            setDoc(doc(appleDb, taskGroupRef()), taskGroupCreateWithCorrectCreator)
        );
    });
    it("[Fail] User create a group without moderator, but with creator uid not his/her uid", async () => {
        const taskGroupCreateWithWrongCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "banana",
        };
        await assertFails(
            setDoc(doc(appleDb, taskGroupRef()), taskGroupCreateWithWrongCreator)
        );
    });
    it("[Pass] User create a group with he/she as creator and moderator", async () => {
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["apple"],
        };
        await assertSucceeds(
            setDoc(doc(appleDb, taskGroupRef()), taskGroupCreateWithCorrectCreator)
        );
    });
    it("[Pass] User created a task without assignment yet, not in a group", async () => {
        const taskCreateNoGroupNoAssign: Task = {
            title: "Task to work",
            status: "open",
            creator: "apple",
        };
        await assertSucceeds(
            setDoc(doc(appleDb, taskRef()), taskCreateNoGroupNoAssign)
        );
    });
    it("[Pass] Member created a task without assignment yet, in a group", async () => {
        // Cherry created a group
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreate: TaskGroup = {
            users: ["apple"],
            moderatorUsers: ["durian"],
            creator: "cherry"
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreate)
        );
        const taskCreateInGroupNoAssign: Task = {
            title: "Task to work",
            status: "open",
            creator: "apple",
            taskGroupId: taskGroupId,
        };
        await assertSucceeds(
            setDoc(doc(appleDb, taskRef()), taskCreateInGroupNoAssign)
        );
    });
    it("[Pass] Moderator created a task without assignment yet, in a group", async () => {
        // Cherry created a group
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreate: TaskGroup = {
            users: ["apple"],
            moderatorUsers: ["durian"],
            creator: "cherry"
        };

        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreate)
        );
        const taskCreateInGroupNoAssign: Task = {
            title: "Task to work",
            status: "open",
            creator: "durian",
            taskGroupId: taskGroupId,
        };
        await assertSucceeds(
            setDoc(doc(durianDb, taskRef()), taskCreateInGroupNoAssign)
        );
    });
    it("[Pass] Creator created a task without assignment yet, in a group", async () => {
        // Cherry created a group
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreate: TaskGroup = {
            users: ["apple"],
            moderatorUsers: ["durian"],
            creator: "cherry"
        };

        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreate)
        );
        const taskCreateInGroupNoAssign: Task = {
            title: "Task to work",
            status: "open",
            creator: "cherry",
            taskGroupId: taskGroupId,
        };
        await assertSucceeds(
            setDoc(doc(cherryDb, taskRef()), taskCreateInGroupNoAssign)
        );
    });
    it("[Fail] Outsider created a task without assignment yet, in a group", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreate: TaskGroup = {
            users: ["apple"],
            moderatorUsers: ["durian"],
            creator: "cherry"
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreate)
        );
        const taskCreateInGroupNoAssign: Task = {
            title: "Task to work",
            status: "open",
            creator: "banana",
            taskGroupId: taskGroupId,
        };
        await assertFails(
            setDoc(doc(bananaDb, taskRef()), taskCreateInGroupNoAssign)
        );
    });
    it("[Fail] User tried to create a task in a non-existing group", async () => {
        const taskCreateWithGroup: Task = {
            title: "Task to work with Group",
            taskGroupId: "nonExistingGroup",
            status: "open",
        };
        await assertFails(
            setDoc(doc(appleDb, taskRef()), taskCreateWithGroup)
        );
    });
    it("[Fail] User created a task assigned for herself but no creator", async () => {
        const taskCreateWithAssign: Task = {
            title: "Task to work with Assign",
            assignedUsers: ["apple"],
            status: "open",
        };
        await assertFails(
            setDoc(doc(appleDb, taskRef()), taskCreateWithAssign)
        );
    });
    it("[Pass] User created a task assigned for herself with herself as creator", async () => {
        const taskCreateWithAssign: Task = {
            title: "Task to work with Assign",
            assignedUsers: ["apple"],
            status: "open",
            creator: "apple",
        };
        await assertSucceeds(
            setDoc(doc(appleDb, taskRef()), taskCreateWithAssign)
        );
    });
    it("[Fail] User created a task assigned for herself under a non-exisiting group", async () => {
        const taskCreateWithGroupAndAssign: Task = {
            title: "Task to work with Group and Assign",
            taskGroupId: "nonExistingGroup",
            assignedUsers: ["apple"],
            status: "open",
        };
        await assertFails(
            setDoc(doc(appleDb, taskRef()), taskCreateWithGroupAndAssign)
        );
    });
    it("[Fail] Unauth user created a task assigned for herself under a non-exisiting group", async () => {
        const taskCreateWithGroupAndAssignByUnauthed: Task = {
            title: "Task to work with Group and Assign by Unauthed",
            taskGroupId: "nonExistingGroup",
            assignedUsers: ["unauthed"],
            status: "open",
        };
        await assertFails(
            setDoc(doc(unauthedDb, taskRef()), taskCreateWithGroupAndAssignByUnauthed)
        );
    });
    it("[Fail] Unauth user tried to create a task in a group", async () => {
        const taskCreateWithGroupByUnauthed: Task = {
            title: "Task to work with Group by Unauthed",
            taskGroupId: "group1",
            assignedUsers: ["unauthed"],
            status: "open",
        };
        await assertFails(
            setDoc(doc(unauthedDb, taskRef()), taskCreateWithGroupByUnauthed)
        );
    });


    it("[Fail] Unauth user tried to update the name of the task group [Creator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupUpdatedByUnauth: TaskGroup = {
            name: "Better Task Group",
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskGroupRef(taskGroupId)), taskGroupUpdatedByUnauth)
        );

    });


    it("[Fail] Unauth user tried to update the creator of the task group [Creator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupChangeCreatorByUnauth: TaskGroup = {
            creator: "banana",
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskGroupRef(taskGroupId)), taskGroupChangeCreatorByUnauth)
        );
    });
    it("[Fail] Unauth user tried to add a moderator in a group [Creator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupAddingBananaInModeratorByUnauthed: TaskGroup = {
            moderatorUsers: arrayUnion("banana"),
        };
        await assertFails(
            updateDoc(doc(unauthedDb, taskGroupRef(taskGroupId)), taskGroupAddingBananaInModeratorByUnauthed)
        );
    });


    it("[Fail] User who is not the creator of the group tried to update the name of the group. [Creator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupUpdatedByBanana: TaskGroup = {
            name: "Better than ever Task Group by Banana",
        }
        await assertFails(
            updateDoc(doc(bananaDb, taskGroupRef(taskGroupId)), taskGroupUpdatedByBanana)
        );
    });
    it("[Fail] User who is not the creator of the group tried to update the creator of the group. [Creator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupChangeCreatorByBanana: TaskGroup = {
            creator: "banana",
        }
        await assertFails(
            updateDoc(doc(bananaDb, taskGroupRef(taskGroupId)), taskGroupChangeCreatorByBanana)
        );
    });
    it("[Fail] User who is not the creator of the group tried to add a moderator in the group. [Creator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupAddingHimsefInModeratorByBanana: TaskGroup = {
            moderatorUsers: arrayUnion("banana"),
        };
        await assertFails(
            updateDoc(doc(bananaDb, taskGroupRef(taskGroupId)), taskGroupAddingHimsefInModeratorByBanana)
        );
    });
    it("[Pass] User updated the name of the group where the user is the creator. [Creator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupUpdatedByApple: TaskGroup = {
            name: "Apple's Task Group",
        }
        await assertSucceeds(
            updateDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupUpdatedByApple)
        );
    });
    it("[Fail] User updated the creator of the group where the user is the creator. [Creator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupCreatorChangeByApple: TaskGroup = {
            creator: "banana",
        }
        await assertFails(
            updateDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreatorChangeByApple)
        );
    });
    it("[Pass] Group creator added a moderator in the group. [Creator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupAddingModeratorByApple: TaskGroup = {
            moderatorUsers: arrayUnion("cherry"),
        }
        await assertSucceeds(
            updateDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupAddingModeratorByApple)
        );
    });

    it("[Fail] Unauth user tried to update the name of the group. [Moderator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupUpdatedByUnauth: TaskGroup = {
            name: "Better Task Group",
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskGroupRef(taskGroupId)), taskGroupUpdatedByUnauth)
        );
    });
    it("[Fail] Unauth user tried to update the creator of the group. [Moderator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupChangeCreatorByUnauth: TaskGroup = {
            creator: "banana",
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskGroupRef(taskGroupId)), taskGroupChangeCreatorByUnauth)
        );
    });
    it("[Fail] Unauth user tried to add a moderator in a group. [Moderator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupAddingBananaInModeratorByUnauthed: TaskGroup = {
            moderatorUsers: arrayUnion("banana"),
        };
        await assertFails(
            updateDoc(doc(unauthedDb, taskGroupRef(taskGroupId)), taskGroupAddingBananaInModeratorByUnauthed)
        );
    });
    it("[Fail] User who is not the creator or moderator tried to update the name of the group. [Moderator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupUpdatedByBanana: TaskGroup = {
            name: "Better than ever Task Group by Banana",
        }
        await assertFails(
            updateDoc(doc(bananaDb, taskGroupRef(taskGroupId)), taskGroupUpdatedByBanana)
        );
    });

    it("[Fail] User who is not the creator or moderator tried to update the creator of the group. [Moderator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupChangeCreatorByBanana: TaskGroup = {
            creator: "banana",
        }
        await assertFails(
            updateDoc(doc(bananaDb, taskGroupRef(taskGroupId)), taskGroupChangeCreatorByBanana)
        );
    });
    it("[Fail] User who is not the creator or moderator tried to add a moderator in the group. [Moderator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupAddingInModeratorByBanana: TaskGroup = {
            moderatorUsers: arrayUnion("durian"),
        };
        await assertFails(
            updateDoc(doc(bananaDb, taskGroupRef(taskGroupId)), taskGroupAddingInModeratorByBanana)
        );
    });
    it("[Fail] User who is not the creator or moderator tried to update the name of the group. [Moderator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupAddingHimsefInModeratorByBanana: TaskGroup = {
            moderatorUsers: arrayUnion("banana"),
        };
        await assertFails(
            updateDoc(doc(bananaDb, taskGroupRef(taskGroupId)), taskGroupAddingHimsefInModeratorByBanana)
        );
    });
    it("[Pass] User updated the name of the group where he/she a moderator but not the creator. [Moderator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupUpdatedByCherry: TaskGroup = {
            name: "Apple's Task Group by Cherry",
        }
        await assertSucceeds(
            updateDoc(doc(cherryDb, taskGroupRef(taskGroupId)), taskGroupUpdatedByCherry)
        );
    });
    it("[Fail] Moderator tried to update the creator of the group. [Moderator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupCreatorChangeByCherry: TaskGroup = {
            creator: "banana",
        }
        await assertFails(
            updateDoc(doc(cherryDb, taskGroupRef(taskGroupId)), taskGroupCreatorChangeByCherry)
        );
    });
    it("[Pass] Group moderator added another moderator in the group. [Moderator Test]", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupAddingModeratorByCherry: TaskGroup = {
            moderatorUsers: arrayUnion("durian"),
        }
        await assertSucceeds(
            updateDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupAddingModeratorByCherry)
        );
    });


    it("[Fail] Unauth user tried to invite users to the group", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );
        const taskGroupInviteByUnauthed: TaskGroup = {
            invitedUsers: arrayUnion("eggplant"),
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskGroupRef(taskGroupId)), taskGroupInviteByUnauthed)
        );
    });
    it("[Fail] User who is not the member, creator, or moderator tried to invite users to the group", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );
        const taskGroupInviteBySomeoneNotInGroup: TaskGroup = {
            invitedUsers: arrayUnion("eggplant"),
        }
        await assertFails(
            updateDoc(doc(durianDb, taskGroupRef(taskGroupId)), taskGroupInviteBySomeoneNotInGroup)
        );
    });


    it("[Fail] Member invited user to the group but not the creator or moderator", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );
        const taskGroupInviteBySomeoneInGroupButNotModerator: TaskGroup = {
            invitedUsers: arrayUnion("eggplant"),
        }
        await assertFails(
            updateDoc(doc(cherryDb, taskGroupRef(taskGroupId)), taskGroupInviteBySomeoneInGroupButNotModerator)
        );
    });
    it("[Pass] Moderator invited user to the group but not the creator", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );
        const taskGroupInviteByModerator: TaskGroup = {
            invitedUsers: arrayUnion("eggplant"),
        }
        await assertSucceeds(
            updateDoc(doc(bananaDb, taskGroupRef(taskGroupId)), taskGroupInviteByModerator)
        );
    });
    it("[Pass] creator invited user to the group", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };

        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );
        const taskGroupInviteByCreator: TaskGroup = {
            invitedUsers: arrayUnion("flower"),
        }
        await assertSucceeds(
            updateDoc(doc(appleDb, taskGroupRef(taskGroupId)), taskGroupInviteByCreator)
        );
    });

    it("[Fail] Unauth user tried to create a task in a group", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );
        const unauthCreatedTask: Task = {
            title: "Dance the tiktok Challenge",
            taskGroupId: taskGroupId,
            status: "open",
            creator: "unauthed",
        }
        await assertFails(
            setDoc(doc(unauthedDb, taskRef()), unauthCreatedTask)
        );
    });
    it("[Fail] User who is not a member, creator, or moderator tried to create a task in a group", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );
        const notMemberCreatedTask: Task = {
            title: "Gotta Move like Jagger",
            taskGroupId: taskGroupId,
            status: "open",
            creator: "durian",
        }
        await assertFails(
            setDoc(doc(durianDb, taskRef()), notMemberCreatedTask)
        );
    });


    it("[Pass] Creator created a task in a group", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );
        const creatorCreatedTask: Task = {
            title: "Live like we're Young",
            taskGroupId: taskGroupId,
            status: "open",
            creator: "apple",
        }
        await assertSucceeds(
            setDoc(doc(appleDb, taskRef()), creatorCreatedTask)
        );
    });

    it("[Pass] Moderator created a task in a group", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );

        const moderatorCreatedTask: Task = {
            title: "Drink while Living",
            taskGroupId: taskGroupId,
            status: "open",
            creator: "banana",
        }
        await assertSucceeds(
            setDoc(doc(bananaDb, taskRef()), moderatorCreatedTask)
        );
    });

    it("[Pass] Member created a task in a group", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );

        const memberCreatedTask: Task = {
            title: "Crazy till we see the sun",
            taskGroupId: taskGroupId,
            status: "open",
            creator: "cherry",
        }
        await assertSucceeds(
            setDoc(doc(cherryDb, taskRef()), memberCreatedTask)
        );
    });



    it("[Fail] Unauth user tried to create a task in a group for multiple users who are not all in the group", async () => {
        const multipleUsers = [
            "cherry",
            "banana",
            "eggplant",
            "flower",
        ];
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );

        const unauthCreatedTask: Task = {
            title: "Dance the tiktok Challenge",
            taskGroupId: taskGroupId,
            status: "open",
            assignedUsers: multipleUsers,
            creator: "unauthed",
        }
        await assertFails(
            setDoc(doc(unauthedDb, taskRef()), unauthCreatedTask)
        );
    });
    it("[Fail] Nonmember user tried to create a task in a group for users who are not all in the group", async () => {
        const multipleUsers = [
            "cherry",
            "banana",
            "eggplant",
            "flower",
        ];
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );

        const notMemberCreatedTask: Task = {
            title: "Gotta Move like Jagger",
            taskGroupId: taskGroupId,
            status: "open",
            assignedUsers: multipleUsers,
            creator: "durian",
        }
        await assertFails(
            setDoc(doc(durianDb, taskRef()), notMemberCreatedTask)
        );
    });
    it("[Fail] Creator created a task in a group for multiple users who are not all in the group", async () => {
        const multipleUsers = [
            "cherry",
            "banana",
            "eggplant",
            "flower",
        ];
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );

        const creatorCreatedTask: Task = {
            title: "Live like we're Young",
            taskGroupId: taskGroupId,
            status: "open",
            assignedUsers: multipleUsers,
            creator: "apple",
        }
        await assertFails(
            setDoc(doc(appleDb, taskRef()), creatorCreatedTask)
        );
    });
    it("[Fail] Moderator created a task in a group for multiple users who are not all in the group", async () => {
        const multipleUsers = [
            "cherry",
            "banana",
            "eggplant",
            "flower",
        ];
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );

        const moderatorCreatedTask: Task = {
            title: "Drink while Living",
            taskGroupId: taskGroupId,
            status: "open",
            assignedUsers: multipleUsers,
            creator: "banana",
        }
        await assertFails(
            setDoc(doc(bananaDb, taskRef()), moderatorCreatedTask)
        );
    });
    it("[Fail] Member created a task in a group for multiple users who are not all in the group", async () => {
        const multipleUsers = [
            "cherry",
            "banana",
            "eggplant",
            "flower",
        ];
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );

        const memberCreatedTask: Task = {
            title: "Crazy till we see the sun",
            taskGroupId: taskGroupId,
            status: "open",
            assignedUsers: multipleUsers,
            creator: "cherry",
        }
        await assertFails(
            setDoc(doc(cherryDb, taskRef()), memberCreatedTask)
        );
    });
    it("[Pass] Creator created a task in a group for multiple users who are in the group", async () => {
        const multipleUsers = [
            "cherry",
            "banana",
            "eggplant",
            "flower",
        ];
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: [
                "cherry",
                "banana",
                "eggplant",
                "flower",
                "guava"
            ],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );

        const creatorCreatedTask: Task = {
            title: "Live like we're Young",
            taskGroupId: taskGroupId,
            status: "open",
            assignedUsers: multipleUsers,
            creator: "apple",
        }
        await assertSucceeds(
            setDoc(doc(appleDb, taskRef()), creatorCreatedTask)
        );
    });
    it("[Pass] Moderator created a task in a group for multiple users who are in the group", async () => {
        const multipleUsers = [
            "cherry",
            "banana",
            "eggplant",
            "flower",
        ];
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: [
                "cherry",
                "banana",
                "eggplant",
                "flower",
                "guava"
            ],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );

        const moderatorCreatedTask: Task = {
            title: "Drink while Living",
            taskGroupId: taskGroupId,
            status: "open",
            assignedUsers: multipleUsers,
            creator: "banana",
        }
        await assertSucceeds(
            setDoc(doc(bananaDb, taskRef()), moderatorCreatedTask)
        );
    });
    it("[Pass] Member created a task in a group for multiple users who are in the group", async () => {
        const multipleUsers = [
            "cherry",
            "banana",
            "eggplant",
            "flower",
        ];
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: [
                "cherry",
                "banana",
                "eggplant",
                "flower",
                "guava"
            ],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );
        const memberCreatedTask: Task = {
            title: "Crazy till we see the sun",
            taskGroupId: taskGroupId,
            status: "open",
            assignedUsers: multipleUsers,
            creator: "cherry",
        }
        await assertSucceeds(
            setDoc(doc(cherryDb, taskRef()), memberCreatedTask)
        );
    });
});

describe("Task Assign Test", async () => {
    before(async () => {
        setLogLevel("error");
        testEnv = await initializeTestEnvironment({
            projectId: PROJECT_ID,
            firestore: {
                host,
                port,
                rules: readFileSync("firestore.rules", "utf8"),
            },
        });
    });

    beforeEach(async () => {
        await testEnv.clearFirestore();
        unauthedDb = testEnv.unauthenticatedContext().firestore();
        appleDb = testEnv.authenticatedContext("apple").firestore();
        bananaDb = testEnv.authenticatedContext("banana").firestore();
        cherryDb = testEnv.authenticatedContext("cherry").firestore();
        durianDb = testEnv.authenticatedContext("durian").firestore();
    });

    it("[Pass] Member created a task in a group for multiple members who are in the group", async () => {
        const multipleUsers = [
            "cherry",
            "banana",
            "eggplant",
            "flower",
        ];
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: [
                "cherry",
                "banana",
                "eggplant",
                "flower",
                "guava"
            ],
            moderatorUsers: ["banana"],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateWithCorrectCreator)
        );

        const memberCreatedTask: Task = {
            title: "Crazy till we see the sun",
            taskGroupId: taskGroupId,
            status: "open",
            assignedUsers: multipleUsers,
            creator: "cherry",
        }
        await assertSucceeds(
            setDoc(doc(cherryDb, taskRef()), memberCreatedTask)
        );
    });
    it("[Fail] Unauth user created a task and assigned to himself (not in group)", async () => {
        const unauthAssignedToHimself: TaskAssign = {
            assignedTo: "unauthed",
            assignedBy: "unauthed",
            status: "waiting"
        };
        await assertFails(
            setDoc(doc(unauthedDb, taskAssignRef()), unauthAssignedToHimself)
        );
    });
    it("[Fail] Unauth user created a task and assigned to others (not in group)", async () => {
        const unauthAssignedToOther: TaskAssign = {
            assignedTo: "cherry",
            assignedBy: "unauthed",
            status: "waiting"
        };
        await assertFails(
            setDoc(doc(unauthedDb, taskAssignRef()), unauthAssignedToOther)
        );
    });
    it("[Fail] Unauth user created a task and assigned to himself (with task group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const cherryCreateTaskGroup: TaskGroup = {
            name: "Task Group 3",
            creator: "cherry",
            users: ["apple, durian, eggplant"],
            moderatorUsers: ["banana"],
        }
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), cherryCreateTaskGroup)
        );

        const unauthAssignedToHimself: TaskAssign = {
            taskId: randomTaskId(),
            assignedTo: "unauthed",
            assignedBy: "unauthed",
            taskGroupId: taskGroupId,
            status: "waiting"
        };
        await assertFails(
            setDoc(doc(unauthedDb, taskAssignRef()), unauthAssignedToHimself)
        );
    });
    it("[Fail] Unauth user created a task and assigned to others (with task group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const cherryCreateTaskGroup: TaskGroup = {
            name: "Task Group 3",
            creator: "cherry",
            users: ["apple, durian, eggplant"],
            moderatorUsers: ["banana"],
        }
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), cherryCreateTaskGroup)
        );

        const unauthAssignedToOther: TaskAssign = {
            taskId: randomTaskId(),
            assignedTo: "cherry",
            assignedBy: "unauthed",
            taskGroupId: taskGroupId,
            status: "waiting"
        };
        await assertFails(
            setDoc(doc(unauthedDb, taskAssignRef()), unauthAssignedToOther)
        );
    });
    it("[Pass] User created a task and assigned to himself (not in group)", async () => {
        const taskId = randomTaskId();
        const taskCreate = {
            title: "Beat the heat",
            creator: "cherry",
            status: "open",
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), taskCreate);
        const userAssignedToHerself: TaskAssign = {
            taskId: taskId,
            assignedTo: "cherry",
            assignedBy: "cherry",
            status: "waiting"
        };
        await assertSucceeds(
            setDoc(doc(cherryDb, taskAssignRef()), userAssignedToHerself)
        );
    });
    it("[Fail] User assigned a nonexisting task to himself (not in group)", async () => {
        const userAssignedToHerself: TaskAssign = {
            taskId: randomTaskId(),
            assignedTo: "cherry",
            assignedBy: "cherry",
            status: "waiting"
        };
        await assertFails(
            setDoc(doc(cherryDb, taskAssignRef()), userAssignedToHerself)
        );
    });
    it("[Fail] User assigned a nonexisting task to others (not in group)", async () => {
        const userAssignedToOther: TaskAssign = {
            taskId: randomTaskId(),
            assignedTo: "banana",
            assignedBy: "cherry",
            status: "waiting"
        };
        await assertFails(
            setDoc(doc(cherryDb, taskAssignRef()), userAssignedToOther)
        );
    });
    it("[Fail] User created a task and assigned to others (not in group)", async () => {
        const taskId = randomTaskId();
        const taskCreate = {
            title: "Beat the heat",
            creator: "cherry",
            status: "open",
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), taskCreate);
        const userAssignedToOther: TaskAssign = {
            taskId: taskId,
            assignedTo: "banana",
            assignedBy: "cherry",
            status: "waiting"
        };
        await assertFails(
            setDoc(doc(cherryDb, taskAssignRef()), userAssignedToOther)
        );
    });
    it("[Fail] User created a task and another user assigned it others (not in group)", async () => {
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Move the groove",
            creator: "cherry",
            status: "open",
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), userCreatedTask);
        const anotherAssignedTaskToOther: TaskAssign = {
            assignedBy: "banana",
            assignedTo: "apple",
            status: "waiting",
            taskId: taskId
        };

        await assertFails(
            setDoc(doc(bananaDb, taskAssignRef()), anotherAssignedTaskToOther)
        );
    });
    it("[Fail] User created a task and another user assigned it to user (not in group)", async () => {
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Move the groove",
            creator: "cherry",
            status: "open",
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), userCreatedTask);
        const anotherAssignedTaskToOther: TaskAssign = {
            assignedBy: "banana",
            assignedTo: "cherry",
            status: "waiting",
            taskId: taskId
        };
        await assertFails(
            setDoc(doc(bananaDb, taskAssignRef()), anotherAssignedTaskToOther)
        );
    });
    it("[Fail] User created a task and another user assigned it himself (not in group)", async () => {
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Move the groove",
            creator: "cherry",
            status: "open",
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), userCreatedTask);
        const anotherAssignedTaskToHimself: TaskAssign = {
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskId: taskId
        };
        await assertFails(
            setDoc(doc(bananaDb, taskAssignRef()), anotherAssignedTaskToHimself)
        );
    });
    it("[Fail] User created a task and another user assigned it himself using user's id (not in group)", async () => {
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Move the groove",
            creator: "cherry",
            status: "open",
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), userCreatedTask);
        const anotherAssignedTaskToOther: TaskAssign = {
            assignedBy: "cherry",
            assignedTo: "banana",
            status: "waiting",
            taskId: taskId,
        };
        await assertFails(
            setDoc(doc(bananaDb, taskAssignRef()), anotherAssignedTaskToOther)
        );
    });
    it("[Fail] User created a task and unauthed user assigned it others (not in group)", async () => {
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Move the groove",
            creator: "cherry",
            status: "open",
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), userCreatedTask);
        const unauthAssignedTaskToOther: TaskAssign = {
            assignedBy: "banana",
            assignedTo: "apple",
            status: "unauthed",
            taskId: taskId,
        };

        await assertFails(
            setDoc(doc(unauthedDb, taskAssignRef()), unauthAssignedTaskToOther)
        );
    });
    it("[Fail] User created a task and unauthed user assigned it to the user (not in group)", async () => {
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "cherry",
            status: "open",
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), userCreatedTask);
        const unauthAssignedTaskToOther: TaskAssign = {
            assignedBy: "banana",
            assignedTo: "cherry",
            status: "unauthed",
            taskId: taskId,
        };
        await assertFails(
            setDoc(doc(unauthedDb, taskAssignRef()), unauthAssignedTaskToOther)
        );
    });
    it("[Fail] User created a task and assigned to others (not in group)", async () => {
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "cherry",
            status: "open",
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), userCreatedTask);
        const unauthAssignedTaskToOther: TaskAssign = {
            assignedBy: "cherry",
            assignedTo: "banana",
            status: "unauthed",
            taskId: taskId,
        };
        await assertFails(
            setDoc(doc(cherryDb, taskAssignRef()), unauthAssignedTaskToOther)
        );
    });
    it("[Fail] User created a group, and a task, then unauth created a task assign to himself", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        }
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );

        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "cherry",
            status: "open",
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), userCreatedTask);
        const unauthAssignedTaskToOther: TaskAssign = {
            assignedBy: "unauthed",
            assignedTo: "unauthed",
            status: "waiting",
            taskId: taskId,
        };
        await assertFails(
            setDoc(doc(unauthedDb, taskAssignRef()), unauthAssignedTaskToOther)
        );
    });
    it("[Fail] User created a group, and a task, then outsider created a task assign to himself", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "cherry",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), userCreatedTask);
        const unauthAssignedTaskToOther: TaskAssign = {
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskId: taskId,
        };
        await assertFails(
            setDoc(doc(bananaDb, taskAssignRef()), unauthAssignedTaskToOther)
        );
    });


    it("[Pass] Creator assigned to himself, task by himself, in group", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "cherry",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), userCreatedTask);
        const creatorAssignedToHimself: TaskAssign = {
            assignedBy: "cherry",
            assignedTo: "cherry",
            status: "waiting",
            taskId: taskId,
            taskGroupId: taskGroupId,
        };
        await assertSucceeds(
            setDoc(doc(cherryDb, taskAssignRef()), creatorAssignedToHimself)
        );
    });
    it("[Fail] Creator assigned to himself, task by himself, in group (missing taskGroupId)", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "cherry",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), userCreatedTask);
        const creatorAssignedToHimself: TaskAssign = {
            assignedBy: "cherry",
            assignedTo: "cherry",
            status: "waiting",
            taskId: taskId,
        };
        await assertFails(
            setDoc(doc(cherryDb, taskAssignRef()), creatorAssignedToHimself)
        );
    });
    it("[Pass] Creator assigned to moderator, task by himself, in group", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "cherry",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), userCreatedTask);
        const creatorAssignedToModerator: TaskAssign = {
            assignedBy: "cherry",
            assignedTo: "durian",
            status: "waiting",
            taskId: taskId,
            taskGroupId: taskGroupId,
        };
        await assertSucceeds(
            setDoc(doc(cherryDb, taskAssignRef()), creatorAssignedToModerator)
        );
    });
    it("[Fail] Creator assigned to moderator, task by himself, in group (missing taskGroupId)", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "cherry",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), userCreatedTask);
        const creatorAssignedToModerator: TaskAssign = {
            assignedBy: "cherry",
            assignedTo: "durian",
            status: "waiting",
            taskId: taskId,
        };
        await assertFails(
            setDoc(doc(cherryDb, taskAssignRef()), creatorAssignedToModerator)
        );
    });

    it("[Pass] Creator assigned to member, task by himself, in group", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "cherry",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), userCreatedTask);
        const creatorAssignedToMember: TaskAssign = {
            assignedBy: "cherry",
            assignedTo: "apple",
            status: "waiting",
            taskId: taskId,
            taskGroupId: taskGroupId,
        };
        await assertSucceeds(
            setDoc(doc(cherryDb, taskAssignRef()), creatorAssignedToMember)
        );
    });

    it("[Fail] Creator assigned to member, task by himself, in group (missing taskGroupId)", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "cherry",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), userCreatedTask);
        const creatorAssignedToMember: TaskAssign = {
            assignedBy: "cherry",
            assignedTo: "apple",
            status: "waiting",
            taskId: taskId,
        };
        await assertFails(
            setDoc(doc(cherryDb, taskAssignRef()), creatorAssignedToMember)
        );
    });

    it("[Fail] Creator assigned to outsider, task by himself, in group", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "cherry",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(cherryDb, taskRef(taskId)), userCreatedTask);
        const creatorAssignedToOutsider: TaskAssign = {
            assignedBy: "cherry",
            assignedTo: "banana",
            status: "waiting",
            taskId: taskId,
            taskGroupId: taskGroupId,
        };
        await assertFails(
            setDoc(doc(cherryDb, taskAssignRef()), creatorAssignedToOutsider)
        );
    });

    it("[Fail] User assigned to himself, missing taskId", async () => {
        const unauthAssignedTaskToOther: TaskAssign = {
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
        };
        await assertFails(
            setDoc(doc(bananaDb, taskAssignRef()), unauthAssignedTaskToOther)
        );
    });
    it("[Pass] Moderator assigned to himself, task by himself, in group", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const moderatorAssignedToHimself: TaskAssign = {
            assignedBy: "durian",
            assignedTo: "durian",
            status: "waiting",
            taskId: taskId,
            taskGroupId: taskGroupId,
        };
        await assertSucceeds(
            setDoc(doc(durianDb, taskAssignRef()), moderatorAssignedToHimself)
        );
    });
    it("[Fail] Moderator assigned to himself, task by himself, in group (missing taskGroupId)", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const moderatorAssignedToHimself: TaskAssign = {
            assignedBy: "durian",
            assignedTo: "durian",
            status: "waiting",
            taskId: taskId,
        };
        await assertFails(
            setDoc(doc(durianDb, taskAssignRef()), moderatorAssignedToHimself)
        );
    });
    it("[Pass] Moderator assigned to moderator, task by himself, in group", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian", "banana"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const moderatorAssignedToModerator: TaskAssign = {
            assignedBy: "durian",
            assignedTo: "banana",
            status: "waiting",
            taskId: taskId,
            taskGroupId: taskGroupId,
        };
        await assertSucceeds(
            setDoc(doc(durianDb, taskAssignRef()), moderatorAssignedToModerator)
        );
    });
    it("[Fail] Moderator assigned to moderator, task by himself, in group (missing taskGroupId)", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian", "banana"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const moderatorAssignedToModerator: TaskAssign = {
            assignedBy: "durian",
            assignedTo: "banana",
            status: "waiting",
            taskId: taskId,
        };
        await assertFails(
            setDoc(doc(durianDb, taskAssignRef()), moderatorAssignedToModerator)
        );
    });

    it("[Pass] Moderator assigned to member, task by himself, in group", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const moderatorAssignedToModerator: TaskAssign = {
            assignedBy: "durian",
            assignedTo: "apple",
            status: "waiting",
            taskId: taskId,
            taskGroupId: taskGroupId,
        };
        await assertSucceeds(
            setDoc(doc(durianDb, taskAssignRef()), moderatorAssignedToModerator)
        );
    });
    it("[Fail] Moderator assigned to member, task by himself, in group (missing taskGroupId)", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const moderatorAssignedToModerator: TaskAssign = {
            assignedBy: "durian",
            assignedTo: "apple",
            status: "waiting",
            taskId: taskId,
        };
        await assertFails(
            setDoc(doc(durianDb, taskAssignRef()), moderatorAssignedToModerator)
        );
    });

    it("[Fail] Moderator assigned to outsider, task by himself, in group", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const moderatorAssignedToOutsider: TaskAssign = {
            assignedBy: "durian",
            assignedTo: "banana",
            status: "waiting",
            taskId: taskId,
            taskGroupId: taskGroupId,
        };
        await assertFails(
            setDoc(doc(durianDb, taskAssignRef()), moderatorAssignedToOutsider)
        );
    });


    it("[Pass] Member assigned to himself, task by himself, in group", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const memberAssignedToHimself: TaskAssign = {
            assignedBy: "apple",
            assignedTo: "apple",
            status: "waiting",
            taskId: taskId,
            taskGroupId: taskGroupId,
        };
        await assertSucceeds(
            setDoc(doc(appleDb, taskAssignRef()), memberAssignedToHimself)
        );
    });
    it("[Fail] Member assigned to himself, task by himself, in group (missing taskGroupId)", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const memberAssignedToHimself: TaskAssign = {
            assignedBy: "apple",
            assignedTo: "apple",
            status: "waiting",
            taskId: taskId,
        };
        await assertFails(
            setDoc(doc(appleDb, taskAssignRef()), memberAssignedToHimself)
        );
    });
    it("[Pass] Member assigned to moderator, task by himself, in group", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };

        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const memberAssignedToModerator: TaskAssign = {
            assignedBy: "apple",
            assignedTo: "durian",
            status: "waiting",
            taskId: taskId,
            taskGroupId: taskGroupId,
        };
        await assertSucceeds(
            setDoc(doc(appleDb, taskAssignRef()), memberAssignedToModerator)
        );
    });
    it("[Fail] Member assigned to moderator, task by himself, in group (missing taskGroupId)", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };

        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const memberAssignedToModerator: TaskAssign = {
            assignedBy: "apple",
            assignedTo: "durian",
            status: "waiting",
            taskId: taskId,
        };
        await assertFails(
            setDoc(doc(appleDb, taskAssignRef()), memberAssignedToModerator)
        );
    });

    it("[Pass] Member assigned to another member, task by himself, in group", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple", "banana"],
            creator: "cherry",
            name: "Task Group 3",
        };

        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const memberAssignedToModerator: TaskAssign = {
            assignedBy: "apple",
            assignedTo: "banana",
            status: "waiting",
            taskId: taskId,
            taskGroupId: taskGroupId,
        };
        await assertSucceeds(
            setDoc(doc(appleDb, taskAssignRef()), memberAssignedToModerator)
        );
    });
    it("[Fail] Member assigned to another member, task by himself, in group (missing taskGroupId)", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple", "banana"],
            creator: "cherry",
            name: "Task Group 3",
        };

        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const memberAssignedToModerator: TaskAssign = {
            assignedBy: "apple",
            assignedTo: "banana",
            status: "waiting",
            taskId: taskId,
        };
        await assertFails(
            setDoc(doc(appleDb, taskAssignRef()), memberAssignedToModerator)
        );
    });

    it("[Fail] Member assigned to outsider, task by himself, in group", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };

        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const memberAssignedToOutsider: TaskAssign = {
            assignedBy: "apple",
            assignedTo: "banana",
            status: "waiting",
            taskId: taskId,
        };
        await assertFails(
            setDoc(doc(appleDb, taskAssignRef()), memberAssignedToOutsider)
        );
    });

    it("[Fail] Outsider assigned to himself, task in group", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };

        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const outsiderAssignedToHimself: TaskAssign = {
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskId: taskId,
            taskGroupId: taskGroupId,
        };
        await assertFails(
            setDoc(doc(bananaDb, taskAssignRef()), outsiderAssignedToHimself)
        );
    });
    it("[Fail] Outsider assigned to Creator, task in group", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };

        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const outsiderAssignedToCreator: TaskAssign = {
            assignedBy: "banana",
            assignedTo: "cherry",
            status: "waiting",
            taskId: taskId,
            taskGroupId: taskGroupId,
        };
        await assertFails(
            setDoc(doc(bananaDb, taskAssignRef()), outsiderAssignedToCreator)
        );
    });
    it("[Fail] Outsider assigned to moderator, in group", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };

        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const outsiderAssignedToModerator: TaskAssign = {
            assignedBy: "banana",
            assignedTo: "durian",
            status: "waiting",
            taskId: taskId,
            taskGroupId: taskGroupId,
        };
        await assertFails(
            setDoc(doc(bananaDb, taskAssignRef()), outsiderAssignedToModerator)
        );
    });

    it("[Fail] Outsider assigned to another Outsider, task in group", async () => {
        const taskGroupId = randomTaskGroupId();
        const userCreateGroup: TaskGroup = {
            moderatorUsers: ["durian"],
            users: ["apple"],
            creator: "cherry",
            name: "Task Group 3",
        };

        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), userCreateGroup)
        );
        const taskId = randomTaskId();
        const userCreatedTask: Task = {
            title: "Beat the heat",
            creator: "durian",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(durianDb, taskRef(taskId)), userCreatedTask);
        const outsiderAssignedToOutsider: TaskAssign = {
            assignedBy: "banana",
            assignedTo: "eggplant",
            status: "waiting",
            taskId: taskId,
            taskGroupId: taskGroupId,
        };
        await assertFails(
            setDoc(doc(appleDb, taskAssignRef()), outsiderAssignedToOutsider)
        );
    });
});

describe("Task Assign Update Test", async () => {
    before(async () => {
        setLogLevel("error");
        testEnv = await initializeTestEnvironment({
            projectId: PROJECT_ID,
            firestore: {
                host,
                port,
                rules: readFileSync("firestore.rules", "utf8"),
            },
        });
    });

    beforeEach(async () => {
        await testEnv.clearFirestore();
        unauthedDb = testEnv.unauthenticatedContext().firestore();
        appleDb = testEnv.authenticatedContext("apple").firestore();
        bananaDb = testEnv.authenticatedContext("banana").firestore();
        cherryDb = testEnv.authenticatedContext("cherry").firestore();
        durianDb = testEnv.authenticatedContext("durian").firestore();
    });

    it("[Pass] User created and assigned task to himself, then updated the status", async () => {
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open"
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertSucceeds(
            updateDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });

    it("[Fail] User created and assigned task to himself, then unauthed user updated the status", async () => {
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open"
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });
    it("[Fail] User created and assigned task to himself, then unauthed user updated the status", async () => {
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open"
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });
    it("[Fail] User created and assigned task to himself, then other user updated the status", async () => {
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open"
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertFails(
            updateDoc(doc(appleDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });
    it("[Fail] User created and assigned task to himself, then tried to update taskId", async () => {
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open"
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            taskId: randomTaskId(),
        }
        await assertFails(
            updateDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });
    it("[Fail] User created and assigned task to himself, then other user tried to update taskId", async () => {
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open"
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            taskId: randomTaskId(),
        }
        await assertFails(
            updateDoc(doc(appleDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });
    it("[Fail] User created and assigned task to himself, then unauthed user tried to update taskId", async () => {
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open"
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            taskId: randomTaskId(),
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });


    it("[Pass] User created and assigned task to himself, then updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateApple: TaskGroup = {
            users: ["banana"],
            moderatorUsers: ["cherry"],
            creator: "apple",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateApple)
        );


        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertSucceeds(
            updateDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });

    it("[Fail] User created and assigned task to himself, then unauth updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateApple: TaskGroup = {
            users: ["banana"],
            moderatorUsers: ["cherry"],
            creator: "apple",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateApple)
        );


        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });

    it("[Fail] User created and assigned task to himself, then outsider updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateApple: TaskGroup = {
            users: ["banana"],
            moderatorUsers: ["cherry"],
            creator: "apple",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateApple)
        );
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertFails(
            updateDoc(doc(durianDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });
    it("[Pass] User created and assigned task to himself, then creator updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateApple: TaskGroup = {
            users: ["banana"],
            moderatorUsers: ["cherry"],
            creator: "apple",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateApple)
        );

        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertSucceeds(
            updateDoc(doc(cherryDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });
    it("[Pass] User created and assigned task to himself, then moderator updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateApple: TaskGroup = {
            users: ["banana"],
            moderatorUsers: ["cherry"],
            creator: "apple",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateApple)
        );

        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertSucceeds(
            updateDoc(doc(cherryDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });
    it("[Pass] User created and assigned task to himself, then other member updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateApple: TaskGroup = {
            users: ["banana"],
            moderatorUsers: ["cherry", "durian"],
            creator: "apple",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateApple)
        );
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertSucceeds(
            updateDoc(doc(durianDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });
    it("[Pass] Moderator created and assigned task to himself, then updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateApple: TaskGroup = {
            users: ["cherry"],
            moderatorUsers: ["banana"],
            creator: "apple",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateApple)
        );
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertSucceeds(
            updateDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });

    it("[Fail] Moderator created and assigned task to himself, then unauth updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateApple: TaskGroup = {
            users: ["cherry"],
            moderatorUsers: ["banana"],
            creator: "apple",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateApple)
        );


        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });

    it("[Fail] Moderator created and assigned task to himself, then outsider updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateApple: TaskGroup = {
            users: ["cherry"],
            moderatorUsers: ["banana"],
            creator: "apple",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateApple)
        );
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);
        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);
        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertFails(
            updateDoc(doc(durianDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });
    it("[Pass] Moderator created and assigned task to himself, then creator updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateApple: TaskGroup = {
            users: ["cherry"],
            moderatorUsers: ["banana"],
            creator: "apple",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateApple)
        );


        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertSucceeds(
            updateDoc(doc(cherryDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });
    it("[Pass] Moderator created and assigned task to himself, then other moderator updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();

        const taskGroupCreateApple: TaskGroup = {
            users: ["cherry"],
            moderatorUsers: ["banana", "durian"],
            creator: "apple",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateApple)
        );


        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertSucceeds(
            updateDoc(doc(durianDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });
    it("[Pass] Moderator created and assigned task to himself, then member updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateApple: TaskGroup = {
            users: ["cherry"],
            moderatorUsers: ["banana"],
            creator: "apple",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateApple)
        );
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertSucceeds(
            updateDoc(doc(cherryDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });

    it("[Pass] Creator created and assigned task to himself, then updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateBanana: TaskGroup = {
            users: ["cherry"],
            moderatorUsers: ["apple"],
            creator: "banana",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateBanana)
        );
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);
        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);
        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertSucceeds(
            updateDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });

    it("[Fail] Creator created and assigned task to himself, then unauth updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateBanana: TaskGroup = {
            users: ["cherry"],
            moderatorUsers: ["apple"],
            creator: "banana",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateBanana)
        );

        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });

    it("[Fail] Creator created and assigned task to himself, then outsider updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateBanana: TaskGroup = {
            users: ["cherry"],
            moderatorUsers: ["apple"],
            creator: "banana",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateBanana)
        );
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);
        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);
        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertFails(
            updateDoc(doc(durianDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });
    it("[Pass] Creator created and assigned task to himself, then moderator updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateBanana: TaskGroup = {
            users: ["cherry"],
            moderatorUsers: ["apple"],
            creator: "banana",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateBanana)
        );
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);
        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);
        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertSucceeds(
            updateDoc(doc(appleDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });
    it("[Pass] Creator created and assigned task to himself, then member updated the status (in group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateBanana: TaskGroup = {
            users: ["cherry"],
            moderatorUsers: ["apple"],
            creator: "banana",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateBanana)
        );
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);
        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            status: "progress",
        }
        await assertSucceeds(
            updateDoc(doc(cherryDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });

    // Reassign

    it("[Fail] User created and assigned task to himself, then reassign to other user", async () => {
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open"
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {

            assignedBy: "banana",
            assignedTo: "apple",

            status: "progress",
        }
        await assertFails(
            updateDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });
    it("[Fail] User created and assigned task to himself, then unauth user reassign to other user", async () => {
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open"
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            assignedBy: "banana",
            assignedTo: "apple",
            status: "progress",
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });
    it("[Fail] User created and assigned task to himself, then other user reassign to other user", async () => {
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open"
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);
        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);
        const taskAssignUpdate: TaskAssign = {
            assignedBy: "apple",
            assignedTo: "apple",
            status: "progress",
        }
        await assertFails(
            updateDoc(doc(appleDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });


    it("[Pass] User created and assigned task to himself, then reassign to other member (in a group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateApple: TaskGroup = {
            users: ["banana", "durian"],
            moderatorUsers: ["cherry"],
            creator: "apple",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateApple)
        );

        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            assignedBy: "banana",
            assignedTo: "durian",
            status: "progress",
        }
        await assertSucceeds(
            updateDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });

    it("[Pass] User created and assigned task to himself, then moderator reassign to other member (in a group)", async () => {
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateApple: TaskGroup = {
            users: ["banana"],
            moderatorUsers: ["cherry"],
            creator: "apple",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateApple)
        );

        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            assignedBy: "cherry",
            assignedTo: "apple",
            status: "progress",
        }
        await assertSucceeds(
            updateDoc(doc(cherryDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });


    it("[Pass] User created and assigned task to himself, then creator reassign to other member (in a group)", async () => {
        // Apple created Task Group
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateApple: TaskGroup = {
            users: ["banana"],
            moderatorUsers: ["cherry"],
            creator: "apple",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateApple)
        );

        // Banana Created task
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        // Banana assigned to himself
        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            assignedBy: "cherry",
            assignedTo: "apple",
            status: "progress",
        }
        await assertSucceeds(
            updateDoc(doc(cherryDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });

    it("[Fail] User created and assigned task to himself, then reassign to other member (wrong assignedBy)", async () => {
        // Apple Created a task group
        const taskGroupId = randomTaskGroupId();
        const taskGroupCreateApple: TaskGroup = {
            users: ["banana", "durian"],
            moderatorUsers: ["cherry"],
            creator: "apple",
            name: "Dancers Task Group",
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) =>
                await setDoc(doc(context.firestore(), taskGroupRef(taskGroupId)), taskGroupCreateApple)
        );

        // banana created task
        const taskId = randomTaskId();
        const taskCreateBanana: Task = {
            title: "Create Task Test",
            content: "Creating a task for testing",
            creator: "banana",
            status: "open",
            taskGroupId: taskGroupId,
        };
        await setDoc(doc(bananaDb, taskRef(taskId)), taskCreateBanana);

        // Banana assigned
        const taskAssignId = randomAssignId();
        const taskAssignBanana: TaskAssign = {
            taskId: taskId,
            assignedBy: "banana",
            assignedTo: "banana",
            status: "waiting",
            taskGroupId: taskGroupId,
        }
        await setDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignBanana);

        const taskAssignUpdate: TaskAssign = {
            assignedBy: "cherry",
            assignedTo: "durian",
            status: "progress",
        }
        await assertFails(
            updateDoc(doc(bananaDb, taskAssignRef(taskAssignId)), taskAssignUpdate)
        );
    });

});

describe("Invitation/Joining Test", async () => {
    let eggplantDb: firebase.firestore.Firestore;
    let flowerDb: firebase.firestore.Firestore;
    let guavaDb: firebase.firestore.Firestore;
    let kiwiDb: firebase.firestore.Firestore;
    let lemonDb: firebase.firestore.Firestore;
    let mangoDb: firebase.firestore.Firestore;

    let appleTaskGroupId: string;

    before(async () => {
        setLogLevel("error");
        testEnv = await initializeTestEnvironment({
            projectId: PROJECT_ID,
            firestore: {
                host,
                port,
                rules: readFileSync("firestore.rules", "utf8"),
            },
        });
    });

    beforeEach(async () => {
        await testEnv.clearFirestore();
        unauthedDb = testEnv.unauthenticatedContext().firestore();
        appleDb = testEnv.authenticatedContext("apple").firestore();
        bananaDb = testEnv.authenticatedContext("banana").firestore();
        cherryDb = testEnv.authenticatedContext("cherry").firestore();
        durianDb = testEnv.authenticatedContext("durian").firestore();
        eggplantDb = testEnv.authenticatedContext("eggplant").firestore();
        flowerDb = testEnv.authenticatedContext("flower").firestore();
        guavaDb = testEnv.authenticatedContext("guava").firestore();
        kiwiDb = testEnv.authenticatedContext("kiwi").firestore();
        lemonDb = testEnv.authenticatedContext("lemon").firestore();
        mangoDb = testEnv.authenticatedContext("mango").firestore();

        appleTaskGroupId = randomTaskGroupId();
        const taskGroup: TaskGroup = {
            name: "Best Group for you to handle",
            creator: "apple",
            moderatorUsers: ["banana", "cherry"],
            users: ["durian", "eggplant"],
            invitedUsers: [],
            rejectedUsers: [],
        };
        await testEnv.withSecurityRulesDisabled(
            async (context) => await setDoc(doc(context.firestore(), taskGroupRef(appleTaskGroupId)), taskGroup)
        );
    });

    it("[Pass] Creator invite user to group", async () => {
        const taskGroupUpdate: TaskGroup = {
            invitedUsers: arrayUnion("flower"),
        }
        await assertSucceeds(
            updateDoc(
                doc(appleDb, taskGroupRef(appleTaskGroupId)),
                taskGroupUpdate,
            )
        );
    });
    it("[Pass] Moderator invite user to group", async () => {
        const taskGroupUpdate: TaskGroup = {
            invitedUsers: arrayUnion("flower"),
        }
        await assertSucceeds(
            updateDoc(
                doc(bananaDb, taskGroupRef(appleTaskGroupId)),
                taskGroupUpdate,
            )
        );
    });
    it("[Fail] Member invite user to group", async () => {
        const taskGroupUpdate: TaskGroup = {
            invitedUsers: arrayUnion("flower"),
        }
        await assertFails(
            updateDoc(
                doc(durianDb, taskGroupRef(appleTaskGroupId)),
                taskGroupUpdate,
            )
        );
    });
    it("[Fail] Outsider invite user to group", async () => {
        const taskGroupUpdate: TaskGroup = {
            invitedUsers: arrayUnion("flower"),
        }
        await assertFails(
            updateDoc(
                doc(guavaDb, taskGroupRef(appleTaskGroupId)),
                taskGroupUpdate,
            )
        );
    });
    it("[Fail] Unauth user invite user to group", async () => {
        const taskGroupUpdate: TaskGroup = {
            invitedUsers: arrayUnion("flower"),
        }
        await assertFails(
            updateDoc(
                doc(unauthedDb, taskGroupRef(appleTaskGroupId)),
                taskGroupUpdate,
            )
        );
    });
    it("[Fail] Outsider user invited himself to group", async () => {
        const taskGroupUpdate: TaskGroup = {
            invitedUsers: arrayUnion("flower"),
        }
        await assertFails(
            updateDoc(
                doc(flowerDb, taskGroupRef(appleTaskGroupId)),
                taskGroupUpdate,
            )
        );
    });

    it("[Fail] Creator added member to group", async () => {
        const taskGroupUpdate: TaskGroup = {
            users: arrayUnion("flower"),
        }
        await assertFails(
            updateDoc(
                doc(appleDb, taskGroupRef(appleTaskGroupId)),
                taskGroupUpdate,
            )
        );
    });
    it("[Fail] Moderator added member to group", async () => {
        const taskGroupUpdate: TaskGroup = {
            users: arrayUnion("flower"),
        }
        await assertFails(
            updateDoc(
                doc(bananaDb, taskGroupRef(appleTaskGroupId)),
                taskGroupUpdate,
            )
        );
    });
    it("[Fail] Member added member to group", async () => {
        const taskGroupUpdate: TaskGroup = {
            users: arrayUnion("flower"),
        }
        await assertFails(
            updateDoc(
                doc(durianDb, taskGroupRef(appleTaskGroupId)),
                taskGroupUpdate,
            )
        );
    });
    it("[Fail] Outsider added himself as member to group", async () => {
        const taskGroupUpdate: TaskGroup = {
            users: arrayUnion("flower"),
        }
        await assertFails(
            updateDoc(
                doc(flowerDb, taskGroupRef(appleTaskGroupId)),
                taskGroupUpdate,
            )
        );
    });
    it("[Fail] Outsider added another as member to group", async () => {
        const taskGroupUpdate: TaskGroup = {
            users: arrayUnion("guava"),
        }
        await assertFails(
            updateDoc(
                doc(flowerDb, taskGroupRef(appleTaskGroupId)),
                taskGroupUpdate,
            )
        );
    });
    it("[Fail] Unauth user added member to group", async () => {
        const taskGroupUpdate: TaskGroup = {
            users: arrayUnion("guava"),
        }
        await assertFails(
            updateDoc(
                doc(unauthedDb, taskGroupRef(appleTaskGroupId)),
                taskGroupUpdate,
            )
        );
    });
    it("[Pass] User accepting invitation and adding as member to group", async () => {
        // Apple Invite Flower
        const taskGroupUpdate: TaskGroup = {
            invitedUsers: arrayUnion("flower"),
        };
        updateDoc(
            doc(appleDb, taskGroupRef(appleTaskGroupId)),
            taskGroupUpdate,
        );

        // Flower accepted invtation
        const taskGroupFlowerAccept: TaskGroup = {
            users: arrayUnion("flower"),
            invitedUsers: arrayRemove("flower"),
        };
        await assertSucceeds(
            updateDoc(
                doc(flowerDb, taskGroupRef(appleTaskGroupId)),
                taskGroupFlowerAccept,
            )
        );
    });
    it("[Fail] A different user accepting invitation and adding as member to group", async () => {
        // Apple Invite Flower
        const taskGroupUpdate: TaskGroup = {
            invitedUsers: arrayUnion("flower"),
        };
        updateDoc(
            doc(appleDb, taskGroupRef(appleTaskGroupId)),
            taskGroupUpdate,
        );

        // Flower accepted invtation
        const taskGroupFlowerAccept: TaskGroup = {
            users: arrayUnion("flower"),
            invitedUsers: arrayRemove("flower"),
        };
        await assertFails(
            updateDoc(
                doc(guavaDb, taskGroupRef(appleTaskGroupId)),
                taskGroupFlowerAccept,
            )
        );
    });


});