<template>
	<div id="app">
		<h1>Ripit</h1>
		<input type="text" v-model="filePath" placeholder="Enter URL to download" if="urlinput" />
		<!-- <button @click="checkFileSize">Check file size</button>
		<p v-if="error" style="color: red;">{{ error }}</p>
		<p v-if="fileSize">File size: {{ fileSize }} bytes</p> -->
		<button @click="begindownload()">Download</button>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
// const { ipcRenderer } = window.require("electron"); // Electron's ipcRenderer will allow us to communicate with the main process.
const { electron } = window; // Exposed via contextBridge

export default defineComponent({
	name: "App",
	data() {
		return {
			filePath: "", // The file path input by the user
			fileSize: null as number | null, // The size of the file (in bytes)
			error: null as string | null, // Error message, if any
		};
	},
	methods: {
		// Sends the file path to the main process via ipcRenderer and retrieves the file size.
		async checkFileSize() {
			this.error = null; // Reset any previous error
			try {
				// ipcRenderer.invoke sends the file path and waits for the size from main process
				const size = await electron.invoke("file-check", this.filePath);
				this.fileSize = size; // Store the returned file size
			} catch (err: any) {
				this.error = `Error: ${err.message}`; // Handle the error returned from main process
			}
		},
		async begindownload() {
			try {
				// ipcRenderer.invoke sends the file path and waits for the size from main process
				await electron.invoke("file-download", this.filePath);
			} catch (err: any) {
				this.error = `Error: ${err.message}`; // Handle the error returned from main process
			}
		},
	},
});
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}

input {
	width: 300px;
	padding: 10px;
}

button {
	padding: 10px;
	margin-left: 10px;
}
</style>