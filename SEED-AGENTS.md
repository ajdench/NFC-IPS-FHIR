# NFC IPS Viewer — Seed Brief for Agent Reconstitution

This document seeds a fresh engineering effort to rebuild and evolve the NFC International Patient Summary (IPS) Viewer after the Gemini merge catastrophe. It captures the intended product goals, architecture, data flow, UI design, and prior enhancements so a new set of agents can reproduce (and improve) the tool in a clean workspace.

---

## 1. Product Vision
- **Problem**: Clinicians and med-tech operators need an offline-first viewer for IPS data embedded in NFC tags. The viewer must decode FHIR bundles (and alternate CodeRef/protobuf payloads), render the Operational Patient Care Pathway (OPCP) stages, and surface key vitals/conditions/events with timeline visualisations.
- **Users**: field medics, analysts, and engineers verifying payload integrity.
- **Core Outcomes**:
  1. Load an IPS payload (demo files, NFC fragment, or pasted JSON).
  2. Decode/normalise into a view model that groups data by OPCP stages.
  3. Render stage panels, vitals chart, and raw payload inspectors with precise styling.
  4. Provide tooling for encode/decode workflows and regression confidence.

---

## 2. High-Level Architecture
```
┌──────────────┐       ┌─────────────────────┐       ┌─────────────────────┐
│  Entry Point │  ──►  │  Data Processing    │  ──►  │     UI Rendering     │
│  (index.html)│       │  (script.js)        │       │     (script.js)      │
└──────────────┘       ├─────────────────────┤       ├─────────────────────┤
                       │ codecPipeline       │       │ createInfoBoxes      │
                       │ payloadService      │       │ renderStageSections  │
                       │ utilities (base64…) │       │ renderVitalsChart    │
                       └─────────────────────┘       │ toast + payload panes│
                                                     └─────────────────────┘
```
- **Static hosting** via GitHub Pages or any static server.
- **ES Modules**: `script.js` imports `config/constants.js` plus utility modules (`util/base64.js`, `util/json.js`).
- **State** managed in `appState` (current view model, demos, comparisons).
- **Rendering** orchestrated by `processAndRenderAll(viewModel)` after payload parsing.

---

## 3. Key Modules & Responsibilities
### 3.1 script.js (Core)
- Bootstraps UI (`init()`), fetches demo payloads, wires encode/decode flows.
- `codecPipeline`: converts among FHIR, CodeRef, protobuf fragments.
- `payloadService`: builds stage-aligned view models for rendering.
- Rendering helpers:
  - `createInfoBoxes` builds patient/clinical summary plus 9 OPCP boxes with dual-title structure (short left title at 92.5 % scale, full right title at 35 % opacity) and initial 45 px collapsed height.
  - `setTitleAvailability` toggles titles between populated/empty states while preserving dual-title layout.
  - `renderPatientBox` paints pill-style detail entries (title, rank, forename, surname, sex, DOB, blood group via SNOMED lookup, nationality, service & NHS numbers) and adds ghost flex items for spacing.
  - `renderClinicalSummaryBox` shows totals (vitals/conditions/events), creation timestamp, and identifier diffs in matching pill styling.
  - `renderStageSections` builds MIST sections (Mechanism/Injury, Symptoms, Treatment) with bullet-separated pills; first pill displays full date/time (`15 Jan 24 • 10:00`), subsequent pills time-only.
  - `renderVitalsChart` prepares datasets per vital type, infers units, stores metadata for tooltips, and delegates to Chart.js.
  - `renderPayloadDisplay` prints JSON payload to the right pane and updates character count.
- Chart integration:
  - Tooltips use `usePointStyle: true`, 8 px circular markers, and format `type • value • stage`.
  - `customLegendPlugin` sorts datasets by last value, enforces spacing for Heart Rate/Diastolic pairs, draws 4 px circles right of the chart, and shrinks chart width if needed.
  - `timebaseBackgroundPlugin` draws continuous stage-colored regions (28 % opacity) with titles at 95 % opacity, padding left 8 px/top 6 px, using midpoints between stages and the active view model in `appState`.
- Toast utilities display centered notifications matching encode/decode button height (1.5× padding, radius = 2× padding) with fade-in/out animation.

