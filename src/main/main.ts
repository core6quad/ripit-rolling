import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
// import contextMenu from "electron-context-menu";
import { fileExists } from "./utils/file-checks";
import { appInit } from "./init/init";
import { serviceContainer } from "./services/service-container";
import { TaskProcessor } from "./lib/task-processor/task-processor";
import { analyzeMediaInfoTask } from "./tasks/analyze-media-info-task";
import { validateIpcInvokeHandlers } from "./utils/brige-checker";

const RIPIT_INDEX_FILE = "index.html";

// Called when the Electron app is ready
app.whenReady().then(async () => {
	try {
		// Create the main application window
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

		console.log("[Loading] open devTools");
		mainWindow.webContents.openDevTools({ mode: "right" });

		console.log("[Loading] mainWindow created");

		// Initialize a task processor to handle background tasks
		const taskProcessor = new TaskProcessor((event) => {
			// Send task events to the renderer
			mainWindow.webContents.send("CID_ON_TASK_PROCESSOR_EVENT", event);
		});

		// Register supported task types
		taskProcessor.register("analyze-media-info", analyzeMediaInfoTask);

		// Register IPC handler to run a task
		ipcMain.handle("CID_RUN_TASK", async (event, task: { type: string; payload: any }) => {
			const { type, payload } = task;
			try {
				const taskId = taskProcessor.run(task);
				return taskId;
			} catch (err) {
				console.error(`Failed to start task of type "${type}"`, err);
				throw err; // This error will propagate to the renderer
			}
		});

		// Register IPC handler to abort a task
		ipcMain.handle("CID_ABORT_TASK", async (event, taskId: string) => {
			const success = taskProcessor.abort(taskId);
			return { success };
		});

		// Register core application services and expose mainWindow to them
		serviceContainer.registerCoreServices(() => mainWindow);

		// Trigger lazy initialization of consoleService
		await serviceContainer.consoleService;

		// Validate index.html existence to ensure application integrity
		const root = __dirname?.slice(0, -5);
		const indexFile = path.join(root, RIPIT_INDEX_FILE);
		const fileExist = await fileExists(indexFile);
		if (!fileExist) {
			throw new Error(`Application integrity check failed: index file not found at ${indexFile}`);
		}

		console.log("[Loading] index file:", indexFile);
		mainWindow.loadFile(indexFile);

		// Enable right-click context menu with useful options
		// contextMenu({
		// 	showSaveImageAs: true,
		// 	showCopyImage: true,
		// 	showInspectElement: true,
		// });

		// Initialize custom services
		console.log("[Loading][ytdlpService] run");
		await (await serviceContainer.ytdlpService).handleAll();

		console.log("[Loading][queueService] run");
		const queueService = await serviceContainer.queueService;
		await queueService.init();
		await queueService.handleAll();

		// Validate that all expected IPC handlers are registered
		validateIpcInvokeHandlers();

		// Final app-level initialization logic
		console.log("[Loading] App init");
		try {
			const initRes = await appInit();
		} catch (err) {
			console.error("App init error:", err);
		}
	} catch (err) {
		// Fallback error handler — shows a dialog if app fails to start
		console.error("App starting error:", err);
		dialog.showErrorBox("Ops, something went wrong", (err as Error).message);
	}
});
