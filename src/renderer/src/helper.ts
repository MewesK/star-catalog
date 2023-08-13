import { Star } from 'src/types';
import { reactive } from 'vue';

export const env = reactive({ ...window.electron.process.env });
export const versions = reactive({ ...window.electron.process.versions });
export const isDev = env.NODE_ENV_ELECTRON_VITE === 'development';

export function format(number: number): string {
  return Number(number).toFixed(2);
}

export function getStarName(star: Star | null): string {
  return star ? star.proper || star.bf || star.gl || `#${star.id}` : '';
}
