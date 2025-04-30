/**
 * src/shared/types/media-file.ts
 *
 * This module defines a structured data model under the MediaFile namespace
 * to represent parsed information from `yt-dlp --dump-single-json` for both
 * single videos and playlists. It includes media metadata and available tracks.
 */

export namespace MediaFile {
  /** Single track (audio or video format) extracted by yt-dlp */
  export type Track = {
    /** Format identifier from yt-dlp (e.g. "251") */
    formatId: string;

    /** Human-readable format description */
    format: string;

    /** File extension, e.g. "mp4", "webm" */
    ext: string;

    /** Video codec (or "none" if audio-only) */
    vcodec: string;

    /** Audio codec (or "none" if video-only) */
    acodec: string;

    /** Width in pixels (if video) */
    width?: number;

    /** Height in pixels (if video) */
    height?: number;

    /** Frames per second (if video) */
    fps?: number;

    /** Total bitrate (kbps) */
    tbr?: number;

    /** Audio bitrate (kbps) */
    abr?: number;

    /** Video bitrate (kbps) */
    vbr?: number;

    /** Audio sample rate (Hz) */
    asr?: number;

    /** File size in bytes (approx. or exact) */
    filesize?: number;

    /** Direct media URL */
    url: string;

    /** Whether this track contains audio */
    hasAudio: boolean;

    /** Whether this track contains video */
    hasVideo: boolean;
  };

  /** Parsed file (video/audio) with tracks */
  export type SourceFile = {
    /** Media ID (e.g. YouTube video ID) */
    id: string;

    /** Title of the media */
    title: string;

    /** Source extractor (e.g. "youtube", "vimeo") */
    extractor: string;

    /** Playlist ID if this file is part of a playlist */
    playlistId?: string;

    /** Uploader/author */
    uploader?: string;

    /** Upload date as YYYYMMDD */
    uploadDate?: string;

    /** Duration in seconds */
    duration?: number;

    /** Description or metadata */
    description?: string;

    /** Original media page URL */
    webpageUrl: string;

    /** Preview image URL */
    thumbnail?: string;

    /** Tags or keywords */
    tags?: string[];

    /** List of available audio/video formats */
    tracks: Array<Track>;
  };

  /** Playlist containing multiple videos/files */
  export type SourcePlaylist = {
    /** Playlist ID */
    id: string;

    /** Playlist title */
    title: string;

    /** Extractor used (e.g. "youtube") */
    extractor: string;

    /** Original playlist URL */
    webpageUrl: string;

    /** List of media files in playlist */
    entries: Array<SourceFile>;
  };

  /** Actual downloaded file metadata (filled post-download) */
  export type Data = {
    id: string; // UUID generated on adding
    fileName: string;
    size: number; // bytes - null before downloading ang merging tracks
    created: number; // unix timestamp
    source: SourceFile; // Original media info -> const
  };
}