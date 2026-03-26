# 五子棋 (Gobang) 需求文档

## 1. 简介

五子棋是一款经典的两人对弈策略游戏，玩家交替在 15x15 的棋盘上放置黑白棋子，率先在横、竖或斜线方向上连成五子的一方获胜。

## 2. 游戏规则

### 2.1 基本规则
- 棋盘：15x15 的网格
- 玩家：2人，对应黑棋和白棋
- 黑棋先行
- 每人每回合在空白交叉点放置一枚棋子
- 棋子放置后不可移动

### 2.2 获胜条件
- 横、竖、斜（正斜/反斜）任一方向上连续形成五子
- 若棋盘填满仍无胜者，则为平局

### 2.3 禁手规则（可选，本版本暂不实现）
- 本版本不考虑三三禁手、四四禁手、长连禁手
- 任意五子连珠即获胜

## 3. 用户故事

### 3.1 创建房间
**AS A** 玩家  
**I WANT** 创建一个新的五子棋房间  
**SO THAT** 可以邀请朋友来对战

#### 接受条件
1. WHEN 玩家点击"创建房间"，THEN 系统分配唯一房间号并进入等待状态
2. WHEN 房间创建成功，THEN 显示房间号供分享
3. WHEN 房间有人在等待，THEN 显示"等待玩家..."提示

### 3.2 加入房间
**AS A** 玩家  
**I WANT** 通过房间号加入已有房间  
**SO THAT** 可以和朋友一起玩游戏

#### 接受条件
1. WHEN 玩家输入有效的房间号并确认，THEN 系统验证房间存在且可加入
2. WHEN 房间已满或不存在，THEN 显示错误提示"房间不存在或已满"
3. WHEN 加入成功且房间有两人，THEN 自动开始游戏

### 3.3 游戏对战
**AS A** 玩家  
**I WANT** 在轮到自己时放置棋子  
**SO THAT** 尝试连成五子获胜

#### 接受条件
1. WHEN轮到当前玩家，THEN 显示提示"轮到你了"
2. WHEN 点击空白位置，THEN 在该位置放置对应颜色棋子
3. WHEN 另一方玩家回合，THEN 禁止操作并显示"等待对方..."
4. WHEN 玩家尝试在已有棋子位置落子，THEN 无响应或提示"此处已有棋子"

### 3.4 判断胜负
**AS A** 系统  
**I WANT** 在每次落子后检查是否有人获胜  
**SO THAT** 游戏可以正常结束

#### 接受条件
1. WHEN 任意玩家形成五子连珠，THEN 宣布该玩家获胜并结束游戏
2. WHEN 棋盘填满无人获胜，THEN 宣布平局
3. WHEN 游戏结束，THEN 显示结果并提供"再来一局"选项

### 3.5 断线重连
**AS A** 玩家  
**I WANT** 在意外断线后重新连接  
**SO THAT** 可以继续游戏进度

#### 接受条件
1. WHEN 玩家断线，THEN 房间保留并标记该玩家状态为"离线"
2. WHEN 断线玩家重新连接，THEN 恢复游戏状态
3. WHEN 离线超过 60 秒，THEN 对方可选择"判负"或"等待"

## 4. 数据模型

### 4.1 房间状态
```typescript
interface GobangRoom {
  roomId: string;           // 房间号 (4-6位数字)
  status: 'waiting' | 'playing' | 'ended';  // 房间状态
  players: [Player | null, Player | null];  // 玩家列表
  currentTurn: 0 | 1;       // 当前回合 (0: 黑, 1: 白)
  board: (0 | 1 | 2)[][];   // 棋盘状态 (0: 空, 1: 黑, 2: 白)
  winner: 0 | 1 | null;     // 获胜者
  createdAt: number;        // 创建时间
}
```

### 4.2 玩家状态
```typescript
interface Player {
  id: string;               // 玩家唯一ID
  role: 'black' | 'white';  // 棋子颜色
  status: 'online' | 'offline';  // 在线状态
  socketId: string;         // WebSocket连接ID
}
```

## 5. 事件定义

### 5.1 客户端 → 服务端
| 事件名 | 载荷 | 说明 |
|--------|------|------|
| create-room | {} | 创建房间 |
| join-room | { roomId } | 加入房间 |
| make-move | { x, y } | 落子 |
| leave-room | {} | 离开房间 |
| reconnect | { playerId } | 断线重连 |

### 5.2 服务端 → 客户端
| 事件名 | 载荷 | 说明 |
|--------|------|------|
| room-created | { roomId, role } | 房间创建成功 |
| room-joined | { room, role } | 加入房间成功 |
| game-start | { board, currentTurn } | 游戏开始 |
| move-made | { x, y, player, board, currentTurn } | 落子通知 |
| game-over | { winner, reason } | 游戏结束 |
| player-disconnected | { playerIndex } | 玩家断线 |
| player-reconnected | { playerIndex } | 玩家重连 |
| error | { message } | 错误通知 |
