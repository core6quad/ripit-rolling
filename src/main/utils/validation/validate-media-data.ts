/**
 * validate-media-data.ts
 *
 * Validates and deeply clones unknown objects to ensure they match the MediaFile.Data structure,
 * including nested SourceFile and Track types.
 * Returns both valid entries and detailed error info for invalid ones.
 */

import { MediaFile } from '../../../shared/types/media-file';

export namespace MediaFileValidation {

	export type Result = {
		valid: MediaFile.Data[],
		invalid: Array<{
			error: string,
			record: unknown
		}>
	}

	/** Validate a list of unknown items and split into valid/invalid buckets */
	export function validateAndCloneMediaFiles(data: unknown): Result {
		const valid: MediaFile.Data[] = [];
		const invalid: Array<{ error: string; record: unknown }> = [];

		if (!Array.isArray(data)) {
			return {
				valid,
				invalid: [{ error: 'Input is not an array', record: data }]
			};
		}

		for (const record of data) {
			const result = validateData(record);
			if (typeof result === 'string') {
				invalid.push({ error: result, record });
			} else {
				valid.push(result);
			}
		}

		return { valid, invalid };
	}

	/** Validate and clone one MediaFile.Data entry */
	export function validateData(record: unknown): MediaFile.Data | string {
		if (typeof record !== 'object' || record === null) {
			return 'Record is not an object';
		}

		const obj = record as any;

		if (typeof obj.id !== 'string') return 'Missing or invalid "id"';
		if (typeof obj.fileName !== 'string') return 'Missing or invalid "fileName"';
		if (typeof obj.size !== 'number') return 'Missing or invalid "size"';
		if (typeof obj.created !== 'number') return 'Missing or invalid "created"';

		const source = validateSource(obj.source);
		if (typeof source === 'string') return `Invalid "source": ${source}`;

		return {
			id: obj.id,
			fileName: obj.fileName,
			size: obj.size,
			created: obj.created,
			source
		};
	}

	/** Validate and clone MediaFile.SourceFile */
	export function validateSource(sourceRecord: unknown): MediaFile.SourceFile | string {
		if (typeof sourceRecord !== 'object' || sourceRecord === null) {
			return 'Source is not an object';
		}

		const obj = sourceRecord as any;

		if (typeof obj.id !== 'string') return 'Missing "id"';
		if (typeof obj.title !== 'string') return 'Missing "title"';
		if (typeof obj.extractor !== 'string') return 'Missing "extractor"';
		if (typeof obj.webpageUrl !== 'string') return 'Missing "webpageUrl"';
		if (!Array.isArray(obj.tracks)) return 'Missing or invalid "tracks"';

		const tracks: MediaFile.Track[] = [];

		for (let i = 0; i < obj.tracks.length; i++) {
			const trackResult = validateTrack(obj.tracks[i]);
			if (typeof trackResult === 'string') {
				return `Invalid track at index ${i}: ${trackResult}`;
			}
			tracks.push(trackResult);
		}

		return {
			id: obj.id,
			title: obj.title,
			extractor: obj.extractor,
			webpageUrl: obj.webpageUrl,
			playlistId: typeof obj.playlistId === 'string' ? obj.playlistId : undefined,
			uploader: typeof obj.uploader === 'string' ? obj.uploader : undefined,
			uploadDate: typeof obj.uploadDate === 'string' ? obj.uploadDate : undefined,
			duration: typeof obj.duration === 'number' ? obj.duration : undefined,
			description: typeof obj.description === 'string' ? obj.description : undefined,
			thumbnail: typeof obj.thumbnail === 'string' ? obj.thumbnail : undefined,
			tags: Array.isArray(obj.tags) ? obj.tags.filter((t: any) => typeof t === 'string') : undefined,
			tracks
		};
	}

	/** Validate and clone MediaFile.Track */
	export function validateTrack(sourceTrack: unknown): MediaFile.Track | string {
		if (typeof sourceTrack !== 'object' || sourceTrack === null) {
			return 'Track is not an object';
		}

		const t = sourceTrack as any;

		if (typeof t.formatId !== 'string') return 'Missing "formatId"';
		if (typeof t.format !== 'string') return 'Missing "format"';
		if (typeof t.ext !== 'string') return 'Missing "ext"';
		if (typeof t.vcodec !== 'string') return 'Missing "vcodec"';
		if (typeof t.acodec !== 'string') return 'Missing "acodec"';
		if (typeof t.url !== 'string') return 'Missing "url"';
		if (typeof t.hasAudio !== 'boolean') return 'Missing "hasAudio"';
		if (typeof t.hasVideo !== 'boolean') return 'Missing "hasVideo"';

		return {
			formatId: t.formatId,
			format: t.format,
			ext: t.ext,
			vcodec: t.vcodec,
			acodec: t.acodec,
			url: t.url,
			hasAudio: t.hasAudio,
			hasVideo: t.hasVideo,
			width: typeof t.width === 'number' ? t.width : undefined,
			height: typeof t.height === 'number' ? t.height : undefined,
			fps: typeof t.fps === 'number' ? t.fps : undefined,
			tbr: typeof t.tbr === 'number' ? t.tbr : undefined,
			abr: typeof t.abr === 'number' ? t.abr : undefined,
			vbr: typeof t.vbr === 'number' ? t.vbr : undefined,
			asr: typeof t.asr === 'number' ? t.asr : undefined,
			filesize: typeof t.filesize === 'number' ? t.filesize : undefined,
		};
	}
}
