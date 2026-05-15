/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  LayoutDashboard,
  PieChart,
  Newspaper,
  ShieldCheck,
  Zap,
  Building2,
  Leaf,
  ShoppingCart,
  Cpu,
  ChevronRight,
  Search,
  Bell,
  Calendar,
  Box,
  Factory,
  Car,
  HeartPulse,
  Home,
  Truck,
  Landmark,
  MapPin,
  Globe2,
  Users,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import {
  MarketData,
  SectorPerformance,
  RecommendedStock,
  NewsItem,
  CorporateEvent,
} from "./types";
import {
  SymbolOverview,
  AdvancedRealTimeChart,
} from "react-ts-tradingview-widgets";

// Mock data for May 12, 2026
const MOCK_CORPORATE_EVENTS: CorporateEvent[] = [
  {
    id: "1",
    symbol: "BBCA",
    type: "RUPS Tahunan",
    date: "15 Mei 2026",
    desc: "Persetujuan Laporan Tahunan dan Alokasi Laba Bersih.",
  },
  {
    id: "2",
    symbol: "GOTO",
    type: "Earnings",
    date: "18 Mei 2026",
    desc: "Rilis Kinerja Kuartal I 2026.",
  },
  {
    id: "3",
    symbol: "BREN",
    type: "Stock Split",
    date: "21 Mei 2026",
    desc: "Rasio Pemecahan Saham 1:5.",
  },
  {
    id: "4",
    symbol: "TLKM",
    type: "Dividen",
    date: "25 Mei 2026",
    desc: "Cum Date dividen tunai tahun buku 2025.",
  },
];

const MOCK_MARKET_DATA: MarketData = {
  index: 7421.32,
  change: 12.45,
  changePercent: 0.17,
  lastUpdate: "12 Mei 2026, 16:00 WIB",
  history: [
    { time: "09:00", value: 7408 },
    { time: "10:00", value: 7415 },
    { time: "11:00", value: 7430 },
    { time: "12:00", value: 7428 },
    { time: "13:30", value: 7412 },
    { time: "14:30", value: 7418 },
    { time: "15:30", value: 7425 },
    { time: "16:00", value: 7421.32 },
  ],
};

const SECTOR_BASE_DATA = [
  { name: "Energi (Energy)", code: "Energi", icon: "Zap", marketIndex: "IDX ENERGY" },
  { name: "Barang Baku (Basic Materials)", code: "Barang Baku", icon: "Box", marketIndex: "IDX BASIC" },
  {
    name: "Perindustrian (Industrials)",
    code: "Perindustrian",
    icon: "Factory",
    marketIndex: "IDX INDUST",
  },
  {
    name: "Barang Konsumen Primer (Consumer Non-Cyclicals)",
    code: "Konsumer Primer",
    icon: "ShoppingCart",
    marketIndex: "IDX NONCYC",
  },
  {
    name: "Barang Konsumen Non-Primer (Consumer Cyclicals)",
    code: "Konsumer Non-Primer",
    icon: "Car",
    marketIndex: "IDX CYCLIC",
  },
  { name: "Kesehatan (Healthcare)", code: "Kesehatan", icon: "HeartPulse", marketIndex: "IDX HEALTH" },
  { name: "Keuangan (Financials)", code: "Keuangan", icon: "Building2", marketIndex: "IDX FINANCE" },
  {
    name: "Properti & Real Estat (Properties & Real Estate)",
    code: "Properti",
    icon: "Home",
    marketIndex: "IDX PROPERT",
  },
  { name: "Teknologi (Technology)", code: "Teknologi", icon: "Cpu", marketIndex: "IDX TECHNO" },
  {
    name: "Infrastruktur (Infrastructures)",
    code: "Infrastruktur",
    icon: "ShieldCheck",
    marketIndex: "IDX INFRA",
  },
  {
    name: "Transportasi & Logistik (Transportation & Logistics)",
    code: "Logistik",
    icon: "Truck",
    marketIndex: "IDX TRANS",
  },
];

interface MacroVariable {
  deltaPercentage: number;
  macroWeight: number;
  emitenBeta: number;
}

const CONFIDENCE_THRESHOLD = 0.65;
const TEXT_WEIGHT = 0.5;
const MACRO_WEIGHT = 0.5;
const TANH_SCALAR = 0.2;

function calculateFinalScore(
  newsData: NewsItem[],
  macroData: MacroVariable[],
  netForeignFlowBillion: number,
  actualDelta: number
): number {
  // TAHAP 1: Engine Sentimen Teks
  let totalTextImpact = 0;
  for (const news of newsData) {
    let conf = news.confidence ?? 0.8;
    if (conf < CONFIDENCE_THRESHOLD) continue;

    let nlpScore = news.sNlp ?? 0;
    let diff = (news.impactScore ?? 50) - 50;
    if (nlpScore === 0) nlpScore = diff / 50;

    let eventScore =
      nlpScore *
      Math.abs(news.rEmiten ?? 0.5) *
      (news.nEvent ?? 0.8) *
      (news.wType ?? 1.0);
    let timeDecayFactor = Math.pow(
      0.5,
      (news.ageHours ?? 0) / Math.abs(news.hType ?? 24),
    );

    totalTextImpact += eventScore * timeDecayFactor;
  }

  // TAHAP 2: Engine Makroekonomi
  let totalMacroImpact = 0;
  for (const macro of macroData) {
    totalMacroImpact +=
      macro.deltaPercentage * macro.macroWeight * macro.emitenBeta;
  }

  // TAHAP 3: Validasi Institusi & Market Realita
  const preAlpha =
    TEXT_WEIGHT * totalTextImpact + MACRO_WEIGHT * totalMacroImpact;

  let flowMultiplier = 0.8;
  if (Math.abs(netForeignFlowBillion) >= 50) {
    const flowDirection = netForeignFlowBillion > 0 ? 1 : -1;
    const alphaDirection = preAlpha > 0 ? 1 : preAlpha < 0 ? -1 : 0;

    // Konfirmasi
    if (flowDirection === alphaDirection) flowMultiplier = 1.5;
    // Divergensi
    else flowMultiplier = 0.3;
  }

  // TAHAP 4: Menggabungkan Market Momentum (Actual Price Change)
  // actualDelta represents percentage change (-2.5%, +3.1%, etc.)
  // We amplify it to strongly impact the score (live reflection)
  let momentumAlpha = actualDelta * 2.5; 
  
  // TAHAP 5: Persamaan Agregasi Akhir & Normalisasi
  const totalAlpha = (preAlpha * flowMultiplier) + momentumAlpha;
  const finalScore = 50 + 50 * Math.tanh(TANH_SCALAR * totalAlpha);

  return Math.round(finalScore * 100) / 100;
}

import { INITIAL_RECOMMENDED_STOCKS } from "./mockData";

