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
/****** SETUP ********/
var PROJECT_ID = 'withcenter-test-3'; // Set your firebase project ID here
var host = '127.0.0.1'; // Don't user "localhost" unless you have a reasion.
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
describe('Rules Test', function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                    rules: (0, node_fs_1.readFileSync)('firestore.rules', 'utf8')
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
                                        case 0: return [4 /*yield*/, (0, firestore_1.setDoc)((0, firestore_1.doc)(context.firestore(), 'users/apple'), { name: 'apple', no: 1 })];
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
                        appleDb = testEnv.authenticatedContext('apple').firestore();
                        bananaDb = testEnv.authenticatedContext('banana').firestore();
                        cherryDb = testEnv.authenticatedContext('cherry').firestore();
                        durianDb = testEnv.authenticatedContext('durian').firestore();
                        return [2 /*return*/];
                }
            });
        }); });
        it("User must be signed in to read a task", function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.getDoc)((0, firestore_1.doc)(unauthedDb, '/tasks/task1')))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.getDoc)((0, firestore_1.doc)(unauthedDb, '/task/task1')))];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.getDoc)((0, firestore_1.doc)(appleDb, '/tasks/task1')))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("User must be signed in to create a task", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskCreateUnAuth, taskCreateApple;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskCreateUnAuth = {
                            title: 'Create Task Test',
                            content: 'Creating a task for testing',
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.addDoc)(unauthedDb.collection((0, task_1.taskCol)()), taskCreateUnAuth))];
                    case 1:
                        _a.sent();
                        taskCreateApple = {
                            title: 'Create Task Test',
                            content: 'Creating a task for testing',
                            createdBy: 'apple',
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.addDoc)(appleDb.collection((0, task_1.taskCol)()), taskCreateApple))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("User must the creator of the created task", function () { return __awaiter(void 0, void 0, void 0, function () {
            var taskCreateUnauthWithCreatedBy, taskCreateAuthWithDifferentUid, taskCreateBanana;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        taskCreateUnauthWithCreatedBy = {
                            title: 'Create Task Test',
                            content: 'Creating a task for testing',
                            createdBy: 'apple',
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.addDoc)(unauthedDb.collection((0, task_1.taskCol)()), taskCreateUnauthWithCreatedBy))];
                    case 1:
                        _a.sent();
                        taskCreateAuthWithDifferentUid = {
                            title: 'Create Task Test',
                            content: 'Creating a task for testing',
                            createdBy: 'IAmNotApple',
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertFails)((0, firestore_1.addDoc)(appleDb.collection((0, task_1.taskCol)()), taskCreateAuthWithDifferentUid))];
                    case 2:
                        _a.sent();
                        taskCreateBanana = {
                            title: 'Create Task Test',
                            content: 'Creating a task for testing',
                            createdBy: 'banana',
                        };
                        return [4 /*yield*/, (0, rules_unit_testing_1.assertSucceeds)((0, firestore_1.addDoc)(bananaDb.collection((0, task_1.taskCol)()), taskCreateBanana))];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        return [2 /*return*/];
    });
}); });
