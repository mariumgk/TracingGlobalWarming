import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { motion } from 'framer-motion';

export default function CarbonCycleSankey({ animated = true }) {
  const svgRef = useRef(null);
  const [dims, setDims] = useState({ width: 800, height: 260 });

  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      if (width > 50) setDims({ width, height: Math.max(220, width * 0.3) });
    });
    ro.observe(el);
    const w = el.getBoundingClientRect().width;
    if (w > 50) setDims({ width: w, height: Math.max(220, w * 0.3) });
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || dims.width < 100) return;

    const { width, height } = dims;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 160, bottom: 20, left: 160 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    // Data definition (GtCO2/yr)
    const sources = [
      { id: 'fossil', label: 'Fossil Fuels & Industry', value: 35, color: '#D95D39' },
      { id: 'landUse', label: 'Land-Use Change', value: 4, color: '#F4B860' },
    ];
    
    const sinks = [
      { id: 'land', label: 'Land Sink (Forests)', value: 11, color: '#7DA17A' },
      { id: 'ocean', label: 'Ocean Sink', value: 10, color: '#3A86A8' },
      { id: 'atm', label: 'Stays in Atmosphere', value: 18, color: '#8B5CF6' },
    ];

    const links = [
      { source: 'fossil', target: 'land', value: 11, color: '#D95D39' },
      { source: 'fossil', target: 'ocean', value: 10, color: '#D95D39' },
      { source: 'fossil', target: 'atm', value: 14, color: '#D95D39' },
      { source: 'landUse', target: 'atm', value: 4, color: '#F4B860' },
    ];

    // Layout
    const totalVal = 39;
    const nodeWidth = 6;
    const nodeGap = 15;
    
    // Scale value to height
    const scaleY = d3.scaleLinear()
      .domain([0, totalVal])
      .range([0, innerH - nodeGap * 2]); // Account for gaps

    // Calculate Source Y positions
    let currY = 0;
    const sourceNodes = sources.map(s => {
      const h = scaleY(s.value);
      const node = { ...s, y: currY, h, x: 0 };
      currY += h + nodeGap;
      return node;
    });

    // Calculate Sink Y positions
    currY = 0;
    const sinkNodes = sinks.map(s => {
      const h = scaleY(s.value);
      const node = { ...s, y: currY, h, x: innerW };
      currY += h + nodeGap;
      return node;
    });

    // Match links to exact Y positions on nodes
    const sourceYOffsets = { fossil: 0, landUse: 0 };
    const sinkYOffsets = { land: 0, ocean: 0, atm: 0 };

    const formattedLinks = links.map(l => {
      const sNode = sourceNodes.find(n => n.id === l.source);
      const tNode = sinkNodes.find(n => n.id === l.target);
      const h = scaleY(l.value);
      
      const sy = sNode.y + sourceYOffsets[l.source] + h / 2;
      const ty = tNode.y + sinkYOffsets[l.target] + h / 2;
      
      sourceYOffsets[l.source] += h;
      sinkYOffsets[l.target] += h;

      return {
        ...l,
        sourcePt: [sNode.x + nodeWidth, sy],
        targetPt: [tNode.x - nodeWidth, ty],
        thickness: h
      };
    });

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Draw Links
    const linkGen = d3.linkHorizontal().x(d => d[0]).y(d => d[1]);

    const pathEls = g.append('g')
      .selectAll('path')
      .data(formattedLinks)
      .join('path')
      .attr('d', d => linkGen({ source: d.sourcePt, target: d.targetPt }))
      .attr('fill', 'none')
      .attr('stroke', d => d.color)
      .attr('stroke-width', d => d.thickness)
      .attr('stroke-opacity', 0.25)
      .style('mix-blend-mode', 'multiply')
      .attr('class', 'sankey-link transition-opacity duration-300');

    if (animated) {
      pathEls.each(function() {
        const len = this.getTotalLength();
        d3.select(this)
          .attr('stroke-dasharray', len)
          .attr('stroke-dashoffset', len)
          .transition()
          .duration(1500)
          .ease(d3.easeCubicInOut)
          .attr('stroke-dashoffset', 0);
      });
    }

    // Draw Nodes
    const drawNode = (node, isRight) => {
      const gNode = g.append('g')
        .datum(node)
        .attr('class', 'sankey-node cursor-pointer')
        .attr('transform', `translate(${node.x},${node.y})`);

      // Node rect
      gNode.append('rect')
        .attr('x', isRight ? -nodeWidth : 0)
        .attr('width', nodeWidth)
        .attr('height', node.h)
        .attr('fill', node.color)
        .attr('rx', 3);

      // Label text
      const textX = isRight ? 12 : -12;
      const textAnchor = isRight ? 'start' : 'end';
      
      const textG = gNode.append('g')
        .attr('transform', `translate(${textX}, ${node.h / 2})`);

      textG.append('text')
        .attr('dy', '-0.2em')
        .attr('text-anchor', textAnchor)
        .attr('font-size', '13px')
        .attr('font-weight', '600')
        .attr('fill', '#334155')
        .text(node.label);

      textG.append('text')
        .attr('dy', '1.2em')
        .attr('text-anchor', textAnchor)
        .attr('font-size', '11px')
        .attr('font-weight', '700')
        .attr('fill', node.color)
        .text(`${node.value} GtCO₂`);
    };

    sourceNodes.forEach(n => drawNode(n, false));
    sinkNodes.forEach(n => drawNode(n, true));

    // Column titles
    svg.append('text')
      .attr('x', margin.left)
      .attr('y', 16)
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('fill', '#94A3B8')
      .attr('text-anchor', 'end')
      .attr('letter-spacing', '0.05em')
      .attr('text-transform', 'uppercase')
      .text('Sources (The Tap)');

    svg.append('text')
      .attr('x', width - margin.right)
      .attr('y', 16)
      .attr('font-size', '10px')
      .attr('font-weight', '700')
      .attr('fill', '#94A3B8')
      .attr('text-anchor', 'start')
      .attr('letter-spacing', '0.05em')
      .attr('text-transform', 'uppercase')
      .text('Sinks (The Drain & Tank)');

    // Add interactivity states directly via React state to trigger re-renders
    // To do this simply in D3, we can just attach events to the nodes
    g.selectAll('.sankey-node')
      .on('mouseenter', function(e, d) {
        pathEls.transition().duration(200).attr('stroke-opacity', link => {
          if (link.source === d.id || link.target === d.id) return 0.6;
          return 0.05;
        });
      })
      .on('mouseleave', function() {
        pathEls.transition().duration(200).attr('stroke-opacity', 0.25);
      });

  }, [dims, animated]);

  return (
    <div className="relative w-full">
      <svg ref={svgRef} width={dims.width} height={dims.height} style={{ overflow: 'visible' }} />
    </div>
  );
}
