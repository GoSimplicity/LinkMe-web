<template>
  <div class="section-container">
    <a-page-header title="板块管理" />
    <div class="header">
      <a-button type="primary" @click="showAddModal(null)" class="add-btn">新增板块</a-button>
    </div>
    <a-table :columns="columns" :dataSource="plates" :pagination="pagination" @change="handleTableChange" rowKey="ID">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-button type="dashed" @click.stop="showAddModal(record.ID)">编辑</a-button>
          <a-button type="dashed" @click.stop="deletePlate(record.ID)" style="margin-left: 10px;">删除</a-button>
        </template>
      </template>
    </a-table>
    <a-modal v-model:visible="addModalVisible" title="新增/编辑板块" @cancel="handleAddCancel">
      <a-form :model="addPlateData" :rules="rules" ref="formRef" layout="vertical">
        <a-form-item label="名称" name="name">
          <a-input v-model:value="addPlateData.name" />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="addPlateData.description" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="handleAddCancel">取消</a-button>
        <a-button type="primary" @click="handleAddOk">确定</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from '../utils/axios';
import { PageHeader, Table, Button, Modal, Form, Input, message } from 'ant-design-vue';

export default {
  name: 'Section',
  components: {
    'a-page-header': PageHeader,
    'a-table': Table,
    'a-button': Button,
    'a-modal': Modal,
    'a-form': Form,
    'a-form-item': Form.Item,
    'a-input': Input,
    'a-textarea': Input.TextArea
  },
  setup() {
    const plates = ref([]);
    const pagination = ref({ current: 1, pageSize: 10, total: 0 });
    const addModalVisible = ref(false);
    const isEditMode = ref(false);
    const currentPlateId = ref(null);
    const addPlateData = ref({ name: '', description: '' });
    const formRef = ref(null);
    const rules = {
      name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
      description: [{ required: true, message: '请输入描述', trigger: 'blur' }]
    };

    const columns = ref([
      { title: 'ID', dataIndex: 'ID', key: 'ID' },
      { title: '名称', dataIndex: 'Name', key: 'Name' },
      { title: '描述', dataIndex: 'Description', key: 'Description' },
      {
        title: '创建时间',
        dataIndex: 'CreatedAt',
        key: 'CreatedAt',
        render: (text) => new Date(text).toLocaleString()
      },
      {
        title: '更新时间',
        dataIndex: 'UpdatedAt',
        key: 'UpdatedAt',
        render: (text) => new Date(text).toLocaleString()
      },
      { title: '操作', key: 'action' }
    ]);

    const fetchPlates = async (page, size) => {
      try {
        const response = await axios.post('/api/plate/list', { page, size });
        if (response.data.code === 200) {
          plates.value = response.data.data;
          pagination.value.total = response.data.total;
        } else {
          message.error('获取板块列表失败');
        }
      } catch (error) {
        message.error('获取板块列表失败');
        console.error('获取板块列表失败:', error);
      }
    };

    const handleTableChange = (pagination) => {
      fetchPlates(pagination.current, pagination.pageSize);
    };

    const showAddModal = (plateId) => {
      if (plateId) {
        isEditMode.value = true;
        currentPlateId.value = plateId;
        const plate = plates.value.find((p) => p.ID === plateId);
        addPlateData.value = { name: plate.Name, description: plate.Description };
      } else {
        isEditMode.value = false;
        currentPlateId.value = null;
        addPlateData.value = { name: '', description: '' };
      }
      addModalVisible.value = true;
    };

    const deletePlate = async (plateId) => {
      try {
        await axios.delete(`/api/plate/delete/${plateId}`);
        fetchPlates(pagination.value.current, pagination.value.pageSize);
        message.success('删除成功');
      } catch (error) {
        message.error('删除失败');
        console.error('删除失败:', error);
      }
    };

    const handleAddOk = async () => {
      console.log('Submitting:', addPlateData.value);  // 调试信息
      try {
        if (isEditMode.value) {
          await axios.post('/api/plate/update', {
            plateId: currentPlateId.value,
            name: addPlateData.value.name,
            description: addPlateData.value.description
          });
          message.success('更新成功');
        } else {
          await axios.post('/api/plate/create', {
            name: addPlateData.value.name,
            description: addPlateData.value.description
          });
          message.success('新增成功');
        }
        fetchPlates(pagination.value.current, pagination.value.pageSize);
        addModalVisible.value = false;
        addPlateData.value = { name: '', description: '' };
      } catch (error) {
        console.error('Error adding/updating plate:', error);
        message.error('提交失败');
      }
    };

    const handleAddCancel = () => {
      addModalVisible.value = false;
      addPlateData.value = { name: '', description: '' };
    };

    onMounted(() => {
      fetchPlates(pagination.value.current, pagination.value.pageSize);
    });

    return {
      plates,
      columns,
      pagination,
      addModalVisible,
      addPlateData,
      formRef,
      showAddModal,
      deletePlate,
      handleAddOk,
      handleAddCancel,
      handleTableChange,
      rules
    };
  }
};
</script>

<style scoped>
.section-container {
  padding: 24px;
  background: #f0f2f5;
}

.header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.add-btn {
  margin-bottom: 16px;
}

.section-table {
  margin-bottom: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
}
</style>