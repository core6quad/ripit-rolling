import { MediaFile } from "../../../shared/types/media-file";

/** Abstract store interface for queue data */
export abstract class QueueStore {
	abstract add(file: MediaFile.Data): Promise<boolean>;
	// abstract remove(file: MediaFile.Data): Promise<void>;
	abstract removeFiles(ids: string[]): Promise<void>
	abstract getList(): Promise<MediaFile.Data[]>;
	abstract handleAll(): Promise<void>;
	abstract init(): Promise<void>;
}