import React, { useState, useEffect } from 'react';
import { analyzeArticle, analyzeSpecificEffect, translateAnalysis } from './services/geminiService';
import { ArticleAnalysis, ViewState, TabState, Language } from './types';
import { SpectrumMeter } from './components/SpectrumMeter';
import { EffectCard } from './components/EffectCard';

declare var chrome: any;

// --- Demo Content (Fallback for Web Preview) ---
const DEMO_ARTICLE_TITLE = "City Council Approves Controversial Zoning Overhaul";
const DEMO_ARTICLE_TEXT = `METROPOLIS — In a decisive 7-2 vote late Tuesday, the City Council approved the "Future City" zoning overhaul, a sweeping package of regulations designed to increase housing density and phase out single-family exclusive zones near transit hubs.

Proponents, including Mayor Sarah Jenkins, argue the measure is a necessary step to combat the city's skyrocketing housing costs and reduce urban sprawl. "We cannot build a 21st-century city with 1950s rules," Jenkins said following the vote. "This legislation ensures that working families have a place in our community and that we do our part to fight climate change by encouraging transit-oriented development."

However, the proposal has faced fierce opposition from neighborhood associations and preservationist groups. Critics contend that the upzoning will destroy the character of historic neighborhoods, strain local infrastructure, and primarily benefit large corporate developers rather than affordable housing advocates.

"This is a giveaway to real estate developers, plain and simple," said Mark Thompson, chair of the Heritage Neighborhood Alliance. "They are eliminating the American dream of homeownership for a quick profit, overcrowding our schools and roads in the process."

The new rules, set to take effect in January, allow for up to four units on lots previously zoned for single families if they are within a half-mile of subway stations. It also eliminates parking minimums for new developments, a move supporters say prioritizes people over cars, while detractors argue it will lead to parking chaos on residential streets.

Economic analysts suggest the move could lower rent growth by 15% over the next decade, though immediate construction impacts may temporarily increase local property values. Environmental groups have largely backed the plan, citing studies that denser living arrangements significantly reduce carbon footprints per capita.

As the meeting concluded, protests erupted outside City Hall, highlighting the deep divide the measure has created in the normally placid political landscape of Metropolis. The upcoming mayoral election is expected to turn into a referendum on the new zoning laws.`;

// --- Icons ---
const Icons = {
  Overview: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>,
  Timeline: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Perspectives: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
  Learn: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Spark: () => <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" /></svg>,
  ExternalLink: () => <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
};

// --- Helper Components ---

const FormattedMarkdown: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="space-y-2 text-xs">
      {lines.map((line, i) => {
        const listMatch = line.match(/^(\d+\.|-|\*)\s+(.*)/);
        const parseBold = (str: string) => {
          return str.split(/(\*\*.*?\*\*)/g).map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-bold text-indigo-900">{part.slice(2, -2)}</strong>;
            }
            return part;
          });
        };

        if (listMatch) {
           return (
             <div key={i} className="flex gap-2 ml-1 items-start">
               <span className="font-bold text-indigo-500 shrink-0 mt-[1px]">{listMatch[1]}</span>
               <span className="text-slate-700 leading-relaxed">{parseBold(listMatch[2])}</span>
             </div>
           );
        }

        if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
           return <div key={i} className="font-bold text-indigo-800 mt-2">{parseBold(line)}</div>;
        }

        return <div key={i} className="text-slate-700 leading-relaxed">{parseBold(line)}</div>;
      })}
    </div>
  );
};

// --- Main App Component (Side Panel) ---

