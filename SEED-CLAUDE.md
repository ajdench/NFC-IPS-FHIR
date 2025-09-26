# SEED-CLAUDE.md - NFC IPS Viewer Complete Architecture & Implementation Guide

> **Comprehensive seed file for rebuilding the NFC International Patient Summary Viewer application. This document encapsulates the complete codebase, architecture, business logic, and intended UI functionality for creating an equivalent or improved tool.**

## 🏥 PROJECT OVERVIEW

### Core Purpose
The NFC IPS (Near Field Communication International Patient Summary) Viewer is a sophisticated medical data visualization web application designed to display patient care data throughout the OPCP (Operational Patient Care Pathway). It processes FHIR-compliant medical data encoded via NFC technology, supporting battlefield and emergency medical scenarios.

### Business Domain
- **Primary Users**: Military medical personnel, emergency responders, healthcare providers
- **Use Cases**: Real-time patient tracking, medical handoffs, care continuity, allergy alerts
- **Data Standards**: FHIR R4, SNOMED CT, LOINC, UCUM terminology systems
- **Deployment**: Static web application via GitHub Pages with NFC tag integration

### Technology Stack
```yaml
Frontend:
  - HTML5 semantic markup
  - CSS3 with custom variables system
  - Vanilla JavaScript ES6+ modules
  - Chart.js for medical timeline visualization

Data Processing:
  - Protocol Buffers (protobuf.js) for compression
  - Pako.js for GZIP compression/decompression
  - FHIR R4 resource processing
  - Base64 URL-safe encoding

Architecture:
  - Single-page application (SPA)
  - Modular ES6 import/export system
  - Event-driven UI updates
  - Responsive CSS Grid/Flexbox layouts
```

## 🏗️ SYSTEM ARCHITECTURE

### High-Level Data Flow
```
NFC Tag → URL Fragment → Base64 Decode → Protobuf Decode →
CodeRef Format → FHIR Bundle → View Model → UI Rendering
```

### Core Processing Pipeline
```javascript
// Primary data transformation chain
NFCFragment → base64ToUint8Array() → protobuf.decode() →
convertFhirToCodeRef() → processAndRenderAll() → UI Components
```

### Module Structure
```
/
├── index.html                 # Application entry point
├── script.js                 # Core application logic (~5000 lines)
├── style.css                 # Complete CSS system (~500 lines)
├── config/
│   └── constants.js          # Centralized configuration
├── util/
│   ├── base64.js            # Base64 encoding utilities
│   └── json.js              # JSON parsing utilities
├── resources/
│   ├── nfc_payload.proto    # Current protobuf schema
│   ├── nfc_payload_legacy.proto # Legacy compatibility
│   └── vendor/              # External libraries
├── payload-1.json           # Primary demo FHIR Bundle
├── payload-2.json           # Secondary demo payload
└── memory/                  # Development memory system
```

## 📊 DATA MODELS & STRUCTURES

### FHIR Bundle Structure
```javascript
// Input: Standard FHIR R4 Bundle
{
  "resourceType": "Bundle",
  "type": "document",
  "entry": [
    { "resource": { "resourceType": "Composition" } },
    { "resource": { "resourceType": "Patient" } },
    { "resource": { "resourceType": "Observation" } }, // Vitals
    { "resource": { "resourceType": "Condition" } },   // Conditions
    { "resource": { "resourceType": "MedicationStatement" } }, // Events
    { "resource": { "resourceType": "AllergyIntolerance" } }   // Allergies
  ]
}
```

### CodeRef Internal Format
```javascript
// Intermediate processing format
{
  patient: {
    given: string,
    family: string,
    gender: CodeRef,
    bloodGroup: CodeRef,
    nhsId: CodeRef,
    serviceId: CodeRef,
    dob: string,
    rank: string,
    nationality: string
  },
  stageSections: {
    poi: { vitals: [], conditions: [], events: [] },
    casevac: { vitals: [], conditions: [], events: [] },
    axp: { vitals: [], conditions: [], events: [] },
    medevac: { vitals: [], conditions: [], events: [] },
    r1: { vitals: [], conditions: [], events: [] },
    fwdTacevac: { vitals: [], conditions: [], events: [] },
    r2: { vitals: [], conditions: [], events: [] },
    rearTacevac: { vitals: [], conditions: [], events: [] },
    r3: { vitals: [], conditions: [], events: [] }
  },
  allergies: AllergyIntolerance[],
  summary: { totals: { vitals: N, conditions: N, events: N } }
}
```

### Protobuf Schema (NFCPayload)
```protobuf
message NFCPayload {
    Patient patient = 1;
    Stage poi = 2;
    Stage medevac = 3;
    Stage r1 = 4;
    Stage r2 = 5;
    Stage casevac = 6;
    Stage r3 = 7;
    int64 t = 8;
    BundleMetadata bundleMetadata = 9;
    repeated Allergy allergies = 10;
}

message CodeRef {
    oneof system_reference {
        string sys = 1;
        SystemType system_id = 9;
    }
    string code = 2;
    ClinicalStatus clinical_status = 10;
    VerificationStatus verification_status = 11;
    ObservationCategory category = 12;
}
```

## 🎨 USER INTERFACE ARCHITECTURE

### Layout System
```css
/* Primary Grid Layout */
.main-container {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-areas: "left-pane middle-pane right-pane";
    gap: var(--standard-padding);
}

/* Responsive breakpoints */
@media (max-width: 768px) {
    .main-container {
        grid-template-columns: 1fr;
        grid-template-areas: "left-pane" "middle-pane" "right-pane";
    }
}
```

### CSS Variables System
```css
:root {
    /* Base sizing */
    --size-multiplier: 1.0;
    --standard-padding: calc(12px * var(--size-multiplier));
    --font-size-uniform: calc(14px * var(--size-multiplier));

    /* Color system */
    --color-poi: #ffcccc;
    --color-casevac: #ffd4a3;
    --color-axp: #ffe0b2;
    --color-medevac: #ffe7c0;
    --color-r1: #c8e6c9;
    --color-fwd-tacevac: #b7e0e2;
    --color-r2: #b3daff;
    --color-rear-tacevac: #e7c6f0;
    --color-r3: #c3c5ff;
}
```

### Component Architecture

#### Info Box System
```javascript
// Dynamic component generation
const infoBoxConfig = [
    { title: 'Patient Demographics', colorClass: 'grey', dataKey: 'patient' },
    { title: 'Clinical Summary', colorClass: 'khaki', dataKey: 'clinicalSummary' },
    { title: 'Point of Injury and/or Illness', shortTitle: 'POI', colorClass: 'red', dataKey: 'poi' },
    { title: 'Casualty Evacuation', shortTitle: 'CASEVAC', colorClass: 'yellow', dataKey: 'casevac' },
    { title: 'Ambulance Exchange Point', shortTitle: 'AXP', colorClass: 'axp', dataKey: 'axp' },
    { title: 'Medical Evacuation', shortTitle: 'MEDEVAC', colorClass: 'orange', dataKey: 'medevac' },
    { title: 'Role 1 Care', shortTitle: 'R1', colorClass: 'green', dataKey: 'r1' },
    { title: 'Forward Tactical Evacuation', shortTitle: 'Fwd TACEVAC', colorClass: 'fwd-tacevac', dataKey: 'fwdTacevac' },
    { title: 'Role 2 Care', shortTitle: 'R2', colorClass: 'blue', dataKey: 'r2' },
    { title: 'Rear Tactical Evacuation', shortTitle: 'Rear TACEVAC', colorClass: 'rear-tacevac', dataKey: 'rearTacevac' },
    { title: 'Role 3 Care', shortTitle: 'R3', colorClass: 'purple', dataKey: 'r3' }
];
```

