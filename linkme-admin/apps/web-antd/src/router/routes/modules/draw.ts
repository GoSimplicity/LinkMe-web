import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:gift',
      order: 7,
      title: '活动管理',
    },
    name: 'Activity',
    path: '/activity',
    children: [
      {
        name: '抽奖活动',
        path: '/activity/draw',
        component: () => import('#/views/activity/DrawActivity.vue'),
        meta: {
          icon: 'lucide:gift',
          title: '抽奖活动',
        },
      },
      {
        name: '秒杀活动',
        path: '/activity/seckill',
        component: () => import('#/views/activity/SeckillActivity.vue'),
        meta: {
          icon: 'lucide:timer',
          title: '秒杀活动',
        },
      },
      {
        name: '活动统计',
        path: '/activity/statistics',
        component: () => import('#/views/activity/ActivityStatistics.vue'),
        meta: {
          icon: 'lucide:bar-chart',
          title: '活动统计',
        },
      },
      {
        name: '奖励发放管理',
        path: '/activity/reward',
        component: () => import('#/views/activity/RewardManage.vue'),
        meta: {
          icon: 'lucide:award',
          title: '奖励发放管理',
        },
      },
    ],
  }
];

export default routes;
