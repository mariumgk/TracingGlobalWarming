import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import ChapterNav from './components/ChapterNav.jsx';
import ScrollProgress from './components/ScrollProgress.jsx';

import Hero from './sections/Hero.jsx';
import SignalSection from './sections/SignalSection.jsx';
import CauseSection from './sections/CauseSection.jsx';
import ConsequencesSection from './sections/ConsequencesSection.jsx';
import SourceSection from './sections/SourceSection.jsx';
import MapSection from './sections/MapSection.jsx';
import BigPictureSection from './sections/BigPictureSection.jsx';
import Footer from './sections/Footer.jsx';

import {
  loadObservedTemp,
  loadForcings,
  loadPiControl,
  loadSeaIce,
  loadCO2,
  loadEmissions,
  loadSeaLevel,
} from './utils/dataLoaders.js';

export default function App() {
  const [data, setData] = useState({
    observed: [],
    forcings: [],
    envelope: null,
    seaIce: [],
    seaLevel: [],
    co2: [],
    emissions: null,
    loaded: false,
    error: null,
  });

  useEffect(() => {
    Promise.all([
      loadObservedTemp(),
      loadForcings(),
      loadPiControl(),
      loadSeaIce(),
      loadSeaLevel(),
      loadCO2(),
      loadEmissions(),
    ])
      .then(([observed, forcings, envelope, seaIce, seaLevel, co2, emissions]) => {
        setData({
          observed,
          forcings,
          envelope,
          seaIce,
          seaLevel,
          co2,
          emissions,
          loaded: true,
          error: null,
        });
      })
      .catch(err => {
        console.error('Data loading error:', err);
        setData(d => ({ ...d, loaded: true, error: err.message }));
      });
  }, []);

  // Smooth scroll via Lenis
  useEffect(() => {
    let lenis;
    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.08, smooth: true });
      const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }).catch(() => {});
    return () => lenis?.destroy?.();
  }, []);

  return (
    <div className="min-h-screen">
      <ScrollProgress />
      <ChapterNav />

      {/* Loading overlay */}
      <AnimatePresence>
        {!data.loaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[999] flex flex-col items-center justify-center"
            style={{ background: '#102A43' }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
              className="w-10 h-10 border-2 border-warming/30 border-t-warming rounded-full mb-6"
            />
            <div className="text-sm font-medium" style={{ color: '#A8AEB8' }}>
              Loading climate data…
            </div>
            <div className="text-xs mt-2" style={{ color: '#64748B' }}>
              NASA · NOAA · NSIDC · Global Carbon Project
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {data.error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-red-50 border border-red-200 text-red-800 text-sm px-6 py-3 rounded-xl shadow">
          ⚠️ Some data failed to load: {data.error}
        </div>
      )}

      {/* Sections */}
      <Hero />

      {data.loaded && (
        <>
          <SignalSection data={data.observed} envelope={data.envelope} />
          <CauseSection data={data.forcings} observedData={data.observed} />
          <ConsequencesSection seaIce={data.seaIce} seaLevel={data.seaLevel} />
          <SourceSection emissions={data.emissions} co2={data.co2} />
          <MapSection emissionsData={data.emissions} />
        </>
      )}

      <BigPictureSection />
      <Footer />
    </div>
  );
}
