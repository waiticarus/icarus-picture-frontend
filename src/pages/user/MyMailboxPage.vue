<template>
  <div id="myMailboxPage">
    <!-- 页面头部 -->
    <div class="mailbox-header">
      <div class="mailbox-title-row">
        <h2 class="mailbox-title">
          <MailOutlined class="title-icon" />
          我的邮箱
        </h2>
        <a-badge
          v-if="pendingCount > 0"
          :count="pendingCount"
          :number-style="{ backgroundColor: '#ff7a45' }"
        >
          <span class="unread-label">待处理</span>
        </a-badge>
      </div>

      <!-- 统计卡片 -->
      <a-row :gutter="14" class="stats-row">
        <a-col :span="8">
          <div class="stat-card stat-pending">
            <div class="stat-value">{{ pendingCount }}</div>
            <div class="stat-label">待处理</div>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="stat-card stat-approved">
            <div class="stat-value">{{ approvedCount }}</div>
            <div class="stat-label">已同意</div>
          </div>
        </a-col>
        <a-col :span="8">
          <div class="stat-card stat-rejected">
            <div class="stat-value">{{ rejectedCount }}</div>
            <div class="stat-label">已拒绝</div>
          </div>
        </a-col>
      </a-row>
    </div>

    <!-- 消息列表 -->
    <div class="message-list-wrapper">
      <a-spin :spinning="loading">
        <!-- 空状态 -->
        <div v-if="messageList.length === 0 && !loading" class="empty-state">
          <div class="empty-icon">
            <InboxOutlined />
          </div>
          <div class="empty-text">暂无消息</div>
          <div class="empty-hint">当有新的空间邀请时，会在这里显示</div>
        </div>

        <!-- 消息列表 -->
        <div v-else class="message-list">
          <div
            v-for="item in messageList"
            :key="item.id"
            class="message-card"
            :class="'card-status-' + item.status"
          >
            <!-- 左侧状态指示条 -->
            <div class="card-indicator" :class="'ind-' + item.status"></div>

            <div class="card-body">
              <div class="card-top">
                <div class="card-title-area">
                  <a-avatar class="card-avatar" :class="'av-' + item.status">
                    <template #icon><MailOutlined /></template>
                  </a-avatar>
                  <div class="card-title-group">
                    <span class="card-title">{{ item.title || '空间邀请通知' }}</span>
                    <span class="card-time">
                      <ClockCircleOutlined />
                      {{ formatDate(item.createTime) }}
                    </span>
                  </div>
                </div>
                <a-tag :color="getStatusColor(item.status)" class="card-status-tag">
                  {{ getStatusText(item.status) }}
                </a-tag>
              </div>

              <div class="card-content">
                <span v-if="item.senderName">
                  <span class="sender-name">{{ item.senderName }}</span>
                  <span class="sender-action">邀请你加入空间</span>
                </span>
                <span v-else>{{ item.content }}</span>
              </div>

              <!-- 操作按钮 -->
              <div v-if="item.status === 0" class="card-actions">
                <a-button
                  type="primary"
                  size="small"
                  @click="doHandleMessage(item, 1)"
                  class="btn-approve"
                >
                  <CheckOutlined /> 同意
                </a-button>
                <a-button size="small" danger @click="doHandleMessage(item, 2)" class="btn-reject">
                  <CloseOutlined /> 拒绝
                </a-button>
              </div>
              <div v-else class="card-result">
                <span v-if="item.status === 1" class="result-ok">
                  <CheckCircleOutlined /> 已同意
                </span>
                <span v-else class="result-no"> <CloseCircleOutlined /> 已拒绝 </span>
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  MailOutlined,
  ClockCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons-vue'
import { getSysMessageList, handleSysMessage } from '@/api/sysMessageController.ts'
import dayjs from 'dayjs'

// 状态定义
const messageList = ref<API.SysMessageVO[]>([])
const loading = ref(false)

// 获取消息列表数据
const fetchData = async () => {
  loading.value = true
  try {
    const res = await getSysMessageList()
    if (res.data.code === 0 && res.data.data) {
      messageList.value = res.data.data
    } else {
      message.error('获取消息列表失败，' + res.data.message)
    }
  } catch (error: unknown) {
    message.error('请求失败，' + (error as Error).message)
  }
  loading.value = false
}

// 统计计算
const pendingCount = computed(() => messageList.value.filter((m) => m.status === 0).length)
const approvedCount = computed(() => messageList.value.filter((m) => m.status === 1).length)
const rejectedCount = computed(() => messageList.value.filter((m) => m.status === 2).length)

// 首次加载获取数据
onMounted(() => {
  fetchData()
})

