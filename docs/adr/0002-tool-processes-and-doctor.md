# 0002: Tool processes and doctor probes

## Status

Accepted. Records existing behaviour.

## Context

Tools share a launcher but differ in setup consent, parent-process tracking and runtime requirements.

## Decision

- `src/tools.mjs` `toolEnvironment` gives Import a Studio-only launcher for verification and removes inherited `PRAXITY_PARENT_PID`. Parent identity describes one direct spawn, not an inherited chain.

- `executeTool` uses IPC EOF for Node Studio and a per-spawn PID for executable Studio. Executable bootstraps must consume and delete that PID before command imports or descendant creation.

- `executeTool` detaches ordinary POSIX tools into a new session so terminal Ctrl+C and Ctrl+\ reach the launcher, which forwards each once. Studio begins shutdown on its first signal and can die on a second. Ctrl+Z suspends the launcher while the tool continues. Setup retains the terminal for consent, so SIGINT and SIGQUIT are not forwarded again. Windows has neither POSIX session behaviour.

- `executeTool` removes forwarding listeners on child exit, even if a grandchild holds output open. There is then no tool left to signal. Signal termination returns 128 plus the signal number, matching shell status conventions.

- `src/doctor.mjs` `doctor` treats an unusable system Java, including the macOS stub, as missing rather than broken pack storage. Managed setup takes precedence over that copy. Check without its browser audits no HTML and exits 2; its html setup selector installs the browser. Import supplies a synthetic SCORM package for its probe.

- `doctor` reports a missing or shadowed absolute PATH entry without editing profiles. T3 actions already use a full launcher path, while typed commands use the first executable on PATH. Relative entries depend on the current directory and cannot establish a reliable installation.

- `src/update.mjs` `assertStudioClosed` refuses a running Studio instead of signalling it, because Studio cannot certify that browser text is saved. `refreshInstalledSkills` gives local installs and updates the same project discovery and recovery instructions.

Sources: [src/tools.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/tools.mjs), [src/doctor.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/doctor.mjs), [src/update.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/update.mjs), [test/launcher-signals.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/launcher-signals.test.mjs), [test/launcher-ipc.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/launcher-ipc.test.mjs), [test/doctor.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/doctor.test.mjs). These are the implementation and test records before comment removal.

## Consequences

Launcher changes must preserve single signal delivery and setup interaction. Updating requires the user to save and close Studio first.
