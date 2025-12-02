import { taskDefinitions } from "../data/tasks";


export function getAvailableTasks(totalCorrects: number) {
return taskDefinitions.map(task => ({
...task,
progress: Math.min(100, Math.floor((totalCorrects / task.required) * 100)),
isCompleted: totalCorrects >= task.required,
}));
}