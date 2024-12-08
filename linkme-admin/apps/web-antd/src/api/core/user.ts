import type { UserInfo } from '@vben/types';

import { requestClient } from '#/api/request';

type RegisterParams = {
  username: string;
  password: string;
  confirmPassword: string;
};

/**
 * 获取用户信息
 */
export async function getUserInfoApi() {
  return requestClient.get<UserInfo>('/user/profile');
}

export async function registerApi(data: RegisterParams) {
  return requestClient.post('/user/signup', data);
}
