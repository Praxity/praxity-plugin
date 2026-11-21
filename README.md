# Rubato

Rubato installs Praxity's course-building tools on your Mac, and teaches your AI
agent (T3 Code, Claude Code or Codex CLI) how to use them. One install gives you
four tools:

- Studio edits a course in the browser or in T3's preview, and exports it as HTML, PDF or SCORM.
- Check audits an exported course, including for accessibility.
- Trace writes a report on an exported HTML course.
- Print renders Markdown to PDF.

The install also brings its own copies of Node and Typst, the programs the tools
run on, so you don't install those yourself. You get one command, `praxity`,
that runs every tool, plus skills that tell your agent how to use them.

Studio opens courses written in grammar 4, the current version of Praxity's
course file format. The sample course below and any course your agent writes
with Rubato's skills use grammar 4. Studio can't open courses in the older
grammar 3 format, and no converter is available.

What changed in this release: [0.2.0 release notes](docs/release-notes/0.2.0.md).
Earlier notes are in [`docs/release-notes/`](docs/release-notes/).

## Supported hosts and platforms

Rubato 0.2.0 runs on macOS, on Apple Silicon and on Intel Macs. Windows
support is planned for the next release.

| Host | Status |
|---|---|
| T3 Code, Claude Code, Codex CLI | Tested for this release |
| Cursor, VS Code, OpenCode, Cowork | Expected to work, not tested |

## Install Rubato 0.2.0

You need a Mac and the Terminal app. You don't need Node or administrator
rights. Run each block in Terminal.

1. Download the release and its checksum list into a new folder in your home
   folder:

   ```sh
   cd ~
   mkdir rubato-0.2.0 && cd rubato-0.2.0
   base=https://github.com/Praxity/rubato/releases/download/v0.2.0
   curl -fsSLO "$base/rubato-0.2.0.tar.gz"
   curl -fsSLO "$base/SHA256SUMS"
   ```

