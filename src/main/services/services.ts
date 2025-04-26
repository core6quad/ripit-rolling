/**
 * services.ts
 * 
 * This file defines the application's service container and registers core services.
 * 
 * - `AppServices` is the type map of all services used throughout the application.
 * - `serviceContainer` is an instance of TypedServiceContainer, providing lazy-loaded, typed access to services.
 * - `registerCoreServices()` registers core services such as ConsoleService and others.
 * 
 * Usage:
 * 
 * import { serviceContainer } from './services';
 * const consoleService = await serviceContainer.get('console');
 * 
 * You can override services for testing:
 * serviceContainer.override('console', new MockConsoleService());
 * 
 * This setup enables dependency injection and allows easy swapping of services, 
 * especially useful for mocking in tests or replacing implementations in different environments.
 */

import { BrowserWindow } from 'electron';
import { ConsoleService } from '../lib/services/console-service';
import { TypedServiceContainer } from '../lib/services/service-container';
import { YTDLPService } from '../../main/services/ytdlp-service';

interface AppServices {
  console: ConsoleService;
  ytdlp: YTDLPService;
}

export const serviceContainer = new TypedServiceContainer<AppServices>();

export function registerCoreServices(getWindow: () => BrowserWindow | null) {
  serviceContainer.register('console', () => new ConsoleService(getWindow));
  serviceContainer.register('ytdlp', () => new YTDLPService(getWindow));
}
