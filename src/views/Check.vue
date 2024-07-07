<template>
  <div class="check-container">
    <a-page-header title="审核管理" />
    <a-table :columns="columns" :dataSource="checks" :pagination="pagination" @change="handleTableChange" rowKey="ID">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a-button
              type="primary"
              :disabled="record.disabled"
              style="background-color: #4CAF50; border-color: #4CAF50;"
              @click="approveCheck(record.ID)"
          >
            审核通过
          </a-button>
          <a-button
              type="primary"
              :disabled="record.disabled"
              style="background-color: #F44336; border-color: #F44336; margin-left: 10px;"
              @click="rejectCheck(record.ID)"
          >
            审核拒绝
          </a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from '../utils/axios'
import { PageHeader, Table, Button, message } from 'ant-design-vue'

export default {
  name: 'Check',
  components: {
    'a-page-header': PageHeader,
    'a-table': Table,
    'a-button': Button
  },
  setup() {
    const checks = ref([])
    const pagination = ref({ current: 1, pageSize: 10, total: 0 })
    const columns = ref([
      {
        title: 'ID',
        dataIndex: 'ID',
        key: 'ID'
      },
      {
        title: 'Post ID',
        dataIndex: 'PostID',
        key: 'PostID'
      },
      {
        title: 'Title',
        dataIndex: 'Title',
        key: 'Title'
      },
      {
        title: 'User ID',
        dataIndex: 'UserID',
        key: 'UserID'
      },
      {
        title: 'Status',
        dataIndex: 'Status',
        key: 'Status'
      },
      {
        title: 'Created At',
        dataIndex: 'CreatedAt',
        key: 'CreatedAt',
        render: (text) => new Date(text).toLocaleString()
      },
      {
        title: 'Updated At',
        dataIndex: 'UpdatedAt',
        key: 'UpdatedAt',
        render: (text) => new Date(text).toLocaleString()
      },
      {
        title: 'Action',
        key: 'action'
      }
    ])

    const fetchChecks = async (page, size) => {
      try {
        const response = await axios.post('/api/checks/list', { page, size })
        if (response.data.code === 200) {
          checks.value = response.data.data.map(item => ({ ...item, disabled: false }))
          pagination.value.total = response.data.total // 假设响应中包含总数
        } else {
          message.error('获取审核列表失败')
        }
      } catch (error) {
        message.error('获取审核列表失败')
        console.error('获取审核列表失败:', error)
      }
    }

    const handleTableChange = (pagination) => {
      fetchChecks(pagination.current, pagination.pageSize)
    }

    const approveCheck = async (checkId) => {
      try {
        await axios.post('/api/checks/approve', {
          checkId,
          userId: 126521184256,
          remark: '审核通过...'
        })
        message.success('审核通过')
        disableButtons(checkId)
        fetchChecks(pagination.value.current, pagination.value.pageSize)
      } catch (error) {
        message.error('审核通过失败')
        console.error('审核通过失败:', error)
      }
    }

    const rejectCheck = async (checkId) => {
      try {
        await axios.post('/api/checks/reject', {
          checkId,
          userId: 126521184256,
          remark: '拒绝通过审核...'
        })
        message.success('审核拒绝')
        disableButtons(checkId)
        fetchChecks(pagination.value.current, pagination.value.pageSize)
      } catch (error) {
        message.error('审核拒绝失败')
        console.error('审核拒绝失败:', error)
      }
    }

    const disableButtons = (checkId) => {
      const check = checks.value.find(item => item.ID === checkId)
      if (check) {
        check.disabled = true
      }
    }

    onMounted(() => {
      fetchChecks(pagination.value.current, pagination.value.pageSize)
    })

    return {
      checks,
      columns,
      pagination,
      handleTableChange,
      approveCheck,
      rejectCheck
    }
  }
}
</script>

<style scoped>
.check-container {
  padding: 24px;
  background: #f0f2f5;
}

a-page-header {
  margin-bottom: 24px;
}
</style>