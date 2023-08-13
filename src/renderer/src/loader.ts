import { IpcRendererEvent } from 'electron';
import { ref } from 'vue';
import { stars } from './state';
import { Star } from 'src/types';

export const error = ref<Error | null>(null);
export const loading = ref(true);

const start = performance.now();
let starBuffer = [] as Star[];

window.api.onUpdate((_event: IpcRendererEvent, starChunk: Star[]) => {
  if (starChunk.length > 0) {
    starBuffer.push(...starChunk);
  } else {
    console.log(`Finished loading: ${performance.now() - start} ms`);
    stars.value = starBuffer;
    starBuffer = [];
    loading.value = false;
  }
});

window.api.load().catch((e: Error) => (error.value = e));
