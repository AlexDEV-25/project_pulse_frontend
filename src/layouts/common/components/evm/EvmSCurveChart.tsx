import { useState } from 'react';
import type { PhaseEvmDetailResponse } from '@/dto/response';
import Icon from '@/layouts/common/components/ui/Icon';

interface Props {
  phases: PhaseEvmDetailResponse[];
  projectBudget?: number | null;
}

interface TimelinePoint {
  index: number;
  isOrigin: boolean;
  phaseId?: number;
  label: string;
  fullLabel: string;
  status?: string;
  pv: number;
  ev: number;
  ac: number;
  deltaPv: number;
  deltaEv: number;
  deltaAc: number;
  hasActual: boolean;
}

/**
 * Format phase name for compact, readable X-axis labels
 */
function getPhaseShortLabel(phaseName: string, index: number): string {
  const cleaned = phaseName.replace(/^P\d+\s*[-–]\s*/i, '').trim();
  const match = cleaned.match(/^(Phase\s*\d+|Giai đoạn\s*\d+|GĐ\s*\d+)/i);
  if (match) {
    return match[1];
  }
  if (cleaned.length <= 10) {
    return cleaned;
  }
  return `Phase ${index + 1}`;
}

/**
 * Compute smooth cubic Bezier curve path through data points (Catmull-Rom to Cubic Bezier)
 */
function getSmoothCurvePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    const [p0, p1] = points;
    const cpx = (p0.x + p1.x) / 2;
    return `M ${p0.x} ${p0.y} C ${cpx} ${p0.y}, ${cpx} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[0];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const tension = 0.22;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function EvmSCurveChart({ phases, projectBudget }: Props) {
  const [viewMode, setViewMode] = useState<'scurve' | 'barchart'>('scurve');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!phases || phases.length === 0) {
    return (
      <div className="evm-panel" style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ color: '#65686b' }}>Dự án chưa có giai đoạn (Phase) nào được thiết lập.</p>
      </div>
    );
  }

  // --- BUILD TIMELINE WITH T0 (ORIGIN) AND ACTUAL DATA CUTOFF ---
  const timelinePoints: TimelinePoint[] = [
    {
      index: 0,
      isOrigin: true,
      label: 'Khởi đầu',
      fullLabel: 'Khởi đầu dự án (T0: 0 điểm)',
      status: 'DONE',
      pv: 0,
      ev: 0,
      ac: 0,
      deltaPv: 0,
      deltaEv: 0,
      deltaAc: 0,
      hasActual: true,
    },
    ...phases.map((p, idx) => {
      const hasActual =
        p.status === 'DONE' ||
        p.status === 'IN_PROGRESS' ||
        (p.ev || 0) > 0 ||
        (p.ac || 0) > 0;
      return {
        index: idx + 1,
        isOrigin: false,
        phaseId: p.phaseId,
        label: getPhaseShortLabel(p.phaseName, idx),
        fullLabel: p.phaseName,
        status: p.status,
        pv: p.cumulativePv || 0,
        ev: p.cumulativeEv || 0,
        ac: p.cumulativeAc || 0,
        deltaPv: p.pv || 0,
        deltaEv: p.ev || 0,
        deltaAc: p.ac || 0,
        hasActual,
      };
    }),
  ];

  // Find the index of the latest phase that has actual data (Status Date)
  let lastActualIndex = 0;
  for (let i = timelinePoints.length - 1; i >= 0; i--) {
    if (timelinePoints[i].hasActual) {
      lastActualIndex = i;
      break;
    }
  }
  if (lastActualIndex === 0 && phases.length > 0) {
    lastActualIndex = 1;
  }

  // Reference budget for % mode
  const totalBac =
    projectBudget && projectBudget > 0
      ? projectBudget
      : Math.max(
          ...phases.map((p) => p.bac || 0),
          ...phases.map((p) => p.cumulativePv || 0),
          100
        );

  // --- S-CURVE DIMENSIONS & COORDINATES ---
  const width = 760;
  const height = 290;
  const paddingLeft = 55;
  const paddingRight = 40;
  const paddingTop = 28;
  const paddingBottom = 48;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const baselineOffset = 8; // Elevate 0 baseline 8px so AC line doesn't collide with the axis border

  // Max value calculation based on mode
  const maxCumulativeRaw = Math.max(
    ...timelinePoints.map((pt) => Math.max(pt.pv, pt.ev, pt.ac)),
    10
  );
  const magnitude = Math.pow(10, Math.floor(Math.log10(maxCumulativeRaw)));
  const maxPointsVal =
    Math.ceil((maxCumulativeRaw * 1.1) / (magnitude / 2)) * (magnitude / 2) || 100;

  const maxVal = maxPointsVal;

  const getX = (index: number) => {
    if (timelinePoints.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (timelinePoints.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    return (
      paddingTop +
      chartHeight -
      baselineOffset -
      (val / maxVal) * (chartHeight - baselineOffset)
    );
  };

  // Planned Value (PV) curve spans all timeline points (T0 -> Project Completion)
  const pvPoints = timelinePoints.map((pt) => ({
    x: getX(pt.index),
    y: getY(pt.pv),
  }));

  // Actual Curves (EV & AC) ONLY span up to the current active phase (Status Date)
  const actualPoints = timelinePoints.slice(0, lastActualIndex + 1);

  const evPoints = actualPoints.map((pt) => ({
    x: getX(pt.index),
    y: getY(pt.ev),
  }));

  const acPoints = actualPoints.map((pt) => ({
    x: getX(pt.index),
    y: getY(pt.ac),
  }));

  const pvPath = getSmoothCurvePath(pvPoints);
  const evPath = getSmoothCurvePath(evPoints);
  const acPath = getSmoothCurvePath(acPoints);

  const yTicks = [
    maxVal,
    Math.round(maxVal * 0.75),
    Math.round(maxVal * 0.5),
    Math.round(maxVal * 0.25),
    0,
  ];

  // --- BAR CHART (DASHBOARD STYLE) CALCULATIONS ---
  const maxBarRaw = Math.max(
    ...phases.map((p) => Math.max(p.ev || 0, p.ac || 0)),
    10
  );
  const barMagnitude = Math.pow(10, Math.floor(Math.log10(maxBarRaw)));
  const maxBarVal = Math.ceil((maxBarRaw * 1.15) / (barMagnitude / 2)) * (barMagnitude / 2) || 100;

  const barScaleTicks = [
    maxBarVal,
    Math.round(maxBarVal * 0.8),
    Math.round(maxBarVal * 0.6),
    Math.round(maxBarVal * 0.4),
    Math.round(maxBarVal * 0.2),
    0,
  ];

  const currentStatusX = getX(lastActualIndex);

  return (
    <div className="evm-panel">
      <div className="evm-panel-header">
        <div>
          <h3 className="evm-panel-title">
            <Icon name={viewMode === 'scurve' ? 'chart' : 'bar-chart'} size={18} />
            {viewMode === 'scurve'
              ? 'Đường cong chữ S Lũy kế (Cumulative S-Curve)'
              : 'So sánh EV & AC theo từng Phase'}
          </h3>
          <div className="evm-panel-subtitle">
            {viewMode === 'scurve'
              ? 'Theo dõi sự tích lũy giá trị thực tế (EV) và chi phí (AC) so với kế hoạch (PV)'
              : 'Đối chiếu giá trị tạo ra (EV) và chi phí thực tế (AC) qua từng giai đoạn dự án'}
          </div>
        </div>

        <div className="evm-view-toggles">
          <button
            type="button"
            className={`evm-toggle-btn ${viewMode === 'scurve' ? 'active' : ''}`}
            onClick={() => setViewMode('scurve')}
          >
            Đường S-Curve
          </button>
          <button
            type="button"
            className={`evm-toggle-btn ${viewMode === 'barchart' ? 'active' : ''}`}
            onClick={() => setViewMode('barchart')}
          >
            Cột EV &amp; AC
          </button>
        </div>
      </div>

      <div className="evm-scurve-wrap">
        {/* --- VIEW 1: S-CURVE SMOOTH LINE CHART --- */}
        {viewMode === 'scurve' && (
          <>
            {/* Legend with Status Date Indicator */}
            <div className="evm-chart-legend">
              <span className="evm-legend-item">
                <span className="evm-legend-dot pv" />
                Kế hoạch lũy kế (PV)
              </span>
              <span className="evm-legend-item">
                <span className="evm-legend-dot ev" />
                Thực tế lũy kế (EV)
              </span>
              <span className="evm-legend-item">
                <span className="evm-legend-dot ac" />
                Chi phí lũy kế (AC)
              </span>
              {lastActualIndex < timelinePoints.length - 1 && (
                <span className="evm-legend-item" style={{ color: '#8a99a8', fontSize: '12px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '12px',
                      borderTop: '2px dashed #b5bfc8',
                      marginRight: '4px',
                    }}
                  />
                  Giai đoạn tương lai (Kế hoạch)
                </span>
              )}
            </div>

            {/* Smooth SVG Curve */}
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="evm-svg-chart"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="evGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4d9188" stopOpacity="0.16" />
                  <stop offset="100%" stopColor="#4d9188" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid lines */}
              {yTicks.map((tick) => {
                const y = getY(tick);
                return (
                  <g key={tick}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke="#e2e3e4"
                      strokeWidth="1"
                    />
                    <text x={paddingLeft - 10} y={y + 4} textAnchor="end">
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* Status Date Marker (Current Active Phase Line) */}
              {lastActualIndex > 0 && lastActualIndex < timelinePoints.length - 1 && (
                <g>
                  <line
                    x1={currentStatusX}
                    y1={paddingTop - 6}
                    x2={currentStatusX}
                    y2={height - paddingBottom}
                    stroke="#4d9188"
                    strokeDasharray="3 3"
                    strokeWidth="1.2"
                    opacity="0.65"
                  />
                  <rect
                    x={currentStatusX - 32}
                    y={paddingTop - 18}
                    width={64}
                    height={18}
                    rx={4}
                    fill="#eef7f4"
                    stroke="#ccebdc"
                    strokeWidth="1"
                  />
                  <text
                    x={currentStatusX}
                    y={paddingTop - 5}
                    textAnchor="middle"
                    fill="#25694c"
                    fontSize="10"
                    fontWeight="700"
                  >
                    Hiện tại
                  </text>
                </g>
              )}

              {/* Smooth Curves */}
              {/* PV (Planned Baseline: Full Project) */}
              <path d={pvPath} className="evm-chart-line pv" />

              {/* AC (Actual Cost: Cut off at Active Phase) */}
              <path d={acPath} className="evm-chart-line ac" />

              {/* EV (Earned Value: Cut off at Active Phase) */}
              <path d={evPath} className="evm-chart-line ev" />

              {/* Timeline Point Markers & X-Axis Labels */}
              {timelinePoints.map((pt) => {
                const x = getX(pt.index);
                const isHovered = hoveredIndex === pt.index;
                const isPastOrCurrent = pt.index <= lastActualIndex;

                return (
                  <g key={pt.index}>
                    {/* Vertical hover guide line */}
                    {isHovered && (
                      <line
                        x1={x}
                        y1={paddingTop}
                        x2={x}
                        y2={height - paddingBottom}
                        stroke="#647380"
                        strokeDasharray="3 3"
                        strokeWidth="1.2"
                      />
                    )}

                    {/* PV Marker (Always present) */}
                    <circle
                      cx={x}
                      cy={getY(pt.pv)}
                      r={isHovered ? 5.5 : 4}
                      className="evm-chart-dot pv"
                    />

                    {/* AC Marker (Only for T0 and completed/in-progress phases) */}
                    {isPastOrCurrent && (
                      <circle
                        cx={x}
                        cy={getY(pt.ac)}
                        r={isHovered ? 5.5 : pt.isOrigin ? 4 : 4.5}
                        className="evm-chart-dot ac"
                      />
                    )}

                    {/* EV Marker (Only for T0 and completed/in-progress phases) */}
                    {isPastOrCurrent && (
                      <circle
                        cx={x}
                        cy={getY(pt.ev)}
                        r={isHovered ? 6 : pt.isOrigin ? 4 : 4.5}
                        className="evm-chart-dot ev"
                      />
                    )}

                    {/* Future Phase Placeholder Ring */}
                    {!isPastOrCurrent && (
                      <circle
                        cx={x}
                        cy={getY(0)}
                        r={3}
                        fill="#ffffff"
                        stroke="#b5bfc8"
                        strokeWidth="1.5"
                        strokeDasharray="2 2"
                      />
                    )}

                    {/* Transparent touch hotspot */}
                    <rect
                      x={x - 22}
                      y={paddingTop}
                      width={44}
                      height={chartHeight}
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredIndex(pt.index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    />

                    {/* X-axis Phase label */}
                    <text
                      x={x}
                      y={height - paddingBottom + 20}
                      textAnchor="middle"
                      fontWeight={isHovered ? 700 : pt.index === lastActualIndex ? 600 : 500}
                      fill={
                        isHovered
                          ? '#253437'
                          : pt.index === lastActualIndex
                            ? '#4d9188'
                            : pt.isOrigin
                              ? '#8a99a8'
                              : isPastOrCurrent
                                ? '#353638'
                                : '#8a99a8'
                      }
                      fontSize={pt.isOrigin ? '11' : '12'}
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip for S-Curve */}
            {hoveredIndex !== null && timelinePoints[hoveredIndex] && (
              <div className="evm-chart-tooltip">
                <div className="evm-tooltip-title">
                  {timelinePoints[hoveredIndex].fullLabel}
                </div>
                {timelinePoints[hoveredIndex].isOrigin ? (
                  <div style={{ color: '#65686b', fontSize: '11px', marginTop: '2px' }}>
                    Điểm xuất phát bắt đầu dự án (PV, EV, AC = 0).
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: '11px', color: '#65686b', marginBottom: '4px' }}>
                      Trạng thái:{' '}
                      <strong style={{ color: '#253437' }}>
                        {timelinePoints[hoveredIndex].status === 'DONE'
                          ? 'Đã hoàn thành'
                          : timelinePoints[hoveredIndex].status === 'IN_PROGRESS'
                            ? 'Đang thực hiện (Hiện tại)'
                            : 'Kế hoạch tương lai'}
                      </strong>
                    </div>

                    <div className="evm-tooltip-row pv">
                      <span>PV Lũy kế:</span>
                      <strong>
                        {timelinePoints[hoveredIndex].pv.toLocaleString('vi-VN')}
                        {totalBac > 0
                          ? ` (${((timelinePoints[hoveredIndex].pv / totalBac) * 100).toFixed(1)}%)`
                          : ''}
                      </strong>
                    </div>

                    {timelinePoints[hoveredIndex].hasActual ? (
                      <>
                        <div className="evm-tooltip-row ev">
                          <span>EV Lũy kế:</span>
                          <strong>
                            {timelinePoints[hoveredIndex].ev.toLocaleString('vi-VN')}
                            {totalBac > 0
                              ? ` (${((timelinePoints[hoveredIndex].ev / totalBac) * 100).toFixed(1)}%)`
                              : ''}
                          </strong>
                        </div>
                        <div className="evm-tooltip-row ac">
                          <span>AC Lũy kế:</span>
                          <strong>
                            {timelinePoints[hoveredIndex].ac.toLocaleString('vi-VN')}
                            {totalBac > 0
                              ? ` (${((timelinePoints[hoveredIndex].ac / totalBac) * 100).toFixed(1)}%)`
                              : ''}
                          </strong>
                        </div>

                        {timelinePoints[hoveredIndex].deltaAc > 0 && (
                          <div style={{ marginTop: '4px', fontSize: '11px', color: '#65686b', borderTop: '1px solid #f1f3f5', paddingTop: '4px' }}>
                            Phát sinh trong phase: <strong>+{timelinePoints[hoveredIndex].deltaAc.toLocaleString('vi-VN')} AC</strong>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ color: '#8a99a8', fontStyle: 'italic', marginTop: '4px', fontSize: '11px' }}>
                        Giai đoạn chưa diễn ra (chưa phát sinh EV &amp; AC)
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* --- VIEW 2: PHASE COMPARATIVE BAR CHART (MATCHING DASHBOARD STYLE) --- */}
        {viewMode === 'barchart' && (
          <div className="evm-dashboard-bar-section">
            {/* Legend */}
            <div className="evm-legend">
              <span>
                <i className="ev" />
                Giá trị tạo ra (EV)
              </span>
              <span>
                <i className="ac" />
                Chi phí thực tế (AC)
              </span>
            </div>

            {/* Scale Wrap & Bars identical to Dashboard EvmChart */}
            <div className="chart-scale-wrap">
              <div className="chart-scale">
                {barScaleTicks.map((val) => (
                  <span key={val}>{val}</span>
                ))}
              </div>

              <div className="evm-chart">
                {phases.map((phase, idx) => {
                  const ev = phase.ev || 0;
                  const ac = phase.ac || 0;
                  const evHeight = Math.min(Math.max((ev / maxBarVal) * 100, 2), 100);
                  const acHeight = Math.min(Math.max((ac / maxBarVal) * 100, 2), 100);
                  const shortLabel = getPhaseShortLabel(phase.phaseName, idx);
                  const cv = phase.cv ?? ev - ac;

                  return (
                    <div
                      className="evm-group"
                      key={phase.phaseId}
                      title={`${phase.phaseName}\nEV: ${ev.toLocaleString('vi-VN')}\nAC: ${ac.toLocaleString('vi-VN')}\nChênh lệch (CV): ${cv >= 0 ? '+' : ''}${cv.toLocaleString('vi-VN')}`}
                    >
                      <div className="evm-bars">
                        <i
                          className="ev"
                          style={{ height: `${evHeight}%` }}
                        />
                        <i
                          className="ac"
                          style={{ height: `${acHeight}%` }}
                        />
                      </div>
                      <small>{shortLabel}</small>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


