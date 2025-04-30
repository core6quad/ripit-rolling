import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';
import { QueueStore } from '../lib/services/queue-store-service';
import { MediaFile } from '../../shared/types/media-file';

/** JSON file-based implementation of QueueStore */
export class JsonQueueStore extends QueueStore {
	private filePath: string;

	constructor() {
		super();
		const userDataPath = app.getPath('userData');
		this.filePath = path.join(userDataPath, 'queue.json');
	}

	/** Read queue file contents or return empty list */
	private async read(): Promise<MediaFile.Data[]> {
		try {
			const data = await fs.readFile(this.filePath, 'utf-8');
			return JSON.parse(data) as MediaFile.Data[];
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
			throw err;
		}
	}

	/** Write updated queue to file */
	private async write(data: MediaFile.Data[]): Promise<void> {
		await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
	}

	/** Add file to queue if not already present */
	async add(file: MediaFile.Data): Promise<void> {
		const list = await this.read();
		const exists = list.some(item => item.id === file.id);
		if (!exists) {
			list.push(file);
			await this.write(list);
		}
	}

	/** Remove file from queue by ID */
	async remove(file: MediaFile.Data): Promise<void> {
		const list = await this.read();
		const updated = list.filter(item => item.id !== file.id);
		await this.write(updated);
	}

	/** Get full list of queued items */
	async getList(): Promise<MediaFile.Data[]> {
		return this.read();
	}
}
