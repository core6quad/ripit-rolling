/**
 * Vue plugin for accessing Electron's contextBridge API in a type-safe and modular way.
 *
 * This plugin provides a single shared bridge interface (`ElectronBridge`) that is exposed from
 * the Electron `preload.ts` script via `contextBridge.exposeInMainWorld`, and made available
 * throughout the Vue application using Vue's dependency injection system (`provide` / `inject`).
 *
 * ✅ Ensures strict TypeScript typing across renderer and preload layers  
 * ✅ Centralizes bridge access (no need to touch `window.electronBridge` in components)  
 * ✅ Keeps business logic and platform logic decoupled and modular
 *
 * ---
 * 🔧 Usage:
 *
 * In `main.ts` of the renderer process:
 * ```ts
 * import { createElectronBridgePlugin } from './plugins/electron-bridge';
 *
 * const app = createApp(App);
 * app.use(createElectronBridgePlugin());
 * app.mount('#app');
 * ```
 *
 * In any Vue component:
 * ```ts
 * import { useElectronBridge } from '@/plugins/electron-bridge';
 *
 * const bridge = useElectronBridge();
 * const result = await bridge.getSourceByUrl('https://...');
 * ```
 *
 * ---
 * 🧩 Requirements:
 * - `window.electronBridge` must be exposed in preload via `contextBridge.exposeInMainWorld`
 * - `ElectronBridge` interface must be defined and shared between preload and renderer
 *
 * @module electron-bridge-plugin
 */

import type { App } from 'vue';
import { inject } from 'vue';
import { validateElectronBridge, type ElectronBridge } from '../../shared/types/electron-bridge';
import { RIPIT_BRIDGE_NAME } from '../../shared/types/ipcConstants';

export const ElectronBridgeKey = Symbol(RIPIT_BRIDGE_NAME);

export const createElectronBridgePlugin = () => ({
	install(app: App) {
		// 👇 проверка, что объект существует
		if (!window[RIPIT_BRIDGE_NAME]) {
			console.error('ElectronBridge not found in window');
		}
		app.provide(ElectronBridgeKey, window[RIPIT_BRIDGE_NAME] as ElectronBridge);
		console.warn('[ElectronBridge] is provided', window[RIPIT_BRIDGE_NAME]);
	}
});

export function useElectronBridge(): ElectronBridge {
	// Try to get the bridge from injected value
	// let bridge = inject<ElectronBridge>(ElectronBridgeKey);

	// If bridge is not injected, use the global window.electronBridge
	// if (!bridge && typeof window !== 'undefined' && window['electronBridge']) {
	// 	console.warn('[ElectronBridge] is not injected');
	// 	bridge = window['electronBridge'] as ElectronBridge;
	// }

	// console.warn('[ElectronBridge] bridge:', bridge);

	// If bridge is still not found, throw an error
	const bridge = window[RIPIT_BRIDGE_NAME] as ElectronBridge;

	if (!bridge) {
		throw new Error('ElectronBridge not provided');
	}

	if (!validateElectronBridge(bridge)) {
		throw new Error('ElectronBridge provided, but some handlers are missing');
	}

	return bridge;
}
