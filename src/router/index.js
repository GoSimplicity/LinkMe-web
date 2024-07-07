import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/Index.vue'
import Login from '../views/Login.vue'
import User from '../views/User.vue'
import Post from '../views/Post.vue'
import PostDetail from '../views/PostDetail.vue' // 引入帖子详情组件
import Review from '../views/Review.vue'
import Permission from '../views/Permission.vue'
import ScheduledTask from '../views/ScheduledTask.vue'
import Section from '../views/Section.vue'
import Dashboard from '@/views/Dashboard.vue'
import Profile from '@/views/Profile.vue'
import Check from '@/views/Check.vue'

const routes = [
    { path: '/login', component: Login },
    {
        path: '/',
        component: Index,
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'user', component: User },
            { path: 'post', component: Post },
            { path: 'post/detail_post/:postId', name: 'PostDetail', component: PostDetail }, // 添加帖子详情路由
            { path: 'review', component: Review },
            { path: 'permission', component: Permission },
            { path: 'scheduled-task', component: ScheduledTask },
            { path: 'section', component: Section },
            { path: 'user/profile', component: Profile },
            { path: 'check', component: Check },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('authorization')
    if (!token && to.path !== '/login') {
        next('/login')
    } else {
        next()
    }
})

export default router