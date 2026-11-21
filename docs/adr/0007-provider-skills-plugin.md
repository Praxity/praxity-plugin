# 0007: One Praxity plugin for both providers

## Status

Accepted for the plugin distribution slice, 2026-11-21.

## Decision

Both marketplaces install `plugins/praxity/`. That directory is the plugin root:
its portable Agent Plugins `plugin.json` and `.claude-plugin/plugin.json` identify
one `praxity` plugin, versioned independently of the installer pack. Both hosts
scan the same `skills/` directory inside it. The repository-root catalogues are
`.claude-plugin/marketplace.json` and `.agents/plugins/marketplace.json`.
A separate plugin directory prevents Claude's default root `skills/` scan from
loading legacy installer instructions alongside the plugin payload.

Rubato's `skills/` remains canonical for assessment-writing, composer and
studio-editor. Tool-owned skills come from the exact published archives already
pinned in `pack.json`, using each tool's `skillPath`. The generation script verifies
those archive digests and reuses `buildAdapters` to collect every supporting file
without rewriting bytes. Studio supplies prax-format; Check, Trace and Print each
supply their own skill. No new tool source pins or handwritten copies are needed.

The generated payload is checked in so marketplace users need no build step.
The offline test compares Rubato bytes directly, archive definitions with
`pack.json`, and the complete generated file inventory with its SHA-256 lock.
To verify tool bytes independently, regenerate from the digest-verified archives.
The lock is generated provenance, not an independent signature.

Exclude install-praxity from the plugin. It teaches installer maintenance and
would send new plugin users back to an installation method being replaced by npm.
Keep it in the legacy installer until that installer is retired. The plugin's
remaining command references stay unchanged for the later npm slices; therefore
this slice verifies discovery, not the forthcoming npm installation journey.

T3 consumes the selected provider's plugin. There is no T3 plugin adapter.
The legacy `t3` alias in `src/skills.mjs`, installer, runtime downloads, pack and
T3 actions remain unchanged while the owner's installer release is paused.

## Primary documentation

Fetched and read on 2026-11-21:

- https://code.claude.com/docs/en/plugins
- https://code.claude.com/docs/en/plugin-marketplaces
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/plugins/manifest-reference
- https://developers.openai.com/plugins/build/plugins
- https://learn.chatgpt.com/docs/build-skills

Claude documents a `.claude-plugin/plugin.json` manifest, a repository marketplace
catalogue, namespaced skills and CLI validation and installation. Codex documents
root `plugin.json` with the Agent Plugins schema, fixed `skills/` discovery,
repository catalogues and `codex plugin marketplace add` / `codex plugin add`.
Its `.codex-plugin/plugin.json` compatibility fallback is unnecessary here.
Relative catalogue paths resolve from the repository root in both hosts.

## Verification

Use fresh `CLAUDE_CONFIG_DIR` and `CODEX_HOME` directories without copied
credentials. Validate the Claude catalogue and plugin, add this checkout by its
absolute path, install `praxity@praxity`, then inspect `claude plugin details praxity`.
For Codex add this checkout as a marketplace, install `praxity@praxity`, list it
and inspect the installed cache's seven skill folders. These checks need no model
call. Delete both isolated homes afterward. Never use the owner's live agent homes.
