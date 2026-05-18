<template>
  <div id="SpaceManagePage">
    <a-flex justify="space-between">
      <h2>空间管理</h2>
      <a-space>
        <a-button type="primary" href="/add_space" target="_blank">+ 创建空间</a-button>
        <a-button type="primary" ghost href="/space_analyze?queryPublic=1" target="_blank">
          分析公共图库
        </a-button>
        <a-button type="primary" ghost href="/space_analyze?queryAll=1" target="_blank">
          分析全空间
        </a-button>
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px" />

    <!-- 搜索表单（无变化） -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="空间名称">
        <a-input v-model:value="searchParams.spaceName" placeholder="请输入空间名称" allow-clear />
      </a-form-item>

      <a-form-item name="spaceLevel" label="空间级别">
        <a-select
          v-model:value="searchParams.spaceLevel"
          style="min-width: 180px"
          placeholder="请选择空间级别"
          :options="SPACE_LEVEL_OPTIONS"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="空间类别" name="spaceType">
        <a-select
          v-model:value="searchParams.spaceType"
          :options="SPACE_TYPE_OPTIONS"
          placeholder="请输入空间类别"
          style="min-width: 180px"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="用户 Id">
        <a-input v-model:value="searchParams.userId" placeholder="请输入用户 id" allow-clear />
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
        <template v-if="column.dataIndex === 'spaceLevel'">
          <div>{{ SPACE_LEVEL_MAP[record.spaceLevel] }}</div>
        </template>
        <!-- 空间类别 -->
        <template v-if="column.dataIndex === 'spaceType'">
          <a-tag>{{ SPACE_TYPE_MAP[record.spaceType] }}</a-tag>
        </template>
        <template v-if="column.dataIndex === 'spaceUseInfo'">
          <div>大小：{{ formatSize(record.totalSize) }} / {{ formatSize(record.maxSize) }}</div>
          <div>数量：{{ record.totalCount }} / {{ record.maxCount }}</div>
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
            <a-button type="link" :href="`/space_analyze?spaceId=${record.id}`" target="_blank">
              分析
            </a-button>
            <a-button
              type="primary"
              ghost
              size="small"
              :href="`/add_space?id=${record.id}`"
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
import { deleteSpace, listSpaceByPage } from '@/api/SpaceController.ts'
import dayjs from 'dayjs'
import { useLoginSpaceStore } from '@/stores/useLoginSpaceStore.ts'
import {
  SPACE_LEVEL_ENUM,
  SPACE_LEVEL_MAP,
  SPACE_LEVEL_OPTIONS,
  SPACE_TYPE_MAP,
  SPACE_TYPE_OPTIONS,
} from '@/constants/space.ts'
import { formatSize } from '@/utils'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 120, // 限制ID列宽度，自动换行
  },
  {
    title: '名称',
    dataIndex: 'spaceName',
    width: 200, // 给图片列分配更大宽度，放大显示
  },
  {
    title: '级别',
    dataIndex: 'spaceLevel',
    width: 120,
  },
  {
    title: '空间类别',
    dataIndex: 'spaceType',
  },
  {
    title: '使用情况',
    dataIndex: 'spaceUseInfo',
    width: 180, // 限制简介列宽度，自动换行
  },
  {
    title: '用户 id',
    dataIndex: 'userId',
    width: 100,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180, // 限制标签列宽度，自动换行
  },
  {
    title: '编辑时间',
    dataIndex: 'editTime',
    width: 150,
  },
  {
    title: '操作',
    key: 'action',
    width: 100, // 垂直排列后大幅缩小操作列宽度
  },
]

const dataList = ref<API.Space[]>([])
const total = ref(0)

const searchParams = reactive<API.SpaceQueryRequest>({
  current: 1,
  pageSize: 10,
  sortField: 'create_time',
  sortOrder: 'descend',
})

const fetchData = async () => {
  const res = await listSpaceByPage({
    ...searchParams,
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
      const res = await deleteSpace({ id })
      if (res.data.code === 0) {
        message.success('删除成功')
        fetchData()
      } else {
        message.error('删除失败：' + res.data.message)
      }
    },
  })
}
</script>

<style scoped>
#SpaceManagePage {
  padding: 16px;
}
</style>