#### Dual Title Display System
```javascript
// Implemented feature: Shows both short and full titles
const DUAL_TITLE_CONFIG = {
    enabled: true,
    transparency: 0.35, // 35% transparency for full title
    enabledPanes: new Set(['patient', 'clinicalSummary', 'poi', 'casevac', 'axp', 'medevac', 'r1', 'fwdTacevac', 'r2', 'rearTacevac', 'r3'])
};
```

#### MIST Format Pills
```javascript
// Medical data displayed as colored pills in chronological order
// MIST = Military format: Mechanism, Injury, Symptoms, Treatment
// Vitals: Blue pills with time/value/unit
// Conditions: Red/orange pills with onset dates
// Events: Green pills with administration times
// First pill per section shows full date: "15 Jan 24 16:00"
// Subsequent pills show time only: "16:00"
```

### Chart.js Integration
```javascript
// Medical timeline visualization with custom plugins
const chartConfig = {
    type: 'line',
    data: {
        datasets: vitalsDatasets // Multi-vital tracking
    },
    options: {
        responsive: true,
        plugins: {
            tooltip: {
                usePointStyle: true,
                boxWidth: 8,
                boxHeight: 8,
                displayColors: true
            }
        }
    },
    plugins: [
        timebaseBackgroundPlugin, // Stage-colored timeline regions
        customLegendPlugin       // Collision-aware legend positioning
    ]
};
```

### Complete Chart.js Implementation

#### Vitals Chart Rendering System
```javascript
// Main vitals chart rendering with multi-dataset support
function renderVitalsChart(viewModel) {
    const canvas = document.getElementById('vitals-chart');
    const emptyState = document.getElementById('vitals-empty');

    if (!canvas) return;

    if (!viewModel || !viewModel.stageSections) {
        destroyVitalsChart();
        if (emptyState) emptyState.style.display = 'flex';
        canvas.style.display = 'none';
        return;
    }

    const stageSections = viewModel.stageSections;
    const datasetsMap = new Map();

    // Extract vital signs data from all stages
    stageKeys.forEach(stageKey => {
        const section = stageSections[stageKey];
        if (!section || !Array.isArray(section.vitals) || !section.vitals.length) return;

        const stageTitle = stageTitleLookup[stageKey] || stageKey;
        const stageShort = stageTitle.match(/\(([^)]+)\)/)?.[1] || stageTitle;

        section.vitals.forEach(pill => {
            if (!pill) return;
            const raw = pill.rawData || {};
            const timeString = raw.dateTime || raw.time;
            if (!timeString) return;

            const timestamp = new Date(timeString).getTime();
            if (!Number.isFinite(timestamp)) return;

            let value = Number(raw.value);
            if (!Number.isFinite(value) && raw.value != null) {
                value = Number.parseFloat(raw.value);
            }
            if (!Number.isFinite(value)) {
                const valueMatch = typeof pill.value === 'string'
                    ? pill.value.match(/-?\d+(?:\.\d+)?/)
                    : null;
                value = valueMatch ? Number(valueMatch[0]) : Number.NaN;
            }
            if (!Number.isFinite(value)) return;

            let unit = raw.unit || '';
            if (!unit && typeof pill.value === 'string') {
                const unitGuess = pill.value.replace(/-?\d+(?:\.\d+)?\s*/, '').trim();
                if (unitGuess && unitGuess.length <= 6) {
                    unit = unitGuess;
                }
            }

            const type = raw.description
                || (typeof pill.label === 'string' ? pill.label.split('•')[1]?.trim() : 'Vital');
            const datasetKey = type || 'Vital';

            const entry = {
                x: timestamp,
                y: value,
                meta: {
                    type: datasetKey,
                    unit,
                    stage: stageTitle,
                    stageShort,
                    value,
                    dateTime: timeString
                }
            };

            if (!datasetsMap.has(datasetKey)) {
                datasetsMap.set(datasetKey, []);
            }
            datasetsMap.get(datasetKey).push(entry);
        });
    });

    let minTime = Infinity;
    let maxTime = -Infinity;

    const datasets = Array.from(datasetsMap.entries()).map(([label, points]) => {
        points.sort((a, b) => a.x - b.x);
        const color = getVitalColor(label);

        if (points.length) {
            minTime = Math.min(minTime, points[0].x);
            maxTime = Math.max(maxTime, points[points.length - 1].x);
        }

        return {
            label,
            data: points,
            borderColor: color,
            backgroundColor: color,
            tension: 0.25,
            pointRadius: 3,
            pointHoverRadius: 5,
            spanGaps: true
        };
    });

    // Chart configuration with custom plugins
    const config = {
        type: 'line',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'point'
            },
            plugins: {
                legend: {
                    display: false // Using custom legend plugin
                },
                tooltip: {
                    usePointStyle: true,
                    boxWidth: 8,
                    boxHeight: 8,
                    displayColors: true,
                    callbacks: {
                        title: function(context) {
                            const point = context[0];
                            const meta = point.raw.meta;
                            return `${meta.stage} - ${meta.type}`;
                        },
                        label: function(context) {
                            const meta = context.raw.meta;
                            return `${meta.value} ${meta.unit}`;
                        },
                        afterLabel: function(context) {
                            const meta = context.raw.meta;
                            return formatDateTime(meta.dateTime);
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        displayFormats: {
                            minute: 'HH:mm',
                            hour: 'HH:mm',
                            day: 'dd MMM'
                        }
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            }
        },
        plugins: [timebaseBackgroundPlugin, customLegendPlugin]
    };

    // Create or update chart instance
    if (window.vitalsChart) {
        window.vitalsChart.destroy();
    }

    window.vitalsChart = new Chart(canvas, config);
}

// Vital color assignment system
const vitalColorPalette = [
    '#d32f2f', '#1976d2', '#388e3c', '#f57f17', '#7b1fa2', '#00796b', '#5d4037', '#c2185b'
];
const vitalColorAssignments = new Map();
let vitalColorIndex = 0;

function getVitalColor(vitalType) {
    if (!vitalColorAssignments.has(vitalType)) {
        const color = vitalColorPalette[vitalColorIndex % vitalColorPalette.length];
        vitalColorAssignments.set(vitalType, color);
        vitalColorIndex += 1;
    }
    return vitalColorAssignments.get(vitalType);
}
```

