import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

const MARGIN = { top: 20, right: 18, bottom: 36, left: 44 };

const SERIES = [
  { key: 'solar', label: 'Solar', color: '#F4B860', dash: '5,3', order: 0, width: 1.5, isObs: false },
  { key: 'volcanic', label: 'Volcanic', color: '#8295A8', dash: '2,4', order: 1, width: 1.5, isObs: false },
  { key: 'natural', label: 'Natural Total', color: '#64748B', dash: null, order: 2, width: 2, isObs: false },
  { key: 'human', label: 'Human Forcing', color: '#D95D39', dash: null, order: 3, width: 2.5, isObs: false },
  { key: 'all', label: 'All Forcings', color: '#102A43', dash: null, order: 4, width: 3, isObs: false },
  { key: 'observed', label: 'Observed Warming', color: '#1E293B', dash: null, order: 4, width: 2, isObs: true },
];

// Per-step opacity for chart lines. 0 = not yet revealed.
const LINE_OPA = {
  //            s0    s1    s2    s3    s4
  solar: [1.00, 0.80, 0.35, 0.20, 0.15],
  volcanic: [0.00, 1.00, 0.35, 0.20, 0.15],
  natural: [0.00, 0.00, 1.00, 0.40, 0.20],
  human: [0.00, 0.00, 0.00, 1.00, 0.55],
  all: [0.00, 0.00, 0.00, 0.00, 1.00],
  observed: [0.00, 0.00, 0.00, 0.00, 1.00],
};

// Per-step opacity for legend items. Minimum 0.20 so all items stay legible.
const LEGEND_OPA = {
  //            s0    s1    s2    s3    s4
  solar: [1.00, 0.85, 0.35, 0.25, 0.20],
  volcanic: [0.25, 1.00, 0.35, 0.25, 0.20],
  natural: [0.25, 0.25, 1.00, 0.40, 0.25],
  human: [0.25, 0.25, 0.25, 1.00, 0.55],
  all: [0.25, 0.25, 0.25, 0.25, 1.00],
  observed: [0.25, 0.25, 0.25, 0.25, 1.00],
};

// Which legend keys are "active" (bold, nudged right) at each step.
const ACTIVE_AT = [
  ['solar'],
  ['solar', 'volcanic'],
  ['natural'],
  ['human'],
  ['all', 'observed'],
];

