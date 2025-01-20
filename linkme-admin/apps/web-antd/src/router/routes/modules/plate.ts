import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:layout-grid',
      order: 3,
      title: '板块管理',
    },
    name: 'Plate',
    path: '/plate',
    children: [
      {
        name: '板块列表',
        path: '/plate/list',
        component: () => import('#/views/plate/PlateList.vue'),
        meta: {
          icon: 'lucide:list',
          title: '板块列表',
        },
      },
      {
        name: '板块设置',
        path: '/plate/settings',
        component: () => import('#/views/plate/PlateSettings.vue'),
        meta: {
          icon: 'lucide:settings',
          title: '板块设置',
        },
      },
    ],
  }
];

export default routes;
