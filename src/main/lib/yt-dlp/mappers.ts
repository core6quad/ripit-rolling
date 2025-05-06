import { MediaFile } from "../../../shared/types/media-file";
import { get, isNumber, isString, isBoolean, isPlainObject, isArray, pickBy } from 'lodash';

export namespace YDBMappers {

	/**
	 * Maps raw yt-dlp JSON data to MediaFile.UrlInfo for playlist or multi-video content.
	 * 
	 * @param json - Raw yt-dlp JSON data.
	 * @returns Mapped MediaFile.UrlInfo.
	 */
	export function mapToUrlInfo(json: any): MediaFile.UrlInfo {
		return {
			type: json._type || 'video',
			count: Array.isArray(json.entries) ? json.entries.length : 0,
			title: json.title,
			uploader: json.uploader,
			channelId: json.channel_id || json.channelId,
		};
	}

	/**
	 * Maps raw yt-dlp JSON data to MediaFile.SourceFile for single video.
	 * 
	 * @param json - Raw yt-dlp JSON data.
	 * @returns Mapped MediaFile.SourceFile.
	 */
	export function mapToSourceFile(json: any): MediaFile.SourceFile {
		const extractor = json.extractor ?? json.extractor_key ?? 'unknown';
		const tracks = mapToTracks(json.formats || [], extractor);
		const eData: MediaFile.ESource = 'youtube' === extractor
			? mapSourceFileExtYoutube(json)
			: { __type: 'none' }; // ADD HERE mappers for youtube etc.

		return {
			id: json.id,
			title: json.title,
			extractor,
			webpageUrl: json.webpage_url,
			tracks,
			playlistId: json.playlist_id ?? undefined,
			uploader: json.uploader ?? undefined,
			uploadDate: json.upload_date ?? undefined,
			duration: json.duration ?? undefined,
			description: json.description ?? undefined,
			thumbnail: json.thumbnail ?? undefined,
			tags: json.tags ?? undefined,
			eData,
		};
	}

	/**
	 * Maps an array of raw yt-dlp format data to MediaFile.Track array.
	 * 
	 * @param formats - Array of raw format data from yt-dlp.
	 * @returns Mapped array of MediaFile.Track objects.
	 */
	function mapToTracks(formats: any[], extractor: string): MediaFile.Track[] {
		return formats.map((f: any) => ({
			formatId: f.format_id,
			format: f.format ?? null,
			ext: f.ext,
			vcodec: f.vcodec ?? null,
			acodec: f.acodec ?? null,
			width: f.width ?? null,
			height: f.height ?? null,
			fps: f.fps ?? null,
			tbr: f.tbr ?? null,
			abr: f.abr ?? null,
			vbr: f.vbr ?? null,
			asr: f.asr ?? null,
			filesize: f.filesize ?? f.filesize_approx ?? null,
			url: f.url ?? null,
			hasAudio: f.vcodec === 'none' && f.acodec !== 'none',
			hasVideo: f.vcodec !== 'none',
			eData: 'youtube' === extractor // ADD HERE mappers for youtube etc.
				? mapTrackExtYoutube(f)
				: { __type: 'none' },
		}));
	}


	export function mapTrackExtYoutube(data: unknown): MediaFile.TrackExtYoutube {
		if (!isPlainObject(data)) {
			return { __type: 'none' };
		}
		// const http_headersRaw = get(data, 'http_headers');
		// const http_headers = isPlainObject(http_headersRaw)
		// 	? {
		// 		'User-Agent': get(http_headersRaw, 'User-Agent'),
		// 		Accept: get(http_headersRaw, 'Accept'),
		// 		'Accept-Language': get(http_headersRaw, 'Accept-Language'),
		// 		'Sec-Fetch-Mode': get(http_headersRaw, 'Sec-Fetch-Mode'),
		// 	}
		// 	: undefined;

		// useless
		// const fragmentsRaw = get(data, 'fragments');
		// const fragments = isArray(fragmentsRaw)
		// 	? fragmentsRaw
		// 		.filter(f => isPlainObject(f) && isString(f.url) && isNumber(f.duration))
		// 		.map(f => ({ url: f.url, duration: f.duration }))
		// 	: undefined;

		const __type = 'youtube';
		const result = {
			__type,
			format_note: get(data, 'format_note'),
			format_index: get(data, 'format_index'),
			manifest_url: get(data, 'manifest_url'),
			language: get(data, 'language'),
			protocol: get(data, 'protocol'),
			preference: get(data, 'preference'),
			quality: get(data, 'quality'),
			has_drm: get(data, 'has_drm'),
			source_preference: get(data, 'source_preference'),
			audio_ext: get(data, 'audio_ext'),
			video_ext: get(data, 'video_ext'),
			resolution: get(data, 'resolution'),
			aspect_ratio: get(data, 'aspect_ratio'),
			// http_headers,
			rows: get(data, 'rows'),
			columns: get(data, 'columns'),
			// fragments,
			filesize_approx: get(data, 'filesize_approx'),
			dynamic_range: get(data, 'dynamic_range'),
			audio_channels: get(data, 'audio_channels'),
			language_preference: get(data, 'language_preference'),
		};

		return pickBy(result, v => v !== undefined) as any as MediaFile.TrackExtYoutube; // removes all fields with undefined, null, '', 0, false, NaN
	}

