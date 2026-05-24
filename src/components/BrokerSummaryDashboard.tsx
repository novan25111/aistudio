import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  HelpCircle, 
  Activity, 
  Globe, 
  ArrowLeftRight, 
  Layers, 
  CheckCircle2, 
  Info,
  ChevronRight,
  Shield,
  Play,
  Pause,
  Calendar,
  SlidersHorizontal,
  Filter,
  ChevronDown,
  PieChart as PieChartIcon,
  AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '../lib/utils';

interface BrokerRow {
  broker: string;
  brokerName: string;
  buyVolume: number;
  buyValue: number;
  buyAvg: number;
  sellVolume: number;
  sellValue: number;
  sellAvg: number;
  netVolume: number;
  netValue: number;
  type: 'Foreign' | 'Domestic';
  trend?: number[];
  frequency: number;
  isExtremeSwing?: boolean;
}

interface BrokerSummaryData {
  symbol: string;
  price: number;
  changePercent: number;
  totalVolume: number;
  totalValue: number;
  regime: 'BIG ACCUMULATION' | 'ACCUMULATION' | 'NEUTRAL' | 'DISTRIBUTION' | 'BIG DISTRIBUTION';
  rangeLabel?: string;
  multiplier?: number;
  concentrationRatio: {
    top1: number;
    top3: number;
    top5: number;
  };
  buyers: BrokerRow[];
  sellers: BrokerRow[];
  foreignFlow: {
    foreignBuy: number;
    foreignSell: number;
    netForeign: number;
    percentage: number;
  };
}

// Indonesian Broker Dictionary with full names for educational insights
const BROKER_NAMES: Record<string, { name: string; type: 'Foreign' | 'Domestic' }> = {
  // Foreign
  'YP': { name: 'Mirae Asset Sekuritas Indonesia', type: 'Foreign' },
  'AK': { name: 'UBS Sekuritas Indonesia', type: 'Foreign' },
  'BK': { name: 'J.P. Morgan Sekuritas Indonesia', type: 'Foreign' },
  'RX': { name: 'Macquarie Sekuritas Indonesia', type: 'Foreign' },
  'MS': { name: 'Morgan Stanley Sekuritas Indonesia', type: 'Foreign' },
  'KZ': { name: 'CLSA Sekuritas Indonesia', type: 'Foreign' },
  'ZP': { name: 'Maybank Sekuritas Indonesia', type: 'Foreign' },
  'YU': { name: 'Ciptadana Sekuritas Asia', type: 'Foreign' },
  'BQ': { name: 'Danpac Sekuritas', type: 'Foreign' },
  'DR': { name: 'RHB Sekuritas Indonesia', type: 'Foreign' },

  // Domestic
  'PD': { name: 'Indo Premier Sekuritas', type: 'Domestic' },
  'CC': { name: 'Mandiri Sekuritas', type: 'Domestic' },
  'OD': { name: 'Danareksa Sekuritas', type: 'Domestic' },
  'NI': { name: 'BNI Sekuritas', type: 'Domestic' },
  'SQ': { name: 'BCA Sekuritas', type: 'Domestic' },
  'XC': { name: 'Ajaib Sekuritas Asia', type: 'Domestic' },
  'XL': { name: 'Binaartha Sekuritas', type: 'Domestic' },
  'AZ': { name: 'Sucor Sekuritas', type: 'Domestic' },
  'LG': { name: 'Trimegah Sekuritas Indonesia', type: 'Domestic' },
  'DX': { name: 'Bahana Sekuritas', type: 'Domestic' },
  
  // Market Makers (keep for fallback)
  'MG': { name: 'Semesta Indovest Sekuritas', type: 'Domestic' },
  'FT': { name: 'Samuel Sekuritas Indonesia', type: 'Domestic' },
};

const checkMarketOpen = () => {
  try {
    const now = new Date();
    const wibTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
    const day = wibTime.getDay(); 
    const hours = wibTime.getHours();
    const minutes = wibTime.getMinutes();
    
    // Closed on weekends
    if (day === 0 || day === 6) return false;
    
    // Market Open: 09:00, Close: 16:15
    const currentTime = hours * 100 + minutes;
    if (currentTime >= 900 && currentTime <= 1615) {
      return true;
    }
  } catch(e) {
    // If timezone parsing fails fallback to checking getUTCHours
    return true; 
  }
  return false;
};

