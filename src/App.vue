<script setup lang="ts">
import BasicLayout from '@/layouts/BasicLayout.vue'
// import { health } from '@/api/mainController.ts'
// import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import zhCN from 'ant-design-vue/es/locale/zh_CN'

// health().then((res) => {
//   console.log(res)
// })
//
// const loginUserStore = useLoginUserStore()
// loginUserStore.fetchLoginUser()
</script>

<template>
  <div id="app">
    <a-config-provider :locale="zhCN">
      <BasicLayout />
    </a-config-provider>
  </div>
</template>

<style scoped></style>
