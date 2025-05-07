# runWithAbort — Safe Process Execution with Abort Support

This module provides a unified way to execute external commands via Node.js `exec` or `execFile`,
with proper support for cancellation using `AbortController`. It allows graceful shutdowns and escalated force termination.

---

## Features

- Supports both `exec` (shell command) and `execFile` (binary file with args)
- Allows graceful termination via `SIGTERM` (or another signal, but hardcoded as a constant here)
- Escalates to `SIGKILL` if the process does not terminate within a delay
- Buffers `stdout` and `stderr` streams until process exits
- Returns structured result with all output and exit metadata

---

## Constants

```ts
const GRACEFUL_KILL_SIGNAL: NodeJS.Signals = 'SIGTERM';
```

Used internally as the default graceful kill signal. If the process does not exit within 5 seconds, it is force-killed using `SIGKILL`.

---

## Usage

### `execWithAbort`

```ts
await execWithAbort({
  command: 'ls -la',
  signal: abortController.signal,
});
```

### `execFileWithAbort`

```ts
await execFileWithAbort({
  file: 'yt-dlp',
  args: ['--dump-json', 'https://youtube.com/watch?v=xyz'],
  signal: abortController.signal,
});
```

---

## API

### `execWithAbort(options): Promise<RunWithAbortResult>`

Executes a shell command using `child_process.exec`.

**Options:**
- `command`: string — the shell command to run
- `signal`: optional `AbortSignal`

---

### `execFileWithAbort(options): Promise<RunWithAbortResult>`

Executes a binary with arguments using `child_process.execFile`.

**Options:**
- `file`: string — the executable path
- `args`: string[] — command-line arguments
- `signal`: optional `AbortSignal`

---

### `runWithAbort(options): Promise<RunWithAbortResult>`

Low-level unified function behind both helpers. Chooses between `exec` and `execFile` based on `mode`.

Handles:
- Graceful shutdown using `SIGTERM` (constant)
- Escalation to `SIGKILL` after `forceKillDelayMs` (default: 5000ms)
- Output buffering (`stdout`, `stderr`)

---

## Types

```ts
type ExecMode = 'exec' | 'execFile';

interface RunWithAbortBaseOptions {
  signal?: AbortSignal;
  forceKillDelayMs?: number;
}

interface RunWithAbortExecOptions extends RunWithAbortBaseOptions, ExecOptions {
  mode: 'exec';
  command: string;
}

interface RunWithAbortExecFileOptions extends RunWithAbortBaseOptions, ExecFileOptions {
  mode: 'execFile';
  file: string;
  args?: string[];
}

type RunWithAbortOptions =
  | RunWithAbortExecOptions
  | RunWithAbortExecFileOptions;

interface RunWithAbortResult {
  stdout: string;
  stderr: string;
  code: number | null;
  signal: NodeJS.Signals | null;
}
```

---

## Notes

- If `signal.aborted` is already true before launch, the process is not started.
- `SIGTERM` is used as a soft kill and escalated to `SIGKILL` after a delay.
- The promise resolves only when the process exits or is killed.
- Useful when subprocess output (like from `yt-dlp`, `ffmpeg`) is needed after execution.
- Sets a default maxBuffer of 3MB unless overridden to prevent premature process failure due to large stdout/stderr.

---

## Limitations

- Not suitable for very large output unless `maxBuffer` is tuned.
- Does not provide stream access (not suitable for interactive processes).
- No retry or restart logic included — must be handled externally.
```
