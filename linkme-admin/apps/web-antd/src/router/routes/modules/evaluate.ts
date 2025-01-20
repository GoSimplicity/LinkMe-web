import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:star',
      order: 6,
      title: '评价管理',
    },
    name: 'Evaluate',
    path: '/evaluate',
    children: [
      {
        name: '评价列表',
        path: '/evaluate/list',
        component: () => import('#/views/evaluate/EvaluateList.vue'),
        meta: {
          icon: 'lucide:list',
          title: '评价列表',
        },
      },
      {
        name: '评价统计',
        path: '/evaluate/statistics',
        component: () => import('#/views/evaluate/EvaluateStatistics.vue'),
        meta: {
          icon: 'lucide:bar-chart',
          title: '评价统计',
        },
      },
      {
        name: '评价审核',
        path: '/evaluate/check',
        component: () => import('#/views/evaluate/EvaluateCheck.vue'),
        meta: {
          icon: 'lucide:check-circle',
          title: '评价审核',
        },
      },
    ],
  }
];

export default routes;
