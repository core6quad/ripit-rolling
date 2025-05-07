// export type TaskPayload = any;

// export interface TaskEvent {
// 	taskId: string;
// 	type: 'progress' | 'result' | 'error' | 'cancelled';
// 	payload: any;
// }

// // export interface TaskParams {
// //   taskId: string;
// //   payload: TaskPayload;
// //   signal: AbortSignal;
// //   emit: (event: TaskEvent) => void;
// // }

// export interface TaskParams {
// 	payload: TaskPayload;
// 	signal: AbortSignal;
// 	emit: EmitFn;
// }

// export type TaskHandler = (params: TaskParams) => Promise<void>;

// export interface RegisteredTask {
// 	type: string;
// 	handler: TaskHandler;
// 	cancellable?: boolean;
// }

// export interface EmitFn {
// 	(event: Omit<TaskEvent, 'taskId'>): void;
// }

// export type TaskInput = { type: string; payload: any };
