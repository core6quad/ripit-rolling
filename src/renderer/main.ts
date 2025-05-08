import { createApp, nextTick, onMounted } from 'vue'
import App from './App.vue'
import { router } from './router'
import NaiveUI from 'naive-ui'
import { createElectronBridgePlugin, useElectronBridge } from './plugins/electron-bridge'
import { TaskProcessorPlugin } from './plugins/task-processor'

const app = createApp(App)
app.use(NaiveUI)
app.use(router)
app.use(createElectronBridgePlugin())
app.use(TaskProcessorPlugin)
app.mount('#app');
