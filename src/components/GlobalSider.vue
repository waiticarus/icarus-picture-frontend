<template>
  <div id="globalSider" @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
    <div class="hover-trigger" v-show="collapsed"></div>

    <a-layout-sider
      v-model:collapsed="collapsed"
      :collapsed-width="0"
      :trigger="null"
      collapsible
      width="200"
      v-if="loginUserStore.loginUser.id"
      class="floating-sider"
    >
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
  GiftOutlined, // 🚨 引入会员兑换专属的小礼物图标
  KeyOutlined, // 👈 新增魔法棒图标
} from '@ant-design/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { SPACE_TYPE_ENUM } from '@/constants/space.ts'
import { listMyTeamSpace } from '@/api/spaceUserController.ts'
import { message } from 'ant-design-vue'

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
  const finalMenuItems: any[] = [...dynamicFixedMenuItems]

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
let hoverTimeout: number | null = null

const handleMouseEnter = () => {
  if (hoverTimeout) clearTimeout(hoverTimeout)
  collapsed.value = false
}

const handleMouseLeave = () => {
  hoverTimeout = window.setTimeout(() => {
    collapsed.value = true
  }, 200)
}
</script>

<style scoped>
/* 🚨 核心修复：让侧边栏避开头部，并始终固定在左侧 */
#globalSider {
  position: fixed; /* 由 absolute 改为 fixed，确保往下滑动时它也乖乖留在屏幕左侧 */
  top: 64px; /* 🚨 核心：往下挪 64px，完美避开顶部导航栏的高度！ */
  left: 0;
  z-index: 990; /* 层级设置在 990，低于顶部导航栏的 1000，防止打架 */
  height: calc(100vh - 64px); /* 🚨 核心：高度动态计算为屏幕总高度减去头部的 64px，防止底部被吃掉 */
}

/* 鼠标靠近时的蓝光触发区 */
.hover-trigger {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 12px;
  background: linear-gradient(to right, rgba(24, 144, 255, 0.4), transparent);
  z-index: 101;
  cursor: pointer;
}

.floating-sider {
  height: 100%;
  background: #ffffff;
  /* 去掉右侧以外的阴影，让它和顶部导航栏融合得更自然 */
  box-shadow: 4px 0 10px rgba(0, 0, 0, 0.05);
  padding-top: 16px;
}

:deep(.ant-menu) {
  background: transparent;
}
</style>
