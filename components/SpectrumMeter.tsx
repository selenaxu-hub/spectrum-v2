
import React from 'react';

interface SpectrumMeterProps {
  score: number; // -10 to 10
  category: string;
}

export const SpectrumMeter: React.FC<SpectrumMeterProps> = ({ score, category }) => {
  // Normalize score to percentage (0 to 100)
  // -10 -> 0%, 0 -> 50%, 10 -> 100%
  const percentage = ((score + 10) / 20) * 100;

  // Determine color based on position
  let colorClass = 'bg-slate-500 shadow-slate-300 ring-slate-200'; // Center/Neutral default
  if (score < -2) colorClass = 'bg-blue-600 shadow-blue-200 ring-blue-200';
  if (score > 2) colorClass = 'bg-red-600 shadow-red-200 ring-red-200';

  return (
    <div className="w-full mb-8 mt-2 px-1">
      <div className="flex justify-between items-end mb-2">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bias Detection</h3>
        <span className={`text-[10px] font-bold uppercase tracking-wide ${
          score < -2 ? 'text-blue-600' :
          score > 2 ? 'text-red-600' :
          'text-slate-600'
        }`}>
          {category}
        </span>
      </div>
      
      {/* Gradient Track: Blue - White (Slate-200) - Red */}
      <div className="relative h-1.5 w-full rounded-full bg-gradient-to-r from-blue-500 via-slate-200 to-red-500 overflow-visible opacity-90">
         {/* Center Mark */}
         <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-400/30 transform -translate-x-1/2"></div>
         
         {/* Indicator Dot */}
         <div 
          className={`absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ring-2 transition-all duration-1000 ease-out z-10 ${colorClass}`}
          style={{ left: `calc(${percentage}% - 7px)` }}
        />
      </div>
      
      {/* Labels */}
      <div className="flex justify-between mt-1.5 text-[9px] text-slate-400 font-medium uppercase tracking-wider">
        <span>Left</span>
        <span>Right</span>
      </div>
    </div>
  );
};
