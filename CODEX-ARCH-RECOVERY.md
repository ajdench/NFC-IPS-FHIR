# CODEX ARCHITECTURAL RECOVERY LOG

## 1. Executive Summary
- Gemini merge damage left the repository in a partially restored state. Claude recovered a subset of files, but large portions of the original project structure are still missing or duplicated.
- The current codebase boots a UI shell, yet critical modules (`util/`, `nfc/`, payload pages) and build infrastructure (`package.json`) are absent. Runtime imports from `script.js` therefore fail immediately.
- Recovery artefacts exist (`ARCHITECTURAL-RECOVERY.md`, `RECOVERY/` folder), but they are not reintegrated. They should be treated as source material for reconstruction rather than live code.

## 2. Repository Snapshot (2025-09-24)
| Category | Observed | Notes |
| --- | --- | --- |
| Core root files | `index.html`, `script.js`, `style.css`, `config/constants.js` | Present but reference missing modules |
| Missing directories | `util/`, `nfc/`, `memory/`, `resources/vendor/mini-chart` | Required by imports and navigation logic |
| Recovery folders | `RECOVERY/`, `ARCHITECTURAL-RECOVERY.md`, `GEMINI.md` | Contain documentation & loose code snippets |
| Duplicate/renamed artefacts | `package-lock 2.json`, `scripts/build 2.mjs` | Created during conflict resolution; should be consolidated |
| Build metadata | `package.json` ⚠️ missing | Prevents dependency install & scripts |
| Assets | `resources/` tree intact | Includes vendor libs & historical specs |
| Images | `Screenshot 2025-09-24 at 13.31.09.png` | Likely for reference |

## 3. Critical Breakpoints
1. **Module Imports Break Immediately** – `script.js` imports `./util/base64.js` and `./util/json.js`, but `util/` no longer exists. The module fails to load before any UI work occurs.
2. **Routing Dependencies Gone** – Functions still navigate to `/encoding.html`, yet that page (and the `nfc/` directory that previously housed it) are missing.
3. **Build & Package Metadata Missing** – Without `package.json`, npm scripts cannot be executed; `package-lock.json` alone is insufficient.
4. **Duplicate Build Script & Locks** – Files suffixed with ` 2` indicate manual conflict resolution; they should be merged or removed to avoid confusion.
5. **Documentation vs Reality Drift** – `README.md` advertises full codec pipeline, but current code cannot parse or render due to missing imports and data pipeline wiring.

## 4. Recovered Artefacts & How to Use Them
- `ARCHITECTURAL-RECOVERY.md` – Thorough post-mortem captured by Claude. Reuse its architectural map when restoring data flow.
- `RECOVERY/chart-js-improvements.js` & `timebase-background-system.js` – Contain the advanced Chart.js plugin work (tooltips, legend collision, timeline backgrounds). These need selective reintegration into `script.js` once baseline functionality returns.
- `RECOVERY/toast-positioning-fix.css` – Holds the precise toast styling referenced in recovery notes.
- `RECOVERY/SESSION_RECOVERY.md` – Step-by-step description of previous enhancements and priorities. Treat it as a task checklist.
- `resources/medis_codex_full_spec.md` & `nfc_requirements*.md` – Historical specs for terminology and payload formats.

## 5. Immediate Recovery Tasks
1. **Restore Baseline Project Structure**
   - Recreate `util/base64.js`, `util/json.js`, and any other helpers formerly under `util/`.
   - Decide whether to reinstate the `nfc/` directory (viewer/encoding pages) or update `script.js` to stop referencing them.
2. **Recreate `package.json`**
   - Minimum scripts: `build`, `start/dev`, and any test harness previously used.
   - Reconnect dependencies: `pako`, `protobufjs`, `gh-pages`, etc.
3. **Audit `config/constants.js`**
   - Current file is drastically simplified. Compare against pre-damage versions (available in previous backups or documentation) to restore terminology maps, storage keys, route constants, etc.
4. **Normalize Build Scripts & Locks**
   - Merge `scripts/build.mjs` and `scripts/build 2.mjs` → keep one canonical file.
   - Remove `package-lock 2.json` after ensuring `package-lock.json` is accurate.
5. **Reconnect Data Pipeline**
   - Confirm `createInfoBoxes`, `processAndRenderAll`, and Chart initialization operate once imports are fixed.
   - Verify demo payload loading in `index.html` works post-restoration.
6. **Reintegrate Recovery Enhancements**
   - Once baseline works, reapply Chart.js plugin improvements from `RECOVERY/`.
   - Reapply toast positioning CSS (or verify it already matches).

## 6. Secondary Checks
- **Assets & Vendor Files** – Validate `resources/vendor/chart.umd.min.js`, `protobuf.min.js`, and `pako.min.js` versions; replace if corrupted.
- **Documentation** – Update `README.md` and `GEMINI.md` to reflect true status once functionality returns. Note the recovery plan.
- **Screenshot & Evidence Files** – Move screenshots or raw recovery logs to `RECOVERY/` or an `/archive` folder to declutter root.

## 7. Suggested Recovery Workflow
1. **Rebuild Utilities** – Start with restoring utility modules so `script.js` loads.
2. **Static Smoke Test** – Open `index.html` locally; ensure console is clean and default panes render at 45px without flashing (recent fix).
3. **Data Flow Reconnection** – Hook demo payload selection to pipeline, verifying patient/vitals rendering.
4. **Regression Enhancements** – Reintroduce Chart plugins and toast styling (using `RECOVERY/` guidance).
5. **Documentation Update** – Refresh README, GEMINI, ARCHITECTURAL docs once stable.

## 8. Open Questions
- Do earlier commits or backups hold canonical versions of `util/` and constants? If so, source them to avoid rewriting from scratch.
- Is the project still expected to ship the `encoding.html` experience? If yes, that entire page and associated JS/CSS must be recovered.
- Should the recovery docs (`ARCHITECTURAL-RECOVERY.md`, `RECOVERY/*`) remain permanent, or be archived once work is reimplemented?

---
**Current Priority**: Restore minimum viable structure (utilities + package manifest) so the application can execute without immediate runtime failures. After baseline is operational, reintegrate higher-level enhancements captured in the recovery artefacts.
