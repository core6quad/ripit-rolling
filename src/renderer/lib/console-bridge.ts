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

export function attachMainConsoleToRenderer(): void {
  console.log('[MAIN][Registered]');
  window['electron'].onConsoleLog((_event, level: string, args: any[]) => {
    if (console[level]) {
      console[level]('[MAIN]', ...args);
    } else {
      console.log('[MAIN]', ...args);
    }
  });
}
