import { IpcRendererEvent, contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';
import { Star } from '../types';

// Custom APIs for renderer
const api = {
  load: (): Promise<Star[]> => ipcRenderer.invoke('load'),
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
