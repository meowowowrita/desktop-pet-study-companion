# Task: Control panel UI refresh and pet action switching

Project root: D:\78119\claude\desktop-pet-study-companion

You are a Claude Code CLI worker launched by Codex. Codex is the planner and verifier. Implement only this task and report back clearly.

## Goal

Improve the desktop pet control panel UI so it feels like a polished desktop companion control surface, while matching current features: status, focus timer, shop, inventory, and settings. Also add a practical interaction/action switching layer for the pet sprite so hover/click/drag/menu actions can temporarily override the passive status-driven animation.

## Allowed files

You may edit only these files:

- src/renderer/routes/ControlPanel.tsx
- src/renderer/routes/PetWindow.tsx
- src/renderer/components/PetSprite.tsx
- src/renderer/components/QuickMenu.tsx
- src/renderer/styles.css

If you believe another file is required, stop and report the need instead of editing it.

## Current context

The project already has:

- Electron + React + TypeScript + Vite.
- Control panel route with tabs: status, focus, shop, inventory, settings.
- Pet window route with PetSprite, DialogueBubble, QuickMenu.
- PetSprite currently chooses video state from pet status and falls back to idle/video/emoji.
- Current UI CSS is very plain and partly garbled in comments/text. Do not rewrite app data models.

## Implementation requirements

### 1. Control panel UI

- Redesign ControlPanel layout without changing business logic.
- Add a compact top dashboard/header that shows:
  - app title in current language
  - coin balance
  - active pet name if available
  - today focus minutes and streak if available from save.user
- Keep all existing tabs and child components working.
- Make tab navigation more polished and scannable.
- Use CSS only; do not add new dependencies.
- Keep the UI practical for a desktop control panel, not a marketing landing page.
- Avoid a one-note purple-only palette. Use a balanced palette with neutral surfaces and a few accent colors.
- Ensure text fits and does not overlap at small panel widths.

### 2. Pet action switching

Add a local transient action state in PetWindow and pass it to PetSprite.

Expected behavior:

- Idle/passive animation remains status-driven.
- Hovering the pet can request a temporary `happy` or `talking` style if available.
- Clicking the pet can briefly request `happy`.
- Dragging via the existing pet window area can request `playing` while dragging.
- Quick menu actions should be able to request temporary animation states:
  - feed -> happy or hungry recovery feedback
  - wash/clean -> happy
  - play -> playing
- If the requested video does not exist, PetSprite must gracefully fall back to idle exactly as it does today.
- Keep this as local UI animation state only; do not change shared save schema.

You may adjust QuickMenu props only if the changes are local to the allowed files.

### 3. PetSprite API

- Add an optional prop such as `actionOverride?: string | null`.
- Give action override higher priority than status-driven state.
- Keep fallback behavior robust: requested state -> idle -> emoji fallback.
- Avoid permanent debug text clutter in the pet UI. If helpful, hide it unless the video is unavailable.

## Constraints

- Do not revert or overwrite unrelated changes.
- Do not run git reset, git checkout, force-push, or broad deletion commands.
- Do not edit files outside the allowed list.
- Use npm.cmd, not npm.ps1.
- Keep TypeScript strict enough for the existing build.

## Verification

Run:

```powershell
npm.cmd run build
```

Fix any errors caused by your changes. If build fails due to unrelated pre-existing issues, report that clearly with the exact error.

## Final report format

Return:

- Files changed
- Summary of UI changes
- Summary of action-switching behavior
- Build command result
- Any risks or follow-up items
