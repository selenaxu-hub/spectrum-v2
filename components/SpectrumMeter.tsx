import React from 'react';
import { BiasCategory } from '../types';

interface SpectrumMeterProps {
  score: number; // -10 to 10
  category: string;
}

export const SpectrumMeter: React.FC<SpectrumMeterProps> = ({ score, category }) => {
  // Normalize score to percentage (0 to 100)
  // -10 -> 0%, 0 -> 50%, 10 -> 100%
  const percentage = ((score + 10) / 20) * 100;

  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Bias Detection</h3>
      
      <div className="relative h-4 w-full rounded-full bg-gradient-to-r from-blue-500 via-gray-300 to-red-500 mb-2">
        {/* Indicator */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-slate-800 rounded-full shadow-lg transition-all duration-1000 ease-out"
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-400 font-medium">
        <span>Left</span>
        <span>Center</span>
        <span>Right</span>
      </div>
      
      <div className="mt-2 text-center">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
          score < -3 ? 'bg-blue-100 text-blue-700' :
          score > 3 ? 'bg-red-100 text-red-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {category}
        </span>
      </div>
    </div>
  );
};