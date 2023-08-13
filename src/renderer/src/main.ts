import { createApp } from 'vue';
import { createVuetify } from 'vuetify';
import { aliases, md } from 'vuetify/iconsets/md';
import App from '@renderer/App.vue';

// Import CSS
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'vuetify/styles';

// Configure Vuetify
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
