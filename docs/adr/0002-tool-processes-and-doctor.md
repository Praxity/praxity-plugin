# 0002: Tool processes and doctor probes

## Status

Accepted. Records existing behaviour.

## Context

Tools share a launcher but differ in setup consent, parent-process tracking and runtime requirements.

## Decision

- `src/tools.mjs` `toolEnvironment` removes inherited `PRAXITY_PARENT_PID`. Parent identity describes one direct spawn, not an inherited chain.

- `executeTool` uses IPC EOF for Node Studio and a per-spawn PID for executable Studio. Executable bootstraps must consume and delete that PID before command imports or descendant creation.

- `executeTool` detaches ordinary POSIX tools into a new session so terminal Ctrl+C and Ctrl+\ reach the launcher, which forwards each once. The pinned [Studio standalone bootstrap](https://github.com/Praxity/studio/blob/80a3098752a89ebdf729e5418d4e6750aa121de8/apps/desktop/src/main/standalone-cli.ts) uses `stop` to begin shutdown on the first signal and ignore subsequent calls once `exitCode` is set. Rubato's `test/launcher-signals.test.mjs` `studio` fixture deliberately removes its signal listeners on the first signal, making duplicate delivery fatal in the test. Test "Ctrl+C in a terminal reaches Studio once, so it closes cleanly" checks this stricter model; it does not establish that the pinned Studio dies on a second signal. Ctrl+Z suspends the launcher while the tool continues. Setup retains the terminal for consent, so SIGINT and SIGQUIT are not forwarded again. Windows has neither POSIX session behaviour.

- `executeTool` removes forwarding listeners on child exit, even if a grandchild holds output open. There is then no tool left to signal. Signal termination returns 128 plus the signal number, matching shell status conventions.

- `src/doctor.mjs` `doctor` treats an unusable system Java, including the macOS stub, as missing rather than broken pack storage. Managed setup takes precedence over that copy. Check without its browser audits no HTML and exits 2; its html setup selector installs the browser.

- `doctor` reports a missing or shadowed absolute PATH entry without editing profiles. T3 actions already use a full launcher path, while typed commands use the first executable on PATH. Relative entries depend on the current directory and cannot establish a reliable installation.

- `src/update.mjs` `assertStudioClosed` refuses a running Studio instead of signalling it, because Studio cannot certify that browser text is saved. `refreshInstalledSkills` gives local installs and updates the same project discovery and recovery instructions.

Sources: [src/tools.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/tools.mjs), [src/doctor.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/doctor.mjs), [src/update.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/update.mjs), [test/launcher-signals.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/launcher-signals.test.mjs), [test/launcher-ipc.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/launcher-ipc.test.mjs), [test/doctor.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/doctor.test.mjs). These are the implementation and test records before comment removal.

## Release change, 2026-11-21

Import is excluded from Rubato 0.2.0 because it writes grammar 3 while the release's Studio opens grammar 4 only. The launcher rejects `praxity import` through its existing error handler before dispatch, including when older Import files remain installed. Doctor no longer probes Import and tool environments no longer supply its Studio verification launcher. Import can return when it writes grammar 4.

The manifest schema still accepts the Import tool ID for historical packs. Updates install a separate version and refresh managed skills from its manifest; rollback retains the older pack. Running `praxity skills refresh --scope user` afterward restores its managed skills.

## Consequences

Launcher changes must preserve single signal delivery and setup interaction. Updating requires the user to save and close Studio first.
