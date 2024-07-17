export function taskGroupCol(id?: string) {
    const taskGroup = '/task-group';
    if (id) {
        return `${taskGroup}/${id}`;
    }
    return taskGroup;
}

export type TaskGroupCreate = {
    assignedUsers?: string[],
    title?: string,
    content?: string,
    createdBy?: string,
    status?: string,
}

