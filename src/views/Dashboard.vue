<template>
  <div class="dashboard-container">
    <a-page-header title="信息面板" class="dashboard-title" />
    <a-row gutter={16} class="stats-container">
      <a-col v-for="(stat, index) in stats" :key="index" :span="8">
        <a-card>
          <a-statistic :title="stat.title" :value="stat.value" />
        </a-card>
      </a-col>
    </a-row>
    <a-card class="recent-activities">
      <a-card-meta title="最近活动" />
      <a-list class="activities-list">
        <a-list-item v-if="recentActivity">
          <a-list-item-meta :description="formatActivity(recentActivity)" />
        </a-list-item>
      </a-list>
    </a-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from '../utils/axios'
import { PageHeader, Row, Col, Card, Statistic, List } from 'ant-design-vue'

export default {
  name: 'Dashboard',
  components: {
    'a-page-header': PageHeader,
    'a-row': Row,
    'a-col': Col,
    'a-card': Card,
    'a-statistic': Statistic,
    'a-list': List
  },
  setup() {
    const stats = ref([
      { title: '用户数量', value: 0 },
      { title: '帖子数量', value: 0 },
      { title: '审核任务', value: 0 }
    ])

    const recentActivity = ref(null)

    const getStats = async () => {
      try {
        const userResponse = await axios.get('/api/users/stats')
        stats.value[0].value = userResponse.data.data
        const postResponse = await axios.get('/api/posts/stats')
        stats.value[1].value = postResponse.data.data
        const checkResponse = await axios.get('/api/checks/stats')
        stats.value[2].value = checkResponse.data.data
      } catch (error) {
        console.error('获取统计数据失败:', error)
      }
    }

    const getRecentActivities = async () => {
      try {
        const response = await axios.get('/api/activity/recent')
        if (response.data.code === 200) {
          console.log('Recent activity data:', response.data.data)
          recentActivity.value = response.data.data
        } else {
          console.error('获取最近活动失败:', response.data.msg)
        }
      } catch (error) {
        console.error('获取最近活动失败:', error)
      }
    }

    const formatDate = (timestamp) => {
      if (!timestamp) return ''
      const date = new Date(parseInt(timestamp) * 1000)
      return date.toLocaleString()
    }

    const formatActivity = (activity) => {
      return `${formatDate(activity.Time)} - ${activity.Description} - ${activity.UserID}`
    }

    onMounted(() => {
      getStats()
      getRecentActivities()
    })

    return {
      stats,
      recentActivity,
      formatDate,
      formatActivity
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 24px;
  background: #f0f2f5;
}

.dashboard-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 24px;
}

.stats-container {
  margin-bottom: 24px;
}

.recent-activities {
  margin-top: 24px;
}

.activities-list {
  margin-top: 16px;
}
</style>