<template>
  <div id="myVipPage">
    <template v-if="!loginUserStore.loginUser.id">
      <a-result status="403" title="您尚未登录" sub-title="登录后即可查看会员权益并尊享优质服务">
        <template #extra>
          <a-button type="primary" size="large" @click="router.push('/user/login')">
            立即登录
          </a-button>
        </template>
      </a-result>
    </template>

    <template v-else>
      <a-alert
        v-if="isAdmin"
        message="至尊管理员特权"
        description="您是尊贵的系统管理员，已自动解锁全站最高权限，无需兑换或充值会员即可畅享所有功能！"
        type="success"
        show-icon
        style="margin-bottom: 24px; border: 1px solid #52c41a; background-color: #f6ffed"
      />

      <a-card class="member-header-card" :bordered="false">
        <a-space size="large">
          <a-avatar :size="80" :src="loginUserStore.loginUser.userAvatar" />
          <div class="user-info">
            <h2 style="display: flex; align-items: center; gap: 8px; margin: 0">
              <span :class="userRoleClass">
                {{ loginUserStore.loginUser.userName ?? '未命名用户' }}
              </span>
              <a-tag v-if="isMember || isAdmin" :color="tagColor" class="vip-tag">
                {{ currentLevelTitle }}
              </a-tag>
            </h2>
            <p v-if="isAdmin" class="expiry-text">身份：系统管理员，各项权益永久生效</p>
            <p v-else-if="isMember" class="expiry-text">
              会员有效期至：{{ formatTime(loginUserStore.loginUser.vipExpireTime) }}
            </p>
            <p v-else class="expiry-text">您当前还不是会员，快去开通尊享特权吧！</p>
          </div>
        </a-space>
      </a-card>

      <div class="section-title">✨ 会员专属特权</div>
      <a-row :gutter="[24, 24]">
        <a-col :xs="24" :sm="12" :md="8">
          <a-card hoverable class="benefit-card">
            <template #cover>
              <div class="benefit-icon"><span style="color: #ff4d4f">A</span></div>
            </template>
            <a-card-meta
              title="尊贵变色昵称"
              description="全站告别枯燥黑白，尊享VIP红、SVIP金等耀眼标识"
            />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8">
          <a-card hoverable class="benefit-card">
            <template #cover>
              <div class="benefit-icon"><span style="color: #1890ff">AI</span></div>
            </template>
            <a-card-meta
              title="AI 扩图特权"
              description="摆脱普通用户额度焦虑，让 AI 尽情释放创造力"
            />
          </a-card>
        </a-col>
        <a-col :xs="24" :sm="12" :md="8">
          <a-card hoverable class="benefit-card">
            <template #cover>
              <div class="benefit-icon"><span style="color: #faad14">∞</span></div>
            </template>
            <a-card-meta
              title="海量存储空间"
              description="告别空间爆满，最高 100GB 独家私有云随心存"
            />
          </a-card>
        </a-col>
      </a-row>

      <div class="section-title">💎 会员等级对比</div>
      <a-table
        :dataSource="vipTiers"
        :columns="tierColumns"
        :pagination="false"
        class="tier-table"
        bordered
      />

      <div class="section-title">🎁 获取会员资格</div>
      <a-card class="exchange-card">
        <a-alert
          v-if="isMember"
          message="续费提示"
          description="如果您已是会员，通过兑换或充值将按照规则顺延有效期；若充值更高级别会员，将直接覆盖升级。"
          type="info"
          show-icon
          style="margin-bottom: 24px"
        />

        <a-tabs v-model:activeKey="activeTab">
          <a-tab-pane key="code" tab="兑换码兑换">
            <div class="redeem-box">
              <a-input-search
                v-model:value="redeemCodeValue"
                placeholder="请输入您的 VIP 兑换码"
                enter-button="立即兑换"
                size="large"
                :loading="redeemLoading"
                @search="doRedeem"
              />
              <p class="tips">提示：前往左侧「口令兑换」页面参与活动可白嫖兑换码</p>
            </div>
          </a-tab-pane>

          <a-tab-pane key="recharge" tab="充值开通">
            <div class="recharge-placeholder">
              <a-empty description="在线支付功能暂未开通">
                <a-button type="primary" @click="handleContactAdmin">联系站长手动充值</a-button>
              </a-empty>
            </div>
          </a-tab-pane>
        </a-tabs>
      </a-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import { redeemVipCode } from '@/api/userController.ts'
import dayjs from 'dayjs'

const router = useRouter()
const loginUserStore = useLoginUserStore()

// --- 身份判定逻辑 ---
const isAdmin = computed(() => loginUserStore.loginUser.userRole === 'admin')

const isMember = computed(() => {
  const role = loginUserStore.loginUser.userRole
  return role === 'vip' || role === 'svip'
})

// 根据角色返回不同的 CSS 样式类
const userRoleClass = computed(() => {
  const role = loginUserStore.loginUser.userRole
  if (role === 'admin') return 'admin-name'
  if (role === 'svip') return 'svip-name'
  if (role === 'vip') return 'vip-name'
  return ''
})

