import { electronAPI } from '@electron-toolkit/preload';
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

import { Star } from '../types/Star';

// Custom APIs for renderer
const api = {
  load: (): Promise<void> => ipcRenderer.invoke('load'),
  onUpdate: (callback: (event: IpcRendererEvent, stars: Star[]) => void): void => {
    ipcRenderer.on('update', callback);
  }
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
