<template>
  <div>
    <!-- 查询和操作 -->
    <div class="custom-toolbar">
      <!-- 查询功能 -->
      <div class="search-filters">
        <!-- 搜索输入框 -->
        <a-input
          v-model:value="searchText" 
          placeholder="请输入用户名称"
          style="width: 200px; margin-right: 16px;"
        />
        <!-- 搜索按钮 -->
        <a-button type="primary" @click="handleSearch">搜索</a-button>
      </div>
    </div>

    <!-- 用户列表表格 -->
    <a-table :columns="columns" :data-source="filteredUserList" row-key="id" :loading="loading">
      <!-- 操作列 -->
      <template #action="{ record }">
        <a-space>
          <a-button type="link" @click="handleAssignRole(record)" title="分配角色">
            <template #icon><Icon icon="clarity:assign-user-line" style="font-size: 22px" /></template>
          </a-button>
          <a-button type="link" @click="handleAssignPermissions(record)" title="分配权限">
            <template #icon><Icon icon="clarity:key-line" style="font-size: 22px" /></template>
          </a-button>
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

    <!-- 角色分配弹窗 -->
    <a-modal
      v-model:visible="isRoleModalVisible"
      title="分配角色"
      @ok="handleRoleModalSubmit"
      @cancel="handleRoleModalCancel"
      :okText="'保存'"
      :cancelText="'取消'"
      width="600px"
    >
      <a-form layout="vertical">
        <a-form-item label="选择角色">
          <a-select
            v-model:value="selectedRoleIds"
            mode="multiple"
            placeholder="请选择角色"
            style="width: 100%"
            :options="roleOptions"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 权限分配弹窗 -->
    <a-modal
      v-model:visible="isPermissionModalVisible"
      title="分配权限"
      @ok="handlePermissionModalSubmit"
      @cancel="handlePermissionModalCancel"
      :okText="'保存'"
      :cancelText="'取消'"
      width="800px"
    >
      <a-form layout="vertical">
        <a-form-item label="菜单权限">
          <a-tree
            v-model:checkedKeys="selectedMenuIds"
            :treeData="menuTreeData"
            checkable
            :defaultExpandAll="false"
            :checkStrictly="false"
            :selectable="false"
            :showLine="true"
            :autoExpandParent="true"
            :defaultCheckedKeys="selectedMenuIds"
            :fieldNames="{
              title: 'name',
              key: 'id',
              children: 'children'
            }"
          />
        </a-form-item>
        <a-form-item label="API权限">
          <a-select
            v-model:value="selectedApiIds"
            mode="multiple"
            style="width: 100%"
            placeholder="请选择API权限"
            :options="apiOptions"
            :defaultValue="selectedApiIds"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import {
  listRolesApi,
  listMenusApi,
  listApisApi,
  assignRoleToUserApi,
  assignRoleToUsersApi,
  getUserRolesApi
} from '#/api/core/system';
import { getAllUsers } from '#/api';
import { Icon } from '@iconify/vue';

interface MenuItem {
  id: number;
  name: string;
  parent_id: number;
  path: string;
  component?: string;
  icon?: string;
  sort_order: number;
  route_name?: string;
  hidden: number;
  children?: MenuItem[];
}

interface ApiItem {
  id: number;
  name: string;
  path: string;
  method: number;
  description?: string;
  version?: string;
  category?: number;
  is_public: number;
}

// 预设的标签颜色
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

// 获取随机颜色
const getRandomColor = () => {
  const index = Math.floor(Math.random() * tagColors.length);
  return tagColors[index];
};

// 表格加载状态
const loading = ref(false);

// 搜索文本
const searchText = ref('');

// 用户列表数据
const userList = ref<any[]>([]);

// 角色列表数据
const roleOptions = ref<{label: string, value: number}[]>([]);

// 菜单和API选项
const menuTreeData = ref<MenuItem[]>([]);
const apiOptions = ref<{label: string, value: number}[]>([]);

// 过滤后的用户列表
const filteredUserList = computed(() => {
  const searchValue = searchText.value.trim().toLowerCase();
  if (!searchValue) return userList.value;

  return userList.value.filter(user =>
    user.username.toLowerCase().includes(searchValue) ||
    user.nickname?.toLowerCase().includes(searchValue)
  );
});

// 表格列配置
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '昵称',
    dataIndex: 'realName',
    key: 'realName',
  },
  {
    title: '角色',
    dataIndex: 'roles',
    key: 'roles',
    slots: { customRender: 'roles' },
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
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' },
  },
];

