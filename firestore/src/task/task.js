"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskCol = taskCol;
function taskCol(id) {
    var task = '/task';
    if (id) {
        return "".concat(task, "/").concat(id);
    }
    return task;
}
