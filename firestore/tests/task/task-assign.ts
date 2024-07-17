export function taskAssignCol(id?: string) {
    const taskAssign = '/task-assign';
    if (id) {
        return `${taskAssign}/${id}`;
    }
    return taskAssign;
}