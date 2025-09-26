# IMPLEMENTATION GUIDE - NFC IPS Viewer Recovery

## 🚀 QUICK RESTORATION STEPS

### Step 1: Toast Positioning (CRITICAL - 5 minutes)
**File**: `style.css`
**Location**: `.toast-container` and `.toast-message` classes

```css
/* Replace existing .toast-container with: */
.toast-container {
    position: static;
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(var(--standard-padding) * 0.75);
    z-index: 100;
    pointer-events: none;
    margin-left: auto;
    margin-right: auto;
    width: fit-content;
    margin-top: -2px;
}

/* Replace existing .toast-message with: */
.toast-message {
    display: flex;
    align-items: center;
    justify-content: center;
    height: calc(var(--standard-padding) * 1.5);
    padding: 0 var(--standard-padding);
    border-radius: calc(var(--standard-padding) * 2);
    border: 1px solid;
    background: transparent;
    font-size: calc(var(--font-size-uniform) * 0.8);
    font-weight: normal;
    white-space: nowrap;
    margin: var(--half-padding) 0;
    animation: toastFadeIn 0.3s ease-out, toastFadeOut 0.3s ease-out 2.7s forwards;
    pointer-events: auto;
    width: auto;
    min-width: fit-content;
}
```

### Step 2: Chart.js Tooltip Fix (HIGH PRIORITY - 3 minutes)
**File**: `script.js`
**Location**: Chart.js tooltip configuration

Find the Chart.js options and update tooltip config:
```javascript
tooltip: {
    usePointStyle: true,
    boxWidth: 8,
    boxHeight: 8,
    callbacks: {
        // existing title callback...
        label(context) {
            // ... existing code ...
            // Change return line to add leading space:
            return ` ${type} • ${displayValue} • ${stage}`;
        }
    }
}
```

### Step 3: Import Requirements (CRITICAL - 2 minutes)
**File**: `script.js`
**Location**: Top of file imports

Ensure this import exists:
```javascript
import {
    COLORS,
    CARE_STAGES,  // ← ADD THIS if missing
    TERMINOLOGY_SYSTEMS,
    DEMO_PAYLOADS,
    RESOURCES,
    FHIR_EXTENSIONS,
    FHIR_PROFILES
} from './config/constants.js';
```

### Step 4: Timebase Background System (MEDIUM PRIORITY - 15 minutes)
**File**: `script.js`
**Location**: Chart.js plugins section

Add the complete timebase background plugin (see `timebase-background-system.js`)

### Step 5: Legend Collision System (LOW PRIORITY - 10 minutes)
**File**: `script.js`
**Location**: Chart.js plugins section

Add the custom legend plugin (see `chart-js-improvements.js`)

---

## 🎯 TESTING CHECKPOINTS

After each step, verify:

### ✅ Step 1 Complete:
- Toast messages appear centered in header gap
- Toast height matches Encode/Decode buttons
- No horizontal offset issues

### ✅ Step 2 Complete:
- Tooltip shows circular indicators (not squares)
- Circle size is 8x8 pixels
- Space exists between circle and text

### ✅ Step 3 Complete:
- No import errors in console
- CARE_STAGES available globally

### ✅ Step 4 Complete:
- Colored background regions appear on chart
- Stage titles show in top-left of regions
- Backgrounds are continuous with no gaps

### ✅ Step 5 Complete:
- Legend positioned on right side of chart
- No overlapping legend items
- Items ordered by last data point value

---

## 🚨 TROUBLESHOOTING

### Toast Not Centered:
- Check if payload-header still has `position: relative`
- Verify CSS variables are available
- Test with `position: static` approach

### Chart Backgrounds Not Showing:
- Verify `viewModel.stageSections` exists
- Check `stageKeys` array is defined
- Ensure `hexToRgba` utility function exists

### Tooltip Squares Instead of Circles:
- Confirm `usePointStyle: true` is set
- Check Chart.js version compatibility
- Verify boxWidth/boxHeight values

### Import Errors:
- Check file paths are correct
- Verify constants.js exports CARE_STAGES
- Look for typos in import statements

---

## 📋 FILE LOCATIONS

### Primary Files to Modify:
- `script.js` - Chart.js plugins and configuration
- `style.css` - Toast positioning

### Backup Files Available:
- `RECOVERY/toast-positioning-fix.css`
- `RECOVERY/timebase-background-system.js`
- `RECOVERY/chart-js-improvements.js`

---

## ⏱️ ESTIMATED TIMES

| Step | Priority | Time | Complexity |
|------|----------|------|------------|
| Toast Positioning | CRITICAL | 5 min | Low |
| Tooltip Fix | HIGH | 3 min | Low |
| Imports | CRITICAL | 2 min | Low |
| Timebase Background | MEDIUM | 15 min | Medium |
| Legend System | LOW | 10 min | Medium |

**Total Recovery Time**: 35 minutes for full restoration

---

## 🔄 RECOVERY VERIFICATION

When complete, test by:
1. Triggering a toast message (encode/decode)
2. Hovering over chart data points
3. Checking for colored timeline backgrounds
4. Verifying legend positioning

All features should work exactly as they did before the loss!