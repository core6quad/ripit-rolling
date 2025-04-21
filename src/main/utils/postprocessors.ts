import * as fsp from 'fs/promises';
import * as path from 'path';
import extract from 'extract-zip';
import { BinItem } from '../init/prepare-bin-files';

export async function unzipPostProcessor(bin: BinItem, runtimeDir: string): Promise<void> {
	const filePath = path.join(runtimeDir, bin.files[0]);
	const fileZip = filePath + '.zip';

	try {
		await extract(fileZip, { dir: runtimeDir });
		await fsp.unlink(fileZip);
		console.log(`✅ Unzipped and removed: ${fileZip}`);
		await fsp.chmod(filePath, 0o755);
		console.log(`✅ Permissions are set: ${filePath}`);
	} catch (err) {
		console.error(`❌ Failed to extract zip:`, err);
		throw err;
	}
}

export async function chmodPostProcessor(bin: BinItem, runtimeDir: string): Promise<void> {
	const filePath = path.join(runtimeDir, bin.files[0]);

	try {
		await fsp.chmod(filePath, 0o755);
		console.log(`✅ Permissions are set: ${filePath}`);
	} catch (err) {
		console.error(`❌ Failed to set permissions: ${filePath}`, err);
		throw err;
	}
}
