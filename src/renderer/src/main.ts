import { createApp } from 'vue';
import App from '@renderer/App.vue';

// Vuetify
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { aliases, md } from 'vuetify/iconsets/md';

const vuetify = createVuetify({
  icons: {
    defaultSet: 'md',
    aliases,
    sets: { md }
  },
  theme: {
    defaultTheme: 'dark'
  }
});

createApp(App).use(vuetify).mount('#app');