#### Timebase Background Plugin (Complete Implementation)
```javascript
// Stage color mapping for timeline backgrounds
const stageColorMapping = {
    'poi': COLORS.STAGE_POI,              // '#ffcccc' (POI uses pink)
    'casevac': COLORS.STAGE_ORANGE,       // '#ffe0b2'
    'axp': '#FFD699',                     // Tuned between CASEVAC/MEDEVAC hues
    'medevac': COLORS.STAGE_YELLOW,       // '#ffe899'
    'r1': COLORS.STAGE_GREEN,             // '#c8e6c9'
    'fwdTacevac': COLORS.STAGE_GREEN,     // '#c8e6c9' (Forward TACEVAC uses green)
    'r2': COLORS.STAGE_BLUE,              // '#a8d2ff'
    'rearTacevac': COLORS.STAGE_BLUE,     // '#a8d2ff' (Rear TACEVAC uses blue)
    'r3': COLORS.STAGE_PURPLE             // '#e1bee7'
};

// Complete timebase background plugin with continuous regions
const timebaseBackgroundPlugin = {
    id: 'timebaseBackground',
    beforeDraw(chart) {
        const activeViewModel = appState.currentViewModel;
        if (!activeViewModel || !activeViewModel.stageSections) return;

        const { ctx, chartArea, scales } = chart;
        const datasets = chart.data.datasets;

        if (!datasets.length || !scales.x) return;

        ctx.save();

        // Collect stages with data and their time ranges
        const stagesWithData = [];

        stageKeys.forEach(stageKey => {
            const stageSection = activeViewModel.stageSections[stageKey];
            if (!stageSection) return;

            // Check if stage has any data (vitals, conditions, events)
            const hasData = (stageSection.vitals && stageSection.vitals.length > 0) ||
                           (stageSection.conditions && stageSection.conditions.length > 0) ||
                           (stageSection.events && stageSection.events.length > 0);

            if (!hasData) return;

            // Collect all timestamps for this stage
            const timestamps = [];

            ['vitals', 'conditions', 'events'].forEach(dataType => {
                const items = stageSection[dataType] || [];
                items.forEach(item => {
                    const timeString = item.rawData?.dateTime || item.rawData?.time || item.time || item.onset;
                    if (timeString) {
                        const timestamp = new Date(timeString).getTime();
                        if (Number.isFinite(timestamp)) {
                            timestamps.push(timestamp);
                        }
                    }
                });
            });

            if (timestamps.length > 0) {
                stagesWithData.push({
                    key: stageKey,
                    start: Math.min(...timestamps),
                    end: Math.max(...timestamps),
                    color: stageColorMapping[stageKey]
                });
            }
        });

        if (stagesWithData.length === 0) return;

        // Sort stages by their first data point
        stagesWithData.sort((a, b) => a.start - b.start);

        // Calculate overall timeline boundaries
        const timelineStart = scales.x.min;
        const timelineEnd = Math.max(...stagesWithData.map(s => s.end));

        // Create continuous segments with midpoint boundaries
        const segments = [];

        if (stagesWithData.length === 1) {
            // Single stage covers entire timeline
            segments.push({
                start: timelineStart,
                end: timelineEnd,
                color: stagesWithData[0].color,
                key: stagesWithData[0].key
            });
        } else {
            // Multiple stages - calculate boundaries
            for (let i = 0; i < stagesWithData.length; i++) {
                const currentStage = stagesWithData[i];
                let segmentStart, segmentEnd;

                if (i === 0) {
                    // First stage: from x-axis start to midpoint with next stage
                    segmentStart = timelineStart;
                    const nextStage = stagesWithData[i + 1];
                    segmentEnd = currentStage.end + (nextStage.start - currentStage.end) / 2;
                } else if (i === stagesWithData.length - 1) {
                    // Last stage: from midpoint with previous stage to timeline end
                    const prevStage = stagesWithData[i - 1];
                    segmentStart = prevStage.end + (currentStage.start - prevStage.end) / 2;
                    segmentEnd = timelineEnd;
                } else {
                    // Middle stage: from midpoint with previous to midpoint with next
                    const prevStage = stagesWithData[i - 1];
                    const nextStage = stagesWithData[i + 1];
                    segmentStart = prevStage.end + (currentStage.start - prevStage.end) / 2;
                    segmentEnd = currentStage.end + (nextStage.start - currentStage.end) / 2;
                }

                segments.push({
                    start: segmentStart,
                    end: segmentEnd,
                    color: currentStage.color,
                    key: currentStage.key
                });
            }
        }

        // Draw continuous background segments with 28% opacity
        segments.forEach(segment => {
            if (!segment.color) return;

            const startX = scales.x.getPixelForValue(segment.start);
            const endX = scales.x.getPixelForValue(segment.end);
            const clampedEndX = Math.min(endX, chartArea.left + chartArea.width);
            const width = clampedEndX - startX;

            if (width > 0) {
                ctx.fillStyle = hexToRgba(segment.color, 0.28); // 28% opacity
                ctx.fillRect(startX, chartArea.top, width, chartArea.bottom - chartArea.top);
            }
        });

        // Calculate text size based on narrowest region (50% constraint)
        const minRegionWidth = Math.min(...segments.map(segment => {
            const startX = scales.x.getPixelForValue(segment.start);
            const endX = scales.x.getPixelForValue(segment.end);
            const clampedEndX = Math.min(endX, chartArea.left + chartArea.width);
            return clampedEndX - startX;
        }));

        const maxTextWidth = minRegionWidth * 0.5; // 50% width of narrowest
        const paddingLeft = 8;  // Same padding as OPCP panes
        const paddingTop = 6;   // Balanced top padding

        // Find the longest shortName to size for
        const allShortNames = segments.map(segment => {
            const stageKey = segment.key.toUpperCase();
            return CARE_STAGES[stageKey]?.shortName || segment.key;
        });

        // Calculate appropriate text size
        let fontSize = 16;
        ctx.font = `bold ${fontSize}px Arial`;
        const longestText = allShortNames.reduce((a, b) =>
            ctx.measureText(a).width > ctx.measureText(b).width ? a : b);

        while (ctx.measureText(longestText).width > maxTextWidth && fontSize > 8) {
            fontSize -= 1;
            ctx.font = `bold ${fontSize}px Arial`;
        }

        // Draw titles for each segment at 95% opacity
        segments.forEach(segment => {
            if (!segment.color) return;

            const startX = scales.x.getPixelForValue(segment.start);
            const endX = scales.x.getPixelForValue(segment.end);
            const clampedEndX = Math.min(endX, chartArea.left + chartArea.width);
            const width = clampedEndX - startX;

            if (width > 0) {
                // Get shortName from CARE_STAGES
                const stageKey = segment.key.toUpperCase();
                const shortName = CARE_STAGES[stageKey]?.shortName || segment.key;

                // Set text properties
                ctx.font = `bold ${fontSize}px Arial`;
                ctx.fillStyle = hexToRgba(segment.color, 0.95); // 95% opacity - more pronounced
                ctx.textAlign = 'left';
                ctx.textBaseline = 'top';

                // Draw title at top-left of region with padding
                ctx.fillText(shortName, startX + paddingLeft, chartArea.top + paddingTop);
            }
        });

        ctx.restore();
    }
};
```

