# `spawnWithAbort` Utility

This utility wraps Node.js's `child_process.spawn` function to add support for `AbortSignal`-based cancellation, with both graceful and forceful termination strategies.

## Function Signature

```ts
export function spawnWithAbort(  
  command: string,  
  args: ReadonlyArray<string>,  
  options: SpawnWithAbortOptions = {}  
): Promise<SpawnResult>
```

## Parameters

- `command`: The command to run (e.g., `ffmpeg`, `yt-dlp`, `cat`).
- `args`: Array of string arguments passed to the command.
- `options`: An object extending Node’s `SpawnOptions`, with extra support for:
  - `signal?: AbortSignal` – an optional cancellation signal.
  - `forceKillDelayMs?: number` – optional timeout (default 5000ms) before forcing `SIGKILL`.

## Return Value

A promise that resolves to:

```ts
SpawnResult {
  doneCode: 'completed' | 'failed' | 'aborted' | 'terminated';
}
```

- `completed` — process exited with code 0.
- `failed` — process exited with a non-zero code.
- `aborted` — process was gracefully aborted via AbortSignal.
- `terminated` — process was forcibly killed (SIGKILL).

## Behavior and Features

- If `AbortSignal` is triggered **before** the process is started, it throws early with an `Aborted before process started` error.
- If the process is running and `AbortSignal` is triggered:
  - First, a graceful kill signal (`SIGTERM`) is sent.
  - After `forceKillDelayMs` (default: 5 seconds), it sends `SIGKILL` if the process hasn’t exited.
- The function waits for the process to fully exit before resolving the result.

## Usage Examples

### Graceful cancellation

```ts
const controller = new AbortController();
setTimeout(() => controller.abort(), 3000);

try {
  const result = await spawnWithAbort('sleep', ['10'], { signal: controller.signal });
  console.log('Result:', result.doneCode);
} catch (err) {
  console.error('Error:', err);
}
```

### Handling result codes

```ts
if (result.doneCode === 'failed') {
  // handle process failure
} else if (result.doneCode === 'aborted') {
  // handle user cancellation
}
```

## Design Notes

- Internally, the process is spawned with `stdio: 'pipe'` to allow future extensions (streaming).
- This function is useful for cases where:
  - You care only about whether a task completed, failed, or was aborted.
  - You don't need stdout/stderr. If you do, consider enhancing the return type.

## Limitations

- Does not expose `stdout`, `stderr`, or `stdin` directly.
- For output-capturing, use `execWithAbort` or `execFileWithAbort`.

## See Also

- `execWithAbort`
- `execFileWithAbort`
