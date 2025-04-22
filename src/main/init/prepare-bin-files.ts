import path from 'path';
import { fileExists } from '../utils/file-checks';

// ---------- Types ----------
type ProgressStatus =
	| 'checked'
	| 'loading'
	| 'postprocess'
	| 'final_check_failed';

type ProgressParams = {
	file?: string;
	ok?: boolean;
	url?: string;
};

type ProgressMessage = {
	status: ProgressStatus;
	params: ProgressParams;
};

export type BinItem = {
	files: string[];
	url: string;
	ext?: string; // '.zip'
	dowloader?: (url: string, outputPath: string, signal?: AbortSignal) => Promise<void>;
	postProcessor?: ((bin: BinItem, runtimeDir: string) => Promise<void> | void) | null;
};

function sendProgress(
	status: ProgressStatus,
	params: ProgressParams,
	onProgress?: (progress: ProgressMessage) => void
): void {
	onProgress?.({ status, params });
}

async function finalCheckFiles(
	files: string[],
	url: string,
	onProgress?: (progress: ProgressMessage) => void
): Promise<void> {
	for (const file of files) {
		const exists = await fileExists(file);
		if (!exists) {
			sendProgress('final_check_failed', { file, url }, onProgress);
			throw new Error(`Final check failed for: ${file}`);
		}
	}
}

// async function processSingleBin(
//   bin: BinItem,
//   runtimeDir: string,
//   signal: AbortSignal,
//   onProgress?: (progress: ProgressMessage) => void
// ): Promise<void> {
//   const fullPaths = bin.files.map(f => path.join(runtimeDir, f));

//   // Step 1: Check files
//   for (const filePath of fullPaths) {
//     const exists = await fileExists(filePath);
//     sendProgress('checked', { file: filePath, ok: exists, url: bin.url }, onProgress);

//     if (!exists) {
//       if (!bin.dowloader) {
//         throw new Error(`No downloader for missing file: ${filePath}`);
//       }

//       // Step 2: Download
//       sendProgress('loading', { url: bin.url }, onProgress);
//       await bin.dowloader(bin.url, runtimeDir, signal);

//       // Step 3: Post-process if needed
//       if (bin.postProcessor) {
//         for (const f of bin.files) {
//           sendProgress('postprocess', { file: path.join(runtimeDir, f), url: bin.url }, onProgress);
//         }
//         await bin.postProcessor();
//       }

//       break; // Stop after first missing file — we assume one download gives all
//     }
//   }

//   // Step 4: Final file check
//   await finalCheckFiles(fullPaths, bin.url, onProgress);
// }

async function processSingleBin(
	bin: BinItem,
	runtimeDir: string,
	signal: AbortSignal,
	onProgress?: (progress: ProgressMessage) => void
): Promise<void> {
	const fullPaths = bin.files.map(f => path.join(runtimeDir, f));

	// Step 1: Check files
	for (const filePath of fullPaths) {
		const exists = await fileExists(filePath); // Проверяем наличие файла
		sendProgress('checked', { file: filePath, ok: exists, url: bin.url }, onProgress);

		if (!exists) {
			// If file not found and no downloader -> error
			if (!bin.dowloader) {
				throw new Error(`No downloader for missing file: ${filePath}`);
			}

			// Step 2: Download the missing files
			sendProgress('loading', { url: bin.url }, onProgress);
			await bin.dowloader(bin.url, bin?.ext ? filePath + bin?.ext : filePath, signal);

			// Step 3: Post-process if needed
			if (bin.postProcessor) {
				sendProgress('postprocess', { file: filePath, url: bin.url }, onProgress);
				await bin.postProcessor(bin, runtimeDir); 
			}

			break; 
		}
	}

	// Step 4: Final file recheck 
	await finalCheckFiles(fullPaths, bin.url, onProgress);
}


// ---------- Main ----------
export async function checkAndDownloadBinariesParallel(
	binFiles: BinItem[],
	runtimeDir: string,
	onProgress?: (progress: ProgressMessage) => void
): Promise<void> {
	const controller = new AbortController();
	const { signal } = controller;

	const tasks = binFiles.map((bin) =>
		processSingleBin(bin, runtimeDir, signal, onProgress)
	);

	try {
		await Promise.all(
			tasks.map(task => task.catch(err => {
				controller.abort(); // Cancel all on first failure
				throw err;
			}))
		);
	} catch (err) {
		throw err;
	}
}