#### Custom Legend Plugin (Collision Detection)
```javascript
// Advanced collision-aware legend positioning system
const customLegendPlugin = {
    id: 'customLegend',
    beforeDraw(chart) {
        const { ctx, chartArea, scales } = chart;
        const datasets = chart.data.datasets;

        if (!datasets.length || !scales.y) return;

        ctx.save();
        ctx.font = '12px Arial';
        ctx.textBaseline = 'middle';

        // Sort datasets by last data point value (descending)
        const sortedDatasets = datasets.slice().sort((a, b) => {
            const aLastPoint = a.data && a.data.length > 0 ? a.data[a.data.length - 1] : null;
            const bLastPoint = b.data && b.data.length > 0 ? b.data[b.data.length - 1] : null;
            const aValue = aLastPoint ? aLastPoint.y : -Infinity;
            const bValue = bLastPoint ? bLastPoint.y : -Infinity;
            return bValue - aValue; // Descending order
        });

        // Calculate positions with collision detection
        const legendItems = [];
        const legendX = chartArea.right + 10; // 10px margin from chart edge

        // Measure all text widths first
        let maxTextWidth = 0;
        sortedDatasets.forEach(dataset => {
            const textWidth = ctx.measureText(dataset.label).width;
            maxTextWidth = Math.max(maxTextWidth, textWidth);
        });

        // Heart Rate/Diastolic BP gap detection for minimum spacing
        let minGapSpacing = 20; // Default minimum gap
        for (let i = 0; i < sortedDatasets.length - 1; i++) {
            const currentDataset = sortedDatasets[i];
            const nextDataset = sortedDatasets[i + 1];

            // Check if these are Heart Rate and Diastolic BP
            if ((currentDataset.label.includes('Heart Rate') && nextDataset.label.includes('Diastolic')) ||
                (currentDataset.label.includes('Diastolic') && nextDataset.label.includes('Heart Rate'))) {

                const currentLastPoint = currentDataset.data[currentDataset.data.length - 1];
                const nextLastPoint = nextDataset.data[nextDataset.data.length - 1];

                if (currentLastPoint && nextLastPoint) {
                    const currentY = scales.y.getPixelForValue(currentLastPoint.y);
                    const nextY = scales.y.getPixelForValue(nextLastPoint.y);
                    minGapSpacing = Math.abs(currentY - nextY);
                    break;
                }
            }
        }

        // Position legend items with collision detection
        sortedDatasets.forEach((dataset, index) => {
            const lastDataPoint = dataset.data && dataset.data.length > 0
                ? dataset.data[dataset.data.length - 1]
                : null;

            if (!lastDataPoint) return;

            let targetY = scales.y.getPixelForValue(lastDataPoint.y);

            // Apply collision detection
            for (const existingItem of legendItems) {
                const distance = Math.abs(targetY - existingItem.y);
                if (distance < minGapSpacing) {
                    // Move down by minimum gap
                    targetY = existingItem.y + minGapSpacing;
                }
            }

            // Ensure legend stays within chart bounds
            const textHeight = 12; // Font size
            const minY = chartArea.top + textHeight / 2;
            const maxY = chartArea.bottom - textHeight / 2;
            targetY = Math.max(minY, Math.min(targetY, maxY));

            legendItems.push({
                dataset,
                y: targetY,
                textWidth: ctx.measureText(dataset.label).width
            });
        });

        // Adjust chart width if legend overlaps
        const totalLegendWidth = maxTextWidth + 30; // Text + margin + point
        const availableWidth = chart.width - chartArea.right - 20; // 20px buffer

        if (totalLegendWidth > availableWidth) {
            // Chart should flex smaller to accommodate legend
            const adjustment = totalLegendWidth - availableWidth;
            chartArea.right -= adjustment;
        }

        // Draw legend items
        legendItems.forEach(item => {
            // Draw colored point (4px radius)
            ctx.fillStyle = item.dataset.borderColor;
            ctx.beginPath();
            ctx.arc(legendX, item.y, 4, 0, 2 * Math.PI);
            ctx.fill();

            // Draw label text
            ctx.fillStyle = '#333';
            ctx.textAlign = 'left';
            ctx.fillText(item.dataset.label, legendX + 10, item.y);
        });

        ctx.restore();
    }
};
```

### Dual Title Display System Implementation
```javascript
// Complete dual title configuration and logic
const DUAL_TITLE_CONFIG = {
    enabled: true,
    transparency: 0.35, // 35% opacity for full title
    enabledPanes: new Set(['patient', 'clinicalSummary', 'poi', 'casevac', 'axp', 'medevac', 'r1', 'fwdTacevac', 'r2', 'rearTacevac', 'r3'])
};

// Title availability management with dual title support
function setTitleAvailability(titleElement, hasData) {
    if (!titleElement) return;

    const container = titleElement.closest('.info-box');
    const dataKey = container?.getAttribute('data-key');

    if (hasData) {
        titleElement.classList.remove('is-empty');
        if (container) {
            container.classList.remove('empty');
        }
    } else {
        titleElement.classList.add('is-empty');
        if (container) {
            container.classList.add('empty');
        }
    }

    // Apply dual title logic for enabled panes
    if (DUAL_TITLE_CONFIG.enabled && DUAL_TITLE_CONFIG.enabledPanes.has(dataKey)) {
        const config = infoBoxConfig.find(c => c.dataKey === dataKey);
        if (config && config.shortTitle) {
            titleElement.innerHTML = hasData
                ? `<span class="short-title">${config.shortTitle}</span><span class="full-title">${config.title}</span>`
                : `<span class="short-title">${config.shortTitle}</span><span class="empty-text">• No data available</span>`;
            titleElement.classList.add('dual-title');
        }
    }
}

// Info box creation with dual title support
function createInfoBoxes() {
    const container = document.getElementById('info-boxes-container');
    if (!container) return;

    infoBoxConfig.forEach(config => {
        const infoBox = document.createElement('div');
        infoBox.classList.add('info-box', config.colorClass);
        infoBox.setAttribute('data-key', config.dataKey);

        const title = document.createElement('div');
        title.classList.add('info-title');

        // Initialize with dual title if applicable
        if (DUAL_TITLE_CONFIG.enabled && DUAL_TITLE_CONFIG.enabledPanes.has(config.dataKey) && config.shortTitle) {
            title.innerHTML = `<span class="short-title">${config.shortTitle}</span><span class="empty-text">• No data available</span>`;
            title.classList.add('dual-title', 'is-empty');
        } else {
            title.textContent = config.title;
            title.classList.add('is-empty');
        }

        infoBox.appendChild(title);
        infoBox.classList.add('empty');
        container.appendChild(infoBox);
    });
}
```

