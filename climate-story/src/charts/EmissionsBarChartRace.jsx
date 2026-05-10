import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmissionsBarChartRace({ 
  data, 
  maxTotal, 
  currentYear,
  hoveredCountry,
  onHover,
  onClick,
  pinnedCountry
}) {
  return (
    <div className="relative w-full h-full flex flex-col" style={{ minHeight: '500px' }}>
      {/* Large Year Watermark */}
      <div className="absolute right-4 bottom-4 text-8xl md:text-[140px] font-display font-bold text-text-muted/10 pointer-events-none select-none z-0">
        {currentYear}
      </div>

      <div className="flex-1 relative z-10 py-4 pr-16 pl-2">
        <AnimatePresence>
          {data.map((d, index) => {
            const widthPct = maxTotal > 0 ? (d.total / maxTotal) * 100 : 0;
            const isHovered = hoveredCountry?.code === d.code;
            const isPinned = pinnedCountry?.code === d.code;
            const isTop = index === 0;

            // Colors based on rank and state
            let bgColor = isTop ? '#D95D39' : '#F4B860'; // Rust/Amber
            if (isPinned) bgColor = '#D95D39';
            if (hoveredCountry && !isHovered && !isPinned) bgColor = '#A8AEB8'; // Mute others

            return (
              <motion.div
                key={d.code}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                  mass: 1
                }}
                className="absolute flex items-center h-10 w-full"
                style={{ top: `${index * 48}px` }}
                onMouseEnter={() => onHover(d)}
                onMouseLeave={() => onHover(null)}
                onClick={() => onClick(d)}
              >
                {/* Country Name */}
                <div className="w-24 md:w-32 flex-shrink-0 text-right pr-3 text-sm md:text-base font-medium text-text-primary truncate">
                  {d.entity}
                </div>

                {/* Bar */}
                <div className="flex-1 h-full relative group cursor-pointer flex items-center">
                  <motion.div
                    layout
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${widthPct}%`,
                      backgroundColor: bgColor,
                      boxShadow: isHovered || isPinned ? '0 0 12px rgba(217,93,57,0.4)' : 'none'
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 30,
                      mass: 1
                    }}
                    className="h-8 rounded-r-md transition-colors duration-300"
                  />
                  
                  {/* Value Label */}
                  <motion.div 
                    layout
                    className="absolute pl-2 text-sm font-medium text-text-muted flex items-center"
                    style={{ left: `${widthPct}%` }}
                  >
                    {(d.total / 1e9).toFixed(2)}
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Axis/Gridlines */}
      <div className="absolute inset-0 pointer-events-none z-0 ml-[6rem] md:ml-[8rem] mr-16">
        {[0, 25, 50, 75, 100].map(tick => (
          <div 
            key={tick} 
            className="absolute top-0 bottom-0 border-l border-slate-200/50"
            style={{ left: `${tick}%` }}
          />
        ))}
      </div>
    </div>
  );
}
