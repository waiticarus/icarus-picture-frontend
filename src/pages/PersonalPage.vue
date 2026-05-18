<template>
  <div class="personal-page">

    <!-- 首页英雄区 -->
    <section id="home" class="hero-section">
      <div class="hero-content">
        <div class="avatar">
          <img src="https://picsum.photos/200/200" alt="个人头像" />
        </div>
        <h1 class="hero-title">你好，我是 <span class="text-primary">XXX</span></h1>
        <p class="hero-subtitle">一名全栈开发者 | 云图库项目创作者 | 热爱技术与创作</p>
        <div class="hero-buttons">
          <a href="#about" class="btn btn-primary">了解更多</a>
          <a href="#project" class="btn btn-outline-primary">查看项目</a>
        </div>
      </div>
    </section>

    <!-- 关于我 + 创作经历 -->
    <section id="about" class="section bg-light">
      <div class="container">
        <div class="section-header">
          <h2>关于我 & 创作经历</h2>
          <p>从学习到实践，我的技术成长之路</p>
        </div>
        <div class="grid-row">
          <div class="card">
            <h3 class="card-title text-primary">个人简介</h3>
            <p class="card-text">
              我是一名专注于全栈开发的学习者，热衷于从零到一打造完整项目。在开发过程中，不断探索新技术、解决实际问题，逐步形成了完整的开发思维。
            </p>
            <p class="card-text">
              热爱编程、设计与创作，坚持用技术实现创意，用代码搭建实用的产品。
            </p>
          </div>
          <div class="card">
            <h3 class="card-title text-primary">创作经历</h3>
            <ul class="list-items">
              <li>
                <i class="fa-solid fa-check text-primary"></i>
                <span>从零开始学习 Java 后端开发，掌握 SpringBoot 核心技术</span>
              </li>
              <li>
                <i class="fa-solid fa-check text-primary"></i>
                <span>学习 Vue3 + 前端开发，独立完成页面设计与交互</span>
              </li>
              <li>
                <i class="fa-solid fa-check text-primary"></i>
                <span>独立开发 <b>云图库项目</b>，实现用户管理、空间管理、图片存储、权限控制</span>
              </li>
              <li>
                <i class="fa-solid fa-check text-primary"></i>
                <span>掌握 Sa-Token、Redis、ShardingSphere 等企业级中间件</span>
              </li>
              <li>
                <i class="fa-solid fa-check text-primary"></i>
                <span>持续学习，不断优化项目，提升开发能力与产品思维</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 技术能力 -->
    <section id="skill" class="section">
      <div class="container">
        <div class="section-header">
          <h2>技术能力栈</h2>
          <p>掌握的技术与工具，支撑我完成全栈开发</p>
        </div>
        <div class="grid-row-3">
          <div class="skill-card">
            <div class="skill-icon text-primary">
              <i class="fa-solid fa-server"></i>
            </div>
            <h3 class="skill-title">后端开发</h3>
            <p class="skill-text">Java、SpringBoot、MyBatis-Plus、MySQL、Redis</p>
          </div>
          <div class="skill-card">
            <div class="skill-icon text-primary">
              <i class="fa-solid fa-code"></i>
            </div>
            <h3 class="skill-title">前端开发</h3>
            <p class="skill-text">Vue3、TypeScript、Ant Design Vue</p>
          </div>
          <div class="skill-card">
            <div class="skill-icon text-primary">
              <i class="fa-solid fa-cogs"></i>
            </div>
            <h3 class="skill-title">框架与中间件</h3>
            <p class="skill-text">Sa-Token、ShardingSphere、Redis</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 项目经历 -->
    <section id="project" class="section bg-light">
      <div class="container">
        <div class="section-header">
          <h2>核心项目</h2>
          <p>我的代表作 - 云图库管理系统</p>
        </div>
        <div class="project-card">
          <div class="project-image">
            <img src="https://picsum.photos/600/400" alt="云图库项目" />
          </div>
          <div class="project-content">
            <h3 class="project-title text-primary">云图库管理系统</h3>
            <p class="project-text">
              一款集
              <b>用户管理、空间管理、成员权限、图片存储、数据分析</b>
              于一体的企业级图片管理平台，支持多用户、多空间、精细化权限控制。
            </p>
            <div class="tags">
              <span class="tag">SpringBoot3</span>
              <span class="tag">Vue3</span>
              <span class="tag">Sa-Token</span>
              <span class="tag">Redis</span>
            </div>
            <h4 class="project-feature-title">项目核心功能：</h4>
            <ul class="list-items">
              <li>✅ 多用户登录 + 空间级权限管理</li>
              <li>✅ 空间创建、解散、成员角色控制（创建者/管理员/编辑者/浏览者）</li>
              <li>✅ 图片上传、预览、管理、数据分析</li>
              <li>✅ 全栈开发，前后端分离，企业级架构</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 联系我 -->
    <section id="contact" class="section contact-section">
      <div class="container text-center">
        <h2>联系我</h2>
        <p class="section-subtitle">期待与你交流学习</p>
        <div class="contact-icons">
          <a href="#" class="icon-link"><i class="fa-brands fa-github"></i></a>
          <a href="#" class="icon-link"><i class="fa-brands fa-weixin"></i></a>
          <a href="#" class="icon-link"><i class="fa-solid fa-envelope"></i></a>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="footer">
      <p>&copy; 2026 XXX - 云图库项目创作者 | 全栈开发</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

