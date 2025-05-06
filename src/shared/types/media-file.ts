/**
 * src/shared/types/media-file.ts
 *
 * This module defines a structured data model under the MediaFile namespace
 * to represent parsed information from `yt-dlp --dump-single-json` for both
 * single videos and playlists. It includes media metadata and available tracks.
 */

export namespace MediaFile {

	const statusArray = ['Added', 'Downloading', 'Loaded', 'Error', 'Archived'] as const;
	export type Status = typeof statusArray[number];

	export type MediaContentType =
		| 'video'        // Single video entry
		| 'playlist'     // Playlist containing multiple videos
		| 'multi_video'  // Page with multiple video entries (e.g. a YouTube channel videos tab)
		| 'url'          // Generic URL (possibly not a media resource)
		| 'chapter'      // Chapter or section of a video
		| 'compat_list'  // Compatibility fallback list (rare)
		| 'unknown';     // Fallback for unrecognized types

	export type ETrack = TrackExtYoutube | EReflection;
	export type ESource = SourceFileExtYoutube | EReflection;

	// -- Supported data extentions
	// for emulating runtime typings
	export type EReflection = {
		__type: 'none' | 'youtube' // same as extractor
	}

	/** Single track (audio or video format) extracted by yt-dlp */
	export type Track = {
		eData: any;

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

		// channelId?: string; // form UrlInfo !

		// !
		eData: ETrack;
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
		version: string | '1'; // current version
		id: string; // media file UUID generated on adding
		status: Status;
		fileName: string; // +-> title
		trackIds: Array<Track>; // yt-dlp track ids
		size?: number; // bytes - null before downloading ang merging tracks
		created?: number; // unix timestamp  - null before downloading ang merging tracks
		source: SourceFile; // Original media info -> const
	};

	/**
	 * Information about a URL extracted by yt-dlp or similar tool.
	 */
	export type UrlInfo = {
		/**
		 * Type of content retrieved from the URL.
		 * Examples: 'video', 'playlist', 'multi_video', 'url', etc.
		 * Matches the `_type` field from yt-dlp JSON output.
		 */
		type: string;

		/**
		 * Number of video entries found in the URL.
		 * - For a single video, this will be `0`.
		 * - For a playlist or multi-video page, this will be `> 0`.
		 */
		count: number;

		/**
		 * Optional: Title of the video or playlist.
		 */
		title?: MediaContentType;

		/**
		 * Optional: Uploader name or channel name.
		 */
		uploader?: string;

		/**
		 * Optional: Channel or uploader ID (e.g., YouTube channel ID).
		 */
		channelId?: string;

		/**
		 * Optional: Error message if the URL could not be processed.
		 */
		error?: string;
	};

	/**
	 * Extended Track type that includes additional fields not present in the base Track type.
	 * These fields are derived from provided objects and are optional to accommodate varying data structures.
	 */

	export type TrackExtYoutube = EReflection & {
		/** Human-readable note about the format (e.g., "Default, high") */
		format_note?: string;

		/** Format index, typically null */
		format_index?: null;

		/** URL of the manifest for the media */
		manifest_url?: string;

		/** Language code for the track (e.g., "en") */
		language?: string;

		/** Protocol used for the track (e.g., "m3u8_native", "mhtml") */
		protocol?: string;

		/** Preference indicator, typically null */
		preference?: null;

		/** Quality level of the track (e.g., -1 for audio, 0 for low-res video) */
		quality?: number;

		/** Indicates if the track has DRM protection */
		has_drm?: boolean;

		/** Source preference value (e.g., 1 or -1) */
		source_preference?: number;

		/** File extension for audio (e.g., "mp4", "none") */
		audio_ext?: string;

		/** File extension for video (e.g., "mp4", "none") */
		video_ext?: string;

		/** Resolution description (e.g., "audio only", "256x142") */
		resolution?: string;

		/** Aspect ratio of the video, or null for audio-only */
		aspect_ratio?: number | null;

		/** HTTP headers for the request */
		// http_headers?: {
		// 	/** User-Agent string for the HTTP request */
		// 	"User-Agent"?: string;
		// 	/** Accept header for the HTTP request */
		// 	Accept?: string;
		// 	/** Accept-Language header for the HTTP request */
		// 	"Accept-Language"?: string;
		// 	/** Sec-Fetch-Mode header for the HTTP request */
		// 	"Sec-Fetch-Mode"?: string;
		// };

		/** Number of rows in storyboard (for storyboard tracks) */
		rows?: number;

		/** Number of columns in storyboard (for storyboard tracks) */
		columns?: number;

		/** Array of storyboard fragments with URL and duration */
		// fragments?: Array<{ url: string; duration: number }>;

		/** Approximate file size, typically null */
		filesize_approx?: null;

		/** Dynamic range of the video (e.g., "SDR") */
		dynamic_range?: string;

		audio_channels?: number;
		language_preference?: number;
	};

