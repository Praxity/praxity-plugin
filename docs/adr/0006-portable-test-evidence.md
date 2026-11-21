# 0006: Portable test evidence

## Status

Accepted. Records existing behaviour.

## Context

Offline tests use native Windows Node with Git Bash fixtures, while production installation targets macOS.

## Decision

- `test/archive-security.test.mjs` uses native BSD tar for XZ inventory on Windows because GNU tar interprets a drive colon as a remote host.

- `test/installer-fixture.mjs` `installation` adapts filesystem arguments for native Node because MSYS does not reliably convert paths containing apostrophes. It emulates the exact macOS shasum invocation absent from Git Bash. Its Windows ps fixture represents no running pack processes because Git Bash lacks ps -o; the in-use test runs on POSIX.

- `test/helpers.mjs` `fixture` resolves canonical paths before assertions because production modules canonicalize their base. On macOS, /var can resolve through /private/var.

- `test/launcher-signals.test.mjs` `launch` launches a foreground-like process group. Its Studio source fixture models Studio beginning shutdown on the first SIGINT or SIGTERM, removing its listeners and taking time to close; a second signal then kills it.

- `test/course-fixture.test.mjs` takes expected converted bytes from the reviewed conversion record independently of the fixture itself. Identity and narration stay with the grammar 4 lesson.

Sources: [test/archive-security.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/archive-security.test.mjs), [test/installer-fixture.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/installer-fixture.mjs), [test/helpers.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/helpers.mjs), [test/launcher-signals.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/launcher-signals.test.mjs), [test/course-fixture.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/course-fixture.test.mjs). These are the implementation and test records before comment removal.

## Consequences

Fixture adapters must continue to exercise production ownership and archive checks. Platform-specific omissions must remain explicit in test results.
