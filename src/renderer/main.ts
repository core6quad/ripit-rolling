// import { createApp } from 'vue';
// import App from './App.vue';

// createApp(App).mount('#app');

import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router'
import NaiveUI from 'naive-ui'
import { attachMainConsoleToRenderer } from './lib/console-bridge'

const app = createApp(App)
app.use(NaiveUI)
app.use(router)
app.mount('#app')

window.onload = () => {
	attachMainConsoleToRenderer();
};