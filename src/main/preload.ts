// import { contextBridge, ipcRenderer } from "electron";

// // Expose limited API to the renderer process

// contextBridge.exposeInMainWorld("electron", {
//   // Method for invoking the main process via IPC
//   invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
// });

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld("electron", {
  // Invokes a method in the main process through IPC
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),

  // You can also expose other safe methods, e.g., send messages to main process
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),

  // Example method to check if a file exists (assuming a custom 'file-check' IPC channel)
  fileExists: (filePath: string) => ipcRenderer.invoke('file-check', filePath),
  onConsoleLog: (callback) => {
    ipcRenderer.on('console-log', callback);
  },

});