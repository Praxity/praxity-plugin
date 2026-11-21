# 0004: Skill ownership and schema validation

## Status

Accepted. Records existing behaviour.

## Context

Skill refresh replaces managed files while retaining local modifications and compatibility with older packs.

## Decision

- `src/skills.mjs` `readDigests` treats digest metadata as optional so an older pack or a fresh baseline can recover. `changeSkills` backs up existing content when older ownership records lack digests.

- `changeSkills` copies and publishes backups under home before claiming names or deleting originals, including across volumes. It invalidates the old digest baseline before replacement so an interrupted install cannot mistake newly saved old bytes for unchanged content. It records names before copying so retries recognize partial installations.

- `src/schema.mjs` `validateSchema` accepts only its implemented keyword vocabulary and throws for unknown keywords. A schema extension must not silently weaken validation.

- `test/skills.test.mjs` `readStudioWorkflow` follows the prax-format skill's identity rule rather than redefining it. `assertCommandProcedures` allows preceding initialization in a prose section but requires code blocks and shell chains to stand alone. `brokenLinks` confines relative links to the same installed skill, because each skill can be installed and loaded independently.

- `comment-baseline.json` excludes `test/fixtures/skills-rollback-065d777/**`. These files are exact historical inputs used to test rollback compatibility, so comment deletion would change the evidence. They are not a source of new production code.

Sources: [src/skills.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/skills.mjs), [src/schema.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/src/schema.mjs), [test/skills-refresh-backup.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/skills-refresh-backup.test.mjs), [test/skills.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/skills.test.mjs). These are the implementation and test records before comment removal.

## Consequences

Historical rollback snapshots keep their original bytes. Changed skills require regeneration and review of the adapter hashes. Concurrent-edit replacement remains a separate known limitation.