### Complete CSS Styling Implementation
```css
/* CSS Variables System - Complete palette */
:root {
    /* Base sizing system */
    --size-multiplier: 1.0;
    --standard-padding: calc(12px * var(--size-multiplier));
    --font-size-uniform: calc(14px * var(--size-multiplier));
    --detail-vertical-padding: calc(4px * var(--size-multiplier));

    /* Dual title system */
    --dual-title-opacity: 0.35; /* 35% transparency for full titles */

    /* Complete OPCP color system */
    --bg-color-patient: #f5f5f5;
    --bg-color-patient-darker: #bdbdbd;
    --text-color-dark: #333333;

    --bg-color-khaki: #f0e68c;
    --text-color-khaki: #333333;

    /* POI (Point of Injury) - Red */
    --bg-color-poi: #ffcccc;
    --bg-color-poi-darker: #e57373;
    --text-color-poi: #333333;

    /* CASEVAC - Orange */
    --bg-color-orange: #ffd4a3;
    --bg-color-orange-darker: #ff8a65;
    --text-color-orange: #333333;

    /* AXP - Tuned orange between CASEVAC/MEDEVAC */
    --bg-color-axp: #ffe0b2;
    --bg-color-axp-darker: #ffab91;
    --text-color-axp: #333333;

    /* MEDEVAC - Yellow */
    --bg-color-yellow: #ffe7c0;
    --bg-color-yellow-darker: #ffb74d;
    --text-color-yellow: #333333;

    /* R1 - Green */
    --bg-color-green: #c8e6c9;
    --bg-color-green-darker: #81c784;
    --text-color-green: #333333;

    /* Forward TACEVAC - Teal */
    --bg-color-fwd-tacevac: #b7e0e2;
    --bg-color-fwd-tacevac-darker: #4db6ac;
    --text-color-fwd-tacevac: #333333;

    /* R2 - Blue */
    --bg-color-blue: #b3daff;
    --bg-color-blue-darker: #64b5f6;
    --text-color-blue: #333333;

    /* Rear TACEVAC - Purple */
    --bg-color-rear-tacevac: #e7c6f0;
    --bg-color-rear-tacevac-darker: #ba68c8;
    --text-color-purple: #333333;

    /* R3 - Richer lavender tone */
    --bg-color-purple: #c3c5ff;
    --bg-color-purple-darker: #9575cd;
    --text-color-r3: #333333;

    /* Detail box colors */
    --bg-color-detail: rgba(255, 255, 255, 0.8);
    --bg-color-detail-value: rgba(255, 255, 255, 0.9);
}

/* Dual title system implementation */
.info-title.dual-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--standard-padding);
}

.info-title .short-title {
    flex: 0 0 auto;
    font-weight: bold;
    white-space: nowrap;
}

.info-title .full-title {
    flex: 0 0 auto;
    font-weight: bold;
    opacity: var(--dual-title-opacity, 0.35); /* 35% transparency */
    white-space: nowrap;
}

/* Empty state text centering for dual titles */
.info-title.dual-title.is-empty {
    position: relative;
}

.info-title.dual-title.is-empty .empty-text {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    flex: none;
}

/* Patient detail pills system */
.patient-details-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: var(--standard-padding);
    width: 100%;
}

.detail-box {
    display: flex;
    align-items: center;
    height: calc(var(--standard-padding) * 2);
    border-radius: calc(var(--standard-padding) * 2);
    overflow: hidden; /* Pill shape */
}

.detail-label,
.detail-value {
    padding: var(--detail-vertical-padding) 10px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    white-space: nowrap;
    font-size: calc(var(--font-size-uniform) * 0.9);
    line-height: 1;
}

.detail-label {
    background-color: var(--bg-color-detail);
    font-weight: normal;
}

.detail-value {
    background-color: var(--bg-color-detail-value);
    font-weight: bold;
    color: var(--text-color-dark);
}

/* Complete OPCP stage color implementations */
.info-box.grey {
    background-color: var(--bg-color-patient);
    color: var(--text-color-dark);
}

.info-box.red {
    background-color: var(--bg-color-poi);
    color: var(--text-color-poi);
}

.info-box.orange {
    background-color: var(--bg-color-orange);
    color: var(--text-color-orange);
}

.info-box.yellow {
    background-color: var(--bg-color-yellow);
    color: var(--text-color-yellow);
}

.info-box.axp {
    background-color: var(--bg-color-axp);
    color: var(--text-color-axp);
}

.info-box.green {
    background-color: var(--bg-color-green);
    color: var(--text-color-green);
}

.info-box.fwd-tacevac {
    background-color: var(--bg-color-fwd-tacevac);
    color: var(--text-color-fwd-tacevac);
}

.info-box.blue {
    background-color: var(--bg-color-blue);
    color: var(--text-color-blue);
}

.info-box.rear-tacevac {
    background-color: var(--bg-color-rear-tacevac);
    color: var(--text-color-purple);
}

.info-box.purple {
    background-color: var(--bg-color-purple);
    color: var(--text-color-r3);
}

.info-box.khaki {
    background-color: var(--bg-color-khaki);
    color: var(--text-color-khaki);
}

/* Detail box color-specific styles for all stages */
.detail-box.grey .detail-label {
    background-color: var(--bg-color-patient-darker);
    color: white;
}

.detail-box.poi .detail-label,
.detail-box.red .detail-label {
    background-color: var(--bg-color-poi-darker);
    color: white;
}

.detail-box.orange .detail-label {
    background-color: var(--bg-color-orange-darker);
    color: white;
}

.detail-box.yellow .detail-label {
    background-color: var(--bg-color-yellow-darker);
    color: white;
}

.detail-box.axp .detail-label {
    background-color: var(--bg-color-axp-darker);
    color: white;
}

.detail-box.green .detail-label {
    background-color: var(--bg-color-green-darker);
    color: white;
}

.detail-box.fwd-tacevac .detail-label {
    background-color: var(--bg-color-fwd-tacevac-darker);
    color: white;
}

.detail-box.blue .detail-label {
    background-color: var(--bg-color-blue-darker);
    color: white;
}

.detail-box.rear-tacevac .detail-label {
    background-color: var(--bg-color-rear-tacevac-darker);
    color: white;
}

.detail-box.purple .detail-label {
    background-color: var(--bg-color-purple-darker);
    color: white;
}

.detail-box.khaki .detail-label {
    background-color: #d4b942; /* Khaki darker variant */
    color: white;
}

/* Ghost item system for even pill spacing */
.detail-ghost-item {
    flex: 1 0 0;
    min-width: 0;
    height: 0;
    visibility: hidden;
}

/* Empty state collapsed styling */
.info-box.empty {
    min-height: 45px; /* Collapsed height */
}

.info-box.empty .info-title {
    margin: 0;
    padding: var(--standard-padding);
}

/* Stage details container */
.stage-details-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: calc(var(--standard-padding) * 0.25);
    padding: var(--standard-padding);
}

/* Toast notification system - exact positioning */
.toast-container {
    position: static;
    margin-left: auto;
    margin-right: auto;
    width: fit-content;
    margin-top: -2px; /* Fine-tuning for perfect alignment */
    z-index: 1000;
}

.toast-message {
    background: var(--bg-color-green-darker);
    color: white;
    padding: var(--standard-padding);
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    font-size: var(--font-size-uniform);
    white-space: nowrap;
}

/* Responsive breakpoints */
@media (max-width: 480px) {
    :root { --size-multiplier: 0.8; }
    .info-box { margin-bottom: calc(var(--standard-padding) * 0.5); }
}

@media (min-width: 481px) and (max-width: 768px) {
    :root { --size-multiplier: 0.9; }
    .main-container { grid-template-columns: 1fr 1fr; }
}

@media (min-width: 1200px) {
    :root { --size-multiplier: 1.1; }
    .main-container { max-width: 1400px; margin: 0 auto; }
}
```

## 🔧 CORE FUNCTIONS & BUSINESS LOGIC

### Primary Data Processing Functions

