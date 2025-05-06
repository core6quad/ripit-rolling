import { MediaFile } from "./media-file";

/**
 * ElectronBridge interface defines the available methods that can be called
 * from the renderer process using IPC. This helps in ensuring type safety
 * across all interactions between the renderer and main process.
 */
export interface ElectronBridge {
  getSourceByUrl(url: string): Promise<MediaFile.SourceFile | MediaFile.UrlInfo>;
  addSource(source: MediaFile.Data): Promise<boolean>; // Replace 'any' with proper return type
  getList(): Promise<Array<MediaFile.Data>>;
  // onConsoleLog(listener): void;
  // send: (channel: string, ...args: any[]) => any;
}

export function validateElectronBridge(bridge: ElectronBridge): boolean {
  const methods: (keyof ElectronBridge)[] = Object.keys(bridge) as (keyof ElectronBridge)[];

  // Check that all methods from the interface exist and are functions
  console.log('[Bridge][Check] methods= ', methods?.join(', '))
  return methods.every(method => typeof bridge[method] === 'function');
}