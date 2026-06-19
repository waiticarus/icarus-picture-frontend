<template>
  <div class="url-picture-upload">
    <div class="url-input-row">
      <a-input
        v-model:value="fileUrl"
        placeholder="粘贴图片链接到此处..."
        size="large"
        class="url-input"
      >
        <template #prefix><link-outlined class="url-prefix" /></template>
      </a-input>
      <a-button type="primary" size="large" :loading="loading" @click="handleUpload" class="url-submit-btn">
        <template #icon><rocket-outlined /></template>
        提交
      </a-button>
    </div>
    <div v-if="picture?.url" class="url-preview">
      <div class="preview-card">
        <img :src="picture?.url" alt="preview" />
        <div class="preview-badge">
          <check-circle-outlined />
          <span>上传成功</span>
        </div>
      </div>
    </div>
    <div v-else class="url-empty-state">
      <file-image-outlined class="empty-icon" />
      <p>粘贴图片链接后点击提交，即可将网络图片保存到云图库</p>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import PictureVO = API.PictureVO
import { uploadPictureByUrl } from '@/api/pictureController.ts'
import { LinkOutlined, RocketOutlined, CheckCircleOutlined, FileImageOutlined } from '@ant-design/icons-vue'

interface Props {
  picture?: PictureVO
  spaceId: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()
const fileUrl = ref<string>()

/**
 * 上传图片
 */
// const handleUpload = async () => {
//   loading.value = true
//   try {
//     const params = props.picture ? { id: props.picture.id } : {}
//     const res = await uploadPicture(params, {}, file)
//     if (res.data.code === 0 && res.data.data) {
//       message.success('图片上传成功')
//       props.onSuccess?.(res.data.data)
//     } else {
//       message.error('图片上传失败' + res.data.message)
//     }
//   } catch (error) {
//     console.error('图片上传失败' + error)
//     message.error('图片上传失败' + error.message)
//   }
//   loading.value = false
// }

const handleUpload = async () => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = { fileUrl: fileUrl.value }
    params.spaceId = props.spaceId
    if (props.picture) {
      params.id = props.picture.id
    }
    const res = await uploadPictureByUrl(params)
    if (res.data.code === 0 && res.data.data) {
      message.success({ content: '图片上传成功' })
      // 将上传成功的图片信息传递给父组件
      props.onSuccess?.(res.data.data)
    } else {
      message.error({ content: '图片上传失败，' + res.data.message })
    }
  } catch (error) {
    console.error('图片上传失败', error)
    message.error('图片上传失败' + error.message)
  }
  loading.value = false
}

const loading = ref<boolean>(false)
</script>
<style scoped>
/* ============================================
   URL 上传 — 行内输入 · 预览卡片 · 空状态提示
   ============================================ */

.url-picture-upload {
  margin-bottom: 0;
}

/* ---- 输入行 ---- */
.url-input-row {
  display: flex;
  gap: 12px;
}

.url-input {
  flex: 1;
}

.url-input :deep(.ant-input) {
  border-radius: 10px;
  border: 1px solid #e2e8f0;
  background: #fafbfc;
  font-size: 14px;
  transition: all 0.3s ease;
}

.url-input :deep(.ant-input):hover {
  border-color: #cbd5e1;
}

.url-input :deep(.ant-input):focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.06);
}

.url-prefix {
  color: #8c8c94;
  font-size: 15px;
}

.url-submit-btn {
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  height: 40px;
  min-width: 96px;
  background: linear-gradient(135deg, #1677ff 0%, #3b82f6 100%);
  border: none;
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.2);
  transition: all 0.3s ease;
}

.url-submit-btn:hover {
  background: linear-gradient(135deg, #4096ff 0%, #60a5fa 100%);
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.3);
  transform: translateY(-1px);
}

/* ---- 上传成功预览 ---- */
.url-preview {
  margin-top: 20px;
  text-align: center;
}

.preview-card {
  position: relative;
  display: inline-block;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.preview-card img {
  display: block;
  max-width: 100%;
  max-height: 460px;
}

.preview-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border-radius: 20px;
  color: #b7eb8f;
  font-size: 13px;
  font-weight: 500;
}

/* ---- 空状态 ---- */
.url-empty-state {
  margin-top: 20px;
  padding: 40px 0;
  text-align: center;
  border-radius: 12px;
  background: #fafbfd;
  border: 1px dashed #d9e2ec;
  transition: all 0.3s ease;
}

.url-empty-state:hover {
  border-color: #1677ff;
  background: rgba(22, 119, 255, 0.02);
}

.empty-icon {
  font-size: 36px;
  color: #d0d5dd;
  margin-bottom: 12px;
}

.url-empty-state p {
  margin: 0;
  font-size: 13px;
  color: #999;
}
</style>
