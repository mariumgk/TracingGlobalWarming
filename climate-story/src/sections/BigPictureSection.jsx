import React from 'react';
import { motion } from 'framer-motion';

const NODES = [
  {
    id: 'emissions',
    label: 'Human\nEmissions',
    icon: '01',
    color: '#D95D39',
    x: 0,
    stat: '37 Gt CO₂/yr',
    detail: 'Fossil fuel combustion and land-use change release billions of tonnes of CO₂ every year.',
  },
  {
    id: 'ghg',
    label: 'Greenhouse\nGases',
    icon: '02',
    color: '#8B5CF6',
    x: 1,
    stat: '425 ppm',
    detail: 'CO₂ accumulates in the atmosphere, raising its concentration from ~280 ppm pre-industrial.',
  },
  {
    id: 'forcing',
    label: 'Radiative\nForcing',
    icon: '03',
    color: '#F4B860',
    x: 2,
    stat: '+2.7 W/m²',
    detail: 'More greenhouse gases trap more outgoing infrared radiation, creating a net energy imbalance.',
  },
  {
    id: 'warming',
    label: 'Global\nWarming',
    icon: '04',
    color: '#A63A2D',
    x: 3,
    stat: '+1.2°C',
    detail: 'The radiative imbalance causes the planet\'s surface temperature to rise.',
  },
  {
    id: 'impacts',
    label: 'Ice Loss &\nSea Rise',
    icon: '05',
    color: '#3A86A8',
    x: 4,
    stat: '–13%/decade',
    detail: 'Warming melts glaciers and Arctic sea ice, contributing to sea level rise and ecosystem disruption.',
  },
];

export default function BigPictureSection() {
  return (
    <section id="bigpicture" style={{ background: '#F7F4EC' }} className="py-24">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-24">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-bold tracking-[0.2em] uppercase mb-3 text-warming"
          >
            Chapter 06
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold mb-4 text-text-primary"
          >
            The Big Picture
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg leading-relaxed text-text-muted"
          >
            Every piece of evidence we've explored connects into a single causal chain.
            Scroll to watch the evidence align.
          </motion.p>
        </div>

        {/* Vertical Scrollytelling Timeline */}
        <div className="relative border-l-2 border-slate-200 ml-4 md:ml-8 pl-8 md:pl-12 py-4 space-y-16">
          {NODES.map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, y: 80, scale: 0.85, filter: 'blur(10px)' }}
              whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", bounce: 0.5, duration: 0.8, delay: i * 0.15 }}
              whileHover={{ x: 10, scale: 1.02, boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)" }}
              className="relative transition-all duration-300"
            >
              {/* Timeline marker */}
              <div 
                className="absolute -left-[49px] md:-left-[65px] top-4 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm bg-white border-2"
                style={{ borderColor: node.color, color: node.color }}
              >
                {node.icon}
              </div>

              {/* Card content */}
              <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-4 gap-4">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold font-display text-text-primary whitespace-pre-line">
                      {node.label.replace('\n', ' ')}
                    </h3>
                  </div>
                  <div 
                    className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-slate-50"
                    style={{ color: node.color, border: `1px solid ${node.color}30` }}
                  >
                    {node.stat}
                  </div>
                </div>
                <p className="text-base text-text-muted leading-relaxed">
                  {node.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Final message */}
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.85, filter: 'blur(15px)' }}
          whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: "spring", bounce: 0.6, duration: 1.2 }}
          className="bg-white border border-slate-200 shadow-xl rounded-2xl p-10 text-center max-w-3xl mx-auto mt-24 relative"
        >
          {/* Timeline end line to connect to the box */}
          <div className="absolute w-0.5 bg-slate-200 h-24 -top-24 left-[1.1rem] md:left-[2.1rem]"></div>

          <h3 className="text-2xl font-display font-bold mb-4 text-text-primary">
            The causal chain is established.
          </h3>
          <p className="text-base leading-relaxed mb-8 text-text-muted">
            Every link in this sequence is supported by independent lines of evidence—satellite data, ice cores, ocean measurements, and atmospheric monitoring. The science is robust and unequivocal.
          </p>
          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
            {[
              { v: '97%', l: 'Scientific consensus' },
              { v: '1.5°C', l: 'Paris target' },
              { v: '2050', l: 'Net-zero goal' },
            ].map(s => (
              <div key={s.l}>
                <div className="text-2xl font-bold font-display text-warming">{s.v}</div>
                <div className="text-xs mt-1 text-slate-500 uppercase tracking-wider">{s.l}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
