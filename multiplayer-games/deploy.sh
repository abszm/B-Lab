#!/bin/bash

set -e

echo "=== 多人游戏平台一键部署 ==="

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "错误: 未安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "错误: 未安装 docker-compose"
    exit 1
fi

# 检查端口
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "警告: 端口 3000 已被占用"
fi

if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "警告: 端口 3001 已被占用"
fi

# 部署
echo "正在构建并启动服务..."
cd "$(dirname "$0")/docker"
docker-compose up -d --build

echo ""
echo "=== 部署完成 ==="
echo "访问地址: http://localhost:3000"
echo ""
echo "管理命令:"
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
