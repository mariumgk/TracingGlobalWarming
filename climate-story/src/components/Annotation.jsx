import React from 'react';
import { motion } from 'framer-motion';

/**
 * Animated annotation callout for charts
 */
export default function Annotation({ x, y, label, sublabel, side = 'right', color = '#D95D39', visible = true }) {
  if (!visible) return null;

  const dx = side === 'right' ? 16 : -16;
  const textAnchor = side === 'right' ? 'start' : 'end';

  return (
    <motion.g
      initial={{ opacity: 0, x: dx * -0.5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Dot */}
      <circle cx={x} cy={y} r={5} fill={color} />
      <circle cx={x} cy={y} r={9} fill={color} fillOpacity={0.2} />

      {/* Leader line */}
      <line
        x1={x}
        y1={y}
        x2={x + dx * 3}
        y2={y - 20}
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="3,2"
        opacity={0.7}
      />

      {/* Label box */}
      <foreignObject
        x={side === 'right' ? x + dx * 3 + 4 : x + dx * 3 - 160}
        y={y - 44}
        width={160}
        height={56}
      >
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            background: 'rgba(255,253,248,0.95)',
            border: `1px solid ${color}40`,
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '11px',
            lineHeight: '1.4',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          }}
        >
          <div style={{ fontWeight: 700, color }}>{label}</div>
          {sublabel && <div style={{ color: '#64748B', marginTop: 2 }}>{sublabel}</div>}
        </div>
      </foreignObject>
    </motion.g>
  );
}
