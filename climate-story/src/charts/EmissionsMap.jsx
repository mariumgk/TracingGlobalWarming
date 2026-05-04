import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const MARGIN = { top: 10, right: 10, bottom: 10, left: 10 };

const emissionsColorScale = d3.scaleSequentialLog()
  .domain([1e8, 1.2e13])
  .interpolator(t => d3.interpolateOranges(t * 0.9 + 0.05))
  .clamp(true);

export default function EmissionsMap({ countrySnapshot, onCountryClick }) {
  const svgRef = useRef();
  const [dims, setDims] = useState({ width: 900, height: 460 });
  const [tooltip, setTooltip] = useState(null);
  const [worldGeo, setWorldGeo] = useState(null);

  // Load world topojson
  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then(r => r.json())
      .then(topo => {
        setWorldGeo(topojson.feature(topo, topo.objects.countries));
      })
      .catch(() => {
        // Fallback: render message
      });
  }, []);

  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      const { width } = entries[0].contentRect;
      setDims({ width, height: Math.round(width * 0.5) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!worldGeo || !countrySnapshot || !svgRef.current) return;

    const { width, height } = dims;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Build emissions lookup: numeric ISO → total tonnes
    const emissionsByNumericId = new Map();
    // We'll match by country code — need a name→numeric map
    // Use a simplified approach: map entity names to ISO numeric via a lookup
    // The topojson uses numeric IDs, so we'll use a name-based fallback
    const countryByCode = new Map(countrySnapshot.map(d => [d.code, d]));

    const projection = d3.geoNaturalEarth1()
      .scale(width / 6.3)
      .translate([width / 2, height / 2]);

    const pathGen = d3.geoPath().projection(projection);

    const g = svg.append('g');

    // Graticule
    const graticule = d3.geoGraticule();
    g.append('path').datum(graticule())
      .attr('d', pathGen)
      .attr('fill', 'none')
      .attr('stroke', '#E2E8F0')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.6);

    // Countries
    g.selectAll('path.country')
      .data(worldGeo.features)
      .join('path')
      .attr('class', 'country')
      .attr('d', pathGen)
      .attr('fill', d => {
        // Try to match by ISO numeric ID via a known map
        const numericId = +d.id;
        const matchedEntry = countrySnapshot.find(c => numericIdToAlpha3(numericId) === c.code);
        if (matchedEntry && matchedEntry.total > 0) {
          return emissionsColorScale(matchedEntry.total);
        }
        return '#E8EAED';
      })
      .attr('stroke', 'white')
      .attr('stroke-width', 0.5)
      .attr('cursor', 'pointer')
      .attr('opacity', 0)
      .on('mousemove', function(event, d) {
        const numericId = +d.id;
        const matchedEntry = countrySnapshot.find(c => numericIdToAlpha3(numericId) === c.code);
        d3.select(this).attr('stroke-width', 1.5).attr('stroke', '#D95D39');
        setTooltip({
          x: event.clientX,
          y: event.clientY,
          name: matchedEntry?.entity || `Country ${d.id}`,
          total: matchedEntry ? (matchedEntry.total / 1e12).toFixed(3) : null,
          year: matchedEntry?.year,
        });
      })
      .on('mouseleave', function() {
        d3.select(this).attr('stroke-width', 0.5).attr('stroke', 'white');
        setTooltip(null);
      })
      .on('click', function(event, d) {
        const numericId = +d.id;
        const matchedEntry = countrySnapshot.find(c => numericIdToAlpha3(numericId) === c.code);
        if (matchedEntry && onCountryClick) onCountryClick(matchedEntry);
      })
      .transition()
      .duration(800)
      .delay((d, i) => i * 1.5)
      .attr('opacity', 1);

    // Sphere outline
    g.append('path')
      .datum({ type: 'Sphere' })
      .attr('d', pathGen)
      .attr('fill', 'none')
      .attr('stroke', '#CBD5E1')
      .attr('stroke-width', 1);

  }, [worldGeo, countrySnapshot, dims]);

  return (
    <div className="relative w-full">
      <svg ref={svgRef} width={dims.width} height={dims.height} style={{ width: '100%', height: 'auto' }} />
      {tooltip && (
        <div
          className="map-tooltip"
          style={{ left: tooltip.x + 14, top: tooltip.y - 10 }}
        >
          <div className="font-bold text-text-primary text-sm">{tooltip.name}</div>
          {tooltip.total !== null ? (
            <>
              <div className="text-xs text-text-muted mt-1">
                <span className="font-semibold text-warming">{(+tooltip.total * 1000).toFixed(1)} Gt CO₂</span> ({tooltip.year})
              </div>
            </>
          ) : (
            <div className="text-xs text-text-muted mt-1">No data</div>
          )}
        </div>
      )}
    </div>
  );
}

// Simplified ISO 3166-1 numeric → alpha-3 mapping (major emitters)
function numericIdToAlpha3(id) {
  const map = {
    840: 'USA', 156: 'CHN', 356: 'IND', 643: 'RUS', 392: 'JPN',
    276: 'DEU', 410: 'KOR', 364: 'IRN', 124: 'CAN', 682: 'SAU',
    484: 'MEX', 360: 'IDN', 710: 'ZAF', 36: 'AUS', 76: 'BRA',
    826: 'GBR', 250: 'FRA', 380: 'ITA', 792: 'TUR', 616: 'POL',
    764: 'THA', 504: 'MAR', 818: 'EGY', 566: 'NGA', 702: 'SGP',
    528: 'NLD', 724: 'ESP', 56: 'BEL', 752: 'SWE', 246: 'FIN',
    578: 'NOR', 208: 'DNK', 40: 'AUT', 756: 'CHE', 300: 'GRC',
    620: 'PRT', 203: 'CZE', 348: 'HUN', 642: 'ROU', 100: 'BGR',
    804: 'UKR', 398: 'KAZ', 860: 'UZB', 50: 'BGD', 586: 'PAK',
    144: 'LKA', 104: 'MMR', 704: 'VNM', 608: 'PHL', 458: 'MYS',
    288: 'GHA', 404: 'KEN', 231: 'ETH', 12: 'DZA', 788: 'TUN',
    68: 'BOL', 604: 'PER', 170: 'COL', 152: 'CHL', 32: 'ARG',
    858: 'URY', 862: 'VEN', 218: 'ECU', 192: 'CUB', 630: 'PRI',
    96: 'BRN',
  };
  return map[id] || null;
}
