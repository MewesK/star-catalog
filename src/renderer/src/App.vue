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
  NGlobalStyle
} from 'naive-ui';
import StarBrowser from '@renderer/components/StarBrowser.vue';
import StarCanvas from '@renderer/components/StarCanvas.vue';
import StarDetails from '@renderer/components/StarDetails.vue';
import Debug from '@renderer/components/Debug.vue';
import Loader from '@renderer/components/Loader.vue';

const loaded = ref(false);
</script>

<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="{ common: { fontWeightStrong: '600' } }">
    <n-global-style />
    <n-loading-bar-provider>
      <loader @loaded="loaded = true" />
      <div style="height: 100vh; position: relative">
        <n-layout v-if="loaded" position="absolute">
          <n-layout-header bordered>
            <star-details />
          </n-layout-header>
          <n-layout
            has-sider
            position="absolute"
            sider-placement="right"
            style="top: 64px; bottom: 48px"
          >
            <n-layout-content>
              <star-canvas />
            </n-layout-content>
            <n-layout-sider
              bordered
              show-trigger="bar"
              :collapsed-width="0"
              :default-collapsed="true"
              :native-scrollbar="false"
              :width="240"
              :show-collapsed-content="false"
            >
              <star-browser />
            </n-layout-sider>
          </n-layout>
          <n-layout-footer bordered position="absolute">
            <debug />
          </n-layout-footer>
        </n-layout>
      </div>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<style>
.n-layout-header {
  height: 64px;
  background: rgba(128, 128, 128, 0.2);
  display: flex;
  align-items: center;
  padding-left: 1rem;
}

.n-layout-sider {
  background: rgba(128, 128, 128, 0.3);
}

.n-layout-content {
  background: rgba(128, 128, 128, 0.4);
}

.n-layout-footer {
  height: 48px;
  background: rgba(128, 128, 128, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
