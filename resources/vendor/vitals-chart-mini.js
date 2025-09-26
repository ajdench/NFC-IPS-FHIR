(function (global) {
    function formatTooltipDate(value) {
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString(undefined, { month: 'short' });
        const year = date.getFullYear().toString().slice(-2);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${month} ${year} • ${hours}:${minutes}`;
    }
    class VitalsMiniChart {
        constructor(ctx, config) {
            this.ctx = ctx;
            this.canvas = ctx.canvas;
            this.config = config || {};
            this.options = this.config.options || {};
            this.datasets = [];
            this.points = [];
            this.pixelRatio = window.devicePixelRatio || 1;
            this.tooltipEl = null;
            this._resizeHandler = this.handleResize.bind(this);
            this._mouseMoveHandler = this.handleMouseMove.bind(this);
            this._mouseLeaveHandler = this.handleMouseLeave.bind(this);

            this.prepareData();
            this.createTooltip();
            this.resizeCanvas();

            window.addEventListener('resize', this._resizeHandler);
            this.canvas.addEventListener('mousemove', this._mouseMoveHandler);
            this.canvas.addEventListener('mouseleave', this._mouseLeaveHandler);

            this.render();
        }

        prepareData() {
            const cfgDatasets = this.config.data?.datasets || [];
            this.datasets = cfgDatasets.map(dataset => {
                const points = (dataset.data || [])
                    .map(entry => {
                        const valueX = entry.x instanceof Date ? entry.x.getTime() : new Date(entry.x).getTime();
                        if (Number.isNaN(valueX)) return null;

                        const valueY = typeof entry.y === 'number' ? entry.y : Number(entry.y);
                        if (!Number.isFinite(valueY)) return null;

                        return {
                            x: valueX,
                            y: valueY,
                            meta: entry.meta || {},
                            screenX: 0,
                            screenY: 0
                        };
                    })
                    .filter(Boolean);

                return {
                    label: dataset.label || 'Series',
                    color: dataset.borderColor || dataset.backgroundColor || '#1976d2',
                    points
                };
            }).filter(ds => ds.points.length);

            const allPoints = this.datasets.flatMap(ds => ds.points);
            this.points = allPoints;

            if (allPoints.length) {
                const xs = allPoints.map(p => p.x).sort((a, b) => a - b);
                const ys = allPoints.map(p => p.y).sort((a, b) => a - b);

                this.minX = xs[0];
                this.maxX = xs[xs.length - 1];
                this.minY = ys[0];
                this.maxY = ys[ys.length - 1];

                if (this.minX === this.maxX) {
                    const delta = 1000 * 60 * 60; // one hour
                    this.minX -= delta;
                    this.maxX += delta;
                }
                if (this.minY === this.maxY) {
                    const delta = Math.max(Math.abs(this.minY) * 0.1, 1);
                    this.minY -= delta;
                    this.maxY += delta;
                }

                const span = Math.max(this.maxX - this.minX, 60 * 1000);
                const padding = Math.max(span * 0.05, 30 * 1000);
                this.minX -= padding;
                this.maxX += padding;
            } else {
                this.minX = 0;
                this.maxX = 1;
                this.minY = 0;
                this.maxY = 1;
            }

            if (Number.isFinite(this.options.xMin)) {
                this.minX = Number(this.options.xMin);
            }
            if (Number.isFinite(this.options.xMax)) {
                this.maxX = Number(this.options.xMax);
            }
        }

        createTooltip() {
            if (this.tooltipEl) return;
            const parent = this.canvas.parentElement;
            const tooltip = document.createElement('div');
            tooltip.className = 'vitals-tooltip';
            parent.appendChild(tooltip);
            this.tooltipEl = tooltip;
        }

        resizeCanvas() {
            const width = this.canvas.clientWidth || 1;
            const height = this.canvas.clientHeight || 1;
            const dpr = this.pixelRatio;

            if (this.canvas.width !== width * dpr || this.canvas.height !== height * dpr) {
                this.canvas.width = width * dpr;
                this.canvas.height = height * dpr;
                this.ctx.setTransform(1, 0, 0, 1, 0, 0);
                this.ctx.scale(dpr, dpr);
            }

            this.chartArea = {
                left: 60,
                top: 20,
                right: width - 20,
                bottom: height - 40,
                width: Math.max(width - 80, 10),
                height: Math.max(height - 60, 10)
            };
        }

        handleResize() {
            this.resizeCanvas();
            this.render();
        }

        handleMouseMove(event) {
            if (!this.points.length) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            let nearest = null;
            let minDist = Infinity;

            for (const point of this.points) {
                const dx = point.screenX - x;
                const dy = point.screenY - y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = point;
                }
            }

            const threshold = 12;
            if (nearest && minDist <= threshold) {
                this.showTooltip(nearest, x, y);
            } else {
                this.hideTooltip();
            }
        }

        handleMouseLeave() {
            this.hideTooltip();
        }

        showTooltip(point, x, y) {
            if (!this.tooltipEl) return;
            const meta = point.meta || {};
            const trimmedUnit = meta.unit ? String(meta.unit).trim() : '';
            const type = meta.type || 'Vital';
            const stage = meta.stageShort || meta.stage || 'Unknown';
            const value = meta.value ?? point.y;
            const displayValue = meta.displayValue || (trimmedUnit ? `${value} ${trimmedUnit}` : `${value}`);
            const dateStr = meta.dateTime ? formatTooltipDate(meta.dateTime) : formatTooltipDate(point.x);
            this.tooltipEl.textContent = `${type} • ${displayValue} • ${stage} • ${dateStr}`;
            this.tooltipEl.style.left = `${x}px`;
            this.tooltipEl.style.top = `${y}px`;
            this.tooltipEl.style.opacity = '1';
        }

        hideTooltip() {
            if (this.tooltipEl) {
                this.tooltipEl.style.opacity = '0';
            }
        }

        destroy() {
            window.removeEventListener('resize', this._resizeHandler);
            this.canvas.removeEventListener('mousemove', this._mouseMoveHandler);
            this.canvas.removeEventListener('mouseleave', this._mouseLeaveHandler);
            if (this.tooltipEl && this.tooltipEl.parentElement) {
                this.tooltipEl.parentElement.removeChild(this.tooltipEl);
            }
            this.tooltipEl = null;
            this.ctx = null;
            this.canvas = null;
        }

        projectX(value) {
            const area = this.chartArea;
            const ratio = (value - this.minX) / (this.maxX - this.minX);
            return area.left + ratio * area.width;
        }

        projectY(value) {
            const area = this.chartArea;
            const ratio = (value - this.minY) / (this.maxY - this.minY);
            return area.bottom - ratio * area.height;
        }

        renderAxes() {
            const ctx = this.ctx;
            const area = this.chartArea;

            ctx.save();
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 1;

            const tickCount = 6;

            // Draw major horizontal grid lines with lighter sub-divisions
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
            ctx.setLineDash([3, 3]);
            for (let i = 0; i <= tickCount; i += 1) {
                const t = i / tickCount;
                const y = area.top + t * area.height;
                ctx.beginPath();
                ctx.moveTo(area.left, y);
                ctx.lineTo(area.right, y);
                ctx.stroke();
            }
            ctx.setLineDash([]);

            // X axis baseline
            ctx.beginPath();
            ctx.strokeStyle = '#cccccc';
            ctx.moveTo(area.left, area.bottom);
            ctx.lineTo(area.right, area.bottom);
            ctx.stroke();

            ctx.fillStyle = '#666666';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';

            for (let i = 0; i <= tickCount; i += 1) {
                const t = i / tickCount;
                const value = this.minX + t * (this.maxX - this.minX);
                const x = this.projectX(value);

                ctx.beginPath();
                ctx.moveTo(x, area.bottom);
                ctx.lineTo(x, area.bottom + 4);
                ctx.stroke();

                const date = new Date(value);
                const dateLabel = `${date.getDate().toString().padStart(2, '0')} ${date.toLocaleString(undefined, { month: 'short' })}`;
                const timeLabel = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
                ctx.fillText(`${dateLabel} ${timeLabel}`, x, area.bottom + 14);
            }

            ctx.restore();
        }

        renderLegend() {
            const ctx = this.ctx;
            ctx.save();
            ctx.font = '12px Arial';
            ctx.textBaseline = 'middle';

            const lineHeight = 18;
            const padding = 12;
            const area = this.chartArea;
            let x = area.left;
            const y = area.bottom + padding;

            this.datasets.forEach(dataset => {
                ctx.fillStyle = dataset.color;
                const boxSize = 5;
                ctx.fillRect(x, y, boxSize, boxSize);
                ctx.fillStyle = '#333333';
                ctx.textBaseline = 'top';
                const fontSize = this.options.legendFontSize || 9;
                ctx.font = `${fontSize}px Arial`;
                ctx.fillText(dataset.label, x + boxSize + 6, y);
                ctx.textBaseline = 'middle';
                x += ctx.measureText(dataset.label).width + boxSize + 20;
            });

            ctx.restore();
        }

        renderDatasets() {
            const ctx = this.ctx;
            const area = this.chartArea;

            ctx.save();
            ctx.rect(area.left, area.top, area.width, area.height);
            ctx.clip();

            ctx.lineWidth = 2;
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';

            this.points = [];

            this.datasets.forEach(dataset => {
                if (!dataset.points.length) return;

                ctx.strokeStyle = dataset.color;
                ctx.beginPath();

                dataset.points.forEach((point, index) => {
                    const x = point.screenX = this.projectX(point.x);
                    const y = point.screenY = this.projectY(point.y);
                    this.points.push(point);
                    if (index === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                });

                ctx.stroke();

                ctx.fillStyle = dataset.color;
                dataset.points.forEach(point => {
                    ctx.beginPath();
                    ctx.arc(point.screenX, point.screenY, 3, 0, Math.PI * 2);
                    ctx.fill();
                });
            });

            ctx.restore();
        }

        render() {
            if (!this.ctx) return;

            const width = this.canvas.clientWidth || 1;
            const height = this.canvas.clientHeight || 1;

            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.restore();

            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(0, 0, width, height);

            if (!this.datasets.length) {
                this.hideTooltip();
                return;
            }

            this.renderAxes();
            this.renderDatasets();
            this.renderLegend();
        }
        }

        update(newConfig) {
            this.config = newConfig || this.config;
            this.options = this.config.options || this.options || {};
            this.prepareData();
            this.resizeCanvas();
            this.render();
        }
    }

    global.VitalsMiniChart = VitalsMiniChart;
}(typeof window !== 'undefined' ? window : this));