const currentLevelTitle = computed(() => {
  const role = loginUserStore.loginUser.userRole
  if (role === 'admin') return '至尊管理员'
  if (role === 'svip') return '超级会员 SVIP'
  if (role === 'vip') return '正式会员 VIP'
  return '普通用户'
})

// 根据角色返回不同颜色的 Tag
const tagColor = computed(() => {
  const role = loginUserStore.loginUser.userRole
  if (role === 'admin') return 'purple'
  if (role === 'svip') return 'gold'
  if (role === 'vip') return 'red'
  return 'default'
})

// --- 静态展示数据 ---
const activeTab = ref('code')
const redeemCodeValue = ref('')
const redeemLoading = ref(false)

// 🚨 权益数据：新增了普通用户的匮乏感设定
const vipTiers = [
  { key: '1', feature: '昵称颜色', user: '枯燥黑', vip: '活力红', svip: '流光金' },
  { key: '2', feature: 'AI 扩图/月', user: '10 次', vip: '100 次', svip: '不限量' },
  { key: '3', feature: '私有云存储', user: '2 GB', vip: '20 GB', svip: '200 GB' },
  { key: '4', feature: '专属客服', user: '❌', vip: '❌', svip: '✔️' },
]

const tierColumns = [
  { title: '专属权益', dataIndex: 'feature', key: 'feature', width: '25%' },
  { title: '普通用户', dataIndex: 'user', key: 'user', width: '25%' },
  { title: '正式会员 VIP', dataIndex: 'vip', key: 'vip', width: '25%' },
  { title: '超级会员 SVIP', dataIndex: 'svip', key: 'svip', width: '25%' },
]

// --- 操作方法 ---

const formatTime = (time: any) => {
  if (!time) return '永久有效'
  return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
}

// 核心兑换逻辑
const doRedeem = async () => {
  if (!redeemCodeValue.value) {
    return message.warning('请输入兑换码')
  }
  redeemLoading.value = true
  try {
    const res = await redeemVipCode({
      code: redeemCodeValue.value,
    })
    if (res.data.code === 0) {
      message.success('恭喜！会员兑换成功')
      redeemCodeValue.value = ''
      // 更新 Pinia 中的用户信息
      loginUserStore.setLoginUser(res.data.data)
    } else {
      message.error('兑换失败：' + res.data.message)
    }
  } catch (e: any) {
    message.error('网络错误，请稍后再试')
  } finally {
    redeemLoading.value = false
  }
}

const handleContactAdmin = () => {
  window.open('https://codefather.cn', '_blank')
}
</script>

<style scoped>
#myVipPage {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: bold;
  margin: 40px 0 16px;
  color: #333;
}

/* 头部卡片样式 */
.member-header-card {
  background: linear-gradient(135deg, #ffffff 0%, #fffbf0 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

/* 🚨 核心：定义不同角色的绝美昵称样式 */
.admin-name {
  background: linear-gradient(90deg, #ff512f, #dd2476, #4facfe, #00f2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900 !important;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.svip-name {
  color: #faad14 !important;
  font-weight: 800 !important;
}

/* 🚨 修复后：去掉阴影、降低字重、优化渐变渲染不发虚 */
.admin-name {
  background: linear-gradient(90deg, #ff512f, #dd2476, #4facfe, #00f2fe);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700 !important;
  /* 移除 text-shadow 彻底消除光晕模糊 */
  /* text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
}
.svip-name {
  color: #faad14 !important;
  font-weight: 800 !important;
}
.vip-name {
  color: #ff4d4f !important;
  font-weight: bold !important;
}
/* 给标签加抗锯齿，杜绝被渐变文字带模糊 */
.vip-tag {
  font-weight: 500;
  font-size: 13px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
.expiry-text {
  color: #999;
  margin-top: 8px;
}

/* 权益卡片 */
.benefit-card {
  text-align: center;
  border-radius: 12px;
}

.benefit-icon {
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 40px;
  font-weight: bold;
  background: #f9f9f9;
}

/* 表格样式：突出中间和右侧的对比 */
.tier-table :deep(th) {
  background-color: #fafafa !important;
  font-weight: bold;
}
.tier-table :deep(td:nth-child(2)) {
  color: #999; /* 让普通用户的权益变灰，凸显寒酸 */
}
.tier-table :deep(td:nth-child(3)) {
  color: #ff4d4f;
  font-weight: 500;
}
.tier-table :deep(td:nth-child(4)) {
  color: #faad14;
  font-weight: bold;
  background-color: #fffdf5; /* 给SVIP一列增加尊贵的浅金底色 */
}

/* 兑换区域 */
.exchange-card {
  border-radius: 12px;
}

.redeem-box {
  padding: 20px 0;
  max-width: 600px;
}

.tips {
  margin-top: 12px;
  color: #999;
  font-size: 13px;
}

.recharge-placeholder {
  padding: 40px 0;
}
</style>
