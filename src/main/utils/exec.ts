import { spawn } from 'child_process';

/**
 * Run a shell command asynchronously with logging and error handling.
 */
export async function runCommand(
	command: string,
	args: string[],
	cwd?: string
): Promise<void> {
	return new Promise((resolve, reject) => {
		const proc = spawn(command, args, { cwd, shell: false });

		proc.stdout.on('data', data => process.stdout.write(`[stdout] ${data}`));
		proc.stderr.on('data', data => process.stderr.write(`[stderr] ${data}`));

		proc.on('close', code => {
			if (code === 0) resolve();
			else reject(new Error(`${command} exited with code ${code}`));
		});
	});
}
