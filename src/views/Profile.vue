<template>
  <div>
    <h1>个人资料</h1>

    <!-- 个人资料表单 -->
    <a-form
        :model="profileForm"
        :rules="profileRules"
        ref="profileFormRef"
        layout="vertical"
    >
      <a-form-item name="nickName" label="昵称">
        <a-input v-model:value="profileForm.nickName" />
      </a-form-item>
      <a-form-item name="avatar" label="头像链接">
        <a-input v-model:value="profileForm.avatar" />
      </a-form-item>
      <a-form-item name="about" label="关于">
        <a-textarea v-model:value="profileForm.about" />
      </a-form-item>
      <a-form-item name="birthday" label="生日">
        <a-date-picker v-model:value="profileForm.birthday" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="updateProfile">修改</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import axios from '../utils/axios'
import { message } from 'ant-design-vue'
import { ref, onMounted } from 'vue'

export default {
  name: 'Profile',
  setup() {
    const profileForm = ref({
      nickName: '',
      avatar: '',
      about: '',
      birthday: ''
    })
    const profileFormRef = ref(null)

    const profileRules = {
      nickName: [{ required: true, message: '请输入昵称' }],
      avatar: [{ required: true, message: '请输入头像链接' }],
      about: [{ required: true, message: '请输入关于内容' }],
      birthday: [{ required: true, message: '请选择生日' }]
    }

    const getProfile = async () => {
      try {
        const response = await axios.get('/users/profile')
        const data = response.data.data
        profileForm.value = {
          nickName: data.NickName,
          avatar: data.Avatar,
          about: data.About,
          birthday: data.Birthday
        }
      } catch (error) {
        console.error('获取个人资料失败:', error)
        message.error('获取个人资料失败')
      }
    }

    const updateProfile = async () => {
      try {
        await profileFormRef.value.validate()
        await axios.post('/users/update_profile', profileForm.value)
        message.success('个人资料更新成功')
      } catch (error) {
        console.error('更新个人资料失败:', error)
        message.error('更新个人资料失败')
      }
    }

    onMounted(() => {
      getProfile()
    })

    return {
      profileForm,
      profileFormRef,
      profileRules,
      updateProfile
    }
  }
}
</script>

<style scoped>
/* 自定义样式 */
</style>