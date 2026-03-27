#!/bin/bash

set -e

IMAGE_NAME="abszm/multiplayer-games"

echo "=== 构建并推送 Docker 镜像 ==="

# 登录 Docker Hub
echo "请登录 Docker Hub:"
docker login

# 构建并推送 server 镜像
echo "构建 server 镜像..."
docker build -t ${IMAGE_NAME}-server:latest -f docker/Dockerfile.server .
docker push ${IMAGE_NAME}-server:latest

# 构建并推送 client 镜像
echo "构建 client 镜像..."
docker build -t ${IMAGE_NAME}-client:latest -f docker/Dockerfile.client .
docker push ${IMAGE_NAME}-client:latest

echo "=== 推送完成 ==="
echo ""
echo "镜像已发布:"
echo "  ${IMAGE_NAME}-server:latest"
echo "  ${IMAGE_NAME}-client:latest"
