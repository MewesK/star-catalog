<script setup lang="ts">
import { useLoadingBar } from 'naive-ui';
import { loading, stars } from '@renderer/stars';

const emit = defineEmits<{
  failed: [error: Error];
  loaded: [];
}>();

const loadingBar = useLoadingBar();

loadingBar.start();
window.api
  .load()
  .then((_stars) => {
    stars.value = _stars;
    loadingBar.finish();
    emit('loaded');
  })
  .catch((e: Error) => {
    loadingBar.error();
    emit('failed', e);
  })
  .finally(() => {
    loading.value = false;
  });
</script>
