/**
 * Extracts the yt-dlp extractor name and video ID from a given video URL.
 *
 * This function parses a URL from one of the 20 most popular video hosting platforms
 * (e.g., YouTube, Vimeo, TikTok, etc.) and returns a tuple containing the corresponding
 * yt-dlp extractor name and the content identifier (ID).
 *
 * Supported platforms:
 * - YouTube
 * - Vimeo
 * - Dailymotion
 * - Facebook
 * - Instagram
 * - Twitter
 * - Twitch
 * - TikTok
 * - SoundCloud
 * - VK (VKontakte)
 * - Youku
 * - Bilibili
 * - Reddit
 * - Periscope
 * - Zattoo
 * - DLive
 * - VLive
 * - Mix
 * - Flickr
 * - Vine (archived content)
 *
 * @param url - The full URL to a video or audio content on one of the supported platforms.
 * @returns A tuple `[extractor, id]` if a match is found, where:
 *   - `extractor`: the yt-dlp extractor name (e.g., "youtube", "vimeo")
 *   - `id`: the platform-specific content ID used with yt-dlp
 * 
 * Returns `null` if the URL does not match any known extractor pattern.
 *
 * @example
 * const result = parseExtractorAndId("https://www.youtube.com/watch?v=BaW_jenozKc");
 * // result => ["youtube", "BaW_jenozKc"]
 *
 * @example
 * const result = parseExtractorAndId("https://vimeo.com/76979871");
 * // result => ["vimeo", "76979871"]
 */


// type ExtractorIdPair = [extractor: string, id: string] | null;

// function parseExtractorAndId(url: string): ExtractorIdPair {
//     const patterns: { [key: string]: RegExp } = {
//         youtube: /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
// 				// youtube: /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})|(?:youtube\.com\/playlist\?list=)([a-zA-Z0-9_-]+)/,
//         vimeo: /vimeo\.com\/(?:video\/)?(\d+)/,
//         dailymotion: /dailymotion\.com\/video\/([a-zA-Z0-9]+)/,
//         facebook: /facebook\.com\/.*\/videos\/(?:[a-zA-Z0-9.-]+\/)?(\d+)/,
//         instagram: /instagram\.com\/(?:reel|p|tv)\/([a-zA-Z0-9_-]+)/,
//         twitter: /twitter\.com\/[^/]+\/status\/(\d+)/,
//         twitch: /twitch\.tv\/videos\/(\d+)/,
//         tiktok: /tiktok\.com\/@[^/]+\/video\/(\d+)/,
//         soundcloud: /soundcloud\.com\/([^/]+\/[^/?#]+)/,
//         vk: /vk\.com\/video(?:ext)?-?\d+_(\d+)/,
//         youku: /youku\.com\/v_show\/id_([a-zA-Z0-9==]+)/,
//         bilibili: /bilibili\.com\/video\/(BV[0-9A-Za-z]+)/,
//         reddit: /reddit\.com\/r\/[^/]+\/comments\/([^/]+)/,
//         periscope: /pscp\.tv\/w\/([a-zA-Z0-9]+)/,
//         zattoo: /zattoo\.com\/[^/]+\/([a-zA-Z0-9_-]+)/,
//         dlive: /dlive\.tv\/([a-zA-Z0-9_]+)/,
//         vlive: /vlive\.tv\/video\/(\d+)/,
//         mix: /mix\.com\/([a-zA-Z0-9_-]+)/,
//         flickr: /flickr\.com\/photos\/[^/]+\/(\d+)/,
//         vine: /vine\.co\/v\/([a-zA-Z0-9]+)/,
//     };

//     for (const extractor in patterns) {
//         const match = url.match(patterns[extractor]);
//         if (match) {
//             return [extractor, match[1]];
//         }
//     }

//     return null;
// }


/**
 * Parses a URL to extract the video ID and optional playlist ID from popular video platforms.
 * 
 * Supported platforms include:
 * - YouTube
 * - Vimeo
 * - Dailymotion
 * - SoundCloud
 * - Bilibili
 * - TikTok
 * 
 * For YouTube, it handles standard video URLs, playlist URLs, and shortened URLs (youtu.be).
 * 
 * For Vimeo, it handles video URLs and album (playlist) URLs.
 * 
 * For Dailymotion, it handles both individual video URLs and playlist URLs.
 * 
 * For SoundCloud, it handles both track and set (playlist) URLs.
 * 
 * For Bilibili, it handles video URLs and playlist URLs.
 * 
 * For TikTok, it handles individual video URLs and playlist URLs.
 * 
 * @param {string} url - The URL of the video or playlist.
 * @returns {Object|null} - Returns an object with the extractor (platform name), videoId, and optional playlistId.
 *                          Returns `null` if the URL doesn't match any supported platform.
 * 
 * Example usage:
 * 
 * // YouTube video URL:
 * const result = parseExtractorAndId("https://www.youtube.com/watch?v=dXXHAFk7LnI&list=RDdXXHAFk7LnI");
 * console.log(result); 
 * // Output: { extractor: "youtube", videoId: "dXXHAFk7LnI", playlistId: "RDdXXHAFk7LnI" }
 * 
 * // Vimeo video URL:
 * const result = parseExtractorAndId("https://vimeo.com/123456789");
 * console.log(result); 
 * // Output: { extractor: "vimeo", videoId: "123456789" }
 */

// youtube: /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:.*(?:list=([a-zA-Z0-9_-]+)))?/,

// export type ExtractorIdPair = { extractor: string, videoId: string, playlistId?: string } | null;

