import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

type RegisterParams = {
  username: string;
  password: string;
  confirmPassword: string;
};

type getAllUsersReq = {
  page: number;
  size: number;
}

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/user/profile');
}

export async function registerApi(data: RegisterParams) {
  return requestClient.post('/user/signup', data);
}

export async function getAllUsers(data: getAllUsersReq) {
  return requestClient.post('/user/list', data)
}