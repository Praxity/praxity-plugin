# 0001: Bootstrap and release integrity

## Status

Accepted. Records existing behaviour.

## Context

The bootstrap must select a trusted runtime before Node validation can run. Published packs must be independently verifiable and recover after interruption.

## Decision

- `install.sh` assigns the canonical home to `INSTALL_HOME` and calls `contained` from `scripts/install-paths.sh` to reject symlink descendants before writes. Its top-level platform-selection branch detects a translated Apple Silicon shell and selects native runtimes, because that shell reports x86_64. Its install plan still verifies the cached Node archive even after bootstrap verification; only duplicate logging is suppressed.

- `src/install.mjs` calls `inspectStage` at the start of its `command === 'finalize'` branch to check artifact ancestors before generated writes. That branch writes wrappers relative to the installed pack, because staging paths disappear after activation; the shared Node also runs Check's compiled entry.

- `src/archive-inventory.mjs` `archiveInventory` hashes gzip members in one pass and uses BSD tar for XZ. This avoids adding an xz executable to bootstrap requirements; the pinned Typst XZ archive is small.

- `src/manifest.mjs` `manifestBumpError` requires a version change whenever manifest content changes. An installed pack rejects different manifest bytes under an existing version, so unchanged versions cannot deliver changed pins.

- `scripts/publish-studio-pack.mjs` `verifyStudioArchive` inventories before tar extraction, admits one fixed root without aliases, and obtains chunk names from the build inventory. Thin canvas requires its complete payload because the previous HTML shell cannot substitute for a partial canvas. Upstream paths are admitted only in the named vendored families with verified third-party inventory provenance.

- `publishStudioPack` in that script leaves historical release URLs intact, uses the current repository for new manifests, and archives only the public install payload. Bootstrap extraction uses a file so tar reaching archive EOF does not close a producer pipe early.

- `githubRelease` in that script checks complete paginated release lists and refuses failed Latest reads. A partial list or authentication failure must not be mistaken for an absent release; this repository already has a stable release.

- `src/update.mjs` `officialReleaseChannel` is fixed in the reviewed bootstrap. `updatePack` reuses archive inventory and admits only regular bootstrap files and directories. `installVerifiedPack` requires caller-authenticated inputs and validates against the verified bootstrap's schema, because the installed schema can predate a new manifest. Reviewed local installs and updates share this activation path.

- `src/cli.mjs` `runCli` rollback and `src/update.mjs` `installVerifiedPack` use no installer timeout. A loaded Mac took 42 seconds in the original implementation record; killing installation midway requires recovery on the next run.

- `try.sh` `main` contains the piped script body in a function and gives children null stdin. A child reading stdin could otherwise consume script text before sh reads it. It allows a Studio trial after an installer doctor failure if the launcher exists, because optional components can fail independently. The session-bearing URL is opened directly and is not included in user-facing output.

Sources: [install.sh](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/install.sh), [src/install.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/install.mjs), [src/archive-inventory.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/archive-inventory.mjs), [src/manifest.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/manifest.mjs), [scripts/publish-studio-pack.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/scripts/publish-studio-pack.mjs), [src/update.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/update.mjs), [src/cli.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/cli.mjs), [try.sh](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/try.sh), [test/publish.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/publish.test.mjs), [test/launcher.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/launcher.test.mjs). These are the implementation and test records before comment removal.

## Consequences

Changes to packaging must preserve containment, verification order and interrupted-install recovery. The bootstrap remains independent of development dependencies.
