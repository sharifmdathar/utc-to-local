# Changelog

All notable changes to this project are documented here.
This project adheres to [Semantic Versioning](https://semver.org/).

## [1.4.0] - 2026-10-07

### Added
- Configurable preferred timezone via the Tampermonkey menu.
- 12h/24h format toggle.
- Seconds and zone-name display toggles.
- Persistent settings via `GM_getValue` / `GM_setValue`.

### Fixed
- Date output no longer collapses to `00 GMT+…` (missing `Intl` fields).
- Menu labels now refresh after toggling.
- Settings changes now re-render already-converted timestamps.

## [1.1.0] - 2026-10-05

### Added
- Support for Arch Linux `YYYY-MM-DD HH:MM UTC` format.
- MutationObserver for dynamically loaded content.
