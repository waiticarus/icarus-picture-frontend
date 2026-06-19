<template>
  <div id="userLoginPage">
    <!-- Full-viewport fixed background with smooth crossfade -->
    <div class="dynamic-bg">
      <div
        v-for="(img, index) in bgImages"
        :key="img"
        class="bg-image"
        :class="{ active: index === currentBgIndex }"
        :style="{ backgroundImage: `url(${img})` }"
      ></div>
      <div class="bg-overlay"></div>
    </div>

    <div class="login-card">
      <div class="header">
        <h2 class="title">icarus云图库</h2>
        <div class="desc">企业级智能协同云图库</div>
      </div>

      <a-tabs v-model:activeKey="activeTab" centered class="login-tabs">
        <a-tab-pane key="password" tab="密码登录">
          <a-form
            :model="pwdForm"
            name="pwdLogin"
            autocomplete="off"
            @finish="handlePwdSubmit"
            layout="vertical"
          >
            <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
              <a-input
                v-model:value="pwdForm.userAccount"
                placeholder="请输入账号"
                size="large"
                class="custom-input"
              />
            </a-form-item>

            <a-form-item
              name="userPassword"
              :rules="[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码长度不能小于6位' },
              ]"
            >
              <a-input-password
                v-model:value="pwdForm.userPassword"
                placeholder="请输入密码"
                size="large"
                class="custom-input"
              />
            </a-form-item>

            <div class="action-row">
              <span class="tips">没有账号？</span>
              <RouterLink to="/user/register" class="register-link">立即注册</RouterLink>
            </div>

            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                class="submit-btn"
                size="large"
                :loading="pwdLoading"
              >
                登 录
              </a-button>
            </a-form-item>
          </a-form>
        </a-tab-pane>

        <a-tab-pane key="email" tab="QQ邮箱登录">
          <a-form
            :model="emailForm"
            name="emailLogin"
            autocomplete="off"
            @finish="handleEmailSubmit"
            layout="vertical"
          >
            <a-form-item
              name="email"
              :rules="[
                { required: true, message: '请输入QQ邮箱' },
                { pattern: /^[a-zA-Z0-9._%+\-]+@qq\.com$/, message: '仅支持QQ邮箱格式' },
              ]"
            >
              <a-input
                v-model:value="emailForm.email"
                placeholder="请输入QQ邮箱（例：123@qq.com）"
                size="large"
                class="custom-input"
              >
                <template #prefix><mail-outlined class="input-icon" /></template>
              </a-input>
            </a-form-item>

            <a-form-item name="code" :rules="[{ required: true, message: '请输入验证码' }]">
              <a-input
                v-model:value="emailForm.code"
                placeholder="请输入6位验证码"
                size="large"
                :maxlength="6"
                class="custom-input"
              >
                <template #prefix><safety-outlined class="input-icon" /></template>
                <template #suffix>
                  <a-button
                    type="link"
                    size="small"
                    :disabled="sendBtnDisabled"
                    @click="handleSendEmailCode"
                    class="send-code-btn"
                  >
                    {{ sendBtnText }}
                  </a-button>
                </template>
              </a-input>
            </a-form-item>

            <div class="action-row">
              <span class="tips">首次验证将自动注册</span>
            </div>

            <a-form-item>
              <a-button
                type="primary"
                html-type="submit"
                class="submit-btn"
                size="large"
                :loading="emailLoading"
              >
                登 录
              </a-button>
            </a-form-item>
          </a-form>
        </a-tab-pane>
      </a-tabs>
    </div>

    <SliderCaptcha
      v-model:visible="captchaVisible"
      ref="captchaRef"
      @verified="onCaptchaVerified"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, computed, onMounted, onUnmounted } from 'vue'
import { userLogin, userEmailLogin, sendEmailCode } from '@/api/userController.ts'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { message } from 'ant-design-vue'
import { MailOutlined, SafetyOutlined } from '@ant-design/icons-vue'
import router from '@/router'
import SliderCaptcha from '@/components/SliderCaptcha.vue'

