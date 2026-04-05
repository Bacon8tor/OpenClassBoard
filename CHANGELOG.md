# Changelog

All notable changes to OpenClassBoard are documented here.

## [Unreleased]

### Security
- Sanitize poll titles and options with DOMPurify in VotingPage
- Gate all `console.error` calls behind `import.meta.env.DEV` to avoid leaking errors in production
- Add URL protocol validation (`http`/`https` only) in ImageWidget
- Sanitize TextWidget HTML content with DOMPurify on read and write
- Harden Firebase database rules: votes can only increase, voter entries are immutable once written, polls can only be updated while live

### Fixed
- Vote race condition replaced with Firebase `runTransaction` for atomic read-modify-write
- ConversionWidget result font size was multiplied by 5 (e.g. 80px) — now correct
- PollWidget cleanup loop variable `pollId` shadowed component state, causing old polls to never be deleted
- NamePickerWidget textarea showed blank on first render (replaced `useEffect` init with lazy `useState`)
- Widget data persistence now correctly saves all widget-specific data (ScoreboardWidget teams, TextWidget content, etc.)
- `key` prop on widgets was inside `commonProps` where React ignores it — moved to JSX elements directly
- External links missing `rel="noopener noreferrer"` in settings panel

### Changed
- Dockerfile converted to multi-stage build (builder + static `serve`) — no longer runs dev server in production
- Port changed from `5173` to `3000` in Docker production image
- `.dockerignore` updated to exclude `node_modules`, `dist`, `.git`, `.env`, `*.md`
- `localStorage` operations wrapped in try/catch throughout
- Reset Layout button now requires confirmation before clearing
- Firebase gracefully degrades when `.env` is not configured — app loads without errors, Poll widget hidden

### Added
- `firebaseConfigured` export from `firebase.js` to gate Poll feature at runtime
- localStorage schema versioning (`version: 1`) with migration support for future breaking changes
- Vite manual chunk splitting (`vendor`, `firebase`) for better browser caching

---

## [0.1.0] - Initial Release

- Core widget system: Stoplight, Clock, Timer, Poll, Dice, Name Picker, Conversion, Image, Text, Scoreboard
- Draggable and resizable widgets with boundary detection
- Firebase Realtime Database integration for live polls with QR code voting
- Named layout save/load via localStorage
- Customizable backgrounds (color or image upload)
- Widget transparency and title visibility controls
- Docker support with `latest` and `nopoll` image variants
