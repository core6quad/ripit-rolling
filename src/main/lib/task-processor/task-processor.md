```ts
// Initialize TaskProcessor after mainWindow is ready
		const taskProcessor = new TaskProcessor((event) => {
			// Send event updates back to the renderer process
			mainWindow.webContents.send('CID_ON_TASK_PROCESSOR_EVENT', event);
		});

		// Register supported task types
		taskProcessor.register('download', exampleDownloadTask);

		ipcMain.handle('run-task', async (event, task: { type: string; payload: any }) => {
			const { type, payload } = task;
			try {
				const taskId = taskProcessor.run(task);
				return taskId;
			} catch (err) {
				console.error(`Failed to start task of type "${type}"`, err);
				throw err; // will be catched on UI side
			}
		});

		ipcMain.handle('abort-task', async (event, taskId: string) => {
			const success = taskProcessor.abort(taskId);
			return { success };
		});
		```