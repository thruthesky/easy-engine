
export const taskCol = '/task';

export function randomTaskId() { return Date.now().toString() + Math.ceil(Math.random() * 1000000); };

export function taskRef(id?: string) {
    if (id) {
        return `${taskCol}/${id}`;
    }
    return `${taskCol}/${randomTaskId()}`;
}

export type Task = {
    assignedUsers?: string[],
    title?: string,
    content?: string,
    status?: string,
    taskGroupId?: string,
    creator?: string,
}

