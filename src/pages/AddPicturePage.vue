<template>
  <div id="addPicturePage">
    <!-- 顶部装饰条 -->
    <div class="page-header">
      <div class="header-icon">
        <plus-circle-outlined />
      </div>
      <h2 class="page-title">
        {{ route.query?.id ? '修改图片' : '上传新作品' }}
      </h2>
      <p class="page-subtitle">将你珍藏的图片分享到云图库，让更多人看见</p>
    </div>

    <!-- 空间提示 -->
    <a-typography-paragraph v-if="spaceId" class="space-tip">
      <send-outlined class="space-icon" />
      保存至空间：
      <a :href="`/space/${spaceId}`" target="_blank">{{ spaceId }}</a>
    </a-typography-paragraph>

    <!-- 主卡片：上传区 -->
    <div class="main-card">
      <a-tabs v-model:activeKey="uploadType" class="upload-tabs">
        <a-tab-pane key="file" tab="文件上传">
          <template #tab>
            <div class="tab-label">
              <cloud-upload-outlined />
              <span>文件上传</span>
            </div>
          </template>
          <PictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
        </a-tab-pane>
        <a-tab-pane key="url" tab="URL上传" force-render>
          <template #tab>
            <div class="tab-label">
              <link-outlined />
              <span>URL 上传</span>
            </div>
          </template>
          <UrlPictureUpload :picture="picture" :spaceId="spaceId" :onSuccess="onSuccess" />
        </a-tab-pane>
      </a-tabs>
    </div>

    <!-- 操作工具栏 -->
    <div v-if="picture" class="toolbar-card">
      <div class="toolbar-label">
        <tool-outlined />
        <span>图片工具</span>
      </div>
      <a-space size="middle" class="toolbar-actions">
        <a-button class="tool-btn edit-btn" :icon="h(EditOutlined)" @click="doEditPicture">
          编辑图片
        </a-button>
        <a-button class="tool-btn ai-btn" :icon="h(FullscreenOutlined)" @click="doImagePainting">
          AI 扩图
        </a-button>
      </a-space>
      <ImageCropper
        ref="imageCropperRef"
        :imageUrl="picture?.url"
        :picture="picture"
        :space="space"
        :spaceId="spaceId"
        :onSuccess="onCropSuccess"
        @close="handleCropperClose"
      />
      <ImageOutPainting
        ref="imageOutPaintingRef"
        :picture="picture"
        :spaceId="spaceId"
        :onSuccess="onImageOutPaintingSuccess"
      />
    </div>

    <!-- 表单卡片 -->
    <div v-if="picture" class="form-card">
      <div class="form-header">
        <edit-outlined class="form-header-icon" />
        <span>完善信息</span>
      </div>
      <a-form
        name="pictureFrom"
        layout="vertical"
        :model="pictureFrom"
        @finish="handleSubmit"
      >
        <a-row :gutter="16">
          <a-col :span="12">
            <a-form-item name="name" label="名称">
              <a-input
                v-model:value="pictureFrom.name"
                placeholder="给你的作品起个名字吧"
                allow-clear
                class="styled-input"
              >
                <template #prefix><file-text-outlined class="input-prefix-icon" /></template>
              </a-input>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="category" label="分类">
              <a-auto-complete
                v-model:value="pictureFrom.category"
                placeholder="选择或输入分类"
                :options="categoryOptions"
                allow-clear
                class="styled-autocomplete"
              >
                <template #prefix><folder-outlined class="input-prefix-icon" /></template>
              </a-auto-complete>
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item name="introduction" label="简介">
          <a-textarea
            v-model:value="pictureFrom.introduction"
            placeholder="用一段话描述这张图片的故事吧..."
            allow-clear
            :auto-size="{ minRows: 2, maxRows: 5 }"
            class="styled-textarea"
          />
        </a-form-item>

        <a-form-item name="tags" label="标签">
          <a-select
            v-model:value="pictureFrom.tags"
            mode="tags"
            placeholder="输入标签后按回车添加"
            :options="tagOptions"
            allow-clear
            class="styled-select"
          >
            <template #prefix><tags-outlined class="input-prefix-icon" /></template>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-button type="primary" html-type="submit" class="submit-btn" size="large">
            <template #icon><rocket-outlined /></template>
            {{ route.query?.id ? '保存修改' : '发布作品' }}
          </a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import PictureUpload from '@/components/PictureUpload.vue'