2. Check the download. The command prints `rubato-0.2.0.tar.gz: OK`:

   ```sh
   grep ' rubato-0.2.0.tar.gz$' SHA256SUMS | shasum -a 256 -c
   ```

   This shows the file arrived intact. To also check that it is the file
   Praxity published, use the [GitHub CLI](https://cli.github.com/):

   ```sh
   gh release verify-asset v0.2.0 rubato-0.2.0.tar.gz -R Praxity/rubato
   ```

3. Unpack it and run the installer:

   ```sh
   tar xzf rubato-0.2.0.tar.gz
   cd rubato
   sh install.sh
   ```

   The installer downloads Node, Typst and the four tools, checks each one,
   then runs `praxity doctor`, a self-test of every tool. It ends with
   `Installed pack 0.2.0.` If it stops with an error instead, see
   [Fix a failed install](#fix-a-failed-install).

   Keep the `~/rubato-0.2.0/rubato` folder. You need it to uninstall Rubato.

4. Make the `praxity` command available in new Terminal windows. macOS uses
   the zsh shell, which reads `~/.zshrc`:

   ```sh
   echo 'export PATH="$HOME/.praxity/bin:$PATH"' >> ~/.zshrc
   ```

   Open a new Terminal window, then check that it works. The command prints the
   installed version:

   ```sh
   praxity version
   ```

   Quit and reopen T3 Code, or start a new Claude Code or Codex session, so it
   sees the command too. Until then, use the full path
   `~/.praxity/bin/praxity`. T3's course actions already use that path.

5. Install the skills for your agent:

   | You use | Run |
   |---|---|
   | Claude Code, or T3 Code with Claude | `praxity skills install --host claude --scope user` |
   | Codex CLI, or T3 Code with Codex | `praxity skills install --host codex --scope user` |

   If you use both, run both. Then start a new session in your agent and check
   that the skills appear (see [Skills](#skills)).

## Open the sample course

Copy the sample course that came with the release, then open it in Studio:

```sh
cp -R ~/rubato-0.2.0/rubato/fixtures/course ~/praxity-sample-course
praxity studio ~/praxity-sample-course
```

Studio opens the course in your default browser, in Read mode. Select
**Edit text** to change text; Enter saves and Escape cancels. To stop Studio,
press Ctrl+C in the Terminal window.

To start your own course, copy the sample course to a new folder, or ask your
agent to write one. Its Studio skill teaches it the course format.

## Everyday commands

Your agent usually runs these for you; the skills tell it how. You can also run
them yourself in a course folder:

| Command | What it does |
|---|---|
| `praxity studio .` | Opens the course in this folder in Studio. |
| `praxity export . --format html --output course-html.zip` | Exports the course as HTML. Use `--format pdf --output course.pdf` for PDF. |
| `praxity check check course-html.zip --checks accessibility` | Runs Check's accessibility audit on the exported course. |
| `praxity doctor` | Tests every tool and tells you how to fix what's wrong. See [Doctor](#doctor). |
| `praxity setup check` | Offers Check's optional downloads, and asks before each one. |
| `praxity version` | Shows the installed Rubato version. |

Trace and Print take more options. Ask your agent to run them, or run
`praxity print --help`. `praxity import` exits with "Import isn't included in
this release."

## Update

1. Save your work in every Studio tab and close the tabs.
2. Stop Studio: stop the Open in Studio action in T3, or press Ctrl+C in the
   Terminal window where Studio runs. Update refuses while Studio is running,
   because it can't tell whether a tab holds unsaved text.
3. Run:

   ```sh
   praxity update
   ```

Update downloads the latest Rubato release from GitHub, checks it, installs it
and runs the doctor. If a download, a check or the doctor fails, your current
version stays active. When the new version is in place, the installer prints
`Installed pack` and the new version number.

Update then refreshes your skills. If only that step fails, the new version
stays active, and the message names the command to run again. Start a new
agent session to pick up changed skills.

Rubato 0.1.1 and earlier don't have `praxity update`. To move from those, follow
[Install Rubato 0.2.0](#install-rubato-020). Your courses and skills stay.

## Course actions in T3 Code

T3 Code can show buttons for a course: Open in Studio, Export HTML, Export PDF,
Check accessibility and Doctor.

1. In Terminal, go to your course folder (the folder with `course.yaml` or
   `.prax` lesson files) and run:

   ```sh
   praxity init
   ```

   This writes the actions into a `t3.json` file in the course folder.
2. In T3, open the project's Actions settings and import the actions from
   `t3.json`.

Export HTML writes `course-html.zip`, and Export PDF writes `course.pdf`.
Run Export HTML before Check accessibility, which checks that file. Open in
Studio shows the editor in T3's preview.

### When an action stops before opening or exporting

Before Open in Studio and the exports run, they set up course identity. Course
identity is the set of IDs Studio gives each lesson and block, stored in the
course's `.praxity/` folder. Published courses use these IDs to keep learners'
saved progress and your review comments attached to the right content.

If a change to the course would replace existing IDs, the action stops and shows
Studio's report, and asks you to ask your agent how to proceed. Replacing IDs is
safe only for a course you haven't published. The actions never replace them
on their own. T3 opens the Studio preview anyway; the terminal shows why
Studio didn't start.

If Studio reports that its port is in use, Studio is probably already running
for this course in another T3 action or Terminal window. Stop it there. To see
what holds the port, run `lsof -nP -iTCP:<port> -sTCP:LISTEN` with the port
number from Studio's message.

### After an update

T3 keeps its own saved copy of imported actions. When Rubato's actions change,
`praxity doctor` warns you. Run `praxity init` in the course again, then in
T3's Actions settings delete each saved Praxity action and import it again from
`t3.json`. `praxity init` keeps actions you added or changed yourself.

`praxity init` also hides Studio's identity and recovery files in VS Code's
file explorer and search, and leaves your own VS Code settings as they are.
Keep the `.praxity/` folder with your course, including in Git.

## Skills

Rubato installs four skills of its own:

- `install-praxity` installs, updates and repairs Rubato.
- `studio-editor` opens and edits courses in Studio.
- [`composer`](skills/composer/SKILL.md) turns a brief into a course outline,
  and coordinates writing and review.
- [`assessment-writing`](skills/assessment-writing/SKILL.md) helps you write
  multiple-choice questions: wrong answers drawn from common misconceptions,
  feedback for each answer, and checks that learners can't pick the right
  answer from clues in the wording.

Each tool adds its own skill as well, such as `prax-format` for Studio's course
format, `praxity-check` and `praxity-trace`, so your agent lists more than
these four.

### Choose host and scope

`--host claude` installs for Claude Code and for T3 Code with Claude.
`--host codex` installs for Codex CLI and for T3 Code with Codex. `--host t3`
is another name for `claude`.

`--scope user` makes the skills available in every project. Use it unless you
have a reason not to. `--scope project` installs them only in the folder where
you run the command, so run it in the project's top folder. One host can't
have Rubato's skills in both scopes at once.

### Check that your agent sees them

- **Claude Code.** Start a new session, type `/` and look for
  `install-praxity` and `studio-editor`, or ask which skills it can see.
  See [Claude Code skill discovery](https://code.claude.com/docs/en/skills).
- **Codex CLI.** Start Codex in the project, run `/skills` or type `$`, and
  look for the four skills above. See
  [Codex skill discovery](https://learn.chatgpt.com/docs/build-skills).
- **T3 Code.** Start a new thread with each provider you use. Type `$` in the
  composer and select `install-praxity` or `studio-editor`. If project skills
  don't show in the picker, use user scope and check again.

Claude skills live in `~/.claude/skills/`, and Codex skills in
`~/.agents/skills/`. With project scope they go in `.claude/skills` or
`.agents/skills` in the project. Rubato never edits host settings, shell
configuration or AGENTS files.

### Your own edits

If you edit one of Rubato's installed skills, Rubato copies your version to
`~/.praxity/skill-backups/` before an update, refresh or uninstall replaces it.
It prints the backup's path. To keep a customised skill, save it under a
different name.

If you copied Rubato's skills into a skills folder by hand, installing stops
because the folders already exist. To let Rubato take them over, list the
differences first, then confirm:

```sh
praxity skills install --host claude --scope user --adopt
praxity skills install --host claude --scope user --adopt --yes
```

Use `--host codex` for Codex. The first command changes nothing; it lists which
files differ. The second backs up your copies, then replaces them.

### Refresh or remove skills

Installing and updating refresh user-scope skills. For project scope, run
`praxity skills refresh --scope project` in the project. If a refresh stops,
run the same command again.

To remove one host's skills, run `praxity skills uninstall --host claude --scope user`
or use `--host codex`. Skills for the other host stay.

## Doctor

Run `praxity doctor` to test the install. It compiles a small document with
Typst, has Studio inspect a small sample course, and runs Check, Trace and
Print on test inputs. Each line shows one check:

```text
<check>: <status> | <what it found> | fix: <what to do>
```

| Status | Meaning |
|---|---|
| `ok` | Works. |
| `failed` | Broken. Run the command after `fix:`. |
| `partial` | Some skills are missing or edited. Run the command after `fix:` to refresh them. |
| `not-installed` | Not set up. For Typst or a tool, run the command after `fix:`. For skills of a host you don't use, or an optional download, you can leave it. |
| `declined` | An optional download you said no to in setup. |

Fix every `failed` line, and any `not-installed` line for Typst or a tool,
before you continue. The doctor doesn't open the
editor or run a full Check audit.

## Fix a failed install

- **Download failed or was interrupted.** Run `sh install.sh` again from
  `~/rubato-0.2.0/rubato`. Downloads that finished and passed their check are
  kept.
- **"Another install is running".** Make sure no other Terminal window is
  running the installer or `praxity update`, then remove the leftover lock and
  run the installer again:

  ```sh
  rmdir ~/.praxity/toolkit/.install.lock
  ```

- **The doctor failed after installing.** The installer puts back the version
  you had before, if any. Fix what the doctor reported, then run the
  installer again.
- **Installed files are damaged.** Go back to the previous version (below), or
  remove Rubato and install again.

## Go back to the previous version

Rubato keeps the version you had before the last update.

1. Save your work in Studio, close its tabs, and stop Studio.
2. Switch back:

   ```sh
   praxity rollback
   ```

3. Put back that version's skills. Run this, and run it with
   `--scope project` in each project where you installed project skills:

   ```sh
   praxity skills refresh --scope user
   ```

4. In each course you use with T3, run `praxity init` again and reimport the
   actions in T3, so they match the older version.

## Remove Rubato

This removes Rubato, its tools and their downloads. Your courses stay where they
are, including each course's `.praxity/` identity folder, `t3.json` and
`.vscode/settings.json`.

1. Save your work in Studio, close its tabs, and stop Studio.
2. Remove the skills from each host you installed them for:

   ```sh
   praxity skills uninstall --host claude --scope user
   praxity skills uninstall --host codex --scope user
   ```

   If you installed project skills, run the same commands with
   `--scope project` in each of those projects. Edited skills are backed up first.
3. Remove Rubato's tools and the `praxity` command. It prints `Rubato removed.`:

   ```sh
   cd ~/rubato-0.2.0/rubato
   sh install.sh uninstall
   ```

   If you deleted that folder, download and unpack the release again, as in
   steps 1 to 3 of [Install](#install-rubato-020), without running the installer.
4. If you ran Check's setup, remove its optional downloads (browser, Java,
   veraPDF):

   ```sh
   rm -rf ~/Library/Application\ Support/Praxity\ Check
   ```

5. Copy any skill edits you want to keep out of `~/.praxity/skill-backups/`.
   The rest of `~/.praxity` holds settings Rubato no longer needs: course port
   numbers, your setup answers and its list of installed skills. Then delete
   the folder:

   ```sh
   rm -rf ~/.praxity
   ```

6. Open `~/.zshrc` in a text editor and delete the line
   `export PATH="$HOME/.praxity/bin:$PATH"`.
7. In T3, delete the saved Praxity actions in each project's Actions settings.

## Known limits

- If other people have user accounts on your Mac, any of those accounts can
  get Studio's editing link while Studio is running, and use it to edit the
  open course. Run Studio only on a Mac whose other accounts you trust. A fix
  is planned for the next release.
- Praxity's tools run on your computer. The agent you use and its model
  provider decide what they collect and send. Studio's editing link can appear
  in your agent's conversation.

## Licences

- Rubato's own scripts, skills and adapters are MIT-licensed (see [`LICENSE`](LICENSE)).
- Studio, Check, Trace and Print keep their own licence, PolyForm
  Perimeter 1.0.1. Each tool's archive holds its licence, Required Notices
  and third-party notices; installing or adapting a tool does not relicense it.
  After install they are under `~/.praxity/toolkit/0.2.0/tools/<tool>/`.
- Node.js and Typst are downloaded from their official releases under their
  own licences, kept in `~/.praxity/toolkit/0.2.0/runtimes/`.
- Typst embeds fonts with their own terms: Libertinus (SIL Open Font Licence),
  New Computer Modern (GUST Font Licence) and DejaVu (Bitstream Vera and Arev).
  Typst's download doesn't include those terms. Read them in the font notice
  shipped with Studio's copy of Typst,
  `~/.praxity/toolkit/0.2.0/tools/studio/typst/FONT-NOTICE`.
- Studio includes DOMPurify, which is offered under MPL-2.0 or Apache-2.0.
  Praxity uses it under Apache-2.0; both licence texts stay in Studio's archive.
- Optional downloads come from their publishers under their own licences, and
  only after you agree. Check's setup can download a headless Chromium,
  FFmpeg (LGPL-2.1 or later), Temurin Java (GPL-2.0 with the Classpath
  Exception) and veraPDF (GPL-3.0 or later, or MPL-2.0 or later). Check's
  `NOTICE.md` lists them.

## Ask your agent to install it

After steps 1 and 2 of [Install](#install-rubato-020), you can paste this into
your agent instead of running the rest yourself:

> Install Rubato from `~/rubato-0.2.0`. Unpack `rubato-0.2.0.tar.gz` there,
> then read `rubato/skills/install-praxity/SKILL.md` and follow it. Before
> downloading anything, show me what it downloads and the licences, and ask
> me. Run only that folder's `install.sh`. Keep the tools' setup questions
> visible to me. Run `praxity doctor`, then install the skills for the agent
> you're running in, at user scope. Don't change my shell configuration or
> AGENTS files; show me the PATH line to add instead.

## Development

Use Node >=24.18 and <25. There are no runtime package dependencies. Run `npm ci` to install the development-only comment checker dependency.

```sh
npm run lint
npm run validate
node --test
```

Offline installer tests use fake archives, temporary homes and a platform
override. On Windows, invoke the checks from PowerShell. Installer subprocesses
use Git Bash. Golden adapter files record
reviewed content hashes. CI runs the offline tests on GitHub-hosted Ubuntu, and the
tests plus a real install in a temporary home on GitHub-hosted Apple Silicon
(`macos-15`) and Intel (`macos-15-intel`) macOS runners.
No self-hosted machine runs code from this public repository's pull requests.

Rubato has no SDK or MCP server. `pack.json` pins every archive by URL and
SHA-256. Rubato calls the installed set of runtimes, tools and skills a pack.

### Install from a main checkout

To install the development version, download this repository, review
`install.sh` and `pack.json`, then run the installer from that folder:

```sh
curl -fsSL https://github.com/Praxity/rubato/archive/refs/heads/main.tar.gz | tar xz
cd rubato-main
sh install.sh
```

The bootstrap needs `curl`, `tar`, `awk`, `mktemp` and `shasum`.
The reviewed checkout supplies the bootstrap and default manifest.
HTTPS manifests must match `--manifest-sha256 <reviewed-sha256>` or the SHA-256 of
that checkout's `pack.json`, checked before Node is selected.
Review local `file:///...` manifests directly; archive hashes check artifact
integrity against that trusted manifest.
Before publishing, run `npm run validate:release`. It refuses unpublished tools
on every platform in `platforms`; regular validation still permits staged packs.

To try the development version on the sample course, one command downloads
Rubato to `~/rubato-main`, installs the pack, runs the doctor and opens Studio's
editor in Safari on a copy of the sample course:

```sh
curl -fsSL https://raw.githubusercontent.com/Praxity/rubato/main/try.sh | sh
```

Read [`try.sh`](try.sh) first if you prefer; it touches only `~/rubato-main`,
`~/.praxity` and `~/praxity-trial-course`. If `~/rubato-main` already exists,
the script stops without changing anything; move or delete that folder and run
it again. It reuses an existing `~/praxity-trial-course`. If the install fails
but an earlier Rubato is installed, it opens Studio from that earlier version.
Press Ctrl+C to stop Studio.

### Build skill adapters

The generator collects Rubato's `skills/` and each installed tool's packaged
skill folder without rewriting them. Each tool owns the skill and references
shipped in its archive.

```sh
node scripts/build-adapters.mjs --output dist/adapters
node scripts/build-adapters.mjs --installed "$HOME/.praxity/toolkit/0.2.0" --output dist/installed-adapters
```

### Launcher

The launcher selects the active pack and uses its private Node. It sets Print's
`PRAXITY_PRINT_TYPST` to an absolute pack path. Studio's
present standalone publisher still needs a supported shared-Typst option.
Node Studio launches receive a private IPC channel so Studio can detect launcher
death during startup. Executable runners receive `PRAXITY_PARENT_PID` with the
launcher's PID instead. Their Studio bootstrap must consume and remove that
variable before loading commands or creating descendants. Older executables
that do not consume it can pass the identity to their descendants. Other tools
receive neither identity; the launcher's environment remains unchanged.

`setup [tool]` delegates to each installed tool's setup with its consent prompts.
For example, `praxity setup check browser` forwards `setup browser` to Check.
It never adds `--yes`. Studio subcommands and their arguments reach Studio
unchanged. Rubato reserves `setup`, `doctor`, `version`, `update`, `rollback`,
`skills`, `init`, `action`, `check`, `trace` and `print`.

`praxity version`, also available as `praxity --version`, reports the active pack and `studioSha`. New releases record
the full tested Studio commit in the Studio tool's optional `sourceRevision` field.
Older packs report the abbreviated SHA in a `-main.<sha>` Studio version, or
`null` when the manifest does not identify one.

### Installation, activation and recovery

The installer owns everything in `~/.praxity/toolkit` and the launcher at
`~/.praxity/bin/praxity`. Keep personal files outside these paths. Complete
SHA-256-verified archives remain in the cache; partial downloads restart.
Each run builds in a fresh temporary directory. On Apple Silicon the installer
chooses native arm64 runtimes, even when launched through Rosetta. Checksum failures publish no
version or launcher. Installed file damage is refused. A different manifest
needs a new pack version. There is no migration of prerelease installs.
Old files `~/.praxity-toolkit-bootstrap.tsv`, `~/.praxity/toolkit/.install-ledger.tsv` and `~/.praxity/toolkit/.bootstrap-*` can be deleted.

Activation writes both version pointers to a temporary file, then renames it to
`active`. If the version check or doctor fails, it restores the previous `active`
with another rename. A failed first activation removes its active pointer and
launcher; the failed pack stays owned for inspection or retry. After an
interruption, rerun install to check the pack again.

Updates retain the previous version. Rollback checks the destination pack and
keeps the outgoing pack, even when its contents are damaged. Rollback and
uninstall do not detect dirty editor sessions. Uninstall removes
`~/.praxity/toolkit` and `~/.praxity/bin/praxity`, including any modified files
inside them. It preserves optional tool components, generated host skills and
other `~/.praxity` data.

### Update channel

`praxity update` follows the official stable channel configured in
`src/update.mjs`, the latest immutable published non-prerelease at `Praxity/rubato`.
It accepts no alternate channel, manifest URL or digest flags. It downloads
`pack.json`, `rubato-<version>.tar.gz` and `SHA256SUMS` from that release,
checks both downloads against the checksum list, checks that the manifest
matches the release tag and bootstrap, then validates against that verified
release's own schema and runs its installer. New manifest fields need not be
known to the installed pack. The GitHub JSON Accept header is sent only to
the metadata API; asset downloads use the server's default representation.
Local fixtures check these headers. The tests include no recorded or live
GitHub asset response. Update sends no signals to Studio or other processes;
a running Studio process is never updated in place.

Using this command trusts GitHub's HTTPS delivery and the people with release
access to `Praxity/rubato` to supply executable bootstrap code and its manifest.
A checksum from the same release checks integrity. It is not an independent
signature and does not protect against a compromised release account.
Manual installation of arbitrary manifests keeps the reviewed digest rules
described under [Install from a main checkout](#install-from-a-main-checkout).

Update also runs the skill refresh at project scope in the nearest parent
directory with a Rubato skills ownership record, including the current
directory. The home directory remains user scope. No ownership record means no
project skills are added.

### Skills ownership

Rubato owns its installed skill folders by name. Install and refresh delete
recorded folders and copy fresh content. Locally edited folders are backed up
under `~/.praxity/skill-backups` first, including added files. Folders installed
before file digests were recorded are backed up on their first refresh.
`praxity skills uninstall` also backs up locally edited recorded folders before removing them.
There is no migration of former plugin layouts or prerelease records.

`.praxity/toolkit-skills.json` records installed hosts and folder names.
The optional `.praxity/toolkit-skills-digests.json` sidecar records packaged
content digests. Missing or unreadable digests cause a backup on the next refresh.
If a file changes during refresh, Rubato stops. Run the command again to restore
any skills already removed. Installing a pack runs
`praxity skills refresh --scope user` for recorded hosts, so new tool skills appear.

Both adapters may coexist in one scope. Installing another adapter retains the
first. A same-host copy in the other scope blocks a competing installation.
An unowned folder with a shipped skill's name blocks install.

`--adopt` alone lists each file as unchanged, changed, existing only or
packaged only and exits nonzero without changing anything. Changed files
include byte counts and short SHA-256 fingerprints. This rule is the same in
terminals and scripts; Rubato never prompts or assumes consent. Confirmed
adoption prints the summary again for every existing folder it will replace or
remove. It separates unowned adoption from owned replacement or removal and
names files that will disappear from the installed folder. It backs up each
unowned folder and any owned folder containing changed or extra files before
replacing them. Backups for both scopes stay under `~/.praxity/skill-backups/`,
outside the project: `user/<host>/` for user scope, `project-<path-hash>/<host>/`
for project scope. Each backup has a timestamp and a unique suffix. Rubato
copies the entire folder and publishes the complete backup before recording
ownership or deleting originals, including when home and project are on
different volumes. Project ownership and installed files stay in the project.
Unowned folders with other names stay untouched. The competing-scope and
path-safety checks still apply.

T3's [Claude provider docs](https://github.com/pingdotgg/t3code/blob/main/docs/user/providers-claude.md)
describe its skill folders; its [Codex provider](https://github.com/pingdotgg/t3code/blob/main/apps/server/src/provider/Layers/CodexProvider.ts)
asks the Codex app server for the project's skill inventory. With a custom
provider home or a remote server, install where that provider runs. Codex also
scans parent folders up to the repository root. File presence in doctor proves
the adapter was copied; verify the inventory and invocation in the host to
confirm runtime discovery.

### T3 actions

Open in Studio and both export actions use `praxity action studio|export <course> [options]`.
This runs Studio's `identity init <course>` for the same course before the
target command. If initialization fails, including pending identity or a need
for `--rederive`, the action stops. The actions never rederive identity
automatically. These actions require a Rubato pack with the `action` command.
If an older pack reports an expected-command error, run `praxity update`.
Init keeps other keys and scripts, including customised commands, and refuses
invalid JSON unchanged.

Init hides `.praxity/`, `.praxity-write-*` recovery copies and
`.praxity-transaction.json` through `.vscode/settings.json`. It preserves
author settings, including explicit `false` values, and reports those
overrides. Settings with comments or values that cannot be safely rewritten
stay unchanged; init prints the entries to add. It records its additions in the
private course registry and never changes Git ignore rules.

Studio keeps a course port in 41700-41999, reserved in
`~/.praxity/toolkit-state/t3-actions.json`. Rerunning init keeps that port and
upgrades recognised actions written by earlier versions.
`praxity doctor` warns when a course's `t3.json` actions differ from the
current generator, and per project when T3's saved Praxity actions differ from
that project's file. Optional settings and project JSON reads are limited to
4 MiB each. It queries the project mapping from a private copy of
`statev2.sqlite` and its committed WAL, with a 128 MiB limit per snapshot file.
It never opens the live database with SQLite. Missing, unreadable, oversize or
changing T3 files and mappings with a rollback journal are skipped.
Generated actions use relative paths and a loopback `/launch` URL, with no tokens
or machine paths. They call the launcher as `"$HOME/.praxity/bin/praxity"`,
which the shell expands on each machine, because T3 runs actions in a login
shell that may not have `~/.praxity/bin` on PATH. Open in Studio passes
`--no-open`, so the editor opens in T3's preview and not in your default
browser. Automatic editor preview needs T3 desktop and Studio's `--port` and
`/launch` support.

### Doctor output

`schemas/doctor.schema.json` defines `praxity doctor --json` output, version 2,
which added `partial`. Each item has an `id`, `status`, `message` and `fix`.
Exit code 1 means at least one failure. Missing tools, unused adapters, partial
adapters and a missing PATH entry do not fail it. Doctor checks the Node pin,
reads Check's own JSON doctor, and has `host.claude` and `host.codex` items for
both scopes. `launcher.path` reports whether the first `praxity` on PATH is the
Rubato launcher. Probes time out after 30 seconds and cap captured output at
1 MiB. Temporary probe documents are removed.

Check currently exposes refusal in setup text rather than persistent doctor
state. Rubato records Check's explicit refusal line from setup run through
`praxity` in `~/.praxity/toolkit-state/declined.json`, outside pack folders.
This per-user state survives updates, rollback and uninstall. It cannot see a refusal from Check run on its own.
A component that works counts as ok, even if you refused it earlier.

### Publish a release

New Studio packs use `scripts/publish-studio-pack.mjs`. Its default is a dry run:

```sh
node scripts/publish-studio-pack.mjs --version 0.2.0 --studio-sha <full-tested-sha> --expect-arm64-sha256 <build-job-digest> --expect-x64-sha256 <build-job-digest> --archives <verified-candidate-folder> --output <new-output-folder> --dry-run
```

The producer workflow admits a green main branch SHA, builds both native Mac archives,
runs the package and browser checks, then tests the packages on hosted ARM64 and
Intel Macs. The publisher independently verifies checksums, the exact payload
inventory, manifest-owned installer paths and skill, legal files, upstream notices
and the tested Studio SHA. Expected archive digests come from the build job's
outputs. Downloads identify the candidate release by its numeric ID. A replaced
archive fails even when its accompanying checksum and inventory agree.
The new manifest records that SHA in the Studio tool's `sourceRevision` field.
Only generated CLI artifacts and the public Rubato installer are released.
The build inventory owns all payload names, including split JavaScript chunks.
The private-path scan covers Praxity-built files and `inventory.json`. Its only
upstream exemptions are `typst/`, `node_modules/`, `licenses/` and
`export-assets/image-codecs/`, and each exempt file must have `third-party`
provenance in the verified inventory. Upstream binaries, wasm and documentation
may embed their authors' build paths. Their file hashes remain verified; the
inventory records dependency versions, licences and notices.

The output contains `pack.json`, `rubato-<version>.tar.gz` and `SHA256SUMS`.
The bootstrap archive contains a `rubato/` directory with the installer and the
same manifest. Release assets also include both Studio archives. Other tool pins
stay on their original releases; new manifests use the current Rubato repository
URL. Existing manifests and releases stay unchanged.

Both modes check that the requested version exceeds Latest and every published
stable release. Dry runs read these release prerequisites without creating a release.
`--publish` creates a fresh draft, uploads this allowlist, downloads and rehashes
the uploaded assets, then publishes last. The publisher reads back the live release
to require immutability and the exact asset digests. A readback mismatch fails
loudly after activation and requires publisher inspection.
It requires a token with Contents write and Administration read on this repository
and refuses an existing release or tag. Enable
[GitHub release immutability](https://docs.github.com/en/rest/repos/repos#check-if-immutable-releases-are-enabled-for-a-repository)
first; the publisher checks it before writing. An upload failure leaves an inactive
draft. Inspect it and choose a new version for the next attempt.

The official release channel is a trust decision in Rubato's publisher and GitHub
account controls. `SHA256SUMS` detects damaged downloads; a checksum delivered by
the same release is not an independent signature.

### Release contract

`schemas/pack.schema.json` owns artifact formats. A published archive needs an
official URL, SHA-256, format and root stripping count. Its entry and notices
paths are relative to the extracted root. The manifest selects Node-script or
executable launchers. Tar archives must not escape their artifact root.
Keep licences, Required Notices, dependencies and inventories in the payload.

The stable update channel requires three release assets: `pack.json`,
`rubato-<version>.tar.gz` and `SHA256SUMS`. The gzip tarball has an enclosing
`rubato/` directory containing the reviewed `install.sh`, `package.json`, `src/`,
`scripts/`, `schemas/`, `skills/`, `fixtures/` and the exact released `pack.json`.
It contains regular files and directories only. The checksum list has one
`<64 lowercase hex digits>  <filename>` line for each of the manifest and
bootstrap, with no duplicate entries for either. Publish all assets together
before marking the release latest; update refuses incomplete releases.

Each release attaches Studio's two archives, `pack.json`, the bootstrap and
`SHA256SUMS`. Check,
Trace and Print archives stay attached to the earlier Rubato release that
first published them, including asset-only prereleases that hold verified tool
archives without a pack manifest. These are byte-for-byte copies of the owning
tools' releases; each pin records the archive's SHA-256 and, where known, its
full source revision. An asset-only release does not update the stable channel
or publish a pack. Check, Trace and Print use the same archives on
Apple Silicon and Intel Macs. Print's asset name keeps `darwin-arm64` for
compatibility; its payload inventory declares it portable. Other platform
entries stay `unpublished`, with the reason recorded beside each.

Published pack manifests retain their original archive URLs. GitHub redirects
those URLs to this repository after the rename.

Node 24.22.1 hashes came from its [signed official checksum list](https://nodejs.org/dist/v24.22.1/SHASUMS256.txt.asc),
verified with release key `5BE8A3F6C8A5C01D106C0AD820B1A390B168D356` listed in
the [Node release instructions](https://github.com/nodejs/node/blob/main/README.md#release-keys).
Typst 0.15.1 hashes came from [official release asset metadata](https://api.github.com/repos/typst/typst/releases/tags/v0.15.1).
`docs/provenance/` preserves the signed Node list, public key and extracted
checksums. Neither origin settles signing, Gatekeeper or clean-Mac acceptance.
