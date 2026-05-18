<template>
  <div id="addSpacePage">
    <template v-if="showUpgradeUI">
      <a-result
        status="info"
        title="您已拥有专属的团队空间"
        sub-title="为保障资源合理分配，每个用户仅限创建一个团队空间。如需更庞大的存储容量、不受限的成员数量以及更多专属特权，请考虑升级您的空间级别！"
      >
        <template #extra>
          <a-button type="primary" size="large" @click="handleUpgradeClick">
            联系站长升级
          </a-button>
          <a-button size="large" @click="router.push('/my_space')">返回我的空间</a-button>
        </template>
      </a-result>

      <div class="upgrade-cards">
        <h3 class="cards-title">💎 空间特权一览</h3>
        <a-row :gutter="[24, 24]" justify="center">
          <a-col
            :xs="24"
            :sm="12"
            :md="8"
            v-for="spaceLevel in spaceLevelList"
            :key="spaceLevel.value"
          >
            <a-card :title="spaceLevel.text" hoverable class="level-card">
              <p><strong>💾 存储容量：</strong>{{ formatSize(spaceLevel.maxSize) }}</p>
              <p><strong>🖼️ 最大图片数：</strong>{{ spaceLevel.maxCount }} 张</p>
              <div class="privilege-box">
                <p>✔️ 极速云端下载</p>
                <p>✔️ 多人实时协作</p>
                <p v-if="spaceLevel.value >= 1">✔️ 专属客服一对一</p>
                <p v-if="spaceLevel.value >= 2">✔️ 无限次扩图与AI处理</p>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </template>

    <template v-else>
      <h2 style="margin-bottom: 16px">
        {{ route.query?.id ? '修改空间' : '创建空间' }} {{ SPACE_TYPE_MAP[spaceType] }}
      </h2>

      <a-form name="spaceFrom" layout="vertical" :model="spaceFrom" @finish="handleSubmit">
        <a-form-item name="spaceName" label="空间名称">
          <a-input v-model:value="spaceFrom.spaceName" placeholder="请输入空间名称" allow-clear />
        </a-form-item>
        <a-form-item name="spaceLevel" label="空间级别">
          <a-select
            v-model:value="spaceFrom.spaceLevel"
            style="min-width: 180px"
            placeholder="请选择空间级别"
            :options="SPACE_LEVEL_OPTIONS"
            allow-clear
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" :loading="loading" html-type="submit" style="width: 100%">
            {{ route.query?.id ? '保存修改' : '创建' }}
          </a-button>
        </a-form-item>
      </a-form>

      <a-card title="空间级别介绍" style="margin-top: 24px">
        <a-typography-paragraph>
          * 目前仅支持开通普通版，如需升级空间，请联系
          <a @click="handleUpgradeClick" style="cursor: pointer">站长</a>
        </a-typography-paragraph>
        <a-typography-paragraph v-for="spaceLevel in spaceLevelList" :key="spaceLevel.value">
          {{ spaceLevel.text }}: 大小 {{ formatSize(spaceLevel.maxSize) }}, 数量
          {{ spaceLevel.maxCount }}
        </a-typography-paragraph>
      </a-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRoute, useRouter } from 'vue-router'
import { addSpace, getSpaceVoById, listSpaceLevel, updateSpace } from '@/api/spaceController.ts'
import { listMyTeamSpace } from '@/api/spaceUserController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { SPACE_LEVEL_OPTIONS, SPACE_TYPE_ENUM, SPACE_TYPE_MAP } from '@/constants/space.ts'
import { formatSize } from '@/utils'

const loading = ref(false)
const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

// 空间类别判断
const spaceType = computed(() => {
  if (route.query?.type) {
    return Number(route.query.type)
  }
  return SPACE_TYPE_ENUM.PRIVATE
})

// 判断用户是否已经创建过团队空间
const hasCreatedTeamSpace = ref(false)

const checkUserTeamSpace = async () => {
  if (!loginUserStore.loginUser.id) return
  const res = await listMyTeamSpace()
  if (res.data.code === 0 && res.data.data) {
    const createdSpace = res.data.data.find(
      (item) => item.space?.userId === loginUserStore.loginUser.id,
    )
    if (createdSpace) {
      hasCreatedTeamSpace.value = true
    }
  }
}

// 拦截条件
const showUpgradeUI = computed(() => {
  return spaceType.value === SPACE_TYPE_ENUM.TEAM && !route.query.id && hasCreatedTeamSpace.value
})

