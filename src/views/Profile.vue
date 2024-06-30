<template>
  <div class="profile-container">
    <h1 class="profile-title">个人资料</h1>

    <!-- 个人资料表单 -->
    <a-form
        :model="profileForm"
        :rules="profileRules"
        ref="profileFormRef"
        layout="vertical"
        class="profile-form"
    >
      <a-form-item name="nickName" label="昵称">
        <a-input v-model:value="profileForm.nickName" :disabled="!isEditing" />
      </a-form-item>
      <a-form-item name="avatar" label="头像链接">
        <a-input v-model:value="profileForm.avatar" :disabled="!isEditing" />
      </a-form-item>
      <a-form-item name="about" label="关于">
        <a-textarea v-model:value="profileForm.about" :disabled="!isEditing" />
      </a-form-item>
      <a-form-item name="birthday" label="生日">
        <a-input
            v-model:value="profileForm.birthday"
            :disabled="!isEditing"
            placeholder="YYYY-MM-DD"
            @change="handleDateChange"
        />
      </a-form-item>
      <a-form-item>
        <a-space>
          <a-button type="primary" @click="toggleEdit" v-if="!isEditing">编辑</a-button>
          <a-button type="primary" @click="updateProfile" v-if="isEditing">保存</a-button>
          <a-button @click="cancelEdit" v-if="isEditing">取消</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import axios from '../utils/axios'
import { message } from 'ant-design-vue'
import { ref, onMounted } from 'vue'
import moment from 'moment'

export default {
  name: 'Profile',
  setup() {
    const profileForm = ref({
      nickName: '',
      avatar: '',
      about: '',
      birthday: ''
    })
    const originalProfile = ref({})
    const profileFormRef = ref(null)
    const isEditing = ref(false)

    const profileRules = {
      nickName: [{ message: '请输入昵称', required: false }],
      avatar: [{ message: '请输入头像链接', required: false }],
      about: [{ message: '请输入关于内容', required: false }],
      birthday: [{ message: '请选择生日', required: false }]
    }

    const getProfile = async () => {
      try {
        const response = await axios.get('/users/profile')
        const data = response.data.data
        console.log('获取的个人资料数据:', data)

        // 处理生日日期格式
        const birthday = data.Birthday ? moment(data.Birthday, 'YYYY-MM-DD').format('YYYY-MM-DD') : ''
        console.log('处理后的生日:', birthday)

        profileForm.value = {
          nickName: data.NickName || '',
          avatar: data.Avatar || '',
          about: data.About || '',
          birthday: birthday
        }
        console.log('profileForm 初始化:', profileForm.value)
        originalProfile.value = {...profileForm.value}
      } catch (error) {
        console.error('获取个人资料失败:', error)
        message.error('获取个人资料失败')
      }
    }

    const updateProfile = async () => {
      try {
        await profileFormRef.value.validate()
        const updatedProfile = {
          nickName: profileForm.value.nickName,
          avatar: profileForm.value.avatar,
          about: profileForm.value.about,
          birthday: profileForm.value.birthday
        }
        console.log('更新的个人资料数据:', updatedProfile)
        await axios.post('/users/update_profile', updatedProfile)
        message.success('个人资料更新成功')
        isEditing.value = false
        originalProfile.value = {...profileForm.value}
      } catch (error) {
        console.error('更新个人资料失败:', error)
        message.error('更新个人资料失败')
      }
    }

    const toggleEdit = () => {
      isEditing.value = true
    }

    const cancelEdit = () => {
      profileForm.value = {...originalProfile.value}
      isEditing.value = false
    }

    const handleDateChange = (event) => {
      let dateValue = event.target.value
      // 使用 moment 解析日期
      const date = moment(dateValue, 'YYYY-MM-DD', true)
      if (date.isValid() && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [year, month, day] = dateValue.split('-').map(Number)
        if (month > 0 && month <= 12 && day > 0 && day <= 31) {
          profileForm.value.birthday = date.format('YYYY-MM-DD')
        } else {
          message.error('日期格式无效，请输入有效的 YYYY-MM-DD 格式的日期')
        }
      } else {
        message.error('日期格式无效，请输入 YYYY-MM-DD 格式的日期')
      }
    }

    onMounted(() => {
      getProfile()
    })

    return {
      profileForm,
      profileFormRef,
      profileRules,
      updateProfile,
      isEditing,
      toggleEdit,
      cancelEdit,
      handleDateChange
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: #f9fafc;
}

.profile-title {
  text-align: center;
  margin-bottom: 20px;
  font-size: 24px;
  color: #333;
  font-weight: bold;
}

.profile-form .ant-form-item-label {
  font-weight: bold;
  color: #444;
}

.profile-form .ant-input,
.profile-form .ant-textarea,
.profile-form .ant-input[disabled],
.profile-form .ant-textarea[disabled] {
  background-color: #f5f5f5;
  border-radius: 4px;
  border: 1px solid #d9d9d9;
  padding: 10px;
}

.profile-form .ant-input:disabled,
.profile-form .ant-textarea:disabled {
  color: rgba(0, 0, 0, 0.65);
}

.profile-form .ant-input[disabled] {
  border-color: #d9d9d9;
}

.profile-form .ant-btn-primary {
  background-color: #4e54c8;
  border-color: #4e54c8;
  border-radius: 4px;
}

.profile-form .ant-btn-primary:hover {
  background-color: #6e70ff;
  border-color: #6e70ff;
}

.profile-form .ant-btn {
  width: 80px;
  height: 40px;
}

.profile-form .ant-space {
  display: flex;
  justify-content: center;
}
</style>