const loginUserStore = useLoginUserStore()
const captchaRef = ref<InstanceType<typeof SliderCaptcha> | null>(null)

const activeTab = ref('password')
const captchaVisible = ref(false)
const pwdLoading = ref(false)
const emailLoading = ref(false)

// --- 🎇 动态背景图轮播逻辑 开始 ---
// 这里我为你准备了3张高清的唯美风景图测试，之后你可以直接替换这里的 URL 为你的二次元图库链接
const bgImages = [
  'https://haowallpaper.com/link//common/file/previewFileImg/15680526683050304',
  'https://haowallpaper.com/link/common/file/getCroppingImg/15839316368331072',
  'https://p4.wallpaperbetter.com/wallpaper/575/142/518/original-sky-stars-wallpaper-preview.jpg',
]
const currentBgIndex = ref(0)
let bgTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  // 每 5 秒切换一次背景图
  bgTimer = setInterval(() => {
    currentBgIndex.value = (currentBgIndex.value + 1) % bgImages.length
  }, 5000)
})

onUnmounted(() => {
  if (bgTimer) clearInterval(bgTimer)
})
// --- 🎇 动态背景图轮播逻辑 结束 ---

// 记录验证码已通过的信息
let verifiedCaptchaId = ''
let verifiedCaptchaOffset = 0
let pendingCaptchaAction: 'login' | 'sendCode' | null = null

const pwdForm = reactive<API.UserLoginRequest>({
  userAccount: '',
  userPassword: '',
  captchaId: '',
  captchaOffset: 0,
})

const emailForm = reactive<API.UserEmailLoginRequest>({
  email: '',
  code: '',
  captchaId: '',
  captchaOffset: 0,
})

// 验证码发送倒计时
const countdown = ref(0)
const sendBtnDisabled = computed(() => countdown.value > 0)
const sendBtnText = computed(() =>
  countdown.value > 0 ? `${countdown.value}秒后重发` : '发送验证码',
)

let countdownTimer: ReturnType<typeof setInterval> | null = null

// 密码登录 - 先弹出滑块验证码
const handlePwdSubmit = async () => {
  pendingCaptchaAction = 'login'
  captchaVisible.value = true
}

// QQ邮箱登录 - 先弹出滑块验证码
const handleEmailSubmit = async () => {
  pendingCaptchaAction = 'login'
  captchaVisible.value = true
}

// 发送邮箱验证码 - 先弹出滑块验证码
const handleSendEmailCode = async () => {
  if (!emailForm.email || !/^[a-zA-Z0-9._%+\-]+@qq\.com$/.test(emailForm.email)) {
    message.warning('请先输入正确的QQ邮箱')
    return
  }
  pendingCaptchaAction = 'sendCode'
  captchaVisible.value = true
}

// 滑块验证码验证通过后回调
const onCaptchaVerified = async (captchaId: string, offset: number) => {
  verifiedCaptchaId = captchaId
  verifiedCaptchaOffset = offset

  if (pendingCaptchaAction === 'login') {
    captchaVisible.value = false
    await doLogin()
  } else if (pendingCaptchaAction === 'sendCode') {
    captchaVisible.value = false
    await doSendCode()
  }
}

// 实际执行登录
const doLogin = async () => {
  if (activeTab.value === 'password') {
    pwdLoading.value = true
    try {
      const res = await userLogin({
        ...pwdForm,
        captchaId: verifiedCaptchaId,
        captchaOffset: verifiedCaptchaOffset,
      })
      if (res.data.code === 0 && res.data.data) {
        await loginUserStore.fetchLoginUser()
        message.success('登录成功')
        router.push({ path: '/', replace: true })
      } else {
        message.error('登录失败：' + (res.data.message || '请重试'))
      }
    } finally {
      pwdLoading.value = false
    }
  } else {
    emailLoading.value = true
    try {
      const res = await userEmailLogin({
        ...emailForm,
        captchaId: verifiedCaptchaId,
        captchaOffset: verifiedCaptchaOffset,
      })
      if (res.data.code === 0 && res.data.data) {
        await loginUserStore.fetchLoginUser()
        message.success('登录成功')
        router.push({ path: '/', replace: true })
      } else {
        message.error('登录失败：' + (res.data.message || '请重试'))
      }
    } finally {
      emailLoading.value = false
    }
  }
}

