<template>
  <div id="pictureDetailPage">
    <!-- 顶部导航栏 -->
    <div class="page-header">
      <a-button type="text" class="back-btn" @click="router.back()">
        <template #icon><ArrowLeftOutlined /></template>
      </a-button>
      <div class="header-info">
        <h1 class="page-title">{{ picture.name ?? '图片详情' }}</h1>
        <span class="header-meta">作者：{{ picture.user?.userName ?? '未知' }}</span>
      </div>
    </div>

    <!-- 主体布局 -->
    <div class="detail-body">
      <!-- 左侧：图片预览 -->
      <div class="preview-section">
        <a-spin :spinning="loading" tip="加载中...">
          <div class="preview-container">
            <a-image :src="picture.url" class="preview-image" />
          </div>
        </a-spin>
      </div>

      <!-- 右侧：信息与操作 -->
      <div class="info-section">
        <!-- 基本信息卡片 -->
        <div class="info-card">
          <div class="card-header">
            <span class="card-title">基本信息</span>
          </div>
          <div class="card-body">
            <div class="info-row">
              <span class="info-label">作者</span>
              <span class="info-value">
                <a-space>
                  <a-avatar :size="26" :src="picture.user?.userAvatar" />
                  <span>{{ picture.user?.userName }}</span>
                </a-space>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">名称</span>
              <span class="info-value name-value">{{ picture.name ?? '未命名' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">简介</span>
              <span class="info-value intro-value">{{ picture.introduction || '-' }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">分类</span>
              <span class="info-value">
                <a-tag color="green">{{ picture.category ?? '默认' }}</a-tag>
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">标签</span>
              <span class="info-value">
                <template v-if="picture.tags?.length">
                  <a-tag v-for="tag in picture.tags" :key="tag" color="purple">{{ tag }}</a-tag>
                </template>
                <span v-else class="empty-text">-</span>
              </span>
            </div>
          </div>
        </div>

        <!-- 图片参数卡片 -->
        <div class="info-card">
          <div class="card-header">
            <span class="card-title">图片参数</span>
          </div>
          <div class="card-body tech-grid">
            <div class="tech-item">
              <span class="tech-label">格式</span>
              <span class="tech-value">{{ picture.picFormat ?? '-' }}</span>
            </div>
            <div class="tech-item">
              <span class="tech-label">尺寸</span>
              <span class="tech-value">{{ picture.picWidth }} × {{ picture.picHeight }}</span>
            </div>
            <div class="tech-item">
              <span class="tech-label">宽高比</span>
              <span class="tech-value">{{ picture.picScale ?? '-' }}</span>
            </div>
            <div class="tech-item">
              <span class="tech-label">大小</span>
              <span class="tech-value">{{ formatSize(picture.picSize) }}</span>
            </div>
            <div class="tech-item tech-item-full">
              <span class="tech-label">主色调</span>
              <span class="tech-value">
                <a-space>
                  <div
                    v-if="picture.picColor"
                    class="color-dot"
                    :style="{ backgroundColor: toHexColor(picture.picColor) }"
                  />
                  <span>{{ picture.picColor ?? '-' }}</span>
                </a-space>
              </span>
            </div>
          </div>
        </div>

        <!-- 操作按钮区 -->
        <div class="action-bar">
          <a-button class="action-btn download-btn" @click="doDownload">
            <template #icon><DownloadOutlined /></template>
            免费下载
          </a-button>
          <a-button class="action-btn share-btn" ghost type="primary" @click="doShare">
            <template #icon><ShareAltOutlined /></template>
            分享
          </a-button>
          <a-button v-if="canEdit" class="action-btn edit-btn" type="primary" @click="doEdit">
            <template #icon><EditOutlined /></template>
            编辑
          </a-button>
          <a-button v-if="canDelete" class="action-btn delete-btn" danger @click="doDelete">
            <template #icon><DeleteOutlined /></template>
            删除
          </a-button>
        </div>
      </div>
    </div>
    <ShareModal ref="shareModalRef" :link="shareLink" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { deletePicture, getPictureVoById } from '@/api/pictureController.ts'
import { message, Modal } from 'ant-design-vue'
import { downloadImage, formatSize, toHexColor } from '@/utils'
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import router from '@/router'
import ShareModal from '@/components/ShareModal.vue'
import { SPACE_PERMISSION_ENUM } from '@/constants/space.ts'

// 刚进页面时的转圈加载
const loading = ref(true)

interface Props {
  id: string | number
}

const props = defineProps<Props>()
const picture = ref<API.PictureVO>({})

// 通用权限检查函数
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (picture.value.permissionsList ?? []).includes(permission)
  })
}

// 定义权限检查
const canEdit = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDelete = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

