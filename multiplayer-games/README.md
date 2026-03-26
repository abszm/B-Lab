# 多人对战游戏平台

## 项目概述

一个支持多人实时对战的游戏平台，采用 React + Node.js 技术栈，通过 Docker 容器化部署。首期支持两款经典游戏：**五子棋**和**斗地主**。

## 技术架构

### 前端 (React)
- **框架**: React 18 + TypeScript
- **状态管理**: React Context + Hooks
- **实时通信**: WebSocket
- **路由**: React Router v6

### 后端 (Node.js)
- **框架**: Express.js
- **实时通信**: Socket.IO
- **游戏逻辑**: 纯算法实现
- **房间管理**: 内存存储（单机部署）

### 部署 (Docker)
- 前端: Nginx 静态服务
- 后端: Node.js 应用
- docker-compose 一键部署

## 游戏列表

| 游戏 | 玩家数量 | 房间模式 | 状态 |
|------|---------|---------|------|
| 五子棋 | 2人 | 房间号 | 开发中 |
| 斗地主 | 3人 | 房间号 | 开发中 |

## 项目结构

```
multiplayer-games/
├── client/                 # React 前端
│   ├── src/
│   │   ├── components/     # 通用组件
│   │   ├── games/          # 游戏组件
│   │   ├── hooks/          # 自定义 Hooks
│   │   └── utils/           # 工具函数
│   └── public/
├── server/                 # Node.js 后端
│   ├── games/              # 游戏逻辑
│   │   ├── gobang/         # 五子棋
│   │   └── landlord/        # 斗地主
│   ├── routes/             # HTTP 路由
│   ├── middleware/         # 中间件
│   ├── services/           # 业务服务
│   └── utils/              # 工具函数
└── docker/                 # Docker 配置
```

## 核心功能

### 房间系统
- 创建房间获取房间号
- 输入房间号加入房间
- 房间状态管理（等待中/游戏中/已结束）
- 自动清理超时房间

### 实时通信
- WebSocket 长连接
- 房间事件广播
- 游戏动作同步
- 断线重连处理

## 部署方式

```bash
cd docker
docker-compose up -d
```

访问 `http://localhost:3000` 即可使用。
