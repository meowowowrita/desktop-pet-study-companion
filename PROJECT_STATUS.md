# 桌面宠物学习陪伴应用 — 项目进度与需求总结

> **最后更新：** 2026-06-28  
> **路径：** `D:\78119\claude\desktop-pet-study-companion\`

本文档是新对话的项目记忆入口。AGENTS.md 要求每个新会话首先读取本文件和 `docs/AI_COLLABORATION_WORKFLOW.md`。

---

## 一、技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Electron 33 + electron-vite |
| 前端 | React 18 + TypeScript 5.7 + Zustand 5 |
| 打包 | electron-builder（`npm run package` 配置存在，未测试） |
| 本地存储 | JSON 文件（Electron `userData/saves/`，3 份自动备份轮转） |
| 素材协议 | `asset://` 自定义 protocol，支持视频 Range 请求 |

---

## 二、AI 协作工作流（已落地）

项目已建立固定的 AI 协作模式：

| 文件 | 用途 |
|------|------|
| `AGENTS.md` | 主代理（Codex / Claude Code）行为规则：新会话入口、worker 策略、任务拆分规范 |
| `CLAUDE.md` | Claude Code worker 实例被调用时的行为约束：写入范围、构建验证、报告规范 |
| `docs/AI_COLLABORATION_WORKFLOW.md` | 工作流定义（source of truth） |
| `scripts/claude-worker.cmd` | Windows worker 启动包装器（推荐使用，避免 PowerShell 执行策略问题） |
| `scripts/claude-worker.ps1` | PowerShell worker 启动脚本 |

**默认约定：**
- 主代理统筹需求理解、计划制定、任务拆分、review、整合
- 实现委托给 **Claude Code CLI**（非 Codex 子代理），参数：
  ```
  claude -p "<任务>" --model deepseek-v4-pro --effort max --exclude-dynamic-system-prompt-sections --permission-mode bypassPermissions
  ```
- 每个 worker 任务独立可验证（能跑 `npm.cmd run build`），文件范围不重叠
- Windows 下使用 `npm.cmd`，不要用 `npm` 或 `npm.ps1`
- 开发模式用 PowerShell：`Start-Process npm.cmd -ArgumentList "run","dev"`

---

## 三、项目结构

```
src/
├── main/
│   ├── index.ts              # 主进程：窗口/托盘/IPC/asset协议/tick循环/生命周期
│   └── storage.ts            # 存档读写（JSON + 3备份 + 版本迁移接口）
├── preload/
│   └── index.ts              # contextBridge 安全桥接（petApi）
├── renderer/
│   ├── index.html            # 透明窗口入口
│   ├── main.tsx              # React 挂载
│   ├── App.tsx               # 路由分发 + 多窗口存档同步订阅
│   ├── env.d.ts              # window.petApi 类型声明
│   ├── styles.css            # 全局样式
│   ├── routes/
│   │   ├── PetWindow.tsx     # 宠物主窗口
│   │   └── ControlPanel.tsx  # 控制面板（状态/专注/商店/背包/设置 5 标签页）
│   └── components/
│       ├── PetSprite.tsx         # 宠物视频播放 + emoji 兜底
│       ├── DialogueBubble.tsx    # 对话气泡（硬编码逻辑）
│       ├── StatusPanel.tsx       # 7 维状态条 + 经济/用户数据
│       ├── FocusTimer.tsx        # 专注计时器（开始/暂停/继续/放弃/结算）
│       ├── QuickMenu.tsx         # 右键快捷菜单（JS 拖动 + 喂食/洗澡/清理/玩耍/面板）
│       ├── ShopPanel.tsx         # 商店面板（分类筛选、购买逻辑）
│       ├── InventoryPanel.tsx    # 背包面板（物品列表、使用物品）
│       └── SettingsPanel.tsx     # 设置面板（语言/置顶/通知/启动行为）
├── shared/
│   ├── types.ts              # 全局 TS 类型定义
│   ├── constants.ts          # 游戏数值常量（分段费率/衰减/成长/窗口尺寸）
│   ├── defaults.ts           # 默认存档工厂 + UUID 工具（初始 50 金币 + basic_food x3）
│   ├── data/
│   │   ├── species.ts        # 14 种宠物配置（6 普通 + 4 稀有 + 3 史诗 + 2 传说）
│   │   ├── personalities.ts  # 5 种性格（黏人/傲娇/懒散/努力/贪吃）
│   │   └── items.ts          # 物品目录（4 食物 + 4 零食 + 4 玩具）
│   └── game/
│       ├── petState.ts       # 互动纯函数（喂食/洗澡/清理/玩耍 + 时间衰减）
│       ├── petFactory.ts     # 宠物创建工厂
│       ├── focus.ts          # 专注奖励分段计算
│       ├── inventory.ts      # 商店/背包纯函数（buyItem / useInventoryItem）
│       └── lifecycle.ts      # 生命周期（每日重置/连续天数/成长阶段/离线追赶）

assets/
└── pets/cat/baby/            # idle.mp4 + playing.mp4 + sad.mp4
```