### 3.2 config/constants.js
- Color palette for care stages and UI elements.
- Terminology systems (SNOMED CT, LOINC, UCUM, etc.).
- Demo payload paths, resource URLs.
- Route constants and storage keys (needs full reconstruction).

### 3.3 util/
- `base64.js`: normalise base64 strings, convert to Uint8Array/string.
- `json.js`: tolerant JSON parsing, heuristics, deep clone.

### 3.4 index.html
- Hosts main three-panel layout: left OPCP boxes, middle chart, right raw payload.
- Includes hidden “enhanced controls” (legacy encode/decode panes) for expanded workflows.
- Loads Chart.js, protobuf.js, pako, and `script.js` (module).
- Provides demo payload dropdown and file loader UI elements.

### 3.5 style.css
- Implements global CSS variables (padding, fonts, palette).
- OPCP stage box styling (color-coded backgrounds).
- Patient detail “pills” with ghost flex items for spacing.
- Vitals chart container, toast positioning (centered header gap), payload pane styling.
- Supports 45px collapsed height for empty display panes.

### 3.6 resources/
- `vendor/`: Chart.js, protobuf, pako assets; fallback mini-chart renderer.
- Historical specs (`nfc_requirements*.md`, `medis_codex_full_spec.md`).
- Protobuf schema definitions (`nfc_payload.proto`, `nfc_payload_legacy.proto`).

### 3.7 RECOVERY/
- Captures recovered Chart/Toast enhancements (`chart-js-improvements.js`, `timebase-background-system.js`, `toast-positioning-fix.css`).
- `SESSION_RECOVERY.md` chronologically describes lost work—useful for prioritising reimplementation.

---

## 4. Data Pipeline Overview
1. **Input Sources**
   - Demo payload dropdown (`payload-1.json`, `payload-2.json`).
   - NFC fragment in URL hash (legacy flow).
   - Manual JSON entry via left pane (enhanced workflow).
2. **Decoding Steps** (codecPipeline)
   - Normalise base64 → protobuf, decompress (pako) if needed.
   - Convert to CodeRef structure (stage/grouped data).
   - Convert to FHIR Bundle (when required by encoding flow).
3. **View Model Construction** (payloadService)
   - Identify patient resource, allergies, summary totals.
   - Build stage sections: vitals, conditions, events arrays per OPCP stage.
   - Prepare raw payload for right-pane display.
4. **Rendering**
   - `createInfoBoxes()` builds or resets stage boxes.
   - `setTitleAvailability()` toggles dual-title/empty state (maintains 45px collapsed height).
   - `renderStageSections()` paints MIST sections within each stage.
   - `renderVitalsChart()` uses Chart.js + plugins to render timeline (colors by stage, tooltip enhancements, collision-aware legend, timebase backgrounds).
   - `renderPayloadDisplay()` prints JSON to right pane with character count.

---

## 5. UI Composition & Intended Behaviour
- **Header**: Encode/Decode buttons, demo payload dropdown, and centered toast container (`position: static`, `margin-top: -2px`, width auto) matching button height.
- **Left Panel**:
  - Patient Demographics (grey) and Clinical Summary (khaki) boxes use pill-style `.detail-box` elements (`height: calc(padding * 2)`, rounded corners, label/value segments). `addGhostItems` inserts invisible flex items for even wrapping.
  - OPCP stages (POI → R3) inherit stage colors, dual titles (short left title scaled to 92.5 %, full right title at 35 % opacity). Empty state collapses to 45 px; populated state attaches `.stage-details-container` with MIST sections rendered via `createDetailBoxElement`.
- **Pill Layout**: `.patient-details-container` is flex-wrap with `gap: standard-padding`, `justify-content: space-between`. `.detail-label` background uses stage colour; `.detail-value` is white, bold, dark text.
- **Middle Panel**: `.vitals-content` card with `.vitals-empty` overlay. Chart.js line chart (tension 0.25, point radius 3/5) uses staged background plugin, tooltip formatting, and custom legend plugin as described above.
- **Right Panel**: Raw payload inspector (`pre#ips-input`) with `.char-count` showing text length; supports manual review/copy.
- **Enhanced Controls (hidden)**: Legacy encode/decode panes (`textarea` inputs, presets, parse button) enabling manual conversion workflows with toast feedback.
- **Toast Messages**: `height: padding * 1.5`, `border-radius: padding * 2`, severity-specific borders (`#90EE90`, `#FFE4B5`, `#FFB6C1`), fade animations from 0–0.3 s and 2.7–3 s.
- **Accessibility**: Semantic headings (`h2`/`h3`), centered italic empty texts, vitals empty overlay with `role="status"`, ensure focus retention when switching modes/formats.

