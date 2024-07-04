<template>
  <a-layout-content class="post-container">
    <div class="header">
      <a-button type="primary" @click="editPost(null)" class="add-btn">新增</a-button>
    </div>
    <a-row :gutter="16">
      <a-col v-for="post in posts" :key="post.ID" :span="8">
        <a-card :title="post.Title" class="post-item" @click="goToDetail(post.ID)">
          <p><strong>内容:</strong> {{ post.Content }}</p>
          <p><strong>作者:</strong> {{ post.Author.Name || '未知' }}</p>
          <p><strong>状态:</strong> {{ post.Status }}</p>
          <a-space>
            <a-button type="dashed" @click.stop="deletePost(post.ID)">删除</a-button>
            <a-button type="primary" v-if="post.Status !== 'Published'" @click.stop="publishPost(post.ID)">发布</a-button>
            <a-button type="dashed" v-if="post.Status === 'Published'" @click.stop="retractPost(post.ID)">撤销</a-button>
            <a-button type="dashed" @click.stop="updatePost(post.ID)">更新</a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
    <div class="pagination">
      <a-button type="primary" @click="prevPage" :disabled="page === 1">上一页</a-button>
      <span>第 {{ page }} 页</span>
      <a-button type="primary" @click="nextPage" :disabled="posts.length < size">下一页</a-button>
    </div>
  </a-layout-content>
</template>

<script>
import axios from '../utils/axios';

export default {
  name: 'Post',
  data() {
    return {
      posts: [],
      page: 1,
      size: 12
    };
  },
  mounted() {
    this.fetchPosts();
  },
  methods: {
    async fetchPosts() {
      try {
        const response = await axios.post('/posts/list_post', {
          page: this.page,
          size: this.size
        });
        if (response.data.code === 200) {
          this.posts = response.data.data;
        } else {
          alert(response.data.msg);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      }
    },
    goToDetail(postId) {
      this.$router.push({ name: 'PostDetail', params: { postId } });
    },
    editPost(postId) {
      // 编辑帖子功能实现
      console.log('编辑帖子:', postId);
    },
    deletePost(postId) {
      // 删除帖子功能实现
      console.log('删除帖子:', postId);
    },
    publishPost(postId) {
      // 发布帖子功能实现
      console.log('发布帖子:', postId);
    },
    updatePost(postId) {
      // 更新帖子功能实现
      console.log('更新帖子:', postId);
    },
    retractPost(postId) {
      // 撤销帖子功能实现
      console.log('撤销帖子:', postId);
    },
    prevPage() {
      if (this.page > 1) {
        this.page--;
        this.fetchPosts();
      }
    },
    nextPage() {
      this.page++;
      this.fetchPosts();
    }
  }
};
</script>

<style scoped>
.post-container {
  padding: 24px;
  background: #fff;
  min-height: 280px;
}

.header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.add-btn {
  margin-bottom: 16px;
}

.post-item {
  margin-bottom: 16px;
  cursor: pointer;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
}

button[disabled] {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>