<template>
  <div id="homePage">
    <!-- Hero 欢迎区 -->
    <div class="hero-section">
      <div class="hero-bg-decor">
        <div class="hero-decor-circle hero-decor-1"></div>
        <div class="hero-decor-circle hero-decor-2"></div>
        <div class="hero-decor-circle hero-decor-3"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-title">发现精彩图片</h1>
        <p class="hero-subtitle">探索海量高质量图片，找到属于你的灵感</p>
        <div class="hero-search">
          <a-input-search
            v-model:value="searchParams.searchText"
            placeholder="从海量图片中搜索..."
            enter-button="搜索"
            size="large"
            @search="doSearch"
          />
        </div>
      </div>
    </div>

    <!-- 筛选区 -->
    <div class="filter-section">
      <a-tabs v-model:active-key="selectedCategoryList" @change="doSearch" class="category-tabs">
        <a-tab-pane key="all" tab="全部" />
        <a-tab-pane v-for="category in categoryList" :tab="category" :key="category" />
      </a-tabs>

      <div class="section-divider"></div>

      <div class="tag-bar">
        <span class="tag-label">标签</span>
        <a-space :size="[0, 8]" wrap>
          <a-checkable-tag
            v-for="(tag, index) in tagList"
            :key="tag"
            v-model:checked="selectedTagList[index]"
            @change="doSearch()"
            class="filter-tag"
          >
            {{ tag }}
          </a-checkable-tag>
        </a-space>
      </div>
    </div>

    <!-- 瀑布流图片列表 -->
    <PictureList :dataList="dataList" :loading="loading" :waterfall="true" />

    <!-- 加载指示器 -->
    <div ref="loadMoreRef" class="load-more">
      <a-spin v-if="loadingMore" tip="加载中..." />
      <span v-else-if="noMore" class="no-more">—— 已经到底啦 ——</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { listPictureVoByPage, listPictureTagCategory } from '@/api/pictureController.ts'
import { message } from 'ant-design-vue'
import PictureList from '@/components/PictureList.vue'

const loading = ref(true)
const loadingMore = ref(false)
const noMore = ref(false)
const dataList = ref<API.PictureVO[]>([])

const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'create_time',
  sortOrder: 'descend',
})

const buildParams = (): API.PictureQueryRequest => {
  const tags: string[] = []
  selectedTagList.value.forEach((useTag, index) => {
    if (useTag) tags.push(tagList.value[index])
  })
  const params: API.PictureQueryRequest = { ...searchParams }
  if (tags.length > 0) params.tags = tags
  if (selectedCategoryList.value !== 'all') params.category = selectedCategoryList.value
  return params
}

const fetchData = async (reset: boolean) => {
  if (reset) {
    loading.value = true
    searchParams.current = 1
    noMore.value = false
  } else {
    if (noMore.value || loadingMore.value) return
    searchParams.current++
    loadingMore.value = true
  }

  const params = buildParams()
  const res = await listPictureVoByPage(params)
  if (res.data.code === 0 && res.data.data) {
    const records = res.data.data.records ?? []
    const total = res.data.data.total ?? 0
    if (reset) {
      dataList.value = records
    } else {
      // 创建新数组引用，确保 PictureList 内的 watch 能检测到变化
      dataList.value = [...dataList.value, ...records]
    }
    if (dataList.value.length >= total) {
      noMore.value = true
    }
  } else {
    message.error('获取数据失败' + res.data.message)
  }
  loading.value = false
  loadingMore.value = false
}

// 无限滚动 - IntersectionObserver
const loadMoreRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const setupObserver = () => {
  if (observer) observer.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !loadingMore.value && !noMore.value) {
        fetchData(false)
      }
    },
    { rootMargin: '300px' },
  )
  if (loadMoreRef.value) observer.observe(loadMoreRef.value)
}

