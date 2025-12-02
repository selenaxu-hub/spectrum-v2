import React, { useState, useEffect } from 'react';
import { analyzeArticle, analyzeSpecificEffect } from './services/geminiService';
import { ArticleAnalysis, ViewState, TabState } from './types';
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
  Puzzle: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
};

// --- Sidebar Extension Component ---

interface SidebarProps {
  onClose: () => void;
  initialText: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, initialText }) => {
  const [viewState, setViewState] = useState<ViewState>('input');
  const [activeTab, setActiveTab] = useState<TabState>('overview');
  const [articleText, setArticleText] = useState(initialText);
  const [analysis, setAnalysis] = useState<ArticleAnalysis | null>(null);
  const [customEffectQuery, setCustomEffectQuery] = useState('');
  const [customEffectResult, setCustomEffectResult] = useState<string | null>(null);
  const [isEffectLoading, setIsEffectLoading] = useState(false);

  // Auto-analyze if initial text is present (Simulating grabbing page content)
  useEffect(() => {
    if (initialText && viewState === 'input') {
       // Optional: Auto-start? Let's leave it manual for the user to click "Analyze"
       // to see the transition, but text is pre-filled.
    }
  }, [initialText]);

  const handleAnalyze = async () => {
    if (!articleText.trim()) return;
    setViewState('analyzing');
    try {
      const result = await analyzeArticle(articleText);
      setAnalysis(result);
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
    const result = await analyzeSpecificEffect(articleText, customEffectQuery);
    setCustomEffectResult(result);
    setIsEffectLoading(false);
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-fadeIn pb-4">
      {/* Summary Section */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-serif font-bold text-slate-800 mb-2">Executive Summary</h2>
        <p className="text-slate-600 leading-relaxed text-sm">{analysis?.summary}</p>
      </div>

      {/* Bias Section */}
      {analysis && (
        <SpectrumMeter score={analysis.biasScore} category={analysis.biasCategory} />
      )}
      <p className="text-xs text-slate-500 px-2 italic">{analysis?.reasoning}</p>

      {/* Effects Section */}
      <div>
        <h2 className="text-lg font-serif font-bold text-slate-800 mb-3 px-1">Effect Chains</h2>
        <div className="grid grid-cols-1 gap-4">
          {analysis?.effects.map((effect, idx) => (
            <EffectCard key={idx} effect={effect} />
          ))}
        </div>
      </div>

      {/* Interactive Effect Query */}
      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
        <h3 className="text-sm font-bold text-indigo-900 mb-2">Explore Specific Impacts</h3>
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
            className="bg-indigo-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isEffectLoading ? '...' : 'Ask'}
          </button>
        </div>
        {customEffectResult && (
          <div className="mt-3 p-3 bg-white rounded border border-indigo-100 text-xs text-indigo-800 leading-relaxed animate-fadeIn">
            {customEffectResult}
          </div>
        )}
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn mb-4">
      <div className="p-4 border-b border-slate-100 bg-slate-50">
        <h2 className="text-base font-serif font-bold text-slate-800">Chronological Context</h2>
      </div>
      <div className="p-4 relative">
        <div className="absolute left-7 top-6 bottom-6 w-0.5 bg-slate-200"></div>
        <div className="space-y-6">
          {analysis?.timeline.map((event, idx) => (
            <div key={idx} className="relative pl-8">
              <div className="absolute left-1 top-1.5 w-3 h-3 rounded-full bg-white border-2 border-blue-500"></div>
              <span className="inline-block bg-slate-100 text-slate-600 text-[9px] font-bold px-1.5 py-0.5 rounded mb-1">
                {event.date}
              </span>
              <h3 className="text-xs font-bold text-slate-800">{event.title}</h3>
              <p className="text-[10px] text-slate-500 mt-1">{event.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPerspectives = () => (
    <div className="space-y-4 animate-fadeIn pb-4">
      <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl">
        <h2 className="text-blue-900 font-bold text-xs mb-1">Break the Echo Chamber</h2>
        <p className="text-blue-700 text-[10px]">How others cover this story.</p>
      </div>
      
      {analysis?.perspectives.map((pers, idx) => (
        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all cursor-pointer group">
          <div className="flex justify-between items-start mb-2">
            <span className="font-serif font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
              {pers.sourceName}
            </span>
            <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase ${
              pers.biasCategory.includes('Right') ? 'bg-red-50 text-red-600' : 
              pers.biasCategory.includes('Left') ? 'bg-blue-50 text-blue-600' :
              'bg-purple-50 text-purple-600'
            }`}>
              {pers.biasCategory}
            </span>
          </div>
          <h3 className="text-xs font-medium text-slate-900 mb-1">"{pers.headline}"</h3>
          <p className="text-[10px] text-slate-500 leading-relaxed">{pers.summary}</p>
        </div>
      ))}
    </div>
  );

  const renderLearn = () => (
    <div className="space-y-6 animate-fadeIn pb-4">
      {/* Glossary */}
      <div>
        <h2 className="text-lg font-serif font-bold text-slate-800 mb-3 px-1">Glossary</h2>
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
          {analysis?.glossary.map((item, idx) => (
            <div key={idx} className="p-3">
              <span className="block text-xs font-bold text-slate-900 mb-0.5">{item.term}</span>
              <span className="block text-[10px] text-slate-500">{item.definition}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Book Recs */}
      <div>
        <h2 className="text-lg font-serif font-bold text-slate-800 mb-3 px-1">Recommended Reading</h2>
        <div className="grid grid-cols-1 gap-3">
          {analysis?.books.map((book, idx) => (
            <div key={idx} className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex gap-3">
              <div className="w-10 h-14 bg-amber-200 rounded shadow-sm flex-shrink-0"></div>
              <div>
                <h3 className="text-xs font-bold text-amber-900 leading-tight">{book.title}</h3>
                <p className="text-[10px] text-amber-700 italic mb-1">by {book.author}</p>
                <p className="text-[9px] text-amber-800 leading-snug">{book.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center text-white font-serif font-bold text-xs">S</div>
          <span className="font-serif font-bold text-lg text-slate-800">Spectrum</span>
        </div>
        <div className="flex items-center gap-2">
            {viewState !== 'input' && (
                <button onClick={() => setViewState('input')} className="text-xs font-medium text-slate-400 hover:text-slate-600 mr-2">
                    New
                </button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Icons.X />
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 scroll-smooth">
        {viewState === 'input' && (
           <div className="h-full flex flex-col justify-center space-y-4">
             <div className="text-center space-y-2 mb-4">
                <h2 className="text-xl font-serif font-bold text-slate-800">Analyze Page</h2>
                <p className="text-xs text-slate-500">Get the full picture of the news you are reading.</p>
             </div>
             
             <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
                <textarea
                  className="w-full h-32 p-3 text-xs resize-none focus:outline-none rounded-lg bg-slate-50 text-slate-600"
                  placeholder="Article text..."
                  value={articleText}
                  onChange={(e) => setArticleText(e.target.value)}
                />
             </div>

             <button
                onClick={handleAnalyze}
                disabled={!articleText.trim()}
                className="w-full bg-slate-900 text-white font-medium py-3 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-50 shadow-md"
              >
                Analyze Content
              </button>
              <p className="text-[9px] text-center text-slate-400">Powered by Gemini 2.5</p>
           </div>
        )}

        {viewState === 'analyzing' && (
           <div className="h-full flex flex-col items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-4"></div>
             <p className="text-sm text-slate-600 font-medium animate-pulse">Analyzing content...</p>
             <p className="text-xs text-slate-400 mt-1">Cross-referencing sources</p>
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
                className={`flex flex-col items-center p-2 rounded-lg transition-all w-16 ${
                  activeTab === tab 
                    ? 'text-slate-900' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <div className={`${activeTab === tab ? 'text-blue-600' : ''}`}>
                  {tab === 'overview' && <Icons.Overview />}
                  {tab === 'timeline' && <Icons.Timeline />}
                  {tab === 'perspectives' && <Icons.Perspectives />}
                  {tab === 'learn' && <Icons.Learn />}
                </div>
                <span className="text-[9px] font-medium mt-1 capitalize">{tab}</span>
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
              <div className="font-serif font-bold text-sm">S</div>
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