---

## 四、已完成功能 ✅ (v0.2.0 当前)

### 桌面 & 窗口
- [x] 透明无边框宠物窗口（220×260）
- [x] 系统托盘图标（右键菜单：显示/控制面板/退出）
- [x] 关闭按钮 = 隐藏到托盘（不退出）
- [x] 窗口置顶支持（设置面板可切换，主进程 `setAlwaysOnTop`）
- [x] 窗口位置记忆（保存到存档，启动恢复）
- [x] 自定义 `asset://` 协议（支持视频 Range 请求 `206 Partial Content`）
- [x] JS 拖动（左键按住移动无边框窗口，通过 IPC `ui:moveWindow`）

### 宠物系统
- [x] 视频播放（`PetSprite` 组件，按状态切换视频）
- [x] 视频回退机制：target → idle → emoji 兜底
- [x] 7 维状态系统：饥饿/清洁/心情/精力/健康/无聊/亲密度
- [x] 时间衰减（`DECAY_PER_HOUR` 每维度独立速率，`applyTimeDecay` 纯函数）
- [x] 离线追赶（主进程 `applyOfflineDecay`，上限 24h）
- [x] 互动系统：喂食/洗澡/清理/玩耍（`petState.ts` 纯函数）
- [x] 玩耍冷却 5 分钟
- [x] 排泄物机制（概率生成 + 清洁惩罚）

### 成长 & 宠物种类
- [x] 14 种宠物数据（青蛙/兔子/猫/狗/小鸡/仓鼠/狐狸/熊猫/鹿/企鹅/羊驼/龙/雪豹/凤凰/独角兽）
- [x] 5 种性格（黏人/傲娇/懒散/努力/贪吃），不同衰减倍率
- [x] 3 个成长阶段（baby < 100, child 100-299, adult >= 300 growthPoints）
- [x] 宠物工厂（随机性格/随机名字 + 自定义名）
- [x] 首次启动送小猫（`createPet` + `getCommonSpecies`）
- [x] 成长阶段自动升级（`updateGrowthStage` 在 tick 和完成专注时触发）

### 专注系统
- [x] 专注计时器：4 种类型（学习/工作/听课/阅读）
- [x] 5/15/25/45/60 分钟可选
- [x] 暂停/继续/放弃
- [x] 分段金币模型（以每日约 4 小时为目标）：
  - 0-60m: 0.25/min, 60-120m: 0.45/min, 120-240m: 0.75/min, 240-300m: 0.50/min, 300m+: 0.15/min
  - 单次 session ≥ 25 分钟 +1 金币
  - 首次达 240 分钟 +30 金币
  - streak: 3-6 天 1.05x, 7-13 天 1.10x, 14+ 天 1.15x
- [x] 今日统计（分钟/次数/金币）
- [x] 专注完成时系统通知
- [x] `recordFocusCompletion` 更新 today stats、user 总分钟、economy、streak、growthPoints

### 经济 & 商店/背包
- [x] 物品目录 12 种（4 食物 + 4 零食 + 4 玩具），含价格/稀有度/效果/标签
- [x] 商店面板：按分类筛选（全部/食物/零食/玩具），购买逻辑 `buyItem`
- [x] 背包面板：展示已拥有物品，使用物品 `useInventoryItem`
- [x] 右键喂食：优先消耗背包中 food/snack 类物品，走统一 `useInventoryItem` 路径
- [x] 初始金币 50 + basic_food ×3
- [x] `lifetimeCoinsEarned` / `lifetimeCoinsSpent` 追踪

### 设置面板
- [x] 语言切换（zh/en，保存在存档）
- [x] 置顶开关（实时调用 `setAlwaysOnTop`）
- [x] 通知开关
- [x] 空闲行为设置（sleep/wander/talk）和宠物缩放设置（0.5x-2.0x）已实现；`startOnBoot` 字段已预留但真实开机启动未接入，仍在限制/待办中

