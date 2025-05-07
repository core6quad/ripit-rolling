import { contextBridge, ipcRenderer } from 'electron';
import { ElectronBridge } from '../shared/types/electron-bridge';
import { MediaFile } from '../shared/types/media-file';
import { IPCConstantsInvoke, IPCConstantsOn } from '../shared/types/ipcConstants';
import { TaskEvent, TaskInput } from './lib/task-processor/model';


/**
 * Name under which the bridge will be exposed in the renderer context.
 */
export const RIPIT_BRIDGE_NAME = 'electronBridge';

/**
 * Maps IPC channels to their expected return types for invoke().
 * This ensures type safety when using ipcRenderer.invoke.
 */
export const rawInvokeMap = {
	CID_GET_SOURCE_INFO: {} as MediaFile.SourceFile | MediaFile.UrlInfo,
	CID_ADD_SOURCE: true,
	CID_GET_LIST: null,

	CID_RUN_TASK: '' as string,
	CID_ABORT_TASK: true,
} satisfies Record<IPCConstantsInvoke, unknown>;

/**
 * Internal type map for all `invoke` calls and their expected return values.
 */
export type IPCInvokeMap = typeof rawInvokeMap;

/**
 * Typed wrapper around ipcRenderer.invoke, for safer IPC communication.
 */
export type Invoke = <T extends keyof IPCInvokeMap>(
	channel: T,
	...args: any[]
) => Promise<IPCInvokeMap[T]>;

// Cast ipcRenderer.invoke to our typed Invoke function
const _invoke = ipcRenderer.invoke as Invoke;

/**
 * The actual implementation of the ElectronBridge, exposed to the renderer.
 * This defines all backend API calls that the UI can access.
 */
const bridge: ElectronBridge = {
	getSourceByUrl: (url) => _invoke('CID_GET_SOURCE_INFO', url),
	addSource: (source) => _invoke('CID_ADD_SOURCE', source),
	getList: () => _invoke('CID_GET_LIST'),

	runTask: (task: TaskInput) => _invoke('CID_RUN_TASK', task),
	abortTask: (taskId: string) => _invoke('CID_ABORT_TASK', taskId),

	// onTaskProcessorEvent: (callback: Function) => {
	// 	ipcRenderer.on('CID_ON_TASK_PROCESSOR_EVENT', (event, data) => {
	// 		console.log('[-|-][onTaskProcessorEvent]', event, data);
	// 		callback(data);  // передаем данные обратно в UI
	// 		console.log('[Preload] Task processor event:', payload);
	// 		(window as any).__taskProcessorPlugin?.handleEvent(payload);
	// 	});
	// },

	// offTaskProcessorEvent: () => {
	// 	ipcRenderer.removeAllListeners('CID_ON_TASK_PROCESSOR_EVENT');
	// }
	onEvent(callback: (payload: any) => void) {
    taskEventCallback = callback;
  },
};

// ipcRenderer.on('CID_ON_TASK_PROCESSOR_EVENT', (_event, payload) => {
// 	const uiSideProcessor = (window as any).__taskProcessorPlugin;
// 	console.log('[Preload] Task processor event:', { payload, uiSideProcessor });
// 	uiSideProcessor?.handleEvent(payload);
// })

// contextBridge.exposeInMainWorld('electron', {
//   onTaskProcessorEvent: (callback: Function) => {
//     ipcRenderer.on('CID_ON_TASK_PROCESSOR_EVENT', (event, data) => {
//       callback(data);  // передаем данные обратно в UI
//     });
//   },

//   offTaskProcessorEvent: () => {
//     ipcRenderer.removeAllListeners('CID_ON_TASK_PROCESSOR_EVENT');
//   }
// });

/**
 * Exposes the ElectronBridge API to the renderer under a fixed name.
 * The UI accesses this via `window.electronBridge`.
 */
contextBridge.exposeInMainWorld(RIPIT_BRIDGE_NAME, bridge);

/**
 * Optional: Listen to main process logs sent to renderer (e.g. for debugging).
 * Logs forwarded from main can be shown in browser console.
 */
ipcRenderer.on('CID_ON_CONSOLE_LOG', (event, level, args) => {
	if (console[level]) {
		console[level]('[Main*]', ...args);
	} else {
		console.log('[Main*]', ...args);
	}
});


let taskEventCallback: ((payload: any) => void) | null = null;

// contextBridge.exposeInMainWorld('taskProcessorEventBridge', {
//   /**
//    * Called from UI to register a listener
//    */
//   onEvent(callback: (payload: any) => void) {
//     taskEventCallback = callback;
//   },
// });

// Handle background event and forward to UI
ipcRenderer.on('CID_ON_TASK_PROCESSOR_EVENT', (_event, payload) => {
  // console.log('[Preload] Got task event:', payload);
  taskEventCallback?.(payload);
});

// ipcRenderer.on('CID_ON_TASK_PROCESSOR_EVENT', (event, taskEvent: TaskEvent) => {
// 	console.log('[Renderer][Task Event]', taskEvent);
// });

