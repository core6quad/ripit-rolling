import { execFile } from 'child_process';
import { promisify } from 'util';
import { MediaFile } from '../../../shared/types/media-file';
import { SourceFileSchema } from '../../utils/validation/media-schemas.zod';
import { YDBMappers } from './mappers';

const execFileAsync = promisify(execFile);

const MAX_BUFFER_SIZE = 3 * 1024 * 1024; // 3 MB

/**
 * Extracts lightweight information about a media URL (playlist or single video)
 * using yt-dlp with `--flat-playlist` and `--dump-single-json` for fast detection.
 *
 * @param url - The media URL to check.
 * @returns A `MediaFile.UrlInfo` object with type, count, and optional metadata.
 */
export async function getPlaylistInfo(ytDlpPath: string, url: string): Promise<MediaFile.UrlInfo> {
	try {
		const { stdout } = await execFileAsync(ytDlpPath, [
			'--dump-single-json',
			'--flat-playlist',
			url,
		]);

		const data = JSON.parse(stdout);
		const info: MediaFile.UrlInfo = YDBMappers.mapToUrlInfo(data);

		return info;
	} catch (error: any) {
		return {
			type: 'error',
			count: 0,
			error: error.message || String(error),
		};
	}
}

/**
 * Parses detailed media metadata from yt-dlp for a given URL.
 * - Returns `MediaFile.SourceFile` for a single video.
 * - Returns `MediaFile.UrlInfo` if the URL is a playlist, multi-video, or in error.
 *
 * @param ytDlpPath - Path to the yt-dlp binary
 * @param url - Media URL to analyze
 * @returns A promise resolving to `SourceFile` or `UrlInfo`
 */
export async function getFileInfoFromYtDlp(
	ytDlpPath: string,
	url: string
): Promise<MediaFile.SourceFile | MediaFile.UrlInfo> {
	try {
		// Step 1: Get lightweight playlist or video info
		const playlistInfo = await getPlaylistInfo(ytDlpPath, url);

		console.log('[Parser] UrlInfo=', playlistInfo)

		// If it's a playlist or multiple videos, return UrlInfo
		if (playlistInfo.type !== 'video') {
			return playlistInfo;
		}

		// Step 2: If it's a single video, get detailed video info
		const { stdout } = await execFileAsync(ytDlpPath, ['--dump-single-json', url], {
			maxBuffer: MAX_BUFFER_SIZE,
		});

		const json = JSON.parse(stdout);
		console.log('[Parser] Source=', json)

		// Map to SourceFile and validate using Zod schema
		const sourceFile: MediaFile.SourceFile = YDBMappers.mapToSourceFile(json);
		// if (playlistInfo?.channelId) {
		// 	sourceFile.channelId = playlistInfo.channelId;
		// }
		console.log('[Parser] sourceFile=', sourceFile);

		const validationResult = SourceFileSchema.safeParse(sourceFile);
		console.log('[Parser] validationResult=', validationResult);
		if (!validationResult.success) {
			const validationErrors = validationResult.error.issues.map(
				(issue) => `${issue.path.join('.')}: ${issue.message}`
			).join('; ');
			throw new Error(`SourceFile validation failed: ${validationErrors}`);
		}

		return validationResult.data as MediaFile.SourceFile;
	} catch (error: any) {
		return {
			type: 'error',
			count: 0,
			error: error.message || String(error),
		};
	}
}

