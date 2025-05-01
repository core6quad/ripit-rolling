import { MediaFile } from "./media-file";

/**
 * ElectronBridge interface defines the available methods that can be called
 * from the renderer process using IPC. This helps in ensuring type safety
 * across all interactions between the renderer and main process.
 */
export interface ElectronBridge {
  getSourceByUrl(url: string): Promise<MediaFile.SourceFile | MediaFile.SourcePlaylist>;
  addSource(source: MediaFile.SourceFile): Promise<boolean>; // Replace 'any' with proper return type
  getList(): Promise<Array<MediaFile.SourceFile>>;
  // onConsoleLog(listener): void;
  // send: (channel: string, ...args: any[]) => any;
}
