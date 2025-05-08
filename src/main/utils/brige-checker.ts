import { ipcMain } from 'electron';
import { ElectronBridge } from '../../shared/types/electron-bridge';
import { allConstantsInvoke } from '../../shared/types/ipcConstants';

/**
 * Validates that all methods defined in the shared ElectronBridge type
 * have corresponding IPC handlers registered on the main process (ipcMain).
 *
 * This ensures that the main process can handle all expected messages
 * sent from the renderer process, helping to avoid silent failures or
 * runtime errors due to missing IPC listeners.
 *
 * @param bridge - An object representing the expected IPC method signatures.
 *                 Typically imported from a shared module used by both
 *                 the main and renderer processes.
 *
 * @throws Error if any expected IPC method does not have a registered listener.
 */
export function validateElectronBridge(bridge: ElectronBridge) {
	// Extract the list of method names that should be handled on ipcMain
	const requiredMethods = Object.keys(bridge) as (keyof ElectronBridge)[];

	requiredMethods.forEach(method => {
		// Check if ipcMain has any listeners for the given method
		if (!ipcMain.listenerCount(method)) {
			throw new Error(`Handler for "${method}" is missing in ipcMain.`);
		}
	});

	console.log('All handlers are present for the ElectronBridge.');
}

/**
 * Validates that all expected IPC invoke handlers (via `ipcMain.handle`) 
 * are registered on the main process.
 * 
 * This function inspects the internal `_invokeHandlers` map of `ipcMain` (private API)
 * to ensure that every channel defined in `allConstantsInvoke` has a corresponding handler.
 * 
 * It's useful for debugging or runtime verification in development, to avoid
 * missing IPC command implementations.
 * 
 * ⚠️ Uses private Electron internals (`_invokeHandlers`), which may break between versions.
 *
 * @throws Error if the `_invokeHandlers` map is missing or any expected channel is not handled.
 */
export function validateIpcInvokeHandlers() {
	// Access the private _invokeHandlers map (not part of public Electron API)
	const handlers = (ipcMain as any)._invokeHandlers as Map<string, Function>;

	console.log('[HandlersCheck] _invokeHandlers size =', handlers?.size);

	if (!handlers) {
		throw new Error('ipcMain._invokeHandlers not found');
	}

	// Iterate over all expected channels and verify that a handler is registered
	allConstantsInvoke.forEach((channel) => {
		const hasHandler = handlers.has(channel);
		console.log('[HandlersCheck] Channel:', channel, 'Registered:', hasHandler);

		if (!hasHandler) {
			throw new Error(`Missing ipcMain.handle() for channel: '${channel}'`);
		}
	});
}
