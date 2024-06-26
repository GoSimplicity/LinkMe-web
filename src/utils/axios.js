import axios from 'axios'
import {message} from 'ant-design-vue'
import router from '../router'

const instance = axios.create({
    baseURL: 'http://123.56.122.183:9999', // 确认是你的后端服务器地址
    timeout: 10000, headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器，添加 token 到请求头
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('authorization')
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
    }
    const refresh_token = localStorage.getItem('refresh_token')
    if (refresh_token) {
        config.headers['X-Refresh-Token'] = refresh_token
    }
    return config
}, error => {
    return Promise.reject(error)
})

// 响应拦截器，处理 token 过期
instance.interceptors.response.use(response => {
    console.log(response)
    if (response.data.code !== 200) {
        if (response.data.msg) {
            message.error(response.data.msg).then(r => {})
        }
    }
    return response
}, error => {
    console.log(error)
    message.error(error.message).then(r => {})
    if (error.response && error.response.status === 400 && !error.response.data) {
        message.error('登录已过期，请重新登录').then(r => {})
        localStorage.removeItem('authorization')
        localStorage.removeItem('refresh_token')
        router.push('/login')
    }
    return Promise.reject(error)
})

export default instance