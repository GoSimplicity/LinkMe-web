# 使用官方的 Node.js 镜像作为构建阶段
FROM node:21 AS build-stage
# 设置 npm 使用淘宝源
RUN npm config set registry https://registry.npmmirror.com
WORKDIR /app
COPY package*.json ./
# 安装依赖
RUN npm install
# 复制所有文件到工作目录
COPY . .
# 构建项目
RUN npm run build

# 使用 nginx 镜像作为生产阶段
FROM nginx:stable-alpine AS production-stage
# 复制构建后的文件到 nginx html 目录
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]