// 获取空间级别列表展示
const spaceLevelList = ref<API.SpaceLevel[]>([])
const fetchSpaceLevelList = async () => {
  const res = await listSpaceLevel()
  if (res.data.code === 0 && res.data.data) {
    spaceLevelList.value = res.data.data
  } else {
    message.error({ content: '获取空间级别失败，' + res.data.message })
  }
}

const space = ref<API.SpaceVO>()
const spaceFrom = reactive<API.SpaceAddRequest | API.SpaceEditRequest>({})

const handleSubmit = async (values: any) => {
  const spaceId = space.value?.id
  loading.value = true
  let res
  if (spaceId) {
    res = await updateSpace({
      id: spaceId,
      ...spaceFrom,
    })
  } else {
    res = await addSpace({
      ...spaceFrom,
      spaceType: spaceType.value,
    })
  }
  // 操作成功
  if (res.data.code === 0 && res.data.data) {
    message.success(spaceId ? '修改成功' : '创建成功')
    router.push({
      path: `/space/${res.data.data}`,
    })
  } else {
    message.error('操作失败，' + res.data.message)
  }
  loading.value = false
}

const getOldSpace = async () => {
  const id = route.query?.id
  if (id) {
    const res = await getSpaceVoById({
      id,
    })
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      space.value = data
      spaceFrom.spaceName = data.spaceName
      spaceFrom.spaceLevel = data.spaceLevel
    }
  }
}

// 🚨 幽默小彩蛋：凭空生成一个过渡页面，3秒后强制带飞去读小说！
const handleUpgradeClick = () => {
  // 开一个空白的全新窗口
  const newWin = window.open('', '_blank')
  if (newWin) {
    // 动态写入 HTML 内容，包括了漂亮的样式和倒计时 JS 脚本
    const htmlContent =
      `
      <!DOCTYPE html>
      <html lang="zh-CN">
      <head>
        <meta charset="utf-8">
        <title>联系站长升级</title>
        <style>
          body {
            display: flex; justify-content: center; align-items: center;
            height: 100vh; margin: 0; background-color: #f0f2f5;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          }
          .card {
            text-align: center; padding: 40px 60px; background: #fff;
            border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          }
          h2 { color: #1890ff; font-weight: normal; margin-bottom: 16px; }
          p { color: #666; font-size: 16px; }
          .loading {
            display: inline-block;
            width: 24px; height: 24px;
            border: 3px solid #f3f3f3; border-top: 3px solid #1890ff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-top: 16px;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="card">
          <h2>暂时没有开通服务，先看会小说吧~</h2>
          <p><span id="sec">3</span> 秒后即将为您跳转到《熟睡之后》第一章...</p>
          <div class="loading"></div>
        </div>
        <script>
          let sec = 3;
          const timer = setInterval(() => {
            sec--;
            document.getElementById('sec').innerText = sec;
            if (sec <= 0) clearInterval(timer);
          }, 1000);

          setTimeout(() => {
            // 直接触发跳转：这里使用了百度定向搜索第一章的结果
            window.location.replace('https://www.baidu.com/s?wd=%E7%86%9F%E7%9D%A1%E4%B9%8B%E5%90%8E+%E7%AC%AC%E4%B8%80%E7%AB%A0');
          }, 3000);
        </sc` +
      `ript>
      </body>
      </html>
    `
    // 将代码写入这个新开的标签页并渲染
    newWin.document.write(htmlContent)
    newWin.document.close()
  } else {
    // 防御有些浏览器极端的拦截策略
    message.warning('弹窗被浏览器拦截，请允许弹出窗口哦~')
  }
}

onMounted(() => {
  fetchSpaceLevelList()
  getOldSpace()
  checkUserTeamSpace()
})
</script>

<style scoped>
#addSpacePage {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}

.upgrade-cards {
  margin-top: 48px;
}

.cards-title {
  text-align: center;
  font-weight: bold;
  color: #333;
  margin-bottom: 24px;
  font-size: 20px;
}

.level-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.level-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.15);
  border-color: #1890ff;
}

.level-card p {
  color: #555;
  margin-bottom: 12px;
  font-size: 15px;
}

.privilege-box {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #f0f0f0;
}

.privilege-box p {
  color: #52c41a;
  font-weight: 500;
  margin-bottom: 8px;
}
</style>