// 处理状态显示的文字
const getStatusText = (status?: number) => {
  if (status === 0) return '待处理'
  if (status === 1) return '已同意'
  if (status === 2) return '已拒绝'
  return '未知'
}

// 处理状态显示的标签颜色
const getStatusColor = (status?: number) => {
  if (status === 0) return 'orange'
  if (status === 1) return 'green'
  if (status === 2) return 'default'
  return 'default'
}

// 格式化时间
const formatDate = (dateStr?: string) => {
  if (!dateStr) return ''
  return dayjs(dateStr).format('YYYY-MM-DD HH:mm:ss')
}

// 处理同意/拒绝的点击事件
const doHandleMessage = async (msg: API.SysMessageVO, targetStatus: number) => {
  try {
    const req: API.SysMessageRequest = {
      id: msg.id,
      receiverId: msg.receiverId,
      type: msg.type,
      extJson: msg.extJson,
      status: targetStatus,
    }
    const res = await handleSysMessage(req)

    if (res.data.code === 0 && res.data.data) {
      message.success('处理成功')
      // 处理成功后刷新当前页面的列表
      fetchData()

      // 🚨 新增：触发一个全局自定义事件，通知 GlobalHeader 去重新获取未读数量
      window.dispatchEvent(new CustomEvent('update-unread-count'))
    } else {
      message.error('处理失败，' + res.data.message)
    }
  } catch (error: unknown) {
    message.error('请求异常，' + (error as Error).message)
  }
}
</script>

<style scoped>
#myMailboxPage {
  max-width: 820px;
  margin: 0 auto;
}

/* ===== 页面头部 ===== */
.mailbox-header {
  margin-bottom: 24px;
}

.mailbox-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.mailbox-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: #1677ff;
  font-size: 24px;
}

.unread-label {
  font-size: 13px;
  color: #999;
  margin-right: 4px;
}

/* 统计卡片 */
.stats-row {
  margin: 0;
}

.stat-card {
  background: #fff;
  border-radius: 14px;
  padding: 18px 16px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  border: 1px solid #f0f0f0;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: default;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.stat-value {
  font-size: 30px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 13px;
  color: #999;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.stat-pending .stat-value {
  color: #ff7a45;
}

.stat-approved .stat-value {
  color: #52c41a;
}

.stat-rejected .stat-value {
  color: #bfbfbf;
}

/* ===== 消息列表容器 ===== */
.message-list-wrapper {
  background: #fff;
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 64px 0;
}

.empty-icon {
  font-size: 52px;
  color: #d9d9d9;
  margin-bottom: 16px;
}

.empty-text {
  color: #bbb;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 8px;
}

.empty-hint {
  color: #c8c8c8;
  font-size: 13px;
}

/* ===== 消息卡片 ===== */
.message-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.message-card {
  display: flex;
  align-items: stretch;
  border-radius: 12px;
  overflow: hidden;
  transition: background 0.2s ease;
}

.message-card:hover {
  background: #fafcff;
}

.card-indicator {
  width: 3px;
  border-radius: 2px;
  flex-shrink: 0;
  margin: 14px 0;
  transition: opacity 0.25s;
}

.ind-0 {
  background: linear-gradient(to bottom, #ff7a45, #ff9c6e);
}

.ind-1 {
  background: linear-gradient(to bottom, #52c41a, #73d13d);
}

.ind-2 {
  background: #e8e8e8;
}

.card-body {
  flex: 1;
  padding: 16px 18px;
  min-width: 0;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
}

.card-title-area {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.card-avatar {
  flex-shrink: 0;
}

.av-0 {
  background: #fff7e6 !important;
  color: #ff7a45 !important;
}

.av-1 {
  background: #f6ffed !important;
  color: #52c41a !important;
}

.av-2 {
  background: #f5f5f5 !important;
  color: #bfbfbf !important;
}

.card-title-group {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a2e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-time {
  font-size: 12px;
  color: #bbb;
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-status-tag {
  flex-shrink: 0;
  border-radius: 6px;
  font-size: 12px;
  margin-left: 10px;
}

.card-content {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 4px;
}

.sender-name {
  color: #1677ff;
  font-weight: 600;
}

.sender-action {
  margin-left: 4px;
}

/* 操作按钮 */
.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn-approve {
  border-radius: 8px;
  font-weight: 500;
}

.btn-reject {
  border-radius: 8px;
  font-weight: 500;
}

/* 处理结果 */
.card-result {
  margin-top: 6px;
}

.result-ok {
  color: #52c41a;
  font-size: 13px;
  font-weight: 500;
}

.result-no {
  color: #bfbfbf;
  font-size: 13px;
  font-weight: 500;
}
</style>
