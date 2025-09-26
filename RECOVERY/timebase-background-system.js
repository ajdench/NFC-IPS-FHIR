/* ===================================================================
   TIMEBASE BACKGROUND SYSTEM - RECOVERY VERSION
   ================================================================ */

// INSERT THIS INTO script.js - Chart.js plugins section

// Color mapping for stage backgrounds
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

// Timebase background plugin that shows care setting periods
const timebaseBackgroundPlugin = {
    id: 'timebaseBackground',
    beforeDraw(chart) {
        if (!viewModel || !viewModel.stageSections) return;

        const { ctx, chartArea, scales } = chart;
        const datasets = chart.data.datasets;

        if (!datasets.length || !scales.x) return;

        ctx.save();

        // Collect stages with data and their time ranges
        const stagesWithData = [];

        stageKeys.forEach(stageKey => {
            const stageSection = viewModel.stageSections[stageKey];
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
        const timelineStart = scales.x.min; // Start from beginning of x-axis
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

        // Draw continuous background segments
        segments.forEach(segment => {
            if (!segment.color) return;

            const startX = scales.x.getPixelForValue(segment.start);
            const endX = scales.x.getPixelForValue(segment.end);

            // Ensure we don't draw past the chart area (before legend)
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
        const paddingLeft = 8; // Same padding as OPCP panes
        const paddingTop = 6; // Balanced top padding

        // Find the longest shortName to size for
        const allShortNames = segments.map(segment => {
            // Convert stage key to uppercase to match CARE_STAGES keys
            const stageKey = segment.key.toUpperCase();
            return CARE_STAGES[stageKey]?.shortName || segment.key;
        });

        // Calculate appropriate text size
        let fontSize = 16;
        ctx.font = `bold ${fontSize}px Arial`;
        const longestText = allShortNames.reduce((a, b) => ctx.measureText(a).width > ctx.measureText(b).width ? a : b);

        while (ctx.measureText(longestText).width > maxTextWidth && fontSize > 8) {
            fontSize -= 1;
            ctx.font = `bold ${fontSize}px Arial`;
        }

        // Draw titles for each segment
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

/* ===================================================================
   USAGE INSTRUCTIONS
   ================================================================ */

/*
1. ADD IMPORT: Ensure COLORS and CARE_STAGES are imported:
   import { COLORS, CARE_STAGES, ... } from './config/constants.js';

2. REGISTER PLUGIN: Add to Chart.js plugins array:
   plugins: [timebaseBackgroundPlugin, ...]

3. REQUIREMENTS:
   - viewModel.stageSections must exist
   - stageKeys array must be defined
   - hexToRgba utility function must exist

FEATURES:
✅ Continuous timeline coverage from x-axis start to end
✅ Midpoint boundaries between stages
✅ 28% background opacity (subtle)
✅ 95% title opacity (pronounced)
✅ Bold Arial font with optimized sizing
✅ Proper padding (8px left, 6px top)
✅ Only stages with data are shown
✅ Stage titles: POI, R1, CASEVAC, etc.
*/