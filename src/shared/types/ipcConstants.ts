/**
 * IPC Constants for communication between main and renderer processes.
 * These constants are used for the IPC messages to ensure consistency
 * and type-safety across the application.
 */
export type IPCConstantsInvoke =
  | 'CID_GET_SOURCE_INFO'
  | 'CID_ADD_SOURCE'
  ;

export type IPCConstantsOn =
  | 'CID_ON_CONSOLE_LOG'
  ;


export const RIPIT_BRIDGE_NAME = 'electronBridge';