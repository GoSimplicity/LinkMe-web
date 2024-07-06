<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from '../utils/axios';

// 使用 ref 定义响应式变量
const post = ref(null);
const route = useRoute(); // 获取路由实例

const fetchPostDetail = async (postId) => {
  try {
    const response = await axios.get(`/api/posts/detail_post/${postId}`);
    if (response.data.code === 200) {
      post.value = response.data.data;
    } else {
      alert(response.data.msg);
    }
  } catch (error) {
    console.error('Error fetching post detail:', error);
  }
};

onMounted(() => {
  const postId = route.params.postId; // 获取路径参数 postId
  fetchPostDetail(postId); // 获取帖子详情
});
</script>

<template>
  <a-layout-content class="post-detail-container">
    <a-card v-if="post" :title="post.Title">
      <p>作者: {{ post.Author.Name || '未知' }}</p>
      <p>状态: {{ post.Status }}</p>
      <p>内容: {{ post.Content }}</p>
    </a-card>
    <a-spin v-else>Loading...</a-spin> <!-- 加载中状态 -->
  </a-layout-content>
</template>

<style scoped>
.post-detail-container {
  padding: 24px;
  background: #fff;
  min-height: 280px;
}

a-card {
  width: 100%;
}
</style>