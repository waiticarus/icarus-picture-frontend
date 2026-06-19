<template>
  <div id="UserRegisterPage">
    <!-- 共享全屏固定背景 -->
    <div class="dynamic-bg">
      <div class="bg-image" :style="{ backgroundImage: `url(${bgImage})` }"></div>
      <div class="bg-overlay"></div>
    </div>

    <div class="login-card">
      <div class="header">
        <h2 class="title">icarusの图片</h2>
        <div class="desc">精美插画与壁纸收集地</div>
      </div>

      <a-form
        :model="formState"
        name="basic"
        autocomplete="off"
        @finish="handleSubmit"
        layout="vertical"
      >
        <a-form-item
          name="userAccount"
          :rules="[{ required: true, message: '请输入账号' }]"
        >
          <a-input
            v-model:value="formState.userAccount"
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
            v-model:value="formState.userPassword"
            placeholder="请输入密码"
            size="large"
            class="custom-input"
          />
        </a-form-item>

        <a-form-item
          name="checkPassword"
          :rules="[
            { required: true, message: '请再次输入密码' },
            { min: 6, message: '密码长度不能小于6位' },
          ]"
        >
          <a-input-password
            v-model:value="formState.checkPassword"
            placeholder="请再次输入密码"
            size="large"
            class="custom-input"
          />
        </a-form-item>

        <div class="action-row">
          <span class="tips">已有账号？</span>
          <RouterLink to="/user/login" class="login-link">去登录</RouterLink>
        </div>

        <a-form-item>
          <a-button
            type="primary"
            html-type="submit"
            class="submit-btn"
            size="large"
            :loading="loading"
          >
            注 册
          </a-button>
        </a-form-item>
      </a-form>
    </div>

    <SliderCaptcha
      v-model:visible="captchaVisible"
      @verified="onCaptchaVerified"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { userRegister } from '@/api/userController.ts'
import { message } from 'ant-design-vue'
import router from '@/router'
import SliderCaptcha from '@/components/SliderCaptcha.vue'

const loading = ref(false)
const captchaVisible = ref(false)
let capturedCaptchaId = ''
let capturedCaptchaOffset = 0

// 共享登录页同款背景图
const bgImage =
  'https://haowallpaper.com/link//common/file/previewFileImg/15680526683050304'

const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
  captchaId: '',
  captchaOffset: 0,
})

const handleSubmit = async () => {
  if (formState.userPassword !== formState.checkPassword) {
    message.error('两次输入密码不一致')
    return
  }
  // 先弹出滑块验证码
  captchaVisible.value = true
}

const onCaptchaVerified = async (captchaId: string, offset: number) => {
  capturedCaptchaId = captchaId
  capturedCaptchaOffset = offset
  captchaVisible.value = false

  loading.value = true
  try {
    const res = await userRegister({
      ...formState,
      captchaId: capturedCaptchaId,
      captchaOffset: capturedCaptchaOffset,
    })
    if (res.data.code === 0 && res.data.data) {
      message.success('注册成功')
      router.push({
        path: '/user/login',
        replace: true,
      })
    } else {
      message.error('注册失败：' + (res.data.message || '请重试'))
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ---- 根容器 ---- */
#UserRegisterPage {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ---- 背景层（和登录页共用同一套）---- */
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
  animation: breathe 15s infinite alternate ease-in-out;
}

@keyframes breathe {
  0%   { transform: scale(1); }
  100% { transform: scale(1.06); }
}

.bg-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
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

.login-link {
  font-size: 13px;
  color: #1677ff;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.3s;
}

.login-link:hover {
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
</style>
