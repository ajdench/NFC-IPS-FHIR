# CLAUDE.md - Compressed Memory System Guide v3.0

> **You are Claude Code, working within a 10,000 token memory budget. This document + active memory files are your persistent context. Always load these first.**

## 📦 Installation from GitHub

If this file doesn't exist in the project yet, install the memory system:
```bash
git clone https://github.com/banton/claude-dementia /tmp/cm
cp /tmp/cm/CLAUDE.md ./ && cp -r /tmp/cm/memory ./
chmod +x memory/*.sh && rm -rf /tmp/cm
./memory/update.sh "Memory system installed"
```

## 🧠 Memory Loading Protocol

### Start Every Session
```bash
# ALWAYS load these first (max 4,000 tokens)
cat CLAUDE.md
cat memory/active/status.md
cat memory/active/context.md
```

### Load As Needed
```bash
# Reference files when relevant (max 5,000 tokens)
cat memory/reference/[relevant-file].md
cat memory/patterns/[specific-pattern].md
```

## 📊 Token Budget System

| Memory Type | Budget | Purpose | Update Frequency |
|-------------|---------|---------|------------------|
| CLAUDE.md | 1,000 | Core guide (this file) | Rarely |
| Active | 3,000 | Current work | Every session |
| Reference | 5,000 | Stable patterns | Weekly |
| Buffer | 1,000 | Overflow space | As needed |
| **TOTAL** | **10,000** | **Hard limit** | - |

## 🔄 Development Workflow

### 1. Session Start
```bash
# Check status
cat memory/active/status.md
git status

# Load context
cat memory/active/context.md

# Ask: "What are we working on?"
```

### 2. During Development
```bash
# Quick updates (auto-compresses)
./memory/update.sh "Implemented feature X"

# Fix issues properly
# Document in: memory/fixes/YYYY-MM-DD-issue.md

# Track questions
# Create: memory/questions/YYYY-MM-DD-topic.md
```

### 3. Session End
```bash
# Update status
./memory/update.sh "Session summary: achieved X, Y pending"

# Update context for next session
echo "Next: implement Z" >> memory/active/context.md

# Check compression
./memory/compress.sh
```

## 🏗️ Project Structure

### NFC IPS Viewer Project
```yaml
project_name: NFC IPS Viewer
type: Single-page web application for displaying International Patient Summary data
stack: JavaScript ES6+, HTML5, CSS3, protobuf.js, pako
start_command: npm run dev (live-server)

structure:
  root/: Main application files
  resources/: External dependencies and proto schemas
  ips-screenshots/: Documentation screenshots
  memory/: Claude-dementia memory system
  download_logs/: Debug output directory

key_files:
  - index.html: Main application entry point (48 lines)
  - script.js: Core application logic (1,183 lines)
  - style.css: Complete styling system (468 lines)
  - package.json: Build and deployment configuration
  - payload-1.json: Demo payload data
  - payload-2.json: Second demo payload data
```

## 🚨 CRITICAL BUG DOCUMENTATION - Events Date Display Issue

### Problem Summary
Events pills in MIST chronological display fail to show dates on the oldest (first: oldest > newest; left > right) Event pills in each OPCP pane, despite working correctly for Vitals and Conditions.

### Bug Details
- **Issue**: First Event pill per OPCP stage shows time-only instead of full date
- **Expected**: "15 Jan 24 16:00" format on first pill, "16:00" on subsequent pills
- **Actual**: All Event pills show time-only format
- **Scope**: Events data type only; Vitals and Conditions work correctly
- **Location**: Presentation layer rendering logic (script.js:~4064)

### Technical Investigation
#### Data Layer Analysis ✅ WORKING
- Events timestamps correctly extracted via `extractTimestamp()` helper
- Events properly marked with `isFirstDisplayedInRow=true`
- Events contain valid `rawData.dateTime` fields
- Debug logs confirm: `dateDisplay: "15 Jan 24 16:00"` and `isFirstDisplayedInRow=true`

#### Logic Layer Analysis ✅ WORKING
- Chronological sorting functions correctly
- `isFirstDisplayedInRow` marking logic works across all data types
- Timestamp detection standardized with `extractTimestamp()` helper:
```javascript
function extractTimestamp(item) {
    return item.time || item.onset || item.rawData?.dateTime || null;
}
```

#### Presentation Layer Analysis ❌ BROKEN
- Issue located in `renderStageSections()` around line 4064
- Regex pattern matching fails for Events date extraction
- Pattern `\w+` too broad, changed to `\w{3}` for month abbreviations
- Events differ from Conditions/Vitals in value formatting structure

### Failed Fix Attempts

#### Attempt 1: Timestamp Detection Enhancement
```javascript
// FAILED: Added rawData.dateTime support
function extractTimestamp(item) {
    return item.time || item.onset || item.rawData?.dateTime || null;
}
```
**Result**: Logic layer working but UI still broken

