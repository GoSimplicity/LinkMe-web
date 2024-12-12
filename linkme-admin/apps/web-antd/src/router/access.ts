import type {
  ComponentRecordType,
  GenerateMenuAndRoutesOptions,
} from '@vben/types';

import { generateAccessible } from '@vben/access';
import { preferences } from '@vben/preferences';
import { message } from 'ant-design-vue';
import { listMenusApi } from '#/api/core/system';
import { BasicLayout, IFrameView } from '#/layouts';
import { $t } from '#/locales';

// 403页面组件
const forbiddenComponent = () => import('#/views/_core/fallback/forbidden.vue');

/**
 * 生成权限路由和菜单
 * @param options 配置选项
 * @returns 生成的路由和菜单
 */
async function generateAccess(options: GenerateMenuAndRoutesOptions) {
  // 获取所有页面组件
  const pageMap: ComponentRecordType = import.meta.glob('../views/**/*.vue');

  // 定义布局组件映射
  const layoutMap: ComponentRecordType = {
    BasicLayout,
    IFrameView,
  };

  // 生成权限路由
  return await generateAccessible(preferences.app.accessMode, {
    ...options,
    // 异步获取菜单列表
    fetchMenuListAsync: async () => {
      // 显示加载提示
      message.loading({
        content: `${$t('common.loadingMenu')}...`,
        duration: 1.5,
      });
      // 调用接口获取菜单数据
      return await listMenusApi({
        page_number: 1,
        page_size: 999,
        is_tree: true
      });
    },
    // 可以指定没有权限跳转403页面
    forbiddenComponent,
    // 如果 route.meta.menuVisibleWithForbidden = true
    layoutMap,
    pageMap,
  });
}

export { generateAccess };
