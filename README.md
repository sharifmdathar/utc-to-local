# Universal UTC → Local Time Converter

A Tampermonkey userscript that finds UTC / ISO 8601 date strings on any web page
and rewrites them into your local (or a chosen) timezone, with configurable format.

[![Install](https://img.shields.io/badge/install-userscript-blue)](https://raw.githubusercontent.com/sharifmdathar/utc-to-local/main/utc-to-local.user.js)

## Install

1. Install [Tampermonkey](https://www.tampermonkey.net/) (or Violentmonkey) in your browser.
2. Click **[this install link](https://raw.githubusercontent.com/sharifmdathar/utc-to-local/main/utc-to-local.user.js)**.
3. Confirm the installation prompt.

The script auto-updates from this repo after install.

## What it does

It scans visible text for date patterns like:

- `2026-10-05T17:29:00Z` (ISO 8601, UTC)
- `2026-10-05 17:29 UTC` (space-separated, e.g. Arch Linux package dates)
- `2026-10-05T17:29:00+00:00` / `+0000` (numeric offsets)

…and replaces them with a formatted local timestamp, e.g. `Oct 5, 2026, 10:29:00 AM GMT+5:30`.

It also watches for dynamically loaded content (SPAs, infinite scroll, live feeds).

## Settings

Open the Tampermonkey menu → **Universal UTC → Local Time Converter**:

| Option | Description |
|---|---|
| **Format** | Toggle 12-hour / 24-hour |
| **Seconds** | Show or hide seconds |
| **Zone name** | Show or hide the timezone abbreviation |
| **Set preferred timezone…** | Enter an IANA zone (e.g. `America/New_York`, `Asia/Kolkata`). Blank = your system zone. |

All settings persist across page loads.

## Permissions & privacy

- `@match *://*/*` — the script runs on every site **by design**, since UTC
  timestamps can appear anywhere.
- It only reads text nodes that contain a matching date pattern and never sends
  data anywhere. There is no network activity, no analytics, no remote code.
- `GM_getValue` / `GM_setValue` store your preferences locally in the userscript
  manager.


## License

[MIT](LICENSE)
