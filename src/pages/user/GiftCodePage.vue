<template>
  <div id="giftCodePage">
    <div class="magic-container">
      <div class="magic-card">
        <div class="floating-ghost">👻</div>
        <h1 class="magic-title">神秘暗号接头处</h1>
        <p class="magic-desc">“徘徊在代码边缘的旅人，请输入站长留下的上古咒语...”</p>

        <div class="input-box">
          <a-input
            v-model:value="passphrase"
            class="magic-input"
            placeholder="在此吟唱你的口令..."
            size="large"
            @pressEnter="handleSummon"
          />
          <a-button
            type="primary"
            class="summon-btn"
            size="large"
            :loading="loading"
            @click="handleSummon"
          >
            🌟 召唤兑换码
          </a-button>
        </div>
        <p class="hint-text">提示：咒语可能藏在公众号的某篇推文里哦~</p>
      </div>
    </div>

    <a-modal
      v-model:open="isModalVisible"
      :footer="null"
      :closable="false"
      centered
      wrapClassName="magic-modal-wrap"
    >
      <div class="modal-content">
        <div class="success-icon">✨</div>
        <h2 class="modal-title">契约已结成！</h2>
        <p class="modal-sub">属于你的专属 VIP 兑换码已从虚空中降临：</p>

        <div class="code-display">
          {{ generatedCode }}
        </div>

        <a-button type="primary" class="copy-btn" block size="large" @click="copyCode">
          📋 复制咒语并前往兑换
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { giftCode } from '@/api/vipCodeController.ts'
import { useRouter } from 'vue-router'

const router = useRouter()
const passphrase = ref('')
const loading = ref(false)
const isModalVisible = ref(false)
const generatedCode = ref('')

// 召唤（兑换）逻辑
const handleSummon = async () => {
  if (!passphrase.value.trim()) {
    message.warning('魔法需要介质，口令不能为空！')
    return
  }
  loading.value = true
  try {
    // 💡 注意：由于 Java 后端参数名是大写 Passphrase，这里严格保持一致
    const res = await giftCode({ Passphrase: passphrase.value.trim() })
    if (res.data.code === 0 && res.data.data) {
      generatedCode.value = res.data.data
      isModalVisible.value = true // 开启弹窗
    } else {
      message.error('💥 咒语似乎失效了：' + res.data.message)
    }
  } catch (error) {
    message.error('网络空间波动，魔法阵连接失败...')
  } finally {
    loading.value = false
  }
}

// 复制到剪贴板
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    message.success('已将兑换码封印至剪贴板！')
    isModalVisible.value = false
    passphrase.value = ''
    // 复制成功后，贴心地直接带用户去“我的会员”页面兑换
    router.push('/vip/exchange')
  } catch (err) {
    message.error('封印失败，请手动选中复制')
  }
}
</script>

<style scoped>
/* 整个页面的深色星空渐变背景 */
#giftCodePage {
  min-height: calc(100vh - 120px);
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at center, #2b1055 0%, #0c0814 100%);
  border-radius: 16px;
  overflow: hidden;
  padding: 20px;
}

/* 玻璃拟物化发光卡片 */
.magic-card {
  position: relative;
  width: 100%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 40px rgba(138, 43, 226, 0.3);
  border-radius: 24px;
  padding: 50px 40px;
  text-align: center;
  animation: float 4s ease-in-out infinite;
}

/* 上下浮动动画 */
@keyframes float {
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
  100% {
    transform: translateY(0px);
  }
}

/* 搞怪的小幽灵 */
.floating-ghost {
  font-size: 50px;
  margin-bottom: -10px;
  animation: bounce 2s infinite alternate;
}
@keyframes bounce {
  from {
    transform: translateY(0) scale(1);
  }
  to {
    transform: translateY(-10px) scale(1.1);
  }
}

.magic-title {
  color: #fff;
  font-size: 28px;
  font-weight: 900;
  text-shadow: 0 0 10px #e028ff;
  letter-spacing: 2px;
  margin-bottom: 12px;
}

.magic-desc {
  color: #cbb3e6;
  font-size: 15px;
  margin-bottom: 30px;
  font-style: italic;
}

/* 输入框组合 */
.input-box {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.magic-input {
  background: rgba(0, 0, 0, 0.3) !important;
  border: 2px solid #8a2be2 !important;
  color: #fff !important;
  border-radius: 12px;
  text-align: center;
  font-size: 16px;
}
.magic-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}
.magic-input:focus {
  box-shadow: 0 0 15px #8a2be2;
}

.summon-btn {
  background: linear-gradient(90deg, #8a2be2, #ff007f);
  border: none;
  border-radius: 12px;
  font-weight: bold;
  font-size: 16px;
  transition: all 0.3s;
}
.summon-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(255, 0, 127, 0.6);
}

.hint-text {
  margin-top: 24px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

/* --- 弹窗内部样式 --- */
.modal-content {
  text-align: center;
  padding: 20px 10px;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.modal-title {
  color: #333;
  font-weight: 800;
  font-size: 24px;
  margin-bottom: 8px;
}

.modal-sub {
  color: #666;
  margin-bottom: 24px;
}

/* 展示兑换码的精致盒子 */
.code-display {
  background: #f6ffed;
  border: 2px dashed #52c41a;
  border-radius: 12px;
  padding: 16px;
  font-size: 28px;
  font-weight: 900;
  color: #52c41a;
  letter-spacing: 4px;
  margin-bottom: 30px;
  font-family: 'Courier New', Courier, monospace;
}

.copy-btn {
  border-radius: 8px;
  background: #1890ff;
  border: none;
  font-weight: bold;
}
</style>

/* 覆盖 Ant Design 默认弹窗圆角 */
<style>
.magic-modal-wrap .ant-modal-content {
  border-radius: 20px !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2) !important;
}
</style>
