import React, { Suspense, lazy } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

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

  const { scrollY } = useScroll();
  const earthY = useTransform(scrollY, [0, 1000], [0, 400]);
  const earthOpacity = useTransform(scrollY, [0, 800], [1, 0]);
  const textY = useTransform(scrollY, [0, 800], [0, -150]);
  const textOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a1628 0%, #102A43 40%, #1a3a52 100%)' }}
    >
      {/* 3D Earth — right side */}
      <motion.div 
        className="absolute right-0 top-0 w-full md:w-[55%] h-full pointer-events-none md:pointer-events-auto"
        style={{ y: earthY, opacity: earthOpacity }}
      >
        <Suspense fallback={<div className="w-full h-full" />}>
          <EarthHeroScene />
        </Suspense>
      </motion.div>

      {/* Floating data signals */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-[1px]"
            style={{ 
              width: `${Math.random() * 150 + 50}px`,
              top: `${Math.random() * 60 + 20}%`,
              left: '-20%',
              background: `linear-gradient(to right, transparent, ${i % 2 === 0 ? '#F4B860' : '#a7dde8'}, transparent)`
            }}
            animate={{ left: ['-20%', '120%'], opacity: [0, 0.4, 0] }}
            transition={{ duration: Math.random() * 15 + 15, repeat: Infinity, ease: 'linear', delay: Math.random() * 10 }}
          />
        ))}
      </div>

      {/* Left content */}
      <motion.div 
        className="relative z-10 flex flex-col justify-center min-h-screen px-8 md:px-16 lg:px-24 max-w-2xl"
        style={{ y: textY, opacity: textOpacity }}
      >
        {/* Overline */}
        <motion.div
          initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xs font-semibold tracking-[0.25em] uppercase mb-6"
          style={{ color: '#F4B860' }}
        >
          A Climate Data Story
        </motion.div>

        {/* Title with Mini Warming-Stripes Glow */}
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.12 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[120%] z-[-1] rounded-full blur-[40px] pointer-events-none"
            style={{ background: 'linear-gradient(to right, #3A86A8, #F7F4EC, #F4B860, #D95D39, #A63A2D)' }}
          />
          <motion.h1
            initial={{ opacity: 0, y: 60, filter: 'blur(15px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ type: 'spring', bounce: 0.4, duration: 1.2, delay: 0.4 }}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
            style={{ color: '#F7F4EC' }}
          >
            Tracing<br />
            <span style={{ color: '#D95D39' }}>Global</span>{' '}
            <span style={{ color: '#F4B860' }}>Warming</span>
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 30, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.6 }}
          className="text-lg md:text-xl leading-relaxed mb-10 max-w-lg"
          style={{ color: '#A8AEB8' }}
        >
          From human causes to planetary consequences — a scrollytelling investigation 
          into the science of climate change, told through data.
        </motion.p>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, x: -30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ type: 'spring', bounce: 0.3, duration: 1, delay: 0.8 }}
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => scrollTo('signal')}
          className="flex items-center gap-3 text-sm font-medium group w-fit bg-white/5 hover:bg-white/10 px-5 py-3 rounded-full transition-colors"
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
      </motion.div>

      {/* Thin timeline ribbon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 1.3 }}
        className="relative z-10 px-8 md:px-16 lg:px-24 pb-12 mt-auto w-full md:w-[60%]"
      >
        <div className="relative h-[2px] w-full rounded-full" style={{ background: 'linear-gradient(to right, #3A86A8 0%, #94d2bd 40%, #F4B860 70%, #D95D39 100%)' }}>
          {/* Moving timeline indicator */}
          <motion.div 
            initial={{ left: '0%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]"
          />
        </div>
        <div className="flex justify-between w-full mt-3 text-[10px] md:text-xs uppercase tracking-[0.2em] font-semibold" style={{ color: '#64748B' }}>
          <span>1880</span>
          <span>1950</span>
          <span>2000</span>
          <span style={{ color: '#D95D39' }}>Today</span>
        </div>
      </motion.div>

      {/* Minimal chapter constellation (Right Edge) */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute right-4 md:right-10 top-1/2 -translate-y-1/2 flex flex-col gap-6 md:gap-8 z-20 pointer-events-auto"
      >
        {CHAPTERS.map((ch, i) => (
          <div 
            key={ch.id}
            className="relative flex items-center justify-end group cursor-pointer p-2"
            onClick={() => scrollTo(ch.id)}
          >
            <span className="absolute right-6 mr-2 opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300 whitespace-nowrap text-[10px] md:text-[11px] font-semibold tracking-wider uppercase" style={{ color: '#F7F4EC' }}>
              <span className="mr-2 opacity-70" style={{ color: ch.color }}>{ch.num}</span>
              {ch.label}
            </span>
            <div 
              className="w-1.5 h-1.5 rounded-full transition-all duration-300 group-hover:scale-[2.5]"
              style={{ backgroundColor: ch.color, boxShadow: `0 0 8px ${ch.color}80` }}
            />
          </div>
        ))}
      </motion.div>
    </section>
  );
}
