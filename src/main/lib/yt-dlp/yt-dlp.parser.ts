/**
 * yt-dlp.parser.ts
 *
 * This file provides a function to execute yt-dlp using a specified binary path and URL,
 * and return parsed metadata as either a MediaFile.SourceFile or MediaFile.SourcePlaylist.
 */

import { spawn } from 'child_process';
import { MediaFile } from '../../../shared/types/media-file';

export async function getFileInfoFromYtDlp(
  ytDlpPath: string,
  url: string
): Promise<MediaFile.SourceFile | MediaFile.SourcePlaylist> {
  console.log('[Parser] started')
  return new Promise((resolve, reject) => {
    const proc = spawn(ytDlpPath, ['--dump-single-json', url]);

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`yt-dlp exited with code ${code}\n${stderr}`));
      }

      try {
        const json = JSON.parse(stdout);
        const extractor = json.extractor ?? json.extractor_key ?? 'unknown';

        // Check if it's a playlist
        if (json._type === 'playlist') {
          const playlist: MediaFile.SourcePlaylist = {
            id: json.id,
            title: json.title,
            extractor,
            webpageUrl: json.webpage_url,
            entries: (json.entries || []).map(parseSingleEntry),
          };
          resolve(playlist);
        } else {
          resolve(parseSingleEntry(json));
        }
      } catch (err) {
        reject(new Error(`Failed to parse yt-dlp JSON: ${(err as Error).message}`));
      }
    });
  });
}

/**
 * Converts a single media entry JSON object into MediaFile.SourceFile
 */
function parseSingleEntry(json: any): MediaFile.SourceFile {
  const tracks: MediaFile.Track[] = (json.formats || []).map((f: any) => ({
    formatId: f.format_id,
    format: f.format,
    ext: f.ext,
    vcodec: f.vcodec,
    acodec: f.acodec,
    width: f.width,
    height: f.height,
    fps: f.fps,
    tbr: f.tbr,
    abr: f.abr,
    vbr: f.vbr,
    asr: f.asr,
    filesize: f.filesize || f.filesize_approx,
    url: f.url,
    hasAudio: f.vcodec === 'none' && f.acodec !== 'none',
    hasVideo: f.vcodec !== 'none',
  }));

  return {
    id: json.id,
    title: json.title,
    extractor: json.extractor ?? json.extractor_key ?? 'unknown',
    playlistId: json.playlist_id ?? undefined,
    uploader: json.uploader,
    uploadDate: json.upload_date,
    duration: json.duration,
    description: json.description,
    webpageUrl: json.webpage_url,
    thumbnail: json.thumbnail,
    tags: json.tags,
    tracks,
  };
}
