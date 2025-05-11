import { MediaFile } from "../../shared/types/media-file";

import { v4 as uuidv4 } from 'uuid';
import { cloneDeep } from 'lodash-es';
import { YDU } from "./constants";

export function createMediaFile(
	fileName: string,
	trackIds: Array<MediaFile.Track>,
	source: MediaFile.SourceFile | null
): MediaFile.Data {
	const id = uuidv4();

	if (!source) {
		throw new Error('Cannot create MediaFile.Data, not null source is expected');
	}

	return {
		id,
		version: YDU.DATA_CURRENT_FORMAT_VERSION,
		fileName,
		status: 'Added',
		trackIds: cloneDeep(trackIds),
		size: 0,
		created: 0, // created media file
		source: cloneDeep(source),
	}
}