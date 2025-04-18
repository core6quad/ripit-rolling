import { contextBridge, ipcRenderer } from "electron";

// Expose limited API to the renderer process

contextBridge.exposeInMainWorld("electron", {
  // Method for invoking the main process via IPC
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
});
