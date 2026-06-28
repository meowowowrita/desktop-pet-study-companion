# AGENTS.md — 主代理行为规则

> **目标读者：** Codex / Claude Code 主代理 / 其他 AI 主代理
> **最后更新：** 2026-06-28

---

## 新会话必须执行

处理本项目的任何新会话，**第一步**必须读取以下文件：

1. `docs/AI_COLLABORATION_WORKFLOW.md` ← 工作流定义（source of truth）
2. `PROJECT_STATUS.md` ← 项目进度、架构、文件路径速查

不要跳过这一步——这些文件是本项目的入口上下文。

---

## Worker 策略

### 默认：使用 Claude Code CLI

实现任务**默认**通过 Claude Code CLI 执行，不使用本代理的子代理功能：

```powershell
claude -p "<任务描述>" --model deepseek-v4-pro --effort max --exclude-dynamic-system-prompt-sections --permission-mode bypassPermissions --allowedTools Read,Edit,MultiEdit,Write,Grep,Glob,Bash
```

或使用项目 helper 脚本（优先用 `.cmd` 包装器，避免 PowerShell 执行策略拦截 `.ps1`）：

```cmd
.\scripts\claude-worker.cmd -Name "<任务简短标签>" -Prompt "<任务描述>"
```

### 例外：用户明确允许的情况

只有在用户**明确**要求使用 Codex 子代理时，才使用本代理的子代理功能。

---

## 主代理职责

1. **需求澄清**：先理解用户要什么，再动手。不确定时主动向用户确认。
2. **计划先行**：分析代码 → 制定计划 → 拆分任务 → 给用户 review → 再委托执行。
3. **任务拆分**：
   - 每个任务有明确的不重叠写入文件范围
   - 每个任务独立可验证（能跑 `npm.cmd run build`）
   - 优先设计可并行的任务
4. **Worker 委托**：每个任务 prompt 必须包含：
   - 允许修改的文件列表
   - "不要回滚他人改动"的约束
   - "完成后运行 npm.cmd run build"的验证要求
5. **审查与整合**：
   - Review 所有 worker 的 diff
   - 解决合并冲突
   - 运行最终 `npm.cmd run build` 验证
6. **报告**：向用户总结做了什么、改了哪些文件、构建结果。

---

## Windows 关键点

- 使用 `npm.cmd`，不要用 `npm` 或 `npm.ps1`
- 开发模式用 `Start-Process npm.cmd -ArgumentList "run","dev"` 后台启动
- 项目根目录：`D:\78119\claude\desktop-pet-study-companion\`

---

## 系统提示注意事项

- **不要用 `--system-prompt` 替换 Claude Code 默认系统提示**，除非你在明确做实验。默认系统提示包含精确的工具定义和行为规范，替换它可能破坏工具调用格式、编码行为和其它核心功能。
- Worker 脚本默认使用 `--exclude-dynamic-system-prompt-sections` 精简动态段以提高 prompt cache 命中率，这是安全策略。

---

## 构建验证

```powershell
npm.cmd run build   # 必须通过
```
