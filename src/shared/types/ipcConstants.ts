/**
 * IPC Constants for communication between main and renderer processes.
 * These constants are used for all IPC messages to ensure consistency
 * and type-safety across the application.
 *
 * Invoke-type constants are used with ipcRenderer.invoke (request-response).
 * On-type constants are used with ipcRenderer.on (event-based).
 */

/**
 * List of all invoke IPC channels, used with ipcRenderer.invoke.
 */
export const allConstantsInvoke = [
  'CID_GET_SOURCE_INFO',   // Request media info by URL
  'CID_ADD_SOURCE',        // Add a new media file to database
  'CID_GET_LIST',          // Get the list of media sources

  'CID_RUN_TASK',          // Start a long-running background task
  'CID_ABORT_TASK',        // Abort a previously started task
] as const;

/**
 * Union type of all invoke IPC constants.
 */
export type IPCConstantsInvoke = typeof allConstantsInvoke[number];

/**
 * List of event-based (listener) channels, used with ipcRenderer.on.
 */
export type IPCConstantsOn =
  | 'CID_ON_CONSOLE_LOG'            // Console log forwarding from main
  | 'CID_ON_TASK_PROCESSOR_EVENT';  // Events emitted by TaskProcessor (progress, result, etc.)

/**
 * The name under which the ElectronBridge is exposed in window context.
 */
export const RIPIT_BRIDGE_NAME = 'electronBridge';
