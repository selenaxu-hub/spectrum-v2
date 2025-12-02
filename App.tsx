
import React, { useState, useEffect, useCallback } from 'react';
import { analyzeArticle, analyzeSpecificEffect, translateAnalysis } from './services/geminiService';
import { ArticleAnalysis, ViewState, TabState, Language, FontSize } from './types';
import { SpectrumMeter } from './components/SpectrumMeter';
import { EffectCard } from './components/EffectCard';

// --- Demo Content ---
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
  X: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Spark: () => <svg className="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" /></svg>,
  ExternalLink: () => <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>,
  ChevronDown: () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
};

// --- Helper Components ---

const FormattedMarkdown: React.FC<{ text: string }> = ({ text }) => {
  if (!text) return null;
  
  // Split by newlines to handle paragraphs/lists
  const lines = text.split('\n').filter(line => line.trim() !== '');

  return (
    <div className="space-y-2 text-xs">
      {lines.map((line, i) => {
        // Detect list items (1. Item or - Item)
        const listMatch = line.match(/^(\d+\.|-|\*)\s+(.*)/);
        
        // Function to parse bold markdown **text**
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

        // Header style for bolded lines (optional)
        if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
           return <div key={i} className="font-bold text-indigo-800 mt-2">{parseBold(line)}</div>;
        }

        return <div key={i} className="text-slate-700 leading-relaxed">{parseBold(line)}</div>;
      })}
    </div>
  );
};


// --- Sidebar Extension Component ---

