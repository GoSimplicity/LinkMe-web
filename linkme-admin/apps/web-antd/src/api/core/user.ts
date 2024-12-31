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

type changePasswordReq = {
  username: string;
  password: string;
  newPassword: string;
  confirmPassword: string;
}

type writeOffUserReq = {
  username: string;
  password: string;
}

type updateUserInfoReq = {
  userId: number;
  realName: string;
  phone: string;
  email: string;
  roleId: string;
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

export async function changePassword(data: changePasswordReq) {
  return requestClient.post('/user/change_password', data);
}

export async function writeOffUser(data: writeOffUserReq) {
  return requestClient.post('/user/write_off', data);
}

export async function updateUserInfo(data: updateUserInfoReq) {
  return requestClient.post('/user/profile/update', data);
}
