import * as os from "os";

const RIPIT_YT_DLP_PATH_PREFIX = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/';

export function resolveYtDlpUrl(): string {

	const arch = os.arch();
	let ytDlpUrl;

	switch (process.platform + arch) {
		case 'win32x64':
			ytDlpUrl = RIPIT_YT_DLP_PATH_PREFIX + 'yt-dlp.exe'
			break;

		case 'win32' + 'ia32':
			ytDlpUrl = RIPIT_YT_DLP_PATH_PREFIX + 'yt-dlp_win_x86.exe'
			break;

		case 'win32arm64':
			ytDlpUrl = RIPIT_YT_DLP_PATH_PREFIX + 'yt-dlp_win_arm64.exe'
			break;

		case 'darwinx64':
			ytDlpUrl = RIPIT_YT_DLP_PATH_PREFIX + 'yt-dlp_macos'
			break;

		case 'darwinarm64':
			ytDlpUrl = RIPIT_YT_DLP_PATH_PREFIX + 'yt-dlp_macos_arm64'
			break;

		default: {
			const err = `Operating system is not suppored. platform='${process.platform}', arch ='${arch}'`;
			console.error(err);
			// return Promise.reject(err);
			return null;
		}

	}

	console.log(`[yt-dlp][load][url]. platform='${process.platform}', arch ='${arch}'`, ytDlpUrl);
	return ytDlpUrl;
}

// export function resolveFFmpegUrl(): string | null {

// 	// return 'https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffmpeg-6.1-macos-64.zip';

// 	switch (process.platform) {
// 		// case 'win32': {
// 		// 	return 'https://github.com/BtbN/FFmpeg-Builds/releases/latest/download/ffmpeg-master-latest-win64-gpl.zip';
// 		// }
// 		// case 'darwin': {
// 		// 	return 'https://evermeet.cx/ffmpeg/ffmpeg';
// 		// }
// 		// case 'linux': {
// 		// 	return 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz';
// 		// }

// 		default:
// 			return null;
// 	}

// }

export function resolveFFmpegUrl(): string | null {
	switch (process.platform) {
		case 'win32': {
			return 'https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffmpeg-6.1-win-64.zip';
		}
		case 'darwin': {
			return 'https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffmpeg-6.1-macos-64.zip';
		}
		case 'linux': {
			return 'https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffmpeg-6.1-linux-64.zip';
		}

		default:
			return null;
	}
}

export function resolveFFprobeUrl(): string | null {
	switch (process.platform) {
		case 'win32': {
			return 'https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffprobe-6.1-win-64.zip';
		}
		case 'darwin': {
			return 'https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffprobe-6.1-macos-64.zip';
		}
		case 'linux': {
			return 'https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v6.1/ffprobe-6.1-linux-64.zip';
		}

		default:
			return null;
	}

}