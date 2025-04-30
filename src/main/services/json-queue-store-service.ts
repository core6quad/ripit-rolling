/**
 * JSON file-based implementation of QueueStore with in-memory cache,
 * validation on load, and safe, serialized writing to disk.
 */

import path from 'path';
import { app } from 'electron';
import { QueueStore } from '../lib/services/queue-store-service';
import { MediaFile } from '../../shared/types/media-file';
import { SafeFileWriter } from '../lib/io/safe-file-writer';

export class JsonQueueStore extends QueueStore {
  private readonly filePath: string;
  private readonly writer: SafeFileWriter;
  private memoryQueue: MediaFile.Data[] = [];
  private invalidEntries: Array<{ index: number; reason: string; data: unknown }> = [];

  constructor() {
    super();
    const userDataPath = app.getPath('userData');
    this.filePath = path.join(userDataPath, 'queue.json');
    this.writer = new SafeFileWriter(this.filePath);
  }

  /** Load queue from file into memory (call once on startup) */
  async init(): Promise<void> {
    try {
      const raw = await this.writer.read();
      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        this.memoryQueue = [];
        this.invalidEntries.push({ index: -1, reason: 'Root is not array', data: parsed });
        return;
      }

      const valid: MediaFile.Data[] = [];
      parsed.forEach((entry, index) => {
        const result = this.validateMediaData(entry);
        if (result.valid) valid.push(result.data as MediaFile.Data);
        else this.invalidEntries.push({ index, reason: result.reason, data: entry });
      });

      this.memoryQueue = valid;
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        this.memoryQueue = [];
      } else {
        throw err;
      }
    }
  }

  /** Add item to memory queue and schedule write */
  async add(file: MediaFile.Data): Promise<void> {
    const exists = this.memoryQueue.some(item => item.id === file.id);
    if (!exists) {
      this.memoryQueue.push(file);
      await this.writer.scheduleWrite(this.memoryQueue);
    }
  }

  /** Remove item from memory queue and schedule write */
  async remove(file: MediaFile.Data): Promise<void> {
    this.memoryQueue = this.memoryQueue.filter(item => item.id !== file.id);
    await this.writer.scheduleWrite(this.memoryQueue);
  }

  /** Return current memory queue */
  async getList(): Promise<MediaFile.Data[]> {
    return this.memoryQueue;
  }

  /** Return list of entries that failed validation */
  getInvalidEntries() {
    return this.invalidEntries;
  }

  /** Placeholder validator - replace with proper logic */
  private validateMediaData(data: unknown): { valid: boolean; data?: unknown; reason?: string } {
    // TODO: implement proper structure/type checking
    if (data && typeof data === 'object' && 'id' in data && 'fileName' in data) {
      return { valid: true, data };
    }
    return { valid: false, reason: 'Missing required fields' };
  }
}
