import React, { useEffect, useState } from 'react';
import { cn } from '../lib/utils';
import { Activity, Crosshair, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import Chart from 'react-apexcharts';

export function TechnicalDashboard({ symbol }: { symbol: string }) {
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [activeTf, setActiveTf] = useState('1d');

  const timeframes = ['1d', '4h', '1h', '15m'];

  useEffect(() => {
    let isMounted = true;
    const fetchTFs = async () => {
      setLoading(true);
      const results: Record<string, any> = {};
      for (const tf of timeframes) {
        try {
          const res = await fetch(`/api/technical/${symbol}?interval=${tf}&isSearch=true`);
          if (res.ok) {
            results[tf] = await res.json();
          }
        } catch (e) {
          // handled
        }
      }
      if (isMounted) {
        setData(results);
        setLoading(false);
      }
    };
    fetchTFs();
    return () => { isMounted = false; };
  }, [symbol]);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-8 bg-[#222] rounded w-1/3"></div>
      <div className="grid grid-cols-4 gap-4"><div className="h-24 bg-[#111] rounded"></div><div className="h-24 bg-[#111] rounded"></div><div className="h-24 bg-[#111] rounded"></div><div className="h-24 bg-[#111] rounded"></div></div>
    </div>;
  }

  const chartSeries: any = [
    {
      name: symbol,
      type: 'candlestick',
      data: data[activeTf]?.chartData || []
    },
    {
      name: 'EMA 20',
      type: 'line',
      data: (data[activeTf]?.chartData || []).map((d: any) => ({ x: d.x, y: d.ema20 }))
    },
    {
      name: 'EMA 50',
      type: 'line',
      data: (data[activeTf]?.chartData || []).map((d: any) => ({ x: d.x, y: d.ema50 }))
    },
    {
      name: 'EMA 200',
      type: 'line',
      data: (data[activeTf]?.chartData || []).map((d: any) => ({ x: d.x, y: d.ema200 }))
    },
    {
      name: 'BB Upper',
      type: 'line',
      data: (data[activeTf]?.chartData || []).map((d: any) => ({ x: d.x, y: d.bb?.upper }))
    },
    {
      name: 'BB Lower',
      type: 'line',
      data: (data[activeTf]?.chartData || []).map((d: any) => ({ x: d.x, y: d.bb?.lower }))
    }
  ];

  const macdSeries: any = [
    {
      name: 'MACD',
      type: 'line',
      data: (data[activeTf]?.chartData || []).map((d: any) => ({ x: d.x, y: d.macd?.MACD }))
    },
    {
      name: 'Signal',
      type: 'line',
      data: (data[activeTf]?.chartData || []).map((d: any) => ({ x: d.x, y: d.macd?.signal }))
    },
    {
      name: 'Histogram',
      type: 'bar',
      data: (data[activeTf]?.chartData || []).map((d: any) => ({ x: d.x, y: d.macd?.histogram }))
    }
  ];

  const chartOptions: any = {
    chart: {
      type: 'candlestick',
      height: 350,
      background: 'transparent',
      toolbar: {
        show: false
      },
      animations: {
        enabled: false
      }
    },
    colors: ['#3b82f6', '#f59e0b', '#ef4444', '#10b981', '#a855f7', '#a855f7'],
    stroke: {
      width: [1, 1.5, 1.5, 1.5, 1, 1],
      dashArray: [0, 0, 0, 0, 4, 4]
    },
    legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        fontSize: '10px',
        labels: {
            colors: '#666'
        }
    },
    title: {
      text: `${symbol} ${activeTf} Intelligence Chart`,
      align: 'left',
      style: {
        color: '#fff',
        fontSize: '12px',
        fontWeight: 'bold'
      }
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#888'
        }
      }
    },
    yaxis: {
      tooltip: {
        enabled: true
      },
      labels: {
        style: {
          colors: '#888'
        },
        formatter: (val: number) => `Rp ${val?.toLocaleString("id-ID")}`
      }
    },
    grid: {
      borderColor: '#222'
    },
    tooltip: {
        theme: 'dark'
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#10b981',
          downward: '#ef4444'
        }
      }
    }
  };

  const macdOptions: any = {
    chart: {
      type: 'line',
      height: 150,
      background: 'transparent',
      toolbar: { show: false },
      animations: { enabled: false }
    },
    colors: ['#3b82f6', '#f59e0b', '#ef4444'], // MACD, Signal, Histogram (using green/red via plotOptions if possible, but let's stick to simple bar colors or function if supported)
    stroke: {
      width: [1.5, 1.5, 0]
    },
    legend: { show: false },
    xaxis: {
      type: 'datetime',
      labels: { show: false },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        style: { colors: '#888', fontSize: '10px' },
        formatter: (val: number) => val?.toFixed(1)
      }
    },
    grid: { borderColor: '#222' },
    plotOptions: {
      bar: {
        columnWidth: '80%',
        colors: {
          ranges: [
            { from: -100000, to: 0, color: '#ef4444' },
            { from: 0.0001, to: 100000, color: '#10b981' }
          ]
        }
      }
    },
    dataLabels: { enabled: false },
    tooltip: { theme: 'dark' }
  };

  const latestAtr = data[activeTf]?.latest?.atr || 0;
  const latestMacd = data[activeTf]?.latest?.macd?.MACD || 0;
  const latestSignal = data[activeTf]?.latest?.macd?.signal || 0;
  const latestHist = data[activeTf]?.latest?.macd?.histogram || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-[#222] pb-4">
        <h4 className="flex items-center gap-3 text-lg font-bold text-white">
          <Activity className="text-[var(--color-gold)]" size={20} />
          MTF Technical Intelligence
        </h4>
        <div className="flex gap-2">
           <div className="flex items-center gap-1.5 bg-[#111] px-2 py-1 rounded border border-[#222]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[8px] font-black uppercase text-[#888] tracking-widest">Real-time Data</span>
           </div>
        </div>
      </div>

      <div className="bg-[#080808] border border-[#222] rounded-xl p-4">
        <div className="flex justify-between items-center mb-4 overflow-x-auto scrollbar-hide pb-2">
           <div className="flex gap-2">
              {timeframes.map(tf => (
                  <button 
                   key={tf}
                   onClick={() => setActiveTf(tf)}
                   className={cn(
                       "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded transition-all",
                       activeTf === tf ? "bg-[var(--color-gold)] text-black" : "bg-[#111] text-[#888] hover:text-white border border-[#222]"
                   )}
                  >
                      {tf}
                  </button>
              ))}
           </div>
           <div className="flex gap-4">
               <div className="bg-[#111] border border-[#222] px-3 py-1.5 rounded-md">
                   <span className="text-[9px] font-black text-[#555] uppercase tracking-widest mr-2">ATR(14):</span>
                   <span className="text-[10px] font-black text-[var(--color-gold)]">{latestAtr?.toFixed(2)}</span>
               </div>
               <div className="bg-[#111] border border-[#222] px-3 py-1.5 rounded-md">
                   <span className="text-[9px] font-black text-[#555] uppercase tracking-widest mr-2">MACD(12,26,9):</span>
                   <span className={cn("text-[10px] font-black mr-2", latestMacd > 0 ? "text-emerald-400" : "text-rose-400")}>{Math.abs(latestMacd)?.toFixed(1)}</span>
                   <span className="text-[9px] font-black text-[#555] uppercase tracking-widest mr-2">SIG:</span>
                   <span className="text-[10px] font-black text-amber-400 mr-2">{latestSignal?.toFixed(1)}</span>
                   <span className="text-[9px] font-black text-[#555] uppercase tracking-widest mr-2">HIST:</span>
                   <span className={cn("text-[10px] font-black", latestHist > 0 ? "text-emerald-400" : "text-rose-400")}>{latestHist?.toFixed(1)}</span>
               </div>
           </div>
        </div>
        <div className="min-h-[350px]">
           <Chart 
            options={chartOptions}
            series={chartSeries}
            height={350}
           />
        </div>
        <div className="mt-2 min-h-[150px]">
           <Chart 
            options={macdOptions}
            series={macdSeries}
            height={150}
           />
        </div>
      </div>

      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <table className="w-full text-left text-sm whitespace-nowrap min-w-[600px] border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[#555] uppercase font-black text-[9px] tracking-[2px]">
              <th className="px-4 py-2">Indicator Model</th>
              {timeframes.map(tf => (
                <th key={tf} className="px-4 py-2 text-center border-l border-[#1a1a1a]">{tf} Phase</th>
              ))}
            </tr>
          </thead>
          <tbody className="space-y-2">
            {/* 1. Filter Arah Tren (KAMA) */}
            <tr className="bg-[#0d0d0d] hover:bg-[#111] transition-all rounded-xl relative overflow-hidden group">
              <td className="p-4 border-l-2 border-[var(--color-gold)] rounded-l-xl">
                <div className="font-black text-white flex items-center gap-2 uppercase text-[11px] tracking-tight">
                   <Activity size={14} className="text-[#444] group-hover:text-[var(--color-gold)] transition-colors"/> KAMA Trend Filter
                </div>
                <div className="text-[10px] text-[#555] mt-1 font-bold italic leading-tight">Adaptive consolidation noise killer</div>
              </td>
              {timeframes.map(tf => {
                const tfData = data[tf];
                if (!tfData) return <td key={tf} className="p-4 text-center text-[#333] border-l border-[#1a1a1a]">-</td>;
                const isBullish = tfData.trend === 'BULLISH';
                return (
                  <td key={tf} className="p-4 text-center border-l border-[#1a1a1a]">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                      isBullish 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    )}>
                      <div className={cn("w-1 h-1 rounded-full", isBullish ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]")}></div>
                      {isBullish ? 'Bullish' : 'Bearish'}
                    </div>
                    <div className="text-[10px] font-mono text-[#444] mt-1.5 font-bold">Base: {tfData.latest?.kama?.toLocaleString("id-ID", { maximumFractionDigits: 0 })}</div>
                  </td>
                );
              })}
            </tr>
            
            {/* 2. Volume Profile & VWAP */}
            <tr className="bg-[#0d0d0d] hover:bg-[#111] transition-all rounded-xl relative overflow-hidden group">
              <td className="p-4 border-l-2 border-blue-500 rounded-l-xl">
                <div className="font-black text-white flex items-center gap-2 uppercase text-[11px] tracking-tight">
                   <Crosshair size={14} className="text-[#444] group-hover:text-blue-400 transition-colors"/> Volume Profile (VWAP)
                </div>
                <div className="text-[10px] text-[#555] mt-1 font-bold italic leading-tight">Objective liquidity zones (Unmanipulated)</div>
              </td>
              {timeframes.map(tf => {
                const tfData = data[tf];
                if (!tfData) return <td key={tf} className="p-4 text-center text-[#333] border-l border-[#1a1a1a]">-</td>;
                const vwap = tfData.latest?.vwap;
                const price = tfData.latest?.price;
                const aboveVwap = price > vwap;
                return (
                  <td key={tf} className="p-4 text-center border-l border-[#1a1a1a]">
                    <span className={cn("text-xs font-black font-mono", aboveVwap ? "text-blue-400" : "text-amber-400")}>
                      Rp {vwap?.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                    </span>
                    <div className="flex items-center justify-center gap-1 mt-1.5">
                       <span className={cn("w-1 h-1 rounded-full", aboveVwap ? "bg-blue-400" : "bg-amber-400")}></span>
                       <div className="text-[9px] font-black uppercase tracking-tighter text-[#444]">{aboveVwap ? 'Over Benchmark' : 'Under Benchmark'}</div>
                    </div>
                  </td>
                );
              })}
            </tr>

            {/* 3. Trigger Entry */}
            <tr className="bg-[#0d0d0d] hover:bg-[#111] transition-all rounded-xl relative overflow-hidden group">
              <td className="p-4 border-l-2 border-emerald-500 rounded-l-xl">
                <div className="font-black text-white flex items-center gap-2 uppercase text-[11px] tracking-tight">
                   <Zap size={14} className="text-[#444] group-hover:text-emerald-400 transition-colors"/> Entry Trigger
                </div>
                <div className="text-[10px] text-[#555] mt-1 font-bold italic leading-tight">Engulfing Pattern + RSI Divergence</div>
              </td>
              {timeframes.map(tf => {
                const tfData = data[tf];
                if (!tfData) return <td key={tf} className="p-4 text-center text-[#333] border-l border-[#1a1a1a]">-</td>;
                const hasEngulfing = tfData.latest?.bullishEngulfing === true;
                const hasDiv = tfData.rsiDivergence;
                const trigger = hasEngulfing || hasDiv;
                
                return (
                  <td key={tf} className="p-4 text-center border-l border-[#1a1a1a]">
                    {trigger ? (
                       <span className={cn(
                         "px-3 py-1 rounded border text-[10px] font-black uppercase tracking-widest shadow-lg animate-pulse",
                         hasEngulfing && hasDiv 
                           ? "bg-emerald-500 text-black border-emerald-400" 
                           : "bg-[#111] text-emerald-400 border-emerald-500/30"
                       )}>
                         {hasEngulfing && hasDiv ? 'Strong Sinyal' : 'Entry Sinyal'}
                       </span>
                    ) : (
                       <span className="text-[10px] text-[#333] font-black uppercase tracking-widest border border-[#1a1a1a] px-2 py-1 rounded">No Trigger</span>
                    )}
                    <div className="text-[8px] text-[#444] mt-2 font-black uppercase flex flex-col gap-0.5">
                       <span className={hasEngulfing ? "text-emerald-500/60" : ""}>{hasEngulfing ? '• Pattern: OK' : '• Pattern: NA'}</span>
                       <span className={hasDiv ? "text-emerald-500/60" : ""}>{hasDiv ? '• RSI Div: OK' : '• RSI Div: NA'}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
            {/* 4. MACD & Momentum */}
            <tr className="bg-[#0d0d0d] hover:bg-[#111] transition-all rounded-xl relative overflow-hidden group">
              <td className="p-4 border-l-2 border-purple-500 rounded-l-xl">
                <div className="font-black text-white flex items-center gap-2 uppercase text-[11px] tracking-tight">
                   <Activity size={14} className="text-[#444] group-hover:text-purple-400 transition-colors"/> MACD Trend Momentum
                </div>
                <div className="text-[10px] text-[#555] mt-1 font-bold italic leading-tight">MACD Signal & Histogram Analysis</div>
              </td>
              {timeframes.map(tf => {
                const tfData = data[tf];
                if (!tfData) return <td key={tf} className="p-4 text-center text-[#333] border-l border-[#1a1a1a]">-</td>;
                const macd = tfData.latest?.macd;
                if (!macd) return <td key={tf} className="p-4 text-center text-[#333] border-l border-[#1a1a1a]">-</td>;
                
                const isBullishCross = macd.histogram > 0;
                
                return (
                  <td key={tf} className="p-4 text-center border-l border-[#1a1a1a]">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                      isBullishCross 
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/20" 
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    )}>
                      {isBullishCross ? 'Bull Momentum' : 'Bear Momentum'}
                    </div>
                  </td>
                );
              })}
            </tr>
            
            {/* 5. Bollinger Bands Width */}
            <tr className="bg-[#0d0d0d] hover:bg-[#111] transition-all rounded-xl relative overflow-hidden group">
              <td className="p-4 border-l-2 border-pink-500 rounded-l-xl">
                <div className="font-black text-white flex items-center gap-2 uppercase text-[11px] tracking-tight">
                   <Crosshair size={14} className="text-[#444] group-hover:text-pink-400 transition-colors"/> Bollinger Bands Phase
                </div>
                <div className="text-[10px] text-[#555] mt-1 font-bold italic leading-tight">Volatility & Price Extremes</div>
              </td>
              {timeframes.map(tf => {
                const tfData = data[tf];
                if (!tfData) return <td key={tf} className="p-4 text-center text-[#333] border-l border-[#1a1a1a]">-</td>;
                const bb = tfData.latest?.bb;
                const price = tfData.latest?.price;
                if (!bb || !price) return <td key={tf} className="p-4 text-center text-[#333] border-l border-[#1a1a1a]">-</td>;
                
                const percentB = (price - bb.lower) / (bb.upper - bb.lower);
                let bbStage = "Neutral";
                let bbClass = "text-[#666]";
                if (percentB > 1) {
                  bbStage = "Overbought (Upper)";
                  bbClass = "text-rose-400 font-bold";
                } else if (percentB < 0) {
                  bbStage = "Oversold (Lower)";
                  bbClass = "text-emerald-400 font-bold";
                } else if (percentB > 0.8) {
                  bbStage = "Near Upper Band";
                  bbClass = "text-amber-400 font-medium";
                } else if (percentB < 0.2) {
                  bbStage = "Near Lower Band";
                  bbClass = "text-emerald-400 font-medium";
                }
                
                return (
                  <td key={tf} className="p-4 text-center border-l border-[#1a1a1a]">
                    <span className={cn("text-[10px] font-mono", bbClass)}>
                      {bbStage}
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
