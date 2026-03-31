#!/usr/bin/env node
// gsd-hook-version: 1.27.0
// Claude Code Statusline - GSD Edition
// Shows: model | current task | directory | context usage

const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')

// Read JSON from stdin
let input = ''
// Timeout guard: if stdin doesn't close within 3s (e.g. pipe issues on
// Windows/Git Bash), exit silently instead of hanging. See #775.
const stdinTimeout = setTimeout(() => process.exit(0), 3000)
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => (input += chunk))
process.stdin.on('end', () => {
  clearTimeout(stdinTimeout)
  try {
    const data = JSON.parse(input)
    const model = data.model?.display_name || 'Claude'
    const dir = data.workspace?.current_dir || process.cwd()
    const session = data.session_id || ''
    const remaining = data.context_window?.remaining_percentage

    // Context window display (shows USED percentage scaled to usable context)
    // Claude Code reserves ~16.5% for autocompact buffer, so usable context
    // is 83.5% of the total window. We normalize to show 100% at that point.
    const AUTO_COMPACT_BUFFER_PCT = 16.5
    let ctx = ''
    if (remaining != null) {
      // Normalize: subtract buffer from remaining, scale to usable range
      const usableRemaining = Math.max(
        0,
        ((remaining - AUTO_COMPACT_BUFFER_PCT) / (100 - AUTO_COMPACT_BUFFER_PCT)) * 100
      )
      const used = Math.max(0, Math.min(100, Math.round(100 - usableRemaining)))

      // Write context metrics to bridge file for the context-monitor PostToolUse hook.
      // The monitor reads this file to inject agent-facing warnings when context is low.
      if (session) {
        try {
          const bridgePath = path.join(os.tmpdir(), `claude-ctx-${session}.json`)
          const bridgeData = JSON.stringify({
            session_id: session,
            remaining_percentage: remaining,
            used_pct: used,
            timestamp: Math.floor(Date.now() / 1000),
          })
          fs.writeFileSync(bridgePath, bridgeData)
        } catch {
          // Silent fail -- bridge is best-effort, don't break statusline
        }
      }

      // Build progress bar (10 segments)
      const filled = Math.floor(used / 10)
      const bar = '█'.repeat(filled) + '░'.repeat(10 - filled)

      // Color based on usable context thresholds
      if (used < 50) {
        ctx = ` \x1B[32m${bar} ${used}%\x1B[0m`
      } else if (used < 65) {
        ctx = ` \x1B[33m${bar} ${used}%\x1B[0m`
      } else if (used < 80) {
        ctx = ` \x1B[38;5;208m${bar} ${used}%\x1B[0m`
      } else {
        ctx = ` \x1B[5;31m💀 ${bar} ${used}%\x1B[0m`
      }
    }

    // Current task from todos
    let task = ''
    const homeDir = os.homedir()
    // Respect CLAUDE_CONFIG_DIR for custom config directory setups (#870)
    const claudeDir = process.env.CLAUDE_CONFIG_DIR || path.join(homeDir, '.claude')
    const todosDir = path.join(claudeDir, 'todos')
    if (session && fs.existsSync(todosDir)) {
      try {
        const files = fs
          .readdirSync(todosDir)
          .filter((f) => f.startsWith(session) && f.includes('-agent-') && f.endsWith('.json'))
          .map((f) => ({ name: f, mtime: fs.statSync(path.join(todosDir, f)).mtime }))
          .sort((a, b) => b.mtime - a.mtime)

        if (files.length > 0) {
          try {
            const todos = JSON.parse(fs.readFileSync(path.join(todosDir, files[0].name), 'utf8'))
            const inProgress = todos.find((t) => t.status === 'in_progress')
            if (inProgress) task = inProgress.activeForm || ''
          } catch {
            /* ignore */
          }
        }
      } catch {
        // Silently fail on file system errors - don't break statusline
      }
    }

    // GSD update available?
    let gsdUpdate = ''
    const cacheFile = path.join(claudeDir, 'cache', 'gsd-update-check.json')
    if (fs.existsSync(cacheFile)) {
      try {
        const cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
        if (cache.update_available) {
          gsdUpdate = '\x1B[33m⬆ /gsd:update\x1B[0m │ '
        }
        if (cache.stale_hooks && cache.stale_hooks.length > 0) {
          gsdUpdate += '\x1B[31m⚠ stale hooks — run /gsd:update\x1B[0m │ '
        }
      } catch {
        /* ignore */
      }
    }

    // Output
    const dirname = path.basename(dir)
    if (task) {
      process.stdout.write(
        `${gsdUpdate}\x1B[2m${model}\x1B[0m │ \x1B[1m${task}\x1B[0m │ \x1B[2m${dirname}\x1B[0m${ctx}`
      )
    } else {
      process.stdout.write(`${gsdUpdate}\x1B[2m${model}\x1B[0m │ \x1B[2m${dirname}\x1B[0m${ctx}`)
    }
  } catch {
    // Silent fail - don't break statusline on parse errors
  }
})
