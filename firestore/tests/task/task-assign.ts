export function randomAssignId() { return Date.now().toString() + Math.ceil(Math.random() * 1000000); };

export const taskAssignCol = '/task-assign';

export function taskAssignRef(id?: string) {
    if (id) {
        return `${taskAssignCol}/${id}`;
    }
    return `${taskAssignCol}/${randomAssignId()}`;
}

export type TaskAssign = {
    assignedTo?: string,
    taskGroupId?: string,
    assignedBy?: string,
    taskId?: string,
    status?: string,
}
