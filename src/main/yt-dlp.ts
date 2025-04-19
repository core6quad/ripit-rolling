import * as os from "os";

const  RIPIT_YT_DLP_PATH_PREFIX = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/';

export function resolveYtDlpUrl(): string {

    const arch = os.arch();
    let ytDlpUrl;

    switch (process.platform + arch) {
        case 'win32x64':
            ytDlpUrl = RIPIT_YT_DLP_PATH_PREFIX + 'yt-dlp.exe'
            break;

        case 'win32ia32':
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