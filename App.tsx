import React, { useState, useCallback } from 'react';
import { Search, Pill, Command, Info, Lock } from 'lucide-react';
import { PERSONAS, ComparisonResult } from './types';
import { generatePersonaResponse } from './services/geminiService';
import ResultCard from './components/ResultCard';

const App: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Main App State
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [totalCost, setTotalCost] = useState(0.00);
  const [results, setResults] = useState<Record<string, ComparisonResult>>(() => {
    // Initial empty state for all personas
    const initial: Record<string, ComparisonResult> = {};
    PERSONAS.forEach(p => {
      initial[p.id] = {
        personaId: p.id,
        content: '',
        isLoading: false,
      };
    });
    return initial;
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '9999') {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
      setPasswordInput('');
    }
  };

  const handleSearch = useCallback(async (e?: React.FormEvent, overrideQuery?: string) => {
    e?.preventDefault();
    const activeQuery = overrideQuery || query;
    if (!activeQuery.trim()) return;

    if (overrideQuery) {
      setQuery(overrideQuery);
    }

    setIsSearching(true);
    // Simulate cost increment (approx 0.14 INR per model * 3 models)
    setTotalCost(prev => prev + 0.42);
    
    // Reset results to loading state
    setResults(prev => {
      const next = { ...prev };
      PERSONAS.forEach(p => {
        next[p.id] = { ...next[p.id], isLoading: true, error: undefined, content: '' };
      });
      return next;
    });

    // Fire off requests in parallel but handle them individually to update UI as they finish
    PERSONAS.forEach(async (persona) => {
      const startTime = performance.now();
      try {
        const text = await generatePersonaResponse(activeQuery, persona);
        const endTime = performance.now();
        
        setResults(prev => ({
          ...prev,
          [persona.id]: {
            personaId: persona.id,
            content: text,
            isLoading: false,
            executionTime: Math.round(endTime - startTime),
          }
        }));
      } catch (err) {
        setResults(prev => ({
          ...prev,
          [persona.id]: {
            personaId: persona.id,
            content: '',
            isLoading: false,
            error: "Failed to load response."
          }
        }));
      }
    });

    setIsSearching(false);
  }, [query]);

  // Handle Enter key in input
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Login Screen Render
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
         {/* Background effects */}
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

         <div className="w-full max-w-sm bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl border border-slate-800 shadow-2xl z-10">
             <div className="flex flex-col items-center gap-4 mb-8">
                 <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-2">
                     <Lock className="text-white w-8 h-8" />
                 </div>
                 <div className="text-center">
                     <h1 className="text-2xl font-bold text-white mb-1">Restricted Access</h1>
                     <p className="text-slate-400 text-sm">Enter passcode to access Test Ai</p>
                 </div>
             </div>

             <form onSubmit={handleLogin} className="space-y-4">
                 <div className="space-y-2">
                      <input
                         type="password"
                         value={passwordInput}
                         onChange={(e) => {
                             setPasswordInput(e.target.value);
                             setAuthError(false);
                         }}
                         placeholder="Passcode"
                         className={`w-full bg-slate-950 border ${authError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-800 focus:border-cyan-500'} rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 ${authError ? 'focus:ring-rose-500' : 'focus:ring-cyan-500'} transition-all text-center text-lg tracking-widest`}
                         autoFocus
                     />
                     {authError && (
                         <p className="text-rose-400 text-xs text-center animate-pulse font-medium">
                             Access Denied: Incorrect Passcode
                         </p>
                     )}
                 </div>
                 
                 <button
                     type="submit"
                     className="w-full bg-slate-100 hover:bg-white text-slate-900 font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                 >
                     Authenticate
                 </button>
             </form>
             
             <div className="mt-8 text-center border-t border-slate-800 pt-4">
                 <p className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">Secure Connection :: Kimi k2 System</p>
             </div>
         </div>
      </div>
    );
  }

  // Main Application Render
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Pill className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Test Ai
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Drug Database</a>
            <a href="#" className="hover:text-white transition-colors">Interactions</a>
            <div className="h-4 w-px bg-slate-800"></div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700/50">
               <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
               <span className="text-xs font-mono text-blue-200">Kimi k2</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Search Section */}
        <section className="flex flex-col items-center justify-center py-12 gap-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold max-w-3xl">
            Compare Medical Perspectives <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Instantly & Safely.</span>
          </h1>
          <p className="text-slate-400 max-w-xl text-lg">
            Get Clinical details, Patient counseling, and Safety warnings in one view.
            Powered by Kimi AI for rapid analysis.
          </p>

          <div className="w-full max-w-2xl relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
            <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-700 shadow-2xl">
              <Search className="ml-4 text-slate-500 w-6 h-6" />
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter drug name or condition (e.g., 'Metformin', 'Ibuprofen side effects')"
                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 h-14 px-4 text-lg"
              />
              <div className="pr-2">
                <button 
                  onClick={() => handleSearch()}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-all flex items-center gap-2"
                >
                  <Command size={14} />
                  <span>Analyze</span>
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-500">
             <button 
               className="px-3 py-1 rounded-full border border-slate-800 bg-slate-900/50 hover:border-slate-600 cursor-pointer transition-colors" 
               onClick={() => handleSearch(undefined, "Amoxicillin")}
             >
               Amoxicillin
             </button>
             <button 
               className="px-3 py-1 rounded-full border border-slate-800 bg-slate-900/50 hover:border-slate-600 cursor-pointer transition-colors" 
               onClick={() => handleSearch(undefined, "Lisinopril interactions")}
             >
               Lisinopril interactions
             </button>
             <button 
               className="px-3 py-1 rounded-full border border-slate-800 bg-slate-900/50 hover:border-slate-600 cursor-pointer transition-colors" 
               onClick={() => handleSearch(undefined, "Migraine treatment options")}
             >
               Migraine treatments
             </button>
          </div>
        </section>

        {/* Results Grid */}
        <section className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            {PERSONAS.map(persona => (
              <ResultCard 
                key={persona.id}
                persona={persona}
                result={results[persona.id]}
              />
            ))}
          </div>
        </section>

        {/* Conceptual Cost Display */}
        <div className="flex justify-center">
          <div className="bg-slate-900 border border-slate-800/80 px-6 py-3 rounded-md shadow-lg flex items-center gap-3">
             <div className="text-sm font-mono text-slate-500">
                AI Resource Usage (Est.):
             </div>
             <div className="font-mono text-emerald-400 font-bold">
                ₹{totalCost.toFixed(2)}
             </div>
          </div>
        </div>

        {/* Info Banner */}
        <section className="py-6 border-t border-slate-800 mt-2">
            <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 flex gap-4 items-start">
                <Info className="text-cyan-400 shrink-0 mt-0.5" size={20} />
                <div className="text-sm text-slate-400">
                    <p className="font-semibold text-slate-200 mb-1">Medical Disclaimer & Tech Note</p>
                    <p className="mb-2">
                        
                    </p>
                    <p className="text-rose-400/80">
                        <strong>Disclaimer:</strong> Bondhu Gon Ai Content To Tai Rounak Sir Er Songa Kotha Bole Nibi Sobai.
                    </p>
                </div>
            </div>
        </section>

      </main>
    </div>
  );
};

export default App;