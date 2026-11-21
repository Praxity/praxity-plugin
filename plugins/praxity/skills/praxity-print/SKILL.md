---
name: praxity-print
description: Create print-ready PDFs and pocket job aids from Markdown, including checklists, worksheets, assessments and session materials; import DOCX into editable Markdown with Praxity Print.
---

# Print a document

In Rubato, invoke `"$RUBATO_TOOLS_DIR/bin/praxity-print"`. On Windows, use the corresponding `bin\praxity-print.cmd`. Outside Rubato, use `node <package>/src/cli.ts` with Node 24.18 or newer. The package is the parent of this `skill/` directory. Read the installed command's `--help` before choosing flags.

For a procedure, reference aid, checklist, behavior prompt, worksheet, assessment, facilitator run sheet or participant guide, read the matching recipe in [authoring.md](references/authoring.md). Select and adapt source material for the reader's task. Preserve attribution and check the adaptation against its source. Print preserves the supplied content.

## Render and revise

1. Select the exact Markdown file. Keep facilitator notes, image prompts and assessor answers in separate files. Use CommonMark with pipe tables and footnotes. Keep local image paths inside the document directory and give images nonempty alt text. An image title becomes its caption. Links require complete HTTP, HTTPS or mailto targets. Replace embedded HTML with Markdown or a local still image. Code renders without highlighting; task-list syntax, strikethrough and autolink literals are not enabled.
2. Save lasting design choices in `<document-stem>.pdf.json`:

   ```json
   { "layout": "full-page", "paper": "a4", "locale": "en", "bodySizePt": 12 }
   ```

   Print reads the sidecar automatically. `--settings` selects another file. Flags override saved values for that run. Body size supports 12 to 24 points; use bundled fonts and let larger text reflow. The tested language scope is English and Canadian French.
3. Run `praxity-print render handout.md --output handout.pdf` using the invocation above. Use `--layout pocket` for a short 3.5 by 5 inch document. A4 and Letter apply to full-page output. Add `--strict` to fail on parser, writer or compiler warnings. Resolve diagnostics before retrying. Rendering requires host-supplied Typst, found by `--typst <path>`, then `PRAXITY_PRINT_TYPST`, then PATH. On Windows, supply a real `.exe` or `.com`; `.cmd` and `.bat` launchers cannot be used. Print passes its own fonts. The artifact inventory records the tested Typst version.
4. Read JSON diagnostics and artifact paths. The receipt binds source, settings, assets and output hashes. Review external destinations in its `links` inventory separately from embedded `assets`. Inspect retained Typst when diagnosing layout. A failed render keeps the previous PDF; its presence does not prove the new run succeeded.
5. Open the new PDF in an available viewer. Inspect every page for clipping, page breaks, tables, captions and large-text reflow. Edit Markdown or settings, regenerate and reload. PDF edits do not update Markdown.
6. Record findings against the output hash in the receipt. Return the PDF with its editable source, settings and assets. State what remains untested, including physical printing, assistive technology, reader tasks and any pages you did not inspect. Retained run directories contain document content; keep them with the document's private material.

## Print and offline delivery

For paper delivery, read [print-proof.md](references/print-proof.md). Record an actual-size proof and required grayscale or photocopy checks against the final output hash. Mark unavailable checks untested.

Replace essential video or interactive content with an authored still, explanation, transcript or paper task. Keep the printed task usable on its own. Label optional online resources with meaningful link text and a readable address or resource ID. A QR code is an alternate route; include a local QR image only when its purpose and destination are known. Scan the actual print before delivery. Print does not generate QR codes.

The receipt lists external links without downloading their destinations. Include companion files explicitly and test delivery with the network unavailable. Local images and fonts do not prove that linked resources work offline. Record PDF, companion-file and paper checks separately.

## Import Word content

Run `praxity-print import source.docx --output-dir imported` using the invocation above. Choose a new directory. Import uses bundled, patched mammoth 1.13.0 and needs no external executable.

Read mammoth warnings and `missingAltText` in `import-report.json`. Merged cells are flattened, page breaks are lost and bookmark links require editing. Image descriptions become alt text, empty when absent; image titles become captions. Inspect `document.md` and extracted `assets/` against the source before rendering. The import retains `source.docx`. Import preserves editable content, with conversion losses; Word pagination, fonts, headers and page design do not become PDF settings. Failed import removes the new directory and preserves the original DOCX. Keep factual edits reviewable.

## Check the result

When `praxity-check` is present, read its installed `--help` and check the rendered PDF. In Rubato use `"$RUBATO_TOOLS_DIR/bin/praxity-check"`. Read missing-tool diagnostics and incomplete results, and bind findings to the PDF hash. Keep machine checks, visual review, assistive-technology review, physical print and reader-task testing distinct. Tagged output and Typst's PDF/UA mode do not establish accessibility conformance. State which checks and environments remain untested.
