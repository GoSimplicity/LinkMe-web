<template>
  <a-layout-content class="post-container">
    <a-row :gutter="16">
      <a-col v-for="post in posts" :key="post.ID" :span="8">
        <a-card :title="post.Title" class="post-item">
          <p>{{ post.Content }}</p>
          <p>作者: {{ post.Author.Name || '未知' }}</p>
          <p>状态: {{ post.Status }}</p>
          <a-button type="primary" @click="editPost(post.ID)" class="action-btn">编辑</a-button>
          <a-button type="danger" @click="deletePost(post.ID)" class="action-btn">删除</a-button>
          <a-button v-if="post.Status !== 'Published'" @click="publishPost(post.ID)" class="action-btn">发布</a-button>
          <a-button v-if="post.Status === 'Published'" @click="retractPost(post.ID)" class="action-btn">撤销</a-button>
          <a-button @click="updatePost(post.ID)" class="action-btn">更新</a-button>
        </a-card>
      </a-col>
    </a-row>
    <div class="pagination">
      <a-button @click="prevPage" :disabled="page === 1">上一页</a-button>
      <span>第 {{ page }} 页</span>
      <a-button @click="nextPage" :disabled="posts.length < size">下一页</a-button>
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
      size: 10
    };
  },
  mounted() {
    this.fetchPosts();
  },
  methods: {
    async fetchPosts() {
      try {
        const response = await axios.post('/posts/list_pub', {
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

.post-item {
  margin-bottom: 16px;
}

.action-btn {
  margin-right: 8px;
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