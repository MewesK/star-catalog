// Import CSS
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'vuetify/styles';

import App from '@renderer/App.vue';
import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import { aliases, md } from 'vuetify/iconsets/md';

// Configure Vuetify
const vuetify = createVuetify({
  icons: {
    defaultSet: 'md',
    aliases,
    sets: { md }
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        dark: false,
        colors: {
          primary: '#01579B'
        }
      },
      dark: {
        dark: true,
        colors: {
          primary: '#01579B'
        }
      }
    }
  }
});

createApp(App).use(vuetify).mount('#app');
