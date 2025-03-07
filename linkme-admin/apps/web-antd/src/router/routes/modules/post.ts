import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'lucide:file-text',
      order: 1,
      title: '帖子管理',
    },
    name: 'Post',
    path: '/post',
    children: [
      {
        name: '帖子列表',
        path: '/post/list',
        component: () => import('#/views/post/PostList.vue'),
        meta: {
          icon: 'lucide:list',
          title: '帖子列表',
        },
      },
      {
        name: '帖子分类',
        path: '/post/category',
        component: () => import('#/views/post/PostCategory.vue'),
        meta: {
          icon: 'lucide:folder',
          title: '帖子分类',
        },
      },
      {
        name: '评论管理',
        path: '/post/comment',
        component: () => import('#/views/post/CommentManage.vue'),
        meta: {
          icon: 'lucide:message-square',
          title: '评论管理',
        },
      },
      {
        name: '帖子详情',
        path: '/post/detail/:id',
        component: () => import('#/views/post/PostDetail.vue'),
        meta: {
          icon: 'lucide:file-text',
          title: '帖子详情',
          hideInMenu: true,
        },
      },
    ],
  }
];

export default routes;
