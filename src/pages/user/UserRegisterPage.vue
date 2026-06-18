<template>
  <div id="UserRegisterPage">
    <h2 class="title">icarus云图库-用户注册</h2>
    <div class="desc">企业级智能协同云图库</div>
    <a-form :model="formState" name="basic" autocomplete="off" @finish="handleSubmit">
      <a-form-item
        name="userAccount"
        :rules="[{ required: true, message: '请输入账号' }]"
      >
        <a-input v-model:value="formState.userAccount" placeholder="请输入账号" size="large" />
      </a-form-item>

      <a-form-item
        name="userPassword"
        :rules="[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码长度不能小于6位' },
        ]"
      >
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" size="large" />
      </a-form-item>

      <a-form-item
        name="checkPassword"
        :rules="[
          { required: true, message: '请再次输入密码' },
          { min: 6, message: '密码长度不能小于6位' },
        ]"
      >
        <a-input-password v-model:value="formState.checkPassword" placeholder="请再次输入密码" size="large" />
      </a-form-item>

      <div class="tips">
        已有账号？
        <RouterLink to="/user/login">去登录</RouterLink>
      </div>

      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" size="large" :loading="loading">
          注册
        </a-button>
      </a-form-item>
    </a-form>

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
#UserRegisterPage {
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

.tips {
  text-align: right;
  font-size: 13px;
  color: #bbb;
  margin-bottom: 16px;
}
</style>