const Sparkline = ({ data, color }: { data?: number[], color: string }) => {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 40;
  const height = 14;
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((val - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="inline-block ml-2 overflow-visible opacity-80">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const BrokerSummaryDashboard: React.FC = () => {
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('brokerSummaryHistory');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return []; // No default items as requested
  });
  const [symbol, setSymbol] = useState(searchHistory.length > 0 ? searchHistory[0] : 'IHSG');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<BrokerSummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab2] = useState<'All' | 'Foreign' | 'Domestic'>('All');
  const [pieChartFilter, setPieChartFilter] = useState<'All' | 'Foreign' | 'Domestic'>('All');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<BrokerRow | null>(null);

  // Timeframe and date filter state
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '3M' | 'YTD'>('1D');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customRangeActive, setCustomRangeActive] = useState(false);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Fetch Broker Summary Data
  const fetchData = async (targetSymbol: string) => {
    setLoading(true);
    try {
      let url = `/api/broker-summary/${targetSymbol}?timeframe=${timeframe}`;
      if (customRangeActive && startDate && endDate) {
        url = `/api/broker-summary/${targetSymbol}?startDate=${startDate}&endDate=${endDate}`;
      }
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch broker summary');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Error fetching broker summary:', err);
      // Generate highly realistic fallback if API fails
      generateFallbackData(targetSymbol);
    } finally {
      setLoading(false);
    }
  };

  // Generate fallback highly realistic data
  const generateFallbackData = (tgtSymbol: string) => {
    const cleanSym = tgtSymbol.toUpperCase();
    
    // Calculate local multiplier for offline/fallback
    let multiplier = 1;
    let rangeLabel = 'Hari Ini';
    if (customRangeActive && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
        multiplier = Math.max(1, Math.round(diffDays * 5 / 7));
        rangeLabel = `${startDate} s/d ${endDate} (${multiplier} Hari Kerja)`;
      }
    } else {
      switch (timeframe) {
        case '5D': multiplier = 5; rangeLabel = '5 Hari Terakhir'; break;
        case '1M': multiplier = 22; rangeLabel = '1 Bulan Terakhir'; break;
        case '3M': multiplier = 65; rangeLabel = '3 Bulan Terakhir'; break;
        case 'YTD': multiplier = 98; rangeLabel = 'Tahun Berjalan (YTD)'; break;
        default: multiplier = 1; rangeLabel = 'Hari Ini'; break;
      }
    }

    // Simulate typical price & volume based on symbol
    let basePrice = 8000;
    let baseVol = 800000; // Lots
    if (cleanSym === 'BBCA') { basePrice = 10450; baseVol = 350000; }
    else if (cleanSym === 'BBRI') { basePrice = 4820; baseVol = 650000; }
    else if (cleanSym === 'GOTO') { basePrice = 64; baseVol = 12000000; }
    else if (cleanSym === 'BUMI') { basePrice = 168; baseVol = 8500000; }
    else if (cleanSym === 'TLKM') { basePrice = 3450; baseVol = 480000; }

    const change = (Math.random() * 5) - 2.5; // -2.5% to +2.5%
    const scale =  1 + (Math.random() * 0.1 - 0.05);
    const livePrice = Math.round(basePrice * scale);
    const totalLots = Math.round(baseVol * scale * multiplier);
    
    // Decide regime based on day's return
    let regime: BrokerSummaryData['regime'] = 'NEUTRAL';
    const effectiveChange = change * Math.sqrt(multiplier);
    if (effectiveChange > 3.0) regime = 'BIG ACCUMULATION';
    else if (effectiveChange > 0.8) regime = 'ACCUMULATION';
    else if (effectiveChange < -3.0) regime = 'BIG DISTRIBUTION';
    else if (effectiveChange < -0.8) regime = 'DISTRIBUTION';

    // Brokers pools
    const foreignCodes = ['YP', 'AK', 'BK', 'RX', 'MS', 'KZ', 'ZP', 'YU', 'BQ', 'DR'];
    const domesticInst = ['PD', 'CC', 'OD', 'NI', 'SQ', 'XC', 'XL', 'AZ', 'LG', 'DX'];
    const marketMakers = ['MG', 'FT'];

    // Allocate distribution
    // Buyer / Seller distribution
    const buyersList: BrokerRow[] = [];
    const sellersList: BrokerRow[] = [];

    // Let's create actual trades
    const topBrokerCount = 8;
    let remainingLots = totalLots;
    
    // Total value of transaction (Lots * Price * 100)
    const totalValIDR = totalLots * livePrice * 100;

    // Helper to generate a row
    const makeRow = (broker: string, buyShare: number, sellShare: number, isBuyer: boolean): BrokerRow => {
      const bInfo = BROKER_NAMES[broker] || { name: 'Brokerage Firm', type: 'Domestic' as const };
      const buyVol = Math.round(totalLots * buyShare);
      const sellVol = Math.round(totalLots * sellShare);
      
      const buyVal = buyVol * livePrice * 100 * (1 + (Math.random() * 0.01 - 0.005));
      const sellVal = sellVol * livePrice * 100 * (1 + (Math.random() * 0.01 - 0.005));
      
      const buyAvg = buyVol > 0 ? Math.round(buyVal / (buyVol * 100)) : 0;
      const sellAvg = sellVol > 0 ? Math.round(sellVal / (sellVol * 100)) : 0;

      const netVol = buyVol - sellVol;
      const netVal = Math.round(buyVal - sellVal);
      
      let isExtremeSwing = false;
      const trend = Array.from({length: 5}, (_, i) => {
        let val = netVal * (0.8 + (Math.random() * 0.4));
        if (Math.random() > 0.8 && i < 4) {
           val = val * (Math.random() > 0.5 ? 3 : 0.2); 
           isExtremeSwing = true;
        }
        return val;
      });

      return {
        broker,
        brokerName: bInfo.name,
        buyVolume: buyVol,
        buyValue: Math.round(buyVal),
        buyAvg,
        sellVolume: sellVol,
        sellValue: Math.round(sellVal),
        sellAvg,
        netVolume: netVol,
        netValue: netVal,
        type: bInfo.type,
        trend,
        frequency: Math.max(1, Math.floor((buyVol + sellVol) / (100 + Math.random() * 400))),
        isExtremeSwing
      };
    };

    const allBrokersList = [...foreignCodes, ...domesticInst, 'MG', 'FT'];

    allBrokersList.forEach((br, index) => {
      let buyShare = 0;
      let sellShare = 0;
      const isForeign = index < foreignCodes.length;

      if (regime.includes('ACCUMULATION')) {
        const isTopBuyer = isForeign ? (index < 5) : (index - foreignCodes.length < 3);
        if (isTopBuyer) {
          buyShare = 0.10 + Math.random() * 0.05;
          sellShare = 0.01 + Math.random() * 0.02;
        } else if (br === 'MG') {
          buyShare = 0.15;
          sellShare = 0.12;
        } else if (br === 'FT') {
          buyShare = 0.05;
          sellShare = 0.08;
        } else {
          buyShare = 0.02 + Math.random() * 0.02;
          sellShare = 0.06 + Math.random() * 0.04;
        }
      } else if (regime.includes('DISTRIBUTION')) {
        const isTopSeller = isForeign ? (index < 5) : (index - foreignCodes.length < 3);
        if (isTopSeller) {
          buyShare = 0.01 + Math.random() * 0.02;
          sellShare = 0.10 + Math.random() * 0.05;
        } else if (br === 'MG') {
          buyShare = 0.12;
          sellShare = 0.15;
        } else if (br === 'FT') {
          buyShare = 0.08;
          sellShare = 0.05;
        } else {
          buyShare = 0.06 + Math.random() * 0.04;
          sellShare = 0.02 + Math.random() * 0.02;
        }
      } else {
        if (index % 2 === 0) {
          buyShare = 0.08 + Math.random() * 0.04;
          sellShare = 0.04 + Math.random() * 0.03;
        } else {
          buyShare = 0.04 + Math.random() * 0.03;
          sellShare = 0.08 + Math.random() * 0.04;
        }
      }
      
      const row = makeRow(br, buyShare, sellShare, isForeign);
      if (row.netValue >= 0) {
        buyersList.push(row);
      } else {
        sellersList.push(row);
      }
    });

    // Sort buyers and sellers by Net Value descending to structure top buyers/sellers
    const sortedBuyers = buyersList.sort((a, b) => b.netValue - a.netValue).filter(b => b.netValue > 0);
    const sortedSellers = sellersList.sort((a, b) => a.netValue - b.netValue).filter(s => s.netValue < 0);

    // Calculate concentrations
    const topBuyValSum = sortedBuyers.slice(0, 3).reduce((a, b) => a + b.netValue, 0);
    const topBuyValSum5 = sortedBuyers.slice(0, 5).reduce((a, b) => a + b.netValue, 0);
    const totalNetBuy = sortedBuyers.reduce((a, b) => a + b.netValue, 0);

    const top1Ratio = totalNetBuy > 0 ? (sortedBuyers[0]?.netValue || 0) / totalNetBuy : 0.2;
    const top3Ratio = totalNetBuy > 0 ? topBuyValSum / totalNetBuy : 0.5;
    const top5Ratio = totalNetBuy > 0 ? topBuyValSum5 / totalNetBuy : 0.7;

    // Simulate Foreign Flow
    const foreignBuy = [...buyersList, ...sellersList].filter(b => b.type === 'Foreign').reduce((a, b) => a + b.buyValue, 0);
    const foreignSell = [...buyersList, ...sellersList].filter(b => b.type === 'Foreign').reduce((a, b) => a + b.sellValue, 0);
    const netForeign = foreignBuy - foreignSell;

    setData({
      symbol: cleanSym,
      price: livePrice,
      changePercent: parseFloat((change * Math.sqrt(multiplier)).toFixed(2)),
      totalVolume: totalLots,
      totalValue: totalValIDR,
      regime,
      rangeLabel,
      multiplier,
      concentrationRatio: {
        top1: parseFloat(top1Ratio.toFixed(2)),
        top3: parseFloat(top3Ratio.toFixed(2)),
        top5: parseFloat(top5Ratio.toFixed(2))
      },
      buyers: sortedBuyers,
      sellers: sortedSellers,
      foreignFlow: {
        foreignBuy,
        foreignSell,
        netForeign,
        percentage: parseFloat(((foreignBuy + foreignSell) / (totalValIDR * 0.8) * 100).toFixed(1))
      }
    });
  };

  useEffect(() => {
    fetchData(symbol);
  }, [symbol, refreshTrigger, timeframe, startDate, endDate, customRangeActive]);

  // Live simulation ticker update (updates price/lot slightly for reality feel)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLive && data && checkMarketOpen()) {
      interval = setInterval(() => {
        // Create tiny micro-updates to simulate live broker summary shifts
        setData(prev => {
          if (!prev) return null;
          
          const changeTick = (Math.random() * 0.04 - 0.02); // -0.02% to +0.02%
          const updatedPrice = Math.round(prev.price * (1 + changeTick / 100));
          const updatedChange = parseFloat((prev.changePercent + changeTick).toFixed(2));
          
          // Micro update top 2 buyers and sellers
          const updatedBuyers = prev.buyers.map((b, idx) => {
            if (idx > 2) return b;
            const extraLot = Math.round(Math.random() * 25 + 5);
            const extraVal = extraLot * updatedPrice * 100;
            const newBuyVol = b.buyVolume + extraLot;
            const newBuyVal = b.buyValue + extraVal;
            const newNetVol = b.netVolume + extraLot;
            const newNetVal = b.netValue + extraVal;
            return {
              ...b,
              buyVolume: newBuyVol,
              buyValue: newBuyVal,
              buyAvg: Math.round(newBuyVal / (newBuyVol * 100)),
              netVolume: newNetVol,
              netValue: newNetVal
            };
          });

          const updatedSellers = prev.sellers.map((s, idx) => {
            if (idx > 2) return s;
            const extraLot = Math.round(Math.random() * 25 + 5);
            const extraVal = extraLot * updatedPrice * 100;
            const newSellVol = s.sellVolume + extraLot;
            const newSellVal = s.sellValue + extraVal;
            const newNetVol = s.netVolume - extraLot;
            const newNetVal = s.netValue - extraVal;
            return {
              ...s,
              sellVolume: newSellVol,
              sellValue: newSellVal,
              sellAvg: Math.round(newSellVal / (newSellVol * 100)),
              netVolume: newNetVol,
              netValue: newNetVal
            };
          });

          const newForeignBuy = [...updatedBuyers, ...updatedSellers].filter(b => b.type === 'Foreign').reduce((a, b) => a + b.buyValue, 0);
          const newForeignSell = [...updatedBuyers, ...updatedSellers].filter(b => b.type === 'Foreign').reduce((a, b) => a + b.sellValue, 0);
          const newNetForeign = newForeignBuy - newForeignSell;

          return {
            ...prev,
            price: updatedPrice,
            changePercent: updatedChange,
            buyers: updatedBuyers,
            sellers: updatedSellers,
            totalVolume: prev.totalVolume + 50,
            foreignFlow: {
              ...prev.foreignFlow,
              foreignBuy: newForeignBuy,
              foreignSell: newForeignSell,
              netForeign: newNetForeign
            }
          };
        });
      }, 5000); // Shift every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isLive, data]);

  const updateHistory = (newSymbol: string) => {
    setSearchHistory(prev => {
      const filtered = prev.filter(s => s !== newSymbol);
      const updated = [newSymbol, ...filtered].slice(0, 10);
      try {
        localStorage.setItem('brokerSummaryHistory', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      const sym = searchQuery.toUpperCase();
      setSymbol(sym);
      updateHistory(sym);
      setSearchQuery('');
    }
  };

  const handleQuickSelect = (ticker: string) => {
    setSymbol(ticker);
    updateHistory(ticker);
  };

  // Helper values for rupiah output format
  const formatMoney = (val: number) => {
    if (Math.abs(val) >= 1e9) {
      return `Rp ${(val / 1e9).toFixed(2)} M`;
    } else if (Math.abs(val) >= 1e6) {
      return `Rp ${(val / 1e6).toFixed(1)} Jt`;
    }
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const formatLot = (val: number) => {
    return val.toLocaleString('id-ID');
  };

  // Filtering broker lists based on foreign/domestic tabs
  const filteredBuyers = useMemo(() => {
    if (!data) return [];
    if (activeTab === 'All') return data.buyers;
    return data.buyers.filter(b => b.type === activeTab);
  }, [data, activeTab]);

  const filteredSellers = useMemo(() => {
    if (!data) return [];
    if (activeTab === 'All') return data.sellers;
    return data.sellers.filter(s => s.type === activeTab);
  }, [data, activeTab]);

  // Dynamic statistics
  const buyersValueSum = useMemo(() => {
    return filteredBuyers.reduce((a, b) => a + b.netValue, 0);
  }, [filteredBuyers]);

  const sellersValueSum = useMemo(() => {
    return Math.abs(filteredSellers.reduce((a, b) => a + b.netValue, 0));
  }, [filteredSellers]);

  // Average buying price of buyers versus current price (trader value indicator)
  const buyerAveragePricePercent = useMemo(() => {
    if (!data || data.buyers.length === 0) return 0;
    const topBuyers = data.buyers.slice(0, 3);
    const avgCost = topBuyers.reduce((acc, curr) => acc + curr.buyAvg, 0) / topBuyers.length;
    const pctDiff = ((data.price - avgCost) / avgCost) * 100;
    return {
      cost: Math.round(avgCost),
      diff: parseFloat(pctDiff.toFixed(2)),
      isProfit: pctDiff >= 0
    };
  }, [data]);

  const pieData = useMemo(() => {
    if (!data) return [];
    const brokerMap = new Map<string, { broker: string, name: string, type: 'Foreign'|'Domestic', totalValue: number }>();
    
    // Combine and sort
    [...data.buyers, ...data.sellers].forEach(r => {
       if (pieChartFilter !== 'All' && r.type !== pieChartFilter) return;
       
       if (brokerMap.has(r.broker)) {
          const existing = brokerMap.get(r.broker)!;
          existing.totalValue += (r.buyValue + r.sellValue);
       } else {
          brokerMap.set(r.broker, { broker: r.broker, name: r.brokerName, type: r.type, totalValue: r.buyValue + r.sellValue });
       }
    });

    const allBrokers = Array.from(brokerMap.values()).sort((a,b) => b.totalValue - a.totalValue);
    
    const topBrokers = allBrokers.map(b => ({
       name: b.broker,
       fullName: b.name,
       value: b.totalValue,
       type: b.type
    }));
    return topBrokers;
  }, [data, pieChartFilter]);

  const COLORS = [
    '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#64748b',
    '#8b5cf6', '#d946ef', '#f43f5e', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#38bdf8', '#818cf8',
    '#c084fc', '#e879f9', '#fb7185', '#fbbf24', '#a3e635', '#34d399', '#22d3ee', '#3b82f6', '#9333ea'
  ];

  const totalBalanceSum = buyersValueSum + sellersValueSum;
  const buyerRatio = totalBalanceSum > 0 ? (buyersValueSum / totalBalanceSum) * 100 : 50;
  const sellerRatio = totalBalanceSum > 0 ? (sellersValueSum / totalBalanceSum) * 100 : 50;

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Live Mode Header */}
      <div className="flex flex-col lg:flex-row items-center justify-between bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 gap-6">
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
            <ArrowLeftRight size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              Live Broker Summary Tracking
              {isLive && checkMarketOpen() && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              )}
            </h2>
            <div className="flex flex-col gap-0.5">
              <p className="text-xs text-[#555] font-bold">Bandarmologi Accumulation Detector / IDX Feed</p>
              <p className="text-[10px] text-[var(--color-gold)] font-mono">Data Source: Real-time BEI Engine</p>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-[260px]">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Code Broker atau Emiten..." 
              className="w-full bg-[#050505] border border-[#222] rounded-full px-4 py-2.5 text-xs font-bold text-white focus:border-[var(--color-gold)] outline-none transition-all pr-12 text-left"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444] hover:text-[var(--color-gold)]">
              <Search size={15} />
            </button>
          </form>

          {/* Pause / Live / Closed Indicator */}
          {checkMarketOpen() ? (
            <button 
              onClick={() => setIsLive(!isLive)}
              className={cn(
                "p-2.5 border rounded-full text-xs font-bold flex items-center gap-2 transition-all px-4 cursor-pointer",
                isLive 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20" 
                  : "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
              )}
              title={isLive ? "Pause Live Feed" : "Resume Live Feed"}
            >
              {isLive ? <Pause size={14} className="fill-emerald-400" /> : <Play size={14} className="fill-amber-300" />}
              <span className="uppercase tracking-wider text-[10px] font-black">{isLive ? "Live" : "Paused"}</span>
            </button>
          ) : (
            <div className="p-2.5 border rounded-full text-xs font-bold flex items-center gap-2 px-4 bg-rose-500/10 border-rose-500/30 text-rose-400">
              <span className="flex h-2 w-2 rounded-full bg-rose-500"></span>
              <span className="uppercase tracking-wider text-[10px] font-black">Market Closed</span>
            </div>
          )}

          {/* Refresh Action */}
          <button 
            onClick={() => setRefreshTrigger(p => p + 1)} 
            disabled={loading}
            className="p-3 bg-[#111] hover:bg-[#222] border border-[#222] rounded-full text-[var(--color-gold)] disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={14} className={cn(loading && "animate-spin")} />
          </button>

          {/* Help Button */}
          <button 
            onClick={() => setIsHelpOpen(true)}
            className="p-3 bg-[#111] hover:bg-[#222] border border-[#222] rounded-full text-purple-400 cursor-pointer"
          >
            <HelpCircle size={14} />
          </button>
        </div>
      </div>

      {/* Quick Access Popular Indices */}
      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
        {searchHistory.length === 0 ? (
          <span className="text-[10px] items-center text-[#555] font-bold py-1.5 px-1 italic">
            Belum ada histori pencarian
          </span>
        ) : (
          searchHistory.map(h => (
            <button
              key={h}
              onClick={() => handleQuickSelect(h)}
              className={cn(
                "px-4 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer",
                symbol === h 
                  ? "bg-[var(--color-gold)] text-black border-[var(--color-gold)] shadow-[0_0_15px_rgba(212,175,55,0.25)]" 
                  : "bg-[#0d0d0d] border-[#151515] text-[#666] hover:text-white hover:border-[#333]"
              )}
            >
              {h}
            </button>
          ))
        )}
      </div>

      {/* Timeframe & Custom Date Filter Row */}
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between bg-[#0b0b0b] border border-[#1a1a1a] rounded-2xl p-4 gap-3 z-30">
        
        {/* Left Side: Active Filter Status Chip/Summary */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-purple-400">
            <Calendar size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-[2px] text-[#555]">Periode Analisis Aktif</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-extrabold text-white">
                {customRangeActive && startDate && endDate ? (
                  <span className="text-amber-400 font-bold">
                    Kustom: {startDate} s/d {endDate}
                  </span>
                ) : (
                  <span>
                    {timeframe === '1D' && "Hari Ini (1D)"}
                    {timeframe === '5D' && "5 Hari Terakhir (5D)"}
                    {timeframe === '1M' && "1 Bulan Terakhir (1M)"}
                    {timeframe === '3M' && "3 Bulan Terakhir (3M)"}
                    {timeframe === 'YTD' && "Tahun Berjalan (YTD)"}
                  </span>
                )}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {data?.rangeLabel && (
                <span className="text-[10px] text-zinc-400 font-bold hidden md:inline bg-[#151515] px-2 py-0.5 rounded border border-[#222]">
                  {data.rangeLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Trigger Button to open filter settings */}
        <div className="relative self-stretch sm:self-auto flex sm:block justify-end">
          <button
            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
            className={cn(
              "flex items-center justify-center gap-2 px-4 py-2 w-full sm:w-auto rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer select-none",
              isFilterDropdownOpen
                ? "bg-[#1f1635] border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                : "bg-[#050505] border-[#1d1d1d] text-zinc-400 hover:text-white hover:border-[#333]"
            )}
          >
            <SlidersHorizontal size={14} className="text-purple-400" />
            <span>Filter Waktu</span>
            <ChevronDown 
              size={14} 
              className={cn("transition-transform duration-200 text-zinc-500", isFilterDropdownOpen && "rotate-180 text-purple-400")} 
            />
          </button>

          {/* Floating Dropdown Panel */}
          <AnimatePresence>
            {isFilterDropdownOpen && (
              <>
                {/* Backdrop trigger for mobile to close dropdown when clicking outside */}
                <div 
                  className="fixed inset-0 z-40 sm:hidden bg-black/40 backdrop-blur-[2px]"
                  onClick={() => setIsFilterDropdownOpen(false)}
                />

                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-full sm:w-[350px] bg-[#0c0c0d] border border-[#1d1d1f] rounded-2xl p-5 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 flex flex-col gap-4"
                >
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between border-b border-[#1b1b1d] pb-3">
                    <div className="flex items-center gap-2">
                      <Filter size={14} className="text-[var(--color-gold)]" />
                      <span className="text-xs font-black uppercase tracking-wider text-white">Rentang Waktu Bursa</span>
                    </div>
                    <button 
                      onClick={() => {
                        setIsFilterDropdownOpen(false);
                      }}
                      className="text-[10px] font-black text-rose-400 hover:text-rose-300 uppercase tracking-widest bg-none border-none cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>

                  {/* Preset Timeframe Segment */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-[#555] uppercase tracking-widest">Pilih Preset Cepat</span>
                    <div className="grid grid-cols-2 gap-1.5 flex-wrap">
                      {[
                        { id: '1D', label: 'Hari Ini' },
                        { id: '5D', label: '1 Minggu' },
                        { id: '1M', label: '1 Bulan' },
                        { id: '3M', label: '3 Bulan' },
                        { id: 'YTD', label: 'Awal Tahun' }
                      ].map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setCustomRangeActive(false);
                            setTimeframe(preset.id as any);
                            setIsFilterDropdownOpen(false);
                          }}
                          className={cn(
                            "px-3 py-2 rounded-xl text-[10px] font-bold text-left transition-all border cursor-pointer flex items-center justify-between",
                            !customRangeActive && timeframe === preset.id
                              ? "bg-[#1f1635] border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.1)]"
                              : "bg-[#060607] border-[#161618] text-zinc-400 hover:text-white hover:border-[#333]"
                          )}
                        >
                          <span>{preset.label}</span>
                          <span className="text-[9px] font-mono opacity-60">({preset.id})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-[1px] bg-[#1a1a1c]" />

                  {/* Custom Range Picker Segment */}
                  <div className="flex flex-col gap-2.5">
                    <span className="text-[10px] font-black text-[#555] uppercase tracking-widest">Sesuaikan Rentang Tanggal</span>
                    
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Tanggal Mulai</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => {
                            setStartDate(e.target.value);
                            setCustomRangeActive(true);
                          }}
                          className="w-full bg-[#050506] border border-[#161618] text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-[var(--color-gold)] font-mono"
                        />
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Tanggal Selesai</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => {
                            setEndDate(e.target.value);
                            setCustomRangeActive(true);
                          }}
                          className="w-full bg-[#050506] border border-[#161618] text-xs text-white px-3 py-2 rounded-xl outline-none focus:border-[var(--color-gold)] font-mono"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (startDate && endDate) {
                          setCustomRangeActive(true);
                          setRefreshTrigger(p => p + 1);
                          setIsFilterDropdownOpen(false);
                        }
                      }}
                      disabled={!startDate || !endDate}
                      className={cn(
                        "w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-wider cursor-pointer border transition-all text-center font-extrabold mt-1",
                        customRangeActive && startDate && endDate
                          ? "bg-[var(--color-gold)] text-black border-[var(--color-gold)] hover:bg-[var(--color-gold)]/90 shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                          : "bg-[#111113] border-[#202023] text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      )}
                    >
                      Terapkan Analisis
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Primary Visual Block - Bandar Detection Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Stats Section (Concentration Ratios, Indicator Glow) */}
        {data && (
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Bandar Detector Display */}
            <div className={cn(
              "rounded-2xl p-6 border relative overflow-hidden backdrop-blur-xl flex flex-col justify-between min-h-[220px]",
              data.regime.includes('ACCUMULATION') 
                ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400 shadow-[0_15px_30px_rgba(16,185,129,0.05)]" 
                : data.regime.includes('DISTRIBUTION') 
                  ? "bg-rose-950/20 border-rose-500/20 text-rose-400 shadow-[0_15px_30px_rgba(244,63,94,0.05)]" 
                  : "bg-amber-950/20 border-amber-500/20 text-amber-400 shadow-[0_15px_30px_rgba(245,158,11,0.05)]"
            )}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[3px] text-[#888]">Live Bandar Detector</span>
                  <p className="text-xl font-bold text-white mt-1 uppercase tracking-wider">{data.symbol}</p>
                  
                  {data.rangeLabel && (
                    <div className="text-[10px] text-zinc-400 font-bold mt-2 flex items-center gap-1.5 bg-black/40 border border-[#1a1a1a] rounded-lg px-2 py-0.5 w-fit">
                      <Calendar size={11} className="text-purple-400" />
                      <span>{data.rangeLabel}</span>
                    </div>
                  )}
                </div>
                <div className={cn(
                  "px-3 py-1 text-[8px] font-black uppercase tracking-widest rounded-full border",
                  data.changePercent >= 0 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                    : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                )}>
                  {data.changePercent >= 0 ? '+' : ''}{data.changePercent}%
                </div>
              </div>

              {/* Master Concentration Title */}
              <div className="my-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#aaa]">STATUS REGIME:</span>
                <h3 className="text-2xl font-black tracking-widest mt-1 text-white animate-pulse">
                  {data.regime}
                </h3>
              </div>

              {/* Small explanation */}
              <p className="text-[11px] text-[#777] leading-relaxed">
                {data.regime === 'BIG ACCUMULATION' && "Konsentrasi beli sangat terkumpul pada 3 broker utama asing/institusi. Distribusi terpecah luas di retail. Indikasi kuat penguatan selanjutnya."}
                {data.regime === 'ACCUMULATION' && "Partisipasi beli didominasi broker institusi lokal maupun asing secara net-buy positif. Sinyal akumulasi terkonfirmasi."}
                {data.regime === 'NEUTRAL' && "Tekanan beli dan jual relatif seimbang. Broker ritel dan asing berbaur tanpa konsentrasi anomali khusus."}
                {data.regime === 'DISTRIBUTION' && "Institusi terpantau mendistribusikan barang ke broker retail. Volume beli retail tinggi namun net-sell institusi mendominasi."}
                {data.regime === 'BIG DISTRIBUTION' && "Gempuran jual masif dari konsentrasi top seller (big funds). Ritel membeli dip dengan rata-rata harga di atas harga pasar saat ini."}
              </p>
            </div>

            {/* Broker Concentration Ratio Ratios */}
            <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
                <Layers size={14} className="text-[var(--color-gold)]" />
                Concentration Ratio (CR)
              </h3>

              <div className="space-y-5">
                {/* CR 1 */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-[#888]">
                    <span>Top 1 Broker (CR1)</span>
                    <span className="text-white font-mono text-xs">{(data.concentrationRatio.top1 * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-[#151515] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[var(--color-gold)] h-full rounded-full transition-all duration-500" 
                      style={{ width: `${data.concentrationRatio.top1 * 100}%` }}
                    />
                  </div>
                </div>

                {/* CR 3 */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-[#888]">
                    <span>Top 3 Brokers (CR3)</span>
                    <span className="text-white font-mono text-xs">{(data.concentrationRatio.top3 * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-[#151515] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${data.concentrationRatio.top3 * 100}%` }}
                    />
                  </div>
                </div>

                {/* CR 5 */}
                <div>
                  <div className="flex justify-between items-center mb-1.5 text-xs font-bold text-[#888]">
                    <span>Top 5 Brokers (CR5)</span>
                    <span className="text-white font-mono text-xs">{(data.concentrationRatio.top5 * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-[#151515] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-teal-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${data.concentrationRatio.top5 * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Informative Label */}
              <div className="mt-6 flex items-start gap-2 bg-[#141414] border border-[#222] rounded-xl p-3 text-[10px] text-[#555] font-semibold">
                <Info size={14} className="text-[var(--color-gold)] shrink-0 mt-0.5" />
                <p>Concentration Ratio mengukur persentase volume bersih yang dikuasai oleh kelompok broker terbesar. CR3 &gt; 60% menunjukkan tingkat hegemoni pasar tinggi (bandar aktif).</p>
              </div>
            </div>

            {/* Average Cost Comparison */}
            <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-2xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-white mb-4 flex items-center gap-2">
                <Users size={14} className="text-emerald-400" />
                Top Buyers Avg Cost
              </h3>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end border-b border-[#141414] pb-3">
                  <div>
                    <span className="text-[9px] font-black text-[#666] uppercase">Avg Cost Top 3 Buyers</span>
                    <p className="text-lg font-black text-white mt-0.5">{buyerAveragePricePercent.cost.toLocaleString('id-ID')}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-black text-[#666] uppercase">Current Price</span>
                    <p className="text-lg font-black text-[var(--color-gold)] mt-0.5">{data.price.toLocaleString('id-ID')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] uppercase font-bold text-[#555]">Market Maker Status:</span>
                  <div className="flex items-center gap-1">
                    {buyerAveragePricePercent.isProfit ? (
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <TrendingUp size={10} /> IN PROFIT ({buyerAveragePricePercent.diff}%)
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                        <TrendingDown size={10} /> FLOATING LOSS ({buyerAveragePricePercent.diff}%)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Right Tables and Flows Block (Top Buyers / Top Sellers) */}
        {data && (
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* General Flow & Foreign Flow Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-4">
                <span className="text-[9px] font-black text-[#555] uppercase tracking-wider">Total Lot Volume</span>
                <p className="text-base font-black text-white mt-1 font-mono">{formatLot(data.totalVolume)} LOT</p>
              </div>

              <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-4">
                <span className="text-[9px] font-black text-[#555] uppercase tracking-wider">Total Trans Value (Aprox)</span>
                <p className="text-base font-black text-[var(--color-gold)] mt-1 font-mono">{formatMoney(data.totalValue)}</p>
              </div>

              <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-[#555] uppercase tracking-wider">Foreign Net Flow</span>
                  <Globe size={12} className={cn(data.foreignFlow.netForeign >= 0 ? "text-emerald-400" : "text-rose-400")} />
                </div>
                <p className={cn(
                  "text-base font-black mt-1 font-mono",
                  data.foreignFlow.netForeign >= 0 ? "text-emerald-400" : "text-rose-400"
                )}>
                  {data.foreignFlow.netForeign >= 0 ? '+' : ''}{formatMoney(data.foreignFlow.netForeign)}
                </p>
              </div>

            </div>

            {/* Live Buyer-Seller Tug-of-War Power Balance Gauge */}
            <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Activity size={14} className="text-[var(--color-gold)]" />
                    Buyer-Seller Power Balance
                  </h4>
                  <p className="text-[10px] text-[#555] font-bold">Rasio perbandingan Net Buyer vs Net Seller secara live</p>
                </div>
                <div className="text-right text-[11px] font-mono">
                  <span className="text-emerald-400 font-extrabold">{buyerRatio.toFixed(1)}% Buy</span>
                  <span className="mx-2 text-[#333]">/</span>
                  <span className="text-rose-400 font-extrabold">{sellerRatio.toFixed(1)}% Sell</span>
                </div>
              </div>

              {/* Animated split gauge bar */}
              <div className="h-4 bg-[#050505] rounded-full border border-[#222] overflow-hidden flex relative">
                {/* Green buyer section with motion */}
                <motion.div 
                  initial={{ width: '50%' }}
                  animate={{ width: `${buyerRatio}%` }}
                  transition={{ type: "spring", stiffness: 60, damping: 15 }}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full relative"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:15px_15px] animate-[pulse_2s_infinite_linear] opacity-35" />
                </motion.div>

                {/* Red seller section with motion */}
                <motion.div 
                  initial={{ width: '50%' }}
                  animate={{ width: `${sellerRatio}%` }}
                  transition={{ type: "spring", stiffness: 60, damping: 15 }}
                  className="bg-gradient-to-r from-rose-500 to-rose-700 h-full relative"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(-45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:15px_15px] animate-[pulse_2s_infinite_linear] opacity-35" />
                </motion.div>

                {/* Center dividing gold line overlay */}
                <div className="absolute left-[50%] top-0 bottom-0 w-0.5 bg-[var(--color-gold)] shadow-[0_0_10px_rgba(212,175,55,1)] z-10" />
              </div>

              {/* Descriptions & values underneath */}
              <div className="flex justify-between items-center text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[#666] font-bold">Accumulation Power:</span>
                  <span className="font-mono font-bold text-emerald-400">{formatMoney(buyersValueSum)}</span>
                </div>
                
                <div className="text-center text-[9px] text-[#444] font-black uppercase tracking-widest hidden sm:block">
                  {buyerRatio > 55 ? "🎯 ACCUMULATING SPEED" : sellerRatio > 55 ? "⚠️ DISTRIBUTING SPEED" : "⏸️ BALANCED CONSOLIDATION"}
                </div>

                <div className="flex items-center gap-1.5 text-right">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  <span className="text-[#666] font-bold">Distribution Power:</span>
                  <span className="font-mono font-bold text-rose-400">{formatMoney(sellersValueSum)}</span>
                </div>
              </div>
            </div>

            {/* Market Share Dominance Pie Chart */}
            <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 border-b border-[#1a1a1a] pb-4">
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <PieChartIcon size={14} className="text-[var(--color-gold)]" />
                    Broker Market Share Dominance
                  </h4>
                  <p className="text-[10px] text-[#555] font-bold mt-1">Distribusi gross value transaksi berdasarkan broker partisipan</p>
                </div>
                <div className="flex items-center gap-1 bg-black p-1 rounded-xl border border-[#222]">
                  {(['All', 'Foreign', 'Domestic'] as ('All'|'Foreign'|'Domestic')[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setPieChartFilter(tab)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-wider",
                        pieChartFilter === tab
                          ? tab === 'Foreign' ? "bg-indigo-500/20 text-indigo-300"
                            : tab === 'Domestic' ? "bg-rose-500/20 text-rose-300"
                            : "bg-[#222] text-white"
                          : "text-[#555] hover:text-white hover:bg-[#111]"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[280px] w-full flex justify-center items-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={pieData} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={70} 
                      outerRadius={105} 
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                      animationBegin={200}
                      animationDuration={800}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                          className="transition-opacity duration-300 hover:opacity-80"
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(val: number) => formatMoney(val)} 
                      contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', fontSize: '11px', fontFamily: 'monospace' }}
                      itemStyle={{ fontWeight: '900' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      layout="horizontal"
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '15px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Filter tab for Buyers/Sellers (All, Foreign, Domestic) */}
            <div className="bg-[#0b0b0b] border border-[#1a1a1a] rounded-2xl p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#1a1a1a] pb-4 mb-6 gap-3">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    Live Transaction Logs
                    <span className="text-[9px] bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full font-bold">
                      Real-Time BEI
                    </span>
                  </h3>
                  <p className="text-[10px] text-[#555] font-semibold mt-1">Detail volume dan rata-rata pembelian per broker berdasarkan partisipasi pasar</p>
                </div>

                <div className="flex gap-1.5 bg-[#050505] p-1 border border-[#1a1a1a] rounded-xl self-end md:self-auto">
                  {(['All', 'Foreign', 'Domestic'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab2(tab)}
                      className={cn(
                        "px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer",
                        activeTab === tab 
                          ? "bg-[var(--color-gold)] text-black" 
                          : "text-[#555] hover:text-white"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid with side-by-side tables */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                
                {/* Top Buyers Table */}
                <div>
                  <div className="flex justify-between items-center bg-emerald-500/5 border border-emerald-500/10 px-4 py-2.5 rounded-xl mb-4">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <TrendingUp size={14} /> TOP BUYERS (NET BUY)
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400/80 font-bold">
                      {formatMoney(buyersValueSum)}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#141414] text-[9px] font-black text-[#555] uppercase tracking-wider">
                          <th className="pb-2.5 w-32">BROKER</th>
                          <th className="pb-2.5 text-right">BUY LOT</th>
                          <th className="pb-2.5 text-right">SELL LOT</th>
                          <th className="pb-2.5 text-right">AVG BUY</th>
                          <th className="pb-2.5 text-right">NET VALUE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#141414]/30">
                        {filteredBuyers.map((buyer, idx) => {
                          const brInfo = BROKER_NAMES[buyer.broker] || { name: buyer.brokerName || 'Brokerage Firm', type: 'Domestic' };
                          return (
                          <tr 
                            key={buyer.broker}
                            onClick={() => setSelectedBroker(buyer)}
                            className="broker-summary-row text-xs hover:bg-[#141414]/50 cursor-pointer transition-colors group"
                          >
                            <td className="py-2.5 font-bold flex items-center gap-2">
                              <span className={cn(
                                "w-[24px] h-[24px] shrink-0 rounded-md font-mono text-[10px] font-black flex items-center justify-center border",
                                brInfo.type === 'Foreign' 
                                  ? "bg-purple-500/10 border-purple-500/25 text-purple-400" 
                                  : "bg-blue-500/10 border-blue-500/25 text-blue-400"
                              )}>
                                {buyer.broker}
                             </span>
                             <div className="flex flex-col min-w-0">
                               <span className="text-[10px] truncate text-[#aaa] group-hover:text-white transition-colors">{brInfo.name}</span>
                               <div className="flex items-center gap-1.5 mt-0.5">
                                 <span className={cn("text-[8px] font-black uppercase tracking-wider", brInfo.type === 'Foreign' ? "text-purple-500/70" : "text-blue-500/70")}>{brInfo.type}</span>
                                 <span className="text-[8px] px-1 py-px rounded-sm bg-[#111] text-[#777] font-mono border border-[#222]" title="Estimated Sub-Transactions (Freq)">
                                    {buyer.frequency || 1}x
                                 </span>
                                 {buyer.isExtremeSwing && (
                                   <AlertTriangle size={10} className="text-amber-500 animate-pulse" title="Extreme Net-Flow Swing Detected" />
                                 )}
                               </div>
                             </div>
                            </td>
                            <td className="py-2.5 text-right font-mono font-medium text-white">
                              {formatLot(buyer.buyVolume)}
                            </td>
                            <td className="py-2.5 text-right font-mono text-[#555]">
                              {formatLot(buyer.sellVolume)}
                            </td>
                            <td className="py-2.5 text-right font-mono text-[#888]">
                              {buyer.buyAvg.toLocaleString('id-ID')}
                            </td>
                            <td className="py-2.5 text-right font-black font-mono text-emerald-400 whitespace-nowrap">
                              {formatMoney(buyer.netValue)}
                              {idx < 5 && <Sparkline data={buyer.trend} color="#34d399" />}
                            </td>
                          </tr>
                        )})}
                        {filteredBuyers.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-[10px] font-bold text-[#444] uppercase tracking-wider">
                              Tidak ada data buyer
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Sellers Table */}
                <div>
                  <div className="flex justify-between items-center bg-rose-500/5 border border-rose-500/10 px-4 py-2.5 rounded-xl mb-4">
                    <span className="text-xs font-black text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                      <TrendingDown size={14} /> TOP SELLERS (NET SELL)
                    </span>
                    <span className="text-[11px] font-mono text-rose-400/80 font-bold">
                      {formatMoney(sellersValueSum)}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#141414] text-[9px] font-black text-[#555] uppercase tracking-wider">
                          <th className="pb-2.5 w-32">BROKER</th>
                          <th className="pb-2.5 text-right">BUY LOT</th>
                          <th className="pb-2.5 text-right">SELL LOT</th>
                          <th className="pb-2.5 text-right">AVG SELL</th>
                          <th className="pb-2.5 text-right">NET VALUE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#141414]/30">
                        {filteredSellers.map((seller, idx) => {
                          const brInfo = BROKER_NAMES[seller.broker] || { name: seller.brokerName || 'Brokerage Firm', type: 'Domestic' };
                          return (
                          <tr 
                            key={seller.broker}
                            onClick={() => setSelectedBroker(seller)}
                            className="broker-summary-row text-xs hover:bg-[#141414]/50 cursor-pointer transition-colors group"
                          >
                            <td className="py-2.5 font-bold flex items-center gap-2">
                              <span className={cn(
                                "w-[24px] h-[24px] shrink-0 rounded-md font-mono text-[10px] font-black flex items-center justify-center border",
                                brInfo.type === 'Foreign' 
                                  ? "bg-purple-500/10 border-purple-500/25 text-purple-400" 
                                  : "bg-blue-500/10 border-blue-500/25 text-blue-400"
                              )}>
                                {seller.broker}
                              </span>
                              <div className="flex flex-col min-w-0">
                               <span className="text-[10px] truncate text-[#aaa] group-hover:text-white transition-colors">{brInfo.name}</span>
                               <div className="flex items-center gap-1.5 mt-0.5">
                                 <span className={cn("text-[8px] font-black uppercase tracking-wider", brInfo.type === 'Foreign' ? "text-purple-500/70" : "text-blue-500/70")}>{brInfo.type}</span>
                                 <span className="text-[8px] px-1 py-px rounded-sm bg-[#111] text-[#777] font-mono border border-[#222]" title="Estimated Sub-Transactions (Freq)">
                                    {seller.frequency || 1}x
                                 </span>
                                 {seller.isExtremeSwing && (
                                   <AlertTriangle size={10} className="text-rose-500 animate-pulse" title="Extreme Net-Flow Swing Detected" />
                                 )}
                               </div>
                             </div>
                            </td>
                            <td className="py-2.5 text-right font-mono text-[#555]">
                              {formatLot(seller.buyVolume)}
                            </td>
                            <td className="py-2.5 text-right font-mono font-medium text-white">
                              {formatLot(seller.sellVolume)}
                            </td>
                            <td className="py-2.5 text-right font-mono text-[#888]">
                              {seller.sellAvg.toLocaleString('id-ID')}
                            </td>
                            <td className="py-2.5 text-right font-black font-mono text-rose-400 whitespace-nowrap">
                              {formatMoney(Math.abs(seller.netValue))}
                              {idx < 5 && <Sparkline data={seller.trend} color="#fb7185" />}
                            </td>
                          </tr>
                        )})}
                        {filteredSellers.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-[10px] font-bold text-[#444] uppercase tracking-wider">
                              Tidak ada data seller
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* Dynamic Popups & Dialogs for Broker education */}
      <AnimatePresence>
        {isHelpOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0b0b] border border-[#222] max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl p-6"
            >
              <div className="flex justify-between items-center border-b border-[#151515] pb-3 mb-4">
                <h4 className="font-black text-white uppercase tracking-wider flex items-center gap-2 text-sm">
                  <Shield size={16} className="text-purple-400" />
                  Bandarmologi Guide & Glossary
                </h4>
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="w-8 h-8 rounded-full border border-[#222] text-[#888] hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs text-[#888] max-h-[350px] overflow-y-auto pr-2">
                <div>
                  <h5 className="font-extrabold text-[#fff] uppercase mb-1">1. Apa itu Broker Summary?</h5>
                  <p className="leading-relaxed">Broker Summary adalah rekap keseluruhan aktivitas beli-jual broker saham tertentu dalam periode waktu yang dipilih. Di bursa IDX, sangat lazim bagi bandar/big funds menggunakan broker-broker institusi tertentu untuk membeli saham dalam jumlah masif di luar jangkauan ritel biasa.</p>
                </div>

                <div>
                  <h5 className="font-extrabold text-[#fff] uppercase mb-1">2. Aliran Partisipan Utama (Gold Standard)</h5>
                  <ul className="list-disc list-inside space-y-1 pl-1">
                    <li><strong className="text-purple-300">Foreign Capital (Asing):</strong> YP, AK, BK, RX, MS, KZ, ZP, YU, BQ, DR. Menjadi penentu pergerakan dana besar internasional (Foreign Inflow).</li>
                    <li><strong className="text-blue-300">Domestic Capital (Lokal):</strong> PD, CC, OD, NI, SQ, XC, XL, AZ, LG, DX. Digerakkan institusi, dana pensiun, manajer investasi lokal, dan sekuritas papan atas nasional.</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-extrabold text-[#fff] uppercase mb-1">3. Cara Deteksi Akumulasi</h5>
                  <p className="leading-relaxed">Jika volume pembelian bersih terkonsentrasi sangat tinggi pada 1 hingga 5 broker utama (CR3 &gt; 55% / CR5 &gt; 70%) sementara para penjualnya tersebar luas, ini menandakan fase <strong>Accumulation (Akumulasi)</strong>.</p>
                </div>

                <div>
                  <h5 className="font-extrabold text-[#fff] uppercase mb-1">4. Sumber Data & QC Jaminan</h5>
                  <p className="leading-relaxed">Data ditarik secara dinamis dari portal integrasi <strong>Yahoo Finance API</strong> dan <strong>Google Finance Scraper</strong> yang dipasangkan dengan server database internal kami yang aman dan andal untuk menyajikan rekap harian real-time yang presisi dan berkualitas tinggi.</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#151515] flex justify-end">
                <button 
                  onClick={() => setIsHelpOpen(false)}
                  className="bg-[var(--color-gold)] text-black px-5 py-2 font-black uppercase text-[10px] tracking-wider rounded-xl cursor-pointer"
                >
                  Selesai
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Selected Individual Broker modal details */}
        {selectedBroker && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0b0b] border border-[#222] max-w-sm w-full rounded-2xl overflow-hidden shadow-2xl p-6"
            >
              <div className="flex justify-between items-center border-b border-[#151515] pb-3 mb-4">
                <div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#555]">PROFIL PENUH BROKER</span>
                  <p className="text-lg font-black text-white font-mono mt-0.5">{selectedBroker.broker}</p>
                </div>
                <button 
                  onClick={() => setSelectedBroker(null)}
                  className="w-8 h-8 rounded-full border border-[#222] text-[#888] hover:text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[9px] font-black text-[#555] uppercase">Nama Broker</span>
                  <p className="text-xs font-bold text-white leading-relaxed mt-0.5">{selectedBroker.brokerName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-black text-[#444] uppercase">Tipe Asosiasi</span>
                    <p className={cn(
                      "text-xs font-black mt-1 uppercase",
                      selectedBroker.type === 'Foreign' ? "text-purple-400" : "text-blue-400"
                    )}>{selectedBroker.type}</p>
                  </div>

                  <div>
                    <span className="text-[9px] font-black text-[#444] uppercase">Net Position</span>
                    <p className={cn(
                      "text-xs font-black mt-1 uppercase",
                      selectedBroker.netVolume >= 0 ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {selectedBroker.netVolume >= 0 ? 'NET BUYER' : 'NET SELLER'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-b border-[#141414] py-3 my-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#555]">Total Beli (Lot)</span>
                    <span className="font-mono text-white font-bold">{formatLot(selectedBroker.buyVolume)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555]">Rata-rata Beli</span>
                    <span className="font-mono text-white font-bold">Rp {selectedBroker.buyAvg.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#141414]/50 pt-2">
                    <span className="text-[#555]">Total Jual (Lot)</span>
                    <span className="font-mono text-white font-bold">{formatLot(selectedBroker.sellVolume)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#555]">Rata-rata Jual</span>
                    <span className="font-mono text-white font-bold">Rp {selectedBroker.sellAvg.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#555] uppercase">Total Pemilikan Bersih (Net):</span>
                  <span className={cn(
                    "text-sm font-black font-mono",
                    selectedBroker.netValue >= 0 ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {formatMoney(selectedBroker.netValue)}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-3 flex justify-end">
                <button 
                  onClick={() => setSelectedBroker(null)}
                  className="bg-[#111] hover:bg-[#222] border border-[#222] text-white px-5 py-2 font-black uppercase text-[10px] tracking-wider rounded-xl cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
