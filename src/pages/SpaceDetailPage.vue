<template>
  <div id="spaceDetailPage">
    <a-flex justify="space-between">
      <h2>{{ space.spaceName }} ({{ SPACE_TYPE_MAP[space.spaceType] }})</h2>
      <a-space size="middle">
        <a-button
          v-if="canUploadPicture"
          type="primary"
          :href="`/add_picture?spaceId=${id}`"
          target="_blank"
        >
          + 创建图片
        </a-button>

        <a-button
          v-if="space.spaceType === 1 && canManageSpaceUser"
          type="primary"
          ghost
          :icon="h(TeamOutlined)"
          :href="`/spaceUserManage/${id}`"
          target="_blank"
        >
          成员管理
        </a-button>

        <a-button
          v-if="canManageSpaceUser"
          type="primary"
          ghost
          :icon="h(BarChartOutlined)"
          :href="`/space_analyze?spaceId=${id}`"
          target="_blank"
        >
          空间分析
        </a-button>
        <a-button v-if="canEditPicture" :icon="h(EditOutlined)" @click="doBatchEdit">
          批量编辑
        </a-button>

        <a-tooltip
          :title="`占用空间 ${formatSize(space.totalSize)} / ${formatSize(space.maxSize)}`"
        >
          <a-progress
            type="circle"
            :size="42"
            :percent="((space.totalSize * 100) / space.maxSize).toFixed(1)"
          />
        </a-tooltip>
      </a-space>
    </a-flex>
    <div style="margin-bottom: 16px" />

    <a-tabs v-if="space.spaceType === 0" v-model:activeKey="pictureViewType" @change="onTabChange">
      <a-tab-pane key="public" tab="公开图片" />
      <a-tab-pane key="private" tab="私有图片" />
    </a-tabs>

    <!--    <PictureSearchForm :onSearch="onSearch" />-->
    <!--    <div style="margin-bottom: 16px" />-->
    <!--    <a-form-item label="按颜色搜索">-->
    <!--      <color-picker format="hex" @pureColorChange="onColorChange" />-->
    <!--    </a-form-item>-->
    <!--    <div style="margin-bottom: 16px" />-->
    <PictureSearchForm :onSearch="onSearch" :onColorChange="onColorChange" />

    <PictureList
      :dataList="dataList"
      :loading="loading"
      :showOp="true"
      :onReload="fetchData"
      :canEdit="canEditPicture"
      :canDelete="canDeletePicture"
    />

    <a-pagination
      style="text-align: right; margin-top: 16px"
      v-model:current="searchParams.current"
      v-model:pageSize="searchParams.pageSize"
      :total="total"
      @change="doPageChange"
    />

    <BatchEditPictureModal
      ref="batchEditPictureModalRef"
      :spaceId="id"
      :pictureList="dataList"
      :onSuccess="onBatchEditPictureSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, h, watch } from 'vue'
import { getSpaceVoById } from '@/api/spaceController.ts'
import { message } from 'ant-design-vue'
import { formatSize } from '@/utils'
import {
  listPictureVoByPage,
  searchPictureByColor,
  listMyPublicPicturesPage,
} from '@/api/pictureController.ts'
import PictureList from '@/components/PictureList.vue'
import PictureSearchForm from '@/components/PictureSearchForm.vue'
import 'vue3-colorpicker/style.css'
import BatchEditPictureModal from '@/components/BatchEditPictureModal.vue'
import { EditOutlined, BarChartOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { SPACE_PERMISSION_ENUM, SPACE_TYPE_MAP } from '@/constants/space.ts'

interface Props {
  id: string | number
}

const props = defineProps<Props>()

// --- 状态变量 ---
const loading = ref(true)
const space = ref<API.SpaceVO>({})
const dataList = ref<API.PictureVO[]>([])
const total = ref(0)
const searchParams = ref<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'create_time',
  sortOrder: 'descend',
})

const pictureViewType = ref<'public' | 'private'>('public')

// --- 权限检查 ---
function createPermissionChecker(permission: string) {
  return computed(() => {
    return (space.value.permissionsList ?? []).includes(permission)
  })
}
const canManageSpaceUser = createPermissionChecker(SPACE_PERMISSION_ENUM.SPACE_USER_MANAGE)
const canUploadPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_UPLOAD)
const canEditPicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_EDIT)
const canDeletePicture = createPermissionChecker(SPACE_PERMISSION_ENUM.PICTURE_DELETE)

// --- 数据获取逻辑 ---

const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoById({ id: props.id })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data

      // 如果是团队空间 (1)，锁定为 private 模式展示团队图片
      if (space.value.spaceType === 1) {
        pictureViewType.value = 'private'
      } else {
        pictureViewType.value = 'public'
      }
    } else {
      message.error('获取空间详情失败: ' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取空间详情失败')
  }
}

const fetchData = async () => {
  loading.value = true

  if (pictureViewType.value === 'public') {
    try {
      const res = await listMyPublicPicturesPage({
        ...searchParams.value,
      })
      if (res.data.code === 0 && res.data.data) {
        dataList.value = res.data.data.records ?? []
        total.value = res.data.data.total ?? 0
      } else {
        message.error('获取公开图片失败: ' + res.data.message)
      }
    } catch (e: any) {
      message.error('请求公开图片接口失败')
    }
  } else {
    const params = {
      spaceId: props.id,
      ...searchParams.value,
    }
    try {
      const res = await listPictureVoByPage(params)
      if (res.data.code === 0 && res.data.data) {
        dataList.value = res.data.data.records ?? []
        total.value = res.data.data.total ?? 0
      } else {
        message.error('获取空间图片失败: ' + res.data.message)
      }
    } catch (e: any) {
      message.error('请求空间图片接口失败')
    }
  }
  loading.value = false
}

// --- 事件处理 ---

const onTabChange = () => {
  searchParams.value = {
    current: 1,
    pageSize: 12,
    sortField: 'create_time',
    sortOrder: 'descend',
  }
  fetchData()
}

const doPageChange = (page: number, pageSize: number) => {
  searchParams.value.current = page
  searchParams.value.pageSize = pageSize
  fetchData()
}

const onSearch = (newSearchParams: API.PictureQueryRequest) => {
  searchParams.value = {
    ...searchParams.value,
    ...newSearchParams,
    current: 1,
  }
  fetchData()
}

const onColorChange = async (color: string) => {
  loading.value = true
  const colorReqParams: API.SearchPictureByColorRequest = {
    picColor: color,
  }
  if (pictureViewType.value === 'private') {
    colorReqParams.spaceId = props.id as number
  }

  try {
    const res = await searchPictureByColor(colorReqParams)
    if (res.data.code === 0 && res.data.data) {
      dataList.value = res.data.data ?? []
      total.value = dataList.value.length
    } else {
      message.error('按颜色搜索失败: ' + res.data.message)
    }
  } catch (e: any) {
    message.error('请求颜色搜索失败')
  }
  loading.value = false
}

const batchEditPictureModalRef = ref()
const onBatchEditPictureSuccess = () => fetchData()
const doBatchEdit = () => {
  if (batchEditPictureModalRef.value) {
    batchEditPictureModalRef.value.openModal()
  }
}

// --- 生命周期与监听 ---

onMounted(async () => {
  await fetchSpaceDetail()
  await fetchData()
})

watch(
  () => props.id,
  async () => {
    await fetchSpaceDetail()
    await fetchData()
  },
)
</script>

<style scoped>
#spaceDetailPage {
  margin-bottom: 24px;
}
</style>
