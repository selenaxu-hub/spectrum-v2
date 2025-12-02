import React from 'react';
import { Effect } from '../types';

export const EffectCard: React.FC<{ effect: Effect }> = ({ effect }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold uppercase">
          {effect.domain}
        </span>
      </div>
      
      <div className="relative pl-4 border-l-2 border-slate-200 space-y-4">
        {/* 1st Order */}
        <div className="relative">
          <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-slate-400 rounded-full border-2 border-white"></div>
          <p className="text-xs text-slate-500 font-semibold mb-1">Immediate Impact</p>
          <p className="text-sm text-slate-800 leading-snug">{effect.immediateEffect}</p>
        </div>

        {/* 2nd Order */}
        <div className="relative">
          <div className="absolute -left-[21px] top-1.5 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white"></div>
          <p className="text-xs text-indigo-500 font-semibold mb-1">Long-term Ripple</p>
          <p className="text-sm text-slate-800 leading-snug">{effect.longTermEffect}</p>
        </div>
      </div>
    </div>
  );
};