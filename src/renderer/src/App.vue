<script setup lang="ts">
import { ref } from 'vue';
import {
  darkTheme,
  NConfigProvider,
  NLoadingBarProvider,
  NLayout,
  NLayoutHeader,
  NLayoutSider,
  NLayoutFooter,
  NLayoutContent,
  NSpace,
  NGlobalStyle
} from 'naive-ui';
import StarBrowser from './components/StarBrowser.vue';
import StarCanvas from './components/StarCanvas.vue';
import StarDetails from './components/StarDetails.vue';
import Debug from './components/Debug.vue';
import Loader from './components/Loader.vue';

const starCanvas = ref<typeof StarCanvas | null>(null);
</script>

<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="{ common: { fontWeightStrong: '600' } }">
    <n-global-style />
    <n-loading-bar-provider>
      <loader />
      <div style="height: 100vh; position: relative">
        <n-layout position="absolute">
          <n-layout-header bordered style="height: 64px; padding: 24px">
            <n-space justify="center">
              <StarDetails />
            </n-space>
          </n-layout-header>
          <n-layout
            has-sider
            position="absolute"
            sider-placement="right"
            style="top: 64px; bottom: 64px"
          >
            <n-layout-content>
              <StarCanvas ref="starCanvas" />
            </n-layout-content>
            <n-layout-sider
              bordered
              content-style="padding: 24px;"
              show-trigger="bar"
              :collapsed-width="0"
              :native-scrollbar="false"
              :width="240"
            >
              <StarBrowser></StarBrowser>
            </n-layout-sider>
          </n-layout>
          <n-layout-footer bordered position="absolute" style="height: 64px; padding: 24px">
            <n-space justify="center">
              <Debug />
            </n-space>
          </n-layout-footer>
        </n-layout>
      </div>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<style>
.n-layout-header,
.n-layout-footer {
  background: rgba(128, 128, 128, 0.2);
}

.n-layout-sider {
  background: rgba(128, 128, 128, 0.3);
}

.n-layout-content {
  background: rgba(128, 128, 128, 0.4);
}
</style>
