import { MediaFile } from "../../../shared/types/media-file";

/** Abstract store interface for queue data */
export abstract class QueueStore {
	abstract add(file: MediaFile.Data): Promise<void>;
	abstract remove(file: MediaFile.Data): Promise<void>;
	abstract getList(): Promise<MediaFile.Data[]>;
}