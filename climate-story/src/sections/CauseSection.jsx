import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Scrollama, Step } from 'react-scrollama';
import ForcingAttributionChart from '../charts/ForcingAttributionChart.jsx';

const STEPS = [
  {
    id: 0,
    heading: 'Start with the Sun',
    body: 'Solar output varies slightly over an 11-year cycle. It warms the planet a little — but not enough to explain the modern trend.',
    hint: 'Solar forcing visible',
    color: '#F4B860',
  },
  {
    id: 1,
    heading: 'Add volcanic eruptions',
    body: 'Large eruptions inject aerosols that temporarily cool the planet. These dips are visible in the record, but they don\'t produce sustained warming.',
    hint: '+ Volcanic forcing',
    color: '#9CA3AF',
  },
  {
    id: 2,
    heading: 'Natural forces combined',
    body: 'Together, solar and volcanic natural forcing creates modest variability — but the net effect remains near zero over the long run.',
    hint: '+ Natural total',
    color: '#A8AEB8',
  },
  {
    id: 3,
    heading: 'Now add human forcing',
    body: 'Human emissions of greenhouse gases create a radiative imbalance. The forcing grows steadily from 1950 onward, matching the observed warming signal perfectly.',
    hint: '+ Human forcing (orange)',
    color: '#D95D39',
  },
  {
    id: 4,
    heading: 'The match is unmistakable',
    body: 'When all forcings are combined — natural and human — they closely track the observed temperature record. Natural forces alone cannot explain the modern warming.',
    hint: '+ All forcings combined',
    color: '#102A43',
  },
];

export default function CauseSection({ data, observedData }) {
  const [revealStep, setRevealStep] = useState(0);

  const onStepEnter = ({ data: stepData }) => setRevealStep(stepData);

  return (
    <section id="cause" style={{ background: '#EAF2F5' }} className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="section-label"
          >
            Chapter 02
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4"
          >
            The <span className="text-gradient-warm">Cause</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-muted text-lg leading-relaxed"
          >
            Which forces drive the temperature record? The attribution reveals a clear fingerprint.
          </motion.p>
        </div>

        {/*
          Scrollytelling layout:
          - CSS Grid with two columns, default align-items: stretch
          - Left cell stretches to match the right column's full scroll height
          - Sticky chart lives inside the left cell so it sticks for the entire
            duration of the Cause section (bounded by the cell, not just the chart)
          - Right column contains all 5 step cards
        */}
        <div
          className="hidden md:grid"
          style={{
            gridTemplateColumns: '1.6fr 1fr',
            gap: '3rem',
          }}
        >
          {/* LEFT — grid item stretches to full row height; sticky wrapper inside */}
          <div>
            <div
              style={{
                position: 'sticky',
                top: '3.5rem',
                height: 'calc(100vh - 3.5rem)',
                display: 'flex',
                flexDirection: 'column',
                paddingTop: '2rem',
                paddingBottom: '2rem',
              }}
            >
              <p className="section-label mb-3">
                Climate Forcings vs Observed Warming&nbsp;
                <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#94A3B8' }}>
                  (°C anomaly, 1850–1900 baseline)
                </span>
              </p>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ForcingAttributionChart data={data} observedData={observedData} revealStep={revealStep} />
              </div>
            </div>
          </div>

          {/* RIGHT — scroll cards */}
          <div>
            <Scrollama onStepEnter={onStepEnter} offset={0.45}>
              {STEPS.map(step => (
                <Step data={step.id} key={step.id}>
                  <div className="cause-step">
                    <motion.div
                      className="step-content chart-container border-l-4"
                      style={{ borderColor: step.color }}
                      animate={{ opacity: revealStep === step.id ? 1 : 0.35 }}
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mb-3"
                        style={{ background: step.color }}
                      >
                        {step.id + 1}
                      </div>
                      <h3 className="text-lg font-display font-semibold text-text-primary mb-2">
                        {step.heading}
                      </h3>
                      <p className="text-text-muted text-sm leading-relaxed">{step.body}</p>
                    </motion.div>
                  </div>
                </Step>
              ))}
            </Scrollama>
          </div>
        </div>

        {/* Mobile: chart then cards stacked */}
        <div className="md:hidden mt-10 chart-container">
          <ForcingAttributionChart data={data} observedData={observedData} revealStep={revealStep} />
        </div>
      </div>
    </section>
  );
}
