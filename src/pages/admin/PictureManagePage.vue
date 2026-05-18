<template>
  <div id="PictureManagePage">
    <a-flex justify="space-between">
      <h2>图片管理</h2>
      <a-space>
        <a-button type="primary" href="/add_picture" target="_blank">+ 创建图片</a-button>
        <a-button type="primary" href="/add_picture/batch" target="_blank" ghost>+ 批量创建图片</a-button>
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px" />

    <!-- 搜索表单（无变化） -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="关键词">
        <a-input
          v-model:value="searchParams.searchText"
          placeholder="从名称或简介中进行搜索"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="类型">
        <a-input v-model:value="searchParams.category" placeholder="请输入类型" allow-clear />
      </a-form-item>
      <a-form-item name="tags" label="标签">
        <a-select
          v-model:value="searchParams.tags"
          mode="tags"
          placeholder="请输入标签"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item name="reviewStatus" label="审核状态">
        <a-select
          v-model:value="searchParams.reviewStatus"
          style="min-width: 120px"
          placeholder="请输入审核状态"
          :options="PIC_REVIEW_STATUS_OPTIONS"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>

    <div style="margin-bottom: 20px" />

    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
      :scroll="{ x: 'max-content' }"
    >
      <template #bodyCell="{ column, record }">
        <!-- 图片列：放大显示尺寸 -->
        <template v-if="column.dataIndex === 'url'">
          <a-image :src="record.url" :width="120" />
          <!-- 从80px放大到120px，可改150px -->
        </template>

        <!-- ID列：长数字自动换行分行 -->
        <template v-if="column.dataIndex === 'id'">
          <div style="word-break: break-all; max-width: 120px; line-height: 1.4">
            {{ record.id }}
          </div>
        </template>

        <!-- 用户ID列：长数字自动换行分行 -->
        <template v-if="column.dataIndex === 'userId'">
          <div style="word-break: break-all; max-width: 120px; line-height: 1.4">
            {{ record.userId }}
          </div>
        </template>

        <!-- 简介列：长文本自动换行分行 -->
        <template v-if="column.dataIndex === 'introduction'">
          <div
            style="word-break: break-all; white-space: pre-wrap; max-width: 180px; line-height: 1.4"
          >
            {{ record.introduction }}
          </div>
        </template>

        <!-- 标签列：多标签自动换行分行 -->
        <template v-if="column.dataIndex === 'tags'">
          <div style="display: flex; flex-wrap: wrap; gap: 4px; max-width: 180px">
            <a-tag v-for="tag in JSON.parse(record.tags || '[]')" :key="tag" size="small">
              {{ tag }}
            </a-tag>
          </div>
        </template>

        <template v-if="column.dataIndex === 'picInfo'">
          <div style="line-height: 1.6">格式: {{ record.picFormat }}</div>
          <div style="line-height: 1.6">宽度: {{ record.picWidth }}</div>
          <div style="line-height: 1.6">高度: {{ record.picHeight }}</div>
          <div style="line-height: 1.6">宽高比: {{ record.picScale }}</div>
          <div style="line-height: 1.6">大小: {{ (record.picSize / 1024).toFixed(2) }}KB</div>
        </template>

        <template v-if="column.dataIndex === 'reviewMessage'">
          <div style="line-height: 1.6">
            审核状态: {{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}
          </div>
          <div style="line-height: 1.6">审核详情: {{ record.reviewMessage }}</div>
          <div style="line-height: 1.6">审核人: {{ record.reviewerId }}</div>
          <div v-if="record.reviewTime">
            审核时间: {{ dayjs(record.reviewTime).format('YYYY-MM-DD HH:mm:ss') }}
          </div>
        </template>

        <!-- 合并后的时间列：hover显示 -->
        <template v-if="column.dataIndex === 'timeInfo'">
          <a-tooltip placement="left">
            <template #title>
              <div>创建: {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
              <div>编辑: {{ dayjs(record.editTime).format('YYYY-MM-DD HH:mm:ss') }}</div>
            </template>
            <a-button type="text" size="small">⏱️ 时间</a-button>
          </a-tooltip>
        </template>

        <!-- 操作列：编辑/删除垂直排列 -->
        <template v-if="column.key === 'action'">
          <a-space direction="vertical" size="small" style="width: 100%; align-items: center">
            <!-- 🔥 优化：通过按钮 → 绿色文字 -->
            <a-button
              v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.PASS"
              type="link"
              style="color: #52c41a; font-weight: 500"
              @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.PASS)"
            >
              通过
            </a-button>
            <!-- 🔥 优化：拒绝按钮 → 柔和红色文字（和删除按钮区分） -->
            <a-button
              v-if="record.reviewStatus !== PIC_REVIEW_STATUS_ENUM.REJECT"
              type="link"
              style="color: #ff7875; font-weight: 500"
              @click="handleReview(record, PIC_REVIEW_STATUS_ENUM.REJECT)"
            >
              拒绝
            </a-button>
            <a-button
              type="primary"
              ghost
              size="small"
              :href="`/add_picture?id=${record.id}`"
              target="_blank"
            >
              编辑
            </a-button>
            <!-- 删除按钮 → 原生danger红色（边框/填充，和文字红区分） -->
            <a-button danger size="small" @click="doDelete(record.id)"> 删除 </a-button>
          </a-space>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { deletePicture, doPictureReview, listPictureByPage } from '@/api/PictureController.ts'
import dayjs from 'dayjs'
import { useLoginPictureStore } from '@/stores/useLoginUserStore.ts'
import {
  PIC_REVIEW_STATUS_ENUM,
  PIC_REVIEW_STATUS_MAP,
  PIC_REVIEW_STATUS_OPTIONS,
} from '@/constants/picture.ts'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 120, // 限制ID列宽度，自动换行
  },
  {
    title: '图片',
    dataIndex: 'url',
    width: 200, // 给图片列分配更大宽度，放大显示
  },
  {
    title: '名称',
    dataIndex: 'name',
    width: 120,
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    width: 180, // 限制简介列宽度，自动换行
  },
  {
    title: '类型',
    dataIndex: 'category',
    width: 100,
  },
  {
    title: '标签',
    dataIndex: 'tags',
    width: 180, // 限制标签列宽度，自动换行
  },
  {
    title: '信息',
    dataIndex: 'picInfo',
    width: 150,
  },
  {
    title: '用户Id',
    dataIndex: 'userId',
    width: 120, // 限制用户ID列宽度，自动换行
  },
  {
    title: '审核信息',
    dataIndex: 'reviewMessage',
    width: 150,
  },
  // 合并为一列，宽度极窄
  {
    title: '时间',
    dataIndex: 'timeInfo',
    width: 70,
  },
  {
    title: '操作',
    key: 'action',
    width: 100, // 垂直排列后大幅缩小操作列宽度
  },
]

