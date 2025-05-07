// src/main/preload.ts
import { contextBridge, ipcRenderer } from 'electron';
import { ElectronBridge } from '../shared/types/electron-bridge';
import { MediaFile } from '../shared/types/media-file';
import { IPCConstantsInvoke, IPCConstantsOn } from '../shared/types/ipcConstants';
import { TaskProc } from '../shared/types/task-processor';

/**
 * --------------------------------------------------------
 * Electron Preload Bridge
 * --------------------------------------------------------
 *
 * This module defines and exposes a secure, typed API (ElectronBridge)
 * that allows the renderer process to interact with the Electron main process
 * using IPC (inter-process communication) channels.
 *
 * Key Features:
 * - Uses Electron's `contextBridge` to safely expose a limited API to the renderer.
 * - Provides strong typing via shared types from `ElectronBridge` and `IPCConstantsInvoke`.
 * - Wraps `ipcRenderer.invoke()` calls with type-safe helper functions.
 * - Handles event forwarding from main to renderer (e.g., task events).
 * - Forwards logs from main process to the renderer console (for debugging).
 *
 * Global Access:
 * - The API is exposed to the renderer via `window.electronBridge`
 *   (defined by `RIPIT_BRIDGE_NAME` constant).
 *
 * Usage Example in Renderer:
 * ```ts
 * const result = await window.electronBridge.getList();
 * ```
 *
 * Note:
 * - This preload script must be declared in `webPreferences.preload`
 *   of your `BrowserWindow` config.
 *
 * Dependencies:
 * - electron (ipcRenderer, contextBridge)
 * - shared types (ElectronBridge, IPCConstantsInvoke, etc.)
 */


/**
 * The name under which the bridge API will be exposed in the renderer context.
 * Available globally as `window.electronBridge`.
 */
export const RIPIT_BRIDGE_NAME = 'electronBridge';

/**
 * Maps IPC channel names to their expected return types for `ipcRenderer.invoke()`.
 * This enables strong typing and autocompletion for IPC invocations.
 */
export const rawInvokeMap = {
	CID_GET_SOURCE_INFO: {} as MediaFile.SourceFile | MediaFile.UrlInfo,
	CID_ADD_SOURCE: true,
	CID_GET_LIST: null,

	CID_RUN_TASK: '' as string,
	CID_ABORT_TASK: true,
} satisfies Record<IPCConstantsInvoke, unknown>;

/**
 * Derived type map from `rawInvokeMap`, used for enforcing type safety in invoke calls.
 */
export type IPCInvokeMap = typeof rawInvokeMap;

/**
 * Type-safe wrapper around `ipcRenderer.invoke()` for IPC calls from renderer to main.
 */
export type Invoke = <T extends keyof IPCInvokeMap>(
	channel: T,
	...args: any[]
) => Promise<IPCInvokeMap[T]>;

// Cast the ipcRenderer.invoke function to the typed interface
const _invoke = ipcRenderer.invoke as Invoke;

/**
 * Implements the ElectronBridge contract and provides access to main process functions.
 * Exposed to the renderer through the preload script via `contextBridge`.
 */
const bridge: ElectronBridge = {
	getSourceByUrl: (url) => _invoke('CID_GET_SOURCE_INFO', url),
	addSource: (source) => _invoke('CID_ADD_SOURCE', source),
	getList: () => _invoke('CID_GET_LIST'),

	runTask: (task: TaskProc.Input) => _invoke('CID_RUN_TASK', task),
	abortTask: (taskId: string) => _invoke('CID_ABORT_TASK', taskId),

	onEvent(callback: (payload: any) => void) {
		taskEventCallback = callback;
	},
};

// Expose the bridge object to the renderer process under a fixed global name
contextBridge.exposeInMainWorld(RIPIT_BRIDGE_NAME, bridge);

/**
 * Optional: Listen for log messages sent from the main process and print them in the renderer's console.
 * Helps with debugging main process behavior from the renderer side.
 */
ipcRenderer.on('CID_ON_CONSOLE_LOG', (event, level, args) => {
	if (console[level]) {
		console[level]('[Main*]', ...args);
	} else {
		console.log('[Main*]', ...args);
	}
});

// Internal callback handler for task processor events
let taskEventCallback: ((payload: any) => void) | null = null;

/**
 * Listens to task processor events sent from the main process and forwards them to the registered UI callback.
 */
ipcRenderer.on('CID_ON_TASK_PROCESSOR_EVENT', (_event, payload) => {
	taskEventCallback?.(payload);
});
