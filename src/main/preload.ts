import { contextBridge, ipcRenderer } from 'electron';
import { ElectronBridge } from '../shared/types/electron-bridge';
import { MediaFile } from '../shared/types/media-file';
import { IPCConstantsInvoke, IPCConstantsOn } from '../shared/types/ipcConstants';

// you cannot export from both subsystems - just copy here
export const RIPIT_BRIDGE_NAME = 'electronBridge';

export const rawInvokeMap = {
	CID_GET_SOURCE_INFO: {} as MediaFile.SourceFile | MediaFile.UrlInfo,
	CID_ADD_SOURCE: true,
	CID_GET_LIST: null,
} satisfies Record<IPCConstantsInvoke, unknown>;

export type IPCInvokeMap = typeof rawInvokeMap;

/**
 * Generic type for ipcRenderer.invoke with typed return values per channel.
 */
export type Invoke = <T extends keyof IPCInvokeMap>(
	channel: T,
	...args: any[]
) => Promise<IPCInvokeMap[T]>;

const _invoke = ipcRenderer.invoke as Invoke;

/**
 * Maps IPC event names to their listener callback signatures.
 * Used to strongly type ipcRenderer.on calls.
 */
// export const rawOnMap = {
// 	CID_ON_CONSOLE_LOG: null,
// } satisfies Record<IPCConstantsOn, unknown>;

// export type IPCOnMap = typeof rawOnMap;

/**
 * Generic type for ipcRenderer.on with typed listener functions.
 */
// export type On = <T extends keyof IPCOnMap>(
// 	channel: T,
// 	listener: IPCOnMap[T]
// ) => void;

// const _on = ipcRenderer.on as On;

const bridge: ElectronBridge = {
	getSourceByUrl: (url) => _invoke('CID_GET_SOURCE_INFO', url),
	addSource: (source) => _invoke('CID_ADD_SOURCE', source),
	getList: () => _invoke('CID_GET_LIST'),
	// send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
};

contextBridge.exposeInMainWorld(RIPIT_BRIDGE_NAME, bridge);

ipcRenderer.on('CID_ON_CONSOLE_LOG', (event, level, args) => {
	if (console[level]) {
		console[level]('[Renderer]', ...args);
	} else {
		console.log('[Renderer]', ...args);
	}
});
