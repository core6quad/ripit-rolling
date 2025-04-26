import { createApp, nextTick, onMounted } from 'vue'
import App from './App.vue'
import { router } from './router'
import NaiveUI from 'naive-ui'
import { attachMainConsoleToRenderer } from './lib/console-bridge'
import { createElectronBridgePlugin, useElectronBridge } from './plugins/electron-bridge'

const app = createApp(App)
app.use(NaiveUI)
app.use(router)
	.use(createElectronBridgePlugin())
app.mount('#app')

// window.onload = () => {
//   attachMainConsoleToRenderer();
// };

// onMounted(() => {
// 	nextTick(() => {
// 		const bridge = useElectronBridge();
// 		console.log('[MAIN][Registered], is bridge present=', !!bridge);
// 		bridge.onConsoleLog((level: string, args: any[]) => {
// 			if (console[level]) {
// 				console[level]('[Renderer]', ...args);
// 			} else {
// 				console.log('[Renderer]', ...args);
// 			}
// 		});
// 	});
// });