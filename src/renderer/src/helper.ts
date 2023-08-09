import { reactive } from 'vue';

export const env = reactive({ ...window.electron.process.env });
export const versions = reactive({ ...window.electron.process.versions });
export const isDev = env.NODE_ENV_ELECTRON_VITE === 'development';
export function format(number: number): string {
  return Number(number).toFixed(2);
}
