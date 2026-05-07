import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const MARGIN = { top: 10, right: 10, bottom: 10, left: 10 };

const emissionsColorScale = d3.scaleSequentialLog()
  .domain([1e8, 1.2e13])
  .interpolator(t => d3.interpolateOranges(t * 0.9 + 0.05))
  .clamp(true);

export default function EmissionsMap({ countrySnapshot, selectedCountryCode, onCountryClick }) {
  const svgRef = useRef();
  const [dims, setDims] = useState({ width: 900, height: 460 });
  const [tooltip, setTooltip] = useState(null);
  const [worldGeo, setWorldGeo] = useState(null);
  const prevSelectedRef = useRef(selectedCountryCode);

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

    let isInteracting = false;

    const countryByCode = new Map(countrySnapshot.map(d => [d.code, d]));

    const initialScale = Math.min(width, height) / 2.2;

    const projection = d3.geoOrthographic()
      .scale(initialScale)
      .translate([width / 2, height / 2])
      .clipAngle(90);

    const pathGen = d3.geoPath().projection(projection);

    let renderPaths = () => {
      g.selectAll('path.country').attr('d', pathGen);
      g.selectAll('path.graticule').attr('d', pathGen);
      g.selectAll('path.sphere').attr('d', pathGen);
    };

    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('zoom', (event) => {
        projection.scale(initialScale * event.transform.k);
        renderPaths();
      });

    const drag = d3.drag()
      .on('start', () => { isInteracting = true; })
      .on('drag', (event) => {
        const rotate = projection.rotate();
        // Adjust sensitivity based on scale
        const k = 75 / projection.scale();
        projection.rotate([
          rotate[0] + event.dx * k,
          rotate[1] - event.dy * k
        ]);
        renderPaths();
      })
      .on('end', () => { isInteracting = false; });

    // Invisible rect to catch pointer events over the entire SVG area
    svg.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'transparent')
      .attr('pointer-events', 'all')
      .on('click', () => {
        if (onCountryClick) onCountryClick(null);
      })
      .on('pointerenter', () => { isInteracting = true; })
      .on('pointerleave', () => { isInteracting = false; })
      .call(drag)
      .call(zoom);

    // Create a container group
    const g = svg.append('g').style('pointer-events', 'none');

    // Sphere (Ocean background)
    g.append('path')
      .datum({ type: 'Sphere' })
      .attr('class', 'sphere')
      .attr('d', pathGen)
      .attr('fill', '#EAF2F5')
      .attr('stroke', '#CBD5E1')
      .attr('stroke-width', 1);

    // Graticule
    g.append('path')
      .datum(d3.geoGraticule()())
      .attr('class', 'graticule')
      .attr('d', pathGen)
      .attr('fill', 'none')
      .attr('stroke', '#E2E8F0')
      .attr('stroke-width', 0.5)
      .attr('opacity', 0.6);

    // Countries container with pointer events enabled
    const countriesGroup = svg.append('g').attr('class', 'countries-group');

    // Countries
    countriesGroup.selectAll('path.country')
      .data(worldGeo.features)
      .join('path')
      .attr('class', 'country')
      .attr('d', pathGen)
      .attr('fill', d => {
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
      .on('mouseleave', function(event, d) {
        const numericId = +d.id;
        const alpha3 = numericIdToAlpha3(numericId);
        const isSelected = alpha3 === selectedCountryCode;
        d3.select(this)
          .attr('stroke-width', isSelected ? 1.5 : 0.5)
          .attr('stroke', isSelected ? '#D95D39' : 'white');
        setTooltip(null);
      })
      .on('click', function(event, d) {
        event.stopPropagation();
        const numericId = +d.id;
        const matchedEntry = countrySnapshot.find(c => numericIdToAlpha3(numericId) === c.code);
        if (matchedEntry && onCountryClick) {
          if (selectedCountryCode === matchedEntry.code) {
            onCountryClick(null);
          } else {
            onCountryClick(matchedEntry);
          }
        }
      })
      // Initial stroke highlights
      .attr('stroke', d => {
        const alpha3 = numericIdToAlpha3(+d.id);
        return alpha3 === selectedCountryCode ? '#D95D39' : 'white';
      })
      .attr('stroke-width', d => {
        const alpha3 = numericIdToAlpha3(+d.id);
        return alpha3 === selectedCountryCode ? 1.5 : 0.5;
      });

    // We must update the countries group too inside renderPaths
    const originalRenderPaths = renderPaths;
    renderPaths = () => {
      originalRenderPaths();
      countriesGroup.selectAll('path.country').attr('d', pathGen);
    };

    // Auto-focus zoom logic
    const prevSelected = prevSelectedRef.current;
    prevSelectedRef.current = selectedCountryCode;

    if (selectedCountryCode) {
      const selectedFeature = worldGeo.features.find(f => numericIdToAlpha3(+f.id) === selectedCountryCode);
      if (selectedFeature) {
        const p = d3.geoCentroid(selectedFeature);
        const currentRotate = projection.rotate();
        const targetRotate = [-p[0], -p[1]];

        d3.transition().duration(1000).tween('rotate', () => {
          const r = d3.interpolate(currentRotate, targetRotate);
          return (t) => {
            projection.rotate(r(t));
            renderPaths();
          };
        });

        svg.transition().duration(1000).call(
          zoom.transform,
          d3.zoomIdentity.scale(2.5)
        );
      }
    } else if (prevSelected) {
      // Zoom out smoothly
      svg.transition().duration(1000).call(zoom.transform, d3.zoomIdentity);
    } else {
      // Preserve manual zoom state across data renders
      const currentTransform = d3.zoomTransform(svg.node());
      projection.scale(initialScale * currentTransform.k);
      renderPaths();
    }

    const timer = d3.timer(() => {
      if (!isInteracting && !selectedCountryCode) {
        const r = projection.rotate();
        projection.rotate([r[0] + 0.15, r[1]]);
        renderPaths();
      }
    });

    return () => {
      timer.stop();
    };

  }, [worldGeo, countrySnapshot, dims, selectedCountryCode]);

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
                <span className="font-semibold text-text-primary">{(+tooltip.total * 1000).toFixed(1)} Gt CO₂</span> ({tooltip.year})
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
