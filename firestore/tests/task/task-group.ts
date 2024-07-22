import { FieldValue } from "firebase/firestore";

export const taskGroupCol = '/task-group';

export function randomTaskGroupId() { return Date.now().toString() + Math.ceil(Math.random() * 1000000); };

export function taskGroupRef(id?: string) {
    if (id) {
        return `${taskGroupCol}/${id}`;
    }
    return `${taskGroupCol}/${randomTaskGroupId()}`;
}

export type TaskGroup = {
    moderatorUsers?: string[] | FieldValue,
    users?: string[] | FieldValue,
    invitedUsers?: string[] | FieldValue,
    rejectedUsers?: string[] | FieldValue,
    name?: string,
    creator?: string,
}

