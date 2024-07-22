"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var rules_unit_testing_1 = require("@firebase/rules-unit-testing");
var firestore_1 = require("firebase/firestore");
var node_fs_1 = require("node:fs");
var mocha_1 = require("mocha");
var task_1 = require("./task/task");
var task_group_1 = require("./task/task-group");
var task_assign_1 = require("./task/task-assign");
/****** SETUP ********/
var PROJECT_ID = "withcenter-test-3"; // Set your firebase project ID here
var host = "127.0.0.1"; // Don't user "localhost" unless you have a reasion.
var port = 8080; // 터미날에 표시되는 포트로 적절히 지정해야 한다.
/****** UNTIL HERE */
var testEnv;
// 로그인 하지 않은, unauthenticated context 를 글로벌에 저장해서, 타이핑을 줄이고 간소화 한다.
var unauthedDb;
// 각 사용자별 로그인 context 를 저장해 놓고 편하게 사용한다.
var appleDb;
var bananaDb;
var cherryDb;
var durianDb;
describe("Task and Task Group Test", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        // 모든 테스트를 시작하기 전에 실행되는 콜백 함수.
        // 여기에 initializeTestEnvironment() 를 호출해서, Firestore 접속을 초기화 하면 된다.
        // watch 코드가 수정될 경우, 전체 테스트를 다시 실행하면, 이 함수도 다시 호출 된다.
        (0, mocha_1.before)(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, firestore_1.setLogLevel)("error"); // 로그 레벨을 설정한다.
                        return [4 /*yield*/, (0, rules_unit_testing_1.initializeTestEnvironment)({
                                projectId: PROJECT_ID,
                                firestore: {
                                    host: host,
                                    port: port,
                                    // Firestore Security Rules 파일을 읽어서, 테스트 환경에 적용한다.
                                    // 즉, Security Rules 파일을 수정하고, 테스트를 다시 실행하면, 수정된 Rules 이 적용되므로,
                                    // mocha watch 를 하는 경우, 소스 코드를 수정 필요 없이 저장만 한번 해 주면 된다.
                                    rules: (0, node_fs_1.readFileSync)("firestore.rules", "utf8"),
                                },
                            })];
                    case 1:
                        /// 모든 테스트를 실행하기 전에, 파이어베이스 접속 초기화.
                        testEnv = _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // 각 테스트를 하기 전에, 로컬 Firestore 의 데이터를 모두 지운다.
        beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testEnv.clearFirestore()];
                    case 1:
                        _a.sent();
                        // 셋업: Security Rules 를 적용하지 않고, 테스트 데이터를 미리 좀 저장해 놓는다.
                        // withSecurityRulesDisabled 는 한번에 하나의 쿼리만 실행해야 한다. 그렇지 않으면,
                        // Firestore has already been started and its settings can no longer be change 에러가 발생한다.
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), "users/apple"), {
                                                name: "apple",
                                                no: 1,
                                            })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        // 셋업: Security Rules 를 적용하지 않고, 테스트 데이터를 미리 좀 저장해 놓는다.
                        // withSecurityRulesDisabled 는 한번에 하나의 쿼리만 실행해야 한다. 그렇지 않으면,
                        // Firestore has already been started and its settings can no longer be change 에러가 발생한다.
                        _a.sent();
                        // 주의: 캐시 문제를 피하기 위해서, 각 테스트마다 새로운 unauthenticated context 로 DB 를 생성해야 한다.
                        unauthedDb = testEnv.unauthenticatedContext().firestore();
                        // 사용자별 DB 액세스 context 저장. 캐시 문제로 각 테스트 전에 새로 생성해야 한다.
                        appleDb = testEnv.authenticatedContext("apple").firestore();
                        bananaDb = testEnv.authenticatedContext("banana").firestore();
                        cherryDb = testEnv.authenticatedContext("cherry").firestore();
                        durianDb = testEnv.authenticatedContext("durian").firestore();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User signed in anonymously and tried to read a task doc", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.getDoc)((0, firestore_1.doc)(unauthedDb, "/task/task1")))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User signed in to read a task but wrong spelling of path (tasks instead of task)", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.getDoc)((0, firestore_1.doc)(appleDb, "/tasks/task1")))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User signed in to read a task", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.getDoc)((0, firestore_1.doc)(appleDb, "/task/task1")))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User not signed in and tried to create a task", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskCreateUnAuth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskCreateUnAuth = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            status: "open"
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(unauthedDb, (0, task_1.taskRef)()), taskCreateUnAuth))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User signed in to create a task", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskCreateApple;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskCreateApple = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "apple",
                            status: "open"
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_1.taskRef)()), taskCreateApple))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user tried to make a task but in task, there is a creator", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskCreateUnauthWithCreatedBy;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskCreateUnauthWithCreatedBy = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "apple",
                            status: "open"
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(unauthedDb, (0, task_1.taskRef)()), taskCreateUnauthWithCreatedBy))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User used a different uid as the creator of the task upon creating it", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskCreateAuthWithDifferentUid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskCreateAuthWithDifferentUid = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "IAmNotApple",
                            status: "open"
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_1.taskRef)()), taskCreateAuthWithDifferentUid))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User created task and used his/her uid as the creator of the task", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskCreateBanana;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open"
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)()), taskCreateBanana))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created a task group without a moderator, without creator.", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupCreateNoModeratorNoCreator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupCreateNoModeratorNoCreator = {
                            name: "Task Group 1",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)()), taskGroupCreateNoModeratorNoCreator))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user tried create a group with moderator, with creator (not his id)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupCreateUnauthed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupCreateUnauthed = {
                            name: "Task Group 2",
                            moderatorUsers: ["unauthed"],
                            creator: "apple"
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(unauthedDb, (0, task_group_1.taskGroupRef)()), taskGroupCreateUnauthed))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User tried to create group with moderator, but without creator", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupCreateWithHerAsModerator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupCreateWithHerAsModerator = {
                            name: "Task Group 3",
                            moderatorUsers: ["apple"],
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)()), taskGroupCreateWithHerAsModerator))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User create a group without moderator, but with he/she as creator", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupCreateWithCorrectCreator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)()), taskGroupCreateWithCorrectCreator))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User create a group without moderator, but with creator uid not his/her uid", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupCreateWithWrongCreator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupCreateWithWrongCreator = {
                            name: "Task Group 3",
                            creator: "banana",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)()), taskGroupCreateWithWrongCreator))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User create a group with he/she as creator and moderator", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupCreateWithCorrectCreator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            moderatorUsers: ["apple"],
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)()), taskGroupCreateWithCorrectCreator))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User created a task without assignment yet, not in a group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskCreateNoGroupNoAssign;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskCreateNoGroupNoAssign = {
                            title: "Task to work",
                            status: "open",
                            creator: "apple",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_1.taskRef)()), taskCreateNoGroupNoAssign))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Member created a task without assignment yet, in a group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreate, taskCreateInGroupNoAssign;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreate = {
                            users: ["apple"],
                            moderatorUsers: ["durian"],
                            creator: "cherry"
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreate)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskCreateInGroupNoAssign = {
                            title: "Task to work",
                            status: "open",
                            creator: "apple",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_1.taskRef)()), taskCreateInGroupNoAssign))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Moderator created a task without assignment yet, in a group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreate, taskCreateInGroupNoAssign;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreate = {
                            users: ["apple"],
                            moderatorUsers: ["durian"],
                            creator: "cherry"
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreate)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskCreateInGroupNoAssign = {
                            title: "Task to work",
                            status: "open",
                            creator: "durian",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)()), taskCreateInGroupNoAssign))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Creator created a task without assignment yet, in a group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreate, taskCreateInGroupNoAssign;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreate = {
                            users: ["apple"],
                            moderatorUsers: ["durian"],
                            creator: "cherry"
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreate)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskCreateInGroupNoAssign = {
                            title: "Task to work",
                            status: "open",
                            creator: "cherry",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)()), taskCreateInGroupNoAssign))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Outsider created a task without assignment yet, in a group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreate, taskCreateInGroupNoAssign;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreate = {
                            users: ["apple"],
                            moderatorUsers: ["durian"],
                            creator: "cherry"
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreate)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskCreateInGroupNoAssign = {
                            title: "Task to work",
                            status: "open",
                            creator: "banana",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)()), taskCreateInGroupNoAssign))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User tried to create a task in a non-existing group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskCreateWithGroup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskCreateWithGroup = {
                            title: "Task to work with Group",
                            taskGroupId: "nonExistingGroup",
                            status: "open",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_1.taskRef)()), taskCreateWithGroup))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created a task assigned for herself but no creator", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskCreateWithAssign;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskCreateWithAssign = {
                            title: "Task to work with Assign",
                            assignedUsers: ["apple"],
                            status: "open",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_1.taskRef)()), taskCreateWithAssign))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User created a task assigned for herself with herself as creator", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskCreateWithAssign;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskCreateWithAssign = {
                            title: "Task to work with Assign",
                            assignedUsers: ["apple"],
                            status: "open",
                            creator: "apple",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_1.taskRef)()), taskCreateWithAssign))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created a task assigned for herself under a non-exisiting group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskCreateWithGroupAndAssign;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskCreateWithGroupAndAssign = {
                            title: "Task to work with Group and Assign",
                            taskGroupId: "nonExistingGroup",
                            assignedUsers: ["apple"],
                            status: "open",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_1.taskRef)()), taskCreateWithGroupAndAssign))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user created a task assigned for herself under a non-exisiting group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskCreateWithGroupAndAssignByUnauthed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskCreateWithGroupAndAssignByUnauthed = {
                            title: "Task to work with Group and Assign by Unauthed",
                            taskGroupId: "nonExistingGroup",
                            assignedUsers: ["unauthed"],
                            status: "open",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(unauthedDb, (0, task_1.taskRef)()), taskCreateWithGroupAndAssignByUnauthed))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user tried to create a task in a group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskCreateWithGroupByUnauthed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskCreateWithGroupByUnauthed = {
                            title: "Task to work with Group by Unauthed",
                            taskGroupId: "group1",
                            assignedUsers: ["unauthed"],
                            status: "open",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(unauthedDb, (0, task_1.taskRef)()), taskCreateWithGroupByUnauthed))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user tried to update the name of the task group [Creator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupUpdatedByUnauth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupUpdatedByUnauth = {
                            name: "Better Task Group",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(unauthedDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupUpdatedByUnauth))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user tried to update the creator of the task group [Creator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupChangeCreatorByUnauth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupChangeCreatorByUnauth = {
                            creator: "banana",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(unauthedDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupChangeCreatorByUnauth))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user tried to add a moderator in a group [Creator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupAddingBananaInModeratorByUnauthed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupAddingBananaInModeratorByUnauthed = {
                            moderatorUsers: (0, firestore_1.arrayUnion)("banana"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(unauthedDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupAddingBananaInModeratorByUnauthed))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User who is not the creator of the group tried to update the name of the group. [Creator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupUpdatedByBanana;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupUpdatedByBanana = {
                            name: "Better than ever Task Group by Banana",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupUpdatedByBanana))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User who is not the creator of the group tried to update the creator of the group. [Creator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupChangeCreatorByBanana;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupChangeCreatorByBanana = {
                            creator: "banana",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupChangeCreatorByBanana))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User who is not the creator of the group tried to add a moderator in the group. [Creator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupAddingHimsefInModeratorByBanana;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupAddingHimsefInModeratorByBanana = {
                            moderatorUsers: (0, firestore_1.arrayUnion)("banana"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupAddingHimsefInModeratorByBanana))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User updated the name of the group where the user is the creator. [Creator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupUpdatedByApple;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupUpdatedByApple = {
                            name: "Apple's Task Group",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupUpdatedByApple))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User updated the creator of the group where the user is the creator. [Creator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupCreatorChangeByApple;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupCreatorChangeByApple = {
                            creator: "banana",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreatorChangeByApple))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Group creator added a moderator in the group. [Creator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupAddingModeratorByApple;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupAddingModeratorByApple = {
                            moderatorUsers: (0, firestore_1.arrayUnion)("cherry"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupAddingModeratorByApple))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user tried to update the name of the group. [Moderator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupUpdatedByUnauth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            moderatorUsers: ["cherry"],
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupUpdatedByUnauth = {
                            name: "Better Task Group",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(unauthedDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupUpdatedByUnauth))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user tried to update the creator of the group. [Moderator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupChangeCreatorByUnauth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            moderatorUsers: ["cherry"],
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupChangeCreatorByUnauth = {
                            creator: "banana",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(unauthedDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupChangeCreatorByUnauth))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user tried to add a moderator in a group. [Moderator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupAddingBananaInModeratorByUnauthed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            moderatorUsers: ["cherry"],
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupAddingBananaInModeratorByUnauthed = {
                            moderatorUsers: (0, firestore_1.arrayUnion)("banana"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(unauthedDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupAddingBananaInModeratorByUnauthed))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User who is not the creator or moderator tried to update the name of the group. [Moderator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupUpdatedByBanana;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            moderatorUsers: ["cherry"],
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupUpdatedByBanana = {
                            name: "Better than ever Task Group by Banana",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupUpdatedByBanana))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User who is not the creator or moderator tried to update the creator of the group. [Moderator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupChangeCreatorByBanana;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            moderatorUsers: ["cherry"],
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupChangeCreatorByBanana = {
                            creator: "banana",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupChangeCreatorByBanana))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User who is not the creator or moderator tried to add a moderator in the group. [Moderator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupAddingInModeratorByBanana;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            moderatorUsers: ["cherry"],
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupAddingInModeratorByBanana = {
                            moderatorUsers: (0, firestore_1.arrayUnion)("durian"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupAddingInModeratorByBanana))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User who is not the creator or moderator tried to update the name of the group. [Moderator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupAddingHimsefInModeratorByBanana;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            moderatorUsers: ["cherry"],
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupAddingHimsefInModeratorByBanana = {
                            moderatorUsers: (0, firestore_1.arrayUnion)("banana"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupAddingHimsefInModeratorByBanana))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User updated the name of the group where he/she a moderator but not the creator. [Moderator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupUpdatedByCherry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            moderatorUsers: ["cherry"],
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupUpdatedByCherry = {
                            name: "Apple's Task Group by Cherry",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(cherryDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupUpdatedByCherry))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Moderator tried to update the creator of the group. [Moderator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupCreatorChangeByCherry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            moderatorUsers: ["cherry"],
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupCreatorChangeByCherry = {
                            creator: "banana",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(cherryDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreatorChangeByCherry))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Group moderator added another moderator in the group. [Moderator Test]", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupAddingModeratorByCherry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            moderatorUsers: ["cherry"],
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                    case 1:
                        _a.sent();
                        taskGroupAddingModeratorByCherry = {
                            moderatorUsers: (0, firestore_1.arrayUnion)("durian"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupAddingModeratorByCherry))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user tried to invite users to the group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupInviteByUnauthed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskGroupInviteByUnauthed = {
                            invitedUsers: (0, firestore_1.arrayUnion)("eggplant"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(unauthedDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupInviteByUnauthed))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User who is not the member, creator, or moderator tried to invite users to the group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupInviteBySomeoneNotInGroup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskGroupInviteBySomeoneNotInGroup = {
                            invitedUsers: (0, firestore_1.arrayUnion)("eggplant"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(durianDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupInviteBySomeoneNotInGroup))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Member invited user to the group but not the creator or moderator", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupInviteBySomeoneInGroupButNotModerator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskGroupInviteBySomeoneInGroupButNotModerator = {
                            invitedUsers: (0, firestore_1.arrayUnion)("eggplant"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(cherryDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupInviteBySomeoneInGroupButNotModerator))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Moderator invited user to the group but not the creator", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupInviteByModerator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskGroupInviteByModerator = {
                            invitedUsers: (0, firestore_1.arrayUnion)("eggplant"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupInviteByModerator))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] creator invited user to the group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, taskGroupInviteByCreator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskGroupInviteByCreator = {
                            invitedUsers: (0, firestore_1.arrayUnion)("flower"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupInviteByCreator))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user tried to create a task in a group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, unauthCreatedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        unauthCreatedTask = {
                            title: "Dance the tiktok Challenge",
                            taskGroupId: taskGroupId,
                            status: "open",
                            creator: "unauthed",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(unauthedDb, (0, task_1.taskRef)()), unauthCreatedTask))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User who is not a member, creator, or moderator tried to create a task in a group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, notMemberCreatedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        notMemberCreatedTask = {
                            title: "Gotta Move like Jagger",
                            taskGroupId: taskGroupId,
                            status: "open",
                            creator: "durian",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)()), notMemberCreatedTask))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Creator created a task in a group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, creatorCreatedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        creatorCreatedTask = {
                            title: "Live like we're Young",
                            taskGroupId: taskGroupId,
                            status: "open",
                            creator: "apple",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_1.taskRef)()), creatorCreatedTask))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Moderator created a task in a group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, moderatorCreatedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        moderatorCreatedTask = {
                            title: "Drink while Living",
                            taskGroupId: taskGroupId,
                            status: "open",
                            creator: "banana",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)()), moderatorCreatedTask))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Member created a task in a group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateWithCorrectCreator, memberCreatedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        memberCreatedTask = {
                            title: "Crazy till we see the sun",
                            taskGroupId: taskGroupId,
                            status: "open",
                            creator: "cherry",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)()), memberCreatedTask))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user tried to create a task in a group for multiple users who are not all in the group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var multipleUsers, taskGroupId, taskGroupCreateWithCorrectCreator, unauthCreatedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        multipleUsers = [
                            "cherry",
                            "banana",
                            "eggplant",
                            "flower",
                        ];
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        unauthCreatedTask = {
                            title: "Dance the tiktok Challenge",
                            taskGroupId: taskGroupId,
                            status: "open",
                            assignedUsers: multipleUsers,
                            creator: "unauthed",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(unauthedDb, (0, task_1.taskRef)()), unauthCreatedTask))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Nonmember user tried to create a task in a group for users who are not all in the group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var multipleUsers, taskGroupId, taskGroupCreateWithCorrectCreator, notMemberCreatedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        multipleUsers = [
                            "cherry",
                            "banana",
                            "eggplant",
                            "flower",
                        ];
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        notMemberCreatedTask = {
                            title: "Gotta Move like Jagger",
                            taskGroupId: taskGroupId,
                            status: "open",
                            assignedUsers: multipleUsers,
                            creator: "durian",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)()), notMemberCreatedTask))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Creator created a task in a group for multiple users who are not all in the group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var multipleUsers, taskGroupId, taskGroupCreateWithCorrectCreator, creatorCreatedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        multipleUsers = [
                            "cherry",
                            "banana",
                            "eggplant",
                            "flower",
                        ];
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        creatorCreatedTask = {
                            title: "Live like we're Young",
                            taskGroupId: taskGroupId,
                            status: "open",
                            assignedUsers: multipleUsers,
                            creator: "apple",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_1.taskRef)()), creatorCreatedTask))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Moderator created a task in a group for multiple users who are not all in the group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var multipleUsers, taskGroupId, taskGroupCreateWithCorrectCreator, moderatorCreatedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        multipleUsers = [
                            "cherry",
                            "banana",
                            "eggplant",
                            "flower",
                        ];
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        moderatorCreatedTask = {
                            title: "Drink while Living",
                            taskGroupId: taskGroupId,
                            status: "open",
                            assignedUsers: multipleUsers,
                            creator: "banana",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)()), moderatorCreatedTask))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Member created a task in a group for multiple users who are not all in the group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var multipleUsers, taskGroupId, taskGroupCreateWithCorrectCreator, memberCreatedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        multipleUsers = [
                            "cherry",
                            "banana",
                            "eggplant",
                            "flower",
                        ];
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
                            name: "Task Group 3",
                            creator: "apple",
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        memberCreatedTask = {
                            title: "Crazy till we see the sun",
                            taskGroupId: taskGroupId,
                            status: "open",
                            assignedUsers: multipleUsers,
                            creator: "cherry",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)()), memberCreatedTask))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Creator created a task in a group for multiple users who are in the group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var multipleUsers, taskGroupId, taskGroupCreateWithCorrectCreator, creatorCreatedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        multipleUsers = [
                            "cherry",
                            "banana",
                            "eggplant",
                            "flower",
                        ];
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
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
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        creatorCreatedTask = {
                            title: "Live like we're Young",
                            taskGroupId: taskGroupId,
                            status: "open",
                            assignedUsers: multipleUsers,
                            creator: "apple",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_1.taskRef)()), creatorCreatedTask))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Moderator created a task in a group for multiple users who are in the group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var multipleUsers, taskGroupId, taskGroupCreateWithCorrectCreator, moderatorCreatedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        multipleUsers = [
                            "cherry",
                            "banana",
                            "eggplant",
                            "flower",
                        ];
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
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
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        moderatorCreatedTask = {
                            title: "Drink while Living",
                            taskGroupId: taskGroupId,
                            status: "open",
                            assignedUsers: multipleUsers,
                            creator: "banana",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)()), moderatorCreatedTask))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Member created a task in a group for multiple users who are in the group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var multipleUsers, taskGroupId, taskGroupCreateWithCorrectCreator, memberCreatedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        multipleUsers = [
                            "cherry",
                            "banana",
                            "eggplant",
                            "flower",
                        ];
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
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
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        memberCreatedTask = {
                            title: "Crazy till we see the sun",
                            taskGroupId: taskGroupId,
                            status: "open",
                            assignedUsers: multipleUsers,
                            creator: "cherry",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)()), memberCreatedTask))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); });
