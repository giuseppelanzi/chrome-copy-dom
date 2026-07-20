---
name: store-listing
description: Generate the Chrome Web Store listing copy for this extension — the short Summary (max 132 chars) and the long Description — in English, from the extension's current state, then show it for review. Store publishing itself stays manual in the developer dashboard.
user-invocable: true
context: fork
allowed-tools: Read, Write, Bash(grep *)
argument-hint: "[version]"
---

Manifest version: !`grep -n '"version"' manifest.json`

Store item: **Easy Copy DOM** — (public store URL: add it here once the extension is
published; at 1.0.0 it may not be on the store yet)

This skill produces the two text fields of the store listing, ready to paste into
the Chrome Web Store Developer Dashboard:

- **Summary** (a.k.a. short description) — **max 132 characters, single line**.
- **Description** — the long product description, **max 16,000 characters**.

It does **not** publish anything: uploading a new version and pasting the copy is
done by hand in the dashboard (it needs a signed-in Google account and cannot be
automated from here). The skill's job ends at showing and saving the text.

## Version

Arguments: $ARGUMENTS

Read that line as an optional version. It only names the output file — the copy
itself is evergreen. When empty, use the `"version"` from `manifest.json` above
(strip nothing; write it as `1.0.0`). Parse the argument yourself: positional
placeholders never reach this skill.

## Plain text, not Markdown

The Chrome Web Store renders the Description as **plain text** — Markdown is not
interpreted. So the Description body must never use `#`, `*`, `_`, backticks, or
`[](…)` links. Structure it with:

- blank lines between paragraphs,
- section headers as an emoji + UPPER CASE label on their own line (e.g.
  `⌨️ KEYBOARD SHORTCUT`),
- `•` for bullets,
- raw URLs, never Markdown links.

Emoji are fine and expected here — the template uses them for the title line and
every section header. Keep the author's house style: the shortcut keys are
written in bold-math unicode (`𝐀𝐥𝐭 + 𝐒𝐡𝐢𝐟𝐭 + 𝐂`), matching the author's other
extensions; the template carries it.

The Summary is one plain line with no line breaks and no formatting.

The `##` headers in the template and the saved file are only there to separate the
two fields — they are file scaffolding, not part of the text to paste. What gets
pasted is the body under each header.

## Step 1 — Gather the real features

Describe only what the extension actually does. Do not invent features. Read the
current source and pull the facts from it:

- `manifest.json` — product name (`Easy Copy DOM`), `description`, the `commands` (the
  `activate-picker` keyboard shortcut and its default keys, `Alt+Shift+C`, same on
  the `mac` variant), and `permissions` (drives the Privacy section — this
  extension uses `storage`, `activeTab` and `scripting`).
- `popup.html` — the user-facing controls: the "Copy now" button, the "Enable
  keyboard shortcut" toggle (off by default) with its hint text, and the "Change
  shortcut" button.
- `content.js` — the picker behavior worth describing to a user: moving the mouse
  highlights the element under it with a label showing its tag, id and pixel size;
  a click copies the element's `outerHTML` to the clipboard; `Esc` cancels; a
  toast confirms with the copied tag and character count. The whole overlay lives
  in a Shadow DOM, so it never disturbs the page's own styles. Skip internal
  mechanics.
- `background.js` — the picker is injected into the active tab only when you
  trigger it, and only on normal web pages (Chrome internal pages, the Web Store,
  `view-source:`, etc. are off-limits). Worth a line; skip the rest.
- `storage.js` — the shortcut on/off setting persists in `chrome.storage.local`,
  so it survives browser restarts. That claim is safe to make.

For the Privacy section, be precise about the three permissions: `storage` saves
the shortcut toggle; `activeTab` + `scripting` are what let the extension inject
the picker into the current tab on demand. There are no host permissions for all
sites, nothing runs in the background on pages, and no data ever leaves the
device — no collection, no external connections, no tracking.

Close the Description with the standard footer the template carries — the Ko-fi
and GitHub links. Keep those URLs unless the user changes them.

If a shortcut, toggle, or permission in the code disagrees with the notes above,
trust the code — it is the current state.

## Step 2 — Write the copy

Write everything in **English**, whatever language the conversation is in — the
store listing is English. Keep talking to the user in Italian.

Read the template in template.md and follow its structure. Match the tone of the
manifest `description` ("Quickly copy the HTML of any element on a page: hover to
highlight, click to copy. Use the toolbar icon or a keyboard shortcut.") —
friendly, concrete, benefit-first.

The Summary must sell the extension in **≤ 132 characters**. Count the characters
and keep it under the limit; if it overflows, shorten it, do not ship it long.

Save the result to `StoreListing/STORE_LISTING_<version>.md`, where `<version>` is
the version from the Version section (e.g. `StoreListing/STORE_LISTING_1.0.0.md`).
Writing the file creates the `StoreListing/` directory when missing. That folder
is gitignored, like `ReleaseNotes/`: the canonical copy lives on the store, not in
git, so treat the file as disposable (fair game for `git clean -xfd`) — publish it
to the store or copy the text out.

If that file already exists, do not overwrite it blindly. Read it, show the user
what is already there, and ask whether to replace it or write to a different name.
Their previous draft may hold edits worth keeping.

## Step 3 — Show it and stop

Print both fields in the reply, in full:

- The Summary, with its character count next to it (e.g. `Summary (128/132)`).
- The Description, as the plain text that will be pasted.

Then remind the user that this skill does not publish: they upload the new version
and paste these two fields in the Chrome Web Store Developer Dashboard themselves.
Point them at the item's dashboard (the store URL above, once it exists).

If they ask for changes, revise and show again. There is no publish step to reach.