// export function parseExtractorAndId(url: string): ExtractorIdPair {
// 	const patterns: { [key: string]: RegExp } = {
// 		youtube: /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:.*?[?&]list=([a-zA-Z0-9_-]+))?|youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+)/,
// 		vimeo: /vimeo\.com\/(?:video\/)?(\d+)(?:.*(?:album=([a-zA-Z0-9_-]+)))?/,
// 		dailymotion: /dailymotion\.com\/(?:video|playlist)\/([a-zA-Z0-9]+)/,
// 		soundcloud: /soundcloud\.com\/(?:[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+|sets\/[a-zA-Z0-9_-]+)/,
// 		bilibili: /bilibili\.com\/video\/([a-zA-Z0-9_-]+)(?:.*(?:playlist\/([a-zA-Z0-9_-]+)))?/,
// 		tiktok: /tiktok\.com\/@([a-zA-Z0-9_-]+)\/video\/([a-zA-Z0-9_-]+)(?:.*(?:playlist\/([a-zA-Z0-9_-]+)))?/,
// 		facebook: /facebook\.com\/.*\/videos\/(?:[a-zA-Z0-9.-]+\/)?(\d+)/,
// 		instagram: /instagram\.com\/(?:reel|p|tv)\/([a-zA-Z0-9_-]+)/,
// 		twitter: /twitter\.com\/[^/]+\/status\/(\d+)/,
// 		twitch: /twitch\.tv\/videos\/(\d+)/,
// 		vk: /vk\.com\/video(?:ext)?-?\d+_(\d+)/,
// 		youku: /youku\.com\/v_show\/id_([a-zA-Z0-9==]+)/,
// 		reddit: /reddit\.com\/r\/[^/]+\/comments\/([^/]+)/,
// 		periscope: /pscp\.tv\/w\/([a-zA-Z0-9]+)/,
// 		zattoo: /zattoo\.com\/[^/]+\/([a-zA-Z0-9_-]+)/,
// 		dlive: /dlive\.tv\/([a-zA-Z0-9_]+)/,
// 		vlive: /vlive\.tv\/video\/(\d+)/,
// 		mix: /mix\.com\/([a-zA-Z0-9_-]+)/,
// 		flickr: /flickr\.com\/photos\/[^/]+\/(\d+)/,
// 		vine: /vine\.co\/v\/([a-zA-Z0-9]+)/,
// 	};

// 	for (const extractor in patterns) {
// 		const match = url.match(patterns[extractor]);
// 		if (match) {
// 			const videoId = match[1];
// 			const playlistId = match[2] || match[3] || undefined; // Плейлист может быть в 2-й или 3-й группе
// 			return { extractor, videoId, playlistId };
// 		}
// 	}

// 	return null;
// }


export type ExtractorIdPair = {
	extractor: string;
	videoId?: string;
	playlistId?: string;
} | null;

export function parseExtractorAndId(url: string): ExtractorIdPair {
	const patterns: { [key: string]: RegExp } = {
		youtube: /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:.*?[?&]list=([a-zA-Z0-9_-]+))?|(?:youtube\.com\/playlist\?list=([a-zA-Z0-9_-]+))/,
		vimeo: /vimeo\.com\/(?:video\/)?(\d+)(?:.*(?:album=([a-zA-Z0-9_-]+)))?/,
		dailymotion: /dailymotion\.com\/(?:video|playlist)\/([a-zA-Z0-9]+)/,
		soundcloud: /soundcloud\.com\/(?:[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+|sets\/[a-zA-Z0-9_-]+)/,
		bilibili: /bilibili\.com\/video\/([a-zA-Z0-9_-]+)(?:.*(?:playlist\/([a-zA-Z0-9_-]+)))?/,
		tiktok: /tiktok\.com\/@([a-zA-Z0-9_-]+)\/video\/([a-zA-Z0-9_-]+)(?:.*(?:playlist\/([a-zA-Z0-9_-]+)))?/,
		facebook: /facebook\.com\/.*\/videos\/(?:[a-zA-Z0-9.-]+\/)?(\d+)/,
		instagram: /instagram\.com\/(?:reel|p|tv)\/([a-zA-Z0-9_-]+)/,
		twitter: /twitter\.com\/[^/]+\/status\/(\d+)/,
		twitch: /twitch\.tv\/videos\/(\d+)/,
		vk: /vk\.com\/video(?:ext)?-?\d+_(\d+)/,
		youku: /youku\.com\/v_show\/id_([a-zA-Z0-9=]+)/,
		reddit: /reddit\.com\/r\/[^/]+\/comments\/([^/]+)/,
		periscope: /pscp\.tv\/w\/([a-zA-Z0-9]+)/,
		zattoo: /zattoo\.com\/[^/]+\/([a-zA-Z0-9_-]+)/,
		dlive: /dlive\.tv\/([a-zA-Z0-9_]+)/,
		vlive: /vlive\.tv\/video\/(\d+)/,
		mix: /mix\.com\/([a-zA-Z0-9_-]+)/,
		flickr: /flickr\.com\/photos\/[^/]+\/(\d+)/,
		vine: /vine\.co\/v\/([a-zA-Z0-9]+)/,
	};

	for (const extractor in patterns) {
		const match = url.match(patterns[extractor]);
		if (match) {
			let videoId: string | undefined;
			let playlistId: string | undefined;

			if (extractor === 'youtube') {
				videoId = match[1] ?? undefined;
				playlistId = match[2] ?? match[3] ?? undefined;
			} else {
				videoId = match[1];
				playlistId = match[2] ?? undefined;
			}

			return { extractor, videoId, playlistId };
		}
	}

	return null;
}
