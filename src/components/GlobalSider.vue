<template>
  <div id="globalSider">
    <!-- 左侧悬停触发条（仅8px宽，鼠标必须贴近左边界才触发） -->
    <div class="hover-trigger" v-show="collapsed && !pinned" @mouseenter="handleMouseEnter"></div>

    <!-- 折叠态浮动展开按钮 -->
    <div
      v-if="collapsed && !pinned && loginUserStore.loginUser.id"
      class="expand-btn"
      @click="togglePinned"
    >
      <MenuUnfoldOutlined />
    </div>

    <a-layout-sider
      :collapsed-width="0"
      :trigger="null"
      collapsible
      width="220"
      v-if="loginUserStore.loginUser.id"
      class="floating-sider"
      :class="{ 'is-pinned': pinned, 'is-collapsed': collapsed }"
      @mouseleave="handleMouseLeave"
    >
      <!-- 侧边栏头部 -->
      <div class="sider-header">
        <div class="sider-decor">
          <AppstoreOutlined class="decor-icon" />
          <span class="decor-text">快捷导航</span>
        </div>
        <a-tooltip :title="pinned ? '取消固定' : '固定侧边栏'">
          <a-button type="text" class="pin-btn" @click.stop="togglePinned">
            <PushpinOutlined :class="{ 'is-pinned': pinned }" />
          </a-button>
        </a-tooltip>
      </div>

      <div class="sider-divider"></div>

      <a-menu v-model:selectedKeys="current" mode="inline" :items="menuItems" @click="doMenuClick">
      </a-menu>
    </a-layout-sider>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, ref, watchEffect } from 'vue'
import {
  PictureOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  GiftOutlined,
  KeyOutlined,
  PushpinOutlined,
  MenuUnfoldOutlined,
  AppstoreOutlined,
} from '@ant-design/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'
import { listMyTeamSpace } from '@/api/spaceUserController.ts'
import { MenuProps, message } from 'ant-design-vue'

const loginUserStore = useLoginUserStore()
const teamSpaceList = ref<API.SpaceUserVO[]>([])

// 🚨 重构：动态渲染菜单（修复了没有团队就不显示后续菜单的 Bug）
const menuItems = computed(() => {
  const hasCreatedTeamSpace = teamSpaceList.value.some(
    (item) => item.space?.userId === loginUserStore.loginUser.id,
  )

  // 1. 基础固定菜单
  const dynamicFixedMenuItems = [
    {
      key: '/',
      icon: () => h(PictureOutlined),
      label: '公共图库',
    },
    {
      key: '/my_space',
      label: '我的空间',
      icon: () => h(UserOutlined),
    },
    {
      key: '/add_space?type=' + SPACE_TYPE_ENUM.TEAM,
      label: hasCreatedTeamSpace ? '升级空间' : '创建团队空间',
      icon: () => h(TeamOutlined),
    },
  ]

  // 初始化最终要返回的菜单数组
  const finalMenuItems: MenuProps['items'] = [...dynamicFixedMenuItems]

  // 2. 团队空间分组（如果有团队，才塞进数组里）
  if (teamSpaceList.value.length > 0) {
    const teamSpaceSubMenus = teamSpaceList.value.map((spaceUser) => {
      const space = spaceUser.space
      const isCreator = space?.userId === loginUserStore.loginUser.id

      return {
        key: '/space/' + spaceUser.spaceId,
        label: isCreator
          ? h(
              'div',
              { style: 'display: flex; align-items: center; justify-content: space-between;' },
              [
                h(
                  'span',
                  { style: 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;' },
                  space?.spaceName,
                ),
                h(CrownOutlined, {
                  style: { color: '#faad14', fontSize: '15px', marginLeft: '4px' },
                  title: '我创建的团队空间',
                }),
              ],
            )
          : space?.spaceName,
      }
    })

    finalMenuItems.push({
      type: 'group',
      label: '我的团队',
      key: 'teamSpaceGroup',
      children: teamSpaceSubMenus,
    })
  }

  // 3. 🚨 新增：会员功能分组（强行塞在最下面）
  const vipMenuGroup = {
    type: 'group',
    label: '会员',
    key: 'vipGroup',
    children: [
      {
        key: '/vip/exchange', // 这是预留给兑换会员页面的路由
        label: '我的会员',
        icon: () => h(GiftOutlined),
      },
      {
        key: '/vip/giftcode', // 👈 新增口令兑换路由
        label: '口令兑换',
        icon: () => h(KeyOutlined),
      },
      // 如果未来还有 "我的会员权益"、"购买会员" 等菜单，直接加在这里即可
    ],
  }

  finalMenuItems.push(vipMenuGroup)

  return finalMenuItems
})

const fetchTeamSpaceList = async () => {
  const res = await listMyTeamSpace()
  if (res.data.code === 0 && res.data.data) {
    teamSpaceList.value = res.data.data
  } else {
    message.error('加载我的团队空间失败，' + res.data.message)
  }
}

watchEffect(() => {
  if (loginUserStore.loginUser.id) {
    fetchTeamSpaceList()
  }
})

const router = useRouter()
const route = useRoute()

const doMenuClick = ({ key }: { key: string }) => {
  router.push(key)
}

const current = ref<string[]>([])

// 智能监控路由变动，精准校对侧边栏高亮状态
watchEffect(() => {
  const path = route.path
  const type = route.query?.type

  if (path === '/add_space' && type) {
    current.value = [`/add_space?type=${type}`]
  } else if (path.startsWith('/space/')) {
    const spaceId = path.split('/')[2]
    const isTeamSpace = teamSpaceList.value.some((item) => item.spaceId == Number(spaceId))

    if (isTeamSpace) {
      current.value = [path]
    } else {
      current.value = ['/my_space']
    }
  } else {
    current.value = [path]
  }
})

// === 侧边栏收起/展开控制逻辑 ===
const collapsed = ref(true)
const pinned = ref(false)
let hoverTimeout: number | null = null

const togglePinned = () => {
  pinned.value = !pinned.value
  if (pinned.value) {
    collapsed.value = false
  }
}

const handleMouseEnter = () => {
  if (pinned.value) return
  if (hoverTimeout) clearTimeout(hoverTimeout)
  collapsed.value = false
}

const handleMouseLeave = () => {
  if (pinned.value) return
  hoverTimeout = window.setTimeout(() => {
    collapsed.value = true
  }, 200)
}
</script>

<style scoped>
#globalSider {
  position: fixed;
  top: 64px;
  left: 0;
  z-index: 990;
  width: 0;
  overflow: visible;
  height: calc(100vh - 64px);
}

