import React, { useRef, useState, useEffect } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

const stripeColor = d3.scaleSequential()
  .domain([-0.5, 1.2])
  .interpolator(t => d3.interpolateRdBu(1 - t))
  .clamp(true);

/**
 * Animated warming stripes that reveal progressively based on scrollProgress (0–1)
 */
export default function WarmingStripes({ data, scrollProgress = 0 }) {
  const [hoveredYear, setHoveredYear] = useState(null);
  const containerRef = useRef();

  if (!data || data.length === 0) return null;

  const visibleCount = Math.floor(data.length * Math.min(1, scrollProgress * 1.5));
  const visibleData = data.slice(0, Math.max(1, visibleCount));

  const hovered = hoveredYear != null ? data.find(d => d.year === hoveredYear) : null;

  return (
    <div className="relative w-full select-none" ref={containerRef}>
      {/* Hovered year info */}
      {hovered && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 z-10 bg-white/95 border border-slate-200 rounded-xl px-4 py-2 text-center shadow-md text-sm pointer-events-none"
        >
          <span className="font-semibold text-text-primary">{hovered.year}</span>
          <span className="ml-2 text-text-muted">
            {hovered.mean > 0 ? '+' : ''}{hovered.mean.toFixed(2)}°C anomaly
          </span>
        </motion.div>
      )}

      {/* Stripes */}
      <div
        className="flex h-40 rounded-xl overflow-hidden cursor-crosshair"
        style={{ gap: '1px', background: '#E2E8F0' }}
      >
        {data.map((d, i) => {
          const revealed = i < visibleData.length;
          return (
            <motion.div
              key={d.year}
              className="flex-1 h-full"
              style={{
                background: stripeColor(d.mean),
                opacity: revealed ? (hoveredYear === null ? 1 : hoveredYear === d.year ? 1 : 0.6) : 0,
                minWidth: '2px',
              }}
              animate={{ opacity: revealed ? 1 : 0 }}
              transition={{ duration: 0.3, delay: i * 0.003 }}
              onMouseEnter={() => setHoveredYear(d.year)}
              onMouseLeave={() => setHoveredYear(null)}
              title={`${d.year}: ${d.mean > 0 ? '+' : ''}${d.mean.toFixed(2)}°C`}
            />
          );
        })}
      </div>

      {/* Year labels */}
      <div className="flex justify-between mt-2 text-xs text-text-muted px-1">
        <span>{data[0]?.year}</span>
        <span className="font-semibold text-warming">Warming →</span>
        <span>{data[data.length - 1]?.year}</span>
      </div>
    </div>
  );
}
