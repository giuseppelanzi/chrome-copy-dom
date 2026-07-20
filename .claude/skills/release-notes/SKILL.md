---
name: release-notes
description: Generate release notes for this Chrome extension from the git diff and commit log since the last GitHub release, show them for review, then publish them as a draft GitHub release on confirmation.
user-invocable: true
context: fork
allowed-tools: Read, Write, Bash(git *), Bash(gh *)
argument-hint: "[previous-version] [new-version]"
---

Recent releases: !`gh release list --limit 10`
Manifest version: !`grep -n version manifest.json`
Recent commits: !`git log --oneline -15`

## Range

Nothing above is pre-computed with the range, because these `!` commands cannot
use command substitution — the permission checker rejects it. Derive the range
first, then run the git commands yourself.

This repo carries **no local tags**: the release tags live only on the remote.
Fetch them before resolving any tag, otherwise `git rev-parse v<version>` fails
on a tag that exists on GitHub:

```
git fetch --tags origin
```

Tags and release titles here both carry a `v` prefix (`v1.0.3`). The version
number itself does not — write `1.0.3` for a version, `v1.0.3` for its tag.

Arguments: $ARGUMENTS

Read that line as two whitespace-separated versions, the previous one then the
new one. Parse it yourself: positional placeholders never reach this skill, and
relying on them makes it fall back to auto-detection silently rather than fail.

When both versions are present, the range is `v<previous>..HEAD` and the version
being released is `<new>`. Confirm the previous one resolves before trusting it,
so a typo fails loudly rather than yielding notes for the wrong range:

```
git rev-parse v<previous>
```

When the arguments line is empty, auto-detect:

- **New version** — read `"version"` from `manifest.json` in the working tree.
  For this extension the manifest is bumped to the version being released, so it
  is the right source. This is the one place this project differs from the usual
  advice to distrust the manifest/package version — here that bump *is* the
  release intent. Still, if the manifest version already matches the latest
  GitHub release, the bump has not happened yet: stop and tell the user, do not
  invent a version.
- **Previous version** — the tag of the latest GitHub release, from the release
  list above (strip the `v`). The range is then `v<previous>..HEAD`.

If the release list is empty (no releases yet), there is no previous tag: use
`HEAD~10..HEAD` and treat the manifest version as the new one.

Then gather the material for the range:

```
git log <range> --oneline
git diff <range> --stat
```

The new version's tag does **not** exist yet — you create it when publishing in
step 3 — so the new side of the range is always `HEAD`, never `v<new>`.

## Step 1 — Write the notes

Work from the commit log and the `--stat` list of changed files. Never dump the
full diff of the range: it is too large and grows with every release. When a
commit message is not enough to tell what changed for the end user, inspect that
one file with `git diff <range> -- <path>` before describing it. Commit messages
in this repo are in Italian — translate their meaning, do not copy them.

Read the template in template.md and follow that format. Categorize into: new
features, improvements, bug fixes, breaking changes. Ignore internal refactoring
not visible to the end user — icon tweaks, file renames, build/tooling changes.
Drop any section with no entries, Migration included.

Always write the notes in English, whatever language the conversation is in.
They are published on GitHub, where the audience is not the maintainer. This
applies to the notes themselves — keep talking to the user in Italian.

Start the body at the first `##` heading, with no title line above it. GitHub
renders the release title over the body already, so an `# ...` heading there
would show up twice.

Save the result to `ReleaseNotes/RELEASE_NOTES_<version>.md`, where `<version>`
is the version being released without the `v` — `ReleaseNotes/RELEASE_NOTES_1.0.4.md`.
The directory is gitignored, so the notes never reach a commit; they live on
GitHub instead. Writing the file creates the directory when it is missing, which
it will be on a fresh clone. The filename carries the version so that writing the
notes of an old release cannot clobber the notes of one still in preparation.

Being gitignored, these files are fair game for `git clean -xfd`. Do not treat
them as durable: publish, or copy the text out.

If that file already exists, do not overwrite it blindly. Read it, show the user
what is already there, and ask whether to replace it or to keep it and write the
new notes to a different name. Their previous draft may hold edits worth keeping.

## Step 2 — Show them and stop

Print the full notes in the reply.

Then run `gh release view v<version>` — a read, and the only `gh` command
allowed in this step besides `gh release list` — to find out what publishing
would actually do, and say which of the three cases applies before asking:

- No release for the tag: a new draft will be created.
- A draft release exists: its notes will be replaced, still a draft.
- A **published** release exists: its notes will be rewritten in public, and the
  release stays published. Show what its current body holds, so the user knows
  what they are about to lose. Never present this case as "publishing a draft" —
  it is not one.

Now ask whether to go ahead, and stop. Publishing is the user's call, so a
missing answer means no: if they have not answered, or ask for changes, revise
the notes and show them again. Only an explicit go-ahead reaches step 3.

## Step 3 — Publish

Only after that go-ahead, and only for the case you named in step 2.

If a release for the tag already exists, update it rather than creating a
duplicate:

```
gh release edit v<version> --notes-file ReleaseNotes/RELEASE_NOTES_<version>.md
```

If the release turns out to be published and step 2 did not name that case —
someone published it in between, say — stop and ask again. The go-ahead you hold
covers a draft, not a live rewrite.

If no release exists for the tag, create it as a draft. The tag does not exist
on the remote yet, so pass `--target <HEAD commit>` (get it with
`git rev-parse HEAD`) so gh creates the tag at the commit you wrote the notes
for, not at whatever the default branch happens to point to later:

```
gh release create v<version> --title "v<version>" --notes-file ReleaseNotes/RELEASE_NOTES_<version>.md --target <HEAD commit> --draft
```

Never change a release's published state. A draft stays a draft: do not pass
`--latest`, and do not run `gh release edit --draft=false`. A release that was
already published stays published — editing its notes must not also promote or
demote it. Turning a draft live is the user's job, on GitHub.

Finally, print the release URL.
