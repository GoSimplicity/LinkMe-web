<template>
  <div class="post-category-container">
    <a-row :gutter="16">
      <a-col :span="6">
        <!-- 板块列表 -->
        <a-card title="板块分类" :bordered="false" class="plate-card">
          <a-menu
            v-model:selectedKeys="selectedPlateKeys"
            mode="inline"
            @select="handlePlateSelect"
          >
            <a-menu-item v-for="plate in plateList" :key="plate.id">
              <template #icon>
                <Icon icon="mdi:forum-outline" />
              </template>
              {{ plate.name }}
              <span class="plate-post-count">({{ getPlatePostCount(plate.id) }})</span>
            </a-menu-item>
          </a-menu>
        </a-card>
      </a-col>
      <a-col :span="18">
        <!-- 帖子列表 -->
        <a-card :title="currentPlateTitle" :bordered="false">
          <template #extra>
            <a-input-search
              v-model:value="searchText"
              placeholder="搜索帖子标题"
              style="width: 250px"
              @search="handleSearch"
            />
          </template>
          
          <a-empty v-if="postList.length === 0" description="暂无帖子" />
          
          <div v-else class="post-card-list">
            <a-card 
              v-for="post in postList" 
              :key="post.id" 
              class="post-card"
              hoverable
              @click="getPostDetail(post.id)"
            >
              <template #title>
                <div class="post-card-title">{{ post.title }}</div>
              </template>
              <template #extra>
                <a-tag :color="getStatusColor(getStatusFromCode(post.status))">
                  {{ getStatusText(getStatusFromCode(post.status)) }}
                </a-tag>
              </template>
              <div class="post-card-content">
                <div class="post-card-meta">
                  <div class="post-card-stats">
                    <div class="post-card-stat-container" style="display: flex; justify-content: flex-end; align-items: center;">
                      <span class="post-card-stat" style="display: inline-flex; align-items: center; margin-right: 16px;">
                        <Icon icon="mdi:thumb-up-outline" style="font-size: 18px; margin-right: 4px;" />
                        <span style="font-size: 16px;">{{ post.like_count || 0 }}</span>
                      </span>
                      <span class="post-card-stat" style="display: inline-flex; align-items: center;">
                        <Icon icon="mdi:comment-outline" style="font-size: 18px; margin-right: 4px;" />
                        <span style="font-size: 16px;">{{ post.comment_count || 0 }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </a-card>
          </div>
          
          <!-- 分页器 -->
          <a-pagination
            v-if="postList.length > 0"
            v-model:current="current"
            v-model:pageSize="pageSizeRef"
            :total="total"
            :page-size-options="pageSizeOptions"
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
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import { GetPostCount, GetPostsByPlate } from '#/api/core/post';
import { getPlateList } from '#/api/core/plate';

const router = useRouter();

// 板块相关
const plateList = ref<any[]>([]);
const selectedPlateKeys = ref<string[]>([]);
const currentPlateTitle = computed(() => {
  if (selectedPlateKeys.value.length === 0) return '全部帖子';
  const plateId = Number(selectedPlateKeys.value[0]);
  const plate = plateList.value.find(p => p.id === plateId);
  return plate ? `${plate.name}` : '全部帖子';
});

// 帖子相关
const postList = ref<any[]>([]);
const searchText = ref('');
const loading = ref(false);
const total = ref(0);

// 分页相关
const pageSizeOptions = ref<string[]>(['10', '20', '30', '40', '50']);
const current = ref(1);
const pageSizeRef = ref(10);

// 获取板块下的帖子数量
const getPlatePostCount = (plateId: number) => {
  return postList.value.filter(post => post.plate_id === plateId).length;
};

// 获取所有板块
const fetchPlateList = async () => {
  try {
    const res = await getPlateList({ page: 1, size: 100 });
    plateList.value = res || [];
    
    // 设置默认选中第一个板块
    if (plateList.value.length > 0) {
      selectedPlateKeys.value = [String(plateList.value[0].id)];
    }
    
    // 确保先获取板块再获取帖子
    await fetchPostList(); // 将帖子获取移到板块获取之后
  } catch (error) {
    message.error('获取板块列表失败');
  }
};

const fetchPostList = async () => {
  loading.value = true;
  try {
    let params: any = {
      plateId: 0, // 默认值设为0（全部）
      page: current.value,
      size: pageSizeRef.value
    };

    // 动态获取plateId
    if (selectedPlateKeys.value.length > 0) {
      params.plateId = Number(selectedPlateKeys.value[0]);
    }

    // 添加搜索条件
    if (searchText.value) {
      params.keyword = searchText.value;
    }

    const res = await GetPostsByPlate(params);
    postList.value = res || [];
    
    // 获取总数（根据当前筛选条件可能需要调整）
    const countRes = await GetPostCount(); // 假设接口支持按板块统计
    total.value = countRes || 0;
    
  } catch (error) {
    message.error('获取帖子列表失败');
  } finally {
    loading.value = false;
  }
};

// 处理板块选择
const handlePlateSelect = ({ key }: { key: string }) => {
  selectedPlateKeys.value = [key];
  current.value = 1; 
  fetchPostList();
};

// 处理帖子选择
const getPostDetail = (postId: number) => {
  router.push(`/post/detail/${postId}`);
};

// 处理搜索
const handleSearch = () => {
  current.value = 1; 
  fetchPostList();
};

// 处理分页变化
const handlePageChange = (page: number) => {
  current.value = page;
  fetchPostList();
};

// 处理每页条数变化
const handleSizeChange = (page: number, size: number) => {
  current.value = page;
  pageSizeRef.value = size;
  fetchPostList();
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

onMounted(() => {
  fetchPlateList();
});
</script>

<style scoped>
.post-category-container {
  padding: 16px;
}

.plate-card {
  margin-bottom: 16px;
}

.plate-post-count {
  margin-left: 4px;
  color: #999;
  font-size: 12px;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}

.post-tree-node {
  display: flex;
  flex-direction: column;
  padding: 4px 0;
}

.post-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
  cursor: pointer;
}

.post-title:hover {
  color: #1890ff;
  text-decoration: underline;
}

.post-meta {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #999;
}

.post-date {
  margin: 0 8px;
}

.post-stats {
  display: flex;
  align-items: center;
}
</style>
