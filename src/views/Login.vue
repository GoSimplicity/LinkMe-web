<template>
  <a-row type="flex" justify="center" align="middle" class="login-container">
    <a-col :span="8">
      <div class="login-logo">LinkMe Admin</div>
      <a-card class="login-card">
        <a-form
            :model="form"
            @finish="onFinish"
            @finishFailed="onFinishFailed"
        >
          <a-form-item
              name="email"
              rules="[ { required: true, type: 'email', message: '请输入有效的邮箱地址!' } ]"
          >
            <a-input v-model:value="form.email" placeholder="邮箱" />
          </a-form-item>

          <a-form-item
              name="password"
              rules="[ { required: true, message: '请输入密码!' } ]"
          >
            <a-input-password v-model:value="form.password" placeholder="密码" />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" htmlType="submit" block>
              登录
            </a-button>
          </a-form-item>

          <a-form-item>
            <a-space>
              <a-button type="link" @click="showPhoneLogin = true">使用手机号登录</a-button>
              <a-button type="link" @click="showForgotPassword = true">忘记密码</a-button>
              <a-button type="link" @click="showRegister = true">注册</a-button>
            </a-space>
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>

    <!-- 手机验证登录模态框 -->
    <a-modal v-model:visible="showPhoneLogin" title="手机号登录" @ok="onPhoneLogin" @cancel="showPhoneLogin = false">
      <a-form
          :model="phoneForm"
          @finish="onPhoneFinish"
          @finishFailed="onPhoneFinishFailed"
      >
        <a-form-item
            name="phone"
            rules="[ { required: true, pattern: /^[0-9]{11}$/, message: '请输入有效的手机号!' } ]"
        >
          <a-input v-model:value="phoneForm.phone" placeholder="手机号" />
        </a-form-item>

        <a-form-item
            name="code"
            rules="[ { required: true, message: '请输入验证码!' } ]"
        >
          <a-input v-model:value="phoneForm.code" placeholder="验证码" />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" @click="sendCode">
            发送验证码
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 找回密码模态框 -->
    <a-modal v-model:visible="showForgotPassword" title="找回密码" @ok="onForgotPassword" @cancel="showForgotPassword = false">
      <a-form
          :model="forgotPasswordForm"
          @finish="onForgotPasswordFinish"
          @finishFailed="onForgotPasswordFinishFailed"
      >
        <a-form-item
            name="email"
            rules="[ { required: true, type: 'email', message: '请输入有效的邮箱地址!' } ]"
        >
          <a-input v-model:value="forgotPasswordForm.email" placeholder="邮箱" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 注册模态框 -->
    <a-modal v-model:visible="showRegister" title="注册" @ok="onRegister" @cancel="showRegister = false">
      <a-form
          :model="registerForm"
          @finish="onRegisterFinish"
          @finishFailed="onRegisterFinishFailed"
      >
        <a-form-item
            name="email"
            rules="[ { required: true, type: 'email', message: '请输入有效的邮箱地址!' } ]"
        >
          <a-input v-model:value="registerForm.email" placeholder="邮箱" />
        </a-form-item>

        <a-form-item
            name="password"
            rules="[ { required: true, message: '请输入密码!' } ]"
        >
          <a-input-password v-model:value="registerForm.password" placeholder="密码" />
        </a-form-item>

        <a-form-item
            name="confirmPassword"
            rules="[ { required: true, message: '请确认密码!' }, { validator: validateConfirmPassword } ]"
        >
          <a-input-password v-model:value="registerForm.confirmPassword" placeholder="确认密码" />
        </a-form-item>

        <a-form-item>
          <a-button type="primary" htmlType="submit" block>
            注册
          </a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-row>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../utils/axios'
import { message } from "ant-design-vue";

export default {
  name: 'Login',
  setup() {
    const form = ref({
      email: 'admin',
      password: 'admin'
    })
    const phoneForm = ref({
      phone: '',
      code: ''
    })
    const forgotPasswordForm = ref({
      email: ''
    })
    const registerForm = ref({
      email: '',
      password: '',
      confirmPassword: ''
    })
    const showPhoneLogin = ref(false)
    const showForgotPassword = ref(false)
    const showRegister = ref(false)
    const router = useRouter()

    const validateConfirmPassword = (rule, value) => {
      if (value !== registerForm.value.password) {
        return Promise.reject('两次输入的密码不一致!')
      } else {
        return Promise.resolve()
      }
    }

    const onFinish = async (values) => {
      console.log('Form Submitted:', values)
      try {
        const response = await axios.post('/users/login', {
          email: values.email,
          password: values.password
        })
        console.log('Success:', response.data)
        const ref_token = response.headers['x-refresh-token']
        if (ref_token) {
          localStorage.setItem('refresh_token', ref_token)
        }
        const token = response.headers['x-jwt-token']
        if (token) {
          localStorage.setItem('authorization', token)
        }
        await router.push('/')
      } catch (error) {
        message.error('邮箱或密码错误')
        console.error('Failed:', error)
      }
    }

    const onFinishFailed = (errorInfo) => {
      console.log('Failed:', errorInfo)
    }

    const onPhoneFinish = async (values) => {
      console.log('Phone Form Submitted:', values)
      try {
        const response = await axios.post('/users/login_sms', {
          phone: values.phone,
          code: values.code
        })
        console.log('Success:', response.data)
        const ref_token = response.headers['x-refresh-token']
        if (ref_token) {
          localStorage.setItem('refresh_token', ref_token)
        }
        const token = response.headers['x-jwt-token']
        if (token) {
          localStorage.setItem('authorization', token)
        }
        showPhoneLogin.value = false
        await router.push('/')
        message.success('登录成功')
      } catch (error) {
        console.error('Failed:', error)
        message.error('登录失败')
      }
    }

    const onPhoneFinishFailed = (errorInfo) => {
      console.log('Failed:', errorInfo)
    }

    const sendCode = async () => {
      try {
        await axios.post('/users/send_sms', {
          phone: phoneForm.value.phone
        })
        console.log('验证码已发送')
      } catch (error) {
        console.error('发送验证码失败:', error)
      }
    }

    const onForgotPasswordFinish = async (values) => {
      console.log('Forgot Password Form Submitted:', values)
      try {
        await axios.post('/users/send_email', {
          email: values.email
        })
        console.log('密码重置链接已发送')
        showForgotPassword.value = false
      } catch (error) {
        console.error('发送密码重置链接失败:', error)
      }
    }

    const onForgotPasswordFinishFailed = (errorInfo) => {
      console.log('Failed:', errorInfo)
    }

    const onRegisterFinish = async (values) => {
      console.log('Register Form Submitted:', values)
      try {
        await axios.post('/users/signup', {
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword
        })
        console.log('注册成功')
        showRegister.value = false
        message.success('注册成功')
      } catch (error) {
        console.error('注册失败:', error)
        message.error('注册失败')
      }
    }

    const onRegisterFinishFailed = (errorInfo) => {
      console.log('Failed:', errorInfo)
    }

    return {
      form,
      phoneForm,
      forgotPasswordForm,
      registerForm,
      showPhoneLogin,
      showForgotPassword,
      showRegister,
      onFinish,
      onFinishFailed,
      onPhoneFinish,
      onPhoneFinishFailed,
      sendCode,
      onForgotPasswordFinish,
      onForgotPasswordFinishFailed,
      onRegisterFinish,
      onRegisterFinishFailed,
      validateConfirmPassword
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