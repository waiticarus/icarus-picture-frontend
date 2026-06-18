<template>
  <Teleport to="body">
    <div v-if="visible" class="captcha-overlay" @click.self="handleCancel">
      <div class="captcha-card">
        <div class="captcha-header">
          <span class="captcha-title">请完成安全验证</span>
          <a-button type="link" size="small" @click="handleRefresh" :loading="loading">刷新</a-button>
        </div>

        <div class="captcha-canvas-wrapper">
          <div class="captcha-canvas" ref="canvasRef">
            <img
              v-if="bgImage"
              :src="bgImage"
              class="bg-image"
              alt="background"
              draggable="false"
            />
            <div
              class="puzzle-piece"
              :style="puzzleStyle"
            >
              <img
                v-if="sliderImage"
                :src="sliderImage"
                alt="puzzle"
                draggable="false"
              />
            </div>
          </div>
        </div>

        <div class="slider-track" ref="trackRef">
          <div class="slider-track-bg">
            <span class="track-hint" v-if="status === 'idle'">向右拖动滑块完成拼图</span>
            <span class="track-hint success" v-if="status === 'success'">验证通过</span>
            <span class="track-hint fail" v-if="status === 'fail'">验证失败，请重试</span>
          </div>
          <div class="slider-fill" :style="{ width: dragOffset + 'px' }" v-if="status === 'idle'"></div>
          <div
            class="slider-thumb"
            :class="{ dragging: isDragging, success: status === 'success', fail: status === 'fail' }"
            :style="{ left: sliderLeft + 'px' }"
            @mousedown="startDrag"
            @touchstart.prevent="startDrag"
          >
            <span v-if="status === 'idle'" class="thumb-icon">→</span>
            <span v-if="status === 'success'" class="thumb-icon">✓</span>
            <span v-if="status === 'fail'" class="thumb-icon">✕</span>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { getCaptcha } from '@/api/userController'
import { message } from 'ant-design-vue'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', v: boolean): void
  (e: 'verified', captchaId: string, offset: number): void
}>()

const bgImage = ref('')
const sliderImage = ref('')
const captchaId = ref('')
const sliderY = ref(0)
const sliderWidth = ref(50)
const sliderHeight = ref(50)
const loading = ref(false)
const isDragging = ref(false)
const dragOffset = ref(0)
const sliderLeft = ref(0)
const status = ref<'idle' | 'success' | 'fail'>('idle')
const trackRef = ref<HTMLElement | null>(null)

const maxOffset = computed(() => {
  return (trackRef.value?.clientWidth ?? 280) - 48
})

const puzzleStyle = computed(() => ({
  top: sliderY.value + 'px',
  left: (dragOffset.value > 0 ? dragOffset.value : 0) + 'px',
}))

const fetchCaptcha = async () => {
  loading.value = true
  status.value = 'idle'
  dragOffset.value = 0
  sliderLeft.value = 0
  try {
    const res = await getCaptcha()
    if (res.data.code === 0 && res.data.data) {
      const data = res.data.data
      bgImage.value = data.backgroundImage ?? ''
      sliderImage.value = data.sliderImage ?? ''
      captchaId.value = data.captchaId ?? ''
      sliderY.value = data.sliderY ?? 0
      sliderWidth.value = data.sliderWidth ?? 50
      sliderHeight.value = data.sliderHeight ?? 50
    } else {
      message.error('获取验证码失败')
    }
  } catch {
    message.error('获取验证码失败，请检查网络')
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  fetchCaptcha()
}

const handleCancel = () => {
  emit('update:visible', false)
}

let startX = 0

const startDrag = (e: MouseEvent | TouchEvent) => {
  if (status.value !== 'idle') return
  isDragging.value = true
  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
  startX = clientX - dragOffset.value

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('touchmove', onDrag, { passive: false })
  document.addEventListener('touchend', endDrag)
}

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging.value) return
  e.preventDefault()
  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX
  const offset = Math.max(0, Math.min(clientX - startX, maxOffset.value))
  dragOffset.value = offset
  sliderLeft.value = offset
}

const endDrag = async () => {
  if (!isDragging.value) return
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', endDrag)

  if (dragOffset.value > 0) {
    const offset = Math.round(dragOffset.value)
    // 即时发送验证请求给父组件
    emit('verified', captchaId.value, offset)
  }
}

const verifySuccess = () => {
  status.value = 'success'
}

const verifyFail = () => {
  status.value = 'fail'
  setTimeout(() => {
    fetchCaptcha()
  }, 1000)
}

watch(() => props.visible, (val) => {
  if (val) {
    nextTick(() => fetchCaptcha())
  }
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('touchmove', onDrag)
  document.removeEventListener('touchend', endDrag)
})

defineExpose({ verifySuccess, verifyFail })
</script>

<style scoped>
.captcha-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.captcha-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 360px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.captcha-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.captcha-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.captcha-canvas-wrapper {
  margin-bottom: 16px;
}

.captcha-canvas {
  position: relative;
  width: 300px;
  height: 200px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 8px;
  user-select: none;
}

.bg-image {
  width: 100%;
  height: 100%;
  object-fit: fill;
  pointer-events: none;
}

.puzzle-piece {
  position: absolute;
  pointer-events: none;
  z-index: 2;
  box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.3);
}

.puzzle-piece img {
  display: block;
  pointer-events: none;
}

.slider-track {
  position: relative;
  height: 40px;
  background: #f5f5f5;
  border-radius: 20px;
  overflow: hidden;
  margin: 0 auto;
}

.slider-track-bg {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.track-hint {
  font-size: 13px;
  color: #999;
  user-select: none;
}

.track-hint.success {
  color: #52c41a;
}

.track-hint.fail {
  color: #ff4d4f;
}

.slider-fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: #e6f7ff;
  border-radius: 20px 0 0 20px;
  transition: none;
}

.slider-thumb {
  position: absolute;
  top: 0;
  width: 48px;
  height: 40px;
  background: #fff;
  border: 2px solid #1890ff;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 3;
  transition: background 0.3s;
}

.slider-thumb.dragging {
  background: #e6f7ff;
}

.slider-thumb.success {
  background: #f6ffed;
  border-color: #52c41a;
}

.slider-thumb.fail {
  background: #fff2f0;
  border-color: #ff4d4f;
}

.thumb-icon {
  font-size: 16px;
  font-weight: bold;
  color: #1890ff;
  user-select: none;
}

.slider-thumb.success .thumb-icon {
  color: #52c41a;
}

.slider-thumb.fail .thumb-icon {
  color: #ff4d4f;
}
</style>