interface SidebarProps {
  onClose: () => void;
  initialText: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, initialText }) => {
  const [viewState, setViewState] = useState<ViewState>('analyzing'); // Start analyzing immediately
  const [activeTab, setActiveTab] = useState<TabState>('overview');
  const [articleText, setArticleText] = useState(initialText);
  
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
  const [fontSizeIndex, setFontSizeIndex] = useState<number>(0); // 0: normal, 1: large, 2: xlarge

  // Auto-run analysis on mount
  useEffect(() => {
    const runInitialAnalysis = async () => {
      if (!initialText) {
        setViewState('input');
        return;
      }
      
      try {
        const result = await analyzeArticle(initialText, 'English');
        setOriginalAnalysis(result);
        setDisplayedAnalysis(result);
        setViewState('results');
      } catch (error) {
        console.error("Auto analysis failed:", error);
        setViewState('input'); // Fallback to input if failed
      }
    };

    runInitialAnalysis();
  }, [initialText]);

  // Handle translation when language changes
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

  const handleAnalyze = async () => {
    if (!articleText.trim()) return;
    setViewState('analyzing');
    setShowSettings(false);
    
    try {
      // Always analyze in English first to establish a baseline
      const result = await analyzeArticle(articleText, 'English');
      setOriginalAnalysis(result);
      setDisplayedAnalysis(result);
      setLanguage('English'); // Reset to English on new analysis
      setViewState('results');
    } catch (error) {
      console.error(error);
      alert("Failed to analyze. Please check your API key and try again.");
      setViewState('input');
    }
  };

  const handleCustomEffect = async () => {
    if (!customEffectQuery.trim() || !articleText) return;
    setIsEffectLoading(true);
    setCustomEffectResult(null);
    const result = await analyzeSpecificEffect(articleText, customEffectQuery, language);
    setCustomEffectResult(result);
    setIsEffectLoading(false);
  };

  // Font Size Classes
  const getFontSizeClass = () => {
    switch (fontSizeIndex) {
      case 1: return 'text-base';
      case 2: return 'text-lg';
      default: return 'text-sm';
    }
  };

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
      {/* Bias Section (Card-less & Minimal) */}
      {displayedAnalysis && (
        <SpectrumMeter score={displayedAnalysis.biasScore} category={displayedAnalysis.biasCategory} />
      )}

      {/* Summary Section - Card-less as requested */}
      <div className="px-1">
        <h2 className="text-base font-serif font-bold text-slate-800 mb-2">Summary</h2>
        <p className="text-slate-600 leading-relaxed opacity-90">{displayedAnalysis?.summary}</p>
        {displayedAnalysis?.reasoning && (
           <p className="mt-3 text-xs text-slate-400 italic pt-2">{displayedAnalysis.reasoning}</p>
        )}
      </div>

      {/* Effects Section */}
      <div>
        <h2 className="text-base font-serif font-bold text-slate-800 mb-3 px-1">Effect Chains</h2>
        <div className="grid grid-cols-1 gap-4">
          {displayedAnalysis?.effects.map((effect, idx) => (
            <EffectCard key={idx} effect={effect} />
          ))}
        </div>
      </div>

      {/* Interactive Effect Query */}
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
        {/* Loading Indicator for Result Area */}
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
          <p className="text-xs text-slate-500">Key events in chronological order (Oldest to Newest)</p>
       </div>

       <div className="relative pl-4 space-y-0">
         {/* Vertical Line */}
         <div className="absolute left-6 top-2 bottom-4 w-px bg-slate-200"></div>

         {displayedAnalysis?.timeline.map((event, idx) => {
           const isPast = event.status === 'past';
           const isCurrent = event.status === 'current';
           const isFuture = event.status === 'upcoming';
           const isExpanded = expandedTimelineIndex === idx;
           
           return (
            <div key={idx} className={`relative pl-8 py-3 transition-all ${isPast || isFuture ? 'opacity-75' : 'opacity-100'}`}>
              {/* Dot */}
              <div className={`absolute left-[5.5px] top-4 w-3 h-3 rounded-full border-2 z-10 box-content transition-all ${
                isCurrent ? 'bg-indigo-600 border-white shadow-lg scale-125 ring-2 ring-indigo-100' : 
                isFuture ? 'bg-white border-slate-300 border-dashed' :
                'bg-slate-300 border-white'
              }`}></div>
              
              {/* Label */}
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                 isCurrent ? 'text-indigo-600' : 'text-slate-400'
              }`}>
                {isCurrent ? 'Current Phase' : event.date}
              </div>
              
              {/* Event Card (Clickable) */}
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
                
                {/* Short Description */}
                {!isExpanded && (
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{event.description}</p>
                )}

                {/* Expanded Details */}
                {isExpanded && (
                   <div className="mt-3 animate-fadeIn">
                      <p className="text-xs text-slate-600 leading-relaxed mb-3">
                        {event.detailedDescription || event.description}
                      </p>
                      
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(event.title + " " + event.date)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1.5 rounded hover:bg-indigo-100 transition-colors"
                        onClick={(e) => e.stopPropagation()} // Prevent card collapse when clicking link
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
            <span className="font-serif font-bold text-slate-800 text-sm">
              {pers.sourceName}
            </span>
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
      {/* Glossary */}
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

      {/* Recommended Reading - Natural Transparent Cards */}
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
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <header className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-white/80 backdrop-blur-md shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Icons.Spark />
          <span className="font-serif font-bold text-lg text-slate-800">Spectrum</span>
        </div>
        <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className={`p-2 rounded-full transition-colors ${showSettings ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
              title="Settings"
            >
                <Icons.Settings />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full">
                <Icons.X />
            </button>
        </div>
      </header>

      {/* Settings Panel */}
      {showSettings && renderSettings()}

      {/* Loading Overlay for Translation */}
      {isTranslating && (
        <div className="absolute inset-0 z-30 bg-white/50 backdrop-blur-sm flex items-center justify-center">
             <div className="bg-white p-4 rounded-xl shadow-xl flex flex-col items-center border border-slate-100">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-xs font-bold text-slate-600">Translating...</p>
             </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 scroll-smooth custom-scrollbar">
        {viewState === 'input' && (
           <div className="h-full flex flex-col justify-center space-y-4">
             {/* Fallback View if no text provided */}
             <div className="text-center space-y-2 mb-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.Spark />
                </div>
                <h2 className="text-xl font-serif font-bold text-slate-800">Manual Analysis</h2>
             </div>
             
             <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                <textarea
                  className="w-full h-32 p-3 text-xs resize-none focus:outline-none rounded-lg bg-slate-50 text-slate-600"
                  placeholder="Paste text here..."
                  value={articleText}
                  onChange={(e) => setArticleText(e.target.value)}
                />
             </div>

             <button
                onClick={handleAnalyze}
                disabled={!articleText.trim()}
                className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg shadow-slate-200"
              >
                Analyze Content
              </button>
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

      {/* Bottom Nav */}
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
};


// --- Main Mock Browser App ---

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // When opening the sidebar, we simulate it grabbing the page context
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-full w-full flex flex-col bg-neutral-900 overflow-hidden font-sans">
      {/* Mock Browser Chrome (Toolbar) */}
      <div className="h-16 bg-slate-800 flex items-center px-4 gap-4 border-b border-slate-700 shrink-0 shadow-md z-30">
        {/* Window Controls */}
        <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        
        {/* Nav Controls */}
        <div className="flex gap-4 text-slate-400">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
        </div>

        {/* URL Bar */}
        <div className="flex-1 bg-slate-700 h-9 rounded-full flex items-center px-4 text-sm text-slate-300 relative group">
           <svg className="w-4 h-4 mr-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
           <span>https://metropolis-news.com/politics/zoning-overhaul</span>
        </div>

        {/* Extensions Area */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-600">
           {/* The Spectrum Pulse Icon */}
           <button 
             onClick={toggleSidebar}
             className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
               isSidebarOpen ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
             }`}
             title="Open Spectrum Analysis"
           >
              <Icons.Spark />
              {/* Pulse animation dot if closed */}
              {!isSidebarOpen && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500 border-2 border-slate-800"></span>
                </span>
              )}
           </button>
           <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-800 font-bold text-xs">U</div>
        </div>
      </div>

      {/* Viewport */}
      <div className="flex-1 flex overflow-hidden bg-white relative">
        
        {/* Left Pane: Mock Website Content */}
        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
           <div className="max-w-4xl mx-auto py-12 px-8">
              <span className="text-red-600 font-bold uppercase tracking-wider text-xs mb-2 block">Politics</span>
              <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4 leading-tight">
                {DEMO_ARTICLE_TITLE}
              </h1>
              <div className="flex items-center gap-4 text-sm text-slate-500 mb-8 pb-8 border-b border-slate-100">
                 <div className="w-10 h-10 rounded-full bg-slate-200"></div>
                 <div>
                    <p className="font-bold text-slate-900">By Elena Fisher</p>
                    <p>Updated 2 hours ago</p>
                 </div>
              </div>

              {/* Fake Image */}
              <div className="w-full h-96 bg-slate-100 rounded-lg mb-8 flex items-center justify-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 to-slate-100"></div>
                 <svg className="w-20 h-20 text-slate-300 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                 <p className="absolute bottom-4 left-4 text-slate-500 text-xs z-10">City Hall, Metropolis</p>
              </div>

              {/* Article Body */}
              <div className="prose prose-slate max-w-none text-slate-800 leading-8 font-serif text-lg">
                {DEMO_ARTICLE_TEXT.split('\n\n').map((para, i) => (
                    <p key={i} className="mb-6">{para}</p>
                ))}
              </div>
           </div>
        </div>

        {/* Right Pane: Extension Sidebar */}
        {isSidebarOpen && (
          <div className="w-[400px] border-l border-slate-200 bg-slate-50 h-full shadow-2xl flex flex-col z-20 animate-slide-in relative shrink-0">
             <Sidebar 
                onClose={() => setIsSidebarOpen(false)} 
                initialText={DEMO_ARTICLE_TEXT}
             />
          </div>
        )}

      </div>
    </div>
  );
}
