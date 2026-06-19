<template>
  <div class="picture-upload">
    <a-upload-dragger
      class="upload-dragger"
      :custom-request="handleUpload"
      :show-upload-list="false"
      :before-upload="beforeUpload"
    >
      <div v-if="picture?.url" class="uploaded-preview">
        <img :src="picture?.url" alt="preview" />
        <div class="preview-overlay">
          <swap-outlined />
          <span>点击更换图片</span>
        </div>
      </div>
      <div v-else class="upload-placeholder">
        <div class="upload-icon-ring">
          <cloud-upload-outlined v-if="!loading" />
          <loading-outlined v-else :spin="true" />
        </div>
        <p class="upload-title">将图片拖拽到此处，或点击上传</p>
        <p class="upload-hint">支持 JPG / PNG / WebP，单张不超过 2MB</p>
      </div>
    </a-upload-dragger>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { CloudUploadOutlined, LoadingOutlined, SwapOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import PictureVO = API.PictureVO
import { uploadPicture } from '@/api/pictureController.ts'

interface Props {
  picture?: PictureVO
  spaceId: number
  onSuccess?: (newPicture: API.PictureVO) => void
}

const props = defineProps<Props>()

/**
 * 上传图片
 */
const handleUpload = async ({ file }: { file: File }) => {
  loading.value = true
  try {
    const params: API.PictureUploadRequest = props.picture ? { id: props.picture.id } : {}
    params.spaceId = props.spaceId
    const res = await uploadPicture(params, {}, file)
    if (res.data.code === 0 && res.data.data) {
      message.success('图片上传成功')
      props.onSuccess?.(res.data.data)
    } else {
      message.error('图片上传失败' + res.data.message)
    }
  } catch (error) {
    console.error('图片上传失败' + error)
    message.error('图片上传失败' + error.message)
  }
  loading.value = false
}

const loading = ref<boolean>(false)

// 校验图片是否合规
const beforeUpload = (file: UploadProps['fileList'][number]) => {
  const isJpgOrPng =
    file.type === 'image/jpeg' ||
    file.type === 'image/png' ||
    file.type === 'image/webp' ||
    file.type === 'image/jpg'
  if (!isJpgOrPng) {
    message.error('不支持上传该格式的图片，推荐 jpg 或 png')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('上传图片大小不能超过 2MB')
  }
  return isJpgOrPng && isLt2M
}
</script>
<style scoped>
/* ============================================
   文件上传区 — 拖拽式 · 柔和渐变边框 · hover高亮
   ============================================ */

.picture-upload {
  width: 100%;
}

.upload-dragger {
  border-radius: 14px !important;
  border: 2px dashed #d9e2ec;
  background: #fafbfd;
  transition: all 0.3s ease;
}

.upload-dragger:hover {
  border-color: #1677ff;
  background: rgba(22, 119, 255, 0.02);
  box-shadow: 0 0 0 4px rgba(22, 119, 255, 0.04);
}

.upload-dragger :deep(.ant-upload-drag-container) {
  padding: 32px 0;
}

/* ---- 空状态：上传占位 ---- */
.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.upload-icon-ring {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(22, 119, 255, 0.08) 0%, rgba(59, 130, 246, 0.06) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: #1677ff;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.upload-dragger:hover .upload-icon-ring {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(22, 119, 255, 0.12);
}

.upload-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
}

.upload-hint {
  margin: 0;
  font-size: 13px;
  color: #999;
}

/* ---- 已上传预览 ---- */
.uploaded-preview {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
}

.uploaded-preview img {
  display: block;
  max-width: 100%;
  max-height: 460px;
  width: auto;
  margin: 0 auto;
  object-fit: contain;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 10px;
}

.uploaded-preview:hover .preview-overlay {
  opacity: 1;
}
</style>
