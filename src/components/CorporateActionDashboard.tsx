import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Filter, 
  ChevronDown, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowUpRight,
  Info,
  Layers,
  CircleDollarSign,
  Split,
  Search
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CorporateEvent } from '../types';

interface CorporateActionDashboardProps {
  events: CorporateEvent[];
  initialSymbolFilter?: string;
  className?: string;
}

type ActionTypeFilter = 'All' | 'Dividen' | 'Stock Split' | 'Right Issue' | 'Saham Bonus' | 'RUPS' | 'Earnings';
type StatusFilter = 'All' | 'Upcoming' | 'Active' | 'Completed';

export function CorporateActionDashboard({ events, initialSymbolFilter, className }: CorporateActionDashboardProps) {
  const [typeFilter, setTypeFilter] = useState<ActionTypeFilter>('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [searchSymbol, setSearchSymbol] = useState(initialSymbolFilter || '');
  const [liveEvents, setLiveEvents] = useState<CorporateEvent[]>([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  // Fetch live data for the filtered results
  const fetchLiveData = async (ticker: string) => {
    if (!ticker) return;
    setLoadingLive(true);
    try {
      const res = await fetch(`/api/corporate-actions/${ticker}`);
      if (res.ok) {
        const data = await res.json();
        const liveEv: CorporateEvent = {
          id: `live-${ticker}-${Date.now()}`,
          symbol: ticker.toUpperCase(),
          companyName: `${ticker.toUpperCase()} (Live)`,
          type: data.type,
          status: data.status,
          date: data.exDate || data.cumDate || '',
          desc: `Otomatis: Dividen Rp ${data.dividendValue}`,
          dividendValue: data.dividendValue,
          dividendYield: data.dividendYield,
          cumDate: data.cumDate,
          exDate: data.exDate,
        };
        setLiveEvents(prev => {
          // Prevent duplicates for the same symbol/type from live fetch
          const filtered = prev.filter(e => !(e.symbol === ticker.toUpperCase() && e.type === liveEv.type));
          return [...filtered, liveEv];
        });
      }
    } catch (e) {
      // fail silently
    } finally {
      setLoadingLive(false);
    }
  };

  React.useEffect(() => {
    if (initialSymbolFilter) {
      fetchLiveData(initialSymbolFilter);
    }
  }, [initialSymbolFilter]);

  const displayEvents = useMemo(() => {
    const combined = [...events];
    
    // Add live events if they don't overshadow mock data with same ID
    liveEvents.forEach(le => {
       if (!combined.some(e => e.id === le.id)) {
          combined.push(le);
       }
    });

    let result = combined;

    if (searchSymbol) {
      result = result.filter(e => e.symbol.toLowerCase().includes(searchSymbol.toLowerCase()));
    }

    if (typeFilter !== 'All') {
      result = result.filter(e => e.type === typeFilter);
    }

    if (statusFilter !== 'All') {
      result = result.filter(e => e.status === statusFilter);
    }

    // Sorting Logic: 
    // 1. Upcoming (Cum Date terdekat)
    // 2. Active/Ongoing
    // 3. Completed (Tanggal terbaru)
    return result.sort((a, b) => {
      const statusWeight = { 'Active': 0, 'Upcoming': 1, 'Completed': 2 };
      if (statusWeight[a.status] !== statusWeight[b.status]) {
        return statusWeight[a.status] - statusWeight[b.status];
      }

      const dateA = new Date(a.cumDate || a.date).getTime();
      const dateB = new Date(b.cumDate || b.date).getTime();

      if (a.status === 'Upcoming') {
        return dateA - dateB; // Nearest first
      }
      return dateB - dateA; // Latest completed/active first
    });
  }, [events, typeFilter, statusFilter, searchSymbol, liveEvents]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
      case 'Active': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Completed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default: return 'text-[#888] bg-[#111] border-[#222]';
    }
  };

  const getCumDateHighlight = (cumDateStr?: string) => {
    if (!cumDateStr) return '';
    const cumDate = new Date(cumDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = cumDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'text-emerald-400'; // Today
    if (diffDays === 1) return 'text-amber-400'; // H-1
    return 'text-white';
  };

  return (
    <div className={cn("space-y-6 w-full max-w-full", className)}>
      {/* Header & Advanced Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
           <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 mb-1">
             <Calendar className="text-[var(--color-gold)]" size={24} />
             Corporate Actions
           </h3>
           <p className="text-sm text-[#888]">Monitor dividen, right issue, stock split, dan jadwal emiten secara strategis.</p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
           {/* Search Symbol */}
           <div className="relative flex-1 sm:w-56 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" size={16} />
              <input 
                type="text"
                placeholder="Cari Ticker (e.g. BBCA)"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
                className="w-full bg-[#111] border border-[#222] rounded-xl pl-10 pr-10 py-2.5 text-sm font-semibold text-white outline-none focus:border-[var(--color-gold)] transition-colors placeholder:text-[#555]"
              />
              <button 
                onClick={() => fetchLiveData(searchSymbol)}
                disabled={!searchSymbol || loadingLive}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors flex items-center justify-center",
                  searchSymbol ? "text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10" : "text-[#555] cursor-not-allowed"
                )}
              >
                {loadingLive ? (
                   <div className="w-4 h-4 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                   <ArrowUpRight size={14} />
                )}
              </button>
           </div>

           {/* Filters */}
           <div className="flex flex-col sm:flex-row items-center gap-3">
             {/* Action Type Filter */}
             <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setIsTypeFilterOpen(!isTypeFilterOpen)}
                  className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] border border-[#333] rounded-full text-xs font-bold text-white transition-all shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:border-[var(--color-gold)]"
                >
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-[var(--color-gold)]" />
                    <span>Tipe: {typeFilter === 'All' ? 'Semua Tipe' : typeFilter}</span>
                  </div>
                  <ChevronDown size={14} className={cn("text-[#888] transition-transform", isTypeFilterOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {isTypeFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 right-0 w-[200px] z-50 bg-[#0d0d0d] border border-[#222] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                      <div className="flex flex-col">
                        {['All', 'Dividen', 'Stock Split', 'Right Issue', 'Saham Bonus', 'RUPS', 'Earnings'].map((t) => (
                          <button
                            key={t}
                            onClick={() => {
                              setTypeFilter(t as ActionTypeFilter);
                              setIsTypeFilterOpen(false);
                            }}
                            className={cn(
                              "text-left px-4 py-3 text-xs font-bold transition-colors w-full",
                              typeFilter === t ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)] border-l-2 border-[var(--color-gold)]" : "text-[#888] hover:bg-[#1a1a1a] hover:text-white border-l-2 border-transparent"
                            )}
                          >
                            {t === 'All' ? 'Semua Tipe' : t}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             {/* Status Filter */}
             <div className="relative w-full sm:w-auto">
                <button
                  onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                  className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] border border-[#333] rounded-full text-xs font-bold text-white transition-all shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:border-[var(--color-gold)]"
                >
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-[#888]" />
                    <span>Status: {statusFilter === 'All' ? 'Semua Status' : statusFilter}</span>
                  </div>
                  <ChevronDown size={14} className={cn("text-[#888] transition-transform", isStatusFilterOpen && "rotate-180")} />
                </button>
                <AnimatePresence>
                  {isStatusFilterOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full mt-2 right-0 w-[180px] z-50 bg-[#0d0d0d] border border-[#222] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
                    >
                      <div className="flex flex-col">
                        {(['All', 'Upcoming', 'Active', 'Completed'] as StatusFilter[]).map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              setStatusFilter(s);
                              setIsStatusFilterOpen(false);
                            }}
                            className={cn(
                              "text-left px-4 py-3 text-xs font-bold transition-colors w-full",
                              statusFilter === s ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)] border-l-2 border-[var(--color-gold)]" : "text-[#888] hover:bg-[#1a1a1a] hover:text-white border-l-2 border-transparent"
                            )}
                          >
                            {s === 'All' ? 'Semua Status' : s}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl overflow-hidden w-full">
        <div className="overflow-x-auto">
          {/* Mobile view (< md) */}
          <div className="md:hidden divide-y divide-[#1A1A1A]">
             <AnimatePresence mode='popLayout'>
                {displayEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-4 space-y-4"
                  >
                    <div className="flex justify-between items-start">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-[#111] border border-[#222] flex items-center justify-center font-bold text-[var(--color-gold)] text-sm shadow-inner">
                             {event.symbol.substring(0, 4)}
                          </div>
                          <div>
                             <div className="text-white font-bold">{event.symbol}</div>
                             <div className="text-xs text-[#888] drop-shadow-sm line-clamp-1">{event.companyName || 'Corporate Participant'}</div>
                          </div>
                       </div>
                       <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider", getStatusColor(event.status))}>
                          {event.status === 'Completed' ? <CheckCircle2 size={12} /> : event.status === 'Upcoming' ? <Clock size={12} /> : <AlertCircle size={12} />}
                          {event.status}
                       </div>
                    </div>

                    <div className="bg-[#111] rounded-xl p-3 border border-[#222]">
                       <div className="flex items-center gap-2 mb-3 pb-3 border-b border-[#222]">
                           {event.type === 'Dividen' && <CircleDollarSign size={16} className="text-emerald-400" />}
                           {event.type === 'Stock Split' && <Split size={16} className="text-blue-400" />}
                           <span className="text-xs font-bold text-[#CCC]">{event.type}</span>
                       </div>
                       
                       {event.type === 'Dividen' && (
                         <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                           <div>
                              <span className="text-[10px] font-medium text-[#777] block mb-1">Dividen Value</span>
                              <div className="text-sm font-bold text-white">Rp {event.dividendValue?.toLocaleString('id-ID')}</div>
                           </div>
                           <div>
                              <span className="text-[10px] font-medium text-[#777] block mb-1">Yield</span>
                              <div className="text-sm font-semibold text-emerald-400">{event.dividendYield}%</div>
                           </div>
                           <div>
                              <span className="text-[10px] font-medium text-[#777] block mb-1">Cum Date</span>
                              <div className={cn("text-sm font-semibold", getCumDateHighlight(event.cumDate))}>
                                {event.cumDate ? new Date(event.cumDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                              </div>
                           </div>
                           <div>
                              <span className="text-[10px] font-medium text-[#777] block mb-1">Payment Date</span>
                              <div className="text-sm font-semibold text-blue-400">
                                {event.paymentDate ? new Date(event.paymentDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                              </div>
                           </div>
                         </div>
                       )}

                       {event.type === 'Stock Split' && (
                         <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                            <div>
                              <span className="text-[10px] font-medium text-[#777] block mb-1">Rasio Split</span>
                              <div className="text-sm font-bold text-white">{event.splitRatio}</div>
                            </div>
                            <div>
                              <span className="text-[10px] font-medium text-[#777] block mb-1">Effective Date</span>
                              <div className="text-sm font-semibold text-blue-400">
                                {event.effectiveDate ? new Date(event.effectiveDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                              </div>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[10px] font-medium text-[#777] block mb-1">Harga Teoritis</span>
                              <div className="text-sm font-medium text-white flex items-center gap-2">
                                <span className="text-[#666] line-through">Rp {event.pricePre?.toLocaleString('id-ID')}</span>
                                <ArrowUpRight size={14} className="text-emerald-400" />
                                <span className="text-emerald-400 font-bold">Rp {event.pricePost?.toLocaleString('id-ID')}</span>
                              </div>
                            </div>
                         </div>
                       )}

                       {event.type !== 'Dividen' && event.type !== 'Stock Split' && (
                         <div className="flex items-start gap-2">
                            <Info size={16} className="text-[#555] shrink-0 mt-0.5" />
                            <p className="text-xs text-[#999] leading-relaxed">{event.desc}</p>
                         </div>
                       )}
                    </div>
                  </motion.div>
                ))}
             </AnimatePresence>
          </div>

          {/* Desktop view (>= md) */}
          <table className="hidden md:table w-full text-left text-sm border-collapse min-w-[800px]">
             <thead>
                <tr className="bg-[#111] border-b border-[#1A1A1A]">
                   <th className="px-6 py-4 text-xs font-semibold text-[#888] whitespace-nowrap">Corporate</th>
                   <th className="px-6 py-4 text-xs font-semibold text-[#888] whitespace-nowrap">Event Type</th>
                   <th className="px-6 py-4 text-xs font-semibold text-[#888] whitespace-nowrap">Status</th>
                   <th className="px-6 py-4 text-xs font-semibold text-[#888] min-w-[300px]">Details</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-[#1A1A1A]">
                <AnimatePresence mode='popLayout'>
                {displayEvents.map((event) => (
                   <motion.tr 
                     key={event.id}
                     layout
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0 }}
                     className="group hover:bg-[#111]/50 transition-colors"
                   >
                      <td className="px-6 py-5 align-top">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#151515] border border-[#222] flex items-center justify-center font-bold text-[var(--color-gold)] text-sm group-hover:scale-105 transition-transform shadow-inner">
                               {event.symbol.substring(0, 4)}
                            </div>
                            <div>
                               <div className="text-white font-bold text-base">{event.symbol}</div>
                               <div className="text-xs text-[#888] mt-1">{event.companyName || 'Corporate Participant'}</div>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                         <div className="flex items-center gap-2 mt-2">
                            {event.type === 'Dividen' && <CircleDollarSign size={16} className="text-emerald-400" />}
                            {event.type === 'Stock Split' && <Split size={16} className="text-blue-400" />}
                            <span className="text-sm font-semibold text-[#CCC]">{event.type}</span>
                         </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                         <div className="mt-2">
                            <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider", getStatusColor(event.status))}>
                               {event.status === 'Completed' ? <CheckCircle2 size={12} /> : event.status === 'Upcoming' ? <Clock size={12} /> : <AlertCircle size={12} />}
                               {event.status}
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-5 align-top">
                         {event.type === 'Dividen' && (
                            <div className="grid grid-cols-3 gap-6 bg-[#111]/30 p-4 rounded-xl border border-[#222]/50">
                               <div>
                                  <span className="text-[10px] font-medium text-[#777] block mb-1">Dividen Value / Yield</span>
                                  <div className="text-sm font-bold text-white flex items-baseline gap-1.5">
                                     Rp {event.dividendValue?.toLocaleString('id-ID')}
                                     <span className="text-xs text-emerald-400 font-medium">({event.dividendYield}%)</span>
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[10px] font-medium text-[#777] block mb-1">Cum Date</span>
                                  <div className={cn("text-sm font-semibold", getCumDateHighlight(event.cumDate))}>
                                     {event.cumDate ? new Date(event.cumDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[10px] font-medium text-[#777] block mb-1">Payment Date</span>
                                  <div className="text-sm font-semibold text-blue-400">
                                     {event.paymentDate ? new Date(event.paymentDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                  </div>
                                </div>
                            </div>
                         )}

                         {event.type === 'Stock Split' && (
                            <div className="grid grid-cols-3 gap-6 bg-[#111]/30 p-4 rounded-xl border border-[#222]/50">
                               <div>
                                  <span className="text-[10px] font-medium text-[#777] block mb-1">Rasio Split</span>
                                  <div className="text-sm font-bold text-white">{event.splitRatio}</div>
                               </div>
                               <div>
                                  <span className="text-[10px] font-medium text-[#777] block mb-1">Harga Teoritis</span>
                                  <div className="text-sm font-medium flex items-center gap-2">
                                     <span className="text-[#666] line-through">Rp {event.pricePre?.toLocaleString('id-ID')}</span>
                                     <ArrowUpRight size={14} className="text-emerald-400" />
                                     <span className="text-emerald-400 font-bold">Rp {event.pricePost?.toLocaleString('id-ID')}</span>
                                  </div>
                               </div>
                               <div>
                                  <span className="text-[10px] font-medium text-[#777] block mb-1">Effective Date</span>
                                  <div className="text-sm font-medium text-blue-400">
                                     {event.effectiveDate ? new Date(event.effectiveDate).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                  </div>
                               </div>
                            </div>
                         )}

                         {event.type !== 'Dividen' && event.type !== 'Stock Split' && (
                            <div className="flex items-start gap-3 bg-[#111]/30 p-4 rounded-xl border border-[#222]/50">
                               <Info size={16} className="text-[#666] mt-0.5 shrink-0" />
                               <p className="text-sm text-[#AAA] leading-relaxed">{event.desc}</p>
                            </div>
                         )}
                      </td>
                   </motion.tr>
                ))}
                </AnimatePresence>
             </tbody>
          </table>

          {displayEvents.length === 0 && (
             <div className="p-16 text-center">
                <Layers size={48} className="mx-auto text-[#222] mb-4" />
                <p className="text-sm font-semibold text-[#666]">Tidak ada aksi korporasi yang sesuai.</p>
             </div>
          )}
        </div>
      </div>

      <div className="flex items-start gap-3 bg-[#111]/50 p-4 rounded-2xl border border-[#222]">
         <div className="mt-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] shrink-0"></div>
         <p className="text-xs text-[#888] leading-relaxed">
            <strong className="text-[#CCC] font-medium">Highlight kuning</strong> menunjukkan bahwa Cum Date semakin dekat (H-1). Volatilitas pasar sering meningkat selama periode ini. Harap perhatikan manajemen risiko Anda.
         </p>
      </div>
    </div>
  );
}
