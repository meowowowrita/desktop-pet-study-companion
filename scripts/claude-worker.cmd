@echo off
REM Claude Code Worker Wrapper (cmd)
REM 用途：不受 PowerShell ExecutionPolicy 限制，通过 powershell.exe 调用 claude-worker.ps1
REM 用法：claude-worker.cmd -Name "task-label" -Prompt "task description" [-Bare]
REM   -Bare  可选，启用 bare 模式（跳过 hooks/LSP/plugin sync/auto-memory/CLAUDE.md auto-discovery）
REM         仅在任务 prompt 已包含完整上下文时使用
REM 所有参数透传给 claude-worker.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0claude-worker.ps1" %*