#### FHIR to CodeRef Conversion
```javascript
function convertFhirToCodeRef(fhirBundle) {
    // Core transformation: FHIR Bundle → Internal CodeRef format
    // 1. Extract Patient resource and map demographics
    // 2. Extract Observations → Vitals by care stage
    // 3. Extract Conditions → Conditions by care stage
    // 4. Extract MedicationStatements → Events by care stage
    // 5. Extract AllergyIntolerances → Allergies array
    // 6. Generate summary statistics

    const patient = extractPatientDemographics(fhirBundle);
    const stageSections = extractStageData(fhirBundle);
    const allergies = extractAllergies(fhirBundle);
    const summary = generateSummary(stageSections, allergies);

    return { patient, stageSections, allergies, summary };
}
```

#### UI Rendering Orchestration
```javascript
function processAndRenderAll(viewModel) {
    // Main UI update function
    // 1. Render patient demographics box
    // 2. Render clinical summary with allergies
    // 3. Render all 9 OPCP stage sections
    // 4. Update vitals timeline chart
    // 5. Update raw payload display

    renderPatientDemographicsBox(viewModel.patient);
    renderClinicalSummaryBox(viewModel.patient, viewModel.allergies, viewModel.summary);
    renderStageSections(viewModel.stageSections);
    renderVitalsChart(viewModel.stageSections);
    updateRawPayload(viewModel.rawPayload);
}
```

#### Medical Data Extraction
```javascript
// Care stage detection from FHIR extensions
function extractCareStage(resource) {
    const extension = resource.extension?.find(ext =>
        ext.url === FHIR_EXTENSIONS.CARE_STAGE
    );
    return extension?.valueString || 'poi'; // Default to POI
}

// Timestamp normalization across resource types
function extractTimestamp(item) {
    return item.time || item.onset || item.rawData?.dateTime || null;
}

// NHS Number formatting: "1234567890" → "123 456 7890"
function formatNHSNumber(nhsNumber) {
    if (!nhsNumber || nhsNumber.length !== 10) return nhsNumber;
    return `${nhsNumber.slice(0,3)} ${nhsNumber.slice(3,6)} ${nhsNumber.slice(6)}`;
}
```

### Encoding/Decoding Pipeline

#### NFC Fragment Processing
```javascript
function processNFCFragment() {
    const fragment = window.location.hash.substring(1);
    if (!fragment) return null;

    try {
        // 1. URL-safe Base64 decode
        const binaryData = base64ToUint8Array(normaliseBase64(fragment));

        // 2. Attempt decompression with pako
        const decompressed = pako.inflate(binaryData);

        // 3. Protobuf decode with schema detection
        const payload = protobuf.decode(decompressed);

        // 4. Convert to FHIR Bundle
        const fhirBundle = codeRefToFhir(payload);

        return fhirBundle;
    } catch (error) {
        console.error('NFC fragment processing failed:', error);
        return null;
    }
}
```

#### Protobuf Integration
```javascript
// Dynamic schema detection for legacy compatibility
function detectProtobufSchema(binaryData) {
    try {
        // Try current schema first
        return { data: NFCPayload.decode(binaryData), schema: 'current' };
    } catch {
        try {
            // Fall back to legacy schema
            return { data: LegacyNFCPayload.decode(binaryData), schema: 'legacy' };
        } catch {
            throw new Error('Unsupported protobuf schema');
        }
    }
}
```

### Medical Terminology Services

#### Code Resolution System
```javascript
// Medical code lookup and validation
function resolveCode(codeRef) {
    const system = codeRef.sys || getSystemUrl(codeRef.system_id);
    const code = codeRef.code;

    switch(system) {
        case TERMINOLOGY_SYSTEMS.SNOMED_CT:
            return resolveSnomedCT(code);
        case TERMINOLOGY_SYSTEMS.LOINC:
            return resolveLOINC(code);
        case TERMINOLOGY_SYSTEMS.UCUM:
            return resolveUCUM(code);
        default:
            return { code, display: code, system };
    }
}

// Built-in terminology mappings for core concepts
const TERMINOLOGY_MAPPINGS = {
    // Gender codes
    'male': 'Male',
    'female': 'Female',
    'unknown': 'Unknown',

    // Blood group codes (ABO system)
    '278149003': 'A+', '278152006': 'A-',
    '278150003': 'B+', '278153001': 'B-',
    '278151004': 'AB+', '278154007': 'AB-',
    '278147001': 'O+', '278148006': 'O-',

    // Common vital signs (LOINC)
    '8480-6': 'Systolic Blood Pressure',
    '8462-4': 'Diastolic Blood Pressure',
    '8867-4': 'Heart Rate',
    '9279-1': 'Respiratory Rate',
    '8310-5': 'Body Temperature',
    '2710-2': 'Oxygen Saturation'
};
```

## 🎯 CRITICAL BUG FIXES REQUIRED

### 1. AllergyIntolerance Rendering Bug
```javascript
// CURRENT: Function receives allergies but never renders them
function renderClinicalSummaryBox(currentPatient, allergies, summary) {
    // BUG: allergies parameter completely unused
    // Missing allergy rendering logic in Clinical Summary
}

// REQUIRED FIX: Add allergy pills to Clinical Summary display
function renderAllergies(allergies) {
    return allergies.map(allergy => `
        <div class="pill allergy-pill">
            <span class="pill-label">Allergy:</span>
            <span class="pill-value">${allergy.substance}</span>
            <span class="pill-severity">${allergy.severity}</span>
        </div>
    `).join('');
}
```

### 2. Patient Identifier Extraction
```javascript
// CURRENT: Logic appears correct but values not displaying
const serviceNumber = patientData.identifier?.find(id =>
    id.type?.coding?.some(c => c.code === 'MIL')
)?.value;
const nhsNumber = formatNHSNumber(patientData.identifier?.find(id =>
    id.type?.text === 'NHS Number'
)?.value);

// INVESTIGATION NEEDED: Debug extraction chain
// - Verify FHIR Bundle contains identifiers
// - Check identifier.type structure matches query
// - Validate rendering logic displays extracted values
```

## 🎨 EXACT UI IMPLEMENTATION DETAILS

