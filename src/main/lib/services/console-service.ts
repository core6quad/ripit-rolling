/**
 * ConsoleService
 * 
 * This service intercepts all console output (log, warn, error) in the Electron main process
 * and forwards it to the renderer process via IPC, so that logs from the main process
 * can be displayed in the renderer (e.g., in a DevTools console panel).
 * 
 * Usage:
 * 
 * new ConsoleService(() => mainWindow);
 * 
 * Requirements:
 * - The renderer must listen for 'console-log' events via ipcRenderer
 * - Only the main process sends logs to the renderer (no reverse direction)
 * 
 * * Performance Note:
 * 
 * The overhead of this service is minimal in typical use cases.
 * It adds a small cost due to intercepting console methods and sending logs to the renderer via IPC.
 * For high-frequency logging (e.g. thousands of logs per second), some impact on CPU and memory may be observed,
 * mostly due to argument serialization and IPC throughput.
 * 
 * Recommended for development/debug builds. For production, consider throttling or disabling if needed.
 */

import { ipcMain, BrowserWindow } from 'electron';

export class ConsoleService {
  constructor(private getWindow: () => BrowserWindow | null) {
    this.setup();
  }

  private setup() {
    const original = {
      log: console.log,
      warn: console.warn,
      error: console.error,
    };

    // Intercept each console method
    for (const level of Object.keys(original) as (keyof typeof original)[]) {
      console[level] = (...args: any[]) => {
        original[level](...args); // Keep native terminal output

        const win = this.getWindow();
        if (win && win.webContents) {
          // Send log to renderer via IPC
          win.webContents.send('CID_ON_CONSOLE_LOG', level, args);
        }
      };
    }
  }
}
