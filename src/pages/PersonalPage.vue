<template>
  <div class="personal-page">
    <!-- ================================================================
         Hero 全屏 — 大背景图 + 暗渐变遮罩 + 头像 + 标题
         ================================================================ -->
    <section class="hero-full">
      <div class="hero-bg" :style="{ backgroundImage: `url(${heroBg})` }"></div>
      <div class="hero-overlay"></div>
      <!-- 装饰：飘浮光斑 -->
      <div class="hero-orb orb-1"></div>
      <div class="hero-orb orb-2"></div>
      <div class="hero-body">
        <div class="hero-avatar">
          <img :src="avatarUrl" alt="林袭" />
        </div>
        <h1 class="hero-name">林袭</h1>
        <div class="hero-role-tags">
          <span class="role-tag">全栈开发者</span>
          <span class="role-tag-dot">·</span>
          <span class="role-tag">云图库创作者</span>
          <span class="role-tag-dot">·</span>
          <span class="role-tag">技术爱好者</span>
        </div>
        <p class="hero-intro">热爱编程 · 热爱生活 · 用代码搭建每一份热爱</p>
        <div class="hero-actions">
          <a href="#about-me" class="hero-btn hero-btn-primary">
            <user-outlined />了解更多
          </a>
          <a href="#contact-me" class="hero-btn hero-btn-outline">
            <mail-outlined />联系我
          </a>
        </div>
        <div class="hero-scroll-hint">
          <arrow-down-outlined />
        </div>
      </div>
    </section>

    <!-- ================================================================
         关于我 — 柔紫渐变底 + 双栏卡片
         ================================================================ -->
    <section id="about-me" class="page-section section-grad-violet">
      <!-- 装饰几何 -->
      <div class="deco-shape deco-circle-lg"></div>
      <div class="deco-shape deco-circle-sm"></div>
      <div class="section-container">
        <div class="section-label">ABOUT ME</div>
        <h2 class="section-title">关于<span class="text-accent">我</span></h2>
        <div class="about-grid">
          <div class="about-card">
            <div class="about-icon-wrap"><idcard-outlined /></div>
            <h3>个人画像</h3>
            <p>Hi，我是林袭，一位正在全栈开发道路上一路狂奔的学习者。从后端 Java 到前端 Vue3，从数据库设计到部署运维，享受从零到一把想法变成产品的过程。</p>
            <p>平时喜欢读小说、追动漫、跑跑步、写代码。相信"持续的微小努力，最终会汇成巨大的力量"。</p>
            <ul class="interest-list">
              <li><read-outlined /><span>看小说</span></li>
              <li><play-circle-outlined /><span>看动漫</span></li>
              <li><thunderbolt-outlined /><span>运动</span></li>
              <li><code-outlined /><span>写代码</span></li>
            </ul>
          </div>
          <div class="about-card">
            <div class="about-icon-wrap"><clock-circle-outlined /></div>
            <h3>创作经历</h3>
            <div class="timeline">
              <div class="tl-item" v-for="(ms, idx) in milestones" :key="idx">
                <div class="tl-dot"></div>
                <div class="tl-content">
                  <span class="tl-date">{{ ms.date }}</span>
                  <span class="tl-text">{{ ms.text }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================
         技术栈 — 深色渐变底 + 彩色玻璃卡片
         ================================================================ -->
    <section id="skills" class="page-section section-grad-dark">
      <div class="deco-shape deco-dots"></div>
      <div class="section-container">
        <div class="section-label section-label-light">TECH STACK</div>
        <h2 class="section-title section-title-light">技术能<span class="text-accent-light">力栈</span></h2>
        <div class="skills-grid">
          <div class="skill-item" v-for="s in skills" :key="s.title">
            <div class="skill-icon-box" :style="{ background: s.gradient }">
              <component :is="s.icon" />
            </div>
            <h4>{{ s.title }}</h4>
            <p>{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================
         项目展示 — 浅蓝底 + 横向展示卡
         ================================================================ -->
    <section id="project" class="page-section section-grad-blue">
      <div class="deco-shape deco-ring"></div>
      <div class="section-container">
        <div class="section-label">PROJECT</div>
        <h2 class="section-title">核心<span class="text-accent">项目</span></h2>
        <div class="project-showcase">
          <div class="proj-img">
            <img src="https://picsum.photos/600/400" alt="云图库" />
          </div>
          <div class="proj-body">
            <h3>icarus 云图库管理系统</h3>
            <p>集用户管理、空间管理、成员权限、图片存储、数据可视化于一体的企业级图库平台。</p>
            <div class="proj-tags">
              <span>SpringBoot 3</span>
              <span>Vue 3</span>
              <span>Sa-Token</span>
              <span>Redis</span>
              <span>ShardingSphere</span>
            </div>
            <ul class="proj-features">
              <li><check-circle-outlined />多用户登录 + 空间级 RBAC 权限</li>
              <li><check-circle-outlined />空间创建/解散/成员角色控制</li>
              <li><check-circle-outlined />图片上传、瀑布流浏览、数据分析</li>
              <li><check-circle-outlined />前后端分离，企业级架构</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ================================================================
         联系我 — 暖色渐变底 + 三卡片
         ================================================================ -->
    <section id="contact-me" class="page-section section-grad-warm">
      <div class="deco-shape deco-arc"></div>
      <div class="section-container">
        <div class="section-label">CONTACT</div>
        <h2 class="section-title">联系<span class="text-accent">我</span></h2>
        <div class="contact-grid">
          <a :href="`mailto:${emailAddr}`" class="contact-card">
            <div class="contact-icon-wrap email-grad"><mail-outlined /></div>
            <span class="contact-label">QQ 邮箱</span>
            <span class="contact-value">{{ emailAddr }}</span>
          </a>
          <a :href="githubUrl" target="_blank" class="contact-card">
            <div class="contact-icon-wrap github-grad"><github-outlined /></div>
            <span class="contact-label">GitHub</span>
            <span class="contact-value">@waiticarus</span>
          </a>
          <a href="#" class="contact-card">
            <div class="contact-icon-wrap wechat-grad"><wechat-outlined /></div>
            <span class="contact-label">微信</span>
            <span class="contact-value">扫码添加好友</span>
          </a>
        </div>
      </div>
    </section>

    <footer class="page-footer">
      <p>© 2026 林袭 · icarus 云图库创作者 · 全栈开发</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import {
  UserOutlined, MailOutlined, ArrowDownOutlined,
  IdcardOutlined, ClockCircleOutlined, ReadOutlined,
  PlayCircleOutlined, ThunderboltOutlined, CodeOutlined,
  CheckCircleOutlined, GithubOutlined, WechatOutlined,
  DesktopOutlined, CloudServerOutlined, ToolOutlined,
} from '@ant-design/icons-vue'

const avatarUrl = 'https://tse4.mm.bing.net/th/id/OIP.aatnTU6vxLr3pJQ1O4IJvgHaHa?w=202&h=202&c=7&r=0&o=7&dpr=1.5&pid=1.7&rm=3'
const heroBg = 'https://th.bing.com/th/id/R.4890d9a47862148ee53238a596d80c95?rik=JHY%2fY2fX14TStg&riu=http%3a%2f%2fimgs.aixifan.com%2flive%2f1483601938603%2f1483601938603.jpg&ehk=WUwJ%2bVPN%2bc%2bx1Yr2BP%2fGliWL6Jxg3Xux4LO5BrFHXfQ%3d&risl=&pid=ImgRaw&r=0'
const emailAddr = '1804979758@qq.com'
const githubUrl = 'https://github.com/waiticarus'

const milestones = [
  { date: '2024 年中', text: '从零开始系统学习 Java 后端开发' },
  { date: '2024 年末', text: '掌握 SpringBoot + MyBatis-Plus 核心技术栈' },
  { date: '2025 年初', text: '学习 Vue3 + TypeScript 前端开发' },
  { date: '2025 年中', text: '独立完成云图库全栈项目设计与实现' },
  { date: '2025 年末', text: '深入 Redis、Sa-Token、ShardingSphere 中间件' },
  { date: '2026 年', text: '持续迭代优化，探索更多技术边界' },
]

const skills = [
  { icon: DesktopOutlined, title: '前端开发', desc: 'Vue3 · TypeScript · Ant Design Vue · Vite', gradient: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { icon: CloudServerOutlined, title: '后端开发', desc: 'Java · SpringBoot · MyBatis-Plus · MySQL', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { icon: ToolOutlined, title: '框架与中间件', desc: 'Redis · Sa-Token · ShardingSphere · Maven', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
]

onMounted(() => {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function (e) {
      e.preventDefault()
      const el = document.querySelector(this.getAttribute('href')!)
      el?.scrollIntoView({ behavior: 'smooth' })
    })
  })
})
</script>

<style scoped>
/* ================================================================
   PersonalPage — 五色分区 · 几何装饰 · 层次分明
   ================================================================ */
.personal-page {
  --accent: #4f8cff;
  --accent-deep: #1677ff;
  --text-main: #1a1a2e;
  --text-muted: #6b7280;
  font-family: 'Inter', 'Noto Sans SC', system-ui, -apple-system, sans-serif;
  color: var(--text-main);
  line-height: 1.7;
}

.text-accent       { color: var(--accent); }
.text-accent-light { color: #93b5ff; }

/* ========================================
   Hero 全屏
   ======================================== */
.hero-full {
  position: relative; min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.hero-bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
  animation: heroBreathe 20s infinite alternate ease-in-out;
}
@keyframes heroBreathe {
  0% { transform: scale(1); } 100% { transform: scale(1.08); }
}
.hero-overlay {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0.65) 100%);
}

/* 飘浮光斑 */
.hero-orb {
  position: absolute; border-radius: 50%; z-index: 1;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
  filter: blur(40px);
  animation: orbDrift 12s infinite alternate ease-in-out;
}
.orb-1 { width: 500px; height: 500px; top: -15%; right: -15%; animation-delay: 0s; }
.orb-2 { width: 350px; height: 350px; bottom: -10%; left: -10%; animation-delay: -6s; }
@keyframes orbDrift {
  0% { transform: translate(0,0); } 100% { transform: translate(40px,-40px); }
}

.hero-body {
  position: relative; z-index: 2; text-align: center;
  color: #fff; padding: 0 24px; max-width: 640px;
}
.hero-avatar {
  width: 120px; height: 120px; margin: 0 auto 24px;
  border-radius: 50%; overflow: hidden;
  border: 3px solid rgba(255,255,255,0.5);
  box-shadow: 0 8px 40px rgba(0,0,0,0.3);
  transition: transform 0.4s ease;
}
.hero-avatar:hover { transform: scale(1.05); }
.hero-avatar img { width: 100%; height: 100%; object-fit: cover; }
.hero-name {
  font-size: 48px; font-weight: 800; margin: 0 0 12px;
  letter-spacing: 2px; text-shadow: 0 2px 16px rgba(0,0,0,0.4);
}
.hero-role-tags {
  display: flex; align-items: center; justify-content: center;
  gap: 8px; margin-bottom: 16px; flex-wrap: wrap;
}
.role-tag      { font-size: 15px; font-weight: 500; opacity: 0.9; }
.role-tag-dot  { opacity: 0.5; font-size: 18px; }
.hero-intro    { font-size: 16px; opacity: 0.8; margin: 0 0 36px; }
.hero-actions  { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 48px; }
.hero-btn {
  padding: 12px 28px; border-radius: 12px; text-decoration: none;
  font-weight: 600; font-size: 15px; transition: all 0.3s ease;
  display: inline-flex; align-items: center; gap: 8px;
}
.hero-btn-primary {
  background: #fff; color: #1a1a2e; box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}
.hero-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.2); }
.hero-btn-outline {
  border: 2px solid rgba(255,255,255,0.6); color: #fff; background: transparent;
}
.hero-btn-outline:hover { background: rgba(255,255,255,0.1); border-color: #fff; }
.hero-scroll-hint { font-size: 22px; opacity: 0.5; animation: bounceDown 2s infinite ease-in-out; }
@keyframes bounceDown {
  0%,100% { transform: translateY(0); } 50% { transform: translateY(10px); }
}

/* ========================================
   通用 Section + 五种底色
   ======================================== */
.page-section          { padding: 100px 20px; position: relative; overflow: hidden; }
.section-grad-violet   { background: linear-gradient(135deg, #f5f0ff 0%, #ede4ff 50%, #f8f4ff 100%); }
.section-grad-dark     { background: linear-gradient(135deg, #13151f 0%, #1d1f2f 50%, #151724 100%); }
.section-grad-blue     { background: linear-gradient(135deg, #eef6ff 0%, #e0efff 50%, #f0f7ff 100%); }
.section-grad-warm     { background: linear-gradient(135deg, #fff7f0 0%, #ffefe0 50%, #fff9f4 100%); }

.section-container     { max-width: 960px; margin: 0 auto; position: relative; z-index: 2; }

.section-label {
  text-align: center; font-size: 12px; font-weight: 700;
  letter-spacing: 3px; color: var(--accent); margin-bottom: 8px; text-transform: uppercase;
}
.section-label-light { color: #93b5ff; }

.section-title {
  text-align: center; font-size: 32px; font-weight: 700; margin: 0 0 48px;
}
.section-title-light { color: #fff; }

/* 纯 CSS 装饰几何，每个 section 各不同 */
.deco-shape { position: absolute; z-index: 1; pointer-events: none; }
.deco-circle-lg {
  width: 400px; height: 400px; border-radius: 50%;
  background: rgba(79,140,255,0.06);
  top: -80px; right: -120px;
}
.deco-circle-sm {
  width: 180px; height: 180px; border-radius: 50%;
  background: rgba(22,119,255,0.06);
  bottom: 40px; left: -60px;
}
.deco-dots {
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 24px 24px;
  top: 40px; right: -60px;
}
.deco-ring {
  width: 320px; height: 320px; border-radius: 50%;
  border: 1px solid rgba(22,119,255,0.08);
  bottom: -80px; right: -100px;
}
.deco-arc {
  width: 500px; height: 200px; border-radius: 50%;
  background: rgba(255,149,0,0.05);
  top: -60px; left: -160px; transform: rotate(-15deg);
}

/* ========================================
   关于我 — 双栏
   ======================================== */
.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 28px;
}
.about-card {
  background: #fff; border-radius: 20px; padding: 32px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.about-card:hover { transform: translateY(-3px); box-shadow: 0 10px 36px rgba(0,0,0,0.07); }
.about-icon-wrap {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 44px; border-radius: 12px;
  background: rgba(22,119,255,0.08); color: var(--accent);
  font-size: 22px; margin-bottom: 16px;
}
.about-card h3    { font-size: 20px; margin: 0 0 12px; }
.about-card p     { color: var(--text-muted); margin: 0 0 10px; font-size: 14px; }
.interest-list    { list-style: none; padding: 0; margin: 16px 0 0; display: flex; flex-wrap: wrap; gap: 16px; }
.interest-list li {
  display: flex; align-items: center; gap: 6px; padding: 6px 14px;
  background: rgba(22,119,255,0.05); border-radius: 20px;
  font-size: 13px; color: var(--accent-deep); font-weight: 500;
}

/* 时间线 */
.timeline   { margin-top: 8px; }
.tl-item    { display: flex; gap: 14px; margin-bottom: 16px; }
.tl-dot {
  flex-shrink: 0; width: 10px; height: 10px; border-radius: 50%;
  background: var(--accent); margin-top: 6px;
  box-shadow: 0 0 0 4px rgba(22,119,255,0.12);
}
.tl-content { display: flex; flex-direction: column; gap: 2px; }
.tl-date    { font-size: 12px; color: var(--accent); font-weight: 600; }
.tl-text    { font-size: 14px; color: var(--text-muted); }

/* ========================================
   技术栈 — 深色底上的白色卡片
   ======================================== */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
}
.skill-item {
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(8px);
  border-radius: 20px; padding: 36px 24px; text-align: center;
  border: 1px solid rgba(255,255,255,0.08);
  transition: transform 0.3s ease, background 0.3s ease;
}
.skill-item:hover {
  transform: translateY(-4px);
  background: rgba(255,255,255,0.1);
}
.skill-item h4 { font-size: 17px; margin: 0 0 8px; color: #fff; }
.skill-item p  { margin: 0; font-size: 13px; color: rgba(255,255,255,0.6); }
.skill-icon-box {
  width: 60px; height: 60px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px; color: #fff; margin: 0 auto 16px;
  box-shadow: 0 6px 16px rgba(0,0,0,0.12);
}

/* ========================================
   项目展示 — 横向卡片
   ======================================== */
.project-showcase {
  background: #fff; border-radius: 24px; overflow: hidden;
  display: grid; grid-template-columns: 1fr 1.2fr;
  box-shadow: 0 8px 32px rgba(0,0,0,0.06);
  border: 1px solid rgba(0,0,0,0.04);
}
@media (max-width: 768px) { .project-showcase { grid-template-columns: 1fr; } }
.proj-img img { display: block; width: 100%; height: 100%; object-fit: cover; }
.proj-body {
  padding: 32px; display: flex; flex-direction: column; justify-content: center;
}
.proj-body h3    { font-size: 22px; margin: 0 0 12px; color: var(--accent); }
.proj-body > p   { color: var(--text-muted); margin: 0 0 16px; font-size: 14px; }
.proj-tags       { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.proj-tags span  {
  padding: 4px 14px; background: rgba(22,119,255,0.07);
  color: var(--accent-deep); border-radius: 20px; font-size: 13px; font-weight: 500;
}
.proj-features   { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.proj-features li { font-size: 14px; color: var(--text-muted); display: flex; align-items: center; gap: 8px; }
.proj-features li :deep(.anticon) { color: var(--accent); font-size: 15px; }

/* ========================================
   联系我 — 三卡片
   ======================================== */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}
.contact-card {
  background: #fff; border-radius: 20px; padding: 36px 20px; text-align: center;
  text-decoration: none; color: inherit;
  box-shadow: 0 4px 24px rgba(0,0,0,0.05);
  border: 1px solid rgba(0,0,0,0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.contact-card:hover { transform: translateY(-4px); box-shadow: 0 10px 36px rgba(0,0,0,0.07); }
.contact-icon-wrap {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; color: #fff; margin: 0 auto 14px;
}
.email-grad  { background: linear-gradient(135deg, #f5576c, #f093fb); }
.github-grad { background: linear-gradient(135deg, #333, #555); }
.wechat-grad { background: linear-gradient(135deg, #09b855, #2bd66e); }
.contact-label { display: block; font-size: 15px; font-weight: 600; margin-bottom: 4px; }
.contact-value { display: block; font-size: 13px; color: var(--text-muted); }

/* ========================================
   页脚
   ======================================== */
.page-footer {
  background: #11131a; color: rgba(255,255,255,0.55);
  text-align: center; padding: 28px; font-size: 13px;
}
.page-footer p { margin: 0; }
</style>