/* 左侧悬停触发条 */
.hover-trigger {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 8px;
  background: linear-gradient(to right, rgba(22, 119, 255, 0.12), transparent);
  z-index: 101;
  cursor: pointer;
  transition: background 0.3s;
}

.hover-trigger:hover {
  background: linear-gradient(to right, rgba(22, 119, 255, 0.28), transparent);
}

/* 折叠态浮动展开按钮 */
.expand-btn {
  position: fixed;
  top: 50%;
  left: 8px;
  transform: translateY(-50%);
  z-index: 102;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(22, 119, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1677ff;
  font-size: 15px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
}

.expand-btn:hover {
  background: #1677ff;
  color: #fff;
  transform: translateY(-50%) scale(1.12);
  box-shadow: 0 4px 18px rgba(22, 119, 255, 0.32);
}

/* 侧边栏主体 */
.floating-sider {
  height: 100% !important;
  background: rgba(255, 255, 255, 0.84) !important;
  backdrop-filter: blur(22px) saturate(1.4);
  -webkit-backdrop-filter: blur(22px) saturate(1.4);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.06);
  border-right: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 0 16px 16px 0;
  transform: translateX(0);
  transition:
    transform 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s ease;
  will-change: transform;
}

.floating-sider.is-collapsed {
  transform: translateX(-100%);
  pointer-events: none;
}

.floating-sider.is-pinned {
  box-shadow: 6px 0 28px rgba(0, 0, 0, 0.09);
}

/* 侧边栏头部 */
.sider-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 16px 14px;
}

.sider-decor {
  display: flex;
  align-items: center;
  gap: 8px;
}

.decor-icon {
  font-size: 15px;
  color: #b0b0c0;
}

.decor-text {
  font-size: 13px;
  color: #b0b0c0;
  font-weight: 500;
  letter-spacing: 1px;
}

.pin-btn {
  color: #aaa;
  font-size: 16px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.pin-btn:hover {
  color: #1677ff;
  background: rgba(22, 119, 255, 0.07);
}

.pin-btn .is-pinned {
  color: #1677ff;
  transform: rotate(-45deg);
}

/* 头部分隔线 */
.sider-divider {
  height: 1px;
  margin: 0 16px 10px;
  background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.06), transparent);
}

/* 菜单样式 */
:deep(.ant-menu) {
  background: transparent !important;
  border-inline-end: none !important;
  padding: 4px 8px;
}

:deep(.ant-menu-item) {
  margin: 2px 0 !important;
  border-radius: 10px !important;
  height: 42px !important;
  line-height: 42px !important;
  color: #4a4a6a;
  font-weight: 500;
  font-size: 14px;
  padding-left: 16px !important;
  transition: all 0.25s ease;
}

:deep(.ant-menu-item:hover) {
  background: rgba(22, 119, 255, 0.06) !important;
  color: #1677ff;
}

:deep(.ant-menu-item-selected) {
  background: rgba(22, 119, 255, 0.1) !important;
  color: #1677ff;
  font-weight: 600;
}

:deep(.ant-menu-item .anticon) {
  font-size: 17px;
  color: #8a8aa0;
  transition: color 0.25s ease;
}

:deep(.ant-menu-item:hover .anticon),
:deep(.ant-menu-item-selected .anticon) {
  color: #1677ff;
}

:deep(.ant-menu-item-selected::after) {
  display: none !important;
}

/* 菜单分组标题 */
:deep(.ant-menu-item-group-title) {
  padding: 10px 18px 4px !important;
  font-size: 11px;
  font-weight: 600;
  color: #bbb;
  letter-spacing: 0.6px;
}

/* 子菜单 */
:deep(.ant-menu-submenu-title) {
  margin: 2px 0 !important;
  border-radius: 10px !important;
  height: 42px !important;
  line-height: 42px !important;
}

:deep(.ant-menu-submenu-title:hover) {
  background: rgba(22, 119, 255, 0.06) !important;
  color: #1677ff;
}
</style>
