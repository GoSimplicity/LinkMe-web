<template>
  <div class="post-detail-container">
    <a-card :loading="loading">
      <template #title>
        <div class="post-header">
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-meta">
            <span>板块：{{ getPlateName(post.plate_id) }}</span>
            <a-divider type="vertical" />
            <span>发布时间：{{ formatDate(post.created_at) }}</span>
            <a-divider type="vertical" />
            <span>状态：
              <a-tag :color="getStatusColor(post.status)">
                {{ getStatusText(post.status) }}
              </a-tag>
            </span>
            <a-divider type="vertical" />
            <span>阅读量：{{ post.read_count || 0 }}</span>
          </div>
        </div>
      </template>
      
      <div class="post-content" v-html="post.content"></div>
      
      <div class="post-actions">
        <a-space>
          <a-button 
            :type="post.liked ? 'primary' : 'default'" 
            @click="handleLike"
          >
            <template #icon><LikeOutlined /></template>
            点赞 ({{ post.like_count || 0 }})
          </a-button>
          
          <a-button 
            :type="post.collected ? 'primary' : 'default'" 
            @click="handleCollect"
          >
            <template #icon><StarOutlined /></template>
            收藏 ({{ post.collect_count || 0 }})
          </a-button>
          
          <a-button>
            <template #icon><CommentOutlined /></template>
            评论 ({{ post.comment_count || 0 }})
          </a-button>
        </a-space>
      </div>
    </a-card>
    
    <div class="action-buttons">
      <a-space>
        <a-button @click="goBack">返回</a-button>
        <a-button type="primary" @click="handleEdit" v-if="canEdit">编辑</a-button>
        <a-button 
          v-if="post.status !== 1 && canEdit" 
          type="primary" 
          @click="handlePublish"
        >
          发布
        </a-button>
        <a-button 
          v-if="post.status === 1 && canEdit" 
          danger 
          @click="handleWithdraw"
        >
          撤回
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { 
  LikeOutlined, 
  StarOutlined,
  CommentOutlined
} from '@ant-design/icons-vue';
import { 
  GetPost, 
  LikePost, 
  CollectPost,
  PublishPost,
  WithdrawPost
} from '#/api/core/post';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const canEdit = ref(false); // 是否可以编辑，根据用户权限决定
const plateList = ref<any[]>([]); // 板块列表

// 帖子数据
const post = reactive({
  id: 0,
  title: '',
  content: '',
  plate_id: 0,
  status: 0,
  like_count: 0,
  collect_count: 0,
  read_count: 0,
  comment_count: 0,
  created_at: '',
  updated_at: '',
  uid: 0,
  slug: '',
  tags: '',
  liked: false,
  collected: false
});

onMounted(async () => {
  const postId = route.params.id;
  if (!postId) {
    message.error('帖子ID不存在');
    router.push('/post/list');
    return;
  }
  
  await fetchPostDetail(Number(postId));
});

// 获取帖子详情
const fetchPostDetail = async (postId: number) => {
  loading.value = true;
  try {
    const res = await GetPost({ postId });
    
    if (res) {
      Object.assign(post, res);
      // 根据返回数据判断当前用户是否可以编辑
      canEdit.value = true; // 这里应该根据实际情况判断，比如当前用户ID与帖子作者ID是否一致
    } else {
      message.error('获取帖子详情失败');
    }
  } catch (error) {
    message.error('获取帖子详情失败');
  } finally {
    loading.value = false;
  }
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

// 获取状态文本
const getStatusText = (status: number) => {
  const statusMap: Record<number, string> = {
    0: '草稿',
    1: '已发布',
    2: '已撤回',
    3: '已删除'
  };
  return statusMap[status] || '未知状态';
};

// 获取状态颜色
const getStatusColor = (status: number) => {
  const colorMap: Record<number, string> = {
    0: 'orange',
    1: 'green',
    2: 'blue',
    3: 'red'
  };
  return colorMap[status] || 'default';
};

// 根据板块ID获取板块名称
const getPlateName = (plateId: number) => {
  const plate = plateList.value.find(p => p.id === plateId);
  return plate ? plate.name : `板块${plateId}`;
};

// 处理点赞
const handleLike = async () => {
  try {
    await LikePost({
      postId: post.id,
      liked: !post.liked
    });
    
    post.liked = !post.liked;
    post.like_count = post.liked ? (post.like_count + 1) : (post.like_count - 1);
    message.success(post.liked ? '点赞成功' : '取消点赞成功');
  } catch (error) {
    message.error('操作失败');
  }
};

// 处理收藏
const handleCollect = async () => {
  try {
    await CollectPost({
      postId: post.id,
      collectd: !post.collected
    });
    
    post.collected = !post.collected;
    post.collect_count = post.collected ? (post.collect_count + 1) : (post.collect_count - 1);
    message.success(post.collected ? '收藏成功' : '取消收藏成功');
  } catch (error) {
    message.error('操作失败');
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};

// 编辑帖子
const handleEdit = () => {
  router.push(`/post/edit/${post.id}`);
};

// 发布帖子
const handlePublish = async () => {
  try {
    await PublishPost({ postId: post.id });
    message.success('发布成功');
    post.status = 1;
  } catch (error) {
    message.error('发布失败');
  }
};

// 撤回帖子
const handleWithdraw = async () => {
  try {
    await WithdrawPost({ postId: post.id });
    message.success('撤回成功');
    post.status = 2;
  } catch (error) {
    message.error('撤回失败');
  }
};
</script>

<style scoped>
.post-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.post-header {
  margin-bottom: 20px;
}

.post-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.post-meta {
  color: #666;
  font-size: 14px;
}

.post-content {
  min-height: 300px;
  margin-bottom: 20px;
  line-height: 1.8;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  overflow-x: hidden;
}

.post-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.action-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
