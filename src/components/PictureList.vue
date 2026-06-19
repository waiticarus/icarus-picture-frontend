<template>
  <div class="picture-list">
    <!-- 瀑布流布局（主页使用，JS 分配列，新增图片不扰动已有排版） -->
    <div v-if="waterfall" class="waterfall-container">
      <a-skeleton v-if="loading" active :paragraph="{ rows: 6 }" />
      <div v-else class="waterfall-rows">
        <div v-for="(col, ci) in waterfallColumns" :key="ci" class="waterfall-col">
          <div
            v-for="picture in col"
            :key="picture.id"
            class="waterfall-item"
            @click="onClickPicture(picture)"
          >
            <img
              :alt="picture.name"
              :src="picture.thumbnailUrl ?? picture.url"
              class="waterfall-img"
              :style="{
                aspectRatio:
                  picture.picWidth && picture.picHeight
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
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { deletePicture } from '@/api/pictureController.ts'
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

// 瀑布流固定列分配：新图片始终放入当前最矮的列，已有图片位置不变
const waterfallColumns = ref<API.PictureVO[][]>([])
const colCount = ref(4)
let resizeObserver: ResizeObserver | null = null

const updateColCount = () => {
  const w = window.innerWidth
  if (w <= 576) colCount.value = 1
  else if (w <= 768) colCount.value = 2
  else if (w <= 1200) colCount.value = 3
  else if (w <= 1600) colCount.value = 3
  else colCount.value = 4
}

const distributeAll = (pictures: API.PictureVO[]) => {
  const cols: API.PictureVO[][] = Array.from({ length: colCount.value }, () => [])
  const getColEstimatedHeight = (col: API.PictureVO[]) =>
    col.reduce((sum, p) => {
      if (p.picWidth && p.picHeight) return sum + p.picHeight / p.picWidth
      return sum + 1
    }, 0)
  for (const pic of pictures) {
    let minIdx = 0
    let minH = getColEstimatedHeight(cols[0])
    for (let i = 1; i < colCount.value; i++) {
      const h = getColEstimatedHeight(cols[i])
      if (h < minH) {
        minH = h
        minIdx = i
      }
    }
    cols[minIdx].push(pic)
  }
  waterfallColumns.value = cols
}

// 监听 dataList 变化：区分全量替换和追加
watch(
  () => props.dataList,
  (newList, oldList) => {
    if (!props.waterfall) return
    if (!oldList || oldList.length === 0 || newList.length < oldList.length) {
      distributeAll(newList)
    } else if (newList.length > oldList.length) {
      // 追加：将新增图片分配到已有列
      const appended = newList.slice(oldList.length)
      const cols = waterfallColumns.value
      const getColEstimatedHeight = (col: API.PictureVO[]) =>
        col.reduce((sum, p) => {
          if (p.picWidth && p.picHeight) return sum + p.picHeight / p.picWidth
          return sum + 1
        }, 0)
      for (const pic of appended) {
        let minIdx = 0
        let minH = getColEstimatedHeight(cols[0])
        for (let i = 1; i < colCount.value; i++) {
          const h = getColEstimatedHeight(cols[i])
          if (h < minH) {
            minH = h
            minIdx = i
          }
        }
        cols[minIdx].push(pic)
      }
    }
  },
  { deep: false },
)

onMounted(() => {
  updateColCount()
  resizeObserver = new ResizeObserver(() => {
    updateColCount()
  })
  resizeObserver.observe(document.documentElement)
})

onBeforeUnmount(() => {
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
})

// 点击图片后跳转至详情页
const router = useRouter()
const onClickPicture = (picture: API.PictureVO) => {
  router.push({
    path: `/picture/${picture.id}`,
  })
}

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
  max-width: 1400px;
  margin: 0 auto;
}

.waterfall-rows {
  display: flex;
  gap: 20px;
}

.waterfall-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.waterfall-item {
  border-radius: 14px;
  overflow: hidden;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  background: #fff;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}

.waterfall-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.waterfall-img {
  width: 100%;
  height: auto;
  display: block;
}

.waterfall-info {
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.waterfall-name {
  font-size: 14px;
  color: #1a1a2e;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

/* 响应式列数 */
@media (max-width: 576px) {
  .waterfall-col:nth-child(n + 2) {
    display: none;
  }
}
@media (min-width: 577px) and (max-width: 768px) {
  .waterfall-col:nth-child(n + 3) {
    display: none;
  }
}
@media (min-width: 769px) and (max-width: 1200px) {
  .waterfall-col:nth-child(n + 4) {
    display: none;
  }
}
@media (min-width: 1201px) and (max-width: 1600px) {
  .waterfall-col:nth-child(n + 4) {
    display: none;
  }
}
</style>
