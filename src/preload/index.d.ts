import { ElectronAPI } from '@electron-toolkit/preload';
import { Star } from 'src/types';

declare global {
  interface Window {
    electron: ElectronAPI;
    api: {
      load(): Promise<void>;
      onUpdate(callback: (event: IpcRendererEvent, stars: Star[]) => void): void;
    };
  }
}
