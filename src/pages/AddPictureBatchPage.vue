<template>
  <div id="addPictureBatchPage">
    <h2 style="margin-bottom: 16px">批量创建</h2>

    <a-form name="fromData" layout="vertical" :model="fromData" @finish="handleSubmit">
      <a-form-item name="searchText" label="关键词">
        <a-input v-model:value="fromData.searchText" placeholder="请输入关键词" allow-clear />
      </a-form-item>
      <a-form-item name="count" label="抓取数量">
        <a-input-number
          v-model:value="fromData.count"
          placeholder="请输入抓取数量"
          allow-clear
          style="min-width: 180px"
          :min="1"
          :max="30"
        />
      </a-form-item>
      <a-form-item name="namePrefix" label="名称前缀">
        <a-auto-complete
          v-model:value="fromData.namePrefix"
          placeholder="请输入名称前缀，系统会自动补全抓取图片序号"
          :options="categoryOptions"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading"
          >开始抓取</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { uploadPictureBatch } from '@/api/pictureController.ts'

const router = useRouter()
const route = useRoute()

// 表单数据
const fromData = reactive<API.PictureUploadByBatchRequest>({
  count: 10,
  searchText: '',
  namePrefix: '',
})

const loading = ref(false)
const categoryOptions = ref<string[]>([])

// 提交表单
const handleSubmit = async (values: any) => {
  loading.value = true
  try {
    // 直接发送请求，无需任何多余判断
    const res = await uploadPictureBatch({
      ...fromData,
    })
    if (res.data.code === 0) {
      // 修复模板字符串语法（必须用反引号``）
      message.success(`创建成功，共 ${res.data.data} 条`)
      router.push('/')
    } else {
      message.error('创建失败：' + res.data.message)
    }
  } catch (err) {
    message.error('请求失败')
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
#addPictureBatchPage {
  max-width: 720px;
  margin: 0 auto;
}
</style>
