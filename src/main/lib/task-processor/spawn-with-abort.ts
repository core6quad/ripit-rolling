import { spawn, SpawnOptions } from 'child_process';

const gracefulKillSignal: NodeJS.Signals = 'SIGTERM';

/**
 * Additional options for spawning a child process with abort support.
 */
export interface SpawnWithAbortOptions extends SpawnOptions {
	signal?: AbortSignal;
	forceKillDelayMs?: number; // Time to wait before killing the process forcibly
}

/**
 * Final status of the spawned process.
 */
export interface SpawnResult {
	/**
	 * - 'completed' — exited normally with code 0
	 * - 'failed' — exited with error (non-zero code)
	 * - 'aborted' — aborted by AbortSignal
	 * - 'terminated' — forcibly killed (SIGKILL after timeout)
	 */
	doneCode: 'completed' | 'failed' | 'aborted' | 'terminated';
}

/**
 * Spawns a child process with AbortSignal support.
 * Handles graceful termination and fallback to force kill.
 */
export function spawnWithAbort(
	command: string,
	args: ReadonlyArray<string>,
	options: SpawnWithAbortOptions = {}
): Promise<SpawnResult> {
	const {
		signal,
		forceKillDelayMs = 5000,
		...spawnOpts
	} = options;

	if (signal?.aborted) {
		return Promise.resolve({ doneCode: 'aborted' });
	}

	const child = spawn(command, args, {
		stdio: 'pipe',
		...spawnOpts,
	});

	let killed = false;
	let forceKilled = false;
	let forceKillTimeout: NodeJS.Timeout | undefined;

	// Setup abort logic
	if (signal) {
		const onAbort = () => {
			if (child.killed || killed) return;
			killed = true;

			child.kill(gracefulKillSignal);

			// Schedule force kill after timeout
			forceKillTimeout = setTimeout(() => {
				if (!child.killed) {
					forceKilled = true;
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
				if (forceKillTimeout) clearTimeout(forceKillTimeout);
			});
		}
	}

	return new Promise<SpawnResult>((resolve, reject) => {
		child.once('error', reject);
		child.once('exit', (code) => {
			if (signal?.aborted) {
				resolve({ doneCode: forceKilled ? 'terminated' : 'aborted' });
			} else if (code === 0) {
				resolve({ doneCode: 'completed' });
			} else {
				resolve({ doneCode: 'failed' });
			}
		});
	});
}
