<template>
  <!-- 用户卡片 -->
  <a-table
      :columns="columns"
      :data-source="data"
      :pagination="pagination"
      @change="handleTableChange"
      class="user-table"
  >
    <template #headerCell="{ column, title }">
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
              :color="getTagColor(tag)"
              class="tag"
          >
            {{ tag.toUpperCase() }}
          </a-tag>
        </span>
      </template>
      <template v-else-if="column.key === 'action'">
        <span class="action-buttons">
          <a>编辑</a>
          <a-divider type="vertical" />
          <a>删除</a>
          <a-divider type="vertical" />
        </span>
      </template>
    </template>
  </a-table>
</template>

<script setup>
import axios from "@/utils/axios.js";
import { onMounted, ref } from "vue";

const columns = [
  {
    title: '用户名',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
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

const data = ref([]);
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
});

const getTagColor = (tag) => {
  if (tag === 'loser') return 'volcano';
  if (tag.length > 5) return 'geekblue';
  return 'green';
};

const fetchData = async (page = 1, size = 10) => {
  try {
    const res_user = await axios.post("/users/list", {
      page: page,
      size: size,
    });
    if (res_user.data.code === 200) {
      const users = res_user.data.data.map(item => ({
        key: item.ID,
        name: item.NickName || '未知',
        phone: item.Phone,
        email: item.Email,
        tags: item.Role ? item.Role.split(',') : [],
      }));
      data.value = users;
      pagination.value.total = res_user.data.data.length;  // 假设 total 在返回的数据中
    } else {
      console.error("Error fetching users:", res_user.data.msg);
    }
  } catch (error) {
    console.error("Request failed:", error);
  }
};

const handleTableChange = (pagination) => {
  fetchData(pagination.current, pagination.pageSize);
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.user-table {
  margin: 20px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
}

.user-table .ant-table-thead > tr > th {
  background-color: #fafafa;
  font-weight: bold;
  text-align: center;
  padding: 12px;
}

.user-table .ant-table-tbody > tr > td {
  text-align: center;
  padding: 12px;
}

.tag {
  margin: 2px;
}

.action-buttons a {
  margin-right: 8px;
  color: #1890ff;
  cursor: pointer;
}

.action-buttons a:hover {
  color: #40a9ff;
}

.ant-divider-vertical {
  background-color: #e8e8e8;
}
</style>