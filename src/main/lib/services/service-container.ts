/**
 * src/main/lib/services/service-container.ts
 * TypedServiceContainer is a lightweight dependency injection container
 * designed for managing services with lazy initialization and strong typing.
 * 
 * Features:
 * - Register service factories using `register(key, factory)`
 * - Retrieve services with `await get(key)` (initializes only once)
 * - Override services (e.g. for testing) with `override(key, mock)`
 * - Clear all cached instances with `clear()`
 *
 * Usage:
 * 
 * interface Services {
 *   settings: SettingsService;
 *   downloader: DownloaderService;
 * }
 *
 * const container = new TypedServiceContainer<Services>();
 * 
 * container.register('settings', () => new SettingsService());
 * container.register('downloader', async () => await createDownloader());
 * 
 * const settings = await container.get('settings');
 */

type ServiceFactory<T> = () => T | Promise<T>;

export abstract class TypedServiceContainer<TMap extends Record<string, any>> {
  private instances = new Map<keyof TMap, any>();
  private factories = new Map<keyof TMap, ServiceFactory<any>>();

  register<K extends keyof TMap>(key: K, factory: ServiceFactory<TMap[K]>) {
    this.factories.set(key, factory);
  }

  async get<K extends keyof TMap>(key: K): Promise<TMap[K]> {
    if (!this.instances.has(key)) {
      const factory = this.factories.get(key);
      if (!factory) throw new Error(`No factory registered for "${String(key)}"`);
      const instance = await factory();
      this.instances.set(key, instance);
    }
    return this.instances.get(key);
  }

  override<K extends keyof TMap>(key: K, mock: TMap[K]) {
    this.instances.set(key, mock);
  }

  clear() {
    this.instances.clear();
  }

  // Abstract method to register core services
  abstract registerCoreServices(...args: any[] | null): void;
}
