import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Tooltip component
 * @param {boolean} visible
 * @param {number} x - page x
 * @param {number} y - page y
 * @param {React.ReactNode} children
 */
export default function Tooltip({ visible, x, y, children }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="map-tooltip"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          style={{
            left: x + 14,
            top: y - 10,
            transform: x > window.innerWidth - 200 ? 'translateX(-110%)' : 'none',
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
