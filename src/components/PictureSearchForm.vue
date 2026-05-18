<template>
  <div class="picture-search-form">
    <a-card :bordered="false" class="search-card">
      <a-form :model="searchParams" layout="vertical" @finish="doSearch">
        <a-row :gutter="[16, 0]">
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-form-item label="名称" name="name">
              <a-input v-model:value="searchParams.name" placeholder="请输入名称" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="5">
            <a-form-item label="简介" name="introduction">
              <a-input
                v-model:value="searchParams.introduction"
                placeholder="请输入简介"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="4">
            <a-form-item label="分类" name="category">
              <a-input v-model:value="searchParams.category" placeholder="请输入分类" allow-clear />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="5">
            <a-form-item label="标签" name="tags">
              <a-select
                v-model:value="searchParams.tags"
                mode="tags"
                placeholder="输入标签后回车"
                style="width: 100%"
                allow-clear
              />
            </a-form-item>
          </a-col>
          <a-col :xs="24" :sm="12" :md="8" :lg="6">
            <a-form-item label="关键词" name="searchText">
              <a-input
                v-model:value="searchParams.searchText"
                placeholder="从名称或简介中模糊搜索"
                allow-clear
              />
            </a-form-item>
          </a-col>
        </a-row>

        <div v-show="showAdvanced" class="advanced-area">
          <a-row :gutter="[16, 0]">
            <a-col :xs="24" :sm="12" :md="8" :lg="4">
              <a-form-item label="宽度" name="picWidth">
                <a-input-number
                  v-model:value="searchParams.picWidth"
                  placeholder="图片宽度"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="8" :lg="4">
              <a-form-item label="高度" name="picHeight">
                <a-input-number
                  v-model:value="searchParams.picHeight"
                  placeholder="图片高度"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="8" :lg="4">
              <a-form-item label="格式" name="picFormat">
                <a-input
                  v-model:value="searchParams.picFormat"
                  placeholder="如 png, jpg"
                  allow-clear
                />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="12" :lg="8">
              <a-form-item label="日期范围" name="dateRange">
                <a-range-picker
                  v-model:value="dateRange"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  :show-time="true"
                  style="width: 100%"
                  @change="onDateChange"
                />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :sm="12" :md="8" :lg="4">
              <a-form-item label="按颜色搜索">
                <div class="color-picker-wrapper">
                  <color-picker format="hex" @pureColorChange="handleColorChange" />
                  <span class="color-tips">点击拾色</span>
                </div>
              </a-form-item>
            </a-col>
          </a-row>
        </div>

        <a-row>
          <a-col :span="24" style="text-align: right">
            <a-space size="middle">
              <a-button type="primary" html-type="submit" style="width: 90px; border-radius: 6px"
                >搜索</a-button
              >
              <a-button @click="doClear" style="width: 90px; border-radius: 6px">重置</a-button>

              <a-tooltip :title="showAdvanced ? '' : '提供更多搜索条件'" placement="topRight">
                <a-button type="link" @click="toggleAdvanced" class="advanced-btn">
                  {{ showAdvanced ? '收起' : '高级搜索' }}
                  <component :is="showAdvanced ? UpOutlined : DownOutlined" />
                </a-button>
              </a-tooltip>
            </a-space>
          </a-col>
        </a-row>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { UpOutlined, DownOutlined } from '@ant-design/icons-vue'
import { ColorPicker } from 'vue3-colorpicker'
import 'vue3-colorpicker/style.css'

// 接收父组件传入的方法
interface Props {
  onSearch?: (searchParams: API.PictureQueryRequest) => void
  onColorChange?: (color: string) => void
}
const props = defineProps<Props>()

const showAdvanced = ref(false)
const searchParams = reactive<API.PictureQueryRequest>({})
const dateRange = ref<[string, string]>()

// 切换高级搜索状态
const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

// 日期区间改变，自动拆解赋值
const onDateChange = (dates: any, dateStrings: [string, string]) => {
  if (dates) {
    searchParams.startEditTime = dateStrings[0]
    searchParams.endEditTime = dateStrings[1]
  } else {
    searchParams.startEditTime = undefined
    searchParams.endEditTime = undefined
  }
}

// 颜色搜索触发
const handleColorChange = (color: string) => {
  if (props.onColorChange) {
    props.onColorChange(color)
  }
}

const doSearch = () => {
  if (props.onSearch) {
    props.onSearch(searchParams)
  }
}

const doClear = () => {
  // 清空所有搜索项
  Object.keys(searchParams).forEach((key) => {
    ;(searchParams as any)[key] = undefined
  })
  dateRange.value = undefined
  if (props.onSearch) {
    props.onSearch(searchParams)
  }
}
</script>

<style scoped>
.picture-search-form {
  margin-bottom: 16px;
}

/* 优雅的白色卡片底座 */
.search-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  background-color: #ffffff;
}

/* 折叠区域上方的虚线分割线 */
.advanced-area {
  margin-top: 4px;
  padding-top: 16px;
  border-top: 1px dashed #f0f0f0;
}

.advanced-btn {
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  font-weight: 500;
}

.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-tips {
  color: #999;
  font-size: 13px;
}

/* 覆盖组件的默认样式，让表单看着更干净 */
:deep(.ant-form-item-label > label) {
  color: #666;
  font-weight: 500;
}
</style>
