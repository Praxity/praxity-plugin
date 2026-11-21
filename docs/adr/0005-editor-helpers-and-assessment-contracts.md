# 0005: Editor helpers and assessment contracts

## Status

Accepted. Records existing behaviour.

## Context

Packaged editor helpers process untrusted annotations. Assessment skills depend on specific Trace output contracts.

## Decision

- `skills/studio-editor/scripts/resolve-annotation.mjs` `resolveAnnotationSelector` stays self-contained so a host can serialize it into the preview main frame. It compares node IDs as attribute data rather than composing selectors from them. Its command entry point emits fixed diagnostics instead of echoing untrusted parser errors or file contents.

- `skills/studio-editor/scripts/run-praxity.mjs` uses its top-level command entry (`try` block) to accept an optional trusted executable path for source CLI wrappers and fixture launchers. Its top-level `catch (error)` handler suppresses parser and spawn detail that could contain untrusted replacement text.

- `test/studio-annotation.test.mjs` `guardedOperations` lists single-node structural operations admitted by Studio's `reference/operations.md`; Studio's `edit-cli.ts` passes the expected revision to each. Structural routing precedes text-field admission because a whole image or note has no text field.

- `test/manifest.test.mjs` `maskedTraceRevisions` admits revisions only after their payload is checked. Trace pull requests 22, 23 and 24 introduced operator review evidence, scored masked results using Studio language provenance, and exclusion accounting. Revision `9036868d4ba3f55aced52077b5b548eb1374ac72` retains that contract with item-cues/14 and masked-only preparation by default (Trace pull request 25). The comment at [Rubato revision `d69cdba`](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/manifest.test.mjs) records why earlier Trace revisions were rejected: `09fcaaf` had no masked probe, `92a164d` held every result, and `97e6de3` made every gate return `tooling`. The test "the pinned Trace ships the masked item-cues contract the assessment skill gates on" still rejects those three revisions explicitly.

- `test/assessment-writing.test.mjs` `assertSolverStrength` retains a minimum masked-solver strength because the recorded evaluation had a Haiku solver pass banks a Sonnet solver failed. `assertLengthAndHeadline` also checks option shape and length: the recorded v2 evaluation had the key as the longest option on 29 of 53 items, usually the headline answer. These are historical reasons for the existing skill checks, not new evaluation results.

Sources: [skills/studio-editor/scripts/resolve-annotation.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/skills/studio-editor/scripts/resolve-annotation.mjs), [skills/studio-editor/scripts/run-praxity.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/skills/studio-editor/scripts/run-praxity.mjs), [test/studio-annotation.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/studio-annotation.test.mjs), [test/manifest.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/manifest.test.mjs), [test/assessment-writing.test.mjs](https://github.com/Praxity/rubato/blob/d69cdbaf33839355ac1871377cdadaa05d5f2810/test/assessment-writing.test.mjs). These are the implementation and test records before comment removal.

## Consequences

Annotation errors must not reproduce untrusted content. Tool pins and assessment wording must retain the tested evidence contract.
