"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskAssignCol = void 0;
exports.randomAssignId = randomAssignId;
exports.taskAssignRef = taskAssignRef;
function randomAssignId() { return Date.now().toString() + Math.ceil(Math.random() * 1000000); }
;
exports.taskAssignCol = '/task-assign';
function taskAssignRef(id) {
    if (id) {
        return "".concat(exports.taskAssignCol, "/").concat(id);
    }
    return "".concat(exports.taskAssignCol, "/").concat(randomAssignId());
}