const MOCK_NEWS_DATA: NewsItem[] = [
  {
    id: "n1",
    title: "Suku bunga Fed diprediksi tetap stabil hingga Q3-2026.",
    source: "Reuters",
    sourceType: "Media Global",
    url: "https://www.reuters.com/",
    summary:
      "Sejumlah analis memproyeksikan Bank Sentral Amerika Serikat (The Fed) akan menahan tingkat suku bunga acuannya setidaknya hingga kuartal ketiga tahun 2026. Hal ini didasari oleh data inflasi yang mulai melandai namun pasar tenaga kerja masih terbilang ketat. Dampaknya, Bank Indonesia (BI) kemungkinan besar juga akan mempertahankan BI Rate untuk menjaga stabilitas nilai tukar Rupiah dan menarik aliran modal asing.",
    date: "13 Mei 2026, 08:30 WIB",
    category: "international",
    impactType: "Makro",
    impactScore: 90,
    impactedSectors: ["Keuangan", "Teknologi"],
  },
  {
    id: "n2",
    title: "BBCA Jadwalkan Pembagian Dividen Tunai Final Rp 150/Saham.",
    source: "KSEI",
    sourceType: "Otoritas",
    url: "https://www.ksei.co.id/",
    summary:
      "PT Bank Central Asia Tbk (BBCA) menjadwalkan pembagian dividen tunai tahun buku 2025. Cum dividen di pasar reguler ditetapkan minggu depan, menjadi pendorong sentimen bullish pada saham-saham perbankan big caps.",
    date: "13 Mei 2026, 09:15 WIB",
    category: "local",
    impactType: "Emiten",
    impactScore: 95,
    impactedSectors: ["Keuangan"],
  },
  {
    id: "n3",
    title: "Hilirisasi nikel terus genjot surplus neraca perdagangan RI.",
    source: "CNBC Indonesia",
    sourceType: "Media Lokal",
    url: "https://www.cnbcindonesia.com/",
    summary:
      "Kebijakan hilirisasi nikel terus menunjukkan hasil positif bagi neraca perdagangan Indonesia. Laporan terbaru menunjukkan ekspor produk turunan nikel seperti feronikel dan baterai EV meningkat 25% year-on-year. Pemerintah berkomitmen memperluas program ini.",
    date: "12 Mei 2026, 14:15 WIB",
    category: "local",
    impactType: "Sektoral",
    impactScore: 85,
    impactedSectors: ["Sektor Tambang", "Industri Dasar"],
  },
  {
    id: "n4",
    title: "Antisipasi Lonjakan Volume Transaksi E-Commerce Kuartal II.",
    source: "Stockbit Stream",
    sourceType: "Sentimen Komunitas",
    url: "https://stockbit.com/",
    summary:
      "Banyak trader ritel memprediksi lonjakan laba pada emiten logistik dan teknologi berbasis e-commerce berkat event diskon tengah tahun. Sentimen di forum komunitas saat ini terpantau Net Bullish.",
    date: "13 Mei 2026, 07:45 WIB",
    category: "local",
    impactType: "Sektoral",
    impactScore: 65,
    impactedSectors: ["Teknologi", "Logistik"],
  },
  {
    id: "n5",
    title: "Data NFP Melemah, Harga Minyak WTI Kembali Terkoreksi.",
    source: "Bloomberg",
    sourceType: "Media Global",
    url: "https://www.bloomberg.com/",
    summary:
      "Pasca rilis data Non-Farm Payroll AS yang lebih rendah dari perkiraan, pelaku pasar menurunkan proyeksi permintaan minyak global, menekan harga WTI di bawah level support jangka pendek.",
    date: "12 Mei 2026, 21:00 WIB",
    category: "international",
    impactType: "Makro",
    impactScore: 88,
    impactedSectors: ["Energi"],
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRefreshingNews, setIsRefreshingNews] = useState(false);
  const [macroRefreshKey, setMacroRefreshKey] = useState(0);
  const [sectorMarketData, setSectorMarketData] = useState<
    Record<string, { volume: number; changePercent: number; price: number }>
  >({});
  const [macroMarketData, setMacroMarketData] = useState<
    Record<string, { changePercent: number; price: number }>
  >({});
  const [selectedStock, setSelectedStock] = useState<RecommendedStock | null>(
    null,
  );
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const [stocks, setStocks] = useState<RecommendedStock[]>(
    INITIAL_RECOMMENDED_STOCKS,
  );
  const [newsData, setNewsData] = useState<NewsItem[]>(MOCK_NEWS_DATA);
  const [tickerData, setTickerData] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState("Semua");
  const [selectedNewsType, setSelectedNewsType] = useState("Semua");
  const [fearGreedIndex, setFearGreedIndex] = useState(50);

  const sectorScores = useMemo(() => {
    // We use macroRefreshKey just to trigger a pseudo-random regeneration when refreshed
    // Normally this would be a real fetch to a backend trading API
    const getPseudoRandom = (seed: string) => {
      let hash = 0;
      for (let i = 0; i < seed.length; i++)
        hash = (Math.imul(31, hash) + seed.charCodeAt(i)) | 0;
      return (Math.sin(hash * (macroRefreshKey + 1)) * 10000) % 1;
    };

    return SECTOR_BASE_DATA.map((sector) => {
      const sectorNews = newsData.filter((n) =>
        n.impactedSectors?.some((s) =>
          s.toLowerCase().includes(sector.code.toLowerCase()),
        ),
      );

      const realMarketData = sectorMarketData[sector.code];
      const actualDelta = realMarketData
        ? realMarketData.changePercent
        : (getPseudoRandom(sector.code + "m1") - 0.5) * 2;

      // Simulasi Order Flow Asing vs Domestik dari data Volume Finance API
      const volume =
        realMarketData?.volume ||
        Math.abs(getPseudoRandom(sector.code + "v")) * 50000000;
      const price =
        realMarketData?.price ||
        Math.abs(getPseudoRandom(sector.code + "p")) * 5000 + 500;

      // Asing 30%-70% dari total transaksi
      const foreignRatio =
        0.3 + Math.abs(getPseudoRandom(sector.code + "fr")) * 0.4;
      const domesticRatio = 1 - foreignRatio;

      // Tekanan beli berbanding lurus dengan pergerakan harga
      const buyPressure =
        actualDelta > 0
          ? 0.55 + Math.abs(getPseudoRandom(sector.code + "bp")) * 0.2
          : actualDelta < 0
            ? 0.25 + Math.abs(getPseudoRandom(sector.code + "bp")) * 0.2
            : 0.5;

      const foreignVolume = volume * foreignRatio;
      const domesticVolume = volume * domesticRatio;

      const foreignBuy = foreignVolume * buyPressure;
      const foreignSell = foreignVolume * (1 - buyPressure);
      const domesticBuy = domesticVolume * buyPressure;
      const domesticSell = domesticVolume * (1 - buyPressure);

      // Menghitung delta flow dalam bentuk volume saham
      const netForeignFlowVol = foreignBuy - foreignSell;
      const netDomesticFlowVol = domesticBuy - domesticSell;

      // Konversi ke Nilai Rupiah (Miliar) = (Volume * Harga) / 1 Miliar
      const netForeignFlowBillion = (netForeignFlowVol * price) / 1000000000;
      const netDomesticFlowBillion = (netDomesticFlowVol * price) / 1000000000;

      // Use real macro data retrieved from backend
      // Each sector might have different sensitivities (Beta) to different macro variables
      const buildMacroVariables = (): MacroVariable[] => {
        const map = [
          { key: "IHSG", weight: 1.0, wM: 1.2 },
          { key: "USDIDR", weight: 0.8, wM: 0.9 },
          { key: "GOLD", weight: 0.5, wM: 0.6 },
          { key: "OIL", weight: 0.6, wM: 0.7 },
          { key: "COAL", weight: 0.6, wM: 0.7 },
        ];

        return map.map((m) => {
          const macroData = macroMarketData[m.key];
          const dp = macroData
            ? macroData.changePercent
            : (getPseudoRandom(m.key) - 0.5) * 2;
          const beta = (getPseudoRandom(sector.code + m.key + "b") - 0.5) * 2;
          return {
            deltaPercentage: dp,
            macroWeight: m.wM,
            emitenBeta: beta,
          };
        });
      };

      const score = calculateFinalScore(
        sectorNews,
        buildMacroVariables(),
        netForeignFlowBillion,
        actualDelta
      );

      let outlook: "Buy" | "Sell" | "Neutral" = "Neutral";
      if (score >= 60) outlook = "Buy";
      else if (score <= 40) outlook = "Sell";

      const currentPrice = realMarketData?.price || 0;
      const currentChangePercent = realMarketData?.changePercent || 0;
      let prevPrice = 0;
      let marketChangeValue = 0;

      if (currentPrice !== 0) {
        prevPrice = currentPrice / (1 + currentChangePercent / 100);
        marketChangeValue = currentPrice - prevPrice;
      }

      return {
        ...sector,
        change: Number(((score - 50) / 10).toFixed(2)),
        volume: realMarketData?.volume || 0,
        price: currentPrice,
        marketChangePercent: currentChangePercent,
        marketChangeValue: marketChangeValue,
        prevPrice: prevPrice,
        color:
          outlook === "Buy"
            ? "#10b981"
            : outlook === "Sell"
              ? "#ef4444"
              : "#6b7280",
        outlook,
        probability: score,
      };
    }).sort((a, b) => b.probability - a.probability);
  }, [newsData, macroRefreshKey, sectorMarketData, macroMarketData]);

  const filteredNewsList = useMemo(() => {
    let filtered = [...newsData];
    if (selectedNewsType !== "Semua") {
      filtered = filtered.filter((n) => n.sourceType === selectedNewsType);
    }
    // They are already sorted chronologically by the backend (by pubDate).
    // We maintain that order rather than sorting by impact score.
    return filtered;
  }, [newsData, selectedNewsType]);

  useEffect(() => {
    let score = 50;

    // Sentiment from stocks change
    const avgChange =
      stocks.reduce((acc, stock) => acc + stock.change, 0) /
      (stocks.length || 1);
    score += avgChange * 5;

    // Sentiment from news
    let newsScore = 0;
    const positiveWords = [
      "naik",
      "laba",
      "profit",
      "growth",
      "rebound",
      "bullish",
      "tinggi",
      "untung",
      "positif",
      "menguat",
      "surplus",
    ];
    const negativeWords = [
      "turun",
      "rugi",
      "loss",
      "anjlok",
      "bearish",
      "rendah",
      "kritis",
      "negatif",
      "inflasi",
      "tekanan",
    ];

    newsData.forEach((news) => {
      const text = (news.title + " " + news.summary).toLowerCase();
      positiveWords.forEach((word) => {
        if (text.includes(word)) newsScore += 1;
      });
      negativeWords.forEach((word) => {
        if (text.includes(word)) newsScore -= 1.5;
      });
    });

    score += newsScore;

    score = Math.max(0, Math.min(100, Math.round(score)));
    setFearGreedIndex(score);
  }, [stocks, newsData]);

  let fgLabel = "Neutral";
  let fgColor = "text-yellow-500";
  let fgGradient =
    "linear-gradient(to right, #ef4444, #f97316, #eab308, #22c55e)";
  if (fearGreedIndex >= 75) {
    fgLabel = "Extreme Greed";
    fgColor = "text-green-500";
  } else if (fearGreedIndex >= 55) {
    fgLabel = "Greed";
    fgColor = "text-green-400";
  } else if (fearGreedIndex <= 25) {
    fgLabel = "Extreme Fear";
    fgColor = "text-red-500";
  } else if (fearGreedIndex <= 45) {
    fgLabel = "Fear";
    fgColor = "text-orange-500";
  }

  const filteredStocks = useMemo(() => {
    if (selectedSector === "Semua") return stocks;
    return stocks.filter((s) => s.sector === selectedSector);
  }, [stocks, selectedSector]);

  const fetchLivePrices = async () => {
    try {
      const updatedStocks = await Promise.all(
        stocks.map(async (stock) => {
          try {
            const res = await fetch(`/api/quote/${stock.symbol}`);
            if (!res.ok) return stock;
            const data = await res.json();
            const changePercent =
              ((data.price - data.previousClose) / data.previousClose) * 100;
            return {
              ...stock,
              price: data.price,
              change: Number(changePercent.toFixed(2)) || stock.change,
            };
          } catch (e) {
            return stock;
          }
        }),
      );
      setStocks(updatedStocks);
      // Also update selectedStock if it is open
      if (selectedStock) {
        const updatedSelected = updatedStocks.find(
          (s) => s.symbol === selectedStock.symbol,
        );
        if (updatedSelected) setSelectedStock(updatedSelected);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTickerData = async () => {
    try {
      const res = await fetch('/api/market-ticker');
      if (res.ok) {
        const data = await res.json();
        setTickerData(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSectorMarketData = async () => {
    try {
      const res = await fetch("/api/sectors/market-data");
      if (res.ok) {
        const data = await res.json();
        setSectorMarketData(data.sectors || {});
        setMacroMarketData(data.macros || {});
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Try to fetch on mount
    fetchLivePrices();
    fetchNews();
    fetchSectorMarketData();
    fetchTickerData();

    // Polling interval (10 seconds)
    const intervalId = setInterval(() => {
      fetchSectorMarketData();
      fetchTickerData();
      fetchLivePrices();
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const fetchNews = async () => {
    setIsRefreshingNews(true);
    try {
      const res = await fetch("/api/news");
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setNewsData(data);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshingNews(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLivePrices();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="min-h-screen bg-neutral-50 font-sans text-neutral-900 selection:bg-blue-100 dark:bg-neutral-950 dark:text-neutral-100">
      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedStock && (
          <StockDetailModal
            stock={selectedStock}
            onClose={() => setSelectedStock(null)}
          />
        )}
        {selectedNews && (
          <NewsDetailModal
            news={selectedNews}
            onClose={() => setSelectedNews(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="z-50 border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
              <TrendingUp size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Research CNHL
              </h1>
              <p className="hidden text-xs text-neutral-500 sm:block dark:text-neutral-400">
                Insight Pasar Saham Indonesia
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="hidden rounded-full p-2 text-neutral-500 hover:bg-neutral-100 lg:block dark:text-neutral-400 dark:hover:bg-neutral-900">
              <Search size={20} />
            </button>
            <button className="relative rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900">
              <Bell size={20} />
              <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-neutral-950"></span>
            </button>
            <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-800"></div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 overflow-hidden rounded-full bg-neutral-200 ring-2 ring-blue-500/10">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Investor1"
                  alt="User Avatar"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="hidden text-sm font-medium lg:block">
                C. Novan
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Ticker Tape (Scrolls away with header) */}
      {tickerData && tickerData.length > 0 && (
        <div className="w-full bg-[#0a0a0a] border-b border-neutral-800 overflow-hidden flex">
          <div className="flex whitespace-nowrap py-2 items-center animate-marquee hover:[animation-play-state:paused]">
             {/* Duplicate the array twice for smooth infinite scrolling */}
             {[...tickerData, ...tickerData, ...tickerData, ...tickerData].map((item, i) => (
                <div key={i} className="flex items-center mx-4 gap-2.5">
                   <span className="text-neutral-400 text-xs font-semibold tracking-wider uppercase">{item.label}</span>
                   <span className="font-bold text-white text-sm">{item.value}</span>
                   {item.change !== 0 && (
                     <span className={cn("text-xs font-bold flex items-center gap-0.5", item.change > 0 ? "text-emerald-400" : "text-red-400")}>
                        {item.change > 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
                     </span>
                   )}
                </div>
             ))}
          </div>
        </div>
      )}

      {/* Sticky Navigation Tabs */}
      <div className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/80 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-950/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div
            className="flex w-full overflow-x-auto py-2 sm:py-3"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="flex w-full space-x-1 rounded-lg bg-neutral-100/80 p-1 dark:bg-neutral-900/80 shadow-inner">
              {["Dashboard", "News", "Rekomendasi Saham"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "whitespace-nowrap flex-1 rounded-md px-4 py-1.5 sm:py-2 text-sm font-semibold transition-all",
                    activeTab === tab
                      ? "bg-white text-neutral-900 shadow-sm ring-1 ring-black/5 dark:bg-neutral-800 dark:text-white dark:ring-white/10"
                      : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-neutral-800/50",
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className={cn("mx-auto py-4 sm:py-6", activeTab === "News" ? "w-full px-4 sm:px-6 lg:px-8" : "max-w-7xl px-4 sm:px-6 lg:px-8")}>
        {activeTab === "Dashboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Market Banner */}
            <section className="mb-6 sm:mb-8 overflow-hidden rounded-[2rem] bg-neutral-900 p-6 sm:p-8 text-white shadow-2xl transition-all duration-500 hover:shadow-blue-500/10 dark:bg-neutral-900/50">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div className="space-y-4 w-full lg:w-2/3">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-orange-500"></span>
                    <span className="text-xs sm:text-sm font-medium uppercase tracking-wider">
                      Fear & Greed Index - Saham Indonesia
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                    <div className="flex items-end gap-3">
                      <span
                        className={cn(
                          "text-5xl sm:text-6xl font-black tracking-tighter",
                          fgColor,
                        )}
                      >
                        {fearGreedIndex}
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-neutral-300 mb-1.5 sm:mb-2">
                        {fgLabel}
                      </span>
                    </div>
                    <div className="w-full sm:w-64 max-w-sm mb-2 sm:mb-3 mt-2 sm:mt-0">
                      <div className="flex justify-between text-[10px] uppercase font-bold text-neutral-500 mb-2">
                        <span>Extreme Fear</span>
                        <span>Extreme Greed</span>
                      </div>
                      <div
                        className="h-3 w-full rounded-full overflow-hidden relative"
                        style={{ background: fgGradient }}
                      >
                        <div
                          className="absolute top-0 w-1.5 h-3 bg-white shadow-sm rounded-full transition-all duration-700 ease-out"
                          style={{
                            left: `${fearGreedIndex}%`,
                            transform: "translateX(-50%)",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-400/80 leading-relaxed max-w-md">
                    Menunjukkan sentimen dan emosi investor pasar saham saat
                    ini berdasarkan news live dan pricing changes.
                  </p>
                </div>

                <div className="flex gap-4 items-center">
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex lg:ml-auto w-full sm:w-auto justify-center items-center gap-2 rounded-2xl bg-white/10 px-6 py-3 min-w-[140px] font-semibold text-white transition-colors hover:bg-white/20 active:scale-95 disabled:opacity-50"
                  >
                    <RefreshCw
                      size={20}
                      className={cn(isRefreshing && "animate-spin")}
                    />
                    <span className="lg:hidden xl:inline">Perbarui</span>
                  </button>
                </div>
              </div>
            </section>
            <div className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-12 md:max-xl:grid-cols-2">
              <div className="space-y-6 sm:space-y-8 xl:col-span-8 md:max-xl:col-span-1">
                <Card
                  title="News"
                  icon={<Newspaper size={20} className="text-orange-500" />}
                  headerAction={
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fetchNews()}
                        disabled={isRefreshingNews}
                        className="flex shrink-0 items-center justify-center p-2 rounded-xl bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                        title="Muat Ulang"
                      >
                        <RefreshCw
                          size={14}
                          className={cn(isRefreshingNews && "animate-spin")}
                        />
                      </button>
                    </div>
                  }
                >
                  <div className="mb-4 flex flex-wrap gap-2 pt-4">
                    {[
                      "Semua",
                      "Otoritas",
                      "Media Lokal",
                      "Media Global",
                      "Sentimen Komunitas",
                    ].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedNewsType(type)}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-bold transition-all",
                          selectedNewsType === type
                            ? "bg-orange-500 text-white shadow-md dark:bg-orange-600"
                            : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700",
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="h-[450px] sm:h-[550px] lg:h-[650px] flex flex-col">
                    {isRefreshingNews ? (
                      <div className="flex flex-1 flex-col items-center justify-center space-y-4 text-neutral-400">
                        <RefreshCw
                          size={32}
                          className="animate-spin text-orange-500"
                        />
                        <p className="animate-pulse text-sm font-semibold tracking-wider">
                          Memuat berita terbaru...
                        </p>
                      </div>
                    ) : (
                      <div
                        className="flex-1 overflow-y-auto pr-2 pb-4 space-y-4"
                        style={{
                          scrollbarWidth: "thin",
                          scrollbarColor: "#d4d4d8 transparent",
                        }}
                      >
                        {filteredNewsList
                          .slice(0, activeTab === "News" ? 7 : 7)
                          .map((news) => {
                            const score = news.impactScore || 0;
                            let scoreColor =
                              "text-neutral-500 bg-neutral-100 dark:bg-neutral-800 border bg-neutral-200";
                            if (score >= 80)
                              scoreColor =
                                "text-green-700 bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400";
                            else if (score < 50)
                              scoreColor =
                                "text-red-700 bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400";
                            else
                              scoreColor =
                                "text-yellow-700 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400";

                            let badgeColors =
                              "bg-neutral-50 border-neutral-200 text-neutral-600 dark:bg-neutral-900/50 dark:border-neutral-800 dark:text-neutral-400";
                            if (news.impactType === "Makro")
                              badgeColors =
                                "bg-blue-50/50 border-blue-200 text-blue-800 dark:bg-blue-900/10 dark:border-blue-800/50 dark:text-blue-300";
                            if (news.impactType === "Sektoral")
                              badgeColors =
                                "bg-purple-50/50 border-purple-200 text-purple-800 dark:bg-purple-900/10 dark:border-purple-800/50 dark:text-purple-300";
                            if (news.impactType === "Emiten")
                              badgeColors =
                                "bg-orange-50/50 border-orange-200 text-orange-800 dark:bg-orange-900/10 dark:border-orange-800/50 dark:text-orange-300";

                            return (
                              <motion.div
                                key={news.id}
                                whileHover={{ scale: 1.01 }}
                                onClick={() => setSelectedNews(news)}
                                className={cn(
                                  "group flex cursor-pointer flex-col gap-3 p-4 rounded-xl transition-all border shadow-sm hover:shadow-md",
                                  badgeColors,
                                )}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                                        news.sourceType === "Otoritas"
                                          ? "bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800"
                                          : news.sourceType === "Media Lokal"
                                            ? "bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800"
                                            : news.sourceType === "Media Global"
                                              ? "bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800"
                                              : "bg-orange-100 border-orange-200 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800",
                                      )}
                                    >
                                      {news.sourceType || "Berita"}
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white dark:bg-neutral-900 shadow-sm opacity-80">
                                      {news.impactType}
                                    </span>
                                  </div>
                                  <div
                                    className={cn(
                                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                                      scoreColor,
                                    )}
                                  >
                                    Impact: {score}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <p className="text-sm sm:text-base font-bold leading-tight text-neutral-900 dark:text-neutral-100 transition-colors">
                                    {news.title}
                                  </p>
                                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 md:line-clamp-3 leading-relaxed">
                                    {news.summary}
                                  </p>
                                </div>

                                {news.impactedSectors &&
                                  news.impactedSectors.length > 0 && (
                                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                      <span className="text-[10px] text-neutral-500 font-medium">
                                        Terdampak:
                                      </span>
                                      {news.impactedSectors.map((s) => (
                                        <span
                                          key={s}
                                          className="text-[9px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-1.5 py-0.5 rounded"
                                        >
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                <div className="mt-1 flex flex-wrap items-center justify-between border-t border-black/5 dark:border-white/5 pt-3 gap-2">
                                  <span className="text-[10px] font-bold text-neutral-500 uppercase">
                                    {news.source}
                                  </span>
                                  <span className="text-[10px] font-bold text-neutral-500">
                                    {news.date}
                                  </span>
                                </div>
                              </motion.div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
              <div className="space-y-6 sm:space-y-8 xl:col-span-4 md:max-xl:col-span-1">
                <Card
                  title="Sektor Impact"
                  icon={<PieChart size={20} className="text-purple-500" />}
                  headerAction={
                    <button
                      onClick={() => {
                        setMacroRefreshKey((prev) => prev + 1);
                      }}
                      className="flex shrink-0 items-center justify-center p-2 rounded-xl bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                      title="Muat Ulang Kombinasi Makro"
                    >
                      <RefreshCw size={14} />
                    </button>
                  }
                >
                  <div className="space-y-4 pt-4">
                    {sectorScores.map((sector, i) => {
                      const nameSplit = sector.name.split(" (");
                      const titleMain = nameSplit[0];
                      const titleSub = nameSplit.length > 1 ? nameSplit[1].replace(")", "") : sector.code;
                      const isPositive = (sector.marketChangePercent || 0) >= 0;
                      const isAiPositive = sector.outlook === "Buy";
                      const isAiNegative = sector.outlook === "Sell";
                      
                      return (
                        <motion.div
                          layout
                          key={sector.name}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 10,
                          }}
                          className={cn(
                            "w-full bg-white/80 dark:bg-slate-900/70 backdrop-blur-md rounded-[1.5rem] relative overflow-hidden shadow-sm mt-3 first:mt-0 border",
                            isAiPositive ? "border-emerald-100 dark:border-emerald-500/20" :
                            isAiNegative ? "border-red-100 dark:border-rose-500/20" :
                            "border-neutral-200 dark:border-white/10 dark:border-t-white/20"
                          )}
                        >
                          <motion.div
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            transition={{ 
                              duration: isAiNegative ? 2 : isAiPositive ? 3 : 4, 
                              repeat: Infinity, 
                              ease: "easeInOut" 
                            }}
                            className={cn(
                              "absolute inset-0 pointer-events-none",
                              isAiPositive ? "bg-gradient-to-b from-emerald-400/10 to-transparent shadow-[inset_0_0_20px_rgba(16,185,129,0.03)] dark:from-emerald-500/10 dark:shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]" :
                              isAiNegative ? "bg-gradient-to-b from-rose-500/10 to-transparent shadow-[inset_0_0_20px_rgba(225,29,72,0.05)] dark:from-rose-600/15 dark:via-rose-900/5 dark:to-transparent dark:shadow-[inset_0_0_30px_rgba(225,29,72,0.15)]" :
                              "bg-gradient-to-b from-slate-200/50 to-transparent dark:from-white/5 dark:shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]"
                            )}
                          />
                          <div className="relative p-3 pb-2 sm:p-4 sm:pb-3 z-10">
                            <div className="flex justify-between items-start gap-2">
                              
                              <div className="flex gap-2 sm:gap-3 items-center flex-1 min-w-0">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-neutral-100 dark:bg-slate-800/80 flex items-center justify-center border border-neutral-200 dark:border-slate-700/50 shadow-inner">
                                  <div className="text-neutral-500 dark:text-slate-300 w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                                    {getIcon(sector.icon)}
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h2 className="text-neutral-900 dark:text-white font-bold text-xs sm:text-sm leading-tight break-words">{titleMain}</h2>
                                  <p className="text-neutral-500 dark:text-slate-500 text-[9px] sm:text-[10px] font-medium mt-0.5 break-words">{titleSub}</p>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1.5 shrink-0">
                                
                                <div className="flex items-stretch rounded-full border border-neutral-200 dark:border-slate-700/50 overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                                  <div className={cn("flex items-center gap-1 px-1.5 py-0.5", 
                                    isAiPositive ? "bg-gradient-to-r from-emerald-400 to-teal-500" : 
                                    isAiNegative ? "bg-gradient-to-r from-red-400 to-rose-500" : 
                                    "bg-gradient-to-r from-neutral-300 to-neutral-400 dark:from-neutral-600 dark:to-neutral-700"
                                  )}>
                                    <span className={cn("text-[8px] font-black tracking-widest mt-px", 
                                      isAiPositive || isAiNegative ? "text-slate-900" : "text-neutral-700 dark:text-white"
                                    )}>
                                      {sector.outlook.toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="flex items-center px-1.5 py-0.5">
                                    <motion.span 
                                      key={`prob-${sector.probability}`}
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className="text-neutral-800 dark:text-white font-extrabold text-[10px]"
                                    >
                                      {sector.probability.toFixed(2)}
                                    </motion.span>
                                  </div>
                                </div>

                                <div className="bg-neutral-50 border border-neutral-200 dark:bg-slate-800/40 dark:border-slate-700/40 rounded-md p-1.5 flex gap-2 items-center">
                                  <div className="flex flex-col border-r border-neutral-200 dark:border-slate-700/50 pr-2">
                                    <span className="text-neutral-400 dark:text-slate-500 text-[6px] sm:text-[7px] font-bold uppercase tracking-tighter">Prev</span>
                                    <motion.span 
                                      key={`prev-${sector.prevPrice}`}
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className="text-neutral-600 dark:text-slate-300 font-bold text-[9px]"
                                    >
                                      {sector.prevPrice > 0 ? sector.prevPrice.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                                    </motion.span>
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-neutral-400 dark:text-slate-500 text-[6px] sm:text-[7px] font-bold uppercase tracking-tighter">Chg</span>
                                    <motion.span 
                                      key={`chg-${sector.marketChangePercent}`}
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      className={cn("font-bold text-[9px] flex items-center gap-0.5", 
                                        isPositive ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                                      )}
                                    >
                                      {isPositive ? "+" : ""}{(sector.marketChangePercent || 0).toFixed(2)}%
                                      {sector.marketChangePercent !== 0 && (
                                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d={isPositive ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 112 0v7.586l2.293-2.293a1 1 0 011.414 0z"} clipRule="evenodd"></path>
                                      </svg>
                                      )}
                                    </motion.span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className={cn("relative z-10 mx-2 mb-2 sm:mx-3 sm:mb-3 p-2 sm:px-3 rounded-lg border", 
                            isPositive ? "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20" : 
                            "bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20"
                          )}>
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-neutral-500 dark:text-slate-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest mb-0.5">Market Index</h3>
                                <p className="text-neutral-800 dark:text-slate-200 font-bold text-[10px] sm:text-xs">{sector.marketIndex || titleMain}</p>
                              </div>
                              
                              <div className="text-right">
                                <motion.div 
                                  key={`price-${sector.price}`}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="text-neutral-900 dark:text-white font-bold text-sm"
                                >
                                  {sector.price > 0 ? sector.price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
                                </motion.div>
                                <motion.div 
                                  key={`val-${sector.marketChangeValue}`}
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className={cn("flex items-center justify-end font-bold text-[10px] mt-0.5", 
                                    isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-500"
                                  )}
                                >
                                  {sector.marketChangePercent !== 0 && (
                                  <svg className="w-2.5 h-2.5 mr-0.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d={isPositive ? "M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" : "M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 112 0v7.586l2.293-2.293a1 1 0 011.414 0z"} clipRule="evenodd"></path>
                                  </svg>
                                  )}
                                  {isPositive ? "+" : ""}{(sector.marketChangeValue || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({(sector.marketChangePercent || 0).toFixed(2)}%)
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </Card>

                <div className="rounded-3xl border-2 border-dashed border-neutral-200 p-6 text-center dark:border-neutral-800">
                  <BarChart3
                    size={40}
                    className="mx-auto mb-4 text-neutral-300 dark:text-neutral-700"
                  />
                  <h3 className="mb-2 font-bold">Butuh Konsultasi AI?</h3>
                  <p className="mb-4 text-xs text-neutral-500">
                    Gunakan asisten cerdas kami untuk menganalisis portofolio
                    Anda secara mendalam.
                  </p>
                  <button className="w-full rounded-2xl bg-neutral-900 py-3 font-bold text-white transition-all hover:bg-neutral-800 active:scale-95 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200">
                    Mulai AI Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "News" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 dark:bg-orange-900/20 text-orange-500">
                  <Newspaper size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">Aliran Berita</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">Informasi dan sentimen pasar terkini.</p>
                </div>
              </div>
              <button
                onClick={() => fetchNews()}
                disabled={isRefreshingNews}
                className="flex shrink-0 items-center justify-center p-3 rounded-xl bg-white shadow-sm ring-1 ring-black/5 text-neutral-600 transition-all hover:bg-neutral-50 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-300 dark:ring-white/10 dark:hover:bg-neutral-700"
                title="Muat Ulang"
              >
                <RefreshCw
                  size={16}
                  className={cn(isRefreshingNews && "animate-spin")}
                />
              </button>
            </div>

            <div className="mb-6 flex flex-wrap gap-2">
              {[
                "Semua",
                "Otoritas",
                "Media Lokal",
                "Media Global",
                "Sentimen Komunitas",
              ].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedNewsType(type)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-bold transition-all",
                    selectedNewsType === type
                      ? "bg-orange-500 text-white shadow-md dark:bg-orange-600"
                      : "bg-white shadow-sm ring-1 ring-black/5 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-white/10 dark:hover:bg-neutral-700",
                  )}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="min-h-[75vh]">
              {isRefreshingNews ? (
                <div className="flex w-full py-32 flex-col items-center justify-center space-y-4 text-neutral-400">
                  <RefreshCw
                    size={32}
                    className="animate-spin text-orange-500"
                  />
                  <p className="animate-pulse text-base font-semibold tracking-wider">
                    Memuat berita terbaru...
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {filteredNewsList
                    .slice(0, activeTab === "News" ? 100 : 7)
                    .map((news) => {
                      const score = news.impactScore || 0;
                      let scoreColor =
                        "text-neutral-600 bg-neutral-100 dark:bg-neutral-800 ring-1 ring-black/5 dark:ring-white/10";
                      if (score >= 80)
                        scoreColor =
                          "text-emerald-700 bg-emerald-50 ring-1 ring-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20";
                      else if (score < 50)
                        scoreColor =
                          "text-rose-700 bg-rose-50 ring-1 ring-rose-500/20 dark:bg-rose-500/10 dark:text-rose-400 dark:ring-rose-500/20";
                      else
                        scoreColor =
                          "text-amber-700 bg-amber-50 ring-1 ring-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20";

                      return (
                        <motion.div
                          key={news.id}
                          whileHover={{ y: -4 }}
                          onClick={() => setSelectedNews(news)}
                          className={cn(
                            "group relative flex cursor-pointer flex-col justify-between gap-6 p-6 sm:p-8 transition-all duration-300",
                            "bg-white dark:bg-neutral-900 rounded-3xl",
                            "shadow-sm ring-1 ring-black/5 dark:ring-white/5",
                            "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-white/5 hover:ring-black/10 dark:hover:ring-white/10",
                            "overflow-hidden",
                          )}
                        >
                          <div className="absolute top-0 right-0 h-32 w-32 -translate-y-16 translate-x-16 rounded-full bg-gradient-to-br from-neutral-100 to-transparent opacity-50 blur-3xl transition-transform duration-500 group-hover:scale-150 dark:from-neutral-800" />
                          
                          <div className="relative z-10 flex flex-col gap-6">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ring-1 ring-inset",
                                    news.sourceType === "Otoritas"
                                      ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 ring-blue-500/20"
                                      : news.sourceType === "Media Lokal"
                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 ring-emerald-500/20"
                                        : news.sourceType === "Media Global"
                                          ? "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300 ring-purple-500/20"
                                          : "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300 ring-orange-500/20",
                                  )}
                                >
                                  {news.sourceType === "Otoritas" ? <Landmark size={12} /> : news.sourceType === "Media Lokal" ? <MapPin size={12} /> : news.sourceType === "Media Global" ? <Globe2 size={12} /> : <Users size={12} />}
                                  <span>{news.sourceType || "Berita"}</span>
                                </div>
                                <div className="px-3 py-1.5 rounded-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-1.5 border-l-4 border-l-blue-500">
                                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-600 dark:text-neutral-400">
                                    Target: <span className="text-blue-600 dark:text-blue-400">{news.impactType}</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-3">
                              <h3 className="text-xl font-bold leading-tight tracking-tight text-neutral-900 dark:text-neutral-50 transition-colors group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                {news.title}
                              </h3>
                              <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                                {news.summary}
                              </p>
                            </div>

                            {news.impactedSectors && news.impactedSectors.length > 0 && (
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider">
                                  Terdampak:
                                </span>
                                {news.impactedSectors.map((s) => {
                                  let label = s;
                                  if (news.impactType === 'Emiten') {
                                    const codes = news.title.match(/\b[A-Z]{4}\b/g);
                                    if (codes && codes.length > 0) {
                                      label = codes.join(', ');
                                    }
                                  }

                                  return (
                                    <span
                                      key={s}
                                      className="text-[11px] font-bold bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)] dark:shadow-none"
                                    >
                                      {news.impactType === 'Emiten' ? `Saham ${label}` : label}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex flex-wrap items-center justify-between bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-2xl ring-1 ring-inset ring-neutral-200/60 dark:ring-neutral-700/50 relative z-10 gap-4">
                            <div className="flex flex-col gap-1.5">
                               <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                                 <Newspaper size={14} className="text-neutral-500" />
                                 {news.source}
                               </span>
                               <span className="text-[11px] font-semibold text-neutral-500 flex items-center gap-1.5">
                                 <Clock size={12} />
                                 {news.date}
                               </span>
                            </div>
                            <div
                              className={cn(
                                "text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl shadow-sm border-transparent",
                                scoreColor,
                              )}
                            >
                              Impact: <span className="text-sm ml-1 text-inherit">{score}</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "Rekomendasi Saham" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-12 md:max-xl:grid-cols-2">
              <div className="space-y-6 sm:space-y-8 xl:col-span-8 md:max-xl:col-span-1">
                <Card
                  title="Grafik IHSG"
                  icon={<BarChart3 size={20} className="text-blue-500" />}
                >
                  <div className="h-[300px] sm:h-[400px] w-full pt-4 overflow-hidden rounded-xl">
                    <AdvancedRealTimeChart
                      symbol="IDX:COMPOSITE"
                      theme="dark"
                      interval="240"
                      autosize
                      allow_symbol_change={false}
                      hide_side_toolbar={true}
                      hide_top_toolbar={true}
                      hide_legend={true}
                      backgroundColor="#000000"
                      timezone="Asia/Jakarta"
                    />
                  </div>
                </Card>
                <Card
                  title="Kalender Aksi Korporasi"
                  icon={<Calendar size={20} className="text-pink-500" />}
                >
                  <div className="space-y-4 pt-4">
                    {MOCK_CORPORATE_EVENTS.map((event) => (
                      <div
                        key={event.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-4 last:border-0 last:pb-0 dark:border-neutral-800"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400">
                            <span className="text-xs font-bold uppercase">
                              {event.date.split(" ")[1]}
                            </span>
                            <span className="text-lg font-black leading-none">
                              {event.date.split(" ")[0]}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-lg tracking-tighter">
                                {event.symbol}
                              </span>
                              <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                                {event.type}
                              </span>
                            </div>
                            <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                              {event.desc}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2">
                      <p className="text-[10px] italic text-neutral-400 text-center">
                        Sumber: Keterbukaan Informasi Bursa Efek Indonesia (IDX)
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="space-y-6 sm:space-y-8 xl:col-span-4 md:max-xl:col-span-1">
                <Card
                  title="Rekomendasi Saham"
                  icon={<ShieldCheck size={20} className="text-green-500" />}
                  headerAction={
                    <button
                      onClick={() => {
                        // simulate screening
                        setIsRefreshing(true);
                        setTimeout(() => setIsRefreshing(false), 1500);
                      }}
                      disabled={isRefreshing}
                      className="flex items-center gap-1.5 rounded-xl bg-neutral-100 px-3 py-1.5 text-xs font-bold text-neutral-600 transition-colors hover:bg-neutral-200 disabled:opacity-50 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
                    >
                      <RefreshCw
                        size={14}
                        className={cn(isRefreshing && "animate-spin")}
                      />
                      Screening Manual
                    </button>
                  }
                >
                  <div className="mb-4 flex flex-wrap gap-2 pt-4">
                    {[
                      "Semua",
                      "Keuangan",
                      "Energi",
                      "Konsumer",
                      "Teknologi",
                      "Infrastruktur",
                    ].map((sector) => (
                      <button
                        key={sector}
                        onClick={() => setSelectedSector(sector)}
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-bold transition-all",
                          selectedSector === sector
                            ? "bg-blue-500 text-white shadow-md dark:bg-blue-600"
                            : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700",
                        )}
                      >
                        {sector}
                      </button>
                    ))}
                  </div>
                  <div className="space-y-5">
                    {isRefreshing ? (
                      <div className="flex h-32 flex-col items-center justify-center space-y-4 text-neutral-400">
                        <RefreshCw
                          size={32}
                          className="animate-spin text-blue-500"
                        />
                        <p className="animate-pulse text-sm font-semibold tracking-wider">
                          Menjalankan 23-Point Technical Protocol...
                        </p>
                      </div>
                    ) : (
                      filteredStocks.map((stock, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ x: 4 }}
                          onClick={() => setSelectedStock(stock)}
                          className="group cursor-pointer border-b border-neutral-100 pb-4 last:border-0 last:pb-0 dark:border-neutral-800"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-lg tracking-tighter">
                                  {stock.symbol}
                                </span>
                                <span className="text-xs font-semibold uppercase text-neutral-400">
                                  {stock.name.split(" ")[0]}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-sm font-medium text-neutral-500">
                                  Rp {stock.price.toLocaleString("id-ID")}
                                </span>
                                <span
                                  className={cn(
                                    "text-xs font-bold",
                                    stock.change >= 0
                                      ? "text-green-500"
                                      : "text-red-500",
                                  )}
                                >
                                  {stock.change >= 0 ? "+" : ""}
                                  {stock.change}%
                                </span>
                              </div>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-900 transition-all group-hover:bg-blue-600 group-hover:text-white dark:bg-neutral-800 dark:text-neutral-100">
                              <ChevronRight size={18} />
                            </div>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                            {stock.reason}
                          </p>
                          <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-blue-500 opacity-0 transition-opacity group-hover:opacity-100">
                            Klik untuk detail analisis
                          </p>
                        </motion.div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-200 bg-white py-8 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-neutral-500">
            © 2026 Research CNHL. Data disediakan oleh simulasi pasar real-time.
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <a
              href="#"
              className="text-xs font-medium text-neutral-400 hover:text-blue-500"
            >
              Kebijakan Privasi
            </a>
            <a
              href="#"
              className="text-xs font-medium text-neutral-400 hover:text-blue-500"
            >
              Syarat & Ketentuan
            </a>
            <a
              href="#"
              className="text-xs font-medium text-neutral-400 hover:text-blue-500"
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Card({
  title,
  children,
  icon,
  className,
  titleClassName,
  headerAction,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  headerAction?: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-neutral-100 bg-white p-5 sm:p-6 lg:p-8 shadow-sm ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900/40 dark:ring-white/5",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-50 dark:bg-neutral-800">
              {icon}
            </div>
          )}
          <h2
            className={cn(
              "text-lg font-bold tracking-tight text-neutral-800 dark:text-white",
              titleClassName,
            )}
          >
            {title}
          </h2>
        </div>
        {headerAction}
      </div>
      <div>{children}</div>
    </motion.section>
  );
}

function getIcon(name: string) {
  switch (name) {
    case "Building2":
      return <Building2 size={20} />;
    case "Zap":
      return <Zap size={20} />;
    case "ShoppingCart":
      return <ShoppingCart size={20} />;
    case "Cpu":
      return <Cpu size={20} />;
    case "ShieldCheck":
      return <ShieldCheck size={20} />;
    case "Box":
      return <Box size={20} />;
    case "Factory":
      return <Factory size={20} />;
    case "Car":
      return <Car size={20} />;
    case "HeartPulse":
      return <HeartPulse size={20} />;
    case "Home":
      return <Home size={20} />;
    case "Truck":
      return <Truck size={20} />;
    default:
      return <BarChart3 size={20} />;
  }
}

function StockDetailModal({
  stock,
  onClose,
}: {
  stock: RecommendedStock;
  onClose: () => void;
}) {
  const detail = stock.detail;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-white shadow-2xl dark:bg-neutral-900"
      >
        <div className="absolute top-6 right-6 z-10 rounded-full bg-white/50 backdrop-blur-sm dark:bg-neutral-900/50">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            <RefreshCw className="rotate-45" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black tracking-tighter sm:text-5xl">
                {stock.symbol}
              </span>
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 text-sm font-bold",
                  stock.change >= 0
                    ? "bg-green-500/10 text-green-500"
                    : "bg-red-500/10 text-red-500",
                )}
              >
                {stock.change >= 0 ? (
                  <TrendingUp size={16} />
                ) : (
                  <TrendingDown size={16} />
                )}
                {stock.change}%
              </div>
            </div>
            <h3 className="mt-1 text-xl font-bold text-neutral-400">
              {stock.name}
            </h3>
            <div className="mt-4 flex gap-2">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-bold tracking-widest",
                  detail?.report?.rating.includes("BUY")
                    ? "bg-green-600 text-white"
                    : "bg-neutral-600 text-white",
                )}
              >
                {detail?.report?.rating || "BUY"}
              </span>
              {detail && (
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  Target: Rp {detail.report.targetPrice.toLocaleString("id-ID")}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <Metric
              label="Harga Terakhir"
              value={`Rp ${stock.price.toLocaleString("id-ID")}`}
            />
            <Metric label="Market Cap" value="1.200 T" />
            <Metric label="PER" value="24.5x" />
            <Metric label="Volume" value="45.2 jt" />
          </div>

          <div className="mt-8 h-[400px] w-full overflow-hidden rounded-2xl border border-neutral-100 dark:border-neutral-800">
            <AdvancedRealTimeChart
              symbol={`IDX:${stock.symbol}`}
              theme="dark"
              interval="D"
              autosize
              allow_symbol_change={false}
              hide_side_toolbar={true}
              hide_top_toolbar={true}
              timezone="Asia/Jakarta"
            />
          </div>

          {detail ? (
            <div className="mt-12 space-y-12">
              {/* Part I */}
              <section>
                <h4 className="mb-4 flex items-center gap-2 border-b border-neutral-100 pb-2 text-lg font-bold text-neutral-800 dark:border-neutral-800 dark:text-white">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    1
                  </span>
                  Framework 4W & MPPT (Makro & Sentimen)
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-500">
                      Why (Sentimen)
                    </div>
                    <p className="text-sm dark:text-neutral-300">
                      {detail.framework4W.why}
                    </p>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-500">
                      What (Fundamental)
                    </div>
                    <p className="text-sm dark:text-neutral-300">
                      {detail.framework4W.what}
                    </p>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-500">
                      Where (Technical Zone)
                    </div>
                    <p className="text-sm dark:text-neutral-300">
                      {detail.framework4W.where}
                    </p>
                  </div>
                  <div className="rounded-xl bg-neutral-50 p-4 dark:bg-neutral-800/50">
                    <div className="mb-1 text-xs font-bold uppercase tracking-wider text-blue-500">
                      When (Timing)
                    </div>
                    <p className="text-sm dark:text-neutral-300">
                      {detail.framework4W.when}
                    </p>
                  </div>
                </div>
              </section>

              {/* Part II */}
              <section>
                <h4 className="mb-4 flex items-center gap-2 border-b border-neutral-100 pb-2 text-lg font-bold text-neutral-800 dark:border-neutral-800 dark:text-white">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100 text-xs text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    2
                  </span>
                  23-Point Technical Protocol (Key Signals)
                </h4>
                <ul className="space-y-3">
                  {detail.technicalSignals.map((sig, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm dark:text-neutral-300"
                    >
                      <ShieldCheck
                        size={16}
                        className="mt-0.5 shrink-0 text-purple-500"
                      />
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Part III: Intraday Trading Plan */}
              <div className="rounded-2xl border-2 border-blue-500/20 bg-blue-50/50 p-6 dark:border-blue-500/10 dark:bg-blue-900/10">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-blue-200 text-sm text-blue-700 dark:bg-blue-800 dark:text-blue-300">
                      3
                    </span>
                    Intraday Trading Plan
                  </h3>
                  <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-400">
                    4W & MPPT Approved
                  </span>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-900/50">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Pivot Point
                    </span>
                    <span className="text-xl font-bold text-neutral-800 dark:text-neutral-200">
                      Rp {detail.report.pivots.pivot.toLocaleString("id-ID")}
                    </span>
                    <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                      Fokus pantulan utama (Baseline MPPT).
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-900/50">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Target Price (TP)
                    </span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      Rp {detail.report.pivots.r1.toLocaleString("id-ID")} - Rp{" "}
                      {detail.report.pivots.r2.toLocaleString("id-ID")}
                    </span>
                    <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                      Take profit melihat resistance 1 & 2 terdekat.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-900/50">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Stop Loss (SL)
                    </span>
                    <span className="text-xl font-bold text-red-600 dark:text-red-400">
                      {"<"} Rp {detail.report.stopLoss.toLocaleString("id-ID")}
                    </span>
                    <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                      Batas toleransi risiko intraday berdasarkan support.
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-4 shadow-sm dark:bg-neutral-900/50">
                    <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-neutral-400">
                      Horizon
                    </span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      Intraday (1H-4H)
                    </span>
                    <p className="mt-2 text-xs leading-relaxed text-neutral-500">
                      Validasi buy jika breakout 23-Point Checklist.
                    </p>
                  </div>
                </div>
              </div>

              {/* Part IV */}
              <section>
                <h4 className="mb-4 flex items-center gap-2 border-b border-neutral-100 pb-2 text-lg font-bold text-neutral-800 dark:border-neutral-800 dark:text-white">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-100 text-xs text-pink-600 dark:bg-pink-900/30 dark:text-pink-400">
                    4
                  </span>
                  Strategi Eksekusi Scaling-In (DCA Model)
                </h4>
                <div className="space-y-3 relative">
                  <div className="absolute bottom-4 left-3.5 top-2 w-px bg-neutral-200 dark:bg-neutral-700"></div>

                  <div className="relative flex gap-4 pl-10">
                    <div className="absolute left-1.5 top-1 h-4 w-4 rounded-full border-4 border-white bg-blue-500 shadow-sm dark:border-neutral-900"></div>
                    <div className="w-full rounded-xl bg-neutral-50 p-3 text-sm dark:bg-neutral-800/50">
                      <span className="block font-bold text-neutral-800 dark:text-neutral-200">
                        Tranche 1 (25%)
                      </span>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {detail.scalingIn.tranche1}
                      </span>
                    </div>
                  </div>

                  <div className="relative flex gap-4 pl-10">
                    <div className="absolute left-1.5 top-1 h-4 w-4 rounded-full border-4 border-white bg-blue-500 shadow-sm dark:border-neutral-900"></div>
                    <div className="w-full rounded-xl bg-neutral-50 p-3 text-sm dark:bg-neutral-800/50">
                      <span className="block font-bold text-neutral-800 dark:text-neutral-200">
                        Tranche 2 (35%)
                      </span>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {detail.scalingIn.tranche2}
                      </span>
                    </div>
                  </div>

                  <div className="relative flex gap-4 pl-10">
                    <div className="absolute left-1.5 top-1 h-4 w-4 rounded-full border-4 border-white bg-blue-500 shadow-sm dark:border-neutral-900"></div>
                    <div className="w-full rounded-xl bg-neutral-50 p-3 text-sm dark:bg-neutral-800/50">
                      <span className="block font-bold text-neutral-800 dark:text-neutral-200">
                        Tranche 3 (40%)
                      </span>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        {detail.scalingIn.tranche3}
                      </span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          ) : (
            <div className="mt-10 space-y-6">
              <div>
                <h4 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-neutral-400">
                  <BarChart3 size={16} />
                  Analisis Singkat
                </h4>
                <p className="mt-3 text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {stock.reason} Saham ini menunjukkan tren akumulasi yang kuat
                  dari investor institusi.
                </p>
              </div>
            </div>
          )}

          <div className="mt-10 flex gap-4">
            <button className="flex-1 rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95">
              Beri Tahu Broker Eksekusi
            </button>
            <button className="flex-1 rounded-2xl bg-neutral-100 py-4 font-bold text-neutral-900 transition-all hover:bg-neutral-200 active:scale-95 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700">
              Tambah ke Watchlist
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs font-bold uppercase tracking-wider text-neutral-400">
        {label}
      </div>
      <div className="mt-1 text-lg font-bold tracking-tight">{value}</div>
    </div>
  );
}

function NewsDetailModal({
  news,
  onClose,
}: {
  news: NewsItem;
  onClose: () => void;
}) {
  const score = news.impactScore || 0;
  let scoreColor =
    "text-neutral-500 bg-neutral-100 dark:bg-neutral-800 border bg-neutral-200";
  if (score >= 80)
    scoreColor =
      "text-green-700 bg-green-100 border-green-200 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400";
  else if (score < 50)
    scoreColor =
      "text-red-700 bg-red-100 border-red-200 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400";
  else
    scoreColor =
      "text-yellow-700 bg-yellow-100 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-800 dark:text-yellow-400";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] bg-white shadow-2xl dark:bg-neutral-900 max-h-[90vh] flex flex-col"
      >
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-500 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
          >
            <RefreshCw className="rotate-45" size={20} />
          </button>
        </div>

        <div
          className="p-6 sm:p-8 lg:p-12 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#d4d4d8 transparent",
          }}
        >
          <div className="mb-6">
            <div className="mb-4 flex flex-wrap items-center gap-3 text-sm font-bold">
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-sm border border-blue-100 dark:border-blue-900 px-2.5 py-1 rounded-lg">
                <Newspaper size={16} />
                <span>{news.source}</span>
              </span>
              {news.sourceType && (
                <span className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 px-2.5 py-1 rounded-lg shadow-sm">
                  {news.sourceType}
                </span>
              )}
              {news.impactType && (
                <span className="bg-white dark:bg-neutral-950 shadow-sm border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 px-2.5 py-1 rounded-lg">
                  {news.impactType}
                </span>
              )}
              <span
                className={cn(
                  "px-2.5 py-1 rounded-lg shadow-sm border",
                  scoreColor,
                )}
              >
                Impact: {score}
              </span>
            </div>

            <h3 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl text-neutral-900 dark:text-white leading-tight">
              {news.title}
            </h3>

            <div className="mt-4 text-sm font-medium text-neutral-500 flex items-center gap-2">
              <Calendar size={14} />
              <span>{news.date}</span>
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed text-neutral-600 dark:text-neutral-300">
                {news.summary}
              </p>
            </div>
          </div>

          {news.impactedSectors && news.impactedSectors.length > 0 && (
            <div className="mt-8 p-4 bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl border border-neutral-100 dark:border-neutral-800">
              <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center gap-2">
                <Zap size={16} className="text-yellow-500" />
                Sektor Terdampak
              </h4>
              <div className="flex flex-wrap gap-2">
                {news.impactedSectors.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 bg-white dark:bg-neutral-900 rounded-lg text-sm font-semibold text-neutral-700 dark:text-neutral-300 shadow-sm border border-neutral-200/50 dark:border-neutral-700/50"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-4 border-t border-neutral-100 pt-8 dark:border-neutral-800">
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95"
            >
              Baca Artikel Asli
            </a>
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl bg-neutral-100 py-4 font-bold text-neutral-900 transition-all hover:bg-neutral-200 active:scale-95 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
            >
              Tutup
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
