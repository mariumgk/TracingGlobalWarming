import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const MARGIN = { top: 20, right: 40, bottom: 44, left: 56 };

export default function SeaIceChart({ data, animated }) {
  const svgRef = useRef();
  const [dims, setDims] = useState({ width: 640, height: 300 });
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      if (width > 50) setDims({ width, height: Math.max(240, width * 0.42) });
    });
    ro.observe(el);
    const w = el.getBoundingClientRect().width;
    if (w > 50) setDims({ width: w, height: Math.max(240, w * 0.42) });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const { width, height } = dims;
    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    const xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.year))
      .range([0, innerW]);

    const yScale = d3.scaleLinear()
      .domain([3.0, 8.5])
      .range([innerH, 0]);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Grid
    g.append('g').selectAll('line')
      .data(yScale.ticks(5))
      .join('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', d => yScale(d)).attr('y2', d => yScale(d))
      .attr('stroke', '#E2E8F0').attr('stroke-width', 1);

    // Trend line
    const xVals = data.map(d => d.year);
    const yVals = data.map(d => d.september);
    const xMean = d3.mean(xVals), yMean = d3.mean(yVals);
    const slope = d3.sum(xVals.map((x, i) => (x - xMean) * (yVals[i] - yMean))) /
                  d3.sum(xVals.map(x => (x - xMean) ** 2));
    const intercept = yMean - slope * xMean;

    g.append('line')
      .attr('x1', xScale(xVals[0])).attr('y1', yScale(slope * xVals[0] + intercept))
      .attr('x2', xScale(xVals[xVals.length - 1])).attr('y2', yScale(slope * xVals[xVals.length - 1] + intercept))
      .attr('stroke', '#A63A2D').attr('stroke-width', 1.5).attr('stroke-dasharray', '6,4').attr('opacity', 0.6);

    // Area under curve
    const areaGen = d3.area()
      .x(d => xScale(d.year))
      .y0(innerH)
      .y1(d => yScale(d.september))
      .curve(d3.curveBasis);

    g.append('path')
      .datum(data)
      .attr('d', areaGen)
      .attr('fill', '#A7DDE8')
      .attr('fill-opacity', 0.25);

    // Main line
    const lineGen = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.september))
      .curve(d3.curveBasis);

    const path = g.append('path')
      .datum(data)
      .attr('d', lineGen)
      .attr('fill', 'none')
      .attr('stroke', '#3A86A8')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round');

    if (animated) {
      const len = path.node().getTotalLength();
      path.attr('stroke-dasharray', len).attr('stroke-dashoffset', len)
        .transition().duration(2000).ease(d3.easeQuadInOut).attr('stroke-dashoffset', 0);
    }

    // Record low annotation
    const minYear = data.reduce((m, d) => d.september < m.september ? d : m);
    g.append('circle')
      .attr('cx', xScale(minYear.year)).attr('cy', yScale(minYear.september))
      .attr('r', 6).attr('fill', '#A63A2D').attr('stroke', 'white').attr('stroke-width', 2);
    g.append('text')
      .attr('x', xScale(minYear.year) + 8).attr('y', yScale(minYear.september) - 8)
      .attr('font-size', 10).attr('fill', '#A63A2D').attr('font-weight', 700)
      .text(`Record low: ${minYear.year} (${minYear.september.toFixed(2)}M km²)`);

    // Axes
    g.append('g').attr('transform', `translate(0,${innerH})`).call(
      d3.axisBottom(xScale).ticks(8).tickFormat(d3.format('d'))
    ).call(a => a.selectAll('text').attr('fill', '#64748B').attr('font-size', 11))
     .call(a => a.selectAll('line,path').attr('stroke', '#E2E8F0'));

    g.append('g').call(
      d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}M km²`)
    ).call(a => a.selectAll('text').attr('fill', '#64748B').attr('font-size', 11))
     .call(a => a.selectAll('line,path').attr('stroke', '#E2E8F0'));

    // Axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerH / 2).attr('y', -48)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#64748B')
      .text('September Extent (million km²)');

    // Hover overlay
    const bisect = d3.bisector(d => d.year).left;
    g.append('rect')
      .attr('width', innerW).attr('height', innerH)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mousemove', function(event) {
        const [mx] = d3.pointer(event);
        const year = Math.round(xScale.invert(mx));
        const idx = Math.min(bisect(data, year), data.length - 1);
        const d = data[idx];
        if (!d) return;
        g.select('.hover-dot').remove();
        g.append('circle').attr('class', 'hover-dot')
          .attr('cx', xScale(d.year)).attr('cy', yScale(d.september))
          .attr('r', 5).attr('fill', '#3A86A8').attr('stroke', 'white').attr('stroke-width', 2);
        setTooltip({ x: event.clientX, y: event.clientY, year: d.year, val: d.september.toFixed(2) });
      })
      .on('mouseleave', () => { g.select('.hover-dot').remove(); setTooltip(null); });

  }, [data, dims, animated]);

  return (
    <div className="relative w-full">
      <svg ref={svgRef} width={dims.width} height={dims.height} style={{ overflow: 'visible', width: '100%', height: 'auto' }} />
      {tooltip && (
        <div className="fixed pointer-events-none z-50 bg-white/95 border border-ocean/20 rounded-xl px-3 py-2 text-sm shadow-lg"
          style={{ left: tooltip.x + 14, top: tooltip.y - 30 }}>
          <span className="font-semibold">{tooltip.year}</span>
          <span className="ml-2 text-text-muted">{tooltip.val} M km²</span>
        </div>
      )}
    </div>
  );
}
