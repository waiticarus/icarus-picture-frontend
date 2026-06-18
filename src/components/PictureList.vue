<template>
  <div class="picture-list">
    <!-- 瀑布流布局（主页使用） -->
    <div v-if="waterfall" class="waterfall-container">
      <a-skeleton v-if="loading" active :paragraph="{ rows: 6 }" />
      <div v-else class="waterfall-grid">
        <div
          v-for="picture in dataList"
          :key="picture.id"
          class="waterfall-item"
          @click="onClickPicture(picture)"
        >
          <img
            :alt="picture.name"
            :src="picture.thumbnailUrl ?? picture.url"
            class="waterfall-img"
            :style="{
              aspectRatio: picture.picWidth && picture.picHeight
                ? `${picture.picWidth} / ${picture.picHeight}`
                : undefined,
              backgroundColor: picture.picColor ?? '#f0f0f0',
            }"
          />
          <div class="waterfall-info">
            <span class="waterfall-name">{{ picture.name ?? '未命名' }}</span>
            <a-tag color="green" size="small">
              {{ picture.category ?? '默认' }}
            </a-tag>
          </div>
        </div>
      </div>
    </div>

    <!-- 网格布局（空间使用） -->
    <template v-else>
    <!-- 图片列表 -->
    <a-list
      :grid="{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }"
      :data-source="dataList"
      :loading="loading"
    >
      <template #renderItem="{ item: picture }">
        <a-list-item style="padding: 0">
          <!-- 单张图片 -->
          <a-card hoverable @click="onClickPicture(picture)">
            <template #cover>
              <img
                :alt="picture.name"
                :src="picture.thumbnailUrl ?? picture.url"
                style="height: 180px; object-fit: cover"
              />
            </template>
            <a-card-meta :title="picture.name">
              <template #description>
                <a-flex>
                  <a-tag color="green">
                    {{ picture.category ?? '默认' }}
                  </a-tag>
                  <a-tag v-for="tag in picture.tags" :key="tag">
                    {{ tag }}
                  </a-tag>
                </a-flex>
              </template>
            </a-card-meta>
            <template v-if="showOp" #actions>
              <ShareAltOutlined @click="(e) => doShare(picture, e)" />
              <SearchOutlined @click="(e) => doSearch(picture, e)" />
              <EditOutlined v-if="canEdit" @click="(e) => doEdit(picture, e)" />
              <DeleteOutlined v-if="canDelete" @click="(e) => doDelete(picture, e)" />
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
    <ShareModal ref="shareModalRef" :link="shareLink" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  deletePicture,
  listPictureByPage,
  listPictureTagCategory,
  listPictureVoByPage,
} from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
  ShareAltOutlined,
} from '@ant-design/icons-vue'
import ShareModal from '@/components/ShareModal.vue'

interface Props {
  dataList?: API.PictureVO[]
  loading?: boolean
  showOp?: boolean
  onReload?: () => void
  canEdit?: boolean
  canDelete?: boolean
  waterfall?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dataList: () => [],
  loading: false,
  showOp: false,
  canEdit: false,
  canDelete: false,
  waterfall: false,
})

// 点击图片后跳转至详情页
const router = useRouter()
const onClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

const total = ref(0)

const doEdit = (picture, e) => {
  // 阻止冒泡
  e.stopPropagation()
  router.push({
    path: '/add_picture',
    query: {
      id: picture.id,
      spaceId: picture.spaceId,
    },
  })
}

// 删除数据
const doDelete = async (picture, e) => {
  e.stopPropagation()
  const id = picture.id
  if (!id) {
    return
  }
  const res = await deletePicture({ id })
  if (res.data.code === 0) {
    message.success({ content: '删除成功' })
    props.onReload?.()
  } else {
    message.error({ content: '删除失败' })
  }
}

// 以图搜图
const doSearch = (picture, e) => {
  // 阻止冒泡
  e.stopPropagation()
  // 打开新页面
  window.open(`/search_picture?pictureId=${picture.id}`)
}

// ------ 分享操作 ------
const shareModalRef = ref()
// 分享链接
const shareLink = ref<string>()
// 分享
const doShare = (picture, e) => {
  // 阻止冒泡
  e.stopPropagation()
  shareLink.value = `${window.location.protocol}//${window.location.host}/picture/${picture.id}`
  if (shareModalRef.value) {
    shareModalRef.value.openModal()
  }
}
</script>

<style scoped>
/* ===== 瀑布流布局 ===== */
.waterfall-container {
  margin: 0 auto;
}

.waterfall-grid {
  column-count: 4;
  column-gap: 16px;
}

.waterfall-item {
  break-inside: avoid;
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.waterfall-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.waterfall-img {
  width: 100%;
  height: auto;
  display: block;
}

.waterfall-info {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.waterfall-name {
  font-size: 13px;
  color: #333;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

/* 响应式列数 */
@media (max-width: 576px) {
  .waterfall-grid { column-count: 1; }
}
@media (min-width: 577px) and (max-width: 768px) {
  .waterfall-grid { column-count: 2; }
}
@media (min-width: 769px) and (max-width: 1200px) {
  .waterfall-grid { column-count: 3; }
}
@media (min-width: 1201px) {
  .waterfall-grid { column-count: 4; }
}
</style>