// 平滑滚动逻辑
onMounted(() => {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      document.querySelector(this.getAttribute('href'))?.scrollIntoView({
        behavior: 'smooth',
      })
    })
  })
})
</script>

<style scoped>
/* 全局基础样式 */
.personal-page {
  font-family:
    'Inter',
    system-ui,
    -apple-system,
    sans-serif;
  color: #333;
  line-height: 1.6;
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 999;
}
.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.logo {
  font-size: 20px;
  font-weight: bold;
  color: #165dff;
  text-decoration: none;
}
.nav-links {
  display: flex;
  gap: 32px;
}
.nav-links a {
  text-decoration: none;
  color: #333;
  transition: color 0.3s;
}
.nav-links a:hover {
  color: #165dff;
}

/* 通用工具类 */
.text-primary {
  color: #165dff;
}
.bg-light {
  background-color: #f5f7fa;
}
.text-center {
  text-align: center;
}
.mr-2 {
  margin-right: 8px;
}

/* 英雄区 */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding-top: 80px;
}
.hero-content .avatar {
  width: 128px;
  height: 128px;
  margin: 0 auto 24px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(22, 93, 255, 0.2);
}
.hero-content .avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  margin: 0 0 16px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.hero-subtitle {
  font-size: 20px;
  color: #666;
  margin: 0 0 32px;
}
.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}
.btn {
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}
.btn-primary {
  background-color: #165dff;
  color: white;
}
.btn-primary:hover {
  background-color: #0f4cd0;
}
.btn-outline-primary {
  border: 2px solid #165dff;
  color: #165dff;
  background: transparent;
}
.btn-outline-primary:hover {
  background-color: rgba(22, 93, 255, 0.05);
}

/* 通用区块 */
.section {
  padding: 80px 20px;
}
.container {
  max-width: 1200px;
  margin: 0 auto;
}
.section-header {
  text-align: center;
  margin-bottom: 64px;
}
.section-header h2 {
  font-size: 28px;
  margin: 0 0 12px;
}
.section-header p {
  color: #666;
  margin: 0;
}

/* 网格布局 */
.grid-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 40px;
}
.grid-row-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

/* 卡片样式 */
.card {
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(22, 93, 255, 0.1);
}
.card-title {
  font-size: 24px;
  margin: 0 0 16px;
}
.card-text {
  color: #666;
  margin: 0 0 16px;
}
.list-items {
  list-style: none;
  padding: 0;
  margin: 0;
}
.list-items li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  color: #666;
}
.list-items li i {
  margin-top: 4px;
}

/* 技能卡片 */
.skill-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}
.skill-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(22, 93, 255, 0.1);
}
.skill-icon {
  font-size: 32px;
  margin-bottom: 16px;
}
.skill-title {
  font-size: 20px;
  margin: 0 0 12px;
}
.skill-text {
  color: #666;
  margin: 0;
}

/* 项目卡片 */
.project-card {
  background: #f5f7fa;
  padding: 32px;
  border-radius: 16px;
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  align-items: center;
}
@media (max-width: 768px) {
  .project-card {
    grid-template-columns: 1fr;
  }
}
.project-image img {
  width: 100%;
  border-radius: 12px;
}
.project-title {
  font-size: 24px;
  margin: 0 0 16px;
}
.project-text {
  color: #666;
  margin: 0 0 16px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}
.tag {
  padding: 4px 12px;
  background: rgba(22, 93, 255, 0.1);
  color: #165dff;
  border-radius: 20px;
  font-size: 14px;
}
.project-feature-title {
  margin: 16px 0 8px;
}

/* 联系我 */
.contact-section {
  text-align: center;
}
.section-subtitle {
  color: #666;
  margin: 0 0 32px;
}
.contact-icons {
  display: flex;
  justify-content: center;
  gap: 24px;
  font-size: 24px;
}
.icon-link {
  color: #666;
  transition: color 0.3s;
}
.icon-link:hover {
  color: #165dff;
}

/* 页脚 */
.footer {
  background-color: #1d2129;
  color: white;
  padding: 24px;
  text-align: center;
}
.footer p {
  margin: 0;
}
</style>
