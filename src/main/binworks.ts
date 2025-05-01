// import * as fs from 'fs';
// import * as path from 'path';
// import * as https from 'https';
// import * as os from 'os';
// import { ipcMain, dialog } from 'electron';
// import { spawn } from 'child_process';
// import extract from 'extract-zip'; // Import extract-zip for extracting archives
// import { parseResolutions } from './utils'; // Assuming you have a utility function to parse resolutions
// import { downloadFile } from './filedown'; // Assuming you have a utility function to download files



// function downloadYtDlp(url, callback) {
//   https.get(url, (res) => {
//     if (res.statusCode === 302 || res.statusCode === 301) {
//       // Handle redirect
//       const redirectUrl = res.headers.location;

//       console.log(`Redirected to: ${redirectUrl}`);
//       downloadYtDlp(redirectUrl, callback); // Follow the redirect
//     } else if (res.statusCode === 200) {
//       // Validate Content-Type
//       const contentType = res.headers['content-type'];
//       if (!contentType || !contentType.includes('application/octet-stream')) {
//         callback(new Error(`Invalid Content-Type: ${contentType}`));
//         return;
//       }

//       // Handle successful response
//       const chunks = [];
//       res.on('data', (chunk) => chunks.push(chunk));
//       res.on('end', () => {
//         const data = Buffer.concat(chunks);
//         callback(null, data);
//       });
//     } else {
//       callback(new Error(`Failed to download yt-dlp: ${res.statusCode}`));
//     }
//   }).on('error', (err) => {
//     callback(err);
//   });
// }

// /**
//  * 
//  * @returns {Promise<string>} - Resolves to the path of the yt-dlp executable
//  */
// function ensureYtDlpExists(): Promise<string> {
//   const ytDlpPath = path.join(os.tmpdir(), process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

//   if (!fs.existsSync(ytDlpPath)) {
//     ipcMain.emit('yt-dlp-download');

//     // Determine the correct architecture
//     const arch = os.arch();
//     let ytDlpUrl;

//     if (process.platform === 'win32') {
//       ytDlpUrl = arch === 'x64'
//         ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
//         : arch === 'ia32'
//           ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_win_x86.exe'
//           : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_win_arm64.exe';
//     } else if (process.platform === 'darwin') {
//       ytDlpUrl = arch === 'arm64'
//         ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos_arm64'
//         : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos';
//     } else {
//       ytDlpUrl = arch === 'x64'
//         ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp'
//         : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_arm';
//     }

//     console.log(`Downloading yt-dlp binary from: ${ytDlpUrl}`); // Debug log for URL

//     return new Promise((resolve, reject) => {
//       downloadYtDlp(ytDlpUrl, (err, data) => {
//         if (err) {
//           console.error(`Failed to download yt-dlp: ${err.message}`); // Log error
//           dialog.showErrorBox('Error', 'Failed to download yt-dlp. Please check your internet connection or try again later.'); // Show error to user
//           reject(err);
//           return;
//         }

//         // Validate file size (e.g., ensure it's not too small or too large)
//         if (data.length < 1024 * 1024) { // Example threshold: 1 MB
//           console.error(`Downloaded file is too small: ${data.length} bytes`); // Debug log for file size
//           dialog.showErrorBox('Error', 'Downloaded yt-dlp binary is invalid. Please try again later.'); // Show error to user
//           reject(new Error('Downloaded file is too small to be a valid yt-dlp binary.'));
//           return;
//         }

//         fs.writeFileSync(ytDlpPath, data);
//         if (process.platform !== 'win32') {
//           fs.chmodSync(ytDlpPath, 0o755); // Ensure executable permissions
//         }
//         console.log(`yt-dlp downloaded to: ${ytDlpPath}`); // Debug log for file path
//         resolve(ytDlpPath);
//         ipcMain.emit('download-complete');
//       });
//     });
//   }

//   // Ensure permissions for existing file
//   if (process.platform !== 'win32') {
//     try {
//       fs.chmodSync(ytDlpPath, 0o755);
//     } catch (err) {
//       console.error(`Failed to set permissions for yt-dlp: ${err.message}`);
//     }
//   }

//   console.log(`yt-dlp path resolved to: ${ytDlpPath}`);
//   return Promise.resolve(ytDlpPath);
// }

// function ensureFfmpegExists(): Promise<{ ffmpeg: string, ffprobe?: string }> {
//   const ffmpegPath = path.join(os.tmpdir(), process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg');
//   const ffprobePath = path.join(os.tmpdir(), process.platform === 'win32' ? 'ffprobe.exe' : 'ffprobe');

//   if (!fs.existsSync(ffmpegPath) || !fs.existsSync(ffprobePath)) {
//     ipcMain.emit('ffmpeg-download');