export default function App() {
  const [viewState, setViewState] = useState<ViewState>('input'); 
  const [activeTab, setActiveTab] = useState<TabState>('overview');
  const [articleText, setArticleText] = useState('');
  
  // Analysis State
  const [originalAnalysis, setOriginalAnalysis] = useState<ArticleAnalysis | null>(null);
  const [displayedAnalysis, setDisplayedAnalysis] = useState<ArticleAnalysis | null>(null);
  
  const [customEffectQuery, setCustomEffectQuery] = useState('');
  const [customEffectResult, setCustomEffectResult] = useState<string | null>(null);
  const [isEffectLoading, setIsEffectLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  
  // Interactive Timeline State
  const [expandedTimelineIndex, setExpandedTimelineIndex] = useState<number | null>(null);

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState<Language>('English');
  const [fontSizeIndex, setFontSizeIndex] = useState<number>(0);

  // Initialize: Get Text from Tab (Real Extension) or Use Demo (Web Preview)
  useEffect(() => {
    const init = async () => {
      // Check if running as Chrome Extension
      if (typeof chrome !== 'undefined' && chrome.tabs && chrome.scripting) {
        try {
          // Get active tab
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab && tab.id) {
             // Execute script to get text
             const results = await chrome.scripting.executeScript({
               target: { tabId: tab.id },
               func: () => document.body.innerText,
             });
             
             if (results && results[0] && results[0].result) {
               setArticleText(results[0].result);
               handleAnalyze(results[0].result); // Auto-analyze found text
             }
          }
        } catch (err) {
          console.error("Chrome API Error (likely not in extension context):", err);
          // Fallback to demo text
          setArticleText(DEMO_ARTICLE_TEXT);
          handleAnalyze(DEMO_ARTICLE_TEXT);
        }
      } else {
        // Web Preview Environment
        setArticleText(DEMO_ARTICLE_TEXT);
        handleAnalyze(DEMO_ARTICLE_TEXT);
      }
    };
    
    init();
  }, []);

  const handleAnalyze = async (textToAnalyze: string) => {
    if (!textToAnalyze.trim()) return;
    setViewState('analyzing');
    
    try {
      const result = await analyzeArticle(textToAnalyze, 'English');
      setOriginalAnalysis(result);
      setDisplayedAnalysis(result);
      setLanguage('English');
      setViewState('results');
    } catch (error) {
      console.error(error);
      setViewState('input');
    }
  };

  // Translation Effect
  useEffect(() => {
    const performTranslation = async () => {
      if (viewState === 'results' && originalAnalysis) {
        if (language === 'English') {
          setDisplayedAnalysis(originalAnalysis);
        } else {
          setIsTranslating(true);
          const translated = await translateAnalysis(originalAnalysis, language);
          setDisplayedAnalysis(translated);
          setIsTranslating(false);
        }
      }
    };
    performTranslation();
  }, [language, originalAnalysis, viewState]);

  const handleCustomEffect = async () => {
    if (!customEffectQuery.trim() || !articleText) return;
    setIsEffectLoading(true);
    setCustomEffectResult(null);
    const result = await analyzeSpecificEffect(articleText, customEffectQuery, language);
    setCustomEffectResult(result);
    setIsEffectLoading(false);
  };

  const getFontSizeClass = () => {
    switch (fontSizeIndex) {
      case 1: return 'text-base';
      case 2: return 'text-lg';
      default: return 'text-sm';
    }
  };

  // Render Methods
  const renderSettings = () => (
    <div className="absolute top-14 right-4 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-64 animate-slide-in">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Accessibility & Settings</h3>
      
      <div className="mb-4">
        <label className="block text-xs font-bold text-slate-700 mb-2">Language</label>
        <select 
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="w-full text-xs p-2 rounded border border-slate-200 bg-slate-50 focus:outline-none focus:border-indigo-500"
        >
          {['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'].map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
           <label className="text-xs font-bold text-slate-700">Font Size</label>
           <span className="text-[10px] text-slate-400">
             {fontSizeIndex === 0 ? 'Normal' : fontSizeIndex === 1 ? 'Large' : 'Extra Large'}
           </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-serif">Aa</span>
          <input 
            type="range" 
            min="0" 
            max="2" 
            step="1"
            value={fontSizeIndex} 
            onChange={(e) => setFontSizeIndex(Number(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <span className="text-lg text-slate-600 font-serif">Aa</span>
        </div>
      </div>
      
      <button 
        onClick={() => setShowSettings(false)}
        className="w-full bg-slate-100 text-slate-600 text-xs py-2 rounded hover:bg-slate-200"
      >
        Close
      </button>
    </div>
  );

  const renderOverview = () => (
    <div className={`space-y-6 animate-fadeIn pb-4 ${getFontSizeClass()}`}>
      {displayedAnalysis && (
        <SpectrumMeter score={displayedAnalysis.biasScore} category={displayedAnalysis.biasCategory} />
      )}
      <div className="px-1">
        <h2 className="text-base font-serif font-bold text-slate-800 mb-2">Summary</h2>
        <p className="text-slate-600 leading-relaxed opacity-90">{displayedAnalysis?.summary}</p>
        {displayedAnalysis?.reasoning && (
           <p className="mt-3 text-xs text-slate-400 italic pt-2">{displayedAnalysis.reasoning}</p>
        )}
      </div>
      <div>
        <h2 className="text-base font-serif font-bold text-slate-800 mb-3 px-1">Effect Chains</h2>
        <div className="grid grid-cols-1 gap-4">
          {displayedAnalysis?.effects.map((effect, idx) => (
            <EffectCard key={idx} effect={effect} />
          ))}
        </div>
      </div>
      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100/50">
        <h3 className="text-xs font-bold text-indigo-900 mb-2 uppercase tracking-wide">Explore Specific Impacts</h3>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="e.g. Rents, Traffic..." 
            className="flex-1 text-xs p-2 rounded border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={customEffectQuery}
            onChange={(e) => setCustomEffectQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustomEffect()}
          />
          <button 
            onClick={handleCustomEffect}
            disabled={isEffectLoading}
            className="bg-indigo-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[50px]"
          >
            {isEffectLoading ? (
               <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
            ) : 'Ask'}
          </button>
        </div>
        {isEffectLoading && (
            <div className="mt-3 p-4 bg-white/50 rounded border border-indigo-50 flex items-center justify-center gap-2">
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                 <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
        )}
        {customEffectResult && !isEffectLoading && (
          <div className="mt-3 p-3 bg-white/80 rounded border border-indigo-100 animate-fadeIn">
            <FormattedMarkdown text={customEffectResult} />
          </div>
        )}
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className={`animate-fadeIn pb-4 space-y-4 ${getFontSizeClass()}`}>
       <div className="px-1">
          <h2 className="font-serif font-bold text-slate-800 mb-1">Chronological Context</h2>
          <p className="text-xs text-slate-500">Key events in chronological order</p>
       </div>
       <div className="relative pl-4 space-y-0">
         <div className="absolute left-6 top-2 bottom-4 w-px bg-slate-200"></div>
         {displayedAnalysis?.timeline.map((event, idx) => {
           const isPast = event.status === 'past';
           const isCurrent = event.status === 'current';
           const isFuture = event.status === 'upcoming';
           const isExpanded = expandedTimelineIndex === idx;
           return (
            <div key={idx} className={`relative pl-8 py-3 transition-all ${isPast || isFuture ? 'opacity-75' : 'opacity-100'}`}>
              <div className={`absolute left-[5.5px] top-4 w-3 h-3 rounded-full border-2 z-10 box-content transition-all ${
                isCurrent ? 'bg-indigo-600 border-white shadow-lg scale-125 ring-2 ring-indigo-100' : 
                isFuture ? 'bg-white border-slate-300 border-dashed' :
                'bg-slate-300 border-white'
              }`}></div>
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                 isCurrent ? 'text-indigo-600' : 'text-slate-400'
              }`}>
                {isCurrent ? 'Current Phase' : event.date}
              </div>
              <div 
                onClick={() => setExpandedTimelineIndex(isExpanded ? null : idx)}
                className={`p-3 rounded-lg border transition-all cursor-pointer group ${
                isCurrent 
                  ? 'bg-white border-indigo-200 shadow-md transform scale-[1.02] origin-left' 
                  : 'bg-slate-50 border-slate-100 hover:bg-white hover:shadow-sm hover:border-slate-300'
              } ${isExpanded ? 'ring-2 ring-indigo-100 bg-white border-indigo-200' : ''}`}>
                <div className="flex justify-between items-start">
                   <h3 className={`text-sm font-bold ${isCurrent ? 'text-slate-900' : 'text-slate-700 group-hover:text-slate-900'}`}>{event.title}</h3>
                   <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                      <Icons.ChevronDown />
                   </div>
                </div>
                {!isExpanded && (
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{event.description}</p>
                )}
                {isExpanded && (
                   <div className="mt-3 animate-fadeIn">
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">{event.detailedDescription || event.description}</p>
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(event.title + " " + event.date)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1.5 rounded hover:bg-indigo-100 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                         Search Related Articles <Icons.ExternalLink />
                      </a>
                   </div>
                )}
              </div>
            </div>
           );
         })}
       </div>
    </div>
  );

  const renderPerspectives = () => (
    <div className={`space-y-4 animate-fadeIn pb-4 ${getFontSizeClass()}`}>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4 rounded-xl">
        <h2 className="text-blue-900 font-bold text-sm mb-1">Break the Echo Chamber</h2>
        <p className="text-blue-700/80 text-xs">Explore how other sources are covering this story.</p>
      </div>
      {displayedAnalysis?.perspectives.map((pers, idx) => (
        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <span className="font-serif font-bold text-slate-800 text-sm">{pers.sourceName}</span>
            <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${
              pers.biasCategory.includes('Right') ? 'bg-red-50 text-red-600' : 
              pers.biasCategory.includes('Left') ? 'bg-blue-50 text-blue-600' :
              'bg-purple-50 text-purple-600'
            }`}>
              {pers.biasCategory}
            </span>
          </div>
          <h3 className="text-sm font-medium text-slate-900 mb-2 leading-snug">"{pers.headline}"</h3>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">{pers.summary}</p>
          <a href="#" className="flex items-center justify-center gap-1 w-full py-2 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium group-hover:bg-blue-600 group-hover:text-white transition-all">
            Read Article <Icons.ExternalLink />
          </a>
        </div>
      ))}
    </div>
  );

  const renderLearn = () => (
    <div className={`space-y-8 animate-fadeIn pb-4 ${getFontSizeClass()}`}>
      <div>
        <h2 className="text-base font-serif font-bold text-slate-800 mb-3 px-1">Glossary</h2>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {displayedAnalysis?.glossary.map((item, idx) => (
            <div key={idx} className="p-3 hover:bg-slate-50 transition-colors">
              <span className="block text-xs font-bold text-indigo-900 mb-1">{item.term}</span>
              <span className="block text-xs text-slate-600 leading-relaxed">{item.definition}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-base font-serif font-bold text-slate-800 mb-3 px-1">Recommended Reading</h2>
        <div className="space-y-3">
          {displayedAnalysis?.books.map((book, idx) => (
            <div key={idx} className="bg-white/50 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-sm flex gap-4 hover:bg-white/80 hover:shadow-md transition-all">
              <div className="w-12 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded shadow-inner flex-shrink-0 border border-slate-200/50 flex items-center justify-center">
                  <span className="text-[10px] text-slate-500 font-serif">Book</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">{book.title}</h3>
                <p className="text-xs text-slate-500 italic mb-2">by {book.author}</p>
                <p className="text-xs text-slate-600 leading-relaxed">{book.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full font-sans">
      {/* Header */}
      <header className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-white/80 backdrop-blur-md shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Icons.Spark />
          <span className="font-serif font-bold text-lg text-slate-800">Spectrum</span>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)} 
          className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          title="Settings"
        >
            <Icons.Settings />
        </button>
      </header>

      {/* Settings Panel */}
      {showSettings && renderSettings()}

      {/* Loading Translation Overlay */}
      {isTranslating && (
        <div className="absolute inset-0 z-30 bg-white/50 backdrop-blur-sm flex items-center justify-center">
             <div className="bg-white p-4 rounded-xl shadow-xl flex flex-col items-center border border-slate-100">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-xs font-bold text-slate-600">Translating...</p>
             </div>
        </div>
      )}

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 scroll-smooth custom-scrollbar">
        {viewState === 'input' && (
           <div className="h-full flex flex-col items-center justify-center">
             {/* If input state persists, it means we are waiting for text or failed */}
             <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
             </div>
             <p className="text-sm text-slate-600 font-medium animate-pulse">Waiting for article content...</p>
           </div>
        )}

        {viewState === 'analyzing' && (
           <div className="h-full flex flex-col items-center justify-center">
             <div className="relative w-16 h-16 mb-6">
                <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
             </div>
             <p className="text-sm text-slate-600 font-medium animate-pulse">Analyzing content...</p>
           </div>
        )}

        {viewState === 'results' && (
          <>
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'timeline' && renderTimeline()}
            {activeTab === 'perspectives' && renderPerspectives()}
            {activeTab === 'learn' && renderLearn()}
          </>
        )}
      </div>

      {/* Bottom Navigation */}
      {viewState === 'results' && (
        <nav className="border-t border-slate-200 bg-white sticky bottom-0 z-20 pb-safe shrink-0">
          <div className="flex justify-around items-center p-2">
            {(['overview', 'timeline', 'perspectives', 'learn'] as TabState[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col items-center p-2 rounded-lg transition-all w-16 relative ${
                  activeTab === tab 
                    ? 'text-indigo-600' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {activeTab === tab && (
                  <span className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-full"></span>
                )}
                <div>
                  {tab === 'overview' && <Icons.Overview />}
                  {tab === 'timeline' && <Icons.Timeline />}
                  {tab === 'perspectives' && <Icons.Perspectives />}
                  {tab === 'learn' && <Icons.Learn />}
                </div>
                <span className="text-[9px] font-bold mt-1 capitalize tracking-wide">{tab}</span>
              </button>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}