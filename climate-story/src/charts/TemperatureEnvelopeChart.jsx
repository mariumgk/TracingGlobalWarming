import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import Annotation from '../components/Annotation.jsx';

const MARGIN = { top: 20, right: 40, bottom: 40, left: 55 };

/**
 * Temperature anomaly chart with:
 * - piControl natural variability envelope
 * - Observed line that draws itself
 * - Annotation when observed exceeds envelope
 */
export default function TemperatureEnvelopeChart({ observed, envelope, animated }) {
  const svgRef = useRef();
  const [dims, setDims] = useState({ width: 700, height: 340 });
  const [annotationPt, setAnnotationPt] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const [linePath, setLinePath] = useState('');
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      if (width > 50) setDims({ width, height: Math.max(260, width * 0.42) });
    });
    ro.observe(el);
    // Initial measurement
    const w = el.getBoundingClientRect().width;
    if (w > 50) setDims({ width: w, height: Math.max(260, w * 0.42) });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!observed || observed.length === 0 || !svgRef.current || dims.width < 50) return;

    const { width, height } = dims;
    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    const xScale = d3.scaleLinear()
      .domain(d3.extent(observed, d => d.year))
      .range([0, innerW]);

    const yScale = d3.scaleLinear()
      .domain([-0.6, 1.35])
      .range([innerH, 0]);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Grid lines
    g.append('g')
      .attr('class', 'grid-y')
      .selectAll('line')
      .data(yScale.ticks(6))
      .join('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
      .attr('stroke', '#E2E8F0').attr('stroke-width', 1);

    // Zero line
    g.append('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', yScale(0)).attr('y2', yScale(0))
      .attr('stroke', '#94A3B8').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3');

    // Natural variability envelope
    if (envelope) {
      const areaData = observed.map(d => ({ year: d.year }));
      const areaGen = d3.area()
        .x(d => xScale(d.year))
        .y0(yScale(envelope.lower))
        .y1(yScale(envelope.upper))
        .curve(d3.curveBasis);

      g.append('path')
        .datum(areaData)
        .attr('d', areaGen)
        .attr('fill', '#A8AEB8')
        .attr('fill-opacity', 0.2)
        .attr('stroke', '#A8AEB8')
        .attr('stroke-width', 1)
        .attr('stroke-opacity', 0.4)
        .attr('stroke-dasharray', '4,3');

      // Envelope labels
      g.append('text')
        .attr('x', innerW - 5).attr('y', yScale(envelope.upper) - 4)
        .attr('text-anchor', 'end').attr('font-size', 10).attr('fill', '#A8AEB8')
        .text('Natural variability range');
    }

    // Observed line
    const lineGen = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.mean))
      .curve(d3.curveBasis);

    const path = lineGen(observed);
    setLinePath(path);

    const pathEl = g.append('path')
      .attr('class', 'observed-line')
      .datum(observed)
      .attr('d', path)
      .attr('fill', 'none')
      .attr('stroke', '#D95D39')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round');

    const totalLength = pathEl.node().getTotalLength();
    setPathLength(totalLength);

    if (!animated) {
      pathEl.attr('stroke-dasharray', totalLength).attr('stroke-dashoffset', 0);
    } else {
      pathEl
        .attr('stroke-dasharray', totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(2200)
        .ease(d3.easeQuadInOut)
        .attr('stroke-dashoffset', 0);
    }

    // Area fill under the warming period
    const warmingData = observed.filter(d => d.mean > (envelope?.upper || 0.25));
    if (warmingData.length > 0) {
      const areaGenWarm = d3.area()
        .x(d => xScale(d.year))
        .y0(yScale(envelope?.upper || 0.25))
        .y1(d => yScale(d.mean))
        .curve(d3.curveBasis);

      g.append('path')
        .datum(observed.filter(d => d.year >= d3.min(warmingData, w => w.year)))
        .attr('d', areaGenWarm)
        .attr('fill', '#D95D39')
        .attr('fill-opacity', 0.12);
    }

    // Annotation point — last data point
    const lastPoint = observed[observed.length - 1];
    if (lastPoint) {
      setAnnotationPt({ x: xScale(lastPoint.year) + MARGIN.left, y: yScale(lastPoint.mean) + MARGIN.top });
    }

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(8).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(yScale).ticks(6).tickFormat(d => `${d > 0 ? '+' : ''}${d}°C`);

    g.append('g').attr('transform', `translate(0,${innerH})`).call(xAxis)
      .call(a => a.selectAll('text').attr('fill', '#64748B').attr('font-size', 11))
      .call(a => a.selectAll('line,path').attr('stroke', '#E2E8F0'));

    g.append('g').call(yAxis)
      .call(a => a.selectAll('text').attr('fill', '#64748B').attr('font-size', 11))
      .call(a => a.selectAll('line,path').attr('stroke', '#E2E8F0'));

    // Interactive overlay
    const bisect = d3.bisector(d => d.year).left;
    g.append('rect')
      .attr('width', innerW).attr('height', innerH)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mousemove', function(event) {
        const [mx] = d3.pointer(event);
        const year = Math.round(xScale.invert(mx));
        const idx = bisect(observed, year);
        const d = observed[Math.min(idx, observed.length - 1)];
        if (!d) return;
        g.select('.hover-dot').remove();
        g.append('circle')
          .attr('class', 'hover-dot')
          .attr('cx', xScale(d.year)).attr('cy', yScale(d.mean))
          .attr('r', 5).attr('fill', '#D95D39').attr('stroke', 'white').attr('stroke-width', 2);
        const svgRect = svgRef.current.getBoundingClientRect();
        setTooltip({
          x: event.clientX, y: event.clientY,
          content: `${d.year}: ${d.mean > 0 ? '+' : ''}${d.mean.toFixed(2)}°C`,
        });
      })
      .on('mouseleave', function() {
        g.select('.hover-dot').remove();
        setTooltip(null);
      });

  }, [observed, envelope, dims, animated]);

  return (
    <div className="relative w-full">
      <svg
        ref={svgRef}
        width={dims.width}
        height={dims.height}
        style={{ overflow: 'visible', width: '100%', height: 'auto' }}
      />
      {tooltip && (
        <div
          className="fixed pointer-events-none z-50 bg-white/95 border border-warming/20 rounded-xl px-3 py-2 text-sm shadow-lg"
          style={{ left: tooltip.x + 14, top: tooltip.y - 30 }}
        >
          <span className="font-semibold text-text-primary">{tooltip.content}</span>
        </div>
      )}
    </div>
  );
}