// 角色分配模态框
const isRoleModalVisible = ref(false);
const selectedRoleIds = ref<number[]>([]);
const currentUserId = ref<number>();

// 权限分配模态框
const isPermissionModalVisible = ref(false);
const selectedMenuIds = ref<number[]>([]);
const selectedApiIds = ref<number[]>([]);

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true;
  try {
    const res = await getAllUsers({
      page: 1,
      size: 100
    });
    userList.value = res;
  } catch (error) {
    message.error('获取用户列表失败');
  }
  loading.value = false;
};

// 获取角色列表
const fetchRoleList = async () => {
  try {
    const res = await listRolesApi({
      page_number: 1,
      page_size: 100
    });
    roleOptions.value = res.list.map((role: any) => ({
      label: role.name,
      value: role.id
    }));
  } catch (error) {
    message.error('获取角色列表失败');
  }
};

// 获取所有菜单和API
const fetchMenusAndApis = async () => {
  try {
    // 获取菜单列表
    const menuRes = await listMenusApi({
      page_number: 1,
      page_size: 1000,
      is_tree: true
    });
    menuTreeData.value = menuRes.list;

    // 获取API列表
    const apiRes = await listApisApi({
      page_number: 1,
      page_size: 1000
    });
    apiOptions.value = apiRes.list.map((api: ApiItem) => ({
      label: `${api.name} (${api.path}) [${getMethodText(api.method)}]`,
      value: api.id
    }));
  } catch (error) {
    message.error('获取权限数据失败');
  }
};

// 获取HTTP方法文本
const getMethodText = (method: number) => {
  switch (method) {
    case 1: return 'GET';
    case 2: return 'POST';
    case 3: return 'PUT';
    case 4: return 'DELETE';
    default: return '未知';
  }
};

// 处理搜索
const handleSearch = () => {
  // 搜索功能已通过 computed 属性 filteredUserList 实现
};

// 处理分配角色
const handleAssignRole = (record: any) => {
  if (!record.id) {
    message.error('用户ID不能为空');
    return;
  }
  currentUserId.value = record.id;
  
  // 获取当前用户的角色ID列表
  const roleIds = roleOptions.value
    .filter(role => record.roles?.includes(role.label))
    .map(role => role.value);
    
  selectedRoleIds.value = roleIds;
  isRoleModalVisible.value = true;
};

// 处理分配权限
const handleAssignPermissions = async (record: any) => {
  if (!record.id) {
    message.error('用户ID不能为空');
    return;
  }
  currentUserId.value = record.id;
  
  try {
    // 获取用户当前的权限
    const permissions = await getUserRolesApi(record.id);
    // 从返回的menus和apis数组中提取ID,增加空值判断
    selectedMenuIds.value = permissions?.menus ? permissions.menus.map((menu: MenuItem) => menu.id) : [];
    selectedApiIds.value = permissions?.apis ? permissions.apis.map((api: ApiItem) => api.id) : [];
    isPermissionModalVisible.value = true;
  } catch (error) {
    message.error('获取用户权限失败');
  }
};

// 处理角色分配提交
const handleRoleModalSubmit = async () => {
  if (!currentUserId.value) {
    message.error('用户ID不能为空');
    return;
  }
  try {
    await assignRoleToUserApi({
      user_id: currentUserId.value,
      role_ids: selectedRoleIds.value
    });
    message.success('角色分配成功');
    isRoleModalVisible.value = false;
    fetchUserList();
  } catch (error) {
    message.error('角色分配失败');
  }
};

// 处理权限分配提交
const handlePermissionModalSubmit = async () => {
  if (!currentUserId.value) {
    message.error('用户ID不能为空');
    return;
  }
  try {
    await assignRoleToUsersApi({
      user_ids: [currentUserId.value],
      role_ids: [],
      menu_ids: selectedMenuIds.value,
      api_ids: selectedApiIds.value
    });
    message.success('权限分配成功');
    isPermissionModalVisible.value = false;
    fetchUserList();
  } catch (error) {
    message.error('权限分配失败');
  }
};

// 处理角色分配取消
const handleRoleModalCancel = () => {
  isRoleModalVisible.value = false;
};

// 处理权限分配取消
const handlePermissionModalCancel = () => {
  isPermissionModalVisible.value = false;
};

onMounted(() => {
  fetchUserList();
  fetchRoleList();
  fetchMenusAndApis();
});
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
