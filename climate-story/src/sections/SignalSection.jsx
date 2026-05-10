import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import WarmingStripes from '../charts/WarmingStripes.jsx';
import TemperatureEnvelopeChart from '../charts/TemperatureEnvelopeChart.jsx';

export default function SignalSection({ data, envelope }) {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-20% 0px -20% 0px" });

  return (
    <section id="signal" className="signal-section">

      <div className="signal-existing-content relative z-10 max-w-7xl mx-auto px-6 py-24" ref={sectionRef}>
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.8 }}
            className="section-label"
          >
            Chapter 01
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4"
          >
            The <span className="text-gradient-warm">Signal</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-text-muted text-lg leading-relaxed"
          >
            Is warming just natural variation? The data gives us a clear answer.
          </motion.p>
        </div>

        {/* Premium Layout: Chart Left, Card Right */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 lg:gap-20">

          {/* Chart Panel (Left) */}
          <motion.div
            className="w-full md:w-[60%] shrink-0"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <motion.div
              className="mb-8"
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              animate={isInView ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
            >
              <WarmingStripes data={data} scrollProgress={1} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <div className="section-label mb-4 tracking-widest text-xs opacity-70">Temperature Anomaly vs Natural Variability</div>
              <TemperatureEnvelopeChart
                observed={data}
                envelope={envelope}
                animated={isInView}
              />
            </motion.div>
          </motion.div>

          {/* Research Note Card (Right) */}
          <motion.div
            className="w-full md:w-[40%] flex flex-col justify-center"
            initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
            animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 40, filter: 'blur(10px)' }}
            transition={{ duration: 1, delay: 1, ease: "easeOut" }}
          >
            <div className="bg-white/60 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] rounded-2xl p-8 relative overflow-hidden">
              {/* Subtle top highlight */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D95D39] to-transparent opacity-60" />

              <div className="text-[10px] font-bold tracking-[0.2em] mb-4" style={{ color: '#D95D39' }}>
                EVIDENCE
              </div>

              <h3 className="text-2xl font-display font-bold text-text-primary leading-tight mb-4">
                Modern warming breaks the envelope
              </h3>

              <p className="text-text-muted text-sm leading-relaxed mb-6">
                The grey band shows the full range of natural climate variability—temperature swings from volcanic eruptions, solar cycles, and ocean currents—over centuries.
                <br /><br />
                Since the 1980s, the observed temperature anomaly has broken completely out of this envelope and kept climbing. This is not natural noise.
              </p>

              <div className="p-4 bg-[#FEF2EE]/50 border border-[#FEF2EE] rounded-xl shadow-sm">
                <p className="text-sm font-medium text-text-primary leading-relaxed">
                  The latest anomaly is more than <strong style={{ color: '#D95D39' }}>3× the natural variability range</strong>. Warming since 1980 alone represents a ≥95% probability of human cause.
                </p>
              </div>
            </div>
          </motion.div>

        </div>{/* end flex row */}
      </div>{/* end signal-existing-content */}
    </section>
  );
}
