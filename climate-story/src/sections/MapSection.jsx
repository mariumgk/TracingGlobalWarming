import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmissionsBarChartRace from '../charts/EmissionsBarChartRace.jsx';

export default function MapSection({ emissionsData }) {
  const { countriesHistory } = emissionsData || {};

  // All unique years and countries
  const years = useMemo(() => {
    if (!countriesHistory) return [];
    return Array.from(new Set(countriesHistory.map(d => d.year))).sort((a, b) => a - b);
  }, [countriesHistory]);

  const allCountriesList = useMemo(() => {
    if (!countriesHistory) return [];
    const unique = new Map();
    countriesHistory.forEach(d => {
      if (!unique.has(d.code)) unique.set(d.code, { code: d.code, entity: d.entity });
    });
    return Array.from(unique.values()).sort((a, b) => a.entity.localeCompare(b.entity));
  }, [countriesHistory]);

  const minYear = years.length > 0 ? years[0] : 1850;
  const maxYear = years.length > 0 ? years[years.length - 1] : 2022;

  // State
  const [currentYear, setCurrentYear] = useState(minYear);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playSpeed, setPlaySpeed] = useState(400);
  const [selectedCountries, setSelectedCountries] = useState([]);
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [pinnedCountry, setPinnedCountry] = useState(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [filterMode, setFilterMode] = useState('top10'); // 'top10' | 'selected' | 'all'

  // Sync year on first load
  useEffect(() => {
    if (minYear !== 1850 && currentYear === 1850) setCurrentYear(minYear);
  }, [minYear]);

  // Animation Loop
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentYear(y => (y >= maxYear ? minYear : y + 1));
      }, playSpeed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, maxYear, minYear, playSpeed]);

  // Top 10 for the current year (always based on raw ranking)
  const top10ForYear = useMemo(() => {
    if (!countriesHistory) return [];
    return countriesHistory
      .filter(d => d.year === currentYear)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }, [countriesHistory, currentYear]);

  // Chart data — based on mode + selected list
  const currentData = useMemo(() => {
    if (!countriesHistory) return [];
    const forYear = countriesHistory.filter(d => d.year === currentYear);

    if (filterMode === 'top10' || selectedCountries.length === 0) {
      return forYear.sort((a, b) => b.total - a.total).slice(0, 10);
    }
    // selected mode
    const codes = new Set(selectedCountries.map(c => c.code));
    return forYear
      .filter(d => codes.has(d.code))
      .sort((a, b) => b.total - a.total);
  }, [countriesHistory, currentYear, selectedCountries, filterMode]);

  const maxTotal = currentData.length > 0 ? currentData[0].total : 1;

  // Toggle a country in/out of selected list
  const toggleCountry = (country) => {
    setSelectedCountries(prev => {
      const exists = prev.find(c => c.code === country.code);
      const next = exists ? prev.filter(c => c.code !== country.code) : [...prev, country];
      // If adding first country, switch to selected mode
      if (!exists && filterMode !== 'selected') setFilterMode('selected');
      // If removing last country, fall back to top10
      if (exists && next.length === 0) setFilterMode('top10');
      return next;
    });
  };

  const clearAll = () => {
    setSelectedCountries([]);
    setFilterMode('top10');
    setFilterQuery('');
  };

  // Filtered country list for sidebar search
  const filteredList = useMemo(() => {
    const query = filterQuery.toLowerCase();
    if (!query) return allCountriesList;
    return allCountriesList.filter(c => c.entity.toLowerCase().includes(query));
  }, [filterQuery, allCountriesList]);

  // Detail card (hover or pinned)
  const detailCountryData = useMemo(() => {
    const target = pinnedCountry || hoveredCountry;
    if (!target) return null;
    return currentData.find(d => d.code === target.code) || target;
  }, [pinnedCountry, hoveredCountry, currentData]);

  return (
    <section id="where-we-stand" style={{ background: '#F7F4EC' }} className="py-24 overflow-hidden relative">
      <div className="max-w-[90rem] mx-auto px-6">

        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="section-label"
          >
            Chapter 05
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-6"
          >
            Where We <span style={{ color: '#D95D39' }}>Stand</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-muted text-lg leading-relaxed"
          >
            Emissions are not evenly distributed. Over time, a small group of countries comes to dominate total CO₂ output. Explore the changing rankings across history.
          </motion.p>
        </div>

        {/* Playback Controls — centered above chart */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4 bg-white/70 backdrop-blur-sm px-6 py-3 rounded-full shadow-sm border border-slate-200/50">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-text-primary transition-colors"
            >
              {isPlaying ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            <input
              type="range"
              min={minYear}
              max={maxYear}
              value={currentYear}
              onChange={e => { setCurrentYear(Number(e.target.value)); setIsPlaying(false); }}
              className="w-48 md:w-72 accent-warming cursor-pointer"
            />

            <div className="text-sm font-bold font-display text-text-primary min-w-[3rem] tabular-nums">
              {currentYear}
            </div>

            <button
              onClick={() => setPlaySpeed(s => s === 400 ? 150 : 400)}
              title="Toggle speed"
              className="text-xs text-text-muted hover:text-text-primary font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              {playSpeed === 400 ? '1×' : '2×'}
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">

          {/* ── Chart Area ── */}
          <div className="bg-white/50 backdrop-blur-md rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/50">
            <EmissionsBarChartRace
              data={currentData}
              maxTotal={maxTotal}
              currentYear={currentYear}
              hoveredCountry={hoveredCountry}
              pinnedCountry={pinnedCountry}
              onHover={setHoveredCountry}
              onClick={d => setPinnedCountry(prev => prev?.code === d.code ? null : d)}
            />
            <p className="text-xs text-text-muted mt-6 border-t border-slate-200/50 pt-4 flex justify-between items-center">
              <span>Total CO₂ = Fossil Fuels &amp; Industry + Land-Use Change</span>
              <span>Values in Gt (Gigatonnes)</span>
            </p>
          </div>

          {/* ── Right Sidebar ── */}
          <div className="flex flex-col gap-5">

            {/* ── FILTER PANEL ── */}
            <div className="bg-white/80 rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden">

              {/* Panel header */}
              <div className="px-5 pt-5 pb-3 border-b border-slate-100">
                <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Country Filter</div>

                {/* Mode pills */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => { setFilterMode('top10'); setSelectedCountries([]); setFilterQuery(''); }}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
                      filterMode === 'top10'
                        ? 'bg-warming text-white border-warming shadow-sm'
                        : 'text-text-muted border-slate-200 hover:border-warming/40 hover:text-warming bg-white'
                    }`}
                  >
                    Top 10
                  </button>
                  <button
                    onClick={() => {
                      if (selectedCountries.length > 0) setFilterMode('selected');
                    }}
                    disabled={selectedCountries.length === 0}
                    className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all border ${
                      filterMode === 'selected' && selectedCountries.length > 0
                        ? 'bg-warming text-white border-warming shadow-sm'
                        : 'text-text-muted border-slate-200 bg-white disabled:opacity-40'
                    }`}
                  >
                    Selected {selectedCountries.length > 0 && `(${selectedCountries.length})`}
                  </button>
                  {selectedCountries.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="text-xs px-3 py-1.5 rounded-full font-semibold border border-red-200 text-red-400 hover:text-red-600 hover:border-red-300 bg-white transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* ── Top 10 quick list ── */}
              <div className="px-5 pt-4 pb-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Top 10 · {currentYear}
                </div>
                <div className="space-y-1">
                  {top10ForYear.map((c, i) => {
                    const isSelected = selectedCountries.find(sc => sc.code === c.code);
                    const maxVal = top10ForYear[0]?.total || 1;
                    const pct = Math.max(0, (c.total / maxVal) * 100);
                    return (
                      <button
                        key={c.code}
                        onClick={() => toggleCountry(c)}
                        className={`w-full text-left group rounded-lg px-2 py-1.5 transition-all ${
                          isSelected ? 'bg-orange-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-baseline justify-between mb-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 w-3 shrink-0">{i + 1}</span>
                            <span className={`text-xs font-medium truncate max-w-[110px] transition-colors ${
                              isSelected ? 'text-warming' : 'text-text-primary group-hover:text-warming'
                            }`}>
                              {c.entity}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] text-text-muted tabular-nums">
                              {(c.total / 1e9).toFixed(1)}
                            </span>
                            {isSelected && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-warming">
                                <polyline points="20 6 9 17 4 12"/>
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${pct}%`,
                              background: isSelected ? '#D95D39' : (i === 0 ? '#D95D39' : '#F4B860'),
                              opacity: isSelected ? 1 : 0.7
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Divider ── */}
              <div className="mx-5 border-t border-slate-100" />

              {/* ── Full country search list ── */}
              <div className="px-5 pt-3 pb-5">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  All Countries
                </div>

                {/* Search input */}
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 mb-2 border border-slate-200/60">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 shrink-0">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filterQuery}
                    onChange={e => setFilterQuery(e.target.value)}
                    className="bg-transparent border-none outline-none text-xs text-text-primary w-full placeholder-slate-400"
                  />
                  {filterQuery && (
                    <button onClick={() => setFilterQuery('')} className="text-slate-400 hover:text-text-primary text-xs">✕</button>
                  )}
                </div>

                {/* Scrollable list */}
                <div className="max-h-52 overflow-y-auto space-y-0.5 pr-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e2e8f0 transparent' }}>
                  {filteredList.map(c => {
                    const isSelected = selectedCountries.find(sc => sc.code === c.code);
                    return (
                      <button
                        key={c.code}
                        onClick={() => toggleCountry(c)}
                        className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors flex justify-between items-center ${
                          isSelected
                            ? 'bg-orange-50 text-warming font-semibold'
                            : 'hover:bg-slate-50 text-text-primary'
                        }`}
                      >
                        <span className="truncate">{c.entity}</span>
                        {isSelected && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-warming shrink-0 ml-1">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        )}
                      </button>
                    );
                  })}
                  {filteredList.length === 0 && (
                    <div className="px-2 py-3 text-xs text-text-muted">No countries found.</div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Insight Card ── */}
            <div className="bg-white/80 rounded-2xl p-5 shadow-sm border border-slate-200/50">
              <div className="text-xs font-bold text-warming uppercase tracking-wider mb-2">Insight</div>
              <p className="text-sm text-text-primary leading-relaxed">
                {currentYear < 1900
                  ? 'In the 19th century, land-use change and early Western industrialization drove global emissions.'
                  : currentYear < 1960
                  ? 'The mid-20th century saw a surge in industrial emissions from the US and Europe.'
                  : currentYear < 2000
                  ? 'Industrialization spreads — Asian economies begin their rapid ascent.'
                  : 'Today, a handful of large economies account for the vast majority of global CO₂.'}
              </p>
            </div>

            {/* ── Pinned / Hovered Detail Card ── */}
            <AnimatePresence mode="wait">
              {detailCountryData && (
                <motion.div
                  key={detailCountryData.code}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="bg-[#FEF2EE] rounded-2xl p-5 shadow-sm border border-warming/20 relative"
                >
                  <div className="text-xs font-bold text-warming uppercase tracking-wider mb-1">
                    {pinnedCountry?.code === detailCountryData.code ? 'Pinned' : 'Viewing'}
                  </div>
                  <h3 className="text-lg font-display font-bold text-text-primary mb-3 pr-6 leading-tight">
                    {detailCountryData.entity}
                  </h3>

                  {detailCountryData.total ? (
                    <>
                      <div className="text-2xl font-bold text-warming mb-3">
                        {(detailCountryData.total / 1e9).toFixed(2)}{' '}
                        <span className="text-sm font-medium text-text-muted">Gt</span>
                      </div>
                      <div className="space-y-2.5">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-text-muted">Fossil &amp; Industry</span>
                            <span className="font-medium text-text-primary">{(detailCountryData.fossil / 1e9).toFixed(2)}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-slate-500 rounded-full" style={{ width: `${Math.max(0, (detailCountryData.fossil / detailCountryData.total) * 100)}%` }} />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-text-muted">Land-Use Change</span>
                            <span className="font-medium text-text-primary">{(detailCountryData.landUse / 1e9).toFixed(2)}</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(0, (detailCountryData.landUse / detailCountryData.total) * 100)}%` }} />
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-text-muted">No data for {currentYear}</div>
                  )}

                  {pinnedCountry && (
                    <button
                      onClick={() => setPinnedCountry(null)}
                      className="absolute top-4 right-4 text-text-muted hover:text-text-primary"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </div>
    </section>
  );
}
