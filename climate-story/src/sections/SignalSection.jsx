import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Scrollama, Step } from 'react-scrollama';
import WarmingStripes from '../charts/WarmingStripes.jsx';
import TemperatureEnvelopeChart from '../charts/TemperatureEnvelopeChart.jsx';

const STEPS = [
  {
    id: 0,
    heading: 'The stripes tell the story',
    body: 'Each stripe represents one year from 1880 to 2014. Cold blues dominated the early record. Now reds overwhelm the frame.',
  },
  {
    id: 1,
    heading: 'Modern warming exceeds natural variation',
    body: 'The grey band shows the full range of natural climate variability — temperature swings from volcanic eruptions, solar cycles, and ocean currents — over centuries.',
  },
  {
    id: 2,
    heading: 'The signal is unmistakable',
    body: 'Since the 1980s, the observed temperature anomaly has broken out of the natural variability envelope and kept climbing. This is not noise.',
  },
];

export default function SignalSection({ data, envelope }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [stripesProgress, setStripesProgress] = useState(0);
  const [chartAnimated, setChartAnimated] = useState(false);

  const onStepEnter = ({ data: stepData }) => {
    setCurrentStep(stepData);
    if (stepData >= 1 && !chartAnimated) setChartAnimated(true);
  };

  const onStepProgress = ({ progress }) => {
    if (currentStep === 0) setStripesProgress(progress);
  };

  return (
    <section id="signal" className="py-24" style={{ background: '#F7F4EC' }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="section-label"
          >
            Chapter 01
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-display font-bold text-text-primary mb-4"
          >
            The <span className="text-gradient-warm">Signal</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-muted text-lg leading-relaxed"
          >
            Is warming just natural variation? The data gives us a clear answer.
          </motion.p>
        </div>

        {/* Scrollama sticky layout */}
        <div className="relative flex gap-12">
          {/* Sticky chart panel */}
          <div className="hidden md:block sticky top-20 h-fit w-[55%] shrink-0">
            <div className="chart-container">
          <div className="mb-6">
              <WarmingStripes data={data} scrollProgress={currentStep === 0 ? stripesProgress : 1} />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: currentStep >= 1 ? 1 : 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="section-label mb-2">Temperature Anomaly vs Natural Variability</div>
              <TemperatureEnvelopeChart
                observed={data}
                envelope={envelope}
                animated={chartAnimated}
              />
            </motion.div>

              {/* Key stat */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: currentStep >= 2 ? 1 : 0 }}
                transition={{ duration: 0.5 }}
                className="mt-6 p-4 rounded-xl border-l-4"
                style={{ background: '#FEF2EE', borderColor: '#D95D39' }}
              >
                <div className="text-sm font-semibold text-warming mb-1">Key finding</div>
                <div className="text-sm text-text-primary">
                  The 2014 anomaly of <strong>+0.75°C</strong> is more than <strong>3× the natural variability envelope</strong>. 
                  Warming since 1980 alone represents a ≥95% probability of anthropogenic cause.
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scrollama steps */}
          <div className="w-full md:w-[45%]">
            <Scrollama onStepEnter={onStepEnter} onStepProgress={onStepProgress} offset={0.5} threshold={1}>
              {STEPS.map(step => (
                <Step data={step.id} key={step.id}>
                  <div className="step">
                    <motion.div
                      className="step-content chart-container"
                      animate={{ opacity: currentStep === step.id ? 1 : 0.4 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white mb-4"
                        style={{ background: '#D95D39' }}
                      >
                        {step.id + 1}
                      </div>
                      <h3 className="text-lg font-display font-semibold text-text-primary mb-3">
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

        {/* Mobile chart (always visible) */}
        <div className="md:hidden mt-10 chart-container">
          <WarmingStripes data={data} scrollProgress={1} />
          <div className="mt-6">
            <TemperatureEnvelopeChart observed={data} envelope={envelope} animated={true} />
          </div>
        </div>
      </div>
    </section>
  );
}