	/**
	 * Extended SourceFile type that includes additional fields not present in the base SourceFile type.
	 * These fields are derived from the provided object and are optional to accommodate varying data structures.
	 */
	export type SourceFileExtYoutube = EReflection & {
		/** URL of the YouTube channel */
		channel_url?: string;

		/** Number of views */
		view_count?: number;

		/** Average rating of the video */
		average_rating?: null;

		/** Age restriction for the video */
		age_limit?: number;

		/** Categories the video belongs to */
		categories?: string[];

		/** Indicates if the video can be played in an embed */
		playable_in_embed?: boolean;

		/** Status of the live stream (e.g., "not_live") */
		live_status?: string;

		/** Type of media (null if unspecified) */
		media_type?: null;

		/** Timestamp of the release (null if unspecified) */
		release_timestamp?: null;

		/** Fields used for sorting formats */
		// _format_sort_fields?: string[];

		/** Automatic captions for different languages */
		automatic_captions?: Record<string, Array<{
			ext: string;
			url: string;
			name: string;
		}>>;

		/** Subtitles for the video */
		subtitles?: Record<string, unknown>;

		/** Number of comments on the video */
		comment_count?: number;

		/** Chapters of the video (null if none) */
		chapters?: Array<{
			start_time: number; // в секундах (с плавающей точкой)
			end_time?: number;  // в секундах, может отсутствовать
			title: string;
		}>;

		/** Heatmap data for viewer engagement */
		// heatmap?: Array<{
		//   start_time: number;
		//   end_time: number;
		//   value: number;
		// }>;

		/** Location of the uploader */
		location?: string;

		/** Number of likes on the video */
		like_count?: number;

		/** Name of the channel */
		channel?: string;

		/** Number of channel subscribers */
		channel_follower_count?: number;

		/** ID of the uploader */
		uploader_id?: string;

		/** URL of the uploader's profile */
		uploader_url?: string;

		/** Timestamp of the upload */
		timestamp?: number;

		/** Availability status (e.g., "public") */
		availability?: string;

		/** Original URL or ID of the video */
		original_url?: string;

		/** Basename of the webpage URL */
		webpage_url_basename?: string;

		/** Domain of the webpage URL */
		webpage_url_domain?: string;

		/** Key of the extractor (e.g., "Youtube") */
		extractor_key?: string;

		/** Playlist name (null if not in a playlist) */
		playlist?: null;

		/** Index of the video in the playlist (null if not in a playlist) */
		playlist_index?: null;

		/** Display ID of the video */
		display_id?: string;

		/** Full title of the video */
		fulltitle?: string;

		/** Duration as a string (e.g., "30:04") */
		duration_string?: string;

		/** Release year (null if unspecified) */
		release_year?: null;

		/** Indicates if the video is currently live */
		is_live?: boolean;

		/** Indicates if the video was previously live */
		was_live?: boolean;

		/** Requested subtitles (null if none) */
		requested_subtitles?: null;

		/** Indicates if the video has DRM (null if unspecified) */
		_has_drm?: null;

		/** Epoch timestamp of the request */
		epoch?: number;

		/** List of requested downloads with detailed format information */
		// requested_downloads?: Array<{
		// 	asr: number;
		// 	filesize: number;
		// 	format_id: string;
		// 	format_note: string;
		// 	source_preference: number;
		// 	fps: number;
		// 	audio_channels: number;
		// 	height: number;
		// 	quality: number;
		// 	has_drm: boolean;
		// 	tbr: number;
		// 	filesize_approx: number;
		// 	url: string;
		// 	width: number;
		// 	language: string;
		// 	language_preference: number;
		// 	ext: string;
		// 	vcodec: string;
		// 	acodec: string;
		// 	dynamic_range: string;
		// 	downloader_options: {
		// 		http_chunk_size: number;
		// 	};
		// 	protocol: string;
		// 	video_ext: string;
		// 	audio_ext: string;
		// 	resolution: string;
		// 	aspect_ratio: number;
		// 	http_headers: {
		// 		"User-Agent"?: string;
		// 		Accept?: string;
		// 		"Accept-Language"?: string;
		// 		"Sec-Fetch-Mode"?: string;
		// 	};
		// 	format: string;
		// 	_filename: string;
		// 	filename: string;
		// 	__write_download_archive: boolean;
		// }>;

		/** Audio sample rate */
		asr?: number;

		/** File size in bytes */
		filesize?: number;

		/** Format ID of the selected track */
		format_id?: string;

		/** Note about the selected format */
		format_note?: string;

		/** Source preference for the selected track */
		source_preference?: number;

		/** Frames per second of the selected track */
		fps?: number;

		/** Number of audio channels */
		audio_channels?: number;

		/** Height of the selected track */
		height?: number;

		/** Quality level of the selected track */
		quality?: number;

		/** Indicates if the selected track has DRM */
		has_drm?: boolean;

		/** Total bitrate of the selected track */
		tbr?: number;

		/** Approximate file size of the selected track */
		filesize_approx?: number;

		/** URL of the selected track */
		url?: string;

		/** Width of the selected track */
		width?: number;

		/** Language of the selected track */
		language?: string;

		/** Language preference for the selected track */
		language_preference?: number;

		/** Preference for the selected track */
		preference?: null;

		/** File extension of the selected track */
		ext?: string;

		/** Video codec of the selected track */
		vcodec?: string;

		/** Audio codec of the selected track */
		acodec?: string;

		/** Dynamic range of the selected track */
		dynamic_range?: string;

		/** Downloader options for the selected track */
		downloader_options?: {
			http_chunk_size: number;
		};

		/** Protocol used for the selected track */
		protocol?: string;

		/** Video file extension */
		video_ext?: string;

		/** Audio file extension */
		audio_ext?: string;

		/** Video bitrate (null if unspecified) */
		vbr?: null;

		/** Audio bitrate (null if unspecified) */
		abr?: null;

		/** Resolution of the selected track */
		resolution?: string;

		/** Aspect ratio of the selected track */
		aspect_ratio?: number;

		/** HTTP headers for the selected track */
		http_headers?: {
			"User-Agent"?: string;
			Accept?: string;
			"Accept-Language"?: string;
			"Sec-Fetch-Mode"?: string;
		};

		/** Human-readable format description */
		format?: string;

		/** Type of the object (e.g., "video") */
		_type?: string;

		/** Version information of the extractor */
		_version?: {
			version: string;
			current_git_head: null;
			release_git_head: string;
			repository: string;
		};
	};



}