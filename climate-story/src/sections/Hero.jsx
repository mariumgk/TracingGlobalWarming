import React, { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';

const EarthHeroScene = lazy(() => import('../three/EarthHeroScene.jsx'));

const CHAPTERS = [
  { id: 'signal',      num: '01', label: 'The Signal',       sub: 'Is warming just natural variation?',       color: '#D95D39' },
  { id: 'cause',       num: '02', label: 'The Cause',         sub: 'Human forcing explains the rise.',          color: '#F4B860' },
  { id: 'consequences',num: '03', label: 'Consequences',      sub: 'Oceans rise, Arctic ice shrinks.',          color: '#3A86A8' },
  { id: 'source',      num: '04', label: 'The Source',        sub: 'Emissions and CO₂ keep increasing.',        color: '#A63A2D' },
  { id: 'map',         num: '05', label: 'Where We Stand',    sub: 'Emissions are uneven across countries.',    color: '#8B5CF6' },
  { id: 'bigpicture',  num: '06', label: 'The Big Picture',   sub: 'All evidence connects into one chain.',     color: '#102A43' },
];

export default function Hero() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #102A43 40%, #1a3a52 100%)' }}
    >
      {/* 3D Earth — right side */}
      <div className="absolute right-0 top-0 w-full md:w-[55%] h-full pointer-events-none md:pointer-events-auto">
        <Suspense fallback={<div className="w-full h-full" />}>
          <EarthHeroScene />
        </Suspense>
      </div>

      {/* Left content */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen px-8 md:px-16 lg:px-24 max-w-2xl">
        {/* Overline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-xs font-semibold tracking-[0.25em] uppercase mb-6"
          style={{ color: '#F4B860' }}
        >
          A Climate Data Story
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
          style={{ color: '#F7F4EC' }}
        >
          Tracing<br />
          <span style={{ color: '#D95D39' }}>Global</span>{' '}
          <span style={{ color: '#F4B860' }}>Warming</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-base md:text-lg leading-relaxed mb-10 max-w-md"
          style={{ color: '#A8AEB8' }}
        >
          From human causes to planetary consequences — a scrollytelling investigation 
          into the science of climate change, told through data.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex gap-6 mb-10"
        >
          {[
            { val: '+1.2°C', label: 'warming since 1880' },
            { val: '425 ppm', label: 'atmospheric CO₂' },
            { val: '13%', label: 'Arctic ice lost/decade' },
          ].map(s => (
            <div key={s.val}>
              <div className="text-xl font-bold font-display" style={{ color: '#D95D39' }}>{s.val}</div>
              <div className="text-xs mt-0.5" style={{ color: '#64748B' }}>{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Scroll CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          onClick={() => scrollTo('signal')}
          className="flex items-center gap-3 text-sm font-medium group w-fit"
          style={{ color: '#F7F4EC' }}
        >
          <span>Begin the story</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-lg"
            style={{ color: '#D95D39' }}
          >↓</motion.div>
        </motion.button>
      </div>

      {/* Chapter cards at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.3 }}
        className="relative z-10 px-8 md:px-16 lg:px-24 pb-10 mt-auto"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {CHAPTERS.map((ch, i) => (
            <motion.button
              key={ch.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + i * 0.07 }}
              whileHover={{ scale: 1.04, y: -2 }}
              onClick={() => scrollTo(ch.id)}
              className="text-left p-4 rounded-xl border transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            >
              <div className="text-xs font-bold mb-1" style={{ color: ch.color }}>{ch.num}</div>
              <div className="text-xs font-semibold mb-1" style={{ color: '#F7F4EC' }}>{ch.label}</div>
              <div className="text-xs leading-tight" style={{ color: '#64748B' }}>{ch.sub}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
