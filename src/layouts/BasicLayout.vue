<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>

      <a-layout class="main-wrapper">
        <GlobalSider class="sider" />
        <a-layout-content class="content">
          <router-view />
        </a-layout-content>
      </a-layout>

      <a-layout-footer class="footer">
        <a href="https://www.qidian.com/book/1004986152/" target="_blank">云图库 By Linxi</a>
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<script setup lang="ts">
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalSider from '@/components/GlobalSider.vue'
</script>

<style scoped>
#basicLayout .header {
  padding-inline: 20px;
  background: transparent;
  color: unset;
  margin-bottom: 1px;
}

/* 改动 2：新增这个 class 的相对定位 */
#basicLayout .main-wrapper {
  position: relative;
}

/* 之前那段错误的 // 注释已经被彻底删除了 */

#basicLayout :deep(.ant-layout) {
  background: transparent;
}

#basicLayout :deep(.ant-menu-root) {
  border-bottom: none !important;
  border-inline-end: none !important;
}

#basicLayout .content {
  padding: 28px;
  background: transparent;
  margin-bottom: 0;
}

#basicLayout .footer {
  background: rgba(239, 239, 239, 0.65);
  backdrop-filter: blur(12px) saturate(1.2);
  -webkit-backdrop-filter: blur(12px) saturate(1.2);
  padding: 16px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.4);
}
</style>