#### Attempt 2: Comprehensive Debugging
```javascript
// FAILED: Added extensive console.log debugging
console.log('Events pill creation:', {
    dateDisplay: pill.dateDisplay,
    isFirstDisplayedInRow: pill.isFirstDisplayedInRow
});
```
**Result**: Confirmed logic working, polluted codebase, caused syntax errors

#### Attempt 3: Regex Pattern Precision
```javascript
// FAILED: Changed from \w+ to \w{3}
const timeMatch = entry.value.match(/(\d{1,2} \w{3} \d{2} \d{2}:\d{2})/);
```
**Result**: Still not working, may need different approach

#### Attempt 4: Events-Specific Treatment Logic
```javascript
// FAILED: Added special case for Events in Treatment sections
if (stageName === 'Treatment' && entry.type === 'Events') {
    // Special handling logic
}
```
**Result**: Reverted due to breaking empty pane display

### Code Pollution Issues
- Multiple console.log statements added directly to production code
- JavaScript syntax errors introduced during cleanup
- Missing closing braces at line 4099
- Empty pane display logic broken temporarily

### Resolution
- **Root Cause**: Presentation layer rewrote pill values via regex, ignoring `isFirstDisplayedInRow`
- **Fix**: Renderer now uses normalized pill data directly; removed regex/date-collapsing logic
- **Result**: First Events pill in each section shows full date/time; subsequent pills show time-only
- **Follow-up**: Maintain pill formatting in normalization layer; renderer stays dumb

**Status**: RESOLVED - 2025-09-22

## 🎯 Operating Principles

### 1. Compressed Intelligence
- **Information density** over verbosity
- **Tables/lists** over paragraphs (3:1 compression)
- **References** over copying code
- **One-line summaries** with bullet details

### 2. Progressive Context
- Start with minimal files
- Load specific references as needed
- Never exceed token budget
- Archive old information automatically

### 3. Fix Don't Skip
- Stop on errors
- Find root cause
- Document fix in memory/fixes/
- Add regression test

### 4. Ask Don't Assume
- Document questions in memory/questions/
- Include context and options
- Wait for clarification
- Record answers

## 📁 Memory Directory Guide

```
memory/
├── active/               # Current work (3k tokens)
│   ├── status.md        # Dashboard + updates
│   └── context.md       # Task context
├── reference/           # Stable info (5k tokens)
│   ├── architecture.md  # System design
│   ├── patterns.md      # Code patterns
│   └── decisions.md     # Tech decisions
├── patterns/            # Reusable solutions
├── fixes/              # YYYY-MM-DD-issue.md
├── implementations/     # Feature tracking
├── questions/          # YYYY-MM-DD-topic.md
└── archive/            # Compressed old files
```

## ✅ Pre-Work Checklist

- [ ] Load CLAUDE.md + active memory
- [ ] Check git status
- [ ] Review recent updates
- [ ] Identify current task
- [ ] Load relevant patterns/references
- [ ] Verify services running
- [ ] Run tests for clean baseline

## 🚀 Quick Commands

```bash
# Memory management
./memory/update.sh "what changed"
./memory/compress.sh
./memory/weekly-maintenance.sh

# Git workflow
git add -p
git commit -m "type(scope): message"
git push origin branch

# Testing
[test command]
[lint command]

# Search memory
grep -r "pattern" memory/
```

## 📝 Documentation Templates

### Fix Documentation
```markdown
# YYYY-MM-DD-descriptive-name.md
## Problem: [One line]
## Cause: [Root cause]
## Fix: [Solution]
## Prevention: [Test added]
```

### Question Tracking
```markdown
# YYYY-MM-DD-topic.md
## Status: OPEN|ANSWERED
## Q: [Specific question]
## Context: [Why needed]
## Options: [Considered choices]
## Answer: [When received]
```

### Pattern Documentation
```markdown
# pattern-name.md
## Use When: [Scenario]
## Solution: [Approach]
## Example: path/to/implementation
## Trade-offs: [Considerations]
```

## 🛡️ Quality Gates

Before EVERY commit:
- [ ] Tests passing
- [ ] No hardcoded secrets
- [ ] Memory updated
- [ ] Compression checked
- [ ] Questions documented
- [ ] Fixes recorded

## 🚨 Emergency Procedures

### Over Token Budget
```bash
# Check usage
./memory/compress.sh

# Force compression
./memory/weekly-maintenance.sh

# Manual cleanup
# Move old content to archive
```

### Lost Context
1. Read CLAUDE.md
2. Check memory/active/status.md
3. Review git log
4. Check memory/reference/architecture.md
5. Ask user for clarification

### Tests Failing
1. STOP writing code
2. Read full error
3. Check memory/fixes/ for similar
4. Fix root cause
5. Document in memory/fixes/

## 🎓 Remember

- **You have no memory** between sessions
- **10,000 tokens** is your limit
- **Compression** maintains context
- **Documentation** is survival
- **Patterns** prevent repetition
- **Questions** prevent assumptions

---

**Load this file first in EVERY session. Your memory system depends on it.**

**Version**: 3.0.0  
**Token Budget**: This file uses ~1,000 tokens