describe("Task Assign Test", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        (0, mocha_1.before)(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, firestore_1.setLogLevel)("error");
                        return [4 /*yield*/, (0, rules_unit_testing_1.initializeTestEnvironment)({
                                projectId: PROJECT_ID,
                                firestore: {
                                    host: host,
                                    port: port,
                                    rules: (0, node_fs_1.readFileSync)("firestore.rules", "utf8"),
                                },
                            })];
                    case 1:
                        testEnv = _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testEnv.clearFirestore()];
                    case 1:
                        _a.sent();
                        unauthedDb = testEnv.unauthenticatedContext().firestore();
                        appleDb = testEnv.authenticatedContext("apple").firestore();
                        bananaDb = testEnv.authenticatedContext("banana").firestore();
                        cherryDb = testEnv.authenticatedContext("cherry").firestore();
                        durianDb = testEnv.authenticatedContext("durian").firestore();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Member created a task in a group for multiple members who are in the group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var multipleUsers, taskGroupId, taskGroupCreateWithCorrectCreator, memberCreatedTask;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        multipleUsers = [
                            "cherry",
                            "banana",
                            "eggplant",
                            "flower",
                        ];
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateWithCorrectCreator = {
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
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateWithCorrectCreator)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        memberCreatedTask = {
                            title: "Crazy till we see the sun",
                            taskGroupId: taskGroupId,
                            status: "open",
                            assignedUsers: multipleUsers,
                            creator: "cherry",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)()), memberCreatedTask))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user created a task and assigned to himself (not in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var unauthAssignedToHimself;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        unauthAssignedToHimself = {
                            assignedTo: "unauthed",
                            assignedBy: "unauthed",
                            status: "waiting"
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(unauthedDb, (0, task_assign_1.taskAssignRef)()), unauthAssignedToHimself))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user created a task and assigned to others (not in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var unauthAssignedToOther;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        unauthAssignedToOther = {
                            assignedTo: "cherry",
                            assignedBy: "unauthed",
                            status: "waiting"
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(unauthedDb, (0, task_assign_1.taskAssignRef)()), unauthAssignedToOther))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user created a task and assigned to himself (with task group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, cherryCreateTaskGroup, unauthAssignedToHimself;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        cherryCreateTaskGroup = {
                            name: "Task Group 3",
                            creator: "cherry",
                            users: ["apple, durian, eggplant"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), cherryCreateTaskGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        unauthAssignedToHimself = {
                            taskId: (0, task_1.randomTaskId)(),
                            assignedTo: "unauthed",
                            assignedBy: "unauthed",
                            taskGroupId: taskGroupId,
                            status: "waiting"
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(unauthedDb, (0, task_assign_1.taskAssignRef)()), unauthAssignedToHimself))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user created a task and assigned to others (with task group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, cherryCreateTaskGroup, unauthAssignedToOther;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        cherryCreateTaskGroup = {
                            name: "Task Group 3",
                            creator: "cherry",
                            users: ["apple, durian, eggplant"],
                            moderatorUsers: ["banana"],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), cherryCreateTaskGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        unauthAssignedToOther = {
                            taskId: (0, task_1.randomTaskId)(),
                            assignedTo: "cherry",
                            assignedBy: "unauthed",
                            taskGroupId: taskGroupId,
                            status: "waiting"
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(unauthedDb, (0, task_assign_1.taskAssignRef)()), unauthAssignedToOther))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User created a task and assigned to himself (not in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, taskCreate, userAssignedToHerself;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        taskCreate = {
                            title: "Beat the heat",
                            creator: "cherry",
                            status: "open",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), taskCreate)];
                    case 1:
                        _a.sent();
                        userAssignedToHerself = {
                            taskId: taskId,
                            assignedTo: "cherry",
                            assignedBy: "cherry",
                            status: "waiting"
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)()), userAssignedToHerself))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User assigned a nonexisting task to himself (not in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var userAssignedToHerself;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userAssignedToHerself = {
                            taskId: (0, task_1.randomTaskId)(),
                            assignedTo: "cherry",
                            assignedBy: "cherry",
                            status: "waiting"
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)()), userAssignedToHerself))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User assigned a nonexisting task to others (not in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var userAssignedToOther;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userAssignedToOther = {
                            taskId: (0, task_1.randomTaskId)(),
                            assignedTo: "banana",
                            assignedBy: "cherry",
                            status: "waiting"
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)()), userAssignedToOther))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created a task and assigned to others (not in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, taskCreate, userAssignedToOther;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        taskCreate = {
                            title: "Beat the heat",
                            creator: "cherry",
                            status: "open",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), taskCreate)];
                    case 1:
                        _a.sent();
                        userAssignedToOther = {
                            taskId: taskId,
                            assignedTo: "banana",
                            assignedBy: "cherry",
                            status: "waiting"
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)()), userAssignedToOther))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created a task and another user assigned it others (not in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, userCreatedTask, anotherAssignedTaskToOther;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Move the groove",
                            creator: "cherry",
                            status: "open",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 1:
                        _a.sent();
                        anotherAssignedTaskToOther = {
                            assignedBy: "banana",
                            assignedTo: "apple",
                            status: "waiting",
                            taskId: taskId
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)()), anotherAssignedTaskToOther))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created a task and another user assigned it to user (not in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, userCreatedTask, anotherAssignedTaskToOther;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Move the groove",
                            creator: "cherry",
                            status: "open",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 1:
                        _a.sent();
                        anotherAssignedTaskToOther = {
                            assignedBy: "banana",
                            assignedTo: "cherry",
                            status: "waiting",
                            taskId: taskId
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)()), anotherAssignedTaskToOther))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created a task and another user assigned it himself (not in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, userCreatedTask, anotherAssignedTaskToHimself;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Move the groove",
                            creator: "cherry",
                            status: "open",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 1:
                        _a.sent();
                        anotherAssignedTaskToHimself = {
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskId: taskId
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)()), anotherAssignedTaskToHimself))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created a task and another user assigned it himself using user's id (not in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, userCreatedTask, anotherAssignedTaskToOther;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Move the groove",
                            creator: "cherry",
                            status: "open",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 1:
                        _a.sent();
                        anotherAssignedTaskToOther = {
                            assignedBy: "cherry",
                            assignedTo: "banana",
                            status: "waiting",
                            taskId: taskId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)()), anotherAssignedTaskToOther))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created a task and unauthed user assigned it others (not in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, userCreatedTask, unauthAssignedTaskToOther;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Move the groove",
                            creator: "cherry",
                            status: "open",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 1:
                        _a.sent();
                        unauthAssignedTaskToOther = {
                            assignedBy: "banana",
                            assignedTo: "apple",
                            status: "unauthed",
                            taskId: taskId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(unauthedDb, (0, task_assign_1.taskAssignRef)()), unauthAssignedTaskToOther))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created a task and unauthed user assigned it to the user (not in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, userCreatedTask, unauthAssignedTaskToOther;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "cherry",
                            status: "open",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 1:
                        _a.sent();
                        unauthAssignedTaskToOther = {
                            assignedBy: "banana",
                            assignedTo: "cherry",
                            status: "unauthed",
                            taskId: taskId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(unauthedDb, (0, task_assign_1.taskAssignRef)()), unauthAssignedTaskToOther))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created a task and assigned to others (not in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, userCreatedTask, unauthAssignedTaskToOther;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "cherry",
                            status: "open",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 1:
                        _a.sent();
                        unauthAssignedTaskToOther = {
                            assignedBy: "cherry",
                            assignedTo: "banana",
                            status: "unauthed",
                            taskId: taskId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)()), unauthAssignedTaskToOther))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created a group, and a task, then unauth created a task assign to himself", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, unauthAssignedTaskToOther;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "cherry",
                            status: "open",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        unauthAssignedTaskToOther = {
                            assignedBy: "unauthed",
                            assignedTo: "unauthed",
                            status: "waiting",
                            taskId: taskId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(unauthedDb, (0, task_assign_1.taskAssignRef)()), unauthAssignedTaskToOther))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created a group, and a task, then outsider created a task assign to himself", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, unauthAssignedTaskToOther;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "cherry",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        unauthAssignedTaskToOther = {
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskId: taskId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)()), unauthAssignedTaskToOther))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Creator assigned to himself, task by himself, in group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, creatorAssignedToHimself;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "cherry",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        creatorAssignedToHimself = {
                            assignedBy: "cherry",
                            assignedTo: "cherry",
                            status: "waiting",
                            taskId: taskId,
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)()), creatorAssignedToHimself))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Creator assigned to himself, task by himself, in group (missing taskGroupId)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, creatorAssignedToHimself;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "cherry",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        creatorAssignedToHimself = {
                            assignedBy: "cherry",
                            assignedTo: "cherry",
                            status: "waiting",
                            taskId: taskId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)()), creatorAssignedToHimself))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Creator assigned to moderator, task by himself, in group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, creatorAssignedToModerator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "cherry",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        creatorAssignedToModerator = {
                            assignedBy: "cherry",
                            assignedTo: "durian",
                            status: "waiting",
                            taskId: taskId,
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)()), creatorAssignedToModerator))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Creator assigned to moderator, task by himself, in group (missing taskGroupId)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, creatorAssignedToModerator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "cherry",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        creatorAssignedToModerator = {
                            assignedBy: "cherry",
                            assignedTo: "durian",
                            status: "waiting",
                            taskId: taskId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)()), creatorAssignedToModerator))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Creator assigned to member, task by himself, in group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, creatorAssignedToMember;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "cherry",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        creatorAssignedToMember = {
                            assignedBy: "cherry",
                            assignedTo: "apple",
                            status: "waiting",
                            taskId: taskId,
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)()), creatorAssignedToMember))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Creator assigned to member, task by himself, in group (missing taskGroupId)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, creatorAssignedToMember;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "cherry",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        creatorAssignedToMember = {
                            assignedBy: "cherry",
                            assignedTo: "apple",
                            status: "waiting",
                            taskId: taskId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)()), creatorAssignedToMember))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Creator assigned to outsider, task by himself, in group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, creatorAssignedToOutsider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "cherry",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        creatorAssignedToOutsider = {
                            assignedBy: "cherry",
                            assignedTo: "banana",
                            status: "waiting",
                            taskId: taskId,
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)()), creatorAssignedToOutsider))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User assigned to himself, missing taskId", function () { return __awaiter(void 0, void 0, void 0, function () {
            var unauthAssignedTaskToOther;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        unauthAssignedTaskToOther = {
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)()), unauthAssignedTaskToOther))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Moderator assigned to himself, task by himself, in group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, moderatorAssignedToHimself;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        moderatorAssignedToHimself = {
                            assignedBy: "durian",
                            assignedTo: "durian",
                            status: "waiting",
                            taskId: taskId,
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_assign_1.taskAssignRef)()), moderatorAssignedToHimself))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Moderator assigned to himself, task by himself, in group (missing taskGroupId)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, moderatorAssignedToHimself;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        moderatorAssignedToHimself = {
                            assignedBy: "durian",
                            assignedTo: "durian",
                            status: "waiting",
                            taskId: taskId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_assign_1.taskAssignRef)()), moderatorAssignedToHimself))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Moderator assigned to moderator, task by himself, in group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, moderatorAssignedToModerator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian", "banana"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        moderatorAssignedToModerator = {
                            assignedBy: "durian",
                            assignedTo: "banana",
                            status: "waiting",
                            taskId: taskId,
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_assign_1.taskAssignRef)()), moderatorAssignedToModerator))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Moderator assigned to moderator, task by himself, in group (missing taskGroupId)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, moderatorAssignedToModerator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian", "banana"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        moderatorAssignedToModerator = {
                            assignedBy: "durian",
                            assignedTo: "banana",
                            status: "waiting",
                            taskId: taskId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_assign_1.taskAssignRef)()), moderatorAssignedToModerator))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Moderator assigned to member, task by himself, in group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, moderatorAssignedToModerator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        moderatorAssignedToModerator = {
                            assignedBy: "durian",
                            assignedTo: "apple",
                            status: "waiting",
                            taskId: taskId,
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_assign_1.taskAssignRef)()), moderatorAssignedToModerator))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Moderator assigned to member, task by himself, in group (missing taskGroupId)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, moderatorAssignedToModerator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        moderatorAssignedToModerator = {
                            assignedBy: "durian",
                            assignedTo: "apple",
                            status: "waiting",
                            taskId: taskId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_assign_1.taskAssignRef)()), moderatorAssignedToModerator))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Moderator assigned to outsider, task by himself, in group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, moderatorAssignedToOutsider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        moderatorAssignedToOutsider = {
                            assignedBy: "durian",
                            assignedTo: "banana",
                            status: "waiting",
                            taskId: taskId,
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_assign_1.taskAssignRef)()), moderatorAssignedToOutsider))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Member assigned to himself, task by himself, in group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, memberAssignedToHimself;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        memberAssignedToHimself = {
                            assignedBy: "apple",
                            assignedTo: "apple",
                            status: "waiting",
                            taskId: taskId,
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_assign_1.taskAssignRef)()), memberAssignedToHimself))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Member assigned to himself, task by himself, in group (missing taskGroupId)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, memberAssignedToHimself;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        memberAssignedToHimself = {
                            assignedBy: "apple",
                            assignedTo: "apple",
                            status: "waiting",
                            taskId: taskId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_assign_1.taskAssignRef)()), memberAssignedToHimself))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Member assigned to moderator, task by himself, in group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, memberAssignedToModerator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        memberAssignedToModerator = {
                            assignedBy: "apple",
                            assignedTo: "durian",
                            status: "waiting",
                            taskId: taskId,
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_assign_1.taskAssignRef)()), memberAssignedToModerator))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Member assigned to moderator, task by himself, in group (missing taskGroupId)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, memberAssignedToModerator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        memberAssignedToModerator = {
                            assignedBy: "apple",
                            assignedTo: "durian",
                            status: "waiting",
                            taskId: taskId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_assign_1.taskAssignRef)()), memberAssignedToModerator))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Member assigned to another member, task by himself, in group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, memberAssignedToModerator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple", "banana"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        memberAssignedToModerator = {
                            assignedBy: "apple",
                            assignedTo: "banana",
                            status: "waiting",
                            taskId: taskId,
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_assign_1.taskAssignRef)()), memberAssignedToModerator))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Member assigned to another member, task by himself, in group (missing taskGroupId)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, memberAssignedToModerator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple", "banana"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        memberAssignedToModerator = {
                            assignedBy: "apple",
                            assignedTo: "banana",
                            status: "waiting",
                            taskId: taskId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_assign_1.taskAssignRef)()), memberAssignedToModerator))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Member assigned to outsider, task by himself, in group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, memberAssignedToOutsider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        memberAssignedToOutsider = {
                            assignedBy: "apple",
                            assignedTo: "banana",
                            status: "waiting",
                            taskId: taskId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_assign_1.taskAssignRef)()), memberAssignedToOutsider))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Outsider assigned to himself, task in group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, outsiderAssignedToHimself;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        outsiderAssignedToHimself = {
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskId: taskId,
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)()), outsiderAssignedToHimself))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Outsider assigned to Creator, task in group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, outsiderAssignedToCreator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        outsiderAssignedToCreator = {
                            assignedBy: "banana",
                            assignedTo: "cherry",
                            status: "waiting",
                            taskId: taskId,
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)()), outsiderAssignedToCreator))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Outsider assigned to moderator, in group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, outsiderAssignedToModerator;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        outsiderAssignedToModerator = {
                            assignedBy: "banana",
                            assignedTo: "durian",
                            status: "waiting",
                            taskId: taskId,
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)()), outsiderAssignedToModerator))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Outsider assigned to another Outsider, task in group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, userCreateGroup, taskId, userCreatedTask, outsiderAssignedToOutsider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        userCreateGroup = {
                            moderatorUsers: ["durian"],
                            users: ["apple"],
                            creator: "cherry",
                            name: "Task Group 3",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), userCreateGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        userCreatedTask = {
                            title: "Beat the heat",
                            creator: "durian",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(durianDb, (0, task_1.taskRef)(taskId)), userCreatedTask)];
                    case 2:
                        _a.sent();
                        outsiderAssignedToOutsider = {
                            assignedBy: "banana",
                            assignedTo: "eggplant",
                            status: "waiting",
                            taskId: taskId,
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.setDoc)((0, firestore_1.doc)(appleDb, (0, task_assign_1.taskAssignRef)()), outsiderAssignedToOutsider))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); });
describe("Task Assign Update Test", function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        (0, mocha_1.before)(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, firestore_1.setLogLevel)("error");
                        return [4 /*yield*/, (0, rules_unit_testing_1.initializeTestEnvironment)({
                                projectId: PROJECT_ID,
                                firestore: {
                                    host: host,
                                    port: port,
                                    rules: (0, node_fs_1.readFileSync)("firestore.rules", "utf8"),
                                },
                            })];
                    case 1:
                        testEnv = _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testEnv.clearFirestore()];
                    case 1:
                        _a.sent();
                        unauthedDb = testEnv.unauthenticatedContext().firestore();
                        appleDb = testEnv.authenticatedContext("apple").firestore();
                        bananaDb = testEnv.authenticatedContext("banana").firestore();
                        cherryDb = testEnv.authenticatedContext("cherry").firestore();
                        durianDb = testEnv.authenticatedContext("durian").firestore();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User created and assigned task to himself, then updated the status", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open"
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 1:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 2:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created and assigned task to himself, then unauthed user updated the status", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open"
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 1:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 2:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(unauthedDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created and assigned task to himself, then unauthed user updated the status", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open"
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 1:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 2:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(unauthedDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created and assigned task to himself, then other user updated the status", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open"
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 1:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 2:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(appleDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created and assigned task to himself, then tried to update taskId", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open"
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 1:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 2:
                        _a.sent();
                        taskAssignUpdate = {
                            taskId: (0, task_1.randomTaskId)(),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created and assigned task to himself, then other user tried to update taskId", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open"
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 1:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 2:
                        _a.sent();
                        taskAssignUpdate = {
                            taskId: (0, task_1.randomTaskId)(),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(appleDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created and assigned task to himself, then unauthed user tried to update taskId", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open"
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 1:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 2:
                        _a.sent();
                        taskAssignUpdate = {
                            taskId: (0, task_1.randomTaskId)(),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(unauthedDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User created and assigned task to himself, then updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateApple, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateApple = {
                            users: ["banana"],
                            moderatorUsers: ["cherry"],
                            creator: "apple",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateApple)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created and assigned task to himself, then unauth updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateApple, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateApple = {
                            users: ["banana"],
                            moderatorUsers: ["cherry"],
                            creator: "apple",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateApple)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(unauthedDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created and assigned task to himself, then outsider updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateApple, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateApple = {
                            users: ["banana"],
                            moderatorUsers: ["cherry"],
                            creator: "apple",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateApple)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(durianDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User created and assigned task to himself, then creator updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateApple, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateApple = {
                            users: ["banana"],
                            moderatorUsers: ["cherry"],
                            creator: "apple",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateApple)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User created and assigned task to himself, then moderator updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateApple, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateApple = {
                            users: ["banana"],
                            moderatorUsers: ["cherry"],
                            creator: "apple",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateApple)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User created and assigned task to himself, then other member updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateApple, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateApple = {
                            users: ["banana"],
                            moderatorUsers: ["cherry", "durian"],
                            creator: "apple",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateApple)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(durianDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Moderator created and assigned task to himself, then updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateApple, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateApple = {
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                            creator: "apple",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateApple)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Moderator created and assigned task to himself, then unauth updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateApple, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateApple = {
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                            creator: "apple",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateApple)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(unauthedDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Moderator created and assigned task to himself, then outsider updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateApple, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateApple = {
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                            creator: "apple",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateApple)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(durianDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Moderator created and assigned task to himself, then creator updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateApple, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateApple = {
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                            creator: "apple",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateApple)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Moderator created and assigned task to himself, then other moderator updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateApple, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateApple = {
                            users: ["cherry"],
                            moderatorUsers: ["banana", "durian"],
                            creator: "apple",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateApple)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(durianDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Moderator created and assigned task to himself, then member updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateApple, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateApple = {
                            users: ["cherry"],
                            moderatorUsers: ["banana"],
                            creator: "apple",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateApple)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Creator created and assigned task to himself, then updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateBanana, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateBanana = {
                            users: ["cherry"],
                            moderatorUsers: ["apple"],
                            creator: "banana",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateBanana)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Creator created and assigned task to himself, then unauth updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateBanana, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateBanana = {
                            users: ["cherry"],
                            moderatorUsers: ["apple"],
                            creator: "banana",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateBanana)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(unauthedDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Creator created and assigned task to himself, then outsider updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateBanana, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateBanana = {
                            users: ["cherry"],
                            moderatorUsers: ["apple"],
                            creator: "banana",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateBanana)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(durianDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Creator created and assigned task to himself, then moderator updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateBanana, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateBanana = {
                            users: ["cherry"],
                            moderatorUsers: ["apple"],
                            creator: "banana",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateBanana)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(appleDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Creator created and assigned task to himself, then member updated the status (in group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateBanana, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateBanana = {
                            users: ["cherry"],
                            moderatorUsers: ["apple"],
                            creator: "banana",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateBanana)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        // Reassign
        it("[Fail] User created and assigned task to himself, then reassign to other user", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open"
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 1:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 2:
                        _a.sent();
                        taskAssignUpdate = {
                            assignedBy: "banana",
                            assignedTo: "apple",
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created and assigned task to himself, then unauth user reassign to other user", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open"
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 1:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 2:
                        _a.sent();
                        taskAssignUpdate = {
                            assignedBy: "banana",
                            assignedTo: "apple",
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(unauthedDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created and assigned task to himself, then other user reassign to other user", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open"
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 1:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 2:
                        _a.sent();
                        taskAssignUpdate = {
                            assignedBy: "apple",
                            assignedTo: "apple",
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(appleDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User created and assigned task to himself, then reassign to other member (in a group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateApple, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateApple = {
                            users: ["banana", "durian"],
                            moderatorUsers: ["cherry"],
                            creator: "apple",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateApple)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            assignedBy: "banana",
                            assignedTo: "durian",
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User created and assigned task to himself, then moderator reassign to other member (in a group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateApple, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateApple = {
                            users: ["banana"],
                            moderatorUsers: ["cherry"],
                            creator: "apple",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateApple)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            assignedBy: "cherry",
                            assignedTo: "apple",
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User created and assigned task to himself, then creator reassign to other member (in a group)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateApple, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateApple = {
                            users: ["banana"],
                            moderatorUsers: ["cherry"],
                            creator: "apple",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateApple)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            assignedBy: "cherry",
                            assignedTo: "apple",
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(cherryDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] User created and assigned task to himself, then reassign to other member (wrong assignedBy)", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupId, taskGroupCreateApple, taskId, taskCreateBanana, taskAssignId, taskAssignBanana, taskAssignUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroupCreateApple = {
                            users: ["banana", "durian"],
                            moderatorUsers: ["cherry"],
                            creator: "apple",
                            name: "Dancers Task Group",
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(taskGroupId)), taskGroupCreateApple)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 1:
                        _a.sent();
                        taskId = (0, task_1.randomTaskId)();
                        taskCreateBanana = {
                            title: "Create Task Test",
                            content: "Creating a task for testing",
                            creator: "banana",
                            status: "open",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_1.taskRef)(taskId)), taskCreateBanana)];
                    case 2:
                        _a.sent();
                        taskAssignId = (0, task_assign_1.randomAssignId)();
                        taskAssignBanana = {
                            taskId: taskId,
                            assignedBy: "banana",
                            assignedTo: "banana",
                            status: "waiting",
                            taskGroupId: taskGroupId,
                        };
                        return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignBanana)];
                    case 3:
                        _a.sent();
                        taskAssignUpdate = {
                            assignedBy: "cherry",
                            assignedTo: "durian",
                            status: "progress",
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_assign_1.taskAssignRef)(taskAssignId)), taskAssignUpdate))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); });
describe("Invitation/Joining Test", function () { return __awaiter(void 0, void 0, void 0, function () {
    var eggplantDb, flowerDb, guavaDb, kiwiDb, lemonDb, mangoDb, appleTaskGroupId;
    return __generator(this, function (_a) {
        (0, mocha_1.before)(function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, firestore_1.setLogLevel)("error");
                        return [4 /*yield*/, (0, rules_unit_testing_1.initializeTestEnvironment)({
                                projectId: PROJECT_ID,
                                firestore: {
                                    host: host,
                                    port: port,
                                    rules: (0, node_fs_1.readFileSync)("firestore.rules", "utf8"),
                                },
                            })];
                    case 1:
                        testEnv = _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        beforeEach(function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroup;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, testEnv.clearFirestore()];
                    case 1:
                        _a.sent();
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
                        appleTaskGroupId = (0, task_group_1.randomTaskGroupId)();
                        taskGroup = {
                            name: "Best Group for you to handle",
                            creator: "apple",
                            moderatorUsers: ["banana", "cherry"],
                            users: ["durian", "eggplant"],
                            invitedUsers: [],
                            rejectedUsers: [],
                        };
                        return [4 /*yield*/, testEnv.withSecurityRulesDisabled(function (context) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroup)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Creator invite user to group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupUpdate = {
                            invitedUsers: (0, firestore_1.arrayUnion)("flower"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroupUpdate))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] Moderator invite user to group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupUpdate = {
                            invitedUsers: (0, firestore_1.arrayUnion)("flower"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroupUpdate))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Member invite user to group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupUpdate = {
                            invitedUsers: (0, firestore_1.arrayUnion)("flower"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(durianDb, (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroupUpdate))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Outsider invite user to group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupUpdate = {
                            invitedUsers: (0, firestore_1.arrayUnion)("flower"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(guavaDb, (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroupUpdate))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user invite user to group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupUpdate = {
                            invitedUsers: (0, firestore_1.arrayUnion)("flower"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(unauthedDb, (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroupUpdate))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Outsider user invited himself to group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupUpdate = {
                            invitedUsers: (0, firestore_1.arrayUnion)("flower"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(flowerDb, (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroupUpdate))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Creator added member to group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupUpdate = {
                            users: (0, firestore_1.arrayUnion)("flower"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroupUpdate))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Moderator added member to group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupUpdate = {
                            users: (0, firestore_1.arrayUnion)("flower"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(bananaDb, (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroupUpdate))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Member added member to group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupUpdate = {
                            users: (0, firestore_1.arrayUnion)("flower"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(durianDb, (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroupUpdate))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Outsider added himself as member to group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupUpdate = {
                            users: (0, firestore_1.arrayUnion)("flower"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(flowerDb, (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroupUpdate))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Outsider added another as member to group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupUpdate = {
                            users: (0, firestore_1.arrayUnion)("guava"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(flowerDb, (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroupUpdate))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] Unauth user added member to group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupUpdate;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupUpdate = {
                            users: (0, firestore_1.arrayUnion)("guava"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(unauthedDb, (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroupUpdate))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Pass] User accepting invitation and adding as member to group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupUpdate, taskGroupFlowerAccept;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupUpdate = {
                            invitedUsers: (0, firestore_1.arrayUnion)("flower"),
                        };
                        (0, firestore_1.updateDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroupUpdate);
                        taskGroupFlowerAccept = {
                            users: (0, firestore_1.arrayUnion)("flower"),
                            invitedUsers: (0, firestore_1.arrayRemove)("flower"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.updateDoc)((0, firestore_1.doc)(flowerDb, (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroupFlowerAccept))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("[Fail] A different user accepting invitation and adding as member to group", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskGroupUpdate, taskGroupFlowerAccept;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskGroupUpdate = {
                            invitedUsers: (0, firestore_1.arrayUnion)("flower"),
                        };
                        (0, firestore_1.updateDoc)((0, firestore_1.doc)(appleDb, (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroupUpdate);
                        taskGroupFlowerAccept = {
                            users: (0, firestore_1.arrayUnion)("flower"),
                            invitedUsers: (0, firestore_1.arrayRemove)("flower"),
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.updateDoc)((0, firestore_1.doc)(guavaDb, (0, task_group_1.taskGroupRef)(appleTaskGroupId)), taskGroupFlowerAccept))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); });
