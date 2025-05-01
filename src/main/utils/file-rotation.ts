// src/main/utils/file-rotation.ts

import fs from 'fs';
import path from 'path';

export class FileRotationUtil {
  private readonly maxBackupFiles: number;  // Maximum number of backup files to keep
  private readonly backupFilePrefix: string; // Prefix for backup files
  private readonly directory: string;       // Directory where the files are located

  constructor(directory: string, maxBackupFiles: number = 10, backupFilePrefix: string = 'queue_') {
    this.directory = directory;
    this.maxBackupFiles = maxBackupFiles;
    this.backupFilePrefix = backupFilePrefix;
  }

  /**
   * Perform file rotation: create a backup of the current queue file 
   * and delete old backups if necessary. 
   * The new backup is created by copying the current database file.
   */
  async rotateAndBackup(): Promise<void> {
    const currentFilePath = path.join(this.directory, 'queue.json');
    const backupFileName = await this.getNextBackupFileName();
    const backupFilePath = path.join(this.directory, backupFileName);

    try {
      // Copy the current database file to the backup location
      await fs.promises.copyFile(currentFilePath, backupFilePath);
      console.log(`Backup created: ${backupFileName}`);

      // Perform the file rotation: delete old backups if necessary
      await this.performFileRotation();
    } catch (error) {
      console.error(`Error creating backup or performing rotation: ${error.message}`);
    }
  }

  /**
   * Get the next backup file name based on the current timestamp.
   * This uses the current timestamp for uniqueness.
   * @returns {string} The next backup file name.
   */
  private async getNextBackupFileName(): Promise<string> {
    // Get the current timestamp in milliseconds
    const timestamp = Date.now();
    return `${this.backupFilePrefix}${timestamp}.json`;
  }

  /**
   * Rotate backup files: if there are more than the maximum allowed, delete the oldest ones.
   * Only the latest files are kept, and older backups are deleted.
   */
  private async performFileRotation(): Promise<void> {
    const files = await fs.promises.readdir(this.directory);
    const queueFiles = files.filter(file => file.startsWith(this.backupFilePrefix) && file.endsWith('.json'));

    // If the number of backup files exceeds the max allowed, delete the oldest ones
    if (queueFiles.length > this.maxBackupFiles) {
      // Sort files by modification time (oldest first)
      queueFiles.sort((a, b) => {
        const aPath = path.join(this.directory, a);
        const bPath = path.join(this.directory, b);
        const aStats = fs.statSync(aPath);
        const bStats = fs.statSync(bPath);
        return aStats.mtimeMs - bStats.mtimeMs; // Sorting by modification date (oldest first)
      });

      // Delete the oldest file
      const oldestFile = queueFiles[0];
      const oldestFilePath = path.join(this.directory, oldestFile);

      try {
        await fs.promises.unlink(oldestFilePath);
        console.log(`Deleted oldest backup file: ${oldestFile}`);
      } catch (error) {
        console.error(`Error deleting backup file: ${oldestFile}. ${error.message}`);
      }
    }
  }
}
