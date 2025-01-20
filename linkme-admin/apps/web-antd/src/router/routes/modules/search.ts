import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:search',
      order: 10,
      title: '搜索管理',
    },
    name: 'Search',
    path: '/search',
    children: [
      {
        name: '搜索记录',
        path: '/search/records',
        component: () => import('#/views/search/SearchRecords.vue'),
        meta: {
          icon: 'lucide:history',
          title: '搜索记录',
        },
      },
      {
        name: '搜索配置',
        path: '/search/config',
        component: () => import('#/views/search/SearchConfig.vue'),
        meta: {
          icon: 'lucide:settings',
          title: '搜索配置',
        },
      },
      {
        name: '搜索统计',
        path: '/search/analytics',
        component: () => import('#/views/search/SearchAnalytics.vue'),
        meta: {
          icon: 'lucide:bar-chart',
          title: '搜索统计',
        },
      },
    ],
  }
];

export default routes;
