# CLAUDE.md — Claude Code Worker 项目记忆

> **目标读者：** 被主代理通过 CLI 调用的 Claude Code worker 实例
> **最后更新：** 2026-06-28

---

## 项目概览

桌面宠物学习陪伴应用（Electron 33 + React 18 + TypeScript 5.7 + Zustand 5）。

- **项目根目录：** `D:\78119\claude\desktop-pet-study-companion\`
- **构建工具：** electron-vite
- **包管理器：** npm（Windows 下使用 `npm.cmd`）

---

## 被调用时的行为规则

### 0. 调用参数注意事项

- 主代理调用 worker 时**默认**携带 `--exclude-dynamic-system-prompt-sections`。这精简了系统提示中的动态段以提高 prompt cache 命中率，但**不影响** hooks、LSP、plugin sync、auto-memory、CLAUDE.md auto-discovery 等核心功能——你仍然可以正常访问这些。
- 如果 worker 被以 `--bare` 模式调用，则 hooks/LSP/plugin sync/auto-memory/CLAUDE.md auto-discovery 均被跳过。**在 bare 模式下，你必须严格依赖任务 prompt 中提供的上下文**——不要假设项目记忆、CLAUDE.md 或其他自动注入的上下文可用。主代理应在任务 prompt 中显式包含所有必要信息（文件范围、项目结构、构建命令、行为约束）。

### 1. 遵守写入范围

主代理会在 prompt 中指定你可以修改的文件。**只修改这些文件**，不要超出范围。

### 2. 不回滚他人改动

- 不要 revert / reset / force-push 任何内容
- 不要删除或覆盖不是你负责的文件
- 如果你的改动需要修改其他文件才能通过构建，**报告给主代理**，不要自行扩展范围

### 3. 构建验证

完成后必须运行：

```powershell
npm.cmd run build
```

如果构建失败：
- 检查是否是你的改动引起的
- 修复问题后重新构建
- 如果问题来自他人的改动或项目原有问题，明确报告给主代理

### 4. 报告

任务完成时报告：
- 修改了哪些文件（完整路径）
- 每个文件做了什么改动（简述）
- `npm.cmd run build` 是否通过
- 遇到的任何问题或风险

---

## 模型与参数

模型和 effort 由主代理通过 CLI 参数指定，**默认约定：**

```
--model deepseek-v4-pro --effort max
```

Worker 不应自行更改模型选择。

---

## 常用命令

```powershell
# 构建（必须验证）
npm.cmd run build

# 开发模式（如需手动验证 UI，向主代理说明原因后使用）
Start-Process npm.cmd -ArgumentList "run","dev"

# TypeScript 类型检查（构建命令已包含，单独运行用）
npx.cmd tsc --noEmit
```

---

## 关键源码速查

| 文件 | 内容 |
|------|------|
| `src/shared/types.ts` | 所有 TS 类型定义 |
| `src/shared/constants.ts` | 游戏数值常量 |
| `src/shared/defaults.ts` | 默认存档工厂 |
| `src/shared/game/petState.ts` | 宠物状态纯函数 |
| `src/shared/game/focus.ts` | 专注奖励计算 |
| `src/main/index.ts` | 主进程入口 |
| `src/main/storage.ts` | 存档读写 |
| `src/preload/index.ts` | IPC 桥接 |
| `src/renderer/App.tsx` | React 入口 |

---

## Windows 注意事项

- 使用 `npm.cmd` 而非 `npm` 或 `npm.ps1`
- PowerShell ExecutionPolicy 可能拦截 `.ps1` 脚本
- 路径分隔符在 Git Bash 中可以用 `/`
