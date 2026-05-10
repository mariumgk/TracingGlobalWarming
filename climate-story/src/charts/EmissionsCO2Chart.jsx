import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';

const MARGIN = { top: 24, right: 24, bottom: 44, left: 60 };

export default function EmissionsCO2Chart({ emissions, co2, animated }) {
  const svgRef = useRef();
  const [dims, setDims] = useState({ width: 700, height: 500 });
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setDims({ width, height: Math.max(450, width * 0.7) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!emissions || !co2 || !svgRef.current) return;

    const { width, height } = dims;
    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    // Split heights
    const gap = 40;
    const topH = (innerH - gap) * 0.45;
    const bottomH = (innerH - gap) * 0.55;

    // Filter to overlapping years
    const yearRange = [1990, 2024];
    const filteredEmissions = emissions.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1]);
    const filteredCO2 = co2.filter(d => d.year >= yearRange[0] && d.year <= yearRange[1]);

    const xScale = d3.scaleLinear().domain(yearRange).range([0, innerW]);
    const yCO2 = d3.scaleLinear().domain([310, d3.max(filteredCO2, d => d.ppm) * 1.02]).range([topH, 0]);
    const yEmissions = d3.scaleLinear().domain([0, d3.max(filteredEmissions, d => d.total) * 1.1]).range([bottomH, 0]);

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    // --- TOP PANEL (CO2 STOCK) ---
    const gTop = g.append('g');
    
    // Grid Top
    gTop.append('g').selectAll('line')
      .data(yCO2.ticks(4))
      .join('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', d => yCO2(d)).attr('y2', d => yCO2(d))
      .attr('stroke', '#E2E8F0').attr('stroke-width', 1);

    // CO2 Area (Light Gray Fill)
    const co2Area = d3.area()
      .x(d => xScale(d.year)).y0(topH).y1(d => yCO2(d.ppm)).curve(d3.curveBasis);
    gTop.append('path').datum(filteredCO2).attr('d', co2Area)
      .attr('fill', '#E2E8F0').attr('fill-opacity', 0.5);

    // CO2 Line (Dark Navy)
    const co2Line = d3.line()
      .x(d => xScale(d.year)).y(d => yCO2(d.ppm)).curve(d3.curveBasis);
    const cp = gTop.append('path').datum(filteredCO2).attr('d', co2Line)
      .attr('fill', 'none').attr('stroke', '#1A2B3C').attr('stroke-width', 3);

    // Axes Top
    gTop.append('g').call(
      d3.axisLeft(yCO2).ticks(4).tickFormat(d => `${d} ppm`)
    ).call(a => a.selectAll('text').attr('fill', '#1A2B3C').attr('font-size', 11).attr('font-family', 'Inter, sans-serif'))
     .call(a => a.selectAll('line,path').attr('stroke', '#E2E8F0'));

    // Horizontal Top Chart Label
    gTop.append('text').attr('x', -45).attr('y', -10)
      .attr('text-anchor', 'start').attr('font-size', 12).attr('fill', '#1A2B3C').attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', '600').text('Stock: Atmospheric CO₂ (ppm)');


    // --- BOTTOM PANEL (EMISSIONS FLOW) ---
    const gBottom = g.append('g').attr('transform', `translate(0, ${topH + gap})`);

    // Grid Bottom (Y-axis only)
    gBottom.append('g').selectAll('line')
      .data(yEmissions.ticks(5))
      .join('line')
      .attr('x1', 0).attr('x2', innerW)
      .attr('y1', d => yEmissions(d)).attr('y2', d => yEmissions(d))
      .attr('stroke', '#E2E8F0').attr('stroke-width', 1);

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
    gBottom.append('path').datum(stackedData).attr('d', landAreaGen)
      .attr('fill', '#F2CC8F').attr('fill-opacity', 0.85);

    // Fossil area (base layer)
    const fossilAreaGen = d3.area()
      .x(d => xScale(d.year))
      .y0(yEmissions(0))
      .y1(d => yEmissions(d.fossil))
      .curve(d3.curveBasis);
    gBottom.append('path').datum(stackedData).attr('d', fossilAreaGen)
      .attr('fill', '#E07A5F').attr('fill-opacity', 0.85);

    // Total emissions line (hidden)
    const totalLine = d3.line()
      .x(d => xScale(d.year)).y(d => yEmissions(d.landUseTop)).curve(d3.curveBasis);
    const tp = gBottom.append('path').datum(stackedData).attr('d', totalLine)
      .attr('fill', 'none').attr('stroke', '#E07A5F').attr('stroke-width', 1.5).attr('stroke-dasharray', '4,3').attr('opacity', 0); 

    // Fossil line (hidden)
    const fossilLine = d3.line()
      .x(d => xScale(d.year)).y(d => yEmissions(d.fossil)).curve(d3.curveBasis);
    const fp = gBottom.append('path').datum(stackedData).attr('d', fossilLine)
      .attr('fill', 'none').attr('stroke', '#E07A5F').attr('stroke-width', 1.5).attr('opacity', 0); 

    // Axes Bottom
    gBottom.append('g').call(
      d3.axisLeft(yEmissions).ticks(5).tickFormat(d => `${d.toFixed(0)} Gt`)
    ).call(a => a.selectAll('text').attr('fill', '#1A2B3C').attr('font-size', 11).attr('font-family', 'Inter, sans-serif')) 
     .call(a => a.selectAll('line,path').attr('stroke', '#E2E8F0'));

    gBottom.append('g').attr('transform', `translate(0,${bottomH})`).call(
      d3.axisBottom(xScale).ticks(8).tickFormat(d3.format('d'))
    ).call(a => a.selectAll('text').attr('fill', '#1A2B3C').attr('font-size', 11).attr('font-family', 'Inter, sans-serif'))
     .call(a => a.selectAll('line,path').attr('stroke', '#E2E8F0'));

    // Horizontal Bottom Chart Label
    gBottom.append('text').attr('x', -45).attr('y', -10)
      .attr('text-anchor', 'start').attr('font-size', 12).attr('fill', '#1A2B3C').attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', '600').text('Flow: Annual CO₂ Emissions (Gt)');

    if (animated) {
      cp.attr('stroke-dasharray', function() {
        const len = this.getTotalLength();
        return len + ' ' + len;
      })
      .attr('stroke-dashoffset', function() {
        return this.getTotalLength();
      })
      .transition().duration(2000).ease(d3.easeQuadInOut).attr('stroke-dashoffset', 0);
    }

    // --- INTERACTION ---
    const bisect = d3.bisector(d => d.year).left;
    
    // Crosshair line group
    const crosshair = g.append('g').style('display', 'none');
    crosshair.append('line')
      .attr('y1', 0).attr('y2', innerH)
      .attr('stroke', '#64748B').attr('stroke-width', 1).attr('stroke-dasharray', '3,3');

    g.append('rect')
      .attr('width', innerW).attr('height', innerH)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mousemove', function(event) {
        const [mx] = d3.pointer(event);
        let year = Math.round(xScale.invert(mx));
        year = Math.max(yearRange[0], Math.min(yearRange[1], year));
        
        crosshair.style('display', null).attr('transform', `translate(${xScale(year)}, 0)`);

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
      .on('mouseleave', () => {
        crosshair.style('display', 'none');
        setTooltip(null);
      });

  }, [emissions, co2, dims, animated]);

  return (
    <div className="relative w-full">
      <svg ref={svgRef} width={dims.width} height={dims.height} style={{ overflow: 'visible', width: '100%', height: 'auto' }} />
      {tooltip && (
        <div className="fixed pointer-events-none z-50 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-3 text-xs shadow-xl"
          style={{ 
            left: tooltip.x > window.innerWidth - 200 ? tooltip.x - 200 : tooltip.x + 14, 
            top: tooltip.y > window.innerHeight - 150 ? tooltip.y - 150 : tooltip.y - 30 
          }}>
          <div className="font-bold text-text-primary mb-2 border-b border-slate-100 pb-1">{tooltip.year}</div>
          <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1">
            <div className="text-text-primary font-bold">Stock</div>
            <div></div>
            <div className="text-text-muted">Atmospheric CO₂:</div>
            <div className="font-medium text-text-primary">{tooltip.ppm} ppm</div>
            
            <div className="text-text-primary font-bold mt-2">Flow</div>
            <div></div>
            <div className="text-warming">Fossil Emissions:</div>
            <div className="font-medium text-text-primary">{tooltip.fossil} Gt</div>
            <div style={{color:'#A63A2D'}}>Total Emissions:</div>
            <div className="font-medium text-text-primary">{tooltip.total} Gt</div>
          </div>
        </div>
      )}
    </div>
  );
}