// 实际发送邮箱验证码
const doSendCode = async () => {
  try {
    const res = await sendEmailCode({
      email: emailForm.email,
      captchaId: verifiedCaptchaId,
      captchaOffset: verifiedCaptchaOffset,
      scene: 1,
    })
    if (res.data.code === 0) {
      message.success('验证码已发送，请查收QQ邮箱')
      countdown.value = 60
      countdownTimer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          if (countdownTimer) clearInterval(countdownTimer)
        }
      }, 1000)
    } else {
      message.error(res.data.message || '发送失败，请重试')
    }
  } catch {
    message.error('发送失败，请检查网络')
  }
}
</script>

<style scoped>
/* ========================================
   登录页 — 全屏沉浸式毛玻璃布局
   ======================================== */

/* 根容器：填满整个视口，内容垂直居中 */
#userLoginPage {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---- 动态背景层 (fixed, 全屏) ---- */
.dynamic-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
}

.bg-image {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 1.8s ease-in-out;
  animation: breathe 15s infinite alternate ease-in-out;
}

.bg-image.active {
  opacity: 1;
  z-index: 1;
}

/* Ken Burns 呼吸放大动画 */
@keyframes breathe {
  0%   { transform: scale(1); }
  100% { transform: scale(1.06); }
}

/* 半透明压暗遮罩 — 让文字和卡片可读 */
.bg-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: rgba(0, 0, 0, 0.25);
}

/* ---- 居中毛玻璃卡片 ---- */
.login-card {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 420px;
  padding: 48px 40px;
  background: rgba(255, 255, 255, 0.52);
  backdrop-filter: blur(28px) saturate(1.4);
  -webkit-backdrop-filter: blur(28px) saturate(1.4);
  border-radius: 24px;
  box-shadow:
    0 32px 64px -16px rgba(0, 0, 0, 0.18),
    0 1px 3px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.55);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}

.login-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 40px 72px -16px rgba(0, 0, 0, 0.22),
    0 2px 6px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

/* ---- 头部 ---- */
.header {
  text-align: center;
  margin-bottom: 32px;
}

.title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.desc {
  font-size: 14px;
  color: #555;
  font-weight: 400;
}

/* ---- Tabs ---- */
.login-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 28px;
}

.login-tabs :deep(.ant-tabs-tab) {
  font-size: 16px;
  padding: 8px 16px;
  transition: all 0.3s;
}

.login-tabs :deep(.ant-tabs-tab-active) {
  font-weight: 600;
}

/* ---- 输入框 ---- */
.custom-input {
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.custom-input:hover,
.custom-input:focus {
  background: #ffffff;
  border-color: #1677ff;
  box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
}

.input-icon {
  color: #8c8c8c;
  font-size: 16px;
}

/* ---- 发送验证码 ---- */
.send-code-btn {
  padding: 0 8px;
  font-size: 14px;
  font-weight: 500;
}

/* ---- 操作行 ---- */
.action-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 20px;
  margin-top: -8px;
}

.tips {
  font-size: 13px;
  color: #666;
}

.register-link {
  font-size: 13px;
  color: #1677ff;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.3s;
}

.register-link:hover {
  color: #4096ff;
}

/* ---- 提交按钮 ---- */
.submit-btn {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  background: linear-gradient(135deg, #1677ff 0%, #3b82f6 100%);
  box-shadow: 0 4px 12px rgba(22, 119, 255, 0.25);
  transition: all 0.3s ease;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #4096ff 0%, #60a5fa 100%);
  box-shadow: 0 6px 16px rgba(22, 119, 255, 0.35);
  transform: translateY(-1px);
}

.submit-btn:active {
  transform: translateY(1px);
}
</style>
