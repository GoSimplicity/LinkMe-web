import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:users',
      order: 9,
      title: '用户关系管理',
    },
    name: 'Relation',
    path: '/relation',
    children: [
      {
        name: '好友关系',
        path: '/relation/friends',
        component: () => import('#/views/relation/FriendsManage.vue'),
        meta: {
          icon: 'lucide:users-2',
          title: '好友关系',
        },
      },
      {
        name: '关注与粉丝',
        path: '/relation/follows',
        component: () => import('#/views/relation/FollowsManage.vue'),
        meta: {
          icon: 'lucide:heart',
          title: '关注与粉丝',
        },
      },
      {
        name: '社交互动分析',
        path: '/relation/social',
        component: () => import('#/views/relation/SocialAnalysis.vue'),
        meta: {
          icon: 'lucide:activity',
          title: '社交互动分析',
        },
      },
    ],
  }
];

export default routes;
