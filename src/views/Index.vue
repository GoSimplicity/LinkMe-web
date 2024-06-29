<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider collapsible v-model:collapsed="collapsed" class="sider">
      <div class="logo">
        <h2 class="logo-text">LinkMe Admin</h2>
      </div>
      <a-menu theme="dark" mode="inline" :defaultSelectedKeys="['1']">
        <a-sub-menu key="1" title="信息面板">
          <a-menu-item key="1-1" @click="goToPage('/dashboard')">
            <a-icon type="dashboard" />
            <span>信息面板</span>
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="2" title="用户管理">
          <a-menu-item key="2-1" @click="goToPage('/user')">
            <a-icon type="user" />
            <span>用户管理</span>
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="3" title="帖子管理">
          <a-menu-item key="3-1" @click="goToPage('/post')">
            <a-icon type="file-text" />
            <span>帖子管理</span>
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="4" title="审核管理">
          <a-menu-item key="4-1" @click="goToPage('/review')">
            <a-icon type="audit" />
            <span>审核管理</span>
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="5" title="权限管理">
          <a-menu-item key="5-1" @click="goToPage('/permission')">
            <a-icon type="lock" />
            <span>权限管理</span>
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="6" title="定时任务">
          <a-menu-item key="6-1" @click="goToPage('/scheduled-task')">
            <a-icon type="schedule" />
            <span>定时任务</span>
          </a-menu-item>
        </a-sub-menu>
        <a-sub-menu key="7" title="板块管理">
          <a-menu-item key="7-1" @click="goToPage('/section')">
            <a-icon type="appstore" />
            <span>板块管理</span>
          </a-menu-item>
        </a-sub-menu>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header class="header">
        <a-icon
            class="trigger"
            type="menu-fold"
            v-if="!collapsed"
            @click="collapsed = !collapsed"
        />
        <a-icon
            class="trigger"
            type="menu-unfold"
            v-if="collapsed"
            @click="collapsed = !collapsed"
        />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Index',
  setup() {
    const collapsed = ref(false)
    const router = useRouter()

    const goToPage = (path) => {
      router.push(path)
    }

    return {
      collapsed,
      goToPage
    }
  }
}
</script>

<style scoped>
.sider {
  background: #001529;
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 64px;
  margin: 16px;
  background-color: #001529;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}

.logo-text {
  color: white;
  text-align: center;
  font-size: 24px;
  font-weight: bold;
  font-style: italic;
}


.header {
  background: #fff;
  padding: 0;
  box-shadow: 0 2px 8px #f0f1f2;
  display: flex;
  align-items: center;
  padding-left: 16px;
}

.trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

.trigger:hover {
  color: #1890ff;
}

.content {
  margin: 24px 16px;
  padding: 24px;
  background: #f0f2f5;
  min-height: 280px;
}

a-menu-item {
  margin: 8px 0;
}

a-menu-item:hover {
  background-color: #1d1d1d !important;
}
</style>