<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';

import Config from './components/Config.vue';
import Debug from '@renderer/components/Debug.vue';
import StarBrowser from '@renderer/components/StarBrowser.vue';
import StarCanvas from '@renderer/components/StarCanvas.vue';
import StarDetails from '@renderer/components/StarDetails.vue';

import { error, loading } from './loader';
import { getStarName } from './helper';
import { browser, config, selectedStar, details, menu } from './state';

const theme = useTheme();

const themeIcon = computed(() => (theme.global.current.value.dark ? 'dark_mode' : 'light_mode'));
const themeLabel = computed(() => (theme.global.current.value.dark ? 'Dark mode' : 'Light mode'));
const hasError = computed(() => error.value !== null);

function onMainMenuToggle(): void {
  menu.value = !menu.value;
  browser.value = false;
  config.value = false;
  details.value = false;
}
function onBrowserMenuToggle(): void {
  browser.value = !browser.value;
  config.value = false;
  details.value = false;
}
function onDetailsMenuToggle(): void {
  details.value = !details.value;
  browser.value = false;
  config.value = false;
}
function onConfigMenuToggle(): void {
  config.value = !config.value;
  browser.value = false;
  details.value = false;
}
function onThemeToggle(): void {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark';
}
</script>

<template>
  <v-app>
    <v-app-bar color="primary" density="compact" image="./assets/header.jpg">
      <v-progress-linear
        :active="loading"
        :indeterminate="loading"
        color="white"
        :height="4"
        absolute
        bottom
      />

      <template #image>
        <v-img eager gradient="to bottom, rgba(28,28,28,.1), rgba(10,10,30,1)"></v-img>
      </template>

      <template #prepend>
        <v-app-bar-nav-icon variant="text" @click.stop="onMainMenuToggle"></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title>{{ getStarName(selectedStar) }}</v-app-bar-title>

      <template #append>
        <v-btn icon @click="onThemeToggle">
          <v-icon :icon="themeIcon" />
          <v-tooltip activator="parent" location="bottom">{{ themeLabel }}</v-tooltip>
        </v-btn>
      </template>
    </v-app-bar>

    <v-navigation-drawer v-model="menu" disable-resize-watcher permanent rail>
      <v-list density="compact" nav>
        <v-list-item
          :active="browser"
          prepend-icon="manage_search"
          @click.stop="onBrowserMenuToggle"
        >
          <v-tooltip activator="parent">Browser</v-tooltip>
        </v-list-item>
        <v-list-item :active="details" prepend-icon="info" @click.stop="onDetailsMenuToggle">
          <v-tooltip activator="parent" location="bottom">Details</v-tooltip>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list density="compact" nav>
        <v-list-item :active="config" prepend-icon="settings" @click.stop="onConfigMenuToggle">
          <v-tooltip activator="parent" location="bottom">Config</v-tooltip>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-navigation-drawer v-model="browser" :width="300" disable-resize-watcher permanent>
      <star-browser />
    </v-navigation-drawer>

    <v-navigation-drawer v-model="details" :width="300" disable-resize-watcher permanent>
      <star-details />
    </v-navigation-drawer>

    <v-navigation-drawer v-model="config" :width="300" disable-resize-watcher permanent>
      <config />
    </v-navigation-drawer>

    <v-main><star-canvas /></v-main>

    <v-footer app :border="true" :height="22" :order="-1">
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
