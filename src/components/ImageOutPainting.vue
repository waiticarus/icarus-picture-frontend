<template>
  <a-modal
    class="image-out-painting"
    v-model:visible="visible"
    title="AI 扩图"
    :footer="false"
    @cancel="closeModal"
  >
    <a-row gutter="16">
      <a-col span="12">
        <h4>原始图片</h4>
        <img :src="picture?.url" :alt="picture?.name" style="max-width: 100%" />
      </a-col>
      <a-col span="12">
        <h4>扩图结果</h4>
        <img
          v-if="resultImageUrl"
          :src="resultImageUrl"
          :alt="picture?.name"
          style="max-width: 100%"
        />
      </a-col>
    </a-row>
    <div style="margin-bottom: 16px" />
    <a-flex gap="16" justify="center">
      <a-button type="primary" :loading="!!taskId" ghost @click="createTask"> 生成图片 </a-button>

      <a-button type="primary" v-if="resultImageUrl" :loading="uploadLoading" @click="handleUpload">
        应用结果
      </a-button>
    </a-flex>
  </a-modal>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import {
  createPictureOutPaintingTask,
  getPictureOutPaintingTask,
  uploadPictureByUrl, // 修复：移除了未使用的 uploadPicture 导入
} from '@/api/pictureController'
import { message } from 'ant-design-vue'

interface Props {
  picture?: API.PictureVO
  spaceId?: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()

const resultImageUrl = ref<string>('')

// 是否可见
const visible = ref(false)

// 打开弹窗
const openModal = () => {
  visible.value = true
}

// 关闭弹窗
const closeModal = () => {
  visible.value = false
}

// 暴露函数给父组件
defineExpose({
  openModal,
})

// 任务 id (修复：使用 const 声明 ref)
const taskId = ref<string>()

/**
 * 创建任务
 */
const createTask = async () => {
  if (!props.picture?.id) {
    return
  }

  try {
    const res = await createPictureOutPaintingTask({
      pictureId: props.picture.id,
      // 可以根据需要设置扩图参数
      parameters: {
        xScale: 2,
        yScale: 2,
      },
    })

    if (res.data.code === 0 && res.data.data) {
      // 修复：使用可选链 ?. 安全读取 taskId，防止 output 为 null 导致程序崩溃
      const newTaskId = res.data.data.output?.taskId

      if (!newTaskId) {
        message.error('创建任务成功，但未能获取到任务ID，请检查后端响应')
        console.warn('后端返回的异常数据：', res.data)
        return
      }

      message.success('正在扩图中，请耐心等待，不要关闭弹窗')
      taskId.value = newTaskId
      // 开启轮询
      startPolling()
    } else {
      message.error('创建任务失败，' + res.data.message)
    }
  } catch (error) {
    console.error('创建任务异常：', error)
    message.error('创建任务异常，请重试')
  }
}

// 轮询定时器
let pollingTimer: ReturnType<typeof setInterval> | null = null

// 清理轮询定时器
const clearPolling = () => {
  if (pollingTimer) {
    clearInterval(pollingTimer)
    pollingTimer = null
    // 修复 TS2322：将 null 改为 undefined，以匹配 ref<string>() 的类型
    taskId.value = undefined
  }
}

// 开始轮询
const startPolling = () => {
  if (!taskId.value) return

  pollingTimer = setInterval(async () => {
    // 修复 TS2322：提取局部变量进行类型收窄，保证 currentTaskId 绝对是 string
    const currentTaskId = taskId.value
    if (!currentTaskId) {
      clearPolling()
      return
    }

    try {
      const res = await getPictureOutPaintingTask({
        taskId: currentTaskId,
      })

      if (res.data.code === 0 && res.data.data) {
        const taskResult = res.data.data.output

        // 修复 TS18048：使用可选链 ?. 确保 taskResult 存在
        if (taskResult?.taskStatus === 'SUCCEEDED') {
          message.success('扩图任务成功')
          resultImageUrl.value = taskResult?.outputImageUrl || ''
          clearPolling()
        } else if (taskResult?.taskStatus === 'FAILED') {
          message.error('扩图任务失败')
          clearPolling()
        }
      }
    } catch (error) {
      console.error('轮询任务状态失败', error)
      message.error('检测任务状态失败，请稍后重试')
      clearPolling()
    }
  }, 3000) // 每隔 3 秒轮询一次
}

// 清理定时器，避免内存泄漏
onUnmounted(() => {
  clearPolling()
})

const uploadLoading = ref<boolean>(false)

const handleUpload = async () => {
  uploadLoading.value = true
  try {
    const params: API.PictureUploadRequest = {
      fileUrl: resultImageUrl.value,
      spaceId: props.spaceId,
    }
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrl(params)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
      // 关闭弹窗
      closeModal()
    } else {
      message.error('图片上传失败，' + res.data.message)
    }
  } catch (error) {
    console.error('图片上传异常：', error)
    message.error('图片上传失败')
  } finally {
    uploadLoading.value = false
  }
}
</script>

<style scoped>
.image-out-painting {
  text-align: center;
}
</style>
