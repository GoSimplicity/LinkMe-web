<template>
  <a-button type="primary" @click="showModal">
    <PlusOutlined />
    <span class="nav-text">添加用户</span>
  </a-button>
  <!-- 间隔 -->
  <a-divider type="horizontal"/>
  <!-- 用户卡片 -->
  <a-table :columns="columns" :data-source="data">

    <template #headerCell="{ column,title}">
      <template v-if="column.key === 'name'">
        {{ title }}
      </template>
    </template>

    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'name'">
        <a>
          {{ record.name }}
        </a>
      </template>
      <template v-else-if="column.key === 'tags'">
        <span>
          <a-tag
              v-for="tag in record.tags"
              :key="tag"
              :color="tag === 'loser' ? 'volcano' : tag.length > 5 ? 'geekblue' : 'green'"
          >
            {{ tag.toUpperCase() }}
          </a-tag>
        </span>
      </template>
      <template v-else-if="column.key === 'action'">
        <span>
          <a>Invite 一 {{ record.name }}</a>
          <a-divider type="vertical"/>
          <a>Delete</a>
          <a-divider type="vertical"/>
          <a class="ant-dropdown-link">
            More actions
            <down-outlined/>
          </a>
        </span>
      </template>
    </template>
  </a-table>
<!-- 添加用户表单弹窗（用户名、手机号、邮箱、角色） -->
  <a-modal
    :visible="addUserModalVisible"
    title="添加用户"
    @cancel="addUserModalVisible = false"
    cancel-text="取消"
    ok-text="确定"
    @ok="handleAddUser"
  >
    <a-form
      :model="addUserForm"
      :rules="addUserRules"
    >
      <a-form-item label="用户名" name="name">
        <a-input v-model:value="addUserForm.name"/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup>
import {PlusOutlined, DownOutlined} from '@ant-design/icons-vue';
import axios from "@/utils/axios.js";
import {onMounted, reactive, ref} from "vue";

const addUserModalVisible = ref(false);

const addUserForm = reactive({
  name: "",
  phone: "",
  email: "",
  role: "",
})

const addUserRules = {
  name: [
    {
      required: true,
      message: '请输入用户名',
      trigger: 'blur',
    },
  ],
  phone: [
    {
      required: true,
      message: '请输入手机号',
      trigger: 'blur',
    },
  ],
  email: [
    {
      required: true,
      message: '请输入邮箱',
      trigger: 'blur',
    },
  ],
  role: [
    {
      required: true,
      message: '请选择角色',
      trigger: 'blur',
    },
  ],
}

const columns = [
  {
    name: 'Name',
    title: '用户名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '手机号',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: '邮箱',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: '角色',
    key: 'tags',
    dataIndex: 'tags',
  },
  {
    title: '操作',
    key: 'action',
  },
];
const data = ref([
  {
    key: '1',
    name: 'John Brown',
    phone: 32,
    Email: 'New York No. 1 Lake Park',
    Role: ['nice', 'developer'],
  }
])

// 展示添加用户表单弹窗
const showModal = () => {
  addUserModalVisible.value = true
};

// 确定提交添加用户表单
const handleAddUser = async () => {
  const res_user = await axios.post("/users/add_user", {
    NickName: "test",
    Phone: "12345678901",
    Email: "test@test.com",
    Password: "123456",
    Role: "admin",
  })
  if (res_user.data.code === 200) {
    add_user_visible.value = false
  }
}

// 初始化用户列表
onMounted(async () => {
  const res_user = await axios.get("/users/get_user")
  if (res_user.data.code === 200) {
    data.value = res_user.data.data.map(item => {
      return {
        key: item.UserID,
        name: item.NickName,
        phone: item.Phone,
        Email: item.Email,
        Role: item.Role,
      }
    })
  }
})
</script>