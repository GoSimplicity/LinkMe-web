<template>
  <a-row type="flex" justify="center" align="middle" class="login-container">
    <a-col :span="8">
      <div class="login-logo">LinkMe</div>
      <a-card class="login-card">
        <a-form
            :model="form"
            @finish="onFinish"
            @finishFailed="onFinishFailed"
        >
          <a-form-item
              name="email"
              rules="[ { required: true, type: 'email', message: 'Please input a valid email!' } ]"
          >
            <a-input v-model:value="form.email" placeholder="Email" />
          </a-form-item>

          <a-form-item
              name="password"
              rules="[ { required: true, message: 'Please input your password!' } ]"
          >
            <a-input-password v-model:value="form.password" placeholder="Password" />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" htmlType="submit" block>
              Log in
            </a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>
  </a-row>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../utils/axios'

export default {
  name: 'Login',
  setup() {
    const form = ref({
      email: '',
      password: ''
    })
    const router = useRouter()
    const onFinish = async (values) => {
      console.log('Form Submitted:', values)
      try {
        const response = await axios.post('/users/login', {
          email: values.email,
          password: values.password
        })
        console.log('Success:', response.data)
        const token = response.headers['x-jwt-token']
        if (token) {
          // 将 token 保存到 localStorage
          localStorage.setItem('authorization', token)
        }
        await router.push('/')
      } catch (error) {
        console.error('Failed:', error)
        // 在这里处理登录失败逻辑，例如显示错误消息
      }
    }

    const onFinishFailed = (errorInfo) => {
      console.log('Failed:', errorInfo)
    }

    return {
      form,
      onFinish,
      onFinishFailed
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  background: linear-gradient(to right, #4e54c8, #8f94fb);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-logo {
  text-align: center;
  font-size: 36px;
  font-weight: bold;
  color: white;
  margin-bottom: 20px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.login-card {
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

a-button {
  background-color: #4e54c8;
  border-color: #4e54c8;
}

a-button:hover {
  background-color: #6e70ff;
  border-color: #6e70ff;
}

a-card {
  padding-top: 20px;
}

a-form-item {
  margin-bottom: 16px;
}

a-input,
a-input-password {
  border-radius: 4px;
}
</style>