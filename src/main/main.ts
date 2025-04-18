import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as electrondl from "electron-dl";
import * as https from "https";
import * as os from "os";
import { spawn } from "child_process"; // Import spawn from child_process
import * as extract from "extract-zip"; // Import extract-zip for extracting archives
// import { dirname } from "path";
// import { fileURLToPath } from "url";

app.on("ready", () => {
	// const app = "../src/renderer/index.html";
	const root = __dirname?.slice(0, -5);
	const indexFile = path.join(root, "index.html");

	// dialog.showErrorBox("Error", `dir: ${root} `);

	// Проверяем, существует ли файл
	if (!fs.existsSync(indexFile)) {
		dialog.showErrorBox("Error", `File not found: ${indexFile}`);
		return;
	}

	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			// Enable preload script and isolate renderer from the main process
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			// enableRemoteModule: false,
		},
	});

	// Load the Vue application's HTML

	// console.log("Loading file: ", indexPath));
	mainWindow.loadFile(indexFile);
	mainWindow.webContents.openDevTools();

	// IPC handler to check file size
	ipcMain.handle("file-check", async (_event, filePath) => {
		try {
			// Use fs.statSync to get file stats
			const stats = fs.statSync(filePath);

			if (stats.isFile()) {
				return stats.size; // Return file size if the path points to a file
			}
			throw new Error("The specified path is not a file"); // Throw an error if it's not a file
		} catch (err) {
			throw err; // Rethrow any error for the renderer to handle
		}
	});
});

