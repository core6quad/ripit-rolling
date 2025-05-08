import mitt, { Emitter } from 'mitt';
import { App, inject } from 'vue';
import { RIPIT_BRIDGE_NAME } from '../../shared/types/ipcConstants';

type TaskProcessorEvents = {
	progress: any;
	result: any;
	error: any;
	cancelled: any;
};

const emitter: Emitter<TaskProcessorEvents> = mitt();

export const TaskProcessorPlugin = {
	install(app: App) {
		// Expose globally
		app.provide('taskProcessor', emitter);

		// Listen from preload bridge
		window[RIPIT_BRIDGE_NAME]?.onEvent((payload: any) => {
			console.log(`[TaskPlugin][Income] id=${payload.taskId ? '...' +payload.taskId.slice(-5) : 'none'}`, { payload, type: payload.type });
			emitter.emit(payload.type, payload);
		});
	},
};

export function useTaskProcessor() {
	return inject<Emitter<TaskProcessorEvents>>('taskProcessor')!;
}
