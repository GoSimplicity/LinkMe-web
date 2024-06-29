import axios from 'axios'

const instance = axios.create({
    baseURL: 'http://localhost:9999',
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
    return config
}, error => {
    return Promise.reject(error)
})

export default instance