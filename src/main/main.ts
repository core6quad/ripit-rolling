import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import * as fs from "fs";
import * as path from "path";
import * as electrondl from "electron-dl";
import * as https from "https";
import * as os from "os";
import { spawn } from "child_process"; // Import spawn from child_process
import * as extract from "extract-zip"; // Import extract-zip for extracting archives
import { getFileSize } from "./handlers/file.handlers";
import { resolveYtDlpUrl } from "./yt-dlp";
import { downloadFile2 } from "./filedown";


app.on("ready", () => {
	const indexFile = getIndexPath();
	if (!indexFile) {
		dialog.showErrorBox("Application Error, Something went wrong", `Index file not found: ${indexFile}`);
		return;
	}

	// downloadFile2(resolveYtDlpUrl(), './loaded_test')
	// .then((_) => dialog.showErrorBox("Done", 'done'));

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

	// IPC handlers
	ipcMain.handle("file-check", getFileSize);
});


function getIndexPath(): string {
	// const app = "../src/renderer/index.html";
	const root = __dirname?.slice(0, -5);
	const indexFile = path.join(root, "index.html");

	// dialog.showErrorBox("Error", `dir: ${root} `);

	// Проверяем, существует ли файл
	if (!fs.existsSync(indexFile)) {
		return;
	}
	return indexFile;
}
