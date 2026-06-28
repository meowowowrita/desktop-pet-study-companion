# AI 协作工作流规范 — Source of Truth

> **最后更新：** 2026-06-28
> **用途：** 本项目 AI 协作的权威文档。任何主代理（Codex / Claude Code / 其他 AI）处理本项目时，必须首先阅读本文件。

---

## 一、项目路径与常用命令

| 项目 | 值 |
|------|-----|
| **项目根目录** | `D:\78119\claude\desktop-pet-study-companion\` |
| **技术栈** | Electron 33 + electron-vite + React 18 + TypeScript 5.7 + Zustand 5 |
| **构建** | `npm.cmd run build`（调用 `electron-vite build`） |
| **开发模式** | `Start-Process npm.cmd -ArgumentList "run","dev"`（常驻进程，不要用短 timeout 前台命令判断失败） |
| **打包** | `npm.cmd run package`（调用 `electron-builder`） |
| **包管理器** | npm（Windows 下使用 `npm.cmd` 而非 `npm.ps1`） |

---

## 二、Windows 注意事项

1. **始终使用 `npm.cmd`**，而不是 `npm` 或 `npm.ps1`。
   - PowerShell 的 `ExecutionPolicy` 可能拦截 `.ps1` 脚本，`npm.cmd` 不受影响。
   - 同理，`scripts\claude-worker.ps1` 可能被 ExecutionPolicy 拦截。优先使用 `scripts\claude-worker.cmd`（cmd 包装器，内部用 `powershell.exe -NoProfile -ExecutionPolicy Bypass -File` 调用 `.ps1`），或手动执行 `powershell -ExecutionPolicy Bypass -File scripts\claude-worker.ps1`。
2. **开发模式 (`npm run dev`) 是常驻进程**（Electron + Vite HMR）。
   - 不要用 `timeout` / `sleep` 加前台命令判断启动成败。
   - 使用 `Start-Process` 后台启动，通过检查窗口/TCP 端口验证是否运行。
3. **路径分隔符**：在 Git Bash 或 PowerShell 中可使用 `/`，但原生 cmd 需要 `\`。
4. **不能依赖外部全局记忆**——稳定性来自项目内文档和脚本（本文件、`PROJECT_STATUS.md`、`AGENTS.md`、`CLAUDE.md`）。

---

## 三、固定工作流

### 第 1 步：上下文加载（Codex / 主代理）

主代理会话启动后，必须先加载以下文档和关键源码：

1. **`docs/AI_COLLABORATION_WORKFLOW.md`** ← 本文件（工作流定义）
2. **`PROJECT_STATUS.md`** ← 项目进度、已完成/待完成功能、关键文件路径
3. **`AGENTS.md`** ← 主代理行为规则
4. **`CLAUDE.md`** ← Worker 记忆，了解被调用方的约束
5. **关键源码**（按需）：`src/shared/types.ts`、`src/shared/constants.ts`、`src/shared/defaults.ts`

### 第 2 步：需求澄清与计划（Codex / 主代理）

- Codex（或当前主代理）负责：
  - 澄清用户需求，确认范围
  - 分析现有代码结构，识别影响面
  - 制定实现计划，**拆分任务**
  - 为每个任务定义：
    - 写入文件范围（不重叠）
    - 验收标准
    - 依赖关系
  - 识别冲突风险，规划合并顺序

### 第 3 步：委托实现（Claude Code CLI Worker）

每个独立的实现任务通过 Claude Code CLI 执行：

```powershell
claude -p "<详细任务描述>" `
  --model deepseek-v4-pro `
  --effort max `
  --exclude-dynamic-system-prompt-sections `
  --permission-mode bypassPermissions `
  --allowedTools Read,Edit,MultiEdit,Write,Grep,Glob,Bash
```

> **说明：** `--exclude-dynamic-system-prompt-sections` 精简系统提示中的动态段，提高 Claude Code prompt cache 命中率，同时保留 hooks/LSP/plugin sync/auto-memory/CLAUDE.md 等核心功能。详见「六、Prompt cache / 系统提示精简策略」。

**并行规则：**
- 可以同时启动多个 Claude Code 进程执行不重叠的任务。
- **每个任务必须有明确的、不与他人重叠的写入文件范围。**
- 在任务 prompt 中必须明确列出允许修改的文件。

### 第 4 步：Worker 约束（写入每个任务的 prompt）

每个委托给 Claude Code worker 的任务 prompt 必须包含：

```
约束（必须遵守）：
- 你只能修改以下文件：[列出具体文件路径]
- 不要回滚或覆盖他人的改动
- 完成后运行 npm.cmd run build 验证
- 报告：修改了哪些文件、构建是否通过
```

或者使用 helper 脚本快捷调用。优先使用 `.cmd` 包装器（不受 PowerShell 执行策略影响），必要时再用 `powershell -ExecutionPolicy Bypass -File` 运行 `.ps1`：

