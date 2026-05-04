import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CHAPTERS = [
  { id: 'hero', label: 'Overview', color: '#102A43' },
  { id: 'signal', label: 'The Signal', color: '#D95D39' },
  { id: 'cause', label: 'The Cause', color: '#F4B860' },
  { id: 'consequences', label: 'Consequences', color: '#3A86A8' },
  { id: 'source', label: 'The Source', color: '#A63A2D' },
  { id: 'map', label: 'Where We Stand', color: '#8B5CF6' },
  { id: 'bigpicture', label: 'The Big Picture', color: '#D95D39' },
];

export default function ChapterNav() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState('hero');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60);

      // Determine active chapter
      for (const ch of [...CHAPTERS].reverse()) {
        const el = document.getElementById(ch.id);
        if (el && el.getBoundingClientRect().top <= 100) {
          setActive(ch.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <nav
      className={`chapter-nav transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 shadow-sm border-b border-slate-100'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => scrollTo('hero')}
          className="font-display font-semibold text-text-primary text-sm tracking-wide hover:text-warming transition-colors"
        >
          Tracing Global Warming
        </button>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {CHAPTERS.map(ch => (
            <button
              key={ch.id}
              onClick={() => scrollTo(ch.id)}
              className={`nav-pill text-xs ${
                active === ch.id
                  ? 'bg-text-primary text-white'
                  : 'text-text-muted hover:text-text-primary hover:bg-slate-100'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-text-primary"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu"
        >
          <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <div className={`w-5 h-0.5 bg-current mb-1 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <div className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white/95 border-b border-slate-100 px-6 py-4 flex flex-col gap-2"
          >
            {CHAPTERS.map(ch => (
              <button
                key={ch.id}
                onClick={() => scrollTo(ch.id)}
                className="text-left text-sm py-2 text-text-muted hover:text-text-primary border-b border-slate-50 last:border-0"
              >
                {ch.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
