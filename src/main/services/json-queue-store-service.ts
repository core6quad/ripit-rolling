/**
 * JSON file-based implementation of QueueStore with in-memory cache,
 * validation on load, and safe, serialized writing to disk.
 */

import path from 'path';
import { app, ipcMain } from 'electron';
import { QueueStore } from '../lib/services/queue-store-service';
import { MediaFile } from '../../shared/types/media-file';
import { SafeFileWriter } from '../lib/io/safe-file-writer';
import { MediaFileValidation } from '../utils/validation/media-data.validator';
import { FileRotationUtil } from '../utils/file-rotation';
import { IPCConstantsInvoke } from '../../shared/types/ipcConstants';

export class JsonQueueStore extends QueueStore {
	private readonly filePath: string;
	private readonly writer: SafeFileWriter;
	private memoryQueue: MediaFile.Data[] = [];
	private invalidEntries: Array<MediaFileValidation.InvalidRecord> = [];
	private readonly rotationUtil: FileRotationUtil;

	constructor() {
		super();
		const userDataPath = app.getPath('userData');
		this.filePath = path.join(userDataPath, 'queue.json');
		this.writer = new SafeFileWriter(this.filePath);
		this.rotationUtil = new FileRotationUtil(path.dirname(this.filePath));
	}

	async init(): Promise<void> {
		try {
			// Ensure the file exists or is created if missing
			await this.checkOrInitStoreFile();

			// Load and validate data from the store
			const { validQueue, invalidEntries } = await this.loadStore();

			// If data is loaded successfully, set the in-memory queue and invalid entries
			this.memoryQueue = validQueue;
			this.invalidEntries = invalidEntries;

			// If the queue is valid and contains data, perform backup and cleanup
			if (this.memoryQueue.length > 0 && this.invalidEntries.length === 0) {
				await this.rotationUtil.rotateAndBackup();
			}
		} catch (err) {
			// In case of an error, log the error and clear the queue and invalid entries
			console.error('[Queue] Failed to load and validate the queue', err);

			// Set the memory queue and invalid entries to empty arrays on error
			this.memoryQueue = [];
			this.invalidEntries = [];
		}
	}

	private async loadStore(): Promise<{ validQueue: MediaFile.Data[], invalidEntries: Array<MediaFileValidation.InvalidRecord> }> {
		let validQueue: MediaFile.Data[] = [];
		let invalidEntries: Array<MediaFileValidation.InvalidRecord> = [];

		try {
			console.log('[QueueService][loadStore]');
			const raw = await this.writer.read();
			const parsed = JSON.parse(raw);

			if (!Array.isArray(parsed)) {
				invalidEntries.push({ index: -1, error: 'Root is not array', record: parsed });
				return { validQueue, invalidEntries };
			}

			if (parsed.length === 0) {
				console.warn('[Queue] Loaded empty queue from disk');
			}

			// Используем validateAndCloneMediaFiles
			console.log('[QueueService][loadStore] loaded', parsed);
			const { valid, invalid } = MediaFileValidation.validatedClone(parsed);

			validQueue = valid;
			invalidEntries = invalid;
		} catch (err) {
			// In case of any error (except file not found), throw it
			throw err;
		}

		console.log('[QueueService][loadStore] done', validQueue, invalidEntries);
		return { validQueue, invalidEntries };
	}

	async add(file: MediaFile.Data): Promise<boolean> {
		console.log('[QueueService][Add] data = ', file);
		const exists = this.memoryQueue.some(item => item.id === file.id);
		if (!exists) {
			this.memoryQueue.push(file);
			await this.writer.scheduleWrite(this.memoryQueue);
			return true;
		}
		return false;
	}

	async removeFiles(ids: string[]): Promise<void> {
		this.memoryQueue = this.memoryQueue.filter(item => !ids.includes(item.id));
		await this.writer.scheduleWrite(this.memoryQueue);
	}

	async getList(): Promise<MediaFile.Data[]> {
		// return structuredClone(this.memoryQueue);
		console.log('[Queue][Getlist] ', this.memoryQueue);
		return structuredClone(this.memoryQueue);
	}

	getInvalidEntries() {
		return this.invalidEntries;
	}

	// Method to check if the file exists, and create it with [] if it doesn't
	private async checkOrInitStoreFile(): Promise<void> {
		try {
			// Try reading the file to check if it exists
			await this.writer.read();
		} catch (err) {
			if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
				// If the file doesn't exist, create it with an empty array []
				console.log('[Queue] No queue file found, creating a new one with an empty array');
				await this.writer.scheduleWrite('[]'); // Write empty array to the file
			} else {
				// If there is another error, rethrow it
				throw err;
			}
		}
	}

	public async handleAll() {
		const handlers: Handlers = [
			{ channel: 'CID_GET_LIST', listener: this.getListHandler },
			{ channel: 'CID_ADD_SOURCE', listener: this.addListener },
		];

		// Асинхронно добавляем обработчики
		for (const { channel, listener } of handlers) {
			await ipcMain.handle(channel, listener);
		}
	}

	public getListHandler: (_event: Electron.IpcMainInvokeEvent) => Promise<Array<MediaFile.Data>> =
		async (_event) => this.getList();

	public addListener: (_event: Electron.IpcMainInvokeEvent, data: MediaFile.Data) => Promise<boolean> =
		async (_event, data) => this.add(data);



}

type Handlers = Array<{ channel: IPCConstantsInvoke, listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => (Promise<any>) | (any) }>;
