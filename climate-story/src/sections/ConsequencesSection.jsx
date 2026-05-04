import React, { Suspense, lazy, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import SeaIceChart from '../charts/SeaIceChart.jsx';

const IcebergScene = lazy(() => import('../three/IcebergScene.jsx'));

export default function ConsequencesSection({ seaIce }) {
  const [iceScrollProgress, setIceScrollProgress] = useState(0);
  const [animated, setAnimated] = useState(false);
  const sectionRef = useRef();

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      if (rect.top < windowH && rect.bottom > 0) {
        const prog = Math.max(0, Math.min(1, (windowH - rect.top) / (rect.height + windowH)));
        setIceScrollProgress(prog);
        if (prog > 0.1 && !animated) setAnimated(true);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [animated]);

  // Calculate statistics from data
  const firstDecade = seaIce?.filter(d => d.year >= 1979 && d.year <= 1989);
  const lastDecade = seaIce?.filter(d => d.year >= 2013 && d.year <= 2023);
  const avgFirst = firstDecade?.length > 0 ? firstDecade.reduce((s, d) => s + d.september, 0) / firstDecade.length : 7.4;
  const avgLast = lastDecade?.length > 0 ? lastDecade.reduce((s, d) => s + d.september, 0) / lastDecade.length : 4.8;
  const pctLoss = avgFirst > 0 ? ((avgFirst - avgLast) / avgFirst * 100).toFixed(0) : '35';

  return (
    <section id="consequences" ref={sectionRef} style={{ background: '#F7F4EC' }} className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="section-label"
          >
            Chapter 03
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4"
          >
            The <span className="text-gradient-ocean">Consequences</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-muted text-lg leading-relaxed"
          >
            As temperatures rise, the Arctic pays the price. Sea ice — the planet's 
            reflective shield — is shrinking at an alarming rate.
          </motion.p>
        </div>

        {/* Main layout: chart + 3D scene */}
        <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="chart-container"
          >
            <div className="section-label mb-2">Arctic Sea Ice — September Minimum Extent</div>
            <p className="text-text-muted text-xs mb-4 leading-relaxed">
              September records the annual Arctic minimum. Each dot is one year; the trend line shows the decline.
            </p>
            <SeaIceChart data={seaIce} animated={animated} />
          </motion.div>

          {/* 3D Iceberg */}
          <div className="flex flex-col">
            <div
              className="relative rounded-2xl overflow-hidden border border-slate-100"
              style={{ height: '340px', background: 'linear-gradient(180deg, #EAF2F5 0%, #d4eef5 100%)' }}
            >
              <Suspense fallback={
                <div className="flex items-center justify-center h-full text-text-muted text-sm">
                  Loading 3D scene…
                </div>
              }>
                <IcebergScene scrollProgress={iceScrollProgress} />
              </Suspense>

              {/* Overlay label */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 text-xs">
                  <div className="font-semibold text-ocean mb-0.5">Ice volume shrinks as you scroll</div>
                  <div className="text-text-muted">Scale represents relative September ice extent 1979 → 2024</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🧊',
              value: `–${pctLoss}%`,
              label: 'September ice lost',
              sub: 'comparing 1979–1989 vs 2013–2023',
              color: '#3A86A8',
            },
            {
              icon: '📅',
              value: '2012',
              label: 'Record minimum year',
              sub: '3.41 million km² — lowest ever recorded',
              color: '#A63A2D',
            },
            {
              icon: '📐',
              value: '~13%',
              label: 'Lost per decade',
              sub: 'Long-term trend in September Arctic extent',
              color: '#D95D39',
            },
          ].map(s => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="stat-card"
            >
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-3xl font-bold font-display mb-1" style={{ color: s.color }}>{s.value}</div>
              <div className="text-sm font-semibold text-text-primary mb-1">{s.label}</div>
              <div className="text-xs text-text-muted leading-relaxed">{s.sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