### Patient Demographics Box Implementation
```javascript
// Complete patient demographics rendering system
function createPatientDetailsElement(patientData, parentColorClass) {
    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('patient-details-container');

    const name = patientData.name?.[0] || {};
    const serviceNumber = patientData.identifier?.find(id =>
        id.type?.coding?.some(c => c.code === 'MIL'))?.value;
    const nhsNumber = formatNHSNumber(
        patientData.identifier?.find(id => id.type?.text === 'NHS Number')?.value
    );

    // Extract title and rank from prefix array
    const titleValue = name.prefix?.[0]; // First prefix is title (Mr, Mrs, etc.)
    const rankValue = name.prefix?.[1];  // Second prefix is rank (Drummer, etc.)

    const details = [
        { label: 'Title', value: titleValue },
        { label: 'Rank', value: rankValue },
        { label: 'Forename', value: name.given?.[0] },
        { label: 'Surname', value: name.family },
        { label: 'Sex', value: patientData.gender },
        { label: 'Date of Birth', value: formatDate(patientData.birthDate) },
        {
            label: 'Blood Group',
            value: (() => {
                const bloodExt = patientData.extension?.find(ext => ext.url?.includes('bloodGroup'));
                if (!bloodExt) return undefined;

                const coding = bloodExt?.valueCodeableConcept?.coding?.[0];
                if (coding) {
                    // Check for SNOMED CT system
                    if (coding.system?.includes('snomed.info/sct') && coding.code) {
                        const bloodGroupName = resolveCodeDisplay('sct', coding.code);
                        return bloodGroupName || coding.display || bloodExt?.valueCodeableConcept?.text;
                    }
                    if (coding.display) return coding.display;
                }
                return bloodExt?.valueCodeableConcept?.text;
            })()
        },
        {
            label: 'Nationality',
            value: patientData.extension?.find(ext =>
                ext.url?.includes('nationality'))?.valueCodeableConcept?.text || 'UK'
        },
        { label: 'Service Number', value: serviceNumber },
        { label: 'NHS Number', value: nhsNumber }
    ];

    details.forEach(detail => {
        if (detail.value) {
            detailsContainer.appendChild(createDetailBoxElement(detail.label, detail.value, parentColorClass));
        }
    });

    return detailsContainer;
}

// Detail box element factory with precise pill styling
function createDetailBoxElement(label, value, parentColorClass) {
    const detailBox = document.createElement('div');
    detailBox.classList.add('detail-box');
    if (parentColorClass) {
        detailBox.classList.add(parentColorClass);
    }

    const labelSpan = document.createElement('span');
    labelSpan.classList.add('detail-label');
    labelSpan.textContent = label;

    const valueSpan = document.createElement('span');
    valueSpan.classList.add('detail-value');
    valueSpan.textContent = value;

    detailBox.appendChild(labelSpan);
    detailBox.appendChild(valueSpan);

    return detailBox;
}

// Ghost item layout system for even spacing
function addGhostItems(container, count) {
    for (let i = 0; i < count; i += 1) {
        const ghost = document.createElement('div');
        ghost.classList.add('detail-ghost-item');
        container.appendChild(ghost);
    }
}
```

### Clinical Summary Box Implementation
```javascript
// CURRENT IMPLEMENTATION (BUG: allergies parameter unused)
function renderClinicalSummaryBox(currentPatient, allergies, summary) {
    const clinicalSummaryBox = document.querySelector('[data-key="clinicalSummary"]');
    if (!clinicalSummaryBox) return;

    const existingDetails = clinicalSummaryBox.querySelector('.patient-details-container');
    if (existingDetails) existingDetails.remove();

    const detailsContainer = document.createElement('div');
    detailsContainer.classList.add('patient-details-container');

    const detailItems = [];

    // Summary statistics display
    if (summary?.totals) {
        const { vitals = 0, conditions = 0, events = 0 } = summary.totals;
        detailItems.push({ label: 'Total Vitals', value: String(vitals) });
        detailItems.push({ label: 'Total Conditions', value: String(conditions) });
        detailItems.push({ label: 'Total Events', value: String(events) });
    }

    // Timestamp display
    if (summary?.timestamp) {
        detailItems.push({
            label: 'Created',
            value: formatDateTime(summary.timestamp.toISOString())
        });
    }

    // Patient comparison differences
    const differences = buildPatientDifferences(null, currentPatient);
    differences.forEach(diff => detailItems.push(diff));

    const titleElement = clinicalSummaryBox.querySelector('.info-title');

    if (detailItems.length) {
        detailItems.forEach(item => {
            detailsContainer.appendChild(createDetailBoxElement(item.label, item.value, 'khaki'));
        });

        clinicalSummaryBox.appendChild(detailsContainer);
        addGhostItems(detailsContainer, 10);
        setTitleAvailability(titleElement, true);
    } else {
        setTitleAvailability(titleElement, false);
    }
}
```

### MIST Format Stage Section Rendering
```javascript
// Medical stage sections with MIST (Mechanism, Injury, Symptoms, Treatment) organization
function renderStageSections(stageSections = {}) {
    stageKeys.forEach(stageKey => {
        const stageBox = document.querySelector(`[data-key="${stageKey}"]`);
        if (!stageBox) return;

        const existingContainer = stageBox.querySelector('.stage-details-container');
        if (existingContainer) existingContainer.remove();

        const config = infoBoxConfig.find(item => item.dataKey === stageKey);
        const stageColor = config ? config.colorClass : null;
        const stageData = stageSections[stageKey] || { vitals: [], conditions: [], events: [] };

        // MIST format sections
        const mistSections = [
            { type: 'Mechanism/Injury', items: stageData.conditions || [] },
            { type: 'Symptoms', items: stageData.vitals || [] },
            { type: 'Treatment', items: stageData.events || [] }
        ].filter(section => Array.isArray(section.items) && section.items.length);

        const titleElement = stageBox.querySelector('.info-title');

        if (!mistSections.length) {
            setTitleAvailability(titleElement, false);
            return;
        }

        setTitleAvailability(titleElement, true);

        const container = document.createElement('div');
        container.classList.add('stage-details-container');

        mistSections.forEach((section, sectionIndex) => {
            // Add section spacer (except for first section)
            if (sectionIndex > 0) {
                const spacer = document.createElement('div');
                spacer.style.width = '100%';
                spacer.style.height = 'calc(var(--standard-padding) * 0.25)'; // Minimal gap
                container.appendChild(spacer);
            }

            // Add items in this section with chronological pill formatting
            section.items.forEach((entry, itemIndex) => {
                if (!entry) return;

                // For first item in section, show full label. For subsequent items, extract coded description
                let displayLabel = entry.label;
                if (itemIndex > 0 && entry.label.includes('•')) {
                    displayLabel = entry.label.split('•')[1].trim();
                }

                const detail = createDetailBoxElement(displayLabel, entry.value, stageColor);
                detail.title = entry.tooltip;
                container.appendChild(detail);
            });
        });

        stageBox.appendChild(container);
    });
}
```

### 3. Data Pipeline Integrity Issues
- **Complete audit required** of FHIR → CodeRef → Protobuf → UI chain
- **Patient safety critical**: Missing allergy display could be life-threatening
- **Data loss points**: Identify where medical data disappears between stages
- **Rendering completeness**: Audit all UI functions for unused parameters

## 🚀 ESSENTIAL FEATURES & ENHANCEMENTS

### Demo Payload System
```javascript
// Interactive payload switching
const demoPayloads = {
    'payload-1.json': 'Complex military scenario with multiple stages',
    'payload-2.json': 'Civilian emergency transport scenario'
};

function loadDemoPayload(filename) {
    fetch(filename)
        .then(response => response.json())
        .then(fhirBundle => {
            const viewModel = convertFhirToCodeRef(fhirBundle);
            processAndRenderAll(viewModel);
            showToast('Demo payload loaded successfully');
        });
}
```

### Empty State Handling
```javascript
// Panes with no data show condensed empty state
function renderEmptyState(stageTitle) {
    return `
        <div class="info-box-title condensed">
            ${stageTitle}
        </div>
        <div class="empty-state-content">
            <span class="empty-indicator">• No data available</span>
        </div>
    `;
}
```

### Interactive Controls System
```html
<!-- Primary application controls -->
<div class="controls-container">
    <select id="demo-payload-select">
        <option value="payload-1.json">Demo Payload 1</option>
        <option value="payload-2.json">Demo Payload 2</option>
    </select>
    <button id="parse-button" onclick="parseCurrentInput()">Parse</button>
    <button id="encode-button" onclick="encodeToNFC()">Encode</button>
</div>
```

## 📱 RESPONSIVE DESIGN SYSTEM

