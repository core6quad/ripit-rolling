export namespace TaskProc {
	export type Payload = any;

	export interface Event {
		taskId: string;
		type: 'progress' | 'result' | 'error' | 'cancelled';
		payload: any;
	}

	export interface Params {
		payload: Payload;
		signal: AbortSignal;
		emit: EmitFn;
	}

	export type Handler = (params: Params) => Promise<void>;

	export interface RegisteredTask {
		type: string;
		handler: Handler;
		cancellable?: boolean;
	}

	export interface EmitFn {
		(event: Omit<Event, 'taskId'>): void;
	}

	export type Input = { type: string; payload: any };
}