//     const ffmpegUrl = process.platform === 'win32'
//       ? 'https://github.com/BtbN/FFmpeg-Builds/releases/latest/download/ffmpeg-master-latest-win64-gpl.zip'
//       : process.platform === 'darwin'
//         ? 'https://evermeet.cx/ffmpeg/ffmpeg'
//         : 'https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz';

//     console.log(`Downloading ffmpeg binaries from: ${ffmpegUrl}`);

//     return new Promise((resolve, reject) => {
//       downloadFile(ffmpegUrl, (err, data) => {
//         if (err) {
//           console.error(`Failed to download ffmpeg: ${err.message}`);
//           dialog.showErrorBox('Error', 'Failed to download ffmpeg. Please check your internet connection or try again later.');
//           reject(err);
//           return;
//         }

//         if (process.platform === 'win32' || process.platform === 'linux') {
//           const tempFilePath = path.join(os.tmpdir(), 'ffmpeg_download');
//           fs.writeFileSync(tempFilePath, data);

//           extract(tempFilePath, { dir: os.tmpdir() })
//             .then(() => {
//               const extractedPath = path.join(os.tmpdir(), 'ffmpeg-master-latest-win64-gpl', 'bin');
//               fs.renameSync(path.join(extractedPath, 'ffmpeg.exe'), ffmpegPath);
//               fs.renameSync(path.join(extractedPath, 'ffprobe.exe'), ffprobePath);
//               fs.unlinkSync(tempFilePath);
//               console.log(`ffmpeg binaries extracted to: ${os.tmpdir()}`);
//               resolve({ ffmpeg: ffmpegPath, ffprobe: ffprobePath });
//               ipcMain.emit('download-complete');
//             })
//             .catch((extractErr) => {
//               console.error(`Failed to extract ffmpeg: ${extractErr.message}`);
//               reject(extractErr);
//             });
//         } else {
//           fs.writeFileSync(ffmpegPath, data);
//           fs.chmodSync(ffmpegPath, 0o755);
//           console.log(`ffmpeg downloaded to: ${ffmpegPath}`);
//           resolve({ ffmpeg: ffmpegPath });
//           ipcMain.emit('download-complete');
//         }
//       });
//     });
//   }

//   console.log(`ffmpeg binaries resolved to: ${ffmpegPath}, ${ffprobePath}`);
//   return Promise.resolve({ ffmpeg: ffmpegPath, ffprobe: ffprobePath });
// }

// ipcMain.handle('fetch-video-resolutions', async (event, url) => {
//   const ytDlpPath = await ensureYtDlpExists();

//   console.log(`Processing URL: ${url}`);
//   console.log(`Using yt-dlp at: ${ytDlpPath}`);

//   if (!fs.existsSync(ytDlpPath)) {
//     throw new Error(`yt-dlp executable not found at: ${ytDlpPath}`);
//   }

//   const args = ['-F', url];

//   return new Promise((resolve, reject) => {
//     try {
//       const ytDlpProcess = spawn(ytDlpPath, args, { shell: process.platform === 'win32' });
//       let output = '';
//       let errorOutput = '';

//       ytDlpProcess.stdout.on('data', (data) => {
//         output += data;
//         console.log(`yt-dlp stdout: ${data.toString()}`); // Log stdout
//       });

//       ytDlpProcess.stderr.on('data', (data) => {
//         errorOutput += data;
//         console.error(`yt-dlp stderr: ${data.toString()}`); // Log stderr
//       });

//       ytDlpProcess.on('close', (code) => {
//         if (code === 0) {
//           const resolutions = parseResolutions(output);
//           resolve(resolutions);
//         } else {
//           console.error(`yt-dlp process exited with code ${code}`);
//           console.error(`yt-dlp error output: ${errorOutput}`);
//           reject(new Error('Failed to fetch resolutions'));
//         }
//       });
//     } catch (err) {
//       console.error(`Error spawning yt-dlp: ${err.message}`);
//       reject(err);
//     }
//   });
// });

// ipcMain.on('download-youtube-video', async (event, url, savePath, videoFormat, audioFormats, captionOptions, isAudioOnly = false) => {
//   try {
//     const ytDlpPath = await ensureYtDlpExists();
//     const { ffmpeg: ffmpegPath } = await ensureFfmpegExists();

//     let formatString;
//     if (isAudioOnly) {
//       formatString = audioFormats[0];
//     } else {
//       // Only use '+' for multiple audio tracks
//       formatString = audioFormats.length === 1
//         ? `${videoFormat}+${audioFormats[0]}`
//         : [videoFormat, ...audioFormats].join('+');
//     }

//     const args = [
//       '-f', formatString,
//       '--audio-multistream',
//       '--ffmpeg-location', ffmpegPath
//     ];