### Breakpoint Strategy
```css
/* Mobile-first responsive approach */
@media (max-width: 480px) {
    :root { --size-multiplier: 0.8; }
    .info-box { margin-bottom: calc(var(--standard-padding) * 0.5); }
}

@media (min-width: 481px) and (max-width: 768px) {
    :root { --size-multiplier: 0.9; }
    .main-container { grid-template-columns: 1fr 1fr; }
}

@media (min-width: 1200px) {
    :root { --size-multiplier: 1.1; }
    .main-container { max-width: 1400px; margin: 0 auto; }
}
```

### Touch-Friendly Interactions
```css
/* Enhanced touch targets for mobile */
.pill, .button, .control-element {
    min-height: 44px; /* iOS recommended minimum */
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
}

/* Improved spacing for thumb navigation */
.pill {
    margin: calc(var(--standard-padding) * 0.25);
    padding: calc(var(--standard-padding) * 0.75);
}
```

## 🔒 SECURITY & VALIDATION

### Input Sanitization
```javascript
// Secure JSON parsing with validation
function safeParseJson(input) {
    try {
        const parsed = JSON.parse(input);
        return validateFhirBundle(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

// FHIR Bundle structure validation
function validateFhirBundle(bundle) {
    return bundle &&
           bundle.resourceType === 'Bundle' &&
           bundle.type === 'document' &&
           Array.isArray(bundle.entry);
}
```

### Medical Data Privacy
```javascript
// Ensure no sensitive data leakage in logs
function sanitizeForLogging(data) {
    const sanitized = { ...data };
    delete sanitized.patient?.identifier; // Remove identifiers
    delete sanitized.patient?.name;       // Remove names
    return sanitized;
}
```

## 🧪 TESTING STRATEGY

### Unit Testing Framework
```javascript
// Essential test cases for medical safety
const testSuite = {
    'FHIR Bundle Processing': {
        'Should extract patient demographics': testPatientExtraction,
        'Should preserve allergy information': testAllergyExtraction,
        'Should maintain care stage chronology': testStageOrdering,
        'Should format NHS numbers correctly': testNHSFormatting
    },
    'UI Rendering': {
        'Should display all provided allergies': testAllergyDisplay,
        'Should show empty states correctly': testEmptyStates,
        'Should maintain dual title transparency': testDualTitles
    },
    'Data Pipeline': {
        'Should survive encode/decode cycles': testRoundTrip,
        'Should handle compression correctly': testCompression,
        'Should detect schema versions': testSchemaDetection
    }
};
```

### Integration Testing
```javascript
// End-to-end pipeline validation
function testCompleteDataFlow() {
    const inputBundle = loadTestFhir();
    const viewModel = convertFhirToCodeRef(inputBundle);
    const encoded = encodeToProtobuf(viewModel);
    const decoded = decodeFromProtobuf(encoded);
    const rendered = processAndRenderAll(decoded);

    assert(viewModel.allergies.length === decoded.allergies.length);
    assert(extractedPatientIdentifiers.length > 0);
    assert(renderedAllergyElements.length === viewModel.allergies.length);
}
```

## 📦 DEPLOYMENT CONFIGURATION

### GitHub Pages Setup
```json
// package.json deployment configuration
{
  "scripts": {
    "dev": "live-server --port=8080 --host=localhost",
    "build": "echo 'Static site - no build required'",
    "deploy": "gh-pages -d . -b gh-pages",
    "deploy-dev2": "gh-pages -d . -b gh-pages2"
  },
  "devDependencies": {
    "gh-pages": "^3.2.3",
    "live-server": "^1.2.1"
  }
}
```

### Static Site Requirements
```html
<!-- Essential HTML structure -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NFC IPS Viewer</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="main-container">
        <div class="left-pane">
            <div id="info-boxes-container"></div>
        </div>
        <div class="middle-pane">
            <canvas id="vitals-chart"></canvas>
        </div>
        <div class="right-pane">
            <div id="raw-payload-display"></div>
        </div>
    </div>
    <div id="toast-container" class="toast-container"></div>

    <script src="resources/vendor/protobuf.min.js"></script>
    <script src="resources/vendor/pako.min.js"></script>
    <script src="resources/vendor/chart.umd.min.js"></script>
    <script type="module" src="script.js"></script>
</body>
</html>
```

## 🎓 IMPLEMENTATION PRIORITIES

### Phase 1: Critical Bug Fixes (URGENT)
1. **Fix AllergyIntolerance rendering** - Patient safety critical
2. **Debug Patient identifier extraction** - Fix Service/NHS number display
3. **Audit complete data pipeline** - Ensure no medical data loss
4. **Add data integrity validation** - Verify encode/decode fidelity

### Phase 2: Core Functionality (HIGH)
1. **Connect event handlers** - Make demo dropdown functional
2. **Implement chart plugins** - Register timebase/legend enhancements
3. **Fix function scope issues** - Ensure HTML can call script functions
4. **Add error boundaries** - Graceful failure handling

### Phase 3: Enhanced Features (MEDIUM)
1. **Complete toast system** - User feedback for all actions
2. **Optimize chart performance** - Efficient timeline rendering
3. **Add keyboard navigation** - Accessibility improvements
4. **Implement print styling** - Medical record printing

### Phase 4: Quality & Polish (LOW)
1. **Comprehensive test suite** - Automated testing framework
2. **Performance optimization** - Large payload handling
3. **Advanced terminology** - Extended medical code mapping
4. **Documentation generation** - API documentation system

## 🔮 FUTURE ENHANCEMENTS

### Advanced Medical Features
- **Drug interaction checking** - Cross-reference medications
- **Vital sign trend analysis** - Automated alerting for deterioration
- **Care pathway optimization** - AI-suggested treatment protocols
- **Multi-language support** - International deployment capability

### Technology Evolution
- **Progressive Web App** - Offline capability for field use
- **WebRTC integration** - Real-time medical consultations
- **Blockchain integration** - Immutable medical records
- **AI/ML integration** - Predictive analytics for patient outcomes

---

## 🚨 CRITICAL SUCCESS FACTORS

**This application handles life-critical medical data. The following are non-negotiable:**

1. **Data Integrity**: Every piece of medical information must survive the complete pipeline
2. **Allergy Display**: Missing allergy information could be fatal - highest priority fix
3. **Patient Identification**: Service numbers and NHS numbers are essential for patient safety
4. **Timeline Accuracy**: Medical events must maintain precise chronological order
5. **Error Handling**: System must fail gracefully and alert users to data issues

**Recovery Success Criteria:**
- [ ] Demo payload dropdown loads and displays medical data
- [ ] All 11 info boxes show appropriate content (not empty shells)
- [ ] Allergies display prominently in Clinical Summary
- [ ] Patient identifiers (Service Number, NHS Number) are visible
- [ ] Vitals timeline chart shows data points with colored backgrounds
- [ ] MIST format pills maintain chronological order with proper date display
- [ ] Toast notifications appear for user actions
- [ ] Complete encode/decode pipeline maintains data fidelity

**Use this seed file to rebuild the NFC IPS Viewer application with full functionality, enhanced reliability, and improved patient safety features.**

---

**Document Version**: 1.0.0
**Created**: 2025-09-24
**Purpose**: Complete application rebuild seed
**Token Count**: ~5,000 tokens (comprehensive technical specification)