const dataList = ref<API.Picture[]>([])
const total = ref(0)

const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'create_time',
  sortOrder: 'descend',
})

const fetchData = async () => {
  const res = await listPictureByPage({
    ...searchParams,
    nullSpaceId: true
  })
  if (res.data.code === 0 && res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败' + res.data.message)
  }
}

onMounted(() => {
  fetchData()
})

const pagination = computed(() => {
  return {
    current: searchParams.current,
    pageSize: searchParams.pageSize,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total: any) => `共${total}条`,
  }
})

const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

const doSearch = () => {
  searchParams.current = 1
  fetchData()
}

// 删除函数（保持确认弹窗）
const doDelete = async (id: string) => {
  if (!id) return

  Modal.confirm({
    title: '确认删除',
    content: '确定要删除该图片吗？删除后数据将无法恢复。',
    okText: '是',
    cancelText: '否',
    onOk: async () => {
      const res = await deletePicture({ id })
      if (res.data.code === 0) {
        message.success('删除成功')
        fetchData()
      } else {
        message.error('删除失败：' + res.data.message)
      }
    },
  })
}

const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage =
    reviewStatus === PIC_REVIEW_STATUS_ENUM.PASS ? '管理员审核通过' : '管理员审核拒绝'
  const res = await doPictureReview({
    id: record.id,
    reviewStatus,
    reviewMessage,
  })
  if (res.data.code === 0) {
    message.success('审核操作成功')
    fetchData()
  } else {
    message.error('审核操作失败' + res.data.message)
  }
}
</script>

<style scoped>
#PictureManagePage {
  padding: 16px;
}
</style>