export default function ForcingAttributionChart({ data, observedData, revealStep = 0 }) {
  const plotRef = useRef(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      if (w > 50) setDims({ width: w, height: h > 100 ? h : Math.max(320, Math.round(w * 0.78)) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { width, height } = dims;
  const innerW = Math.max(0, width - MARGIN.left - MARGIN.right);
  const innerH = Math.max(0, height - MARGIN.top - MARGIN.bottom);

  const chartData = useMemo(() => {
    if (!data?.length || innerW <= 0 || innerH <= 0) return null;

    const minYear = 1850, maxYear = 2005;
    const xScale = d3.scaleLinear().domain([minYear, maxYear]).range([0, innerW]);
    const yScale = d3.scaleLinear().domain([-1.2, 1.5]).range([innerH, 0]);

    const mkLine = key => d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d[key]))
      .curve(d3.curveMonotoneX)
      .defined(d => d[key] != null && !isNaN(d[key]))(data);

    const forcingSeries = SERIES.filter(s => !s.isObs).map(s => ({ ...s, d: mkLine(s.key) }));

    const humanPos = data.filter(d => d.human > 0);
    const areaPath = humanPos.length
      ? d3.area()
        .x(d => xScale(d.year))
        .y0(yScale(0))
        .y1(d => yScale(d.human))
        .curve(d3.curveMonotoneX)(humanPos)
      : '';

    let obsPath = null;
    if (observedData?.length) {
      const valid = observedData.filter(
        d => d.year >= minYear && d.year <= maxYear && d.fiveYear != null
      );
      obsPath = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.fiveYear))
        .curve(d3.curveMonotoneX)(valid);
    }

    return {
      xScale, yScale, forcingSeries, areaPath, obsPath,
      ticksX: xScale.ticks(6),
      ticksY: yScale.ticks(6),
    };
  }, [data, observedData, innerW, innerH]);

  const step = Math.min(revealStep, 4);
  const activeKeys = new Set(ACTIVE_AT[step] ?? []);

  return (
    <div className="forcing-chart-shell">

      {/* ── Left legend ────────────────────────────── */}
      <div className="forcing-legend">
        {SERIES.map(item => {
          const active = activeKeys.has(item.key);
          return (
            <motion.div
              key={item.key}
              className="legend-item"
              animate={{ opacity: LEGEND_OPA[item.key][step], x: active ? 4 : 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <svg width="32" height="10" aria-hidden="true" style={{ flexShrink: 0 }}>
                <line
                  x1="2" y1="5" x2="30" y2="5"
                  stroke={item.color}
                  strokeWidth={item.key === 'all' ? 3 : item.key === 'human' ? 2.5 : 2}
                  strokeDasharray={item.dash ?? undefined}
                  strokeLinecap="round"
                />
              </svg>
              <span style={{ color: '#334155', fontWeight: active ? 600 : 400 }}>
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* ── Right plot area ─────────────────────────── */}
      <div ref={plotRef} style={{ position: 'relative', minWidth: 0 }}>
        {chartData && width > 0 && (
          <svg
            width={width}
            height={height}
            style={{ overflow: 'visible', position: 'absolute', inset: 0 }}
          >
            <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>

              {/* Y grid + labels */}
              {chartData.ticksY.map(tick => (
                <g key={tick} transform={`translate(0,${chartData.yScale(tick)})`}>
                  <line
                    x1={0} x2={innerW}
                    stroke={tick === 0 ? '#94A3B8' : '#E2E8F0'}
                    strokeWidth={tick === 0 ? 1.5 : 1}
                  />
                  <text
                    x={-8} dy="0.32em" textAnchor="end"
                    fill={tick === 0 ? '#475569' : '#94A3B8'}
                    fontSize="10px"
                    fontWeight={tick === 0 ? 600 : 400}
                  >
                    {tick > 0 ? `+${tick}` : tick}°
                  </text>
                </g>
              ))}

              {/* X axis */}
              <g transform={`translate(0,${innerH})`}>
                <line x1={0} x2={innerW} stroke="#CBD5E1" strokeWidth={1} />
                {chartData.ticksX.map(tick => (
                  <g key={tick} transform={`translate(${chartData.xScale(tick)},0)`}>
                    <line y1={0} y2={4} stroke="#CBD5E1" strokeWidth={1} />
                    <text y={14} textAnchor="middle" fill="#94A3B8" fontSize="10px">
                      {tick}
                    </text>
                  </g>
                ))}
              </g>

              {/* Human forcing fill */}
              <motion.path
                d={chartData.areaPath}
                fill="#D95D39"
                animate={{ opacity: revealStep >= 3 ? 0.07 : 0 }}
                transition={{ duration: 0.8 }}
              />

              {/* Forcing lines — draw in once revealed, then fade per step */}
              {chartData.forcingSeries.map(s => (
                <motion.path
                  key={s.key}
                  d={s.d}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={s.width}
                  strokeDasharray={s.dash ?? undefined}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: revealStep >= s.order ? 1 : 0,
                    opacity: LINE_OPA[s.key][step],
                  }}
                  transition={{ duration: 1.2, ease: 'easeInOut' }}
                />
              ))}

              {/* Observed warming line */}
              {chartData.obsPath && (
                <motion.path
                  d={chartData.obsPath}
                  fill="none"
                  stroke="#1E293B"
                  strokeWidth={2}
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: revealStep >= 4 ? 1 : 0,
                    opacity: LINE_OPA.observed[step],
                  }}
                  transition={{ duration: 1.2, delay: 0.3, ease: 'easeInOut' }}
                />
              )}

            </g>
          </svg>
        )}
      </div>

    </div>
  );
}
