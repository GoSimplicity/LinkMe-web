import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:heart',
      order: 8,
      title: '互动管理',
    },
    name: 'Interaction',
    path: '/interaction',
    children: [
      {
        name: '消息通知',
        path: '/interaction/notification',
        component: () => import('#/views/interaction/Notification.vue'),
        meta: {
          icon: 'lucide:bell',
          title: '消息通知',
        },
      },
      {
        name: '私信管理',
        path: '/interaction/message',
        component: () => import('#/views/interaction/Message.vue'),
        meta: {
          icon: 'lucide:mail',
          title: '私信管理',
        },
      },
      {
        name: '互动记录',
        path: '/interaction/record',
        component: () => import('#/views/interaction/Record.vue'),
        meta: {
          icon: 'lucide:activity',
          title: '互动记录',
        },
      },
    ],
  }
];

export default routes;
