# 0003: Project actions and host storage

## Status

Accepted. Records existing behaviour.

## Context

Initialization writes author-owned project files and a shared port registry. Doctor may inspect an optional T3 installation without repairing it.

## Decision

- `src/init.mjs` `courseActions` calls the launcher through its home-relative path because T3 login shells may not yet have the launcher on PATH. `merge` recognizes commands, not just familiar action names, before replacing them.

- `vscodeAt` refuses automatic rewrites that would lose duplicate keys, numeric precision, property order, JSONC or noncanonical value spellings. It supplies manual instructions instead. `mergeVscode` reserves additions first and claims them only after the exact intended bytes are present, so interrupted init cannot adopt author-owned settings.

- `initCourse` checks the script limit before creating private state and checks the registry again after locking. It durably reserves the port before writing project actions, so retries reuse it and other courses cannot claim it. `acquireLock` removes only a recognized dead owner's lock; its durable reservation remains reusable.

- `src/t3-actions.mjs` `optionalJson` treats missing, malformed or unreadable T3 files as optional diagnostic inputs. `projectFolders` copies bounded database and WAL files without a live connection or locks on host storage. It rejects observed version changes and journals during copying; SQLite rebuilds the WAL index in the private snapshot and reads through the last valid commit frame. Sources: SQLite [WAL-mode File Format, section 3, Recovery](https://sqlite.org/walformat.html#recovery), and [Write-Ahead Logging, section 2.2, Concurrency](https://sqlite.org/wal.html#concurrency). Rubato tests "doctor leaves the whole live WAL directory unchanged with T3 open" and "doctor leaves the whole live WAL directory unchanged with T3 closed" pin the copied-data and unchanged-source behaviour.

- `actionFields` compares imported fields with defaults, ignoring generated IDs and JSON property order. The recorded import behaviour is that T3 materializes these storage differences, so byte equality would report false changes. Rubato test "doctor warns once per project for canonical saved actions, without changing T3 files" exercises the fixture representation; it does not independently verify T3's importer.

  Evidence: the code comment this replaced (commit d69cdbaf33839355ac1871377cdadaa05d5f2810); not independently verified.

- `test/t3-actions.test.mjs`, test "doctor leaves the whole live WAL directory unchanged with T3 open", skips its uncommitted-write comparison on Windows. The deleted comment attributes the exception to Windows write transactions locking SHM bytes. SQLite's [WAL-mode File Format, section 2.1.3, WAL Locks](https://sqlite.org/walformat.html#wal_locks) documents WAL locking, but does not establish that Rubato's whole-file comparison fails on Windows. Committed open-connection cases still compare every live file on every platform.

  Evidence: the code comment this replaced (commit d69cdbaf33839355ac1871377cdadaa05d5f2810); not independently verified. No Windows reproduction was run in this documentation-only change.

Sources: [src/init.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/init.mjs), [src/t3-actions.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/t3-actions.mjs), [test/init-vscode.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/init-vscode.test.mjs), [test/init-actions.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/init-actions.test.mjs), [test/t3-actions.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/t3-actions.test.mjs). These are the implementation and test records before comment removal.

## Consequences

Recovery must preserve author settings and reservations. Host diagnostics remain optional and read-only.
