<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useTheme } from 'vuetify';
import { stars } from '@renderer/stars';

import Debug from '@renderer/components/Debug.vue';
import StarBrowser from '@renderer/components/StarBrowser.vue';
import StarCanvas from '@renderer/components/StarCanvas.vue';
import StarDetails from '@renderer/components/StarDetails.vue';

const theme = useTheme();

const menu = ref(true);
const browser = ref(false);
const details = ref(false);

const error = ref<Error | null>(null);
const loading = ref(true);
const hasError = computed(() => error.value !== null);

const themeIcon = computed(() => (theme.global.current.value.dark ? 'dark_mode' : 'light_mode'));
const themeLabel = computed(() => (theme.global.current.value.dark ? 'Dark mode' : 'Light mode'));

function onMainMenuToggle(): void {
  menu.value = !menu.value;
  browser.value = false;
  details.value = false;
}
function onBrowserMenuToggle(): void {
  browser.value = !browser.value;
  details.value = false;
}
function onDetailsMenuToggle(): void {
  details.value = !details.value;
  browser.value = false;
}
function onThemeToggle(): void {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
}

onMounted(() => {
  setTimeout(() => {
    window.api
      .load()
      .then((data) => (stars.value = data))
      .catch((e: Error) => (error.value = e))
      .finally(() => (loading.value = false));
  }, 100);
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
        <v-app-bar-nav-icon variant="text" @click.stop="onMainMenuToggle"></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>Star Catalog</v-app-bar-title>

      <template #append>
        <v-btn icon @click="onThemeToggle">
          <v-icon :icon="themeIcon" />
          <v-tooltip activator="parent" location="bottom">{{ themeLabel }}</v-tooltip>
        </v-btn>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="menu" permanent rail :disable-resize-watcher="true">
      <v-list density="compact" nav>
        <v-list-item prepend-icon="manage_search" @click.stop="onBrowserMenuToggle">
          <v-tooltip activator="parent">Browser</v-tooltip>
        </v-list-item>
        <v-list-item prepend-icon="info" @click.stop="onDetailsMenuToggle">
          <v-tooltip activator="parent" location="bottom">Details</v-tooltip>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer v-model="browser" width="250" :disable-resize-watcher="true">
      <star-browser />
    </v-navigation-drawer>

    <v-navigation-drawer v-model="details" width="250" :disable-resize-watcher="true">
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
