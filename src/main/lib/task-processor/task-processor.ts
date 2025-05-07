import { EmitFn, TaskEvent, TaskHandler, TaskInput, TaskPayload } from "./model";
import { v4 as uuidv4 } from 'uuid';

export class TaskProcessor {
	private handlers = new Map<string, TaskHandler>();
	private activeControllers = new Map<string, AbortController>();
	private emitRaw: (event: TaskEvent) => void;

	constructor(emitFn: (event: TaskEvent) => void) {
		this.emitRaw = emitFn;
	}

	register(type: string, handler: TaskHandler) {
		if (this.handlers.has(type)) {
			throw new Error(`Handler for type "${type}" already registered`);
		}
		this.handlers.set(type, handler);
	}

	// run(type: string, payload: TaskPayload): string {
	run(task: TaskInput): string {
		const { type, payload } = task;
		const taskId = uuidv4();
		const handler = this.handlers.get(type);
		if (!handler) throw new Error(`No handler registered for type "${type}"`);

		const controller = new AbortController();
		this.activeControllers.set(taskId, controller);

		// Wrapped emit that injects taskId automatically
		const emit: EmitFn = (event) => {
			this.emitRaw({ ...event, taskId });
		};

		handler({ payload, signal: controller.signal, emit })
			.then(() => this.activeControllers.delete(taskId))
			.catch((err) => {
				const isAborted = controller.signal.aborted;
				emit({ type: isAborted ? 'cancelled' : 'error', payload: isAborted ? null : (err.message || String(err)) });
				this.activeControllers.delete(taskId);
			});

		return taskId;
	}

	abort(taskId: string) {
		const ctrl = this.activeControllers.get(taskId);
		if (ctrl) {
			ctrl.abort();
			this.activeControllers.delete(taskId);
		}
	}
}
