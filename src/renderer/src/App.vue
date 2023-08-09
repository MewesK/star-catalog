<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useTheme } from 'vuetify';
import { loading, stars } from '@renderer/stars';
import { isDev } from '@renderer/helper';

import Debug from '@renderer/components/Debug.vue';
import StarBrowser from '@renderer/components/StarBrowser.vue';
import StarCanvas from '@renderer/components/StarCanvas.vue';
import StarDetails from '@renderer/components/StarDetails.vue';

const theme = useTheme();

const menu = ref(true);
const browser = ref(false);
const details = ref(false);

const error = ref<Error | null>(null);
const hasError = computed(() => error.value !== null);
const progress = ref(0);

onMounted(() => {
  window.api
    .load()
    .then((_stars) => {
      stars.value = _stars;
      progress.value = 100;
    })
    .catch((e: Error) => {
      error.value = e;
    })
    .finally(() => {
      loading.value = false;
    });
});
</script>

<template>
  <v-app>
    <v-app-bar color="primary" density="compact" image="./assets/carina_nebula.png">
      <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        color="white"
        height="4"
        absolute
        bottom
      />

      <template #image>
        <v-img eager gradient="to top right, rgba(19,84,122,.8), rgba(128,208,199,.8)"></v-img>
      </template>

      <template #prepend>
        <v-app-bar-nav-icon
          variant="text"
          @click.stop="
            menu = !menu;
            browser = false;
            details = false;
          "
        ></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>Space Catalog</v-app-bar-title>

      <template #append>
        <v-icon v-if="isDev" icon="code" title="Development mode" />
        <v-icon v-else icon="code_off" title="Production mode" />
        <v-btn
          v-if="theme.global.current.value.dark"
          icon="dark_mode"
          variant="text"
          title="Dark mode"
          @click="theme.global.name.value = 'light'"
        />
        <v-btn
          v-else
          icon="light_mode"
          variant="text"
          title="Light mode"
          @click="theme.global.name.value = 'dark'"
        />
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="menu" permanent rail>
      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="manage_search"
          value="browser"
          title="Browser"
          @click.stop="
            browser = !browser;
            details = false;
          "
        ></v-list-item>
        <v-list-item
          prepend-icon="info"
          value="details"
          title="Details"
          @click.stop="
            details = !details;
            browser = false;
          "
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer v-model="browser" width="250">
      <star-browser />
    </v-navigation-drawer>

    <v-navigation-drawer v-model="details" width="250">
      <star-details />
    </v-navigation-drawer>

    <v-main><star-canvas /></v-main>

    <v-footer app :border="true" :height="22" order="-1">
      <debug />
    </v-footer>

    <v-snackbar v-model="hasError">
      {{ error }}

      <template #actions>
        <v-btn color="red" variant="text" @click="error = null"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<style>
html {
  overflow: hidden !important;
}
</style>
