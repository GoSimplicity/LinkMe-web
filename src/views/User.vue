<template>
  <!--  用户卡片-->
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
</template>
<script setup>
import axios from "@/utils/axios.js";
import {onMounted, ref} from "vue";

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