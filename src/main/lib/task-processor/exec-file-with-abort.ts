import { execFile, ExecFileOptions, ChildProcess } from 'child_process';

/**
 * Options for abort-aware execFile.
 */
export interface ExecFileWithAbortOptions extends ExecFileOptions {
  signal?: AbortSignal;
  gracefulKillSignal?: NodeJS.Signals;
  forceKillDelayMs?: number;
}

/**
 * Result of execFileWithAbort.
 */
export interface ExecResult {
  stdout: string;
  stderr: string;
  code: number | null;
  signal: NodeJS.Signals | null;
  process: ChildProcess;
}

/**
 * Executes a file with abort signal support.
 * Sends graceful signal first, escalates to SIGKILL after timeout.
 */
export function execFileWithAbort(
  file: string,
  args: ReadonlyArray<string>,
  options: ExecFileWithAbortOptions = {}
): Promise<ExecResult> {
  const {
    signal,
    gracefulKillSignal = 'SIGTERM',
    forceKillDelayMs = 5000,
    ...execOptions
  } = options;

  return new Promise((resolve, reject) => {
    const child = execFile(file, args, {
      ...execOptions,
      maxBuffer: execOptions.maxBuffer ?? 10 * 1024 * 1024, // 10 MB
    });

    let stdout = '';
    let stderr = '';
    let killed = false;
    let forceTimeout: NodeJS.Timeout | undefined;

    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    // Abort logic
    if (signal) {
      const onAbort = () => {
        if (killed || child.killed) return;
        killed = true;
        child.kill(gracefulKillSignal);

        forceTimeout = setTimeout(() => {
          if (!child.killed) {
            child.kill('SIGKILL');
          }
        }, forceKillDelayMs);
      };

      if (signal.aborted) {
        onAbort();
      } else {
        signal.addEventListener('abort', onAbort);
        child.once('exit', () => {
          signal.removeEventListener('abort', onAbort);
          if (forceTimeout) clearTimeout(forceTimeout);
        });
      }
    }

    child.once('error', (err) => {
      reject(err);
    });

    child.once('exit', (code, sig) => {
      resolve({
        stdout,
        stderr,
        code,
        signal: sig,
        process: child,
      });
    });
  });
}
