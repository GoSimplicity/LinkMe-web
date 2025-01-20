import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:layout-dashboard',
      order: 2,
      title: '审核管理',
    },
    name: 'Check',
    path: '/check',
    children: [
      {
        name: '内容审核',
        path: '/check/content',
        component: () => import('#/views/check/ContentCheck.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: '内容审核',
        },
      },
      {
        name: '用户审核',
        path: '/check/user',
        component: () => import('#/views/check/UserCheck.vue'),
        meta: {
          icon: 'lucide:user-check',
          title: '用户审核',
        },
      },
      {
        name: '举报管理',
        path: '/check/report',
        component: () => import('#/views/check/ReportManage.vue'),
        meta: {
          icon: 'lucide:flag',
          title: '举报管理',
        },
      },
    ],
  }
];

export default routes;
