<template>
  <div id="globalHeader">
    <a-row class="header-row" :wrap="false">
      <a-col flex="200px">
        <router-link to="/">
          <div class="title-bar">
            <img class="logo" src="../assets/logo.png" alt="logo" />
            <div class="title">icarus云图库</div>
          </div>
        </router-link>
      </a-col>

      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
      </a-col>

      <a-col flex="120px">
        <!-- 改造后的用户登录状态区域 -->
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-space size="24">
              <!-- 铃铛消息提醒 -->
              <a-badge :count="unreadCount">
                <a-button type="text" shape="circle" @click="router.push('/my_mailbox')">
                  <template #icon><BellOutlined style="font-size: 18px" /></template>
                </a-button>
              </a-badge>

              <!-- 🔧 修复：移除重复的 <a-dropdown> 标签，补全闭合 -->
              <a-dropdown>
                <a-space style="cursor: pointer">
                  <a-avatar :src="loginUserStore.loginUser.userAvatar" />
                  <span :class="userRoleClass">
                    {{ loginUserStore.loginUser.userName ?? 'nameless' }}
                  </span>
                </a-space>
                <template #overlay>
                  <a-menu>
                    <a-menu-item>
                      <router-link to="/user/profile">
                        <SolutionOutlined />
                        个人信息
                      </router-link>
                    </a-menu-item>
                    <!-- 新增：我的邮箱菜单项 -->
                    <a-menu-item>
                      <router-link to="/my_mailbox">
                        <MailOutlined />
                        我的邮箱
                        <a-badge
                          :count="unreadCount"
                          :number-style="{
                            backgroundColor: '#ff4d4f',
                            marginLeft: '8px',
                            transform: 'scale(0.8)',
                          }"
                        />
                      </router-link>
                    </a-menu-item>
                    <a-menu-item>
                      <router-link to="/my_space">
                        <UserOutlined />
                        我的空间
                      </router-link>
                    </a-menu-item>
                    <a-menu-item @click="doLogout">
                      <a href="javascript:;">
                        <LogoutOutlined />
                        退出登录
                      </a>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
              <!-- 🔧 补全：该标签原本缺失闭合 -->
            </a-space>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, reactive, ref, onMounted, onUnmounted, watch } from 'vue'
import {
  HomeOutlined,
  LogoutOutlined,
  UserOutlined,
  SolutionOutlined,
  BellOutlined,
  MailOutlined,
} from '@ant-design/icons-vue'
import { MenuProps, message, notification } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { listUserVoPage, userLogout } from '@/api/userController.ts'
import { getSysMessageList } from '@/api/sysMessageController.ts'

const loginUserStore = useLoginUserStore()

// 🚨 新增：根据角色返回不同颜色的 CSS 类名，让右上角名字变色
const userRoleClass = computed(() => {
  const role = loginUserStore.loginUser.userRole
  if (role === 'admin') return 'admin-name'
  if (role === 'svip') return 'svip-name'
  if (role === 'vip') return 'vip-name'
  return ''
})

const originItems = [
  {
    key: '/',
    icon: () => h(HomeOutlined),
    label: '主页',
    title: '主页',
  },
  {
    key: '/admin/userManage',
    label: '用户管理',
    title: '用户管理',
  },
  {
    key: '/add_picture',
    label: '创建图片',
    title: '创建图片',
  },
  {
    key: '/admin/pictureManage',
    label: '图片管理',
    title: '图片管理',
  },
  {
    key: '/admin/spaceManage',
    label: '空间管理',
    title: '空间管理',
  },
  {
    key: '/introduction',
    label: '个人介绍',
    title: '个人介绍',
  },
]

const filterMenus = (menus = [] as MenuProps['items']) => {
  return menus?.filter((menu) => {
    // 管理员才能看到 /admin 开头的菜单
    if (menu?.key?.startsWith('/admin')) {
      const loginUser = loginUserStore.loginUser
      if (!loginUser || loginUser.userRole !== 'admin') {
        return false
      }
    }
    return true
  })
}

const items = computed(() => {
  return filterMenus(originItems)
})

const router = useRouter()
const doMenuClick = ({ key }) => {
  router.push({
    path: key,
  })
}

const current = ref<string[]>([])
router.afterEach((to) => {
  current.value = [to.path]
})

// ================= 新增：消息与 SSE 相关逻辑 =================
const unreadCount = ref(0)
let sseSource: EventSource | null = null
let reconnectTimer: any = null
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 10

// 获取初始未读消息数量
const fetchUnreadCount = async () => {
  if (!loginUserStore.loginUser.id) return
  try {
    const res = await getSysMessageList()
    if (res.data.code === 0 && res.data.data) {
      // 过滤出状态为 0 (待处理/未读) 的消息
      const pendingMsgs = res.data.data.filter((msg: any) => msg.status === 0)
      unreadCount.value = pendingMsgs.length
    }
  } catch (error) {
    console.error('获取消息列表失败:', error)
  }
}

