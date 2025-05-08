import * as fs from 'fs/promises';
import * as path from 'path';
import { MediaFile } from '../../../shared/types/media-file';
import { runCommand } from '../../utils/exec';

/**
 * Build the expected yt-dlp output file name based on track ID.
 */
function buildDownloadedFilename(baseId: string, formatId: string): string {
	return `${baseId}-${formatId}`;
}

/**
 * Generate yt-dlp download command for selected tracks.
 */
export function buildYtDlpCommand(
	data: MediaFile.Data,
	tmpDir: string
): string[] {
	const formatSelector = data.trackIds.join('+');
	const output = path.join(tmpDir, `${buildDownloadedFilename(data.source.id, '%(format_id)s')}.%(ext)s`);
	return [
		`${data.source.extractor}:${data.source.id}`,
		'-f', formatSelector,
		'--no-merge-output-format',
		'-o', output
	];
}

/**
 * Build ffmpeg command based on downloaded files and original track metadata.
 */
export function buildFfmpegCommand(
	data: MediaFile.Data,
	downloadedPaths: string[],
	outPath: string
): string[] {
	const mapArgs: string[] = [];
	const metaArgs: string[] = [];
	let inputArgs: string[] = [];

	downloadedPaths.forEach((filePath, index) => {
		const trackId = data.trackIds[index].formatId;
		const trackMeta = data.source.tracks.find(t => t.formatId === trackId);
		if (!trackMeta) throw new Error(`Missing metadata for trackId=${trackId}`);

		inputArgs.push('-i', filePath);
		if (trackMeta.hasVideo) mapArgs.push(`-map ${index}:v`);
		if (trackMeta.hasAudio) mapArgs.push(`-map ${index}:a`);
		if (!trackMeta.hasVideo && !trackMeta.hasAudio) mapArgs.push(`-map ${index}:s`);

		const streamType = trackMeta.hasVideo
			? 'v'
			: trackMeta.hasAudio
				? 'a'
				: 's';
		const label = trackMeta.format || 'Track';

		if (streamType === 'a') {
			metaArgs.push(`-metadata:s:a:${index} language=eng`);
			metaArgs.push(`-metadata:s:a:${index} title="${label}"`);
		}
		if (streamType === 's') {
			metaArgs.push(`-metadata:s:s:${index} language=eng`);
			metaArgs.push(`-metadata:s:s:${index} title="${label}"`);
		}
	});

	return [
		...inputArgs,
		...mapArgs.flatMap(s => s.split(' ')),
		...metaArgs.flatMap(s => s.split(' ')),
		'-c:v', 'copy',
		'-c:a', 'copy',
		'-c:s', 'mov_text',
		outPath
	];
}

/**
 * Find all downloaded files based on yt-dlp naming.
 */
async function findDownloadedFiles(
	tmpDir: string,
	data: MediaFile.Data
): Promise<string[]> {
	const files = await fs.readdir(tmpDir);
	return data.trackIds.map(trackId => {
		const prefix = buildDownloadedFilename(data.source.id, trackId.formatId);
		const match = files.find(f => f.startsWith(prefix));
		if (!match) throw new Error(`Track ${trackId} not found in ${tmpDir}`);
		return path.join(tmpDir, match);
	});
}

/**
 * Cleanup temporary files related to a specific media ID.
 */
async function cleanupTempFiles(tmpDir: string, id: string): Promise<void> {
	const files = await fs.readdir(tmpDir);
	const targets = files.filter(f => f.startsWith(id));
	for (const file of targets) {
		try {
			await fs.unlink(path.join(tmpDir, file));
		} catch (err) {
			console.warn(`Failed to delete ${file}:`, err);
		}
	}
}

/**
 * Downloads selected tracks using yt-dlp, merges them via ffmpeg with metadata.
 */
export async function downloadAndMergeTracks(
	data: MediaFile.Data,
	tmpDir: string,
	outDir: string
): Promise<void> {
	const ytArgs = buildYtDlpCommand(data, tmpDir);
	const outputPath = path.join(outDir, `${data.id}.mp4`);

	try {
		console.log(`Downloading: ${data.trackIds.join(', ')}`);
		await runCommand('yt-dlp', ytArgs, tmpDir);

		const downloaded = await findDownloadedFiles(tmpDir, data);
		const ffArgs = buildFfmpegCommand(data, downloaded, outputPath);

		console.log(`Merging with ffmpeg → ${outputPath}`);
		await runCommand('ffmpeg', ffArgs, tmpDir);

		console.log(`Done: ${outputPath}`);
	} catch (err) {
		console.error(`Error:`, err);
		await cleanupTempFiles(tmpDir, data.source.id);
		throw err;
	}

	await cleanupTempFiles(tmpDir, data.source.id);
}
