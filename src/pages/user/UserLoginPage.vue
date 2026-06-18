<template>
  <div id="userLoginPage">
    <h2 class="title">icarus云图库-用户登录</h2>
    <div class="desc">企业级智能协同云图库</div>

    <a-tabs v-model:activeKey="activeTab" centered class="login-tabs">
      <a-tab-pane key="password" tab="密码登录">
        <a-form :model="pwdForm" name="pwdLogin" autocomplete="off" @finish="handlePwdSubmit">
          <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
            <a-input v-model:value="pwdForm.userAccount" placeholder="请输入账号" size="large" />
          </a-form-item>

          <a-form-item name="userPassword" :rules="[
            { required: true, message: '请输入密码' },
            { min: 6, message: '密码长度不能小于6位' },
          ]">
            <a-input-password v-model:value="pwdForm.userPassword" placeholder="请输入密码" size="large" />
          </a-form-item>

          <div class="tips">
            没有账号？
            <RouterLink to="/user/register">立即注册</RouterLink>
          </div>

          <a-form-item>
            <a-button type="primary" html-type="submit" style="width: 100%" size="large" :loading="pwdLoading">
              登录
            </a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>

      <a-tab-pane key="email" tab="QQ邮箱登录">
        <a-form :model="emailForm" name="emailLogin" autocomplete="off" @finish="handleEmailSubmit">
          <a-form-item name="email" :rules="[
            { required: true, message: '请输入QQ邮箱' },
            { pattern: /^[a-zA-Z0-9._%+\-]+@qq\.com$/, message: '仅支持QQ邮箱格式' },
          ]">
            <a-input v-model:value="emailForm.email" placeholder="请输入QQ邮箱（例：123@qq.com）" size="large">
              <template #prefix><mail-outlined style="color: rgba(0,0,0,0.25)" /></template>
            </a-input>
          </a-form-item>

          <a-form-item name="code" :rules="[{ required: true, message: '请输入验证码' }]">
            <a-input v-model:value="emailForm.code" placeholder="请输入6位验证码" size="large" :maxlength="6">
              <template #prefix><safety-outlined style="color: rgba(0,0,0,0.25)" /></template>
              <template #suffix>
                <a-button
                  type="link"
                  size="small"
                  :disabled="sendBtnDisabled"
                  @click="handleSendEmailCode"
                  style="padding: 0"
                >
                  {{ sendBtnText }}
                </a-button>
              </template>
            </a-input>
          </a-form-item>

          <div class="tips">
            没有账号？使用邮箱验证码登录将自动注册
          </div>

          <a-form-item>
            <a-button type="primary" html-type="submit" style="width: 100%" size="large" :loading="emailLoading">
              登录
            </a-button>
          </a-form-item>
        </a-form>
      </a-tab-pane>
    </a-tabs>

    <SliderCaptcha
      v-model:visible="captchaVisible"
      ref="captchaRef"
      @verified="onCaptchaVerified"
    />
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, computed } from 'vue'
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
const sendBtnText = computed(() => countdown.value > 0 ? `${countdown.value}秒后重发` : '发送验证码')

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
  // 调用后端API验证captcha
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
      // 开始60秒倒计时
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
#userLoginPage {
  max-width: 400px;
  margin: 0 auto;
}

.title {
  text-align: center;
  margin-bottom: 8px;
}

.desc {
  text-align: center;
  color: #bbb;
  margin-bottom: 24px;
}

.login-tabs :deep(.ant-tabs-nav) {
  margin-bottom: 24px;
}

.tips {
  text-align: right;
  font-size: 13px;
  color: #bbb;
  margin-bottom: 16px;
}
</style>
