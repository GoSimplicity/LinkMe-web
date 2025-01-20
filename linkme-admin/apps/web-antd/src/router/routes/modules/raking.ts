import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:trophy',
      order: 4,
      title: '榜单管理',
    },
    name: 'Ranking',
    path: '/ranking',
    children: [
      {
        name: '榜单配置',
        path: '/ranking/config',
        component: () => import('#/views/ranking/RankingConfig.vue'),
        meta: {
          icon: 'lucide:settings',
          title: '榜单配置',
        },
      },
      {
        name: '榜单查看',
        path: '/ranking/view',
        component: () => import('#/views/ranking/RankingView.vue'),
        meta: {
          icon: 'lucide:list-ordered',
          title: '榜单查看',
        },
      },
    ],
  }
];

export default routes;
