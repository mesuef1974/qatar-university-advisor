# Railway MCP — Integration Guide

Project-scoped MCP server config that lets Claude Code talk to Railway
(projects, services, databases, live logs) via natural language.

Scope: scaffold only. Not wired to production deployment. Intended for
auxiliary services (databases, background workers) if/when we adopt them.

## Prerequisites

- Node.js 20+ (for `npx`)
- A Railway account token: <https://railway.com/account/tokens>

## Setup

1. Create a Railway API token in the Railway dashboard (least-privilege scope).
2. Export it in your shell environment (do **not** commit it):

   ```bash
   export RAILWAY_API_TOKEN="rw_live_..."
   ```

   On Windows PowerShell:

   ```powershell
   $env:RAILWAY_API_TOKEN = "rw_live_..."
   ```

3. Start Claude Code from the repo root. It will detect `.mcp.json` and
   prompt you to approve the `railway` server on first launch.
4. Verify the server is live: run `/mcp` inside Claude Code and confirm
   `railway` appears as connected.

## Configuration

See [`.mcp.json`](../.mcp.json) at the repo root. It references
`RAILWAY_API_TOKEN` from your environment — the token is never read
from or written to any file in this repository.

## Security

- `RAILWAY_API_TOKEN` must live in your shell env or a secrets manager — never
  in committed files, `.env` fixtures, or `.claude/settings*.json`.
- Most of `.claude/` is git-ignored (see `.gitignore`): local state such as
  `history.json` and `settings.local.json` must never be committed. Only
  team-shared files (`settings.json`, `launch.json`, `skills/`) are tracked.
- Rotate any token that was previously present in git history.

### Token rotation playbook

If a token was leaked (e.g. pasted into a tracked file):

1. Revoke the token at <https://railway.com/account/tokens>.
2. Create a replacement token and update your local shell env.
3. Verify the new token by asking Claude to list your Railway projects.
4. If the leak is in git history, a history-rewrite (`git filter-repo` or
   BFG) plus a coordinated force-push is required — do **not** attempt
   without team coordination.

## Uninstall

Remove the `railway` entry from `.mcp.json`, or delete the file entirely
if no other MCP servers are configured. Claude Code will stop attempting
to launch it on the next session.

## References

- Railway MCP docs: <https://docs.railway.com/ai/mcp-server>
- Official server: <https://github.com/railwayapp/railway-mcp-server>
- Claude Code MCP docs: <https://code.claude.com/docs/en/mcp>
