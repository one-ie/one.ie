**e2e1d8c6** — .claude:1 — `refactor: Make tracking template-agnostic for any user customizations`


**c22d8f6e** — one:1 —`docs: Update change tracking header with legend`


**3e33b1d1** — .claude:1 —`refactor: Add customization tracking tags for upgrade management`


**9c180820** — one: +2 — `docs: Update change tracking and in-sync plan`


# Change Tracking

Track template upgrades vs your customizations. Updated on each commit.

**Format:** `template-changes | your-custom-changes [customization] — message`

| Tag | Meaning |
|-----|---------|
| `[customization]` | Your custom directories changed |
| No tag | Only template or documentation changes |

**Examples:**
- `web:2 one:1 — Add new component` — Template only
- `one.ie:3 [customization] — Update home page` — Your customizations
- `web:1 | one.ie:2 [customization] — Sync with template + update site` — Both

---

**6151535c** — .claude: +1 — `refactor: Make track-changes more elegant with grouped directory stats`

