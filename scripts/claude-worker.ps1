<#
.SYNOPSIS
  启动一个 Claude Code CLI worker 执行指定任务。

.DESCRIPTION
  在项目根目录下执行 claude -p 命令，使用 deepseek-v4-pro 模型和 max effort。
  使用 npm.cmd（而非 npm.ps1）以避免 PowerShell ExecutionPolicy 问题。

.PARAMETER Prompt
  必填。发送给 Claude Code worker 的任务描述。

.PARAMETER Name
  可选。任务的简短标签，用于日志标识。

.PARAMETER Bare
  可选开关。启用 --bare 模式，跳过 hooks/LSP/plugin sync/auto-memory/CLAUDE.md auto-discovery。
  默认不使用，因为 bare 模式会丢失自动项目记忆、插件同步、hooks 等功能，且认证方式可能受影响。
  仅在任务 prompt 已包含完整上下文、且本机认证支持时使用。

.EXAMPLE
  .\scripts\claude-worker.ps1 -Name "fix-types" -Prompt "修复 src/shared/types.ts 中的类型错误"

.EXAMPLE
  .\scripts\claude-worker.ps1 -Prompt "在 src/renderer/components/FocusTimer.tsx 中添加暂停动画"

.EXAMPLE
  .\scripts\claude-worker.ps1 -Name "quick-fix" -Prompt "修复 XXX" -Bare
#>

param(
    [Parameter(Mandatory = $true, HelpMessage = "任务描述")]
    [string]$Prompt,

    [Parameter(Mandatory = $false)]
    [string]$Name = "task",

    [Parameter(Mandatory = $false)]
    [switch]$Bare
)

# 切换到项目根目录
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Push-Location $ProjectRoot

$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[$Timestamp] 启动 Claude Code Worker: $Name" -ForegroundColor Cyan
Write-Host "项目目录: $ProjectRoot" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 构建 claude 命令参数
# 说明：
# - --exclude-dynamic-system-prompt-sections：精简系统提示中的动态段，提高 prompt cache 命中率。
#   这是低风险默认策略——不删除 hooks/LSP/plugin sync/auto-memory/CLAUDE.md auto-discovery，
#   只排除每次可能变化的动态内容（如会话状态、系统信息等）。
# - --bare：高压缩策略，跳过 hooks/LSP/plugin sync/auto-memory/CLAUDE.md auto-discovery。
#   默认不使用，因为它会丢失自动项目记忆、插件同步、hooks 等功能，且认证方式可能受影响。
#   仅在任务 prompt 已包含完整上下文（文件范围、项目约束、验证步骤）、且本机认证支持时使用。
# - 使用 claude（非交互模式）
# - npm 命令在 task prompt 中应写为 npm.cmd（Windows 兼容）
# - --allowedTools 中不包含破坏性工具（如 NotebookEdit、Task* 等）
# - --permission-mode bypassPermissions 跳过交互确认（worker 模式下无需人工审批）

$ClaudeArgs = @(
    "-p", $Prompt,
    "--model", "deepseek-v4-pro",
    "--effort", "max",
    "--exclude-dynamic-system-prompt-sections",
    "--permission-mode", "bypassPermissions",
    "--allowedTools", "Read,Edit,MultiEdit,Write,Grep,Glob,Bash"
)

if ($Bare) {
    $ClaudeArgs += "--bare"
    Write-Host "[Bare 模式] 跳过 hooks/LSP/plugin sync/auto-memory/CLAUDE.md auto-discovery" -ForegroundColor Yellow
}

claude @ClaudeArgs

$ExitCode = $LASTEXITCODE

$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
if ($ExitCode -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "[$Timestamp] Worker '$Name' 完成 (exit 0)" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "[$Timestamp] Worker '$Name' 失败 (exit $ExitCode)" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
}

Pop-Location
exit $ExitCode
