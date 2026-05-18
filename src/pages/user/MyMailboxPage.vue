<template>
  <div id="myMailboxPage">
    <a-card title="我的邮箱" :bordered="false" class="mailbox-card">
      <a-list
        item-layout="horizontal"
        :data-source="messageList"
        :loading="loading"
        :locale="{ emptyText: '暂无消息' }"
      >
        <template #renderItem="{ item }">
          <a-list-item>
            <a-skeleton avatar :title="false" :loading="loading" active>
              <a-list-item-meta :description="formatDate(item.createTime)">
                <template #title>
                  <span class="message-title">{{ item.title }}</span>
                  <a-tag :color="getStatusColor(item.status)" class="status-tag">
                    {{ getStatusText(item.status) }}
                  </a-tag>
                </template>
                <template #avatar>
                  <a-avatar style="background-color: #1890ff">
                    <template #icon><MailOutlined /></template>
                  </a-avatar>
                </template>
              </a-list-item-meta>

              <div class="message-content">
                <span v-if="item.senderName">
                  <b>{{ item.senderName }}</b> 邀请你加入空间
                </span>
                <span v-else>{{ item.content }}</span>
              </div>
            </a-skeleton>

            <template #actions>
              <template v-if="!loading">
                <span v-if="item.status === 0">
                  <a-button type="link" @click="doHandleMessage(item, 1)">同意</a-button>
                  <a-button type="link" danger @click="doHandleMessage(item, 2)">拒绝</a-button>
                </span>
                <span v-else class="processed-text">
                  {{ item.status === 1 ? '已同意' : '已拒绝' }}
                </span>
              </template>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { MailOutlined } from '@ant-design/icons-vue'
import { getSysMessageList, handleSysMessage } from '@/api/sysMessageController.ts'
// 如果你项目里没有 dayjs，可以先不引入，用自带的 Date 格式化，但通常 Vite 项目会装
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
  } catch (error: any) {
    message.error('请求失败，' + error.message)
  }
  loading.value = false
}

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
  } catch (error: any) {
    message.error('请求异常，' + error.message)
  }
}
</script>

<style scoped>
#myMailboxPage {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}
.mailbox-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.message-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}
.status-tag {
  margin-left: 8px;
  border-radius: 4px;
}
.message-content {
  flex: 1;
  margin-left: 40px;
  color: #666;
}
.processed-text {
  color: #999;
  font-size: 14px;
  padding-right: 16px;
}
</style>
