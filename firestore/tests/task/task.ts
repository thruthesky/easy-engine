export function taskCol(id?: string) {
    const task = '/task';
    if (id) {
        return `${task}/${id}`;
    }
    return task;
}


export type TaskCreate = {
    assignedUsers?: string[],
    title?: string,
    content?: string,
    status?: string,
    createdBy?: string,
}

