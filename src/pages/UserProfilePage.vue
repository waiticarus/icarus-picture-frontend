<template>
  <div id="userProfilePage">
    <a-card :bordered="false" class="profile-card">
      <div class="profile-header">
        <div class="avatar-section">
          <a-upload
            name="avatar"
            list-type="picture-circle"
            class="avatar-uploader"
            :show-upload-list="false"
            :before-upload="handleBeforeUpload"
          >
            <div class="avatar-hover-mask">
              <camera-outlined style="font-size: 24px; color: #fff" />
              <div style="color: #fff; margin-top: 4px; font-size: 12px">更换头像</div>
            </div>
            <img v-if="previewUrl" :src="previewUrl" alt="avatar" class="avatar-image" />
            <div v-else class="empty-avatar">
              <plus-outlined style="font-size: 24px; color: #999" />
            </div>
          </a-upload>
        </div>

        <div class="user-brief">
          <h2 class="greeting">
            你好，<span :class="userRoleClass">{{ loginUser.userName ?? '未命名用户' }}</span>
          </h2>
          <a-tag :color="tagColor" class="role-tag">
            {{ currentLevelTitle }}
          </a-tag>
        </div>
      </div>

      <div class="form-container">
        <a-form :model="formData" layout="vertical" @finish="handleSubmit" class="custom-form">
          <a-row :gutter="24">
            <a-col :xs="24" :md="12">
              <a-form-item label="登录账号 (不可修改)">
                <a-input :value="loginUser.userAccount" disabled class="readonly-input" />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="注册时间">
                <a-input :value="loginUser.createTime" disabled class="readonly-input" />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :xs="24" :md="12">
              <a-form-item label="用户昵称" name="userName">
                <a-input
                  v-model:value="formData.userName"
                  placeholder="给自己起个响亮的名字吧"
                  size="large"
                />
              </a-form-item>
            </a-col>
            <a-col :xs="24" :md="12">
              <a-form-item label="性别" name="userGender">
                <a-select v-model:value="formData.userGender" placeholder="请选择性别" size="large">
                  <a-select-option :value="0">保密</a-select-option>
                  <a-select-option :value="1">男生 👦</a-select-option>
                  <a-select-option :value="2">女生 👧</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-form-item
            label="绑定邮箱"
            name="userEmail"
            :extra="
              !loginUser.userEmail ? '⚠️ 提示：邮箱一旦绑定成功，后续如需修改请联系管理员。' : ''
            "
          >
            <div v-if="!loginUser.userEmail" class="email-bind-section">
              <a-input
                v-model:value="emailForm.email"
                placeholder="请输入要绑定的QQ邮箱"
                size="large"
                :disabled="emailForm.emailSent"
                style="margin-bottom: 8px"
              >
                <template #prefix><mail-outlined style="color: rgba(0, 0, 0, 0.25)" /></template>
              </a-input>
              <div class="email-bind-actions">
                <a-button
                  type="dashed"
                  :disabled="sendBindCodeDisabled"
                  @click="handleSendBindCode"
                >
                  {{ bindSendBtnText }}
                </a-button>
                <a-input
                  v-if="emailForm.emailSent"
                  v-model:value="emailForm.bindCode"
                  placeholder="请输入6位验证码"
                  :maxlength="6"
                  style="width: 160px; margin-left: 8px"
                />
              </div>
            </div>
            <div v-else class="bound-email-box">
              <check-circle-filled style="color: #52c41a; margin-right: 8px" />
              <span>已绑定：{{ loginUser.userEmail }}</span>
            </div>
          </a-form-item>

          <a-form-item label="个人简介" name="userProfile">
            <a-textarea
              v-model:value="formData.userProfile"
              placeholder="用一段简短的话介绍一下你自己吧，让更多人认识你..."
              :rows="4"
              show-count
              :maxlength="100"
              class="custom-textarea"
            />
          </a-form-item>

          <a-form-item style="margin-top: 40px">
            <a-button
              type="primary"
              html-type="submit"
              :loading="saving"
              block
              size="large"
              class="save-btn"
            >
              保存修改
            </a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>

    <SliderCaptcha
      v-model:visible="captchaVisible"
      ref="captchaRef"
      @verified="onCaptchaVerified"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
  PlusOutlined,
  CameraOutlined,
  MailOutlined,
  CheckCircleFilled,
} from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { updateUserProfile, bindUserEmail, sendEmailCode } from '@/api/userController.ts'
import { uploadAvatarFile } from '@/api/pictureController.ts'
import SliderCaptcha from '@/components/SliderCaptcha.vue'

const loginUserStore = useLoginUserStore()
const loginUser = loginUserStore.loginUser

// --- 🌟 动态身份判定逻辑（与全局同步） ---
const userRoleClass = computed(() => {
  const role = loginUser.userRole
  if (role === 'admin') return 'admin-name'
  if (role === 'svip') return 'svip-name'
  if (role === 'vip') return 'vip-name'
  return ''
})

const currentLevelTitle = computed(() => {
  const role = loginUser.userRole
  if (role === 'admin') return '至尊管理员'
  if (role === 'svip') return '超级会员 SVIP'
  if (role === 'vip') return '正式会员 VIP'
  return '普通用户'
})

const tagColor = computed(() => {
  const role = loginUser.userRole
  if (role === 'admin') return 'purple'
  if (role === 'svip') return 'gold'
  if (role === 'vip') return 'red'
  return 'blue'
})

// --- 📝 表单与上传逻辑 ---
const formData = reactive<API.UserUpdateProfileRequest>({
  id: loginUser.id,
  userName: loginUser.userName,
  userProfile: loginUser.userProfile,
  userGender: loginUser.userGender ?? 0,
  userEmail: loginUser.userEmail || '',
})