import UrlPictureUpload from '@/components/UrlPictureUpload.vue'
import { computed, onMounted, reactive, ref, h, watchEffect } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { editPicture, getPictureVoById, listPictureTagCategory } from '@/api/pictureController.ts'
import ImageCropper from '@/components/ImageCropper.vue'
import { EditOutlined, FullscreenOutlined, PlusCircleOutlined, CloudUploadOutlined, LinkOutlined, ToolOutlined, FileTextOutlined, FolderOutlined, TagsOutlined, RocketOutlined, SendOutlined } from '@ant-design/icons-vue'
import ImageOutPainting from '@/components/ImageOutPainting.vue'
import { getSpaceVoById } from '@/api/spaceController.ts'
const router = useRouter()
const spaceId = computed(() => {
  return route.query?.spaceId
})

const picture = ref<API.PictureVO>()

const pictureFrom = reactive<API.EditPictureRequest>({})

const uploadType = ref<'file' | 'url'>('file')

const onSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
  pictureFrom.name = newPicture.name
}

const handleSubmit = async (values: Record<string, unknown>) => {
  const pictureId = picture.value?.id
  if (!pictureId) {
    return
  }
  const res = await editPicture({
    id: pictureId,
    spaceId: spaceId.value,
    ...values,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    router.push({
      path: `/picture/${pictureId}`,
    })
  } else {
    message.error('创建失败' + res.data.message)
  }
}

const categoryOptions = ref<string[]>([])
const tagOptions = ref<string[]>([])

const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategory()
  if (res.data.code === 0 && res.data.data) {
    tagOptions.value = (res.data.data.tags ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categories ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('获取标签列表失败' + res.data.message)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})

const route = useRoute()

const getOldPicture = async () => {
  const id = route.query?.id
  // const id = Number(route.params.id)
  if (id) {
    const res = await getPictureVoById({
      id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      picture.value = data
      pictureFrom.name = data.name
      pictureFrom.introduction = data.introduction
      pictureFrom.category = data.category
      pictureFrom.tags = data.tags
    }
  }
}

onMounted(() => {
  getOldPicture()
})

// 图片编辑弹窗引用
const imageCropperRef = ref()

// 编辑图片
const doEditPicture = () => {
  if (imageCropperRef.value) {
    imageCropperRef.value.openModal()
  }
}

// 编辑成功事件
const onCropSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

// AI 扩图弹窗引用
const imageOutPaintingRef = ref()

// AI 扩图
const doImagePainting = () => {
  if (imageOutPaintingRef.value) {
    imageOutPaintingRef.value.openModal()
  }
}

// 编辑成功事件
const onImageOutPaintingSuccess = (newPicture: API.PictureVO) => {
  picture.value = newPicture
}

const space = ref<API.SpaceVO>()

// 获取空间信息
const fetchSpace = async () => {
  // 获取数据
  if (spaceId.value) {
    const res = await getSpaceVoById({
      id: spaceId.value,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    }
  }
}

watchEffect(() => {
  fetchSpace()
})

// 🚨 新增：当收到裁剪弹窗关闭的信号时，静默拉取一次最新数据
const handleCropperClose = () => {
  // getOldPicture() 会重新去后端查一次当前这张图的最新状态，并替换掉本地的 picture.value
  getOldPicture()
}
</script>

<style scoped>
/* ============================================
   创建图片页 — 沉浸式卡片 · 柔和渐变 · 图标语义化
   ============================================ */

/* ---- 根容器 ---- */
#addPicturePage {
  max-width: 760px;
  margin: -8px auto 40px;
  padding: 0 16px;
}

/* ======== 页面顶部 ======== */
.page-header {
  text-align: center;
  margin-bottom: 28px;
  padding-top: 8px;
}

.header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #1677ff 0%, #3b82f6 100%);
  box-shadow: 0 8px 20px rgba(22, 119, 255, 0.2);
  margin-bottom: 14px;
  font-size: 26px;
  color: #fff;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 6px;
  color: #1a1a2e;
  letter-spacing: 0.5px;
}

.page-subtitle {
  margin: 0;
  font-size: 14px;
  color: #888;
  font-weight: 400;
}

/* ---- 空间提示条 ---- */
.space-tip {
  text-align: center;
  margin-bottom: 20px;
  padding: 8px 16px;
  background: rgba(22, 119, 255, 0.06);
  border-radius: 10px;
  font-size: 13px;
  color: #555;
}

.space-tip a {
  font-weight: 600;
  color: #1677ff;
}

.space-icon {
  margin-right: 4px;
  color: #1677ff;
}

/* ======== 主卡片：上传区 ======== */
.main-card {
  background: #fff;
  border-radius: 18px;
  padding: 24px 28px;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
  transition: box-shadow 0.3s ease;
}

.main-card:hover {
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.07),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

/* Tab 标签定制 */
.upload-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 20px;
}

