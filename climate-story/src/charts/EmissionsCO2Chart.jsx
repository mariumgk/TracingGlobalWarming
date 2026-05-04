import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const MARGIN = { top: 24, right: 60, bottom: 44, left: 60 };

export default function EmissionsCO2Chart({ emissions, co2, animated }) {
  const svgRef = useRef();
  const [dims, setDims] = useState({ width: 700, height: 360 });
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setDims({ width, height: Math.max(280, width * 0.46) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!emissions || !co2 || !svgRef.current) return;

    const { width, height } = dims;
    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    // Filter to overlapping years
    const yearRange = [1958, 2024];
    const filteredEmissions = emissions.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1]);
    const filteredCO2 = co2.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1]);

    const xScale = d3.scaleLinear().domain(yearRange).range([0, innerW]);
    const yEmissions = d3.scaleLinear().domain([0, d3.max(filteredEmissions, d => d.total) * 1.1]).range([innerH, 0]);
    const yCO2 = d3.scaleLinear().domain([310, d3.max(filteredCO2, d => d.ppm) * 1.02]).range([innerH, 0]);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // Grid
    g.append('g').selectAll('line')
      .data(yEmissions.ticks(5))
      .join('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', d => yEmissions(d)).attr('y2', d => yEmissions(d))
      .attr('stroke', '#E2E8F0').attr('stroke-width', 1);

    // Emissions stacked area
    const stackedData = filteredEmissions.map(d => ({
      year: d.year, fossil: d.fossil, landUse: Math.max(0, d.landUse),
      fossilTop: d.fossil, landUseBottom: d.fossil, landUseTop: d.fossil + Math.max(0, d.landUse),
    }));

    // Land use area (top layer)
    const landAreaGen = d3.area()
      .x(d => xScale(d.year))
      .y0(d => yEmissions(d.fossilTop))
      .y1(d => yEmissions(d.landUseTop))
      .curve(d3.curveBasis);

    g.append('path').datum(stackedData).attr('d', landAreaGen)
      .attr('fill', '#F4B860').attr('fill-opacity', 0.5);

    // Fossil area
    const fossilAreaGen = d3.area()
      .x(d => xScale(d.year))
      .y0(yEmissions(0))
      .y1(d => yEmissions(d.fossil))
      .curve(d3.curveBasis);

    g.append('path').datum(stackedData).attr('d', fossilAreaGen)
      .attr('fill', '#D95D39').attr('fill-opacity', 0.35);

    // Fossil line
    const fossilLine = d3.line()
      .x(d => xScale(d.year)).y(d => yEmissions(d.fossil)).curve(d3.curveBasis);
    const fp = g.append('path').datum(stackedData).attr('d', fossilLine)
      .attr('fill', 'none').attr('stroke', '#D95D39').attr('stroke-width', 2);

    // Total emissions line
    const totalLine = d3.line()
      .x(d => xScale(d.year)).y(d => yEmissions(d.landUseTop)).curve(d3.curveBasis);
    const tp = g.append('path').datum(stackedData).attr('d', totalLine)
      .attr('fill', 'none').attr('stroke', '#A63A2D').attr('stroke-width', 2).attr('stroke-dasharray', '4,3');

    // CO₂ line (right axis)
    const co2Line = d3.line()
      .x(d => xScale(d.year)).y(d => yCO2(d.ppm)).curve(d3.curveBasis);
    const cp = g.append('path').datum(filteredCO2).attr('d', co2Line)
      .attr('fill', 'none').attr('stroke', '#102A43').attr('stroke-width', 2.5);

    if (animated) {
      [fp, tp, cp].forEach(p => {
        const len = p.node().getTotalLength();
        p.attr('stroke-dasharray', len).attr('stroke-dashoffset', len)
          .transition().duration(2000).ease(d3.easeQuadInOut).attr('stroke-dashoffset', 0);
      });
    }

    // 420 ppm annotation
    const ppm420 = filteredCO2.find(d => d.ppm >= 420);
    if (ppm420) {
      g.append('line')
        .attr('x1', xScale(ppm420.year)).attr('x2', xScale(ppm420.year))
        .attr('y1', 0).attr('y2', innerH)
        .attr('stroke', '#8B5CF6').attr('stroke-width', 1).attr('stroke-dasharray', '3,3').attr('opacity', 0.5);
      g.append('text')
        .attr('x', xScale(ppm420.year) + 4).attr('y', 14)
        .attr('font-size', 10).attr('fill', '#8B5CF6').attr('font-weight', 600)
        .text(`420 ppm (${ppm420.year})`);
    }

    // Axes
    g.append('g').attr('transform', `translate(0,${innerH})`).call(
      d3.axisBottom(xScale).ticks(8).tickFormat(d3.format('d'))
    ).call(a => a.selectAll('text').attr('fill', '#64748B').attr('font-size', 11))
     .call(a => a.selectAll('line,path').attr('stroke', '#E2E8F0'));

    g.append('g').call(
      d3.axisLeft(yEmissions).ticks(5).tickFormat(d => `${d.toFixed(1)} Gt`)
    ).call(a => a.selectAll('text').attr('fill', '#D95D39').attr('font-size', 11))
     .call(a => a.selectAll('line,path').attr('stroke', '#E2E8F0'));

    g.append('g').attr('transform', `translate(${innerW},0)`).call(
      d3.axisRight(yCO2).ticks(5).tickFormat(d => `${d} ppm`)
    ).call(a => a.selectAll('text').attr('fill', '#102A43').attr('font-size', 11))
     .call(a => a.selectAll('line,path').attr('stroke', '#E2E8F0'));

    // Labels
    g.append('text').attr('transform', 'rotate(-90)').attr('x', -innerH / 2).attr('y', -48)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#D95D39').text('CO₂ Emissions (Gt CO₂/yr)');
    g.append('text').attr('transform', `rotate(-90) translate(${-innerH / 2}, ${innerW + 52})`)
      .attr('text-anchor', 'middle').attr('font-size', 11).attr('fill', '#102A43').text('Atmospheric CO₂ (ppm)');

    // Hover overlay
    const bisect = d3.bisector(d => d.year).left;
    g.append('rect')
      .attr('width', innerW).attr('height', innerH)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mousemove', function(event) {
        const [mx] = d3.pointer(event);
        const year = Math.round(xScale.invert(mx));
        const ei = Math.min(bisect(filteredEmissions, year), filteredEmissions.length - 1);
        const ci = Math.min(bisect(filteredCO2, year), filteredCO2.length - 1);
        const em = filteredEmissions[ei];
        const co = filteredCO2[ci];
        if (!em) return;
        setTooltip({
          x: event.clientX, y: event.clientY,
          year: em.year,
          fossil: em.fossil?.toFixed(2),
          total: em.total?.toFixed(2),
          ppm: co?.ppm?.toFixed(1),
        });
      })
      .on('mouseleave', () => setTooltip(null));

  }, [emissions, co2, dims, animated]);

  return (
    <div className="relative w-full">
      <svg ref={svgRef} width={dims.width} height={dims.height} style={{ overflow: 'visible', width: '100%', height: 'auto' }} />
      {tooltip && (
        <div className="fixed pointer-events-none z-50 bg-white/97 border border-slate-200 rounded-xl px-4 py-3 text-xs shadow-xl"
          style={{ left: tooltip.x + 14, top: tooltip.y - 30 }}>
          <div className="font-bold text-text-primary mb-1">{tooltip.year}</div>
          <div><span className="text-warming">Fossil:</span> {tooltip.fossil} Gt</div>
          <div><span style={{color:'#A63A2D'}}>Total:</span> {tooltip.total} Gt</div>
          {tooltip.ppm && <div><span className="text-text-primary">CO₂:</span> {tooltip.ppm} ppm</div>}
        </div>
      )}
    </div>
  );
}