const emailForm = reactive({
  email: '',
  bindCode: '',
  emailSent: false,
})

const captchaRef = ref<InstanceType<typeof SliderCaptcha> | null>(null)
const captchaVisible = ref(false)
const previewUrl = ref<string | undefined>(loginUser.userAvatar)
const originFile = ref<File | null>(null)
const saving = ref(false)

// 邮箱验证码倒计时
const bindCountdown = ref(0)
const sendBindCodeDisabled = computed(() => bindCountdown.value > 0)
const bindSendBtnText = computed(() => {
  if (emailForm.emailSent && bindCountdown.value > 0) return `${bindCountdown.value}秒后重发`
  return '发送验证码'
})

let bindCountdownTimer: ReturnType<typeof setInterval> | null = null

const handleSendBindCode = async () => {
  if (!emailForm.email || !/^[a-zA-Z0-9._%+\-]+@qq\.com$/.test(emailForm.email)) {
    message.warning('请先输入正确的QQ邮箱')
    return
  }
  captchaVisible.value = true
}

const onCaptchaVerified = async (captchaId: string, offset: number) => {
  captchaVisible.value = false
  try {
    const res = await sendEmailCode({
      email: emailForm.email,
      captchaId,
      captchaOffset: offset,
      scene: 2,
    })
    if (res.data.code === 0) {
      message.success('验证码已发送，请查收QQ邮箱')
      emailForm.emailSent = true
      bindCountdown.value = 60
      bindCountdownTimer = setInterval(() => {
        bindCountdown.value--
        if (bindCountdown.value <= 0) {
          if (bindCountdownTimer) clearInterval(bindCountdownTimer)
        }
      }, 1000)
    } else {
      message.error(res.data.message || '发送失败')
    }
  } catch {
    message.error('发送失败，请检查网络')
  }
}

const handleBeforeUpload = (file: File) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
  if (!isJpgOrPng) {
    message.error('只能上传 JPG/PNG 格式的图片!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片必须小于 2MB!')
    return false
  }
  originFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  return false
}

const handleSubmit = async () => {
  saving.value = true
  try {
    // 如果用户正在绑定新邮箱，先绑定邮箱
    if (!loginUser.userEmail && emailForm.emailSent && emailForm.bindCode) {
      const bindRes = await bindUserEmail({
        email: emailForm.email,
        code: emailForm.bindCode,
      })
      if (bindRes.data.code !== 0) {
        message.error('邮箱绑定失败：' + (bindRes.data.message || '请重试'))
        saving.value = false
        return
      }
      // 更新用户信息
      loginUserStore.setLoginUser({
        ...loginUser,
        userEmail: emailForm.email,
      })
      message.success('邮箱绑定成功')
    }

    let finalAvatarUrl = loginUser.userAvatar

    if (originFile.value) {
      const uploadRes = await uploadAvatarFile(originFile.value)
      if (uploadRes.data.code === 0 && uploadRes.data.data) {
        finalAvatarUrl = uploadRes.data.data
      } else {
        message.error('头像上传失败：' + uploadRes.data.message)
        saving.value = false
        return
      }
    }

    const updateRes = await updateUserProfile({
      ...formData,
      userEmail: loginUser.userEmail || '',
      userAvatar: finalAvatarUrl,
    })

    if (updateRes.data.code === 0) {
      message.success('个人信息更新成功！')
      loginUserStore.setLoginUser({
        ...loginUser,
        ...formData,
        userAvatar: finalAvatarUrl,
      })
      if (originFile.value && previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
        originFile.value = null
      }
    } else {
      message.error('更新失败：' + updateRes.data.message)
    }
  } catch (error) {
    message.error('保存过程中发生错误')
    console.error(error)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
#userProfilePage {
  max-width: 720px;
  margin: 32px auto;
}

/* 卡片整体美化 */
.profile-card {
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}
.profile-card :deep(.ant-card-body) {
  padding: 0; /* 去除默认内边距，为了顶部无缝渐变 */
}

/* --- 🌟 顶部名片区 --- */
.profile-header {
  background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
  padding: 40px 24px;
  text-align: center;
  border-bottom: 1px solid #f0f0f0;
  position: relative;
}

/* 头像上传美化 */
.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
.avatar-uploader :deep(.ant-upload) {
  width: 104px;
  height: 104px;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  background: #fafafa;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.empty-avatar {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 头像悬浮遮罩 */
.avatar-hover-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
  cursor: pointer;
}
.avatar-uploader :deep(.ant-upload):hover .avatar-hover-mask {
  opacity: 1;
}

/* 名字与身份标签 */
.greeting {
  font-size: 22px;
  color: #333;
  margin-bottom: 8px;
}
.role-tag {
  font-size: 13px;
  padding: 2px 10px;
  border-radius: 12px;
  border: none;
}

/* 炫酷昵称样式 */
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

/* --- 📝 表单区美化 --- */
.form-container {
  padding: 32px 48px 40px;
}

.readonly-input {
  background-color: #f9f9f9 !important;
  border-color: #e8e8e8 !important;
  color: #999 !important;
  border-radius: 8px;
}

.custom-form :deep(.ant-input),
.custom-form :deep(.ant-select-selector) {
  border-radius: 8px;
}

.custom-textarea {
  border-radius: 8px;
  resize: none; /* 防止拉伸破坏布局 */
}

/* 已绑定邮箱的展示框 */
.bound-email-box {
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  padding: 8px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  color: #333;
  font-weight: 500;
}

.email-bind-section {
  width: 100%;
}

.email-bind-actions {
  display: flex;
  align-items: center;
}

/* 按钮微动效 */
.save-btn {
  border-radius: 8px;
  height: 44px;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transition: all 0.3s;
}
.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .form-container {
    padding: 24px;
  }
}
</style>
