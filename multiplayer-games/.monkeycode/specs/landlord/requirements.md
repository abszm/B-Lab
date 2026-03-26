# 斗地主 (Landlord) 需求文档

## 1. 简介

斗地主是中国最流行的纸牌游戏之一，采用"地主"对阵"农民"的非对称对战模式。三名玩家通过叫地主确定身份，展开激烈的对抗。

## 2. 游戏规则

### 2.1 基本信息
- **玩家数量**: 3人
- **使用牌数**: 54张（包含大小王）
- **座位**: 固定顺序（服务器随机分配初始座位）

### 2.2 牌型定义
| 牌型 | 说明 | 示例 |
|------|------|------|
| 单张 | 任意一张单牌 | 3 |
| 对子 | 两张点数相同的牌 | 3-3 |
| 三张 | 三张点数相同的牌 | 3-3-3 |
| 三带一 | 三张+单张 | 3-3-3-5 |
| 三带一对 | 三张+对子 | 3-3-3-5-5 |
| 顺子 | 5张或更多连续单牌 | 3-4-5-6-7 |
| 连对 | 3对或更多连续对子 | 33-44-55 |
| 飞机 | 2个或更多连续三张 | 333-444 |
| 飞机带翅膀 | 飞机+单张/对子 | 333-444-5-5 |
| 四带二 | 四张+两张单牌 | 3333-5-7 |
| 炸弹 | 四张相同点数的牌 | 3333 |
| 王炸 | 大王+小王 | 大王+小王 |

### 2.3 牌的大小
- 单张: 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A < 2 < 小王 < 大王
- 其他牌型: 点数相同则花色无用，需要相同牌型才能比较

### 2.4 发牌
- 每人17张牌
- 剩余3张底牌扣下，等待叫地主

### 2.5 叫地主
1. 从随机一位玩家开始按顺序叫牌
2. 可以选择：不叫、1分、2分、3分
3. 每人只有一次叫牌机会
4. 叫到最高分者成为地主
5. 若无人叫牌，重新发牌

### 2.6 底牌
- 地主获得3张底牌（共20张）
- 农民保持17张

### 2.7 出牌流程
1. 地主先出牌
2. 逆时针顺序出牌
3. 必须出比上家大的牌（相同牌型）
4. 跳过不出（不出或"要不起"）
5. 连续两人不出，当前出牌者重新开始

### 2.8 获胜条件
- 地主获胜: 地主先出完所有手牌
- 农民获胜: 任意一位农民先出完手牌

## 3. 用户故事

### 3.1 创建房间
**AS A** 玩家  
**I WANT** 创建一个新的斗地主房间  
**SO THAT** 可以邀请朋友来对战

#### 接受条件
1. WHEN 玩家点击"创建房间"，THEN 系统分配唯一房间号
2. WHEN 房间创建成功，THEN 显示房间号供分享
3. WHEN 房间不足3人，THEN 显示"等待其他玩家..."

### 3.2 加入房间
**AS A** 玩家  
**I WANT** 通过房间号加入房间  
**SO THAT** 可以和朋友一起玩游戏

#### 接受条件
1. WHEN 输入有效房间号并确认，THEN 验证房间状态
2. WHEN 房间已满或不存在，THEN 显示错误提示
3. WHEN 第三人加入，THEN 自动开始发牌

### 3.3 发牌阶段
**AS A** 系统  
**I WANT** 在三人到齐后自动发牌  
**SO THAT** 玩家可以看到自己的手牌

#### 接受条件
1. WHEN 三人全部就位，THEN 播放发牌动画，每人被分配17张牌
2. WHEN 发牌完成，THEN 显示手牌并进入叫地主阶段
3. WHEN 显示手牌时，THEN 按点数从大到小排列

### 3.4 叫地主阶段
**AS A** 玩家  
**I WANT** 根据手牌决定是否叫地主  
**SO THAT** 争取成为地主获得底牌

#### 接受条件
1. WHEN 轮到当前玩家叫地主，THEN 显示叫地主界面
2. WHEN 玩家选择叫分，THEN 更新叫分状态并广播
3. WHEN 最高叫分为3分，THEN 立即确定地主
4. WHEN 所有玩家都不叫，THEN 重新发牌
5. WHEN 确定地主，THEN 地主获得底牌，显示地主标记