```cmd
REM 推荐：cmd 包装器，不受 ExecutionPolicy 限制
.\scripts\claude-worker.cmd -Name "feature-xyz" -Prompt "实现 XXX 功能..."

REM 备选：手动绕过 ExecutionPolicy 执行 .ps1
powershell -ExecutionPolicy Bypass -File .\scripts\claude-worker.ps1 -Name "feature-xyz" -Prompt "实现 XXX 功能..."

REM 高压缩：bare 模式（仅任务 prompt 已含完整上下文时使用）
.\scripts\claude-worker.cmd -Name "quick-fix" -Prompt "实现 XXX 功能..." -Bare
```

### 第 5 步：审查与整合（Codex / 主代理）

所有 worker 完成后，主代理必须：

1. **Review diff**：逐文件审查变更
2. **冲突解决**：合并各 worker 的改动，解决冲突
3. **完整性检查**：确认所有计划任务完成
4. **最终构建验证**：运行 `npm.cmd run build`，确保通过
5. **功能验证**（可选）：运行 `npm.cmd run dev` 手动验证 UI

---

## 四、角色分工

| 角色 | 职责 | 工具 |
|------|------|------|
| **Codex / 主代理** | 需求澄清、架构设计、任务拆分、冲突控制、最终审查与验证 | 交互式会话 |
| **Claude Code Worker** | 单任务实现：读取 → 编辑 → 构建验证 → 报告 | CLI 非交互模式 |
| **用户** | 决策、明确需求、手动功能验证 | 任意 |

---

## 五、任务拆分原则

1. **写入不重叠**：任意两个并行任务的允许写入文件集合互不相交。
2. **依赖最小化**：优先设计可并行执行的任务。
3. **每个任务可独立验证**：Worker 完成后能跑 `npm.cmd run build` 并得到通过/失败结论。
4. **任务粒度**：以"一个 Worker 可在 5-15 分钟内完成"为准。

---

## 六、Prompt cache / 系统提示精简策略

### 背景

Claude Code 在每次 CLI 调用时都会注入一个**默认系统提示**（system prompt），其中包含工具定义、行为规范、环境信息等。这个系统提示不是只有你的任务 prompt——系统提示中有一部分是**静态的**（可被 prompt cache 命中），另一部分是**动态的**（每次调用可能不同，导致 cache miss）。

提高 prompt cache 命中率可以：
- 降低 token 消耗（缓存命中的 token 价格低至 1/10）
- 减少首 token 延迟

### 低风险默认策略（已启用）

Worker 脚本 `scripts/claude-worker.ps1` **默认**使用 `--exclude-dynamic-system-prompt-sections`：

- **作用：** 排除系统提示中的动态段（如会话 ID、时间戳、系统状态快照等），保留静态核心（工具定义、行为规范、CLAUDE.md 等）。
- **风险：极低。** 不删除 hooks、LSP、plugin sync、auto-memory、CLAUDE.md auto-discovery 等核心功能。
- **配合措施：**
  - 保持 CLI 参数稳定（model、effort、allowedTools 不变）——不要在每次调用时微调参数。
  - 任务 prompt 模板稳定——相同类型的任务使用一致的 prompt 结构（只是具体文件名/功能名变化）。
  - 避免使用 `--append-system-prompt` 或其他会动态修改系统提示的参数。

### 高压缩策略（可选 `--bare`）

Worker 脚本支持 `-Bare` 开关，在命令行追加 `--bare` 参数：

```cmd
.\scripts\claude-worker.cmd -Name "quick-fix" -Prompt "..." -Bare
```

- **作用：** 跳过 hooks、LSP、plugin sync、auto-memory、CLAUDE.md auto-discovery，进一步精简上下文。
- **风险：较高。** Bare 模式会：
  - 丢失项目的 CLAUDE.md 自动发现和注入，worker 无法获取项目记忆。
  - 跳过 hooks（如 SessionStart 钩子），可能影响某些自动化流程。
  - 跳过 plugin sync，插件功能不可用。
  - 认证方式可能受影响（取决于本地认证配置）。
- **使用条件：** 仅在以下条件**同时满足**时使用：
  1. 任务 prompt 中已显式包含完整的上下文（项目结构、文件范围、构建命令、行为约束）。
  2. 本机认证机制支持 bare 模式。
  3. 任务不需要 hooks、插件、或自动记忆功能。
- **默认不使用** `--bare`。

### 不要用 --system-prompt 替换默认系统提示

除非在明确做实验，否则**不要使用 `--system-prompt` 参数**替换 Claude Code 的默认系统提示。默认系统提示包含精确的工具定义和行为规范，替换它可能破坏工具调用格式、编码风格和其他核心行为。

---

## 七、文件引用

- 项目状态：`PROJECT_STATUS.md`
- 主代理规则：`AGENTS.md`
- Worker 记忆：`CLAUDE.md`
- Worker 脚本：`scripts/claude-worker.cmd`（推荐）、`scripts/claude-worker.ps1`

---

## 八、版本历史

| 日期 | 变更 |
|------|------|
| 2026-06-28 | 初始版本：固定工作流定义、Windows 注意事项、角色分工 |
| 2026-06-28 | 新增「六、Prompt cache / 系统提示精简策略」；默认命令增加 `--exclude-dynamic-system-prompt-sections`；文档化 `-Bare` 选项 |
