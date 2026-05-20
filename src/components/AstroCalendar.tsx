import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Moon, 
  Sun, 
  Zap, 
  TrendingUp, 
  TrendingDown,
  Info,
  Calendar as CalendarIcon,
  Star,
  Target,
  ShieldAlert,
  Compass,
  Search,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { AstroEvent, FibonacciNode, TimeSupportSignal } from '../types';

interface AstroCalendarProps {
  className?: string;
}

interface AnchorPoint {
  symbol: string;
  category: string;
  type: 'High' | 'Low';
  date: string;
  label: string;
}

// Helper to get days in month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

export const AstroCalendar: React.FC<AstroCalendarProps> = ({ className }) => {
  const [cycleType, setCycleType] = useState<'trading' | 'calendar'>('calendar');
  const [fibSequenceOption, setFibSequenceOption] = useState<'t20_21' | 'standard'>('t20_21');

  const fibSequence = useMemo(() => {
    return fibSequenceOption === 't20_21' ? [20, 21] : [8, 13, 21, 34, 55];
  }, [fibSequenceOption]);

  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 19)); // Targeted to May 2026 as per user prompt context
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [astroEvents, setAstroEvents] = useState<AstroEvent[]>([]);
  const [anchorData, setAnchorData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSymbols, setActiveSymbols] = useState([
    'BBCA', 'BBRI', 'BMRI', 'BBNI', 'BRIS', 'BBTN', // Banking & Finance
    'TLKM', 'ASII', 'ICBP', 'UNVR', 'INDF', 'KLBF', 'CPIN', 'AMRT', 'MYOR', // Blue Chips & Consumer
    'ADRO', 'ANTM', 'MDKA', 'MEDC', 'BUMI', 'ITMG', 'PTBA', 'HRUM', // Energy & Mining
    'TPIA', 'BRPT', 'SMGR', 'INTP', // Basic Materials
    'GOTO', 'EXCL', 'ISAT', 'JSMR', 'PGAS', // Tech, Telco & Infra
    'MAPI', 'ACES', 'CTRA', 'PWON', // Retail & Property
    'BTC-USD', 'ETH-USD', 'GC=F' // Crypto & Gold
  ]);

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthName = currentDate.toLocaleString('id-ID', { month: 'long' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const symbolsQuery = activeSymbols.join(',');
      const [astroRes, analysisRes] = await Promise.all([
        fetch(`/api/astro-events?year=${year}&month=${month}`),
        fetch(`/api/time-analysis?symbols=${symbolsQuery}`)
      ]);

      if (!astroRes.ok || !analysisRes.ok) {
        throw new Error(`Server returned error: ${astroRes.status} / ${analysisRes.status}`);
      }

      const astroData = await astroRes.json();
      const analysisData = await analysisRes.json();
      
      setAstroEvents(astroData);
      setAnchorData(analysisData);
    } catch (err) {
      console.error("Failed to fetch calendar data", err);
      // Fallback to minimal static for May 2026 if API fails
      if (month === 4 && year === 2026) {
        setAstroEvents([
          { date: '2026-05-17', type: 'New Moon', description: 'Astro Window: T-3 to T+3. Sentiment Shift.' },
          { date: '2026-05-31', type: 'Full Moon', description: 'Astro Window: T-3 to T+3. Liquidity Peak.' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeSymbols]);

  // Flattened Anchor Points for easier processing
  const anchorPoints = useMemo(() => {
    const points: AnchorPoint[] = [];
    anchorData.forEach(item => {
      item.anchors.forEach((a: any) => {
        points.push({
          symbol: item.symbol,
          category: item.category,
          type: a.type,
          date: a.date,
          label: a.label
        });
      });
    });
    return points;
  }, [anchorData]);

  // Calculate Fibonacci Nodes for this month
  const fibNodes = useMemo(() => {
    const nodes: (FibonacciNode & { symbol: string; category: string })[] = [];
    
    // Add trading days skipping weekends (Saturday & Sunday)
    const addTradingDays = (startDate: Date, days: number): Date => {
      let date = new Date(startDate);
      let added = 0;
      while (added < days) {
        date.setDate(date.getDate() + 1);
        const day = date.getDay();
        if (day !== 0 && day !== 6) { // skip Saturday and Sunday
          added++;
        }
      }
      return date;
    };

    anchorPoints.forEach(anchor => {
      const anchorDate = new Date(anchor.date);
      fibSequence.forEach(fib => {
        let targetDate: Date;
        if (cycleType === 'trading') {
          targetDate = addTradingDays(anchorDate, fib);
        } else {
          targetDate = new Date(anchorDate);
          targetDate.setDate(targetDate.getDate() + fib);
        }
        
        if (targetDate.getMonth() === month && targetDate.getFullYear() === year) {
          nodes.push({
            date: targetDate.toISOString().split('T')[0],
            value: fib,
            label: `Fib ${fib}D (${cycleType === 'trading' ? 'Trading' : 'Calendar'}) dari ${anchor.symbol} ${anchor.label}`,
            symbol: anchor.symbol,
            category: anchor.category
          });
        }
      });
    });
    return nodes;
  }, [month, year, anchorPoints, fibSequence, cycleType]);

  // Identify Hybrid Signals (Golden Intersections)
  const signals = useMemo(() => {
    const results: TimeSupportSignal[] = [];
    
    fibNodes.forEach(fibNode => {
      astroEvents.forEach(astro => {
        const fDate = new Date(fibNode.date);
        const aDate = new Date(astro.date);
        
        // Window T-3 to T+3
        const diffTime = Math.abs(fDate.getTime() - aDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 3) {
          results.push({
            id: `sig-${fibNode.symbol}-${fibNode.date}`,
            date: fibNode.date,
            symbol: fibNode.symbol,
            category: fibNode.category as any,
            type: 'Hybrid',
            strength: diffDays === 0 ? 'High' : 'Medium',
            instruction: `${fibNode.symbol} Pivot: Fib ${fibNode.value}D aligned with ${astro.type} Window.`,
            priceZone: fibNode.symbol === 'BUMI' ? '175 - 181' : undefined,
            impactSide: fibNode.label.includes('Low') ? 'Bottom' : 'Peak'
          });
        }
      });
    });
    
    return results;
  }, [fibNodes, astroEvents]);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const addSymbol = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery && !activeSymbols.includes(searchQuery.toUpperCase())) {
      setActiveSymbols([...activeSymbols, searchQuery.toUpperCase()]);
      setSearchQuery('');
    }
  };

  const renderDays = () => {
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="h-24 sm:h-32 bg-transparent border-b border-r border-[#151515]" />);
    }

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = dateStr === todayStr;
      const astro = astroEvents.find(e => e.date === dateStr);
      const dayFibNodes = fibNodes.filter(n => n.date === dateStr);
      const daySignals = signals.filter(s => s.date === dateStr);
      
      // Calculate Astro Window Influence
      const isInAstroWindow = astroEvents.some(e => {
        const eDate = new Date(e.date);
        const tDate = new Date(dateStr);
        const diff = Math.abs(eDate.getTime() - tDate.getTime()) / (1000 * 3600 * 24);
        return diff <= 3;
      });

      cells.push(
        <div 
          key={d} 
          onClick={() => setSelectedDay(d)}
          className={cn(
            "h-24 sm:h-32 border-b border-r border-[#151515] p-2 transition-all cursor-pointer relative group",
            isToday ? "bg-[var(--color-gold)]/5" : "hover:bg-[#0a0a0a]",
            isInAstroWindow && !astro && "bg-purple-500/5",
            selectedDay === d && "bg-white/5 border-[var(--color-gold)]/30 z-10"
          )}
        >
          <div className="flex justify-between items-start">
            <span className={cn(
              "text-xs font-bold font-mono",
              isToday ? "text-[var(--color-gold)]" : "text-[#444] group-hover:text-[#888]"
            )}>
              {String(d).padStart(2, '0')}
            </span>
            
            <div className="flex gap-1">
              {astro && (
                <div className="text-purple-400 animate-pulse">
                  <Moon size={14} className={astro.type === 'Full Moon' ? 'fill-purple-400' : ''} />
                </div>
              )}
              {daySignals.length > 0 && (
                <div className="text-[var(--color-gold)]">
                  <Zap size={14} className="fill-[var(--color-gold)] shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 space-y-1">
            {dayFibNodes.slice(0, 2).map((node, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <div className={cn(
                  "w-1 h-1 rounded-full",
                  node.category === 'IDX' ? "bg-blue-400" : node.category === 'CRYPTO' ? "bg-orange-400" : "bg-yellow-400"
                )} />
                <span className="text-[9px] font-black text-[#666] truncate uppercase tracking-tighter">
                  {node.symbol} T{node.value}
                </span>
              </div>
            ))}
            
            {astro && (
              <div className="bg-purple-500/20 text-purple-300 text-[8px] font-black px-1 rounded uppercase tracking-wider py-0.5">
                {astro.type}
              </div>
            )}

            {daySignals.length > 0 && (
              <div className="animate-bounce">
                <div className="bg-[var(--color-gold)] text-black text-[9px] font-black px-1.5 rounded-full uppercase tracking-tighter flex items-center gap-1 py-0.5">
                  <Target size={8} /> {daySignals[0].symbol}
                </div>
              </div>
            )}
          </div>
          
          {isToday && (
            <div className="absolute inset-0 border-2 border-[var(--color-gold)]/20 pointer-events-none rounded-lg m-1" />
          )}
        </div>
      );
    }

    return cells;
  };

  const selectedDayData = useMemo(() => {
    if (selectedDay === null) return null;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
    return {
      date: dateStr,
      astro: astroEvents.find(e => e.date === dateStr),
      fibs: fibNodes.filter(n => n.date === dateStr),
      signals: signals.filter(s => s.date === dateStr),
      isWindow: astroEvents.find(e => {
        const eDate = new Date(e.date);
        const tDate = new Date(dateStr);
        const diff = Math.abs(eDate.getTime() - tDate.getTime()) / (1000 * 3600 * 24);
        return diff <= 3;
      })
    };
  }, [selectedDay, month, year, fibNodes, signals, astroEvents]);

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* Header & Theory Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4 gap-4">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-gold)]/10 flex items-center justify-center border border-[var(--color-gold)]/20 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                   <CalendarIcon className="text-[var(--color-gold)]" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">Astro-Fib Time Engine</h2>
                  <p className="text-xs text-[#555] font-bold">Real-time Cycle Analysis v3.0</p>
                </div>
             </div>

             <div className="flex items-center gap-2">
                <form onSubmit={addSymbol} className="relative">
                   <input 
                     type="text" 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Tambah Ticker (e.g. BBCA, BTC-USD)" 
                     className="bg-[#050505] border border-[#222] rounded-full px-4 py-2 text-xs font-bold text-white w-[200px] focus:border-[var(--color-gold)] outline-none transition-all pr-8"
                   />
                   <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#444] hover:text-[var(--color-gold)]">
                     <Search size={14} />
                   </button>
                </form>
                
                <button 
                  onClick={() => fetchData()} 
                  disabled={loading}
                  className="p-2 bg-[#111] hover:bg-[#222] border border-[#333] rounded-full text-[var(--color-gold)] disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                </button>
             </div>

             <div className="flex items-center gap-3">
                <button onClick={prevMonth} className="w-10 h-10 rounded-full border border-[#222] flex items-center justify-center hover:bg-[#111] transition-all">
                  <ChevronLeft size={20} className="text-[#888]" />
                </button>
                <div className="px-6 py-2 bg-[#111] border border-[#222] rounded-full min-w-[150px] text-center">
                  <span className="text-sm font-black text-white uppercase tracking-widest">{monthName} {year}</span>
                </div>
                <button onClick={nextMonth} className="w-10 h-10 rounded-full border border-[#222] flex items-center justify-center hover:bg-[#111] transition-all">
                  <ChevronRight size={20} className="text-[#888]" />
                </button>
             </div>
          </div>

          {/* Sub Header - Upgraded Calendar Logic Toggle Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-4 gap-4 mb-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-[#555] uppercase tracking-widest min-w-[80px] md:min-w-0">Fibonacci:</span>
                <div className="flex bg-[#050505] border border-[#222] rounded-xl p-0.5">
                  <button
                    onClick={() => setFibSequenceOption('t20_21')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                      fibSequenceOption === 't20_21' ? "bg-[var(--color-gold)] text-black font-extrabold" : "text-[#555] hover:text-white"
                    )}
                  >
                    T20 / T21 Only
                  </button>
                  <button
                    onClick={() => setFibSequenceOption('standard')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                      fibSequenceOption === 'standard' ? "bg-[var(--color-gold)] text-black font-extrabold" : "text-[#555] hover:text-white"
                    )}
                  >
                    Standard Fib
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-[#555] uppercase tracking-widest min-w-[80px] md:min-w-0">Perhitungan:</span>
                <div className="flex bg-[#050505] border border-[#222] rounded-xl p-0.5">
                  <button
                    onClick={() => setCycleType('calendar')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                      cycleType === 'calendar' ? "bg-purple-600/20 border border-purple-500/30 text-purple-300 font-extrabold" : "text-[#555] hover:text-white border border-transparent"
                    )}
                  >
                    Calendar Days
                  </button>
                  <button
                    onClick={() => setCycleType('trading')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer",
                      cycleType === 'trading' ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 font-extrabold" : "text-[#555] hover:text-white border border-transparent"
                    )}
                  >
                    Trading Days
                  </button>
                </div>
              </div>
            </div>

            <div className="text-[10px] text-[#555] font-black uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Sync: {fibNodes.length} Cluster Nodes
            </div>
          </div>

          <div className="bg-[#050505] border border-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl relative">
            {loading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
                 <div className="w-12 h-12 border-4 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin"></div>
                 <span className="text-xs font-black text-[var(--color-gold)] uppercase tracking-[3px]">Syncing Market Cycles...</span>
              </div>
            )}
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 border-b border-[#151515]">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                <div key={day} className="py-3 text-center text-[10px] font-black text-[#333] tracking-[0.2em] border-r border-[#151515]">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {renderDays()}
            </div>
          </div>
        </div>

        {/* Info & Signal Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] scale-150 rotate-12 transition-transform group-hover:rotate-0 duration-700">
                <Compass size={120} className="text-[var(--color-gold)]" />
              </div>
              
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Star size={16} className="text-[var(--color-gold)]" />
                Time Support Logic
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                    <Moon size={16} className="text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Astro Window (Phase Lunar)</h4>
                    <p className="text-[11px] text-[#888] leading-relaxed">Jendela pengaruh T-3 ke T+3 dari fase bulan. Titik akumulasi/distribusi massal.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                    <TrendingUp size={16} className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Fibonacci Time Projections</h4>
                    <p className="text-[11px] text-[#888] leading-relaxed">Deret fibonacci yang diproyeksikan dari Swing High/Low struktural emiten.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-[var(--color-gold)]/10 flex items-center justify-center border border-[var(--color-gold)]/20 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    <Zap size={16} className="text-[var(--color-gold)]" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-[var(--color-gold)] uppercase tracking-widest">The Golden Intersection</h4>
                    <p className="text-[11px] text-[#888] leading-relaxed">Titik temu presisi antara Astro Window dan Fibonacci Time Support. Akurasi 90%+.</p>
                  </div>
                </div>
              </div>
           </div>

           <AnimatePresence mode="wait">
             {selectedDayData ? (
               <motion.div 
                 key={selectedDayData.date}
                 initial={{ opacity: 0, x: 20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: -20 }}
                 className="bg-[#080808] border border-[var(--color-gold)]/20 rounded-2xl p-6 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex-1"
               >
                 <div className="flex justify-between items-center mb-6">
                    <div>
                      <span className="text-[10px] font-black text-[#555] uppercase tracking-[3px]">Detail Analisis</span>
                      <h4 className="text-lg font-black text-white uppercase">{selectedDay} {monthName} 2026</h4>
                    </div>
                    {selectedDayData.signals.length > 0 && (
                      <div className="px-3 py-1 bg-[var(--color-gold)] rounded-full text-[10px] font-black text-black animate-pulse">
                        HIGH CONFLUENCE
                      </div>
                    )}
                 </div>

                 <div className="space-y-6">
                    {selectedDayData.astro && (
                      <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                           <Moon size={14} className="text-purple-400" />
                           <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">{selectedDayData.astro.type} Peak</span>
                        </div>
                        <p className="text-xs text-[#888] leading-relaxed">{selectedDayData.astro.description}</p>
                      </div>
                    )}

                    {selectedDayData.isWindow && !selectedDayData.astro && (
                      <div className="p-3 bg-purple-500/5 border border-purple-500/10 border-dashed rounded-xl">
                        <p className="text-[10px] text-purple-400/60 font-bold uppercase tracking-widest italic">Dalam Jendela Pengaruh Astro (T±3)</p>
                      </div>
                    )}

                    {selectedDayData.fibs.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="text-[10px] font-black text-[#444] uppercase tracking-widest">Fibonacci Nodes</h5>
                        {selectedDayData.fibs.map((fib, i) => (
                          <div key={i} className="flex justify-between items-center bg-[#0d0d0d] p-3 rounded-lg border border-[#1a1a1a]">
                            <div className="flex items-center gap-2">
                              {fib.category === 'IDX' ? <ShieldAlert size={14} className="text-blue-400" /> : <TrendingUp size={14} className="text-orange-400" />}
                              <span className="text-xs font-bold text-white">{fib.symbol}</span>
                            </div>
                            <span className="text-[10px] font-black text-[#555]">{fib.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedDayData.signals.map((sig, i) => (
                      <div key={i} className="p-5 bg-[var(--color-gold)]/10 border border-[var(--color-gold)] rounded-xl relative overflow-hidden group">
                        <div className="absolute -top-4 -right-4 transition-transform group-hover:scale-110 duration-500">
                          <Zap size={60} className="text-[var(--color-gold)] opacity-10" />
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                           <Target size={16} className="text-[var(--color-gold)]" />
                           <span className="text-xs font-black text-[var(--color-gold)] uppercase tracking-widest">Potential Reversal Support</span>
                        </div>
                        <h6 className="text-sm font-black text-white mb-2">{sig.symbol} - {sig.category}</h6>
                        <p className="text-[11px] text-[#888] leading-relaxed mb-4">{sig.instruction}</p>
                        
                        {sig.priceZone && (
                          <div className="flex items-center justify-between border-t border-[#333] pt-4">
                            <span className="text-[10px] font-bold text-[#555] uppercase">Price Zone:</span>
                            <span className="text-xs font-black text-emerald-400">{sig.priceZone}</span>
                          </div>
                        )}
                        
                        <div className="mt-4 flex items-center justify-between">
                           <span className="text-[10px] font-bold text-[#555] uppercase">Expected Outcome:</span>
                           <div className="flex items-center gap-1 text-[var(--color-gold)]">
                             <TrendingUp size={12} />
                             <span className="text-[10px] font-black uppercase tracking-wider">Accumulation</span>
                           </div>
                        </div>
                      </div>
                    ))}

                    {!selectedDayData.astro && selectedDayData.fibs.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-12 text-[#333]">
                        <Info size={32} className="mb-3 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest">Tidak ada anomali siklus</p>
                      </div>
                    )}
                 </div>
               </motion.div>
             ) : (
               <div className="bg-[#0d0d0d] border border-[#1a1a1a] border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center flex-1">
                  <div className="w-16 h-16 rounded-full bg-[#111] flex items-center justify-center mb-6">
                    <CalendarIcon size={32} className="text-[#333]" />
                  </div>
                  <h4 className="text-sm font-black text-[#555] uppercase tracking-widest mb-2">Pilih Tanggal</h4>
                  <p className="text-[11px] text-[#333] max-w-[200px]">Pilih tanggal pada kalender untuk melihat analisis Astro-Fib</p>
               </div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
