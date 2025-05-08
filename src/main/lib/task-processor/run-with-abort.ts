import { exec, execFile, ExecOptions, ExecFileOptions, ChildProcess } from 'child_process';

const GRACEFUL_KILL_SIGNAL: NodeJS.Signals = 'SIGTERM';
/**
 * Runs a shell command using `exec` with AbortSignal support.
 * @param options - Command and exec options including `signal`
 * @returns Resolves with the process result (stdout, stderr, exit info)
 */
export async function execWithAbort(options: {
	command: string;
	signal?: AbortSignal;
} & ExecOptions): Promise<RunWithAbortResult> {
	return runWithAbort({
		...options,
		mode: 'exec',
	});
}

/**
 * Runs a binary using `execFile` with AbortSignal support.
 * @param options - File path, args, and exec options including `signal`
 * @returns Resolves with the process result (stdout, stderr, exit info)
 */
export async function execFileWithAbort(options: {
	file: string;
	args?: string[];
	signal?: AbortSignal;
} & ExecFileOptions): Promise<RunWithAbortResult> {
	return runWithAbort({
		...options,
		mode: 'execFile',
	});
}

/**
 * Specifies whether to use exec or execFile.
 */
type ExecMode = 'exec' | 'execFile';

export interface RunWithAbortBaseOptions {
	signal?: AbortSignal;
	// gracefulKillSignal?: NodeJS.Signals;
	forceKillDelayMs?: number;
}

export type RunWithAbortExecOptions = RunWithAbortBaseOptions & ExecOptions & {
	mode: 'exec';
	command: string;
};

export type RunWithAbortExecFileOptions = RunWithAbortBaseOptions & ExecFileOptions & {
	mode: 'execFile';
	file: string;
	args?: string[];
};

export type RunWithAbortOptions =
	| RunWithAbortExecOptions
	| RunWithAbortExecFileOptions;

export interface RunWithAbortResult {
	stdout: string;
	stderr: string;
	code: number | null;
	signal: NodeJS.Signals | null;
	aborted: boolean;
}

/**
 * Runs a child process (`exec` or `execFile`) with support for AbortSignal-based cancellation.
 * - Supports graceful shutdown via kill signal (default: SIGTERM)
 * - Can escalate to SIGKILL after a delay if the process doesn’t exit
 */
export function runWithAbort(options: RunWithAbortOptions): Promise<RunWithAbortResult> {
	const {
		signal,
		forceKillDelayMs = 5000,
		...execOptions
	} = options;

	let child: ChildProcess;
	let forceKillTimeout: NodeJS.Timeout | undefined;
	let killed = false;

	const maxBuffer = (execOptions as ExecOptions).maxBuffer ?? 3 * 1024 * 1024; // 3 MB
	(execOptions as ExecOptions).maxBuffer = maxBuffer;

	// Select exec or execFile based on mode
	if (options.mode === 'exec') {
		child = exec(options.command, execOptions as ExecOptions);
	} else {
		const args = options.args ?? [];
		child = execFile(options.file, args, execOptions as ExecFileOptions);
	}

	// Setup AbortSignal handling
	if (signal) {
		if (signal.aborted) {
			child.kill(GRACEFUL_KILL_SIGNAL);
		} else {
			const onAbort = () => {
				if (child.killed || killed) return;
				killed = true;

				console.log('[runWithAbort][Kill Lite]', { signal: signal.aborted });

				try {
					child.kill(GRACEFUL_KILL_SIGNAL);
				} catch (err) {
					console.warn('[runWithAbort] Graceful kill failed', err);
				}


				forceKillTimeout = setTimeout(() => {
					console.log('[runWithAbort][Kill Hard]', { killed: child.killed });
					if (!child.killed) {
						child.kill('SIGKILL');
					}
				}, forceKillDelayMs);
			};

			signal.addEventListener('abort', onAbort);

			child.once('exit', () => {
				console.log('[runWithAbort][exit] - removeEventListener',);
				signal.removeEventListener('abort', onAbort);
				if (forceKillTimeout) clearTimeout(forceKillTimeout);
			});
		}
	}

	return new Promise<RunWithAbortResult>((resolve, reject) => {
		let stdout = '';
		let stderr = '';

		if (child.stdout) {
			child.stdout.setEncoding('utf8');
			child.stdout.on('data', (chunk) => (stdout += chunk));
		}

		if (child.stderr) {
			child.stderr.setEncoding('utf8');
			child.stderr.on('data', (chunk) => (stderr += chunk));
		}

		// child.once('error', reject);
		child.once('error', (err) => {
			console.log('[runWithAbort][ERROR]', { err, signal: signal.aborted });
			if (signal.aborted) {
				resolve({
					stdout,
					stderr,
					code: null,
					signal: GRACEFUL_KILL_SIGNAL,
					aborted: signal.aborted,
				});
			} else {
				reject(err);
			}
		});

		child.once('exit', (code, _signal) => {
			console.log('[runWithAbort][exit]', { code, signal });
			resolve({
				stdout,
				stderr,
				code,
				signal: _signal,
				aborted: signal.aborted,
			});
		});
	});
}
