import axios from 'axios'
import { message } from 'ant-design-vue'

// 区分开发和生产环境
// 🚨 优雅解法：直接让生产环境走相对路径 '/api'
const DEV_BASE_URL = "http://localhost:8123/api"; // 加上 /api 供本地开发
const PROD_BASE_URL = '/api';

// 创建 Axios 实例
const myAxios = axios.create({
  baseURL: PROD_BASE_URL, // 这样线上环境会自动拼接为 http://162.14.65.216/api/...
  timeout: 10000,
  withCredentials: true,
});

// const myAxios = axios.create({
//   baseURL: 'http://localhost:8123/api',
//   timeout: 60000,
//   withCredentials: true,
// })

// 添加请求拦截器
myAxios.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 全局响应拦截器
myAxios.interceptors.response.use(
  function (response) {
  const { data } = response

  // 未登录
  if (data.code === 40100) {
    // 不是获取用户信息的请求，并且用户目前不是已经在用户登录页面，则跳转到登录页面
    if (
      !response.request.responseURL.includes('user/get/login') &&
      !window.location.pathname.includes('/user/login')
    ) {
      message.warning('请先登录')
      window.location.href = `/user/login?redirect=${window.location.href}`
    }
  }
  return response
},
function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  return Promise.reject(error)
},
)

export default myAxios;
