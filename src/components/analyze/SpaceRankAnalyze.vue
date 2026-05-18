<template>
  <div class="space-rank-analyze">
    <a-card title="空间使用排行">
      <v-chart :option="chartOptions" style="width: 100%; height: 320px" autoresize />
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import VChart from 'vue-echarts'
import 'echarts'
import { getSpaceRankAnalyze } from '@/api/spaceAnalyzeController.ts'
import { message } from 'ant-design-vue'

// 删除了所有无用的、错误的 IDE 自动引入 (比如 axios 和 slick slider)

interface Props {
  queryAll?: boolean
  queryPublic?: boolean
  spaceId?: number
}

const props = withDefaults(defineProps<Props>(), {
  queryAll: false,
  queryPublic: false,
})

// 图表数据
const dataList = ref<API.Space[]>([])
const loading = ref(true)

/**
 * 加载数据
 */
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getSpaceRankAnalyze({
      queryAll: props.queryAll,
      queryPublic: props.queryPublic,
      spaceId: props.spaceId,
    })
    if (res.data.code === 0) {
      dataList.value = res.data.data ?? []
    } else {
      message.error('获取数据失败，' + res.data.message)
    }
  } catch (error) {
    message.error('请求接口异常')
  } finally {
    loading.value = false
  }
}

// 监听 Props 的变化并自动拉取数据 (相当于 onMounted + watch 的结合)
watchEffect(() => {
  fetchData()
})

// 图表选项 (重命名为 chartOptions，避免使用 options 这种容易冲突的泛泛词汇)
const chartOptions = computed(() => {
  const spaceNames = dataList.value.map((item) => item.spaceName)
  const usageData = dataList.value.map((item) => (item.totalSize / (1024 * 1024)).toFixed(2)) // 转为 MB

  return {
    tooltip: {
      trigger: 'axis',
      // 让提示框也能展示 MB 单位
      valueFormatter: (value: string | number) => value + ' MB',
    },
    xAxis: {
      type: 'category',
      data: spaceNames,
    },
    yAxis: {
      type: 'value',
      name: '空间使用量 (MB)',
    },
    series: [
      {
        name: '空间使用量',
        type: 'bar',
        data: usageData,
        itemStyle: {
          color: '#5470C6', // 自定义柱状图颜色
        },
      },
    ],
  }
})
</script>

<style scoped>
/* 如果有额外的样式需求可以写在这里 */
</style>
