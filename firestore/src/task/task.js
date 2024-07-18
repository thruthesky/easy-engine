"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskCol = void 0;
exports.randomTaskId = randomTaskId;
exports.taskRef = taskRef;
exports.taskCol = '/task';
function randomTaskId() { return Date.now().toString() + Math.ceil(Math.random() * 1000000); }
;
function taskRef(id) {
    if (id) {
        return "".concat(exports.taskCol, "/").concat(id);
    }
    return "".concat(exports.taskCol, "/").concat(randomTaskId());
}
