import { requestClient } from '#/api/request';

type PostEditReq = {
  postId?: number;
  title?: string;
  content?: string;
  plateId?: number;
};

type PostUpdateReq = {
  postId?: number;
  title?: string;
  content?: string;
  plateId?: number;
};

type PostPublishReq = {
  postId?: number;
};

type PostWithdrawReq = {
  postId?: number;
};

type PostListReq = {
  page?: number;
  size?: number;
};

type PostDetailReq = {
  postId: number;
};

type PostDeleteReq = {
  postId: number;
};

type PostLikeReq = {
  postId?: number;
  liked?: boolean;
};

type PostCollectReq = {
  postId?: number;
  collectd?: boolean;
};

type GeneralResp = {
  code: number;
  data: any;
  message: string;
  type: string;
};

type GetPostsByPlateReq = {
  plateId: number;
  page?: number;
  size?: number;
};

// 编辑帖子
export async function EditPost(data: PostEditReq) {
  return requestClient.post<GeneralResp>('/posts/edit', data);
}

// 更新帖子
export async function UpdatePost(data: PostUpdateReq) {
  return requestClient.post<GeneralResp>('/posts/update', data);
}

// 发布帖子
export async function PublishPost(data: PostPublishReq) {
  return requestClient.post<GeneralResp>('/posts/publish', data);
}

// 撤回帖子
export async function WithdrawPost(data: PostWithdrawReq) {
  return requestClient.post<GeneralResp>('/posts/withdraw', data);
}

// 删除帖子
export async function DeletePost(postId: PostDeleteReq) {
  return requestClient.delete<GeneralResp>(`/posts/delete/${postId.postId}`);
}

// 获取个人帖子列表
export async function GetPostList(data: PostListReq) {
  return requestClient.post<GeneralResp>('/posts/list', data);
}

// 获取公开帖子列表
export async function GetPublicPostList(data: PostListReq) {
  return requestClient.post<GeneralResp>('/posts/list_pub', data);
}

// 获取所有帖子列表
export async function GetAllPostList(data: PostListReq) {
  return requestClient.post<GeneralResp>('/posts/list_all', data);
}

// 获取帖子详情
export async function GetPost(id: PostDetailReq) {
  return requestClient.get<GeneralResp>(`/posts/get/${id.postId}`);
}

// 获取个人帖子详情
export async function GetPostDetail(postId: PostDetailReq) {
  return requestClient.get<GeneralResp>(`/posts/detail/${postId.postId}`);
}

// 获取公开帖子详情
export async function GetPublicPostDetail(postId: PostDetailReq) {
  return requestClient.get<GeneralResp>(`/posts/detail_pub/${postId.postId}`);
}

// 点赞/取消点赞
export async function LikePost(data: PostLikeReq) {
  return requestClient.post<GeneralResp>('/posts/like', data);
}

// 收藏/取消收藏
export async function CollectPost(data: PostCollectReq) {
  return requestClient.post<GeneralResp>('/posts/collect', data);
}

// 获取帖子总数
export async function GetPostCount() {
  return requestClient.get<GeneralResp>('/posts/count');
}

export async function GetPostsByPlate(data: GetPostsByPlateReq) {
  return requestClient.post<GeneralResp>('/posts/get_by_plate', data);
}
