import { createApp } from 'vue';
import App from './App.vue';
import { stars } from './stars';

window.api.load().then((_stars) => {
  stars.value = _stars;
  createApp(App).mount('#app');
});
