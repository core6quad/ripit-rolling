import { TaskInput } from "../../main/lib/task-processor/model";
import { MediaFile } from "./media-file";

/**
 * ElectronBridge interface defines the available methods that can be called
 * from the renderer process using IPC. This helps ensure type safety
 * across all interactions between the renderer and main process.
 */
export interface ElectronBridge {
	/**
	 * Analyze the media source (e.g., YouTube URL) and return either
	 * detailed metadata or summary info if it's a playlist.
	 */
	getSourceByUrl(url: string): Promise<MediaFile.SourceFile | MediaFile.UrlInfo>;

	/**
	 * Add a media source to the persistent store (e.g. DB or file list).
	 */
	addSource(source: MediaFile.Data): Promise<boolean>;

	/**
	 * Fetch the list of all saved media entries.
	 */
	getList(): Promise<Array<MediaFile.Data>>;

	/**
	 * Run a registered background task by name and payload.
	 * Returns a unique taskId for tracking.
	 */
	runTask(task: TaskInput): Promise<string>;

	/**
	 * Abort a running task by taskId (if it is cancellable).
	 */
	abortTask(taskId: string): Promise<boolean>;

	// onTaskProcessorEvent: (callback: Function) => void,
	// offTaskProcessorEvent: () => void,
	
	onEvent(callback: (payload: any) => void);
}

/**
 * Utility to validate that the bridge object implements all required methods.
 * Useful for runtime verification of preload-injected bridges in the renderer.
 */
export function validateElectronBridge(bridge: ElectronBridge): boolean {
	const methods: (keyof ElectronBridge)[] = Object.keys(bridge) as (keyof ElectronBridge)[];

	console.log('[Bridge][Check] methods =', methods.join(', '));

	return methods.every((method) => typeof bridge[method] === 'function');
}
