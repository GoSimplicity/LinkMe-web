<template>
    <div>
      <!-- 查询和操作 -->
      <div class="custom-toolbar">
        <!-- 查询功能 -->
        <div class="search-filters">
          <!-- 搜索输入框 -->
          <a-input
            v-model:value="searchText"
            placeholder="请输入帖子标题"
            style="width: 200px; margin-right: 16px;"
          />
          <!-- 搜索按钮 -->
          <a-button type="primary" @click="handleSearch">
            <template #icon><SearchOutlined /></template>
            搜索
          </a-button>
          <a-button @click="handleReset">
            <template #icon><ReloadOutlined /></template>
            重置
          </a-button>
        </div>
        <!-- 操作按钮 -->
        <div class="action-buttons">
          <a-button type="primary" @click="handleAdd">新增帖子</a-button>
        </div>
      </div>
      <!-- 帖子列表表格 -->
      <a-table :columns="columns" :data-source="postList" :loading="loading" row-key="id" :pagination="false">
        <!-- 操作列 -->
        <template #action="{ record }">
          <a-space>
            <a-button type="link" @click="handleViewDetail(record)" title="查看详情">
              <template #icon><Icon icon="ant-design:eye-outlined" style="font-size: 22px" /></template>
            </a-button>
            <a-button type="link" @click="handleEdit(record)" title="编辑">
              <template #icon><Icon icon="clarity:note-edit-line" style="font-size: 22px" /></template>
            </a-button>
            <a-button 
              v-if="record.status !== 1" 
              type="link" 
              @click="handlePublish(record)" 
              title="发布"
            >
              <template #icon><Icon icon="mdi:publish" style="font-size: 22px" /></template>
            </a-button>
            <a-button 
              v-if="record.status === 1" 
              type="link" 
              @click="handleWithdraw(record)" 
              title="撤回"
            >
              <template #icon><Icon icon="mdi:undo" style="font-size: 22px" /></template>
            </a-button>
            <a-popconfirm
              title="确定要删除这个帖子吗?"
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
        <!-- 状态列 -->
        <template #status="{ text }">
          <a-tag :color="getStatusColor(getStatusFromCode(text))">
            {{ getStatusText(getStatusFromCode(text)) }}
          </a-tag>
        </template>
        <!-- 板块列 -->
        <template #plate_id="{ text }">
          {{ getPlateName(text) }}
        </template>
        <!-- 创建时间列 -->
        <template #created_at="{ text }">
          {{ formatDate(text) }}
        </template>
      </a-table>
  
      <!-- 分页器 -->
      <a-pagination
        v-model:current="current"
        v-model:pageSize="pageSizeRef"
        :page-size-options="pageSizeOptions"
        :total="total"
        show-size-changer
        @change="handlePageChange"
        @showSizeChange="handleSizeChange"
        class="pagination"
      >
        <template #buildOptionText="props">
          <span v-if="props.value !== '50'">{{ props.value }}条/页</span>
          <span v-else>全部</span>
        </template>
      </a-pagination>
  
      <!-- 新增/编辑帖子对话框 -->
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
          <a-form-item label="标题" required>
            <a-input v-model:value="formData.title" placeholder="请输入帖子标题" />
          </a-form-item>
          <a-form-item label="内容" required>
            <a-textarea 
              v-model:value="formData.content" 
              placeholder="请输入帖子内容" 
              :auto-size="{ minRows: 6, maxRows: 12 }" 
            />
          </a-form-item>
          <a-form-item label="板块" required>
            <a-select v-model:value="formData.plateId" placeholder="请选择板块">
              <a-select-option v-for="plate in plateList" :key="plate.id" :value="plate.id">
                {{ plate.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </template>
  
  <script lang="ts" setup>
  import { reactive, ref, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import { Icon } from '@iconify/vue';
  import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue';
  import { useRouter } from 'vue-router';
  import { 
    GetAllPostList, 
    EditPost, 
    UpdatePost, 
    PublishPost, 
    WithdrawPost, 
    DeletePost,
    GetPostCount
  } from '#/api/core/post';
  
  const router = useRouter();
  
  // 表格加载状态
  const loading = ref(false);
  
  // 搜索文本
  const searchText = ref('');
  
  // 帖子列表数据
  const postList = ref<any[]>([]);
  
  // 分页相关
  const pageSizeOptions = ref<string[]>(['10', '20', '30', '40', '50']);
  const current = ref(1);
  const pageSizeRef = ref(10);
  const total = ref(0);
  
  const handleReset = () => {
    searchText.value = '';
    fetchPostList();
  };
  
  const handleSizeChange = (page: number, size: number) => {
    current.value = page;
    pageSizeRef.value = size;
    fetchPostList();
  };
  
  // 处理分页变化
  const handlePageChange = (page: number) => {
    current.value = page;
    fetchPostList();
  };
  
  // 板块列表（模拟数据，实际应从API获取）
  const plateList = ref([
    { id: 1, name: '技术交流' },
    { id: 2, name: '生活分享' },
    { id: 3, name: '求职招聘' },
    { id: 4, name: '闲聊灌水' }
  ]);
  
  // 表格列配置
  const columns = [
    {
      title: '帖子ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      slots: { customRender: 'title' }
    },
    {
      title: '作者',
      dataIndex: 'uid',
      key: 'uid',
    },
    {
      title: '板块',
      dataIndex: 'plate_id',
      key: 'plate_id',
      slots: { customRender: 'plate_id' }
    },
    {
      title: '点赞数',
      dataIndex: 'like_count',
      key: 'like_count',
    },
    {
      title: '收藏数',
      dataIndex: 'collect_count',
      key: 'collect_count',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      slots: { customRender: 'status' }
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      slots: { customRender: 'created_at' }
    },
    {
      title: '操作',
      key: 'action',
      slots: { customRender: 'action' },
    },
  ];
  
  // 模态框相关
  const isModalVisible = ref(false);
  const modalTitle = ref('新增帖子');
  const formData = reactive({
    postId: 0,
    title: '',
    content: '',
    plateId: undefined
  });
  
  // 获取帖子列表
  const fetchPostList = async () => {
    loading.value = true;
    try {
      const res = await GetAllPostList({
        page: current.value,
        size: pageSizeRef.value
      });
      postList.value = res || [];
      const countRes = await GetPostCount();
      total.value = countRes || 0;
      
    } catch (error) {
      message.error('获取帖子列表失败');
    } finally {
      loading.value = false;
    }
  };
  
  // 根据状态码获取状态文本
  const getStatusFromCode = (statusCode: number) => {
    const statusMap: Record<number, string> = {
      0: 'draft',      // 草稿
      1: 'published',  // 已发布
      2: 'withdrawn',  // 已撤回
      3: 'deleted'     // 已删除
    };
    return statusMap[statusCode] || 'draft';
  };
  
  // 根据板块ID获取板块名称
  const getPlateName = (plateId: number) => {
    const plate = plateList.value.find(p => p.id === plateId);
    return plate ? plate.name : '未知板块';
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // 处理搜索
  const handleSearch = () => {
    current.value = 1;
    fetchPostList();
  };
  
  // 处理查看帖子详情
  const handleViewDetail = (record: any) => {
    router.push(`/post/detail/${record.id}`);
  };
  
  // 处理新增帖子
  const handleAdd = () => {
    modalTitle.value = '新增帖子';
    Object.assign(formData, {
      postId: 0,
      title: '',
      content: '',
      plateId: undefined
    });
    isModalVisible.value = true;
  };
  
  // 处理编辑帖子
  const handleEdit = (record: any) => {
    modalTitle.value = '编辑帖子';
    Object.assign(formData, {
      postId: record.id,
      title: record.title,
      content: record.content,
      plateId: record.plate_id
    });
    isModalVisible.value = true;
  };
  
  // 处理发布帖子
  const handlePublish = async (record: any) => {
    try {
      await PublishPost({
        postId: record.id
      });
      message.success('帖子发布成功');
      fetchPostList();
    } catch (error) {
      message.error('帖子发布失败');
    }
  };
  
  // 处理撤回帖子
  const handleWithdraw = async (record: any) => {
    try {
      await WithdrawPost({
        postId: record.id
      });
      message.success('帖子撤回成功');
      fetchPostList();
    } catch (error) {
      message.error('帖子撤回失败');
    }
  };
  
  // 处理删除帖子
  const handleDelete = async (record: any) => {
    try {
      await DeletePost({
        postId: record.id
      });
      message.success('帖子删除成功');
      fetchPostList();
    } catch (error) {
      message.error('帖子删除失败');
    }
  };
  
  // 处理模态框提交
  const handleModalSubmit = async () => {
    try {
      if (modalTitle.value === '新增帖子') {
        await EditPost(formData);
        message.success('新增帖子成功');
      } else {
        await UpdatePost(formData);
        message.success('编辑帖子成功');
      }
      isModalVisible.value = false;
      fetchPostList();
    } catch (error) {
      message.error(modalTitle.value === '新增帖子' ? '新增帖子失败' : '编辑帖子失败');
    }
  };
  
  // 处理模态框取消
  const handleModalCancel = () => {
    isModalVisible.value = false;
  };
  
  // 获取状态颜色
  const getStatusColor = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'blue',
      'published': 'green',
      'withdrawn': 'orange',
      'deleted': 'red'
    };
    return statusMap[status] || 'default';
  };
  
  // 获取状态文本
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': '草稿',
      'published': '已发布',
      'withdrawn': '已撤回',
      'deleted': '已删除'
    };
    return statusMap[status] || '未知状态';
  };
  
  // 页面加载时获取数据
  onMounted(() => {
    fetchPostList();
  });
  </script>
  
  <style scoped>
  .custom-toolbar {
    padding: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .search-filters {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .action-buttons {
    display: flex;
    gap: 8px;
    align-items: center;
  }
  
  .pagination {
    margin-top: 16px;
    text-align: right;
    margin-right: 12px;
  }
  
  .post-title-link {
    color: #1890ff;
    cursor: pointer;
  }
  
  .post-title-link:hover {
    text-decoration: underline;
  }
  </style>
