import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:history',
      order: 5,
      title: '历史记录',
    },
    name: 'History',
    path: '/history',
    children: [
      {
        name: '操作历史',
        path: '/history/operation',
        component: () => import('#/views/history/OperationHistory.vue'),
        meta: {
          icon: 'lucide:list-checks',
          title: '操作历史',
        },
      },
      {
        name: '审核记录',
        path: '/history/audit',
        component: () => import('#/views/history/AuditHistory.vue'),
        meta: {
          icon: 'lucide:clipboard-check',
          title: '审核记录',
        },
      },
      {
        name: '用户活动日志',
        path: '/history/user-activity',
        component: () => import('#/views/history/UserActivityLog.vue'),
        meta: {
          icon: 'lucide:activity',
          title: '用户活动日志',
        },
      },
    ],
  }
];

export default routes;
