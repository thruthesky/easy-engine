"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskGroupCol = void 0;
exports.randomTaskGroupId = randomTaskGroupId;
exports.taskGroupRef = taskGroupRef;
exports.taskGroupCol = '/task-group';
function randomTaskGroupId() { return Date.now().toString() + Math.ceil(Math.random() * 1000000); }
;
function taskGroupRef(id) {
    if (id) {
        return "".concat(exports.taskGroupCol, "/").concat(id);
    }
    return "".concat(exports.taskGroupCol, "/").concat(randomTaskGroupId());
}
