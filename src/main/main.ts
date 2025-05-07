import { app, BrowserWindow, ipcMain, dialog, shell, contextBridge, ipcRenderer } from "electron";
import * as path from "path";
import contextMenu from 'electron-context-menu';
import { fileExists } from "./utils/file-checks";
import { appInit } from "./init/init";
import { serviceContainer } from "./services/service-container";
import { allConstantsInvoke } from "../shared/types/ipcConstants";
import { TaskProcessor } from "./lib/task-processor/task-processor";
import { analyzeMediaInfoTask } from "./tasks/analyze-media-info-task";

const RIPIT_INDEX_FILE = 'index.html';

// app.on("ready", async () => {
app.whenReady().then(async () => {
	try {
		const mainWindow = new BrowserWindow({
			width: 800,
			height: 600,
			minWidth: 400,
			minHeight: 300,
			webPreferences: {
				// Enable preload script and isolate renderer from the main process
				preload: path.join(__dirname, "preload.js"),
				contextIsolation: true,
				webSecurity: false,
				nodeIntegration: false,
				// enableRemoteModule: false,
			},
		});
		console.log('[Loading] open devTools');
		mainWindow.webContents.openDevTools({ mode: 'right' });

		console.log('[Loading] mainWindow created');

		// Initialize TaskProcessor after mainWindow is ready
		const taskProcessor = new TaskProcessor((event) => {
			// Send event updates back to the renderer process
			// console.log('[TaskProcessor][emit]:', event);
			mainWindow.webContents.send('CID_ON_TASK_PROCESSOR_EVENT', event);
		});

		// Register supported task types
		// taskProcessor.register('download', exampleDownloadTask);
		taskProcessor.register('analyze-media-info', analyzeMediaInfoTask);

		ipcMain.handle('CID_RUN_TASK', async (event, task: { type: string; payload: any }) => {
			const { type, payload } = task;
			try {
				const taskId = taskProcessor.run(task);
				return taskId;
			} catch (err) {
				console.error(`Failed to start task of type "${type}"`, err);
				throw err; // will be catched on UI side
			}
		});

		ipcMain.handle('CID_ABORT_TASK', async (event, taskId: string) => {
			const success = taskProcessor.abort(taskId);
			return { success };
		});

		// services init
		serviceContainer.registerCoreServices(() => mainWindow)
		await serviceContainer.consoleService; // create service on first access

		const root = __dirname?.slice(0, -5);
		const indexFile = path.join(root, RIPIT_INDEX_FILE);
		const fileExist = await fileExists(indexFile);
		if (!fileExist) {
			throw new Error(`Application integrity check failed: index file not found at ${indexFile}`);
		}

		console.log('[Loading] index file:', indexFile);
		mainWindow.loadFile(indexFile);

		contextMenu({
			showSaveImageAs: true,
			showCopyImage: true,
			showInspectElement: true,
		});

		// IPC handlers
		// ipcMain.handle("file-check", getFileSize);

		console.log('[Loading][ytdlpService] run');
		await (await serviceContainer.ytdlpService).handleAll();

		console.log('[Loading][queueService] run');
		const queueService = await serviceContainer.queueService;
		await queueService.init();
		await queueService.handleAll();

		validateIpcInvokeHandlers();

		console.log('[Loading] App init');
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


function validateIpcInvokeHandlers() {
	console.log('[HandlersCheck] _invokeHandlers=', ((ipcMain as any)._invokeHandlers as Map<string, Function>).size)
	const handlers = (ipcMain as any)._invokeHandlers as Map<string, Function>;
	if (!handlers) {
		throw new Error('ipcMain._invokeHandlers not found');
	}

	allConstantsInvoke.forEach((channel) => {
		console.log('[HandlersCheck]CID=', channel, handlers.has(channel));
		if (!handlers.has(channel)) {
			throw new Error(`Missing ipcMain.handle() for channel: '${channel}'`);
		}
	});
}