### 对话气泡
- [x] 按状态匹配台词
- [x] 性格差异化默认台词
- [x] 15 秒轮换 + 4 秒自动隐藏
- [x] 点击气泡重新显示

### 存档 & 同步
- [x] JSON 本地存储（`userData/saves/`，3 份自动备份轮转）
- [x] 版本迁移接口（`SAVE_VERSION = 1`）
- [x] 主进程 ↔ 渲染进程 via IPC + contextBridge（`petApi`）
- [x] **多窗口存档实时同步**：主进程 `updateSave`/tick 后 `broadcastSaveUpdated()`，`App.tsx` 订阅 `onSaveUpdated` 自动刷新 state
- [x] **主进程定时 tick**（每 60s）：应用衰减 + 每日 rollover + 成长阶段检查 + 自动保存 + 广播

### 生命周期
- [x] 每日 rollover：`performDailyRollover` 把旧 today upsert 到 history，重置新一天
- [x] 离线衰减：`applyOfflineDecay` 按 `lastTickAt` 追算，上限 24h
- [x] 连续天数：`recordFocusCompletion` 检查昨天 history 决定续接或重置
- [x] 成长阶段：growthPoints 累积 → `updateGrowthStage` 自动升级 baby→child→adult
- [x] 启动流程：加载存档 → 每日重置 → 离线追赶 → 送小猫（如空） → 保存

---

## 五、当前已知状态

### 素材
- `cat/baby` 有 `idle.mp4`、`playing.mp4`、`sad.mp4`
- 其他状态（happy/hungry/sleeping/talking）、其他宠物、其他成长阶段素材**仍待补充**
- 白底 GIF 去背景建议转透明 webm（VP9 alpha）

### 经济平衡
- 基础维护可行：`basic_food` 6 金币（+30 饥饿）每天约需 2-3 次 ≈ 12-18 金币/天
- 高级物品需要储蓄：`organic_food` 60 金币、`puzzle` 90 金币
- 无 streak 约 4h 专注 ≈ 170 金币/天，可维持基础 + 偶尔购买玩具

### 限制
- `startOnBoot` 设置 UI 保存但未接入系统开机启动（需 `app.setLoginItemSettings`）
- 对话气泡使用硬编码逻辑，`DialogueRule[]` 类型已定义但未数据化
- 无音效系统
- 英文翻译部分仍不完整
- 未测试 electron-builder 打包
- 商品 `unlockCondition` 未实现（所有物品立即可买）
- 多宠物 UI 未实现（`pets[]` 是数组但只展示 `activePetId`）

---

## 六、待完成 / 剩余事项

### 高优先级 🔴

| # | 任务 | 说明 |
|---|------|------|
| 1 | **端到端手动验证** | 完整流程：商店购买 → 桌面右键投喂 → 两窗口实时刷新。确保购买-使用-同步链路无 bug |
| 2 | **存档迁移版本升级** | 已有用户旧存档可能缺新增字段（`timestamps.lastTickAt`、`inventory.items`、`focus.history` 数组格式等），`storage.ts` 的 `SAVE_VERSION` 迁移函数需补全 |
| 3 | **存档同步冲突策略** | 当前多窗口同时 `updateSave` 时是整份 save 覆盖（last-write-wins），后续应做局部 action 或版本号/乐观锁冲突处理 |
| 4 | **专注计时鲁棒性** | 窗口刷新/重启后 `activeSession` 剩余时间应根据 `startedAt`/`pausedAt` 计算，不能只依赖 React state（刷新即丢失） |
| 5 | **商店/背包/设置 UX 手测** | 边界状态：金币不足购买提示、背包空时右键喂食提示、物品使用后库存归零、语言切换完整性 |

### 中优先级 🟡

