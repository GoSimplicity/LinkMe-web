<template>
  <div>
    <!-- 查询和操作 -->
    <div class="custom-toolbar">
      <!-- 查询功能 -->
      <div class="search-filters">
        <!-- 搜索输入框 -->
        <a-input
          v-model:value="searchText"
          placeholder="请输入用户名或昵称"
          style="width: 200px; margin-right: 16px;"
        />
        <!-- 搜索按钮 -->
        <a-button type="primary" @click="handleSearch">搜索</a-button>
      </div>
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button type="primary" @click="handleAdd">新增账号</a-button>
      </div>
    </div>
    <!-- 用户列表表格 -->
    <a-table :columns="columns" :data-source="userList" :loading="loading" row-key="id">
      <!-- 操作列 -->
      <template #action="{ record }">
        <a-space>
          <a-button type="link" @click="handleEdit(record)" title="编辑">
            <template #icon><Icon icon="clarity:note-edit-line" style="font-size: 22px" /></template>
          </a-button>
          <a-button type="link" @click="handleChangePassword(record)" title="修改密码">
            <template #icon><Icon icon="mdi:key-outline" style="font-size: 22px" /></template>
          </a-button>
          <a-popconfirm
            title="确定要注销这个用户吗?"
            ok-text="确定"
            cancel-text="取消"
            placement="left"
            @confirm="handleWriteOff(record)"
          >
            <a-button type="link" danger title="注销">
              <template #icon><Icon icon="ant-design:delete-outlined" style="font-size: 22px" /></template>
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
      <!-- 角色列 -->
      <template #roles="{ text }">
        <a-space wrap>
          <template v-if="text && text.length > 0">
            <a-tag v-for="role in text" :key="role" :color="getRandomColor()">
              {{ role }}
            </a-tag>
          </template>
          <a-tag v-else color="default">暂无角色</a-tag>
        </a-space>
      </template>
    </a-table>

    <!-- 新增/编辑用户对话框 -->
    <a-modal
      v-model:visible="isModalVisible"
      :title="modalTitle"
      @ok="handleModalSubmit"
      @cancel="handleModalCancel"
      :okText="'保存'"
      :cancelText="'取消'"
    >
      <a-form :model="formData" layout="vertical">
        <a-form-item label="用户名" required v-if="modalTitle === '新增用户'">
          <a-input v-model:value="formData.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="密码" required v-if="modalTitle === '新增用户'">
          <a-input-password v-model:value="formData.password" placeholder="请输入密码" />
        </a-form-item>
        <a-form-item label="确认密码" required v-if="modalTitle === '新增用户'">
          <a-input-password v-model:value="formData.confirmPassword" placeholder="请再次输入密码" />
        </a-form-item>
        <a-form-item label="真实姓名" required>
          <a-input v-model:value="formData.realName" placeholder="请输入真实姓名" />
        </a-form-item>
        <a-form-item label="手机号码">
          <a-input v-model:value="formData.phone" placeholder="请输入手机号码" />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="formData.email" placeholder="请输入邮箱" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 修改密码对话框 -->
    <a-modal
      v-model:visible="isPasswordModalVisible"
      title="修改密码"
      @ok="handlePasswordSubmit"
      @cancel="handlePasswordCancel"
      :okText="'保存'"
      :cancelText="'取消'"
    >
      <a-form :model="passwordForm" layout="vertical">
        <a-form-item label="原密码" required>
          <a-input-password v-model:value="passwordForm.password" placeholder="请输入原密码" />
        </a-form-item>
        <a-form-item label="新密码" required>
          <a-input-password v-model:value="passwordForm.newPassword" placeholder="请输入新密码" />
        </a-form-item>
        <a-form-item label="确认新密码" required>
          <a-input-password v-model:value="passwordForm.confirmPassword" placeholder="请再次输入新密码" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { getAllUsers, registerApi, changePassword, writeOffUser, updateUserInfo } from '#/api';

// 表格加载状态
const loading = ref(false);

// 搜索文本
const searchText = ref('');

// 用户列表数据
const userList = ref<any[]>([]);

// 表格列配置
const columns = [
  {
    title: '用户ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '真实姓名',
    dataIndex: 'realName',
    key: 'realName',
  },
  {
    title: '手机号码',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '角色',
    dataIndex: 'roles',
    key: 'roles',
    slots: { customRender: 'roles' }
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' },
  },
];

// 模态框相关
const isModalVisible = ref(false);
const modalTitle = ref('新增用户');
const formData = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  realName: '',
  phone: '',
  email: '',
  userId: 0
});

// 密码修改模态框相关
const isPasswordModalVisible = ref(false);
const passwordForm = reactive({
  username: '',
  password: '',
  newPassword: '',
  confirmPassword: ''
});

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true;
  try {
    const res = await getAllUsers({
      page: 1,
      size: 10
    });
    userList.value = res;
  } catch (error) {
    message.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  fetchUserList();
};

// 处理新增账号
const handleAdd = () => {
  modalTitle.value = '新增用户';
  Object.assign(formData, {
    username: '',
    password: '',
    confirmPassword: '',
    realName: '',
    phone: '',
    email: '',
    userId: 0
  });
  isModalVisible.value = true;
};

// 处理编辑用户
const handleEdit = (record: any) => {
  modalTitle.value = '编辑用户';
  Object.assign(formData, {
    realName: record.realName,
    phone: record.phone,
    email: record.email,
    userId: record.id
  });
  isModalVisible.value = true;
};

// 处理修改密码
const handleChangePassword = (record: any) => {
  passwordForm.username = record.username;
  isPasswordModalVisible.value = true;
};

// 处理注销用户
const handleWriteOff = async (record: any) => {
  try {
    await writeOffUser({
      username: record.username,
      password: ''
    });
    message.success('用户注销成功');
    fetchUserList();
  } catch (error) {
    message.error('用户注销失败');
  }
};

// 处理模态框提交
const handleModalSubmit = async () => {
  try {
    if (modalTitle.value === '新增用户') {
      await registerApi(formData);
      message.success('新增用户成功');
    } else {
      const updateData = {
        userId: formData.userId,
        realName: formData.realName,
        phone: formData.phone,
        email: formData.email
      };
      await updateUserInfo(updateData);
      message.success('编辑用户成功');
    }
    isModalVisible.value = false;
    fetchUserList();
  } catch (error) {
    message.error(modalTitle.value === '新增用户' ? '新增用户失败' : '编辑用户失败');
  }
};

// 处理密码修改提交
const handlePasswordSubmit = async () => {
  try {
    await changePassword(passwordForm);
    message.success('密码修改成功');
    isPasswordModalVisible.value = false;
  } catch (error) {
    message.error('密码修改失败');
  }
};

// 处理模态框取消
const handleModalCancel = () => {
  isModalVisible.value = false;
};

// 处理密码修改取消
const handlePasswordCancel = () => {
  isPasswordModalVisible.value = false;
};

// 页面加载时获取数据
onMounted(() => {
  fetchUserList();
});

// 添加随机颜色函数
const tagColors = [
  'pink',
  'red', 
  'orange',
  'green',
  'cyan',
  'blue',
  'purple',
  'geekblue',
  'magenta',
  'volcano',
  'gold',
  'lime'
];

const getRandomColor = () => {
  const index = Math.floor(Math.random() * tagColors.length);
  return tagColors[index];
};
</script>

<style scoped>
.custom-toolbar {
  padding: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-filters {
  display: flex;
  align-items: center;
}
</style>
