<script lang="ts" setup>
import type { LoginAndRegisterParams } from '@vben/common-ui';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { AuthenticationRegister } from '@vben/common-ui';
import { LOGIN_PATH } from '@vben/constants';
import { registerApi } from '#/api/core/user';
import { message } from 'ant-design-vue';

defineOptions({ name: 'Register' });

const router = useRouter();
const loading = ref(false);

async function handleSubmit(params: LoginAndRegisterParams) {
  try {
    loading.value = true;
    await registerApi({
      confirmPassword: params.confirmPassword,
      password: params.password,
      username: params.username,
    });
    // 注册成功
    message.success('注册成功');
    // 注册成功后跳转到登录页
    router.push(LOGIN_PATH);
  } catch (error) {
    console.error('注册失败:', error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <AuthenticationRegister
    :loading="loading"
    :login-path="LOGIN_PATH"
    @submit="handleSubmit"
  />
</template>
