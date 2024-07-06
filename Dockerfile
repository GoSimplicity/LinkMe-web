# 使用node镜像作为构建阶段
FROM node:14 AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 使用nginx镜像作为生产阶段
FROM nginx:stable-alpine AS production-stage
# 复制构建后的文件到nginx html目录
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
# 暴露端口
EXPOSE 80
# 启动nginx
CMD ["nginx", "-g", "daemon off;"]