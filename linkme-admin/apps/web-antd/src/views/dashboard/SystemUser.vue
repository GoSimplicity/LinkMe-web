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
    <a-table :columns="columns" :data-source="filteredData" row-key="userId">
      <!-- 角色列表列 -->
      <template #roles="{ record }">
        <a-tag v-for="role in record.roles" :key="role">{{ role }}</a-tag>
      </template>

      <!-- 操作列 -->
      <template #action="{ record }">
        <a-space>
          <a-button type="link" @click="handleEdit(record)" title="编辑">
            <template #icon><Icon icon="clarity:note-edit-line" style="font-size: 22px" /></template>
          </a-button>
          <a-popconfirm
            title="确定要删除这个用户吗?"
            ok-text="确定"
            cancel-text="取消"
            placement="left"
            @confirm="handleDelete(record)"
          >
            <a-button type="link" danger title="删除">
              <template #icon><Icon icon="ant-design:delete-outlined" style="font-size: 22px" /></template>
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
    </a-table>

    <!-- 编辑用户对话框 -->
    <a-modal
      v-model:visible="isModalVisible"
      :title="modalTitle"
      @ok="handleModalSubmit"
      @cancel="handleModalCancel"
      :okText="'保存'"
      :cancelText="'取消'"
    >
      <a-form :model="formData" layout="vertical">
        <a-form-item label="用户名" required>
          <a-input v-model:value="formData.username" placeholder="请输入用户名" />
        </a-form-item>
        <a-form-item label="昵称" required>
          <a-input v-model:value="formData.nickname" placeholder="请输入昵称" />
        </a-form-item>
        <a-form-item label="备注">
          <a-input v-model:value="formData.remark" placeholder="请输入备注" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { Icon } from '@iconify/vue';

// 定义数据类型
interface User {
  userId: number;
  username: string;
  nickname: string;
  createTime: string;
  roles: string[];
  remark: string;
}

// 示例数据
const data = reactive<User[]>([
  {
    userId: 1,
    username: 'admin',
    nickname: '超级管理员',
    createTime: '2023-10-01 10:00:00',
    roles: ['管理员', '编辑'],
    remark: '系统超级管理员',
  },
  {
    userId: 2,
    username: 'user1',
    nickname: '普通用户1',
    createTime: '2023-10-05 14:30:00',
    roles: ['用户'],
    remark: '普通用户',
  },
]);

// 搜索文本
const searchText = ref('');
// 过滤后的数据
const filteredData = ref<User[]>(data);

// 模态框相关
const isModalVisible = ref(false);
const modalTitle = ref('新增用户');
const formData = reactive({
  username: '',
  nickname: '',
  remark: ''
});

// 处理搜索
const handleSearch = () => {
  const searchValue = searchText.value.trim().toLowerCase();
  filteredData.value = data.filter(item => {
    return (
      item.username.toLowerCase().includes(searchValue) ||
      item.nickname.toLowerCase().includes(searchValue)
    );
  });
};

// 表格列配置
const columns = [
  {
    title: '用户ID',
    dataIndex: 'userId',
    key: 'userId',
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '昵称',
    dataIndex: 'nickname',
    key: 'nickname',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '角色列表',
    dataIndex: 'roles',
    key: 'roles',
    slots: { customRender: 'roles' },
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' },
  },
];

// 处理新增账号
const handleAdd = () => {
  modalTitle.value = '新增用户';
  Object.assign(formData, {
    username: '',
    nickname: '',
    remark: ''
  });
  isModalVisible.value = true;
};

// 处理编辑用户
const handleEdit = (record: User) => {
  modalTitle.value = '编辑用户';
  Object.assign(formData, {
    username: record.username,
    nickname: record.nickname,
    remark: record.remark
  });
  isModalVisible.value = true;
};

// 处理删除用户
const handleDelete = (record: User) => {
  const index = data.findIndex(item => item.userId === record.userId);
  if (index !== -1) {
    data.splice(index, 1);
    handleSearch();
    message.success(`用户 "${record.username}" 已删除`);
  }
};

// 处理模态框提交
const handleModalSubmit = () => {
  if (modalTitle.value === '新增用户') {
    data.push({
      userId: Date.now(),
      username: formData.username,
      nickname: formData.nickname,
      createTime: new Date().toLocaleString(),
      roles: ['用户'],
      remark: formData.remark
    });
    message.success('新增用户成功');
  } else {
    const user = data.find(item => item.username === formData.username);
    if (user) {
      user.nickname = formData.nickname;
      user.remark = formData.remark;
      message.success('编辑用户成功');
    }
  }
  isModalVisible.value = false;
  handleSearch();
};

// 处理模态框取消
const handleModalCancel = () => {
  isModalVisible.value = false;
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
