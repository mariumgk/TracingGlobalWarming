import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import EmissionsMap from '../charts/EmissionsMap.jsx';

export default function MapSection({ countrySnapshot }) {
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Top 10 emitters
  const top10 = countrySnapshot?.slice(0, 10) || [];

  return (
    <section id="map" style={{ background: '#F7F4EC' }} className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-12">
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
            className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4"
          >
            Where We <span style={{ color: '#8B5CF6' }}>Stand</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-muted text-lg leading-relaxed"
          >
            Emissions are not evenly distributed. A handful of countries account for 
            the majority of cumulative CO₂ output. Click a country to explore.
          </motion.p>
        </div>

        {/* Color scale legend */}
        <div className="flex items-center gap-4 mb-8">
          <span className="text-xs text-text-muted">Lower emissions</span>
          <div
            className="h-3 rounded flex-1 max-w-xs"
            style={{
              background: 'linear-gradient(to right, #FEF3E2, #F97316, #A63A2D)',
            }}
          />
          <span className="text-xs text-text-muted">Higher emissions</span>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Map */}
          <div className="md:col-span-3">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="chart-container p-0 overflow-hidden"
            >
              <EmissionsMap
                countrySnapshot={countrySnapshot}
                onCountryClick={setSelectedCountry}
              />
            </motion.div>
            <p className="text-xs text-text-muted mt-2 px-2">
              Color represents total CO₂ + land-use emissions. Click any country for details.
            </p>
          </div>

          {/* Sidebar: top emitters + selected country */}
          <div className="md:col-span-1 flex flex-col gap-4">
            {/* Selected country card */}
            <AnimatePresence mode="wait">
              {selectedCountry && (
                <motion.div
                  key={selectedCountry.code}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="stat-card border border-warming/20"
                  style={{ background: '#FEF2EE' }}
                >
                  <div className="section-label mb-1" style={{ color: '#D95D39' }}>Selected</div>
                  <div className="text-lg font-bold font-display text-text-primary mb-1">
                    {selectedCountry.entity}
                  </div>
                  <div className="text-2xl font-bold text-warming mb-1">
                    {(selectedCountry.total / 1e9).toFixed(2)} Gt
                  </div>
                  <div className="text-xs text-text-muted">
                    CO₂ + land-use ({selectedCountry.year})
                  </div>
                  <div className="mt-2 text-xs text-text-muted">
                    Fossil: {(selectedCountry.fossil / 1e9).toFixed(2)} Gt<br />
                    Land use: {(selectedCountry.landUse / 1e9).toFixed(2)} Gt
                  </div>
                  <button
                    onClick={() => setSelectedCountry(null)}
                    className="mt-3 text-xs text-text-muted hover:text-text-primary"
                  >
                    ✕ Clear
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Top 10 list */}
            <div className="chart-container flex-1">
              <div className="section-label mb-3">Top Emitters</div>
              <div className="space-y-2">
                {top10.map((c, i) => {
                  const maxTotal = top10[0]?.total || 1;
                  const barPct = (c.total / maxTotal) * 100;
                  return (
                    <button
                      key={c.code}
                      onClick={() => setSelectedCountry(c)}
                      className="w-full text-left group"
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-medium text-text-primary group-hover:text-warming transition-colors">
                          {i + 1}. {c.entity}
                        </span>
                        <span className="text-xs text-text-muted">
                          {(c.total / 1e9).toFixed(1)} Gt
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${barPct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: i * 0.06 }}
                          className="h-full rounded-full"
                          style={{ background: i === 0 ? '#D95D39' : i < 3 ? '#F4B860' : '#A8AEB8' }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
