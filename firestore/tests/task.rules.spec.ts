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
    addDoc,
    updateDoc,
    deleteDoc,
    setLogLevel,
    arrayUnion,
} from "firebase/firestore";
import { readFileSync } from "node:fs";
import { before } from "mocha";
import { taskRef, Task } from "./task/task";
import { randomtaskGroupId, TaskGroup, taskGroupRef } from "./task/task-group";

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

describe("Rules Test", async () => {
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
    it("[Fail] User tried to create a task in a non-existing group", async () => {
        const taskCreateWithGroup: Task = {
            title: "Task to work with Group",
            groupId: "nonExistingGroup",
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
            groupId: "nonExistingGroup",
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
            groupId: "nonExistingGroup",
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
            groupId: "group1",
            assignedUsers: ["unauthed"],
            status: "open",
        };
        await assertFails(
            setDoc(doc(unauthedDb, taskRef()), taskCreateWithGroupByUnauthed)
        );
    });


    it("[Fail] Unauth user tried to update the name of the task group [Creator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupUpdatedByUnauth: TaskGroup = {
            name: "Better Task Group",
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskGroupRef(groupId)), taskGroupUpdatedByUnauth)
        );

    });


    it("[Fail] Unauth user tried to update the creator of the task group [Creator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupChangeCreatorByUnauth: TaskGroup = {
            creator: "banana",
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskGroupRef(groupId)), taskGroupChangeCreatorByUnauth)
        );
    });
    it("[Fail] Unauth user tried to add a moderator in a group [Creator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupAddingBananaInModeratorByUnauthed: TaskGroup = {
            moderatorUsers: arrayUnion("banana"),
        };
        await assertFails(
            updateDoc(doc(unauthedDb, taskGroupRef(groupId)), taskGroupAddingBananaInModeratorByUnauthed)
        );
    });


    it("[Fail] User who is not the creator of the group tried to update the name of the group. [Creator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupUpdatedByBanana: TaskGroup = {
            name: "Better than ever Task Group by Banana",
        }
        await assertFails(
            updateDoc(doc(bananaDb, taskGroupRef(groupId)), taskGroupUpdatedByBanana)
        );
    });
    it("[Fail] User who is not the creator of the group tried to update the creator of the group. [Creator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupChangeCreatorByBanana: TaskGroup = {
            creator: "banana",
        }
        await assertFails(
            updateDoc(doc(bananaDb, taskGroupRef(groupId)), taskGroupChangeCreatorByBanana)
        );
    });
    it("[Fail] User who is not the creator of the group tried to add a moderator in the group. [Creator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupAddingHimsefInModeratorByBanana: TaskGroup = {
            moderatorUsers: arrayUnion("banana"),
        };
        await assertFails(
            updateDoc(doc(bananaDb, taskGroupRef(groupId)), taskGroupAddingHimsefInModeratorByBanana)
        );
    });
    it("[Pass] User updated the name of the group where the user is the creator. [Creator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupUpdatedByApple: TaskGroup = {
            name: "Apple's Task Group",
        }
        await assertSucceeds(
            updateDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupUpdatedByApple)
        );
    });
    it("[Fail] User updated the creator of the group where the user is the creator. [Creator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupCreatorChangeByApple: TaskGroup = {
            creator: "banana",
        }
        await assertFails(
            updateDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreatorChangeByApple)
        );
    });
    it("[Pass] Group creator added a moderator in the group. [Creator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupAddingModeratorByApple: TaskGroup = {
            moderatorUsers: arrayUnion("cherry"),
        }
        await assertSucceeds(
            updateDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupAddingModeratorByApple)
        );
    });

    it("[Fail] Unauth user tried to update the name of the group. [Moderator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupUpdatedByUnauth: TaskGroup = {
            name: "Better Task Group",
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskGroupRef(groupId)), taskGroupUpdatedByUnauth)
        );
    });
    it("[Fail] Unauth user tried to update the creator of the group. [Moderator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupChangeCreatorByUnauth: TaskGroup = {
            creator: "banana",
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskGroupRef(groupId)), taskGroupChangeCreatorByUnauth)
        );
    });
    it("[Fail] Unauth user tried to add a moderator in a group. [Moderator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupAddingBananaInModeratorByUnauthed: TaskGroup = {
            moderatorUsers: arrayUnion("banana"),
        };
        await assertFails(
            updateDoc(doc(unauthedDb, taskGroupRef(groupId)), taskGroupAddingBananaInModeratorByUnauthed)
        );
    });
    it("[Fail] User who is not the creator or moderator tried to update the name of the group. [Moderator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupUpdatedByBanana: TaskGroup = {
            name: "Better than ever Task Group by Banana",
        }
        await assertFails(
            updateDoc(doc(bananaDb, taskGroupRef(groupId)), taskGroupUpdatedByBanana)
        );
    });

    it("[Fail] User who is not the creator or moderator tried to update the creator of the group. [Moderator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupChangeCreatorByBanana: TaskGroup = {
            creator: "banana",
        }
        await assertFails(
            updateDoc(doc(bananaDb, taskGroupRef(groupId)), taskGroupChangeCreatorByBanana)
        );
    });
    it("[Fail] User who is not the creator or moderator tried to add a moderator in the group. [Moderator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupAddingInModeratorByBanana: TaskGroup = {
            moderatorUsers: arrayUnion("durian"),
        };
        await assertFails(
            updateDoc(doc(bananaDb, taskGroupRef(groupId)), taskGroupAddingInModeratorByBanana)
        );
    });
    it("[Fail] User who is not the creator or moderator tried to update the name of the group. [Moderator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupAddingHimsefInModeratorByBanana: TaskGroup = {
            moderatorUsers: arrayUnion("banana"),
        };
        await assertFails(
            updateDoc(doc(bananaDb, taskGroupRef(groupId)), taskGroupAddingHimsefInModeratorByBanana)
        );
    });
    it("[Pass] User updated the name of the group where he/she a moderator but not the creator. [Moderator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupUpdatedByCherry: TaskGroup = {
            name: "Apple's Task Group by Cherry",
        }
        await assertSucceeds(
            updateDoc(doc(cherryDb, taskGroupRef(groupId)), taskGroupUpdatedByCherry)
        );
    });
    it("[Fail] Moderator tried to update the creator of the group. [Moderator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupCreatorChangeByCherry: TaskGroup = {
            creator: "banana",
        }
        await assertFails(
            updateDoc(doc(cherryDb, taskGroupRef(groupId)), taskGroupCreatorChangeByCherry)
        );
    });
    it("[Pass] Group moderator added another moderator in the group. [Moderator Test]", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            moderatorUsers: ["cherry"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupAddingModeratorByCherry: TaskGroup = {
            moderatorUsers: arrayUnion("durian"),
        }
        await assertSucceeds(
            updateDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupAddingModeratorByCherry)
        );
    });


    it("[Fail] Unauth user tried to invite users to the group", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupInviteByUnauthed: TaskGroup = {
            invitedUsers: arrayUnion("eggplant"),
        }
        await assertFails(
            updateDoc(doc(unauthedDb, taskGroupRef(groupId)), taskGroupInviteByUnauthed)
        );
    });
    it("[Fail] User who is not the member, creator, or moderator tried to invite users to the group", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);
        const taskGroupInviteBySomeoneNotInGroup: TaskGroup = {
            invitedUsers: arrayUnion("eggplant"),
        }
        await assertFails(
            updateDoc(doc(durianDb, taskGroupRef(groupId)), taskGroupInviteBySomeoneNotInGroup)
        );
    });


    it("[Fail] Member invited user to the group but not the creator or moderator", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupInviteBySomeoneInGroupButNotModerator: TaskGroup = {
            invitedUsers: arrayUnion("eggplant"),
        }
        await assertFails(
            updateDoc(doc(cherryDb, taskGroupRef(groupId)), taskGroupInviteBySomeoneInGroupButNotModerator)
        );
    });
    it("[Pass] Moderator invited user to the group but not the creator", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const taskGroupInviteByModerator: TaskGroup = {
            invitedUsers: arrayUnion("eggplant"),
        }
        await assertSucceeds(
            updateDoc(doc(bananaDb, taskGroupRef(groupId)), taskGroupInviteByModerator)
        );
    });
    it("[Pass] creator invited user to the group", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);
        const taskGroupInviteByCreator: TaskGroup = {
            invitedUsers: arrayUnion("flower"),
        }
        await assertSucceeds(
            updateDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupInviteByCreator)
        );
    });

    it("[Fail] Unauth user tried to create a task in a group", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);
        const unauthCreatedTask: Task = {
            title: "Dance the tiktok Challenge",
            groupId: groupId,
            status: "open",
            creator: "unauthed",
        }
        await assertFails(
            setDoc(doc(unauthedDb, taskRef()), unauthCreatedTask)
        );
    });
    it("[Fail] User who is not a member, creator, or moderator tried to create a task in a group", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);
        const notMemberCreatedTask: Task = {
            title: "Gotta Move like Jagger",
            groupId: groupId,
            status: "open",
            creator: "durian",
        }
        await assertFails(
            setDoc(doc(durianDb, taskRef()), notMemberCreatedTask)
        );
    });


    it("[Pass] Creator created a task in a group", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);
        const creatorCreatedTask: Task = {
            title: "Live like we're Young",
            groupId: groupId,
            status: "open",
            creator: "apple",
        }
        await assertSucceeds(
            setDoc(doc(appleDb, taskRef()), creatorCreatedTask)
        );
    });

    it("[Pass] Moderator created a task in a group", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const moderatorCreatedTask: Task = {
            title: "Drink while Living",
            groupId: groupId,
            status: "open",
            creator: "banana",
        }
        await assertSucceeds(
            setDoc(doc(bananaDb, taskRef()), moderatorCreatedTask)
        );
    });

    it("[Pass] Member created a task in a group", async () => {
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator);

        const memberCreatedTask: Task = {
            title: "Crazy till we see the sun",
            groupId: groupId,
            status: "open",
            creator: "cherry",
        }
        await assertSucceeds(
            setDoc(doc(cherryDb, taskRef()), memberCreatedTask)
        );
    });



    it("One task can be assigned to multiple users", async () => {
        const multipleUsers = [
            "cherry",
            "banana",
            "eggplant",
            "flower",
        ];
        const groupId = randomtaskGroupId();
        const taskGroupCreateWithCorrectCreator: TaskGroup = {
            name: "Task Group 3",
            creator: "apple",
            users: ["cherry"],
            moderatorUsers: ["banana"],
        };
        (await setDoc(doc(appleDb, taskGroupRef(groupId)), taskGroupCreateWithCorrectCreator));

        const unauthCreatedTask: Task = {
            title: "Dance the tiktok Challenge",
            groupId: groupId,
            status: "open",
            assignedUsers: multipleUsers,
        }
        await assertFails(
            setDoc(doc(unauthedDb, taskRef()), unauthCreatedTask)
        );

        const notMemberCreatedTask: Task = {
            title: "Gotta Move like Jagger",
            groupId: groupId,
            status: "open",
            assignedUsers: multipleUsers,
        }
        await assertFails(
            setDoc(doc(durianDb, taskRef()), notMemberCreatedTask)
        );

        const creatorCreatedTask: Task = {
            title: "Live like we're Young",
            groupId: groupId,
            status: "open",
            assignedUsers: multipleUsers,
        }
        await assertSucceeds(
            setDoc(doc(appleDb, taskRef()), creatorCreatedTask)
        );
        const moderatorCreatedTask: Task = {
            title: "Drink while Living",
            groupId: groupId,
            status: "open",
            assignedUsers: multipleUsers,
        }
        await assertSucceeds(
            setDoc(doc(bananaDb, taskRef()), moderatorCreatedTask)
        );
        const memberCreatedTask: Task = {
            title: "Crazy till we see the sun",
            groupId: groupId,
            status: "open",
            assignedUsers: multipleUsers,
        }
        await assertSucceeds(
            setDoc(doc(cherryDb, taskRef()), memberCreatedTask)
        );
    });
});
