import * as d3 from 'd3';

// ── Color scales ──────────────────────────────────────────────────────────────

/** Temperature anomaly: cold blue → warm red */
export const tempColorScale = d3.scaleSequential()
  .domain([-0.5, 1.2])
  .interpolator(d3.interpolateRdBu)
  .clamp(true);

// Reversed for warming stripes (cold = blue, warm = red)
export const stripeColorScale = d3.scaleSequential()
  .domain([-0.5, 1.2])
  .interpolator(t => d3.interpolateRdBu(1 - t))
  .clamp(true);

/** Emissions: white → deep red */
export const emissionsColorScale = d3.scaleSequential()
  .domain([0, 2e12])
  .interpolator(d3.interpolateOranges)
  .clamp(true);

// ── Linear/Time scales helpers ────────────────────────────────────────────────

export function makeXScale(data, accessor, range) {
  return d3.scaleLinear()
    .domain(d3.extent(data, accessor))
    .range(range);
}

export function makeYScale(data, accessor, range, padding = 0.1) {
  const [min, max] = d3.extent(data, accessor);
  const pad = (max - min) * padding;
  return d3.scaleLinear()
    .domain([min - pad, max + pad])
    .range(range);
}

// ── Chart palette constants ────────────────────────────────────────────────────
export const COLORS = {
  warming: '#D95D39',
  warmingDeep: '#A63A2D',
  ocean: '#3A86A8',
  ice: '#A7DDE8',
  natural: '#A8AEB8',
  amber: '#F4B860',
  ghg: '#8B5CF6',      // purple for GHG
  solar: '#F4B860',    // amber for solar
  volcanic: '#6B7280', // grey for volcanic
  human: '#D95D39',    // orange for human
  observed: '#102A43', // navy for observed
  fossil: '#D95D39',
  landUse: '#F4B860',
};
