<template>
  <div>
    <!-- 查询和操作 -->
    <div class="custom-toolbar">
      <!-- 查询功能 -->
      <div class="search-filters">
        <!-- 搜索输入框 -->
        <a-input
          v-model:value="searchText" 
          placeholder="请输入角色名称"
          style="width: 200px; margin-right: 16px;"
        />
        <!-- 搜索按钮 -->
        <a-button type="primary" @click="handleSearch">搜索</a-button>
      </div>
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button type="primary" @click="handleAdd">创建角色</a-button>
      </div>
    </div>

    <!-- 角色列表表格 -->
    <a-table :columns="columns" :data-source="filteredRoleList" row-key="id" :loading="loading">
      <!-- 操作列 -->
      <template #action="{ record }">
        <a-space>
          <a-button type="link" @click="handleEdit(record)" title="编辑">
            <template #icon><Icon icon="clarity:note-edit-line" style="font-size: 22px" /></template>
          </a-button>
          <a-popconfirm
            title="确定要删除这个角色吗?"
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

      <!-- 默认角色列 -->
      <template #isDefault="{ record }">
        <a-switch
          :checked="record.is_default === 1"
          @change="(checked: boolean) => handleDefaultChange(record, checked)"
        />
      </template>
    </a-table>

    <!-- 角色表单弹窗 -->
    <a-modal
      v-model:visible="isModalVisible"
      :title="modalTitle"
      @ok="handleModalSubmit"
      @cancel="handleModalCancel"
      :okText="'保存'"
      :cancelText="'取消'"
      width="800px"
    >
      <a-form :model="formData" layout="vertical">
        <a-form-item label="角色名称" required>
          <a-input v-model:value="formData.name" placeholder="请输入角色名称" />
        </a-form-item>
        <a-form-item label="角色描述">
          <a-textarea v-model:value="formData.description" placeholder="请输入角色描述" />
        </a-form-item>
        <a-form-item label="角色类型" required>
          <a-select v-model:value="formData.role_type">
            <a-select-option :value="1">管理员</a-select-option>
            <a-select-option :value="2">普通用户</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="是否默认角色">
          <a-switch 
            :checked="formData.is_default === 1"
            @change="(checked: boolean) => formData.is_default = checked ? 1 : 0" 
          />
        </a-form-item>
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
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import { 
  listRolesApi, 
  createRoleApi, 
  updateRoleApi, 
  deleteRoleApi,
  getRolesApi,
  listMenusApi,
  listApisApi
} from '#/api/core/system';
import type { SystemApi } from '#/api/core/system';
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

// 表格加载状态
const loading = ref(false);

// 搜索文本
const searchText = ref('');

// 角色列表数据
const roleList = ref<any[]>([]);

// 菜单和API选项
const menuTreeData = ref<MenuItem[]>([]);
const apiOptions = ref<{label: string, value: number}[]>([]);

// 过滤后的角色列表
const filteredRoleList = computed(() => {
  const searchValue = searchText.value.trim().toLowerCase();
  if (!searchValue) return roleList.value;
  
  return roleList.value.filter(role => 
    role.name.toLowerCase().includes(searchValue) ||
    role.description?.toLowerCase().includes(searchValue)
  );
});

// 模态框相关
const isModalVisible = ref(false);
const modalTitle = ref('创建角色');
const formData = reactive<Partial<SystemApi.CreateRoleReq>>({
  name: '',
  description: '',
  role_type: 2,
  is_default: 0
});

// 权限相关
const selectedMenuIds = ref<number[]>([]);
const selectedApiIds = ref<number[]>([]);

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

// 表格列配置
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: '角色名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: '角色类型',
    dataIndex: 'role_type',
    key: 'role_type',
    customRender: ({ text }: { text: number }) => text === 1 ? '管理员' : '普通用户'
  },
  {
    title: '默认角色',
    dataIndex: 'is_default',
    key: 'is_default',
    slots: { customRender: 'isDefault' }
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' },
  },
];

// 获取角色列表
const fetchRoleList = async () => {
  loading.value = true;
  try {
    const res = await listRolesApi({
      page_number: 1,
      page_size: 100
    });
    roleList.value = res.list;
  } catch (error) {
    message.error('获取角色列表失败');
  }
  loading.value = false;
};

// 处理搜索
const handleSearch = () => {
  // 搜索功能已通过 computed 属性 filteredRoleList 实现
};

// 处理添加
const handleAdd = () => {
  modalTitle.value = '创建角色';
  Object.assign(formData, {
    name: '',
    description: '',
    role_type: 2,
    is_default: 0
  });
  selectedMenuIds.value = [];
  selectedApiIds.value = [];
  isModalVisible.value = true;
};

// 处理编辑
const handleEdit = async (record: any) => {
  modalTitle.value = '编辑角色';
  try {
    // 获取角色详情包括权限信息
    const roleData = await getRolesApi(record.id);
    const data = roleData;
    
    // 设置基本信息
    Object.assign(formData, {
      id: data.id,
      name: data.name, 
      description: data.description,
      role_type: data.role_type,
      is_default: data.is_default
    });

    // 设置已选菜单和API
    selectedMenuIds.value = data.menus?.map((menu: MenuItem) => menu.id) || [];
    selectedApiIds.value = data.apis?.map((api: ApiItem) => api.id) || [];

    isModalVisible.value = true;
  } catch (error) {
    message.error('获取角色详情失败');
  }
};

// 处理删除
const handleDelete = async (record: any) => {
  if (record.is_default === 1) {
    message.error('默认角色不允许删除');
    return;
  }
  try {
    await deleteRoleApi(record.id);
    message.success('删除成功');
    fetchRoleList();
  } catch (error) {
    message.error('删除失败');
  }
};

// 处理默认角色切换
const handleDefaultChange = async (record: any, checked: boolean) => {
  try {
    await updateRoleApi({
      id: record.id,
      name: record.name,
      description: record.description,
      role_type: record.role_type,
      is_default: checked ? 1 : 0,
      menu_ids: record.menus?.map((menu: MenuItem) => menu.id) || [],
      api_ids: record.apis?.map((api: ApiItem) => api.id) || []
    });
    message.success('更新成功');
    fetchRoleList();
  } catch (error) {
    message.error('更新失败');
  }
};

// 处理模态框提交
const handleModalSubmit = async () => {
  try {
    const roleData = {
      ...formData,
      menu_ids: selectedMenuIds.value,
      api_ids: selectedApiIds.value
    };

    if (modalTitle.value === '创建角色') {
      await createRoleApi(roleData as SystemApi.CreateRoleReq);
    } else {
      await updateRoleApi(roleData as SystemApi.UpdateRoleReq);
    }
    message.success(`${modalTitle.value}成功`);
    isModalVisible.value = false;
    fetchRoleList();
  } catch (error) {
    message.error(`${modalTitle.value}失败`);
  }
};

// 处理模态框取消
const handleModalCancel = () => {
  isModalVisible.value = false;
};

onMounted(() => {
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