	export function mapSourceFileExtYoutube(data: unknown): MediaFile.SourceFileExtYoutube {
		if (!isPlainObject(data)) {
			return { __type: 'none' };
		}

		// Маппинг глав
		const chapters: MediaFile.SourceFileExtYoutube['chapters'] = get(data, 'chapters');
		let formattedChapters: MediaFile.SourceFileExtYoutube['chapters'];

		if (isArray(chapters)) {
			formattedChapters = chapters
				.filter(isPlainObject)
				.map((ch) => {
					const start = get(ch, 'start_time');
					const end = get(ch, 'end_time');
					const title = get(ch, 'title');

					// Если start_time или title отсутствуют, то пропускаем
					return (!isNumber(start) || !isString(title))
						? null
						: {
							start_time: start,
							end_time: isNumber(end) ? end : null, // end_time может быть пустым
							title,
						};
				})
				.filter(Boolean); // Отфильтровываем null значения
		}

		const result: MediaFile.SourceFileExtYoutube = {
			__type: 'youtube',
			_type: get(data, '_type'),
			channel_url: get(data, 'channel_url'),
			view_count: get(data, 'view_count'),
			average_rating: get(data, 'average_rating'),
			age_limit: get(data, 'age_limit'),
			categories: get(data, 'categories'),
			playable_in_embed: get(data, 'playable_in_embed'),
			live_status: get(data, 'live_status'),
			media_type: get(data, 'media_type'),
			release_timestamp: get(data, 'release_timestamp'),
			// automatic_captions: get(data, 'automatic_captions'),
			subtitles: get(data, 'subtitles'),
			comment_count: get(data, 'comment_count'),
			location: get(data, 'location'),
			like_count: get(data, 'like_count'),
			channel: get(data, 'channel'),
			channel_follower_count: get(data, 'channel_follower_count'),
			uploader_id: get(data, 'uploader_id'),
			uploader_url: get(data, 'uploader_url'),
			timestamp: get(data, 'timestamp'),
			availability: get(data, 'availability'),
			original_url: get(data, 'original_url'),
			webpage_url_basename: get(data, 'webpage_url_basename'),
			webpage_url_domain: get(data, 'webpage_url_domain'),
			extractor_key: get(data, 'extractor_key'),
			playlist: get(data, 'playlist'),
			playlist_index: get(data, 'playlist_index'),
			display_id: get(data, 'display_id'),
			fulltitle: get(data, 'fulltitle'),
			duration_string: get(data, 'duration_string'),
			release_year: get(data, 'release_year'),
			is_live: get(data, 'is_live'),
			was_live: get(data, 'was_live'),
			requested_subtitles: get(data, 'requested_subtitles'),
			_has_drm: get(data, '_has_drm'),
			epoch: get(data, 'epoch'),
			asr: get(data, 'asr'),
			filesize: get(data, 'filesize'),
			format_id: get(data, 'format_id'),
			format_note: get(data, 'format_note'),
			source_preference: get(data, 'source_preference'),
			fps: get(data, 'fps'),
			audio_channels: get(data, 'audio_channels'),
			height: get(data, 'height'),
			quality: get(data, 'quality'),
			has_drm: get(data, 'has_drm'),
			tbr: get(data, 'tbr'),
			filesize_approx: get(data, 'filesize_approx'),
			url: get(data, 'url'),
			width: get(data, 'width'),
			language: get(data, 'language'),
			language_preference: get(data, 'language_preference'),
			preference: get(data, 'preference'),
			ext: get(data, 'ext'),
			vcodec: get(data, 'vcodec'),
			acodec: get(data, 'acodec'),
			dynamic_range: get(data, 'dynamic_range'),
			downloader_options: get(data, 'downloader_options'),
			protocol: get(data, 'protocol'),
			video_ext: get(data, 'video_ext'),
			audio_ext: get(data, 'audio_ext'),
			resolution: get(data, 'resolution'),
			aspect_ratio: get(data, 'aspect_ratio'),
			// http_headers: get(data, 'http_headers'),
			format: get(data, 'format'),
			_version: get(data, 'version'),
			chapters: formattedChapters,
		};

		return pickBy(
			result,
			(v) => v !== undefined && v !== null // Убираем пустые или невалидные значения
		) as MediaFile.SourceFileExtYoutube;
	}

}