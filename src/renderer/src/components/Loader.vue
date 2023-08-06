<script setup lang="ts">
import { useLoadingBar } from 'naive-ui';
import { loading, stars } from '@renderer/stars';

const loadingBar = useLoadingBar();

loadingBar.start();
window.api
  .load()
  .then((_stars) => {
    stars.value = _stars;
    loadingBar.finish();
  })
  .finally(() => {
    loading.value = false;
    loadingBar.error();
  });
</script>
