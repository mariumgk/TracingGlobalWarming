import React from 'react';
import { motion } from 'framer-motion';

const TEAM = [
  { name: 'Marium Imran', id: '2023303' },
  { name: 'Team Member 2', id: '2023202' },
];

const DATA_SOURCES = [
  { name: 'NASA GISTEMP Surface Temperature Analysis', url: 'https://data.giss.nasa.gov/gistemp/' },
  { name: 'IPCC AR6 Climate Forcing Attribution (Bloomberg)', url: 'https://www.bloomberg.com/graphics/2015-whats-warming-the-world/' },
  { name: 'NSIDC Sea Ice Index v4.0', url: 'https://nsidc.org/data/seaice_index' },
  { name: 'NOAA GML Mauna Loa CO₂ Monthly Average', url: 'https://gml.noaa.gov/ccgg/trends/' },
  { name: 'Global Carbon Project — Our World in Data', url: 'https://ourworldindata.org/co2-emissions' },
];

const TECH = ['D3.js v7', 'React 18', 'Three.js', 'React Three Fiber', 'Framer Motion', 'Scrollama', 'TailwindCSS', 'Vite'];

export default function Footer() {
  return (
    <footer style={{ background: '#102A43', color: '#A8AEB8' }} className="py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-10 mb-12">
          {/* Team */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: '#F4B860' }}>
              Team Members
            </div>
            <div className="space-y-3">
              {TEAM.map(m => (
                <div key={m.id}>
                  <div className="text-sm font-semibold" style={{ color: '#F7F4EC' }}>{m.name}</div>
                  <div className="text-xs" style={{ color: '#64748B' }}>Student ID: {m.id}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Data sources */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: '#F4B860' }}>
              Data Sources
            </div>
            <div className="space-y-2">
              {DATA_SOURCES.map(s => (
                <div key={s.name}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs hover:text-white transition-colors leading-relaxed block"
                    style={{ color: '#A8AEB8' }}
                  >
                    {s.name}
                  </a>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Built with */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: '#F4B860' }}>
              Built With
            </div>
            <div className="flex flex-wrap gap-2">
              {TECH.map(t => (
                <span
                  key={t}
                  className="text-xs px-2.5 py-1 rounded-full border"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#A8AEB8' }}
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs" style={{ color: '#64748B' }}>
            Tracing Global Warming: From Human Causes to Planetary Consequences
          </div>
          <div className="text-xs" style={{ color: '#64748B' }}>
            Data Visualization Project · 2026
          </div>
        </div>
      </div>
    </footer>
  );
}
