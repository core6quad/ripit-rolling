/**
 * AppServiceContainer is a service container that manages core services for the application.
 * 
 * It extends the `TypedServiceContainer` class and registers essential services like `console`, 
 * `ytdlp`, and `queue` with their respective factories. It also provides named getters for easy access
 * to the registered services.
 * 
 * Features:
 * - Registers core services using `registerCoreServices`.
 * - Provides named getters for each service (`consoleService`, `ytdlpService`, `queueService`).
 * 
 * Usage:
 * 
 * const container = new AppServiceContainer();
 * container.registerCoreServices(getWindow);  // register core services
 * 
 * const consoleService = container.consoleService;  // access the console service
 * const ytdlpService = container.ytdlpService;    // access the ytdlp service
 * const queueService = container.queueService;    // access the queue service
 */

import { BrowserWindow } from "electron";
import { ConsoleService } from "../lib/services/console-service";
import { QueueStore } from "../lib/services/queue-store-service";
import { TypedServiceContainer } from "../lib/services/service-container";
import { YTDLPService } from "./ytdlp-service";
import { JsonQueueStore } from "./json-queue-store-service";

// Define the services that will be managed by the container
interface AppServices {
	console: ConsoleService;
	ytdlp: YTDLPService;
	queue: QueueStore;
}

/**
 * AppServiceContainer is a concrete implementation of the TypedServiceContainer, 
 * responsible for registering and managing core application services.
 */
class AppServiceContainer extends TypedServiceContainer<AppServices> {
	// Register core services with their respective factories
	registerCoreServices(getWindow: () => BrowserWindow | null) {
		this.register('console', () => new ConsoleService(getWindow));
		this.register('ytdlp', () => new YTDLPService(getWindow));
		this.register('queue', () => new JsonQueueStore());
		console.log('[Service Container] core services added');
	}

	// Named getter for console service
	get consoleService() {
		return this.get('console');
	}

	// Named getter for ytdlp service
	get ytdlpService() {
		return this.get('ytdlp');
	}

	// Named getter for queue service
	get queueService(): Promise<QueueStore> {
		return this.get('queue');
	}
}

// Create a global instance of the AppServiceContainer
export const serviceContainer = new AppServiceContainer();