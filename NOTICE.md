# Test fixture provenance

`test/fixtures/skills-rollback-065d777/` contains the exact skills module, schema validator and ownership schema snapshots from the rollback-supported Rubato pack at revision `065d777`. `test/skills-refresh-backup.test.mjs` uses them to verify that the previous pack can read newly written ownership records. These Rubato snapshots retain the repository licence.
