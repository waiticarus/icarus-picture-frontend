<template>
  <div id="homePage">
    <div class="search-bar">
      <a-input-search
        v-model:value="searchParams.searchText"
        placeholder="从海量图片中搜索"
        enter-button="搜索"
        size="large"
        @search="doSearch"
      />
    </div>

    <a-tabs v-model:active-key="selectedCategoryList" @change="doSearch">
      <a-tab-pane key="all" tab="全部" />
      <a-tab-pane v-for="category in categoryList" :tab="category" :key="category" />
    </a-tabs>

    <div class="tag-bar">
      <span style="margin-right: 8px">标签</span>
      <a-space :size="[0, 8]" wrap>
        <a-checkable-tag
          v-for="(tag, index) in tagList"
          :key="tag"
          v-model:checked="selectedTagList[index]"
          @change="doSearch()"
        >
          {{ tag }}
        </a-checkable-tag>
      </a-space>
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
import {
  listPictureVoByPage,
  listPictureTagCategory,
} from '@/api/pictureController.ts'
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
    { rootMargin: '300px' }
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
  margin-bottom: 16px;
}

#homePage .search-bar {
  max-width: 480px;
  margin: 0 auto;
  margin-bottom: 16px;
}

#homePage .tag-bar {
  margin-bottom: 16px;
}

.load-more {
  text-align: center;
  padding: 24px 0;
}

.no-more {
  color: #ccc;
  font-size: 13px;
}
</style>
