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
        name: '帖子审核',
        path: '/post/check',
        component: () => import('#/views/post/PostCheck.vue'),
        meta: {
          icon: 'lucide:check-square',
          title: '帖子审核',
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
        name: '热门帖子',
        path: '/post/hot',
        component: () => import('#/views/post/HotPost.vue'),
        meta: {
          icon: 'lucide:flame',
          title: '热门帖子',
        },
      },
    ],
  }
];

export default routes;
