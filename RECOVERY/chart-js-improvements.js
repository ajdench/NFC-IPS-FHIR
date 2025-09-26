/* ===================================================================
   CHART.JS TOOLTIP & LEGEND IMPROVEMENTS - RECOVERY VERSION
   ================================================================ */

// TOOLTIP CONFIGURATION - Apply to Chart.js options
const tooltipConfig = {
    tooltip: {
        usePointStyle: true,    // Makes legend box circular like data points
        boxWidth: 8,           // 8px width to match highlighted point size
        boxHeight: 8,          // 8px height to match highlighted point size
        callbacks: {
            title(items) {
                if (!items.length) return '';
                const first = items[0];
                const meta = first.raw?.meta || {};
                const dateStr = meta.dateTime
                    ? formatDateTimeWithBullet(meta.dateTime)
                    : formatDateTimeWithBullet(new Date(Number(first.raw?.x ?? first.parsed.x)).toISOString());
                return dateStr;
            },
            label(context) {
                const meta = context.raw.meta || {};
                const type = meta.type || context.dataset.label;
                const rawUnit = meta.unit || '';
                const trimmedUnit = rawUnit ? String(rawUnit).trim() : '';
                const stage = meta.stageShort || meta.stage || 'Unknown';
                const value = meta.value ?? context.parsed.y;
                const displayValue = meta.displayValue || (trimmedUnit ? `${value} ${trimmedUnit}` : `${value}`);
                // Leading space creates separation between circle and text
                return ` ${type} • ${displayValue} • ${stage}`;
            }
        }
    }
};

// CUSTOM LEGEND PLUGIN - Advanced collision detection system
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
            // Draw colored point
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

/* ===================================================================
   COMPLETE CHART CONFIGURATION EXAMPLE
   ================================================================ */

/*
// Apply these configurations to your Chart.js instance:

const chartConfig = {
    type: 'line',
    data: {
        datasets: sortedDatasets // Pre-sorted by last data point value
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'nearest',
            intersect: false
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    tooltipFormat: 'DD MMM YY HH:mm'
                }
            },
            y: {
                beginAtZero: false
            }
        },
        plugins: {
            legend: {
                display: false // Disable default legend, use custom
            },
            // Apply tooltip config here
            ...tooltipConfig
        }
    },
    plugins: [
        timebaseBackgroundPlugin,
        customLegendPlugin
    ]
};

FEATURES IMPLEMENTED:
✅ Circular tooltip indicators (8x8px)
✅ Proper spacing between circle and text
✅ Right-positioned collision-aware legend
✅ Heart Rate/Diastolic BP gap-based spacing
✅ Dynamic chart flexibility
✅ Vertical alignment with data point values
✅ Text measurement and optimization
*/