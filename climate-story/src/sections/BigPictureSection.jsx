import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NODES = [
  {
    id: 'emissions',
    label: 'Human\nEmissions',
    icon: '🏭',
    color: '#D95D39',
    x: 0,
    stat: '37 Gt CO₂/yr',
    detail: 'Fossil fuel combustion and land-use change release billions of tonnes of CO₂ every year.',
  },
  {
    id: 'ghg',
    label: 'Greenhouse\nGases',
    icon: '☁️',
    color: '#8B5CF6',
    x: 1,
    stat: '425 ppm',
    detail: 'CO₂ accumulates in the atmosphere, raising its concentration from ~280 ppm pre-industrial.',
  },
  {
    id: 'forcing',
    label: 'Radiative\nForcing',
    icon: '☀️',
    color: '#F4B860',
    x: 2,
    stat: '+2.7 W/m²',
    detail: 'More greenhouse gases trap more outgoing infrared radiation, creating a net energy imbalance.',
  },
  {
    id: 'warming',
    label: 'Global\nWarming',
    icon: '🌡️',
    color: '#A63A2D',
    x: 3,
    stat: '+1.2°C',
    detail: 'The radiative imbalance causes the planet\'s surface temperature to rise.',
  },
  {
    id: 'impacts',
    label: 'Ice Loss &\nSea Rise',
    icon: '🧊',
    color: '#3A86A8',
    x: 4,
    stat: '–13%/decade',
    detail: 'Warming melts glaciers and Arctic sea ice, contributing to sea level rise and ecosystem disruption.',
  },
];

function ChainArrow({ from, to, active }) {
  return (
    <motion.div
      className="flex items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0.15 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="flex items-center gap-1"
        animate={active ? { x: [0, 4, 0] } : {}}
        transition={{ repeat: active ? Infinity : 0, duration: 1.5 }}
      >
        <div className="h-0.5 w-10 md:w-16" style={{ background: active ? '#D95D39' : '#E2E8F0' }} />
        <div className="text-lg" style={{ color: active ? '#D95D39' : '#E2E8F0' }}>→</div>
      </motion.div>
    </motion.div>
  );
}

export default function BigPictureSection() {
  const [activeNode, setActiveNode] = useState(-1);
  const [complete, setComplete] = useState(false);
  const sectionRef = useRef();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let i = -1;
          const advance = () => {
            i++;
            setActiveNode(i);
            if (i < NODES.length - 1) setTimeout(advance, 700);
            else setTimeout(() => setComplete(true), 500);
          };
          setTimeout(advance, 400);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="bigpicture" ref={sectionRef} style={{ background: 'linear-gradient(160deg, #0a1628 0%, #102A43 60%, #1a3a52 100%)' }} className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mb-16">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: '#F4B860' }}
          >
            Chapter 06
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold mb-4"
            style={{ color: '#F7F4EC' }}
          >
            The Big <span style={{ color: '#F4B860' }}>Picture</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            style={{ color: '#A8AEB8' }}
            className="text-lg leading-relaxed"
          >
            Every piece of evidence we've explored connects into a single causal chain.
            Watch it light up.
          </motion.p>
        </div>

        {/* Causal chain */}
        <div className="flex flex-wrap items-center gap-2 md:gap-0 justify-center md:justify-start mb-16 overflow-x-auto pb-4">
          {NODES.map((node, i) => (
            <React.Fragment key={node.id}>
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="chain-node flex flex-col items-center p-4 rounded-2xl border transition-all duration-500 min-w-[120px] text-center"
                style={{
                  background: activeNode >= i ? `${node.color}22` : 'rgba(255,255,255,0.04)',
                  borderColor: activeNode >= i ? node.color : 'rgba(255,255,255,0.1)',
                  boxShadow: activeNode >= i ? `0 0 24px ${node.color}44` : 'none',
                }}
                onClick={() => setActiveNode(i)}
              >
                <motion.div
                  className="text-3xl mb-2"
                  animate={activeNode >= i ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {node.icon}
                </motion.div>
                <div
                  className="text-xs font-bold mb-1 whitespace-pre-line leading-tight"
                  style={{ color: activeNode >= i ? node.color : '#64748B' }}
                >
                  {node.label}
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeNode >= i ? 1 : 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-xs font-semibold"
                  style={{ color: '#F7F4EC' }}
                >
                  {node.stat}
                </motion.div>
              </motion.button>

              {i < NODES.length - 1 && (
                <ChainArrow active={activeNode > i} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Detail panel for selected node */}
        <AnimatePresence mode="wait">
          {activeNode >= 0 && (
            <motion.div
              key={activeNode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="mb-12 p-6 rounded-2xl max-w-2xl"
              style={{
                background: `${NODES[activeNode]?.color}15`,
                border: `1px solid ${NODES[activeNode]?.color}40`,
              }}
            >
              <div className="text-2xl mb-2">{NODES[activeNode]?.icon}</div>
              <div className="text-sm font-bold mb-2" style={{ color: NODES[activeNode]?.color }}>
                {NODES[activeNode]?.label.replace('\n', ' ')}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: '#A8AEB8' }}>
                {NODES[activeNode]?.detail}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Final message */}
        <AnimatePresence>
          {complete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="border rounded-2xl p-8 text-center max-w-3xl mx-auto"
              style={{
                background: 'rgba(217, 93, 57, 0.08)',
                borderColor: 'rgba(217, 93, 57, 0.3)',
              }}
            >
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-2xl font-display font-bold mb-4" style={{ color: '#F7F4EC' }}>
                The chain is complete
              </h3>
              <p className="text-base leading-relaxed mb-6" style={{ color: '#A8AEB8' }}>
                Every link in this chain is supported by independent lines of evidence — 
                satellite data, ice cores, ocean measurements, and atmospheric monitoring.
                The science is clear: human activity is warming the planet.
              </p>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { v: '97%', l: 'Scientific consensus' },
                  { v: '1.5°C', l: 'Paris Agreement target' },
                  { v: '2050', l: 'Net-zero deadline' },
                ].map(s => (
                  <div key={s.l}>
                    <div className="text-xl font-bold font-display text-warming">{s.v}</div>
                    <div className="text-xs mt-1" style={{ color: '#64748B' }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
