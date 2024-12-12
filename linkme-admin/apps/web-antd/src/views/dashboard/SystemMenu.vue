<template>
  <div>
    <!-- 查询和操作 -->
    <div class="custom-toolbar">
      <!-- 查询功能 -->
      <div class="search-filters">
        <!-- 搜索输入框 -->
        <a-input
          v-model:value="searchText"
          placeholder="请输入菜单名称"
          style="width: 200px; margin-right: 16px;"
        />
        <!-- 搜索按钮 -->
        <a-button type="primary" @click="handleSearch">搜索</a-button>
      </div>
      <!-- 操作按钮 -->
      <div class="action-buttons">
        <a-button type="primary" @click="handleAdd">创建菜单</a-button>
      </div>
    </div>

    <!-- 菜单列表表格 -->
    <a-table :columns="columns" :data-source="filteredMenuList" row-key="id" :loading="loading">
      <!-- 操作列 -->
      <template #action="{ record }">
        <a-space>
          <a-button type="link" @click="handleEdit(record)" title="编辑">
            <template #icon><Icon icon="clarity:note-edit-line" style="font-size: 22px" /></template>
          </a-button>
          <a-popconfirm
            title="确定要删除这个菜单吗?"
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

      <!-- 隐藏列 -->
      <template #hidden="{ record }">
        <a-switch
          :checked="!record.hidden"
          @change="(checked: boolean) => handleHiddenChange(record, !checked)"
        />
      </template>
    </a-table>

    <!-- 编辑菜单对话框 -->
    <a-modal
      v-model:visible="isModalVisible"
      :title="modalTitle"
      @ok="handleModalSubmit"
      @cancel="handleModalCancel"
      :okText="'保存'"
      :cancelText="'取消'"
    >
      <a-form :model="formData" layout="vertical">
        <a-form-item label="菜单名称" required>
          <a-input v-model:value="formData.name" placeholder="请输入菜单名称" />
        </a-form-item>
        <a-form-item label="菜单路径" required>
          <a-input v-model:value="formData.path" placeholder="请输入菜单路径" />
        </a-form-item>
        <a-form-item label="父级菜单">
          <a-tree-select
            v-model:value="formData.parent_id"
            :tree-data="menuTreeData"
            placeholder="请选择父级菜单"
            allow-clear
            :field-names="{
              children: 'children',
              label: 'name',
              value: 'id',
            }"
            @change="handleParentChange"
          />
        </a-form-item>
        <a-form-item label="组件">
          <a-input v-model:value="formData.component" placeholder="请输入组件路径" />
        </a-form-item>
        <a-form-item label="图标">
          <a-input v-model:value="formData.icon" placeholder="请输入图标名称" />
        </a-form-item>
        <a-form-item label="排序">
          <a-input-number v-model:value="formData.sort_order" :min="0" />
        </a-form-item>
        <a-form-item label="路由名称">
          <a-input v-model:value="formData.route_name" placeholder="请输入路由名称" />
        </a-form-item>
        <a-form-item label="是否启用">
          <a-switch v-model:value="formData.hidden" :checked="formData.hidden === 0" @change="(checked: boolean) => formData.hidden = checked ? 0 : 1" defaultChecked />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { message } from 'ant-design-vue';
import { listMenusApi, createMenuApi, updateMenuApi, deleteMenuApi } from '#/api/core/system';
import type { SystemApi } from '#/api/core/system';
import { Icon } from '@iconify/vue';

// 表格加载状态
const loading = ref(false);

// 搜索文本
const searchText = ref('');

// 菜单列表数据
const menuList = ref<any[]>([]);

// 过滤后的菜单列表
const filteredMenuList = computed(() => {
  const searchValue = searchText.value.trim().toLowerCase();
  if (!searchValue) return menuList.value;
  
  return menuList.value.filter(menu => 
    menu.name.toLowerCase().includes(searchValue) ||
    menu.path.toLowerCase().includes(searchValue) ||
    menu.component?.toLowerCase().includes(searchValue)
  );
});

// 菜单树形数据
const menuTreeData = ref<any[]>([]);

// 模态框相关
const isModalVisible = ref(false);
const modalTitle = ref('创建菜单');
const formData = reactive<SystemApi.CreateMenuReq>({
  name: '',
  path: '',
  parent_id: 0,
  component: '',
  icon: '',
  sort_order: 0,
  route_name: '',
  hidden: 0,
});

// 获取菜单列表
const fetchMenuList = async () => {
  loading.value = true;
  try {
    const res = await listMenusApi({
      page_number: 1,
      page_size: 100,
      is_tree: true,
    });
    menuList.value = res.list;
    menuTreeData.value = res.list;
  } catch (error) {
    message.error('获取菜单列表失败');
  }
  loading.value = false;
};

// 表格列配置
const columns = [
  {
    title: '菜单名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '路径',
    dataIndex: 'path',
    key: 'path',
  },
  {
    title: '组件',
    dataIndex: 'component',
    key: 'component',
  },
  {
    title: '图标',
    dataIndex: 'icon',
    key: 'icon',
  },
  {
    title: '排序',
    dataIndex: 'sort_order',
    key: 'sort_order',
  },
  {
    title: '显示',
    dataIndex: 'hidden',
    key: 'hidden',
    slots: { customRender: 'hidden' },
  },
  {
    title: '操作',
    key: 'action',
    slots: { customRender: 'action' },
  },
];

// 处理搜索
const handleSearch = () => {
};

// 处理添加
const handleAdd = () => {
  modalTitle.value = '创建菜单';
  Object.assign(formData, {
    name: '',
    path: '',
    parent_id: 0,
    component: '',
    icon: '',
    sort_order: 0,
    route_name: '',
    hidden: 0,
  });
  isModalVisible.value = true;
};

// 处理编辑
const handleEdit = (record: any) => {
  modalTitle.value = '编辑菜单';
  Object.assign(formData, record);
  isModalVisible.value = true;
};

// 处理删除
const handleDelete = async (record: any) => {
  // 检查是否有子菜单
  if (record.children && record.children.length > 0) {
    message.error('当前菜单有子菜单，不允许删除');
    return;
  }

  try {
    await deleteMenuApi(record.id);
    message.success('删除成功');
    fetchMenuList();
  } catch (error) {
    message.error('删除失败');
  }
};

// 处理显示/隐藏切换
const handleHiddenChange = async (record: any, hidden: boolean) => {
  try {
    await updateMenuApi({
      ...record,
      hidden: hidden ? 1 : 0,
    });
    message.success('更新成功');
    fetchMenuList();
  } catch (error) {
    message.error('更新失败');
  }
};

// 处理父级菜单变更
const handleParentChange = (value: number | null) => {
  formData.parent_id = value || 0;
};

// 处理模态框提交
const handleModalSubmit = async () => {
  try {
    if (modalTitle.value === '创建菜单') {
      await createMenuApi({
        ...formData,
        parent_id: Number(formData.parent_id)
      });
    } else {
      await updateMenuApi({
        ...formData,
        parent_id: Number(formData.parent_id)
      } as SystemApi.UpdateMenuReq);
    }
    message.success(`${modalTitle.value}成功`);
    isModalVisible.value = false;
    fetchMenuList();
  } catch (error) {
    message.error(`${modalTitle.value}失败`);
  }
};

// 处理模态框取消
const handleModalCancel = () => {
  isModalVisible.value = false;
};

onMounted(() => {
  fetchMenuList();
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
