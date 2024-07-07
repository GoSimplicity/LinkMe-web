<template>
  <a-layout-content class="post-container">
    <div class="header">
      <a-button type="primary" @click="showAddModal(null)" class="add-btn">新增</a-button>
    </div>
    <a-row :gutter="16">
      <a-col v-for="post in posts" :key="post.ID" :span="8">
        <a-card :title="post.Title" class="post-item">
          <p><strong>内容:</strong> {{ post.Content }}</p>
          <p><strong>作者:</strong> {{ post.Author.Name || '未知' }}</p>
          <p><strong>状态:</strong> {{ post.Status }}</p>
          <a-space>
            <a-button type="dashed" @click.stop="deletePost(post.ID)">删除</a-button>
            <a-button type="primary" v-if="post.Status !== 'Published'" @click.stop="publishPost(post.ID)">发布</a-button>
            <a-button type="dashed" v-if="post.Status === 'Published'" @click.stop="retractPost(post.ID)">撤销</a-button>
            <a-button type="dashed" @click.stop="showAddModal(post.ID)">编辑</a-button>
          </a-space>
        </a-card>
      </a-col>
    </a-row>
    <div class="pagination">
      <a-button type="primary" @click="prevPage" :disabled="page === 1">上一页</a-button>
      <span>第 {{ page }} 页</span>
      <a-button type="primary" @click="nextPage" :disabled="posts.length < size">下一页</a-button>
    </div>
    <a-modal
        v-model:visible="addModalVisible"
        title="新增/编辑帖子"
        @ok="handleAddOk"
        @cancel="handleAddCancel"
    >
      <form @submit.prevent="handleAddOk" class="form-container">
        <div class="form-item">
          <label for="title">标题:</label>
          <input type="text" id="title" v-model="addPostData.title" />
        </div>
        <div class="form-item">
          <label for="content">内容:</label>
          <textarea id="content" v-model="addPostData.content"></textarea>
        </div>
        <div class="form-item">
          <label for="plateId">板块ID:</label>
          <input type="number" id="plateId" v-model="addPostData.plateId" />
        </div>
        <div class="form-item">
          <button type="submit" class="submit-btn">提交</button>
        </div>
      </form>
    </a-modal>
  </a-layout-content>
</template>

<script>
import axios from '../utils/axios';
import { message } from 'ant-design-vue';

export default {
  name: 'Post',
  data() {
    return {
      posts: [],
      page: 1,
      size: 12,
      addModalVisible: false,
      isEditMode: false,
      currentPostId: null,
      addPostData: {
        title: '',
        content: '',
        plateId: null
      }
    };
  },
  mounted() {
    this.fetchPosts();
  },
  methods: {
    async fetchPosts() {
      try {
        const response = await axios.post('/api/posts/list_post', {
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
    showAddModal(postId) {
      if (postId) {
        this.isEditMode = true;
        this.currentPostId = postId;
        const post = this.posts.find(p => p.ID === postId);
        this.addPostData = { title: post.Title, content: post.Content, plateId: post.PlateId };
      } else {
        this.isEditMode = false;
        this.currentPostId = null;
        this.addPostData = { title: '', content: '', plateId: null };
      }
      this.addModalVisible = true;
    },
    async deletePost(postId) {
      try {
        await axios.delete(`/api/posts/delete/${postId}`);
        this.fetchPosts();
        message.success('删除成功');
      } catch (error) {
        console.error('Error deleting post:', error);
        message.error('删除失败');
      }
    },
    async publishPost(postId) {
      try {
        await axios.post('/api/posts/publish', { postId });
        this.fetchPosts();
        message.success('发布成功');
      } catch (error) {
        console.error('Error publishing post:', error);
        message.error('发布失败');
      }
    },
    async retractPost(postId) {
      try {
        await axios.post('/api/posts/withdraw', { postId });
        this.fetchPosts();
        message.success('撤销成功');
      } catch (error) {
        console.error('Error retracting post:', error);
        message.error('撤销失败');
      }
    },
    async handleAddOk() {
      console.log('Submitting:', this.addPostData);  // 调试信息
      try {
        if (this.isEditMode) {
          await axios.post('/api/posts/update', {
            postId: this.currentPostId,
            title: this.addPostData.title,
            content: this.addPostData.content,
            plateId: this.addPostData.plateId
          });
          message.success('更新成功');
        } else {
          await axios.post('/api/posts/edit', {
            title: this.addPostData.title,
            content: this.addPostData.content,
            plateId: this.addPostData.plateId
          });
          message.success('新增成功');
        }
        this.fetchPosts();
        this.addModalVisible = false;
        this.addPostData = { title: '', content: '', plateId: null };
      } catch (error) {
        console.error('Error adding/updating post:', error);
        message.error('提交失败');
      }
    },
    handleAddCancel() {
      this.addModalVisible = false;
      this.addPostData = { title: '', content: '', plateId: null };
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

.form-container {
  display: flex;
  flex-direction: column;
}

.form-item {
  margin-bottom: 16px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
}

.form-item input,
.form-item textarea {
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.form-item textarea {
  resize: vertical;
}

.submit-btn {
  width: 100%;
  padding: 10px;
  background-color: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submit-btn:hover {
  background-color: #40a9ff;
}
</style>