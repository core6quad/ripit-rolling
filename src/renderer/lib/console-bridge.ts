/**
 * consoleBridge.ts
 * 
 * Listens for log messages sent from the Electron main process via IPC
 * and forwards them to the renderer's console (DevTools).
 * 
 * This allows logs from the main process to appear in the browser console,
 * helping with debugging and unified log visibility during development.
 * 
 * Usage:
 * 
 * window.onload = () => {
 * 	attachMainConsoleToRenderer();
 * };
 * 
 */

import { useElectronBridge } from "../plugins/electron-bridge";
import { RIPIT_BRIDGE_NAME } from '../../shared/types/ipcConstants';

export function attachMainConsoleToRenderer(): void {
	const bridge = useElectronBridge();
	console.log('[MAIN][Registered], is bridge present=', !!bridge);

	window[RIPIT_BRIDGE_NAME].onConsoleLog((_event, level: string, args: any[]) => {
    if (console[level]) {
      console[level]('[MAIN]', ...args);
    } else {
      console.log('[MAIN]', ...args);
    }
  });
	
	// return await bridge.addSource(source);
	// window['electron'].onConsoleLog((_event, level: string, args: any[]) => {

	// const listener = (_event, level: string, args: any[]) => {
	//   if (console[level]) {
	//     console[level]('[MAIN]', ...args);
	//   } else {
	//     console.log('[MAIN]', ...args);
	//   }
	// };

	// const listener = (event: Electron.IpcRendererEvent, level: string, args: any[]) => {
	// 	if (console[level]) {
	// 		console[level]('[MAIN]', ...args);
	// 	} else {
	// 		console.log('[MAIN]', ...args);
	// 	}
	// };

	// bridge.onConsoleLog(listener);

	// onMounted(() => {
	// 	ipcRenderer.on('CID_ON_CONSOLE_LOG', (event, level, args) => {
	// 		// Используем соответствующий метод console для вывода логов
	// 		if (console[level]) {
	// 			console[level]('[Renderer]', ...args);
	// 		} else {
	// 			console.log('[Renderer]', ...args);
	// 		}
	// 	});
	// });
	// onMounted(() => {
	// 	nextTick(() => {
	// 		bridge.onConsoleLog((level: string, args: any[]) => {
	// 			if (console[level]) {
	// 				console[level]('[Renderer]', ...args);
	// 			} else {
	// 				console.log('[Renderer]', ...args);
	// 			}
	// 		});
	// 	});
	// });
}