.upload-tabs :deep(.ant-tabs-tab) {
  font-size: 15px;
  font-weight: 500;
  padding: 10px 20px;
  color: #5a5a72;
  transition: all 0.25s;
}

.upload-tabs :deep(.ant-tabs-tab-active) {
  font-weight: 600;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}

/* ======== 工具栏卡片 ======== */
.toolbar-card {
  background: #fff;
  border-radius: 18px;
  padding: 20px 28px;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.04);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 24px;
}

.toolbar-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #3a3a4a;
  white-space: nowrap;
}

.toolbar-actions {
  flex: 1;
}

.tool-btn {
  border-radius: 10px;
  font-weight: 500;
  letter-spacing: 0.3px;
  transition: all 0.25s ease;
  border: 1px solid #e8ecf1;
  background: #fafbfc;
  color: #3a3a4a;
  padding: 0 18px;
  height: 38px;
}

.tool-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.edit-btn:hover {
  border-color: #1677ff;
  color: #1677ff;
  background: rgba(22, 119, 255, 0.04);
}

.ai-btn {
  border: 1px solid rgba(22, 119, 255, 0.2);
  background: linear-gradient(135deg, rgba(22, 119, 255, 0.04) 0%, rgba(59, 130, 246, 0.04) 100%);
  color: #1677ff;
}

.ai-btn:hover {
  border-color: #1677ff;
  background: linear-gradient(135deg, rgba(22, 119, 255, 0.08) 0%, rgba(59, 130, 246, 0.1) 100%);
}

/* ======== 表单卡片 ======== */
.form-card {
  background: #fff;
  border-radius: 18px;
  padding: 28px 32px;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.form-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f2f5;
}

.form-header-icon {
  color: #1677ff;
  font-size: 17px;
}

/* 输入框统一样式 */
.styled-input :deep(.ant-input),
.styled-textarea :deep(textarea),
.styled-autocomplete :deep(.ant-input),
.styled-select :deep(.ant-select-selector) {
  border-radius: 10px !important;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  background: #fafbfc;
  font-size: 14px;
}

.styled-input :deep(.ant-input):hover,
.styled-textarea :deep(textarea):hover,
.styled-autocomplete :deep(.ant-input):hover,
.styled-select :deep(.ant-select-selector):hover {
  border-color: #cbd5e1;
  background: #fff;
}

.styled-input :deep(.ant-input):focus,
.styled-textarea :deep(textarea):focus,
.styled-autocomplete :deep(.ant-input):focus,
.styled-select :deep(.ant-select-selector):focus {
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.08);
}

.input-prefix-icon {
  color: #8c8c94;
  font-size: 15px;
}

/* 表单 label */
.form-card :deep(.ant-form-item-label > label) {
  font-size: 13px;
  font-weight: 500;
  color: #555;
}

/* ---- 提交按钮 ---- */
.submit-btn {
  width: 100%;
  height: 46px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none !important;
  background: linear-gradient(135deg, #1677ff 0%, #3b82f6 100%) !important;
  box-shadow: 0 4px 14px rgba(22, 119, 255, 0.25);
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #4096ff 0%, #60a5fa 100%) !important;
  box-shadow: 0 6px 20px rgba(22, 119, 255, 0.35);
  transform: translateY(-1px);
}

.submit-btn:active {
  transform: translateY(1px);
}
</style>
