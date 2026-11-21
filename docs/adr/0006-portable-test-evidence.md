# 0006: Portable test evidence

## Status

Accepted. Records existing behaviour.

## Context

Offline tests use native Windows Node with Git Bash fixtures, while production installation targets macOS.

## Decision

- `test/archive-security.test.mjs`, test "XZ archives are verified before extraction with BSD tar inventory", uses native BSD tar for XZ inventory on Windows because GNU tar interprets a drive colon as a remote host.

- `test/installer-fixture.mjs` `installation` adapts filesystem arguments for native Node because MSYS does not reliably convert paths containing apostrophes. It emulates the exact macOS shasum invocation absent from Git Bash. Its Windows ps fixture represents no running pack processes because Git Bash lacks ps -o; the in-use test runs on POSIX.

- `test/install.test.mjs`, test "interrupted install resumes from verified downloads", exports the mock directory into PATH inside Bash rather than assigning a POSIX PATH to the native Windows spawn environment. This avoids Windows PATH conversion changing which curl shim the interruption fixture invokes.

  Evidence: the code comment this replaced (commit d69cdbaf33839355ac1871377cdadaa05d5f2810); not independently verified. The named test exercises interruption injection, not the alternative PATH assignment.

- `test/helpers.mjs` `fixture` resolves canonical paths before assertions because production modules canonicalize their base. On macOS, /var can resolve through /private/var.

- `test/launcher-signals.test.mjs` `launch` launches a foreground-like process group. Its `studio` source fixture removes SIGINT and SIGTERM listeners on the first signal and delays server closure, so a duplicate signal kills the fixture. Test "Ctrl+C in a terminal reaches Studio once, so it closes cleanly" checks single delivery with that stricter model. The pinned [Studio standalone bootstrap](https://github.com/Praxity/studio/blob/80a3098752a89ebdf729e5418d4e6750aa121de8/apps/desktop/src/main/standalone-cli.ts) instead retains listeners and has `stop` ignore later calls once shutdown has started. Listener removal is a fixture choice, not the pinned Studio's current behaviour.

- `test/course-fixture.test.mjs` stores expected payload hashes in `approved`; test "Studio smoke course retains the approved grammar 4 payload" compares the fixture bytes against them. The public [conversion commit `1efd4a3b988ee936e54b57c800871f3185e16e25`](https://github.com/Praxity/rubato/commit/1efd4a3b988ee936e54b57c800871f3185e16e25) installs the reviewed payload and records converter revision `8905c116e2b190f7cb8558266ee6190870f8d82a` and approved `conversion-report.json` SHA-256 `a99dd2394bec80982d14a5787e0a23086fd44bd476ea7ee387a44e5cbde37e1c`. That commit states that all eight installed payload files match the report. Identity and narration stay with the grammar 4 lesson.

Sources: [test/archive-security.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/archive-security.test.mjs), [test/installer-fixture.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/installer-fixture.mjs), [test/helpers.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/helpers.mjs), [test/launcher-signals.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/launcher-signals.test.mjs), [test/course-fixture.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/course-fixture.test.mjs). These are the implementation and test records before comment removal.

## Consequences

Fixture adapters must continue to exercise production ownership and archive checks. Platform-specific omissions must remain explicit in test results.
