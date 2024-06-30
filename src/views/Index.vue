<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider collapsible v-model:collapsed="collapsed" class="sider">
      <div class="logo">
        <h2 class="logo-text">LinkMe Admin</h2>
      </div>
      <a-menu theme="dark" mode="inline" :defaultSelectedKeys="['1']">
        <a-sub-menu key="1" title="信息面板">
          <a-menu-item key="1-1" @click="goToPage('/dashboard')">
            <a-icon type="dashboard" />
            <span>信息面板</span>
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="2" title="用户管理">
          <a-menu-item key="2-1" @click="goToPage('/user')">
            <a-icon type="user" />
            <span>用户管理</span>
          </a-menu-item>
          <a-menu-item key="2-2" @click="goToPage('/user/profile')"> <!-- 添加此行 -->
            <a-icon type="profile" />
            <span>个人资料</span>
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="3" title="帖子管理">
          <a-menu-item key="3-1" @click="goToPage('/post')">
            <a-icon type="file-text" />
            <span>帖子管理</span>
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="4" title="审核管理">
          <a-menu-item key="4-1" @click="goToPage('/review')">
            <a-icon type="audit" />
            <span>审核管理</span>
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="5" title="权限管理">
          <a-menu-item key="5-1" @click="goToPage('/permission')">
            <a-icon type="lock" />
            <span>权限管理</span>
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="6" title="定时任务">
          <a-menu-item key="6-1" @click="goToPage('/scheduled-task')">
            <a-icon type="schedule" />
            <span>定时任务</span>
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="7" title="板块管理">
          <a-menu-item key="7-1" @click="goToPage('/section')">
            <a-icon type="appstore" />
            <span>板块管理</span>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="header">
        <a-icon
            class="trigger"
            type="menu-fold"
            v-if="!collapsed"
            @click="collapsed = !collapsed"
        />
        <a-icon
            class="trigger"
            type="menu-unfold"
            v-if="collapsed"
            @click="collapsed = !collapsed"
        />
        <div class="user-profile">
          <a-dropdown>
            <template #overlay>
              <a-menu>
                <a-menu-item key="1" @click="goToPage('/user/profile')">
                  <a-icon type="user" />
                  <span>我的资料</span>
                </a-menu-item>
                <a-menu-item key="2" @click="goToPage('/user')">
                  <a-icon type="setting" />
                  <span>用户管理</span>
                </a-menu-item>
                <a-menu-item key="3" @click="goToPage('/switch-account')">
                  <a-icon type="swap" />
                  <span>切换账户</span>
                </a-menu-item>
                <a-menu-item key="4" @click="showChangePasswordModal = true">
                  <a-icon type="lock" />
                  <span>修改密码</span>
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="5" @click="logout">
                  <a-icon type="logout" />
                  <span>退出账户</span>
                </a-menu-item>
              </a-menu>
            </template>
            <a class="ant-dropdown-link" @click="e => e.preventDefault()">
              <a-avatar :src="userAvatar" />
              <span class="username">{{ userName }}</span>
              <a-icon type="down" />
            </a>
          </a-dropdown>
        </div>
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>

    <!-- 修改密码模态框 -->
    <a-modal
        v-model:visible="showChangePasswordModal"
        title="修改密码"
        @ok="changePassword"
        @cancel="showChangePasswordModal = false"
    >
      <a-form
          :model="changePasswordForm"
          :rules="changePasswordRules"
          ref="changePasswordFormRef"
      >
        <a-form-item name="email" label="邮箱">
          <a-input v-model:value="changePasswordForm.email" />
        </a-form-item>
        <a-form-item name="password" label="当前密码">
          <a-input-password v-model:value="changePasswordForm.password" />
        </a-form-item>
        <a-form-item name="newPassword" label="新密码">
          <a-input-password v-model:value="changePasswordForm.newPassword" />
        </a-form-item>
        <a-form-item name="confirmPassword" label="确认新密码">
          <a-input-password v-model:value="changePasswordForm.confirmPassword" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-layout>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '../utils/axios'
import { message } from 'ant-design-vue'

export default {
  name: 'Index',
  setup() {
    const collapsed = ref(false)
    const showChangePasswordModal = ref(false)
    const changePasswordForm = ref({
      email: '',
      password: '',
      newPassword: '',
      confirmPassword: ''
    })
    const changePasswordFormRef = ref(null)
    const router = useRouter()
    const userName = ref('zijian wang') // 假设用户名为 Admin，可以根据实际情况修改
    const userAvatar = ref('https://www.example.com/avatar.png') // 用户头像的链接

    const changePasswordRules = {
      email: [{ required: true, message: '请输入邮箱地址', type: 'email' }],
      password: [{ required: true, message: '请输入当前密码' }],
      newPassword: [{ required: true, message: '请输入新密码' }],
      confirmPassword: [
        { required: true, message: '请确认新密码' },
        { validator: (rule, value) => value === changePasswordForm.value.newPassword, message: '两次输入的密码不一致' }
      ]
    }

    const goToPage = (path) => {
      router.push(path)
    }

    const changePassword = async () => {
      try {
        await changePasswordFormRef.value.validate()
        const { email, password, newPassword, confirmPassword } = changePasswordForm.value
        const response = await axios.post('/users/change_password', {
          email,
          password,
          newPassword,
          confirmPassword
        })
        message.success('修改密码成功')
        localStorage.removeItem('authorization')
        router.push('/login')
      } catch (error) {
        if (error.response) {
          message.error('修改密码失败')
        } else {
          message.error('表单验证失败')
        }
      }
    }

    const logout = async () => {
      try {
        await axios.post('/users/logout')
        localStorage.removeItem('authorization')
        message.success('登出成功')
        router.push('/login')
      } catch (error) {
        message.error('登出失败')
        console.error('登出失败:', error)
      }
    }

    const getProfile = async () => {
      try {
        const response = await axios.get('/users/profile')
        const data = response.data.data
        userName.value = data.NickName
        userAvatar.value = data.Avatar
      } catch (error) {
        console.error('获取个人资料失败:', error)
      }
    }

    getProfile()

    return {
      collapsed,
      showChangePasswordModal,
      changePasswordForm,
      changePasswordFormRef,
      changePasswordRules,
      userName,
      userAvatar,
      goToPage,
      changePassword,
      logout
    }
  }
}
</script>

<style scoped>
.sider {
  background: #001529;
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 64px;
  margin: 16px;
  background-color: #001529;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}
.logo-text {
  color: white;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  font-style: italic;
}

.header {
  background: #fff;
  box-shadow: 0 2px 8px #f0f1f2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
}

.trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.content {
  margin: 24px 16px;
  padding: 24px;
  background: #f0f2f5;
  min-height: 280px;
}

a-menu-item {
  margin: 8px 0;
}

a-menu-item:hover {
  background-color: #1d1d1d !important;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  margin-right: 8px;
  font-size: 14px;
}
</style>