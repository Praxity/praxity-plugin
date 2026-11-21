# 0003: Project actions and host storage

## Status

Accepted. Records existing behaviour.

## Context

Initialization writes author-owned project files and a shared port registry. Doctor may inspect an optional T3 installation without repairing it.

## Decision

- `src/init.mjs` `courseActions` calls the launcher through its home-relative path because T3 login shells may not yet have the launcher on PATH. `merge` recognizes commands, not just familiar action names, before replacing them.

- `vscodeAt` refuses automatic rewrites that would lose duplicate keys, numeric precision, property order, JSONC or noncanonical value spellings. It supplies manual instructions instead. `mergeVscode` reserves additions first and claims them only after the exact intended bytes are present, so interrupted init cannot adopt author-owned settings.

- `initCourse` checks the script limit before creating private state and checks the registry again after locking. It durably reserves the port before writing project actions, so retries reuse it and other courses cannot claim it. `acquireLock` removes only a recognized dead owner's lock; its durable reservation remains reusable.

- `src/t3-actions.mjs` `optionalJson` treats missing, malformed or unreadable T3 files as optional diagnostic inputs. `projectFolders` copies bounded database and WAL files without a live connection or locks on host storage. It rejects observed version changes and journals during copying; SQLite rebuilds a private WAL index and reads committed frames in the copy.

- `actionFields` compares imported fields with defaults, ignoring generated IDs and JSON property order. T3 materializes these storage differences on import, so byte equality would report false changes.

- `test/t3-actions.test.mjs` skips the uncommitted-write comparison on Windows because write transactions lock SHM bytes there. Committed open-connection cases still compare every live file on every platform.

Sources: [src/init.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/init.mjs), [src/t3-actions.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/t3-actions.mjs), [test/init-vscode.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/init-vscode.test.mjs), [test/init-actions.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/init-actions.test.mjs), [test/t3-actions.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/t3-actions.test.mjs). These are the implementation and test records before comment removal.

## Consequences

Recovery must preserve author settings and reservations. Host diagnostics remain optional and read-only.