// 统一清理 SSE 连接和定时器的工具函数
const clearSSE = () => {
  if (sseSource) {
    sseSource.close()
    sseSource = null
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
}

// 初始化 SSE 连接（服务端推送）
const initSSE = () => {
  // 1. 守卫：未登录则返回
  if (!loginUserStore.loginUser.id) return

  // 2. 守卫：已有活跃连接或正在连接中，防止重复创建
  if (
    sseSource &&
    (sseSource.readyState === EventSource.OPEN || sseSource.readyState === EventSource.CONNECTING)
  ) {
    return
  }

  // 3. 清理可能处于关闭状态的旧连接实体
  clearSSE()

  // 4. 使用绝对路径，彻底避开 Vite 代理盲区
  const backendUrl = 'http://localhost:8123/api/sse/connect'
  console.log(`====== [前端 SSE] 准备向 ${backendUrl} 发起连接... ======`)

  // 5. 创建 EventSource
  sseSource = new EventSource(backendUrl, { withCredentials: true })

  // 6. onopen: 连接成功，重置重连计数器
  sseSource.onopen = () => {
    console.log('====== [前端 SSE] 浏览器确认：底层流通道真正建立成功！等待接收消息 ======')
    reconnectAttempts = 0
  }

  // 7. 核心修复：单独监听后端带名字的 "ping" 心跳事件
  sseSource.addEventListener('ping', (event) => {
    console.log('====== [前端 SSE] 收到心跳保活包 ======', event.data)
  })

  // 8. onmessage: 专职处理无名的业务通知事件
  sseSource.onmessage = (event) => {
    console.log('====== [前端 SSE] 收到真实业务消息！======', event.data)
    unreadCount.value += 1
    notification.info({
      message: '新通知',
      description: event.data,
      placement: 'topRight',
      duration: 5,
    })
  }

  // 9. onerror: 异常处理与指数退避重连机制
  sseSource.onerror = (error) => {
    console.error('====== [前端 SSE] 连接发生错误或被断开！======', error)
    clearSSE() // 必须先清理旧连接

    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      // 指数退避计算：1s, 2s, 4s, 8s, 16s... 最大限制在 30 秒
      const timeout = Math.min(Math.pow(2, reconnectAttempts) * 1000, 30000)
      console.log(
        `====== [前端 SSE] 将在 ${timeout / 1000} 秒后尝试第 ${reconnectAttempts + 1} 次重连 ======`,
      )

      reconnectTimer = setTimeout(() => {
        reconnectAttempts++
        initSSE()
      }, timeout)
    } else {
      console.error('====== [前端 SSE] 达到最大重连次数，停止重连。请检查网络或后端服务。 ======')
    }
  }
}

// 🚨 新增：定义一个处理未读数量更新的函数
const handleUpdateUnread = () => {
  console.log('====== [前端状态] 监听到消息已处理，重新获取未读消息数 ======')
  fetchUnreadCount()
}

// 组件挂载时，添加全局事件监听
onMounted(() => {
  window.addEventListener('update-unread-count', handleUpdateUnread)
})

// 组件销毁时断开连接，并移除事件监听，避免内存泄漏
onUnmounted(() => {
  clearSSE()
  window.removeEventListener('update-unread-count', handleUpdateUnread)
})

// 监听用户登录状态的变化
watch(
  () => loginUserStore.loginUser.id,
  (newId) => {
    if (newId) {
      console.log('用户已登录，准备获取历史消息并建立 SSE 通道...')
      fetchUnreadCount()
      initSSE()
    } else {
      clearSSE()
    }
  },
  { immediate: true },
)

const doLogout = async () => {
  const res = await userLogout()
  if (res.data.code === 0) {
    loginUserStore.setLoginUser({
      userName: '未登录',
    })

    // 退出登录时必须清理干净连接
    clearSSE()

    message.success('已退出登录')
    await router.push('/user/login')
  } else {
    message.error('退出失败' + res.data.message)
  }
}
</script>

<style scoped>
/* 1. 外层容器作为占位符，强制撑开 64px 高度。防止内部元素 fixed 脱离文档流后，页面下方内容塌陷被遮盖 */
#globalHeader {
  height: 64px;
}

/* 2. 真正吸顶的是内部的 header-row。使用 fixed 彻底无视所有父组件的 overflow 限制 */
.header-row {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%; /* 强制宽度 100%，彻底盖住右侧的暗色边距 */
  height: 64px;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  box-sizing: border-box;
  padding: 0 24px; /* 增加左右内边距，使内容不贴着屏幕边缘 */
  margin: 0 !important; /* 强制去除 a-row 默认的负边距，防止出现横向滚动条 */
  align-items: center; /* 确保内部元素完美垂直居中 */
}

.title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: black;
  font-size: 18px;
  margin-left: 16px;
}

.logo {
  height: 48px;
}

/* 去掉 Ant Design 菜单自带的底部灰线，让导航栏看着更清爽无界 */
:deep(.ant-menu-horizontal) {
  border-bottom: none;
  line-height: 64px; /* 让菜单项和整个导航栏高度一致 */
}

.user-login-status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 100%;
}

/* 🚨 将不同角色的炫酷昵称样式同步到全局顶部栏 */
.admin-name {
  background: linear-gradient(90deg, #ff512f, #dd2476, #4facfe, #00f2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900 !important;
}

.svip-name {
  color: #faad14 !important;
  font-weight: 800 !important;
}

.vip-name {
  color: #ff4d4f !important;
  font-weight: bold !important;
}
</style>