### 3.5 出牌阶段
**AS A** 玩家  
**I WANT** 在轮到自己时选择出牌  
**SO THAT** 尝试率先出完手牌获胜

#### 接受条件
1. WHEN轮到当前玩家，THEN 高亮出牌按钮，显示可出牌型提示
2. WHEN 玩家选择不出，THEN 提示"要不起"或"不出"
3. WHEN 玩家出牌，THEN 验证牌型正确性，比上家大
4. WHEN 牌型错误或小于上家，THEN 提示错误，不出牌
5. WHEN 连续两位玩家不出，THEN 清空上家的牌，允许任意出牌

### 3.6 游戏结束
**AS A** 系统  
**I WANT** 在有人出完手牌时结束游戏  
**SO THAT** 判定胜负并展示结果

#### 接受条件
1. WHEN 地主出完所有手牌，THEN 地主获胜
2. WHEN 任意农民出完所有手牌，THEN 农民获胜
3. WHEN 游戏结束，THEN 显示胜负结果和牌局回顾

## 4. 数据模型

### 4.1 房间状态
```typescript
interface LandlordRoom {
  roomId: string;
  status: 'waiting' | 'dealing' | 'calling' | 'playing' | 'ended';
  players: [Player, Player, Player];  // 固定3人
  landlordIndex: 0 | 1 | 2 | null;    // 地主索引
  currentCaller: 0 | 1 | 2;           // 当前叫牌玩家
  currentPlayer: 0 | 1 | 2;           // 当前出牌玩家
  highestBid: number;                 // 最高叫分 (0,1,2,3)
  highestBidder: number;              // 最高叫分者索引
  deck: string[];                     // 剩余牌堆
  handCards: [string[], string[], string[]];  // 三人手牌
  bottomCards: string[];               // 底牌3张
  lastPlayedCards: {                   // 上家出牌
    player: number;
    cards: string[];
    type: CardType;
  } | null;
  winner: 'landlord' | 'farmer' | null;
}
```

### 4.2 玩家状态
```typescript
interface Player {
  id: string;
  socketId: string;
  position: 0 | 1 | 2;  // 座位位置
  status: 'online' | 'offline';
}
```

### 4.3 牌型枚举
```typescript
type CardType = 
  | 'single'      // 单张
  | 'pair'        // 对子
  | 'triple'      // 三张
  | 'triple-one'  // 三带一
  | 'triple-pair' // 三带一对
  | 'straight'    // 顺子
  | 'straight-pair' // 连对
  | 'plane'       // 飞机
  | 'plane-wings' // 飞机带翅膀
  | 'four-two'    // 四带二
  | 'bomb'        // 炸弹
  | 'joker-bomb'; // 王炸
```

## 5. 事件定义

### 5.1 客户端 → 服务端
| 事件名 | 载荷 | 说明 |
|--------|------|------|
| landlord:create-room | {} | 创建房间 |
| landlord:join-room | { roomId } | 加入房间 |
| landlord:call-bid | { bid } | 叫分 |
| landlord:play-cards | { cards } | 出牌 |
| landlord:pass | {} | 不出 |
| landlord:leave-room | {} | 离开房间 |

### 5.2 服务端 → 客户端
| 事件名 | 载荷 | 说明 |
|--------|------|------|
| landlord:room-created | { roomId, position } | 房间创建成功 |
| landlord:room-joined | { room, position } | 加入成功 |
| landlord:game-start | {} | 游戏开始 |
| landlord:cards-dealt | { handCards } | 发牌完成 |
| landlord:bid-turn | { currentCaller } | 轮到谁叫分 |
| landlord:bid-made | { player, bid } | 叫分结果 |
| landlord:landlord-selected | { landlordIndex, bottomCards } | 地主确定 |
| landlord:play-turn | { currentPlayer } | 轮到谁出牌 |
| landlord:cards-played | { player, cards, type } | 出牌结果 |
| landlord:pass-made | { player } | 不出 |
| landlord:game-over | { winner } | 游戏结束 |
| landlord:error | { message } | 错误通知 |
