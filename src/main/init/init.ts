import { resolveFFmpegUrl, resolveFFprobeUrl, resolveYtDlpUrl } from "../utils/url-resolvers";
import { downloadFile2 } from "../filedown";
import { checkAndDownloadBinariesParallel } from "./prepare-bin-files";
import { app } from "electron";
import { chmodPostProcessor, unzipPostProcessor } from "../utils/postprocessors";

const RIPIT_RUNTIME_DIR = app.getPath('userData');//path.join(os.tmpdir(), 'ripit_runtime');

const binFiles = [{
	files: [
		process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'
	],
	url: resolveYtDlpUrl(),
	dowloader: downloadFile2,
	postProcessor: chmodPostProcessor,
},
{
	files: ['ffmpeg'],
	url: resolveFFmpegUrl(),
	ext: '.zip',
	dowloader: downloadFile2,
	postProcessor: unzipPostProcessor,
},
{
	files: ['ffprobe'],
	url: resolveFFprobeUrl(),
	ext: '.zip',
	dowloader: downloadFile2,
	postProcessor: unzipPostProcessor,
}
// {
// 	files: [
// 		process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg',
// 		// process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe',
// 	],
// 	url: resolveFFmpegUrl(),
// 	downloadAs: 'ffmpeg.zip'
// 	dowloader: downloadFile2,
// 	postProcessor: null,
// }
];

export async function appInit(): Promise<void> {
		await checkAndDownloadBinariesParallel(binFiles, RIPIT_RUNTIME_DIR, (progress) => {
			console.log(`[${progress.status}]`, progress.params);
		});
		console.log('✅ All binaries checked/downloaded successfully');
}