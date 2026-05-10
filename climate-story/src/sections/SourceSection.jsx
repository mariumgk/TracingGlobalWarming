import React, { Suspense, lazy, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import EmissionsCO2Chart from '../charts/EmissionsCO2Chart.jsx';

const CO2ParticlesScene = lazy(() => import('../three/CO2ParticlesScene.jsx'));

export default function SourceSection({ emissions, co2 }) {
  const [animated, setAnimated] = useState(false);
  const [emissionLevel, setEmissionLevel] = useState(0);
  const sectionRef = useRef();

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      if (rect.top < windowH * 0.8) {
        if (!animated) setAnimated(true);
        const prog = Math.max(0, Math.min(1, (windowH - rect.top) / (rect.height * 0.6 + windowH)));
        setEmissionLevel(prog);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [animated]);

  // Latest CO₂ ppm
  const latestCO2 = co2?.[co2.length - 1];
  const latestEmissions = emissions?.worldByYear?.[emissions.worldByYear.length - 1];

  return (
    <section id="source" ref={sectionRef} style={{ background: '#EAF2F5' }} className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="section-label"
          >
            Chapter 04
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4"
          >
            The <span className="text-gradient-warm">Source</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-muted text-lg leading-relaxed"
          >
            Human emissions are the tap. The atmosphere is the tank. As we keep 
            burning fossil fuels, the CO₂ concentration keeps rising — with no sign of a peak.
          </motion.p>
        </div>

        {/* Flow metaphor callout */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
          viewport={{ once: true, margin: "-50px" }}
          className="mb-12 p-6 rounded-2xl border-l-4 border-warming"
          style={{ background: '#FEF2EE' }}
        >
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <div className="text-sm font-semibold text-warming mb-2">The tap and the tank</div>
              <p className="text-sm text-text-primary leading-relaxed">
                Annual emissions are the <strong>flow</strong> — how much CO₂ we add each year. 
                Atmospheric CO₂ is the <strong>stock</strong> — the accumulated total since industrialization.
                Even if we slow the tap, the tank keeps filling.
              </p>
            </div>
            <div className="flex gap-6 shrink-0">
              <div className="text-center">
                <div className="text-2xl font-bold font-display text-warming">
                  {latestEmissions ? `${latestEmissions.total.toFixed(1)} Gt` : '37 Gt'}
                </div>
                <div className="text-xs text-text-muted mt-1">Annual CO₂ emissions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold font-display text-text-primary">
                  {latestCO2 ? `${latestCO2.ppm.toFixed(0)} ppm` : '425 ppm'}
                </div>
                <div className="text-xs text-text-muted mt-1">Atmospheric CO₂</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main content: chart + 3D scene */}
        <div className="grid md:grid-cols-5 gap-8 items-start">
          {/* Chart (larger) */}
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.8 }}
            viewport={{ once: true, margin: "-50px" }}
            className="md:col-span-3 chart-container min-w-0"
          >
            <div className="section-label mb-1">Emissions (left axis) vs Atmospheric CO₂ (right axis)</div>
            <div className="flex gap-6 mb-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-3 rounded-sm opacity-60" style={{ background: '#D95D39' }} />
                <span className="text-text-muted">Fossil fuel emissions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-3 rounded-sm opacity-50" style={{ background: '#F4B860' }} />
                <span className="text-text-muted">Land-use change</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="20" height="10"><line x1="0" y1="5" x2="20" y2="5" stroke="#102A43" strokeWidth="2" /></svg>
                <span className="text-text-muted">Atmospheric CO₂</span>
              </div>
            </div>
            <EmissionsCO2Chart
              emissions={emissions?.worldByYear}
              co2={co2}
              animated={animated}
            />
          </motion.div>

          {/* 3D particle scene */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <div
              className="rounded-2xl overflow-hidden border border-slate-100"
              style={{ height: '300px', background: 'linear-gradient(180deg, #FFFDF8 0%, #F7F4EC 100%)' }}
            >
              <Suspense fallback={<div className="flex items-center justify-center h-full text-text-muted text-sm">Loading…</div>}>
                <CO2ParticlesScene emissionLevel={emissionLevel} />
              </Suspense>
            </div>
            <div className="bg-white/80 rounded-xl p-4 text-xs border border-slate-100">
              <div className="font-semibold text-warming mb-1">CO₂ particle flow</div>
              <div className="text-text-muted leading-relaxed">
                Orange particles represent annual CO₂ emissions rising into the atmosphere. 
                The sphere fills as cumulative concentration grows.
              </div>
            </div>

            {/* Keeling Curve annotation */}
            <div className="stat-card text-xs">
              <div className="font-semibold text-text-primary mb-2">The Keeling Curve</div>
              <p className="text-text-muted leading-relaxed">
                Continuous CO₂ measurements at Mauna Loa, Hawaii began in 1958. 
                In 1958: <strong>315 ppm</strong>. Today: <strong>425+ ppm</strong>. 
                This unbroken 65-year record is the most important time series in climate science.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
