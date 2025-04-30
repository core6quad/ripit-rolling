/**
 * SafeFileWriter
 *
 * Ensures serialized, non-concurrent writing to a file.
 * Supports JSON writing and simple read utility.
 */

import fs from 'fs/promises';

export class SafeFileWriter {
  private isWriting = false;
  private queue: (() => Promise<void>)[] = [];

  constructor(private filePath: string) {}

  /** Read file as UTF-8 string */
  async read(): Promise<string> {
    return await fs.readFile(this.filePath, 'utf-8');
  }

  /** Schedule a JSON-safe write to file */
  async scheduleWrite(data: any): Promise<void> {
    this.queue.push(() => this.writeInternal(data));
    if (!this.isWriting) {
      this.processQueue();
    }
  }

  /** Process queue one task at a time */
  private async processQueue(): Promise<void> {
    this.isWriting = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        try {
          await task();
        } catch (err) {
          console.error('File write error:', err);
        }
      }
    }
    this.isWriting = false;
  }

  /** Actual file write operation */
  private async writeInternal(data: any): Promise<void> {
    const json = JSON.stringify(data, null, 2);
    await fs.writeFile(this.filePath, json, 'utf-8');
  }
}