---

## 6. Key Dependencies
- **Chart.js** (vendored) – primary charting library.
- **VitalsMiniChart** (fallback) – simple renderer when Chart.js unavailable.
- **protobufjs** – decode/encode protobuf payloads.
- **pako** – handle compressed payloads.
- **Node scripts** – build script copies static files/resources to `build/` for deployment.

---

## 7. Build & Run
1. `npm install`
2. `python3 -m http.server 8080` (or any static server).
3. Open `http://localhost:8080/index.html`.
4. Use demo dropdown to load payloads; chart and panes should populate.
5. `node scripts/build.mjs` to produce deployable `build/` directory.

_Legacy workflow_ (optional): integrate encode/decode panes by reviving `encoding.html` or replicating the left/right pane flows in index.

---

## 8. Known Gaps Post-Recovery
- `package.json` rebuilt with minimal scripts; add lint/test tasks as needed.
- `config/constants.js` currently simplified; restore full terminology maps, storage keys, routes from historic versions.
- `encoding.html`, `memory/`, and other auxiliary folders were lost; recreate if workflows rely on them.
- Automated tests were previously envisioned (regress vitals chart & pill formatting). Re-add once core functionality stabilises.
- Some documentation (GEMINI.md, README) references features not yet reimplemented; update after reconstruction.

---

## 9. Immediate Rebuild Priorities
1. **Finish constants & utilities** – ensure all imports used in `script.js` are implemented.
2. **Reconnect encode/decode flows** – confirm manual fragment conversion pathways still function.
3. **Reintegrate Chart/Toast enhancements** – port code from `RECOVERY/` snippets into live `script.js` / `style.css` once pipeline works.
4. **Restore auxiliary pages** – rebuild encoding/decoder UI if teams still depend on it.
5. **Add regression harness** – CLI tests or snapshots for vitals chart & OPCP titles (per historical TODOs).

---

## 10. Suggested Improvements for the Next Iteration
- Modularise `script.js` (split codec, rendering, state management into separate modules).
- Introduce TypeScript or JSON schema validation for payload safety.
- Replace global state with a more deliberate store (e.g., vanilla observable or lightweight state machine).
- Add offline caching of demo payloads and user fragments (IndexedDB or localStorage wrappers with schema versioning).
- Implement automated tests (Jest + jsdom, or Playwright for UI snapshots).
- Revisit UI accessibility (keyboard navigation between panes, focus management, ARIA roles for dynamic sections).
- Consider bundling with Vite/Rollup for cleaner dev experience.

---

## 11. Artefacts to Reference
- `ARCHITECTURAL-RECOVERY.md` – Claude’s comprehensive post-mortem (aligns with current file). Use it to verify feature parity.
- `RECOVERY/SESSION_RECOVERY.md` – Task checklist of lost enhancements.
- `RECOVERY/chart-js-improvements.js`, `timebase-background-system.js`, `toast-positioning-fix.css` – ready-to-import implementations.
- `resources/nfc_payload.proto` – authoritative schema for fragment encoding/decoding.
- `payload-1.json`, `payload-2.json` – sample payloads for regression tests.

---

## 12. Hand-off Checklist for New Agents
- [ ] Verify `npm install` succeeds and dev server renders demo payloads.
- [ ] Restore missing constants & utilities before adding new features.
- [ ] Reapply chart/toast enhancements from recovery snippets.
- [ ] Rebuild encode/decode workflows (if required) with tests.
- [ ] Update docs (`README`, new `AGENTS.md`) to reflect restored functionality.
- [ ] Establish CI-friendly regression (chart datasets + stage titles).

This seed brief should give the new engineering agents enough context to recreate the NFC IPS Viewer faithfully—while also building in the safeguards (tests, modular architecture) that were missing before the catastrophic loss.
