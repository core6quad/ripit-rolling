import { app, BrowserWindow, ipcMain, dialog, shell, contextBridge, ipcRenderer } from "electron";
import * as path from "path";
import { getFileSize } from "./handlers/file.handlers";
import contextMenu from 'electron-context-menu';
import { fileExists } from "./utils/file-checks";
import { appInit } from "./init/init";
import { registerCoreServices, serviceContainer } from "./services/services";
// import { appInit, getIndexPath } from "./init/init";

const RIPIT_INDEX_FILE = 'index.html';

// app.on("ready", async () => {
app.whenReady().then(async () => {
	try {

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

		// services init
		registerCoreServices(() => mainWindow);
		await serviceContainer.get('console');

		// attachMainConsoleToRenderer();
		// Load the Vue application's HTML

		const root = __dirname?.slice(0, -5);
		const indexFile = path.join(root, RIPIT_INDEX_FILE);
		const fileExist = await fileExists(indexFile);
		if (!fileExist) {
			throw new Error(`Application integrity check failed: index file not found at ${indexFile}`);
		}

		console.log('[Loading]', indexFile);
		mainWindow.loadFile(indexFile);

		console.log('[Loading] open devTools');
		mainWindow.webContents.openDevTools();

		contextMenu({
			showSaveImageAs: true,
			showCopyImage: true,
			showInspectElement: true,
		});

		// IPC handlers
		ipcMain.handle("file-check", getFileSize);

		console.log('[Loading] Init');
		try {
			const initRes = await appInit();
		} catch (err) {
			console.error("App init error:", err);
		}
	} catch (err) {
		console.error('App starting error:', err);
		dialog.showErrorBox("Ops, something went wrong", (err as Error).message);
	}
});


