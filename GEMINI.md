# Project-Specific Gemini Notes (NFC IPS Viewer)

This document records ongoing learning, architectural decisions, and specific to-dos related to the NFC IPS Viewer project.

## Branching & Deployment

*   **Feature Branches:** We follow a pattern of creating temporary feature branches (e.g., `Dev1`, `Dev2`) for development and testing. These branches are deleted after their work is merged or completed.
*   **Deployment Workaround:** The `gh-pages` deployment script has a known issue where it incorrectly processes the `.gitignore` file. The current workaround is to temporarily remove the `node_modules/` entry from `.gitignore` before running the deploy command and restore it immediately after.
*   **Conflict Resolution:** Merge conflicts are documented in a temporary file (e.g., `23-Sep-25-Conflict.md`) to facilitate resolution before being archived.

## Learning & Insights:

*   **Vitals Charting:** The vitals timeline now uses a local, vendored `Chart.js` library for rendering, with a simple in-project renderer as a fallback for offline functionality.
*   **Data Cleanup:** The sample IPS data and in-code defaults have been refined for greater clinical consistency (e.g., stage-aware temperatures, unique heart rates, paired blood pressure readings).
*   **UI Polish:** Tooltips and legends for the vitals chart have been improved to always show units and use consistent formatting.
*   **Dynamic Flexbox Spacing (Ghost Items):** To ensure consistent wrapping and dynamic spacing with `justify-content: space-between`, implemented the "ghost item" technique. Invisible flex items are added to the container, forcing proper space distribution even on lines with fewer elements.
*   **Dynamic Component Generation:** Refactored the main info boxes to be dynamically generated from a JavaScript configuration array. This cleans up the `index.html`, centralizes the UI structure in the script, and makes the layout more scalable and maintainable.

## Architectural Approaches:

*   **Client-Side SPA:** The project is a single-page application (SPA) with all logic handled client-side via JavaScript. The stack is JavaScript ES6+, HTML5, CSS3, with `protobuf.js` and `pako` for data processing.
*   **Static Site Deployment:** Leveraged GitHub Pages for hosting, with `gh-pages` npm package for automated deployment from a `build` directory.
*   **Modular CSS:** Organized CSS into logical sections and used variables for maintainability.
*   **Documentation Structure:** A documentation review has been conducted, identifying core reference documents (`README.md`, `CODEC.md`, etc.) and candidates for archival (legacy requirements, large asset collections).
*   **Key Files:**
    *   `index.html`: Main application entry point.
    *   `script.js`: Core application logic.
    *   `style.css`: Complete styling system.
    *   `package.json`: Build and deployment configuration.
    *   `payload-1.json` & `payload-2.json`: Demo payload data.

## Unresolved Issues / Bugs:

*   **CRITICAL: Data Pipeline Failures:** There are major structural issues in the data processing pipeline causing critical patient information to be dropped before rendering.
    *   **Allergy Information:** `AllergyIntolerance` resources are present in the input FHIR data but are not being rendered in the Clinical Summary section.
    *   **Patient Identifiers:** Patient identifiers like Service Number and NHS Number are not being displayed in the Patient Demographics section, despite being present in the input data.
*   **Bug: Excess Gap Below Detail Elements in Patient Box**
    *   **Description:** The `div.info-box.grey` (Patient box) consistently displays an excess vertical gap below the detail elements, leading to inconsistent vertical spacing.
    *   **Status:** Unresolved.

## Resolved Issues:

*   **Bug: Persistent Flexbox Stretching Issue (textarea/pre)**
    *   **Resolution:** Replaced `textarea` and `pre` elements with `div[contenteditable]` and adjusted parent container flex properties.
*   **Bug: Events Date Display Issue**
    *   **Description:** The first event pill in each OPCP stage was showing only the time instead of the full date and time (e.g., "16:00" instead of "15 Jan 24 16:00"). This was happening only for the "Events" data type.
    *   **Root Cause:** The presentation layer rendering logic in `renderStageSections()` was incorrectly rewriting pill values using a broad regex match, ignoring the `isFirstDisplayedInRow` flag that was correctly set in the logic layer.
    *   **Resolution:** The rendering logic was fixed to use the normalized pill data directly, removing the faulty regex-based date collapsing logic. Now, the first event pill correctly shows the full date and time, and subsequent pills show only the time.

## To-Dos / Next Steps:

*   **URGENT:** Fix the `AllergyIntolerance` and Patient Identifier rendering bugs.
*   Conduct a full audit of the data pipeline to identify and fix data loss points.
*   Add automated regression tests for vitals chart rendering and OPCP pill formatting.
*   Rename UI components for consistency (e.g., `right-input` to `right-output`).
*   **Global GEMINI.md Update:** Remember to manually update the global `/.gemini/GEMINI.md` with relevant general context and learning from this project.
*   **CLAUDE.md Update:** Cannot directly update `CLAUDE.md` as it is outside the project directory. User needs to manually update or change working directory.

## Recent Development Log

### 2025-09-24 - Repository Migration and Deployment Challenges

*   **New Repository Setup:** Migrated project to a new Git repository: `https://github.com/ajdench/NFC-IPS-FHIR.git`.
*   **Persistent Deployment Issues:** Encountered significant challenges with `gh-pages` and `git subtree push` for deploying to GitHub Pages.
    *   **Root Cause:** Identified a persistent `.DS_Store` file and `node_modules` permission issues, likely stemming from a corrupted Git worktree state in the previous repository.
    *   **Workaround:** Implemented a manual deployment process involving creating an orphan branch, committing the `build` directory content, and force-pushing to the `mainPages` branch.
*   **File Loss During Migration:** `package.json` and `scripts/build.mjs` were inadvertently lost during the initial `git clean -fdx` and re-initialization of the new repository. These files were recreated from memory and committed.
*   **Branch Renaming:** Renamed the `mainPagesDev` branch to `mainPages` on the remote.
