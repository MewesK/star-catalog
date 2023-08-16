import { reactive } from 'vue';
import { Star } from 'src/types/Star';

export const env = reactive({ ...window.electron.process.env });
export const versions = reactive({ ...window.electron.process.versions });
export const isDev = env.NODE_ENV_ELECTRON_VITE === 'development';

export function format(number: number): string {
  return Number(number).toFixed(2);
}

export function getStarName(star: Star | null): string {
  if (star !== null) {
    if (star.proper) {
      return star.proper;
    }
    if (star.gl) {
      return star.gl;
    }
    if (star.bf) {
      return star.bf;
    }
    if (star.hip) {
      return `HIP ${star.hip}`;
    }
    return `#${star.id}`;
  }
  return ``;
}
