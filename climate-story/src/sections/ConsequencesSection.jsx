import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import SeaIceChart from '../charts/SeaIceChart.jsx';
import SeaLevelChart from '../charts/SeaLevelChart.jsx';

export default function ConsequencesSection({ seaIce, seaLevel }) {
  const [animated, setAnimated] = useState(false);
  const sectionRef = useRef();

  useEffect(() => {
    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowH = window.innerHeight;
      if (rect.top < windowH && rect.bottom > 0) {
        const prog = Math.max(0, Math.min(1, (windowH - rect.top) / (rect.height + windowH)));
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

  // Sea level rise stat
  const firstSL = seaLevel?.find(d => d.year === 1993);
  const lastSL = seaLevel ? seaLevel[seaLevel.length - 1] : null;
  const slRise = firstSL && lastSL ? (lastSL.gmslSmooth - firstSL.gmslSmooth).toFixed(1) : '>10';

  return (
    <section id="consequences" ref={sectionRef} className="consequences-section">
      {/* Full-screen background image */}
      <div className="consequences-bg-layer" />
      {/* Soft readability overlay */}
      <div className="consequences-bg-overlay" />

      {/* Existing content — untouched */}
      <div className="consequences-existing-content max-w-7xl mx-auto px-6 py-24">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
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
            As temperatures rise, the cryosphere and oceans both pay the price —
            Arctic ice vanishes while rising seas encroach on coastlines worldwide.
          </motion.p>
        </div>

        {/* Side-by-side charts */}
        <div className="grid md:grid-cols-2 gap-8 items-start mb-16">
          {/* Sea Ice Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.8 }}
            viewport={{ once: true, margin: '-50px' }}
            className="chart-container overflow-hidden"
            style={{ position: 'relative', padding: 0 }}
          >
            {/* Background image */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${import.meta.env.BASE_URL}arctic_sea_ice_bg.png)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.18,
                zIndex: 0,
                borderRadius: 'inherit',
              }}
            />
            {/* Frosted overlay */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(234,242,245,0.82) 0%, rgba(212,238,245,0.75) 100%)',
                zIndex: 1,
                borderRadius: 'inherit',
              }}
            />
            {/* Content */}
            <div style={{ position: 'relative', zIndex: 2, padding: '1.5rem' }}>
              <div className="section-label mb-2">Arctic Sea Ice — September Minimum Extent</div>
              <p className="text-text-muted text-xs mb-4 leading-relaxed">
                September records the annual Arctic minimum. Each dot is one year; the trend line shows the decline.
              </p>
              <SeaIceChart data={seaIce} animated={animated} />
            </div>
          </motion.div>

          {/* Sea Level Chart */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.8, delay: 0.1 }}
            viewport={{ once: true, margin: '-50px' }}
            className="chart-container overflow-hidden"
            style={{ position: 'relative', padding: 0 }}
          >
            {/* Background image */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${import.meta.env.BASE_URL}sea_level_rise_bg.png)`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.18,
                zIndex: 0,
                borderRadius: 'inherit',
              }}
            />
            {/* Frosted overlay */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, rgba(239,246,255,0.82) 0%, rgba(219,234,254,0.75) 100%)',
                zIndex: 1,
                borderRadius: 'inherit',
              }}
            />
            {/* Content */}
            <div style={{ position: 'relative', zIndex: 2, padding: '1.5rem' }}>
              <div className="section-label mb-2">Global Mean Sea Level Rise</div>
              <p className="text-text-muted text-xs mb-4 leading-relaxed">
                Global mean sea level consistently climbs since satellite records began in 1993. The blue line shows the 60-day smoothed trend.
              </p>
              <SeaLevelChart data={seaLevel} animated={animated} />
            </div>
          </motion.div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              label: 'Ice lost per decade',
              sub: 'Long-term trend in September Arctic extent',
              color: '#D95D39',
            },
            {
              icon: '🌊',
              value: `+${slRise} cm`,
              label: 'Sea level rise',
              sub: 'Global mean rise since satellite records began in 1993',
              color: '#2563EB',
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', bounce: 0.4, delay: i * 0.1 }}
              viewport={{ once: true, margin: '-20px' }}
              whileHover={{ y: -5, boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)' }}
              className="stat-card transition-all duration-300 bg-white"
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