//     if (captionOptions) {
//       args.push('--write-subs', '--write-auto-subs');
//       if (captionOptions.languages.length > 0) {
//         args.push('--sub-lang', captionOptions.languages.join(','));
//       }
//       if (captionOptions.embed) {
//         args.push('--embed-subs');
//       }
//     }

//     args.push('-o', savePath, url);

//     console.log('Spawning yt-dlp with args:', args);
//     const ytDlpProcess = spawn(ytDlpPath, args, { shell: process.platform === 'win32' });

//     ytDlpProcess.stdout.on('data', data => {
//       const output = data.toString();
//       console.log('yt-dlp download output:', output);

//       // Detect merging/encoding phase
//       if (output.includes('[Merger]') || output.includes('[EmbedSubtitle]')) {
//         event.sender.send('download-progress', {
//           progress: 99,
//           eta: '--',
//           speed: '--',
//           status: 'encoding'
//         });
//         return;
//       }

//       const progressMatch = output.match(/\[download\]\s*([0-9.]+)%/);
//       if (progressMatch) {
//         const progress = parseFloat(progressMatch[1]);
//         const etaMatch = output.match(/ETA\s+([0-9:]+)/);
//         const speedMatch = output.match(/at\s+([\d.]+[KMG]iB\/s)/);

//         event.sender.send('download-progress', {
//           progress: progress,
//           eta: etaMatch ? etaMatch[1] : '--',
//           speed: speedMatch ? speedMatch[1] : '--',
//           status: 'downloading'
//         });
//       }
//     });

//     ytDlpProcess.stderr.on('data', data => {
//       const error = data.toString();
//       console.error('yt-dlp download error:', error);
//       event.sender.send('download-error', error);
//     });

//     ytDlpProcess.on('close', code => {
//       console.log('Download process exited with code:', code);
//       if (code === 0) {
//         event.sender.send('download-progress', { progress: 100, eta: '0s', speed: '0B/s' });
//       } else {
//         event.sender.send('download-error', 'Download failed');
//       }
//     });
//   } catch (error) {
//     console.error('Download error:', error);
//     event.sender.send('download-error', error.message);
//   }
// });

// // function ensureYtDlpExists() {
// //   const ytDlpPath = path.join(os.tmpdir(), process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');

// //   if (!fs.existsSync(ytDlpPath)) {
// //     ipcMain.emit('yt-dlp-download');

// //     // Determine the correct architecture
// //     const arch = os.arch();
// //     let ytDlpUrl;

// //     if (process.platform === 'win32') {
// //       ytDlpUrl = arch === 'x64'
// //         ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe'
// //         : arch === 'ia32'
// //           ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_win_x86.exe'
// //           : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_win_arm64.exe';
// //     } else if (process.platform === 'darwin') {
// //       ytDlpUrl = arch === 'arm64'
// //         ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos_arm64'
// //         : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos';
// //     } else {
// //       ytDlpUrl = arch === 'x64'
// //         ? 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp'
// //         : 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_arm';
// //     }

// //     console.log(`Downloading yt-dlp binary from: ${ytDlpUrl}`); // Debug log for URL

// //     return new Promise((resolve, reject) => {
// //       downloadYtDlp(ytDlpUrl, (err, data) => {
// //         if (err) {
// //           console.error(`Failed to download yt-dlp: ${err.message}`); // Log error
// //           dialog.showErrorBox('Error', 'Failed to download yt-dlp. Please check your internet connection or try again later.'); // Show error to user
// //           reject(err);
// //           return;
// //         }

// //         // Validate file size (e.g., ensure it's not too small or too large)
// //         if (data.length < 1_000_000) { // Example threshold: 1 MB
// //           console.error(`Downloaded file is too small: ${data.length} bytes`); // Debug log for file size
// //           dialog.showErrorBox('Error', 'Downloaded yt-dlp binary is invalid. Please try again later.'); // Show error to user
// //           reject(new Error('Downloaded file is too small to be a valid yt-dlp binary.'));
// //           return;
// //         }

// //         fs.writeFileSync(ytDlpPath, data);
// //         if (process.platform !== 'win32') {
// //           fs.chmodSync(ytDlpPath, 0o755); // Ensure executable permissions
// //         }
// //         console.log(`yt-dlp downloaded to: ${ytDlpPath}`); // Debug log for file path
// //         resolve(ytDlpPath);
// //         ipcMain.emit('download-complete');
// //       });
// //     });
// //   }

// //   // Ensure permissions for existing file
// //   if (process.platform !== 'win32') {
// //     try {
// //       fs.chmodSync(ytDlpPath, 0o755);
// //     } catch (err) {
// //       console.error(`Failed to set permissions for yt-dlp: ${err.message}`);
// //     }
// //   }

// //   console.log(`yt-dlp path resolved to: ${ytDlpPath}`);
// //   return Promise.resolve(ytDlpPath);
// // }