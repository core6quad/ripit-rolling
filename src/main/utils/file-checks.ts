import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fsp from 'fs/promises';

const execFileAsync = promisify(execFile);

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fsp.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Runs a given executable with a version argument and returns its version string.
 * @param path - Full path to the executable file.
 * @param verArg - Version argument (e.g., '--version' or '-v').
 * @returns The version string if successful, or null if an error occurs.
 */
async function getFileVersion(path: string, verArg: string): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync(path, [verArg]);
    return stdout.trim();
  } catch (error) {
    console.error(`Failed to get version from ${path}:`, error);
    return null;
  }
}
