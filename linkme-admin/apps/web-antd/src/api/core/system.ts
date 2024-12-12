import { requestClient } from '#/api/request';

export namespace SystemApi {
  // 菜单管理相关接口
  export interface ListMenusReq {
    page_number: number; // 页码
    page_size: number; // 每页数量
    is_tree?: boolean; // 是否树形结构
  }

  export interface CreateMenuReq {
    name: string; // 菜单名称
    path: string; // 菜单路径
    parent_id: number; // 父菜单ID
    component?: string; // 组件
    icon?: string; // 图标
    sort_order: number; // 排序
    route_name?: string; // 路由名称
    hidden: 0 | 1; // 是否隐藏
  }

  export interface UpdateMenuReq {
    id: number; // 菜单ID
    name: string; // 菜单名称
    path: string; // 菜单路径
    parent_id: number; // 父菜单ID
    component?: string; // 组件
    icon?: string; // 图标
    sort_order: number; // 排序
    route_name?: string; // 路由名称
    hidden: 0 | 1; // 是否隐藏
  }

  export interface DeleteMenuReq {
    id: number; // 菜单ID
  }

  // API管理相关接口
  export interface ListApisReq {
    page_number: number; // 页码
    page_size: number; // 每页数量
  }

  export interface CreateApiReq {
    name: string; // API名称
    path: string; // API路径
    method: number; // 请求方法
    description?: string; // API描述
    version?: string; // API版本
    category?: number; // API分类
    is_public: 0 | 1; // 是否公开
  }

  export interface UpdateApiReq {
    id: number; // API ID
    name: string; // API名称
    path: string; // API路径
    method: number; // 请求方法
    description?: string; // API描述
    version?: string; // API版本
    category?: number; // API分类
    is_public: 0 | 1; // 是否公开
  }

  export interface DeleteApiReq {
    id: number; // API ID
  }

  // 角色管理相关接口
  export interface ListRolesReq {
    page_number: number; // 页码
    page_size: number; // 每页数量
  }

  export interface CreateRoleReq {
    name: string; // 角色名称
    description?: string; // 角色描述
    role_type: number; // 角色类型
    is_default: 0 | 1; // 是否默认角色
  }

  export interface UpdateRoleReq {
    id: number; // 角色ID
    name: string; // 角色名称
    description?: string; // 角色描述
    role_type: number; // 角色类型
    is_default: 0 | 1; // 是否默认角色
    menu_ids?: number[]; // 菜单ID列表
    api_ids?: number[]; // API ID列表
  }

  export interface DeleteRoleReq {
    id: number; // 角色ID
  }

  // 权限分配相关接口
  export interface AssignPermissionsReq {
    role_id: number; // 角色ID
    menu_ids?: number[]; // 菜单ID列表
    api_ids?: number[]; // API ID列表
  }

  export interface AssignApiPermissionsToUserReq {
    user_id: number; // 用户ID
    api_ids: number[]; // API ID列表
  }

  export interface AssignMenuPermissionsToUserReq {
    user_id: number; // 用户ID
    menu_ids: number[]; // 菜单ID列表
  }

  export interface AssignRoleToUserReq {
    user_id: number; // 用户ID
    role_ids: number[]; // 角色ID列表
    menu_ids?: number[]; // 菜单ID列表
    api_ids?: number[]; // API ID列表
  }

  export interface AssignRoleToUsersReq {
    user_ids: number[]; // 用户ID列表
    role_ids: number[]; // 角色ID列表
    menu_ids?: number[]; // 菜单ID列表
    api_ids?: number[]; // API ID列表
  }
}

// 菜单管理
export function listMenusApi(data: SystemApi.ListMenusReq) {
  return requestClient.post('/menus/list', data);
}

export function createMenuApi(data: SystemApi.CreateMenuReq) {
  return requestClient.post('/menus/create', data);
}

export function updateMenuApi(data: SystemApi.UpdateMenuReq) {
  return requestClient.post('/menus/update', data);
}

export function deleteMenuApi(id: string) {
  return requestClient.delete(`/menus/${id}`);
}

// API管理
export function listApisApi(data: SystemApi.ListApisReq) {
  return requestClient.post('/apis/list', data);
}

export function createApiApi(data: SystemApi.CreateApiReq) {
  return requestClient.post('/apis/create', data);
}

export function updateApiApi(data: SystemApi.UpdateApiReq) {
  return requestClient.post('/apis/update', data);
}

export function deleteApiApi(id: string) {
  return requestClient.delete(`/apis/${id}`);
}

// 角色管理
export function listRolesApi(data: SystemApi.ListRolesReq) {
  return requestClient.post('/roles/list', data);
}

export function createRoleApi(data: SystemApi.CreateRoleReq) {
  return requestClient.post('/roles/create', data);
}

export function updateRoleApi(data: SystemApi.UpdateRoleReq) {
  return requestClient.post('/roles/update', data);
}

export function deleteRoleApi(id: string) {
  return requestClient.delete(`/roles/${id}`);
}

// 根据角色ID获取对应菜单和API权限
export function getRolesApi(id: string) {
  return requestClient.get(`/roles/${id}`);
}

// 根据用户ID获取对应菜单和API权限
export function getUserRolesApi(id: string) {
  return requestClient.get(`/roles/user/${id}`);
}

export function assignRoleToUserApi(data: SystemApi.AssignRoleToUserReq) {
  return requestClient.post('/permissions/user/assign', data);
}

export function assignRoleToUsersApi(data: SystemApi.AssignRoleToUsersReq) {
  return requestClient.post('/permissions/users/assign', data);
}
