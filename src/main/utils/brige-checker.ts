import { ipcMain } from 'electron';
import { ElectronBridge } from '../../shared/types/electron-bridge';

// Проверяем, что все методы, описанные в ElectronBridge, имеют обработчики в ipcMain
export function validateElectronBridge(bridge: ElectronBridge) {
  // Получаем список методов, которые должны быть на ipcMain
  const requiredMethods = Object.keys(bridge) as (keyof ElectronBridge)[];

  requiredMethods.forEach(method => {
    if (!ipcMain.listenerCount(method)) {
      throw new Error(`Handler for ${method} is missing in ipcMain.`);
    }
  });

  console.log('All handlers are present for the ElectronBridge.');
}
