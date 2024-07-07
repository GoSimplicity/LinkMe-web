import axios from 'axios'
import { message } from 'ant-design-vue'
import router from '../router'

const instance = axios.create({
    baseURL: 'http://123.56.122.183:9999', // 确认是你的后端服务器地址
    // baseURL: 'http://localhost:9999', // 确认是你的后端服务器地址
    timeout: 10000,
    headers: {
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
    if (response.data.code !== 200) {
        if (response.data.msg) {
            message.error(response.data.msg).then(r => { })
        }
    }
    return response
}, error => {
    handleErrorResponse(error)
    return Promise.reject(error)
})

// 处理错误响应
function handleErrorResponse(error) {
    if (error.response) {
        console.log('Response error:', error.response)
        if (error.response.status === 400 && !error.response.data) {
            message.error('登录已过期，请重新登录').then(r => { })
            localStorage.removeItem('authorization')
            localStorage.removeItem('refresh_token')
            router.push('/login')
        } else {
            message.error(error.response.data.msg || '请求出错').then(r => { })
        }
    } else if (error.request) {
        console.log('Request error:', error.request)
        message.error('请求无响应，请检查网络').then(r => { })
    } else {
        console.log('Error:', error.message)
        message.error(error.message).then(r => { })
    }
}

export default instance