onMounted(() => {
  fetchData(true).then(() => {
    // 首次加载完成后注册 observer，并检查是否立即需要加载更多
    setupObserver()
    // 如果首屏数据不足一页，自动加载下一页
    setTimeout(() => {
      if (loadMoreRef.value) {
        const rect = loadMoreRef.value.getBoundingClientRect()
        if (rect.top < window.innerHeight + 300 && !noMore.value && !loadingMore.value) {
          fetchData(false)
        }
      }
    }, 100)
  })
})

// 搜索/筛选时重置
const doSearch = () => {
  fetchData(true)
}

const categoryList = ref<string[]>([])
const tagList = ref<string[]>([])
const selectedTagList = ref<boolean[]>([])
const selectedCategoryList = ref<string>('all')

const getTagCategoryOptions = async () => {
  const res = await listPictureTagCategory()
  if (res.data.code === 0 && res.data.data) {
    tagList.value = res.data.data.tags ?? []
    categoryList.value = res.data.data.categories ?? []
  } else {
    message.error('获取标签列表失败' + res.data.message)
  }
}

onMounted(() => {
  getTagCategoryOptions()
})
</script>

<style scoped>
#homePage {
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== Hero 欢迎区 ===== */
.hero-section {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #8899cc 0%, #a899c4 100%);
  border-radius: 20px;
  padding: 44px 40px 36px;
  margin-bottom: 28px;
}

.hero-bg-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-decor-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}

.hero-decor-1 {
  width: 280px;
  height: 280px;
  top: -140px;
  right: -60px;
}

.hero-decor-2 {
  width: 200px;
  height: 200px;
  bottom: -80px;
  left: -50px;
  background: rgba(255, 255, 255, 0.05);
}

.hero-decor-3 {
  width: 120px;
  height: 120px;
  top: 30%;
  left: 55%;
  background: rgba(255, 255, 255, 0.06);
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-title {
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 10px;
  letter-spacing: 1px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}

.hero-subtitle {
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
  margin: 0 0 22px;
  font-weight: 400;
}

.hero-search {
  max-width: 560px;
  margin: 0 auto;
}

.hero-search :deep(.ant-input-group .ant-input) {
  border-radius: 10px 0 0 10px;
  height: 44px;
  font-size: 14px;
}

.hero-search :deep(.ant-input-search-button) {
  border-radius: 0 10px 10px 0 !important;
  height: 44px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 500;
}

/* ===== 筛选区 ===== */
.filter-section {
  background: #fff;
  border-radius: 16px;
  padding: 8px 24px 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.section-divider {
  height: 1px;
  background: linear-gradient(to right, transparent, #f0f0f0, transparent);
  margin: 4px 0 14px;
}

/* ===== 分类标签页 ===== */
.category-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 0;
}

.category-tabs :deep(.ant-tabs-tab) {
  padding: 12px 20px;
  font-size: 15px;
  color: #666;
  transition:
    color 0.25s,
    font-weight 0.25s;
}

.category-tabs :deep(.ant-tabs-tab:hover) {
  color: #1677ff;
}

.category-tabs :deep(.ant-tabs-tab-active .ant-tabs-tab-btn) {
  color: #1677ff;
  font-weight: 600;
}

.category-tabs :deep(.ant-tabs-ink-bar) {
  height: 3px;
  border-radius: 2px;
  background: linear-gradient(90deg, #1677ff, #69b1ff);
}

.category-tabs :deep(.ant-tabs-nav::before) {
  border-bottom: none;
}

/* ===== 标签区 ===== */
.tag-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0;
}

.tag-label {
  font-size: 14px;
  color: #999;
  font-weight: 500;
  margin-right: 12px;
  flex-shrink: 0;
}

.filter-tag {
  border-radius: 8px !important;
  padding: 4px 14px !important;
  font-size: 13px;
  transition: all 0.25s ease;
  border-color: #e8e8e8;
}

.filter-tag:hover {
  border-color: #1677ff;
  color: #1677ff;
}

/* ===== 加载指示器 ===== */
.load-more {
  text-align: center;
  padding: 32px 0 24px;
}

.no-more {
  color: #bbb;
  font-size: 13px;
}
</style>