| # | 任务 | 说明 |
|---|------|------|
| 6 | **对话规则数据化** | 将 `DialogueBubble` 硬编码逻辑迁移为 `DialogueRule[]` 配置驱动，方便调整和扩展 |
| 7 | **商品解锁条件** | `unlockCondition` 字段接入：按成长阶段/连续天数/亲密度等限制购买 |
| 8 | **宠物购买与切换** | `pets[]` 数组已有，需 UI：购买新宠物、切换 `activePetId`、查看宠物列表 |
| 9 | **装扮系统** | `PetInstance.currentOutfitIds` 字段已预留，需 UI + 素材 pipeline |
| 10 | **宠物多阶段素材及透明素材处理** | 补充 baby/child/adult 各阶段所有状态视频，建透明 webm 处理 pipeline |
| 11 | **经济平衡继续调参** | 根据实际使用数据调整物品价格/效果/衰减率，增加金币出口（如装扮/稀有宠物） |
| 12 | **单元测试** | 为核心纯函数（`petState.ts`、`focus.ts`、`inventory.ts`、`lifecycle.ts`、`defaults.ts`）补充测试 |
| 13 | **设置开机启动真实接入** | `startOnBoot` 设置联动 `app.setLoginItemSettings` |
| 14 | **英文翻译完整性** | `types.ts` 有 `*En` 字段但多处 UI 仍只能显示中文 |

### 远期规划 🔵

| 版本 | 内容 |
|------|------|
| **V0.3** | 宠物收集和成长闭环：多宠物购买/切换、宠物进化视觉效果、宠物图鉴 |
| **V0.4** | 素材/装扮/声音：全阶段素材、装扮系统、音效反馈、主题切换 |
| **V0.5** | WebView 学习行为跟踪：浏览器活动监控/学习网站检测/自动计时 |
| **V1.0** | 可插拔 AI 对话后端：LLM 驱动对话、宠物个性记忆、学习建议 |

---

## 七、关键文件路径速查

```
D:\78119\claude\desktop-pet-study-companion\
├── AGENTS.md                       # 主代理行为规则（新会话入口）
├── CLAUDE.md                       # Worker 行为约束
├── PROJECT_STATUS.md               # ← 当前文件（项目记忆入口）
├── package.json
├── electron.vite.config.ts
├── tsconfig.json / tsconfig.node.json / tsconfig.web.json
├── docs/
│   └── AI_COLLABORATION_WORKFLOW.md # 工作流定义
├── scripts/
│   ├── claude-worker.cmd           # Worker 启动包装器（推荐）
│   └── claude-worker.ps1
├── assets/
│   └── pets/cat/baby/              # idle.mp4 + playing.mp4 + sad.mp4
└── src/
    ├── main/
    │   ├── index.ts                # ← 主进程（窗口/托盘/IPC/tick/生命周期）
    │   └── storage.ts              # ← 存档读写 + 版本迁移
    ├── preload/
    │   └── index.ts                # ← IPC 桥接（petApi）
    ├── renderer/
    │   ├── App.tsx                 # ← React 入口（hash 路由 + 存档同步）
    │   ├── routes/
    │   │   ├── PetWindow.tsx       # 宠物主窗口
    │   │   └── ControlPanel.tsx    # 控制面板（5 标签页）
    │   └── components/
    │       ├── PetSprite.tsx       # 视频播放
    │       ├── DialogueBubble.tsx  # 对话气泡
    │       ├── StatusPanel.tsx     # 状态面板
    │       ├── FocusTimer.tsx      # 专注计时器
    │       ├── QuickMenu.tsx       # 右键菜单 + JS 拖动
    │       ├── ShopPanel.tsx       # 商店面板
    │       ├── InventoryPanel.tsx  # 背包面板
    │       └── SettingsPanel.tsx   # 设置面板
    └── shared/
        ├── types.ts                # ← 所有类型定义
        ├── constants.ts            # ← 游戏数值常量
        ├── defaults.ts             # ← 默认存档工厂
        ├── data/
        │   ├── species.ts          # 14 种宠物配置
        │   ├── personalities.ts    # 5 种性格配置
        │   └── items.ts            # 12 种物品目录
        └── game/
            ├── petState.ts         # 互动纯函数 + 时间衰减
            ├── petFactory.ts       # 宠物创建工厂
            ├── focus.ts            # 专注奖励分段计算
            ├── inventory.ts        # 商店/背包纯函数
            └── lifecycle.ts        # 每日重置/连续天数/成长/离线
```

---

## 八、快速启动

```powershell
cd D:\78119\claude\desktop-pet-study-companion
npm.cmd install    # 已安装
npm.cmd run dev    # 开发模式（Electron + Vite HMR，打开透明宠物窗口）
```

开发模式会打开透明宠物窗口，控制面板通过**托盘右键 → 打开控制面板**进入。

**构建验证（worker 任务完成后必须执行）：**

```powershell
npm.cmd run build
```

> ⚠ PowerShell `npm.ps1` 可能被 ExecutionPolicy 拦截，统一用 `npm.cmd`。