const fetchPictureDetail = async () => {
  try {
    const res = await getPictureVoById({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      picture.value = res.data.data
    } else {
      message.error('获取图片详情失败' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取图片详情失败' + e.data.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPictureDetail()
})

// const loginUserStore = useLoginUserStore()
//
// // 是否具有编辑权限
// const canEdit = computed(() => {
//   const loginUser = loginUserStore.loginUser
//   // 未登录不可编辑
//   if (!loginUser.id) {
//     return false
//   }
//   // 仅本人或管理员可编辑
//   const user = picture.value.user || {}
//   return loginUser.id === user.id || loginUser.userRole === 'admin'
// })

const doEdit = () => {
  router.push({
    path: '/add_picture',
    query: {
      id: picture.value.id,
      spaceId: picture.value.spaceId,
    },
  })
}

// 删除数据（新增：确认弹窗 + 延时返回上一页）
const doDelete = async () => {
  const id = picture.value.id
  if (!id) {
    return
  }
  // 弹出确认删除框
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这张图片吗？删除后将无法恢复！',
    okText: '确认删除',
    cancelText: '取消',
    // 点击确认后执行删除
    onOk: async () => {
      try {
        const res = await deletePicture({ id })
        if (res.data.code === 0) {
          message.success('删除成功')
          // 延时1秒后返回上一个页面
          setTimeout(() => {
            router.back()
          }, 1000)
        } else {
          message.error('删除失败：' + res.data.message)
        }
      } catch (e: any) {
        message.error('删除失败：' + e.message)
      }
    },
  })
}

// 下载图片
const doDownload = () => {
  downloadImage(picture.value.url)
}

// ------ 分享操作 ------
const shareModalRef = ref()
// 分享链接
const shareLink = ref<string>()
// 分享
const doShare = () => {
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.value.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}
</script>

<style scoped>
#pictureDetailPage {
  max-width: 1400px;
  margin: 0 auto 24px;
  padding: 0 16px;
}

/* ===== 顶部导航栏 ===== */
.page-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.back-btn {
  font-size: 18px;
  color: #8a8aa0;
  flex-shrink: 0;
  transition: all 0.25s ease;
}

.back-btn:hover {
  color: #1677ff;
  background: rgba(22, 119, 255, 0.06);
}

.header-info {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.header-meta {
  display: block;
  font-size: 13px;
  color: #999;
  margin-top: 3px;
}

/* ===== 主体布局 ===== */
.detail-body {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* ===== 图片预览区 ===== */
.preview-section {
  flex: 1 1 0;
  min-width: 0;
}

.preview-container {
  background: linear-gradient(135deg, #f5f6fa 0%, #eef0f5 100%);
  border-radius: 20px;
  padding: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 420px;
  box-shadow:
    0 2px 16px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.preview-image {
  max-width: 100%;
  border-radius: 8px;
}

.preview-image :deep(.ant-image-img) {
  max-height: 560px;
  object-fit: contain;
  border-radius: 8px;
}

/* ===== 右侧信息区 ===== */
.info-section {
  width: 380px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ===== 信息卡片 ===== */
.info-card {
  background: #fff;
  border-radius: 16px;
  padding: 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.card-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f5f5f5;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
}

.card-body {
  padding: 16px 20px;
}

/* ===== 信息行 ===== */
.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 0;
}

.info-row + .info-row {
  border-top: 1px solid #fafafa;
}

.info-label {
  width: 46px;
  flex-shrink: 0;
  font-size: 13px;
  color: #999;
  padding-top: 3px;
}

.info-value {
  flex: 1;
  font-size: 14px;
  color: #444;
  word-break: break-all;
  min-width: 0;
  line-height: 1.5;
}

.name-value {
  font-weight: 600;
  color: #1a1a2e;
  font-size: 15px;
}

.intro-value {
  color: #666;
  line-height: 1.6;
}

.empty-text {
  color: #bbb;
}

/* ===== 技术参数网格 ===== */
.tech-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 20px;
}

.tech-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tech-item-full {
  grid-column: 1 / -1;
}

.tech-label {
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.tech-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.color-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

/* ===== 操作按钮区 ===== */
.action-bar {
  background: #fff;
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-btn {
  flex: 1;
  min-width: 100px;
  height: 40px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.25s ease;
}

.download-btn {
  border-color: #e8e8e8;
  color: #555;
}

.download-btn:hover {
  border-color: #1677ff;
  color: #1677ff;
}

.share-btn {
  border-color: #1677ff;
  color: #1677ff;
}

.share-btn:hover {
  opacity: 0.85;
}

.edit-btn {
  border-radius: 10px;
}

.delete-btn {
  border-radius: 10px;
}

/* ===== 响应式 ===== */
@media (max-width: 900px) {
  .detail-body {
    flex-direction: column;
  }

  .info-section {
    width: 100%;
  }

  .preview-container {
    min-height: 280px;
    padding: 20px;
  }
}
</style>
