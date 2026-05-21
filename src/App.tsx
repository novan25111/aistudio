/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Bitcoin,
  LineChart as LineChartIcon,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  BarChart3,
  LayoutDashboard,
  PieChart as PieChartIcon,
  Newspaper,
  ArrowUpRight,
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
  Briefcase,
  Wallet,
  Plus,
  Trash2,
  Pencil,
  Sparkles,
  Eye,
  EyeOff,
  Target,
  ShieldAlert,
  Scissors,
  Lock,
  User,
  X,
  Activity,
  Globe,
  Crosshair,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  Filter,
  ChevronDown,
  ArrowLeftRight
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ReferenceLine,
  ComposedChart,
} from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "./lib/utils";
import { TechnicalDashboard } from "./components/TechnicalDashboard";
import { CorporateActionDashboard } from "./components/CorporateActionDashboard";
import { StockChartApex } from "./components/StockChartApex";
import { AstroCalendar } from "./components/AstroCalendar";
import { BrokerSummaryDashboard } from "./components/BrokerSummaryDashboard";
import {
  MarketData,
  SectorPerformance,
  RecommendedStock,
  NewsItem,
  CorporateEvent,
  Trade,
} from "./types";


// Mock data for May 18, 2026
const MOCK_CORPORATE_EVENTS: CorporateEvent[] = [
  {
    id: "1",
    symbol: "BBCA",
    companyName: "Bank Central Asia Tbk",
    type: "Dividen",
    status: "Completed",
    date: "15 Mei 2026",
    desc: "Dividen tunai tahun buku 2025.",
    dividendValue: 120,
    dividendYield: 1.15,
    cumDate: "2026-05-08",
    exDate: "2026-05-09",
    recordingDate: "2026-05-12",
    paymentDate: "2026-05-15",
  },
  {
    id: "2",
    symbol: "GOTO",
    companyName: "GoTo Gojek Tokopedia Tbk",
    type: "Earnings",
    status: "Completed",
    date: "18 Mei 2026",
    desc: "Rilis Kinerja Kuartal I 2026.",
  },
  {
    id: "3",
    symbol: "BREN",
    companyName: "Barito Renewables Energy Tbk",
    type: "Stock Split",
    status: "Upcoming",
    date: "21 Mei 2026",
    desc: "Rasio Pemecahan Saham 1:5.",
    splitRatio: "1:5",
    pricePre: 8200,
    pricePost: 1640,
    sharesPre: "133.78 Miliar",
    sharesPost: "668.9 Miliar",
    cumDate: "2026-05-20",
    effectiveDate: "2026-05-21",
  },
  {
    id: "4",
    symbol: "TLKM",
    companyName: "Telkom Indonesia (Persero) Tbk",
    type: "Dividen",
    status: "Upcoming",
    date: "25 Mei 2026",
    desc: "Cum Date dividen tunai tahun buku 2025.",
    dividendValue: 165,
    dividendYield: 4.82,
    cumDate: "2026-05-25",
    exDate: "2026-05-26",
    recordingDate: "2026-05-28",
    paymentDate: "2026-06-15",
  },
  {
    id: "5",
    symbol: "ASII",
    companyName: "Astra International Tbk",
    type: "RUPS",
    status: "Upcoming",
    date: "19 Mei 2026",
    desc: "RUPS Tahunan Strategi 2026.",
  },
  {
    id: "6",
    symbol: "UNVR",
    companyName: "Unilever Indonesia Tbk",
    type: "Dividen",
    status: "Active",
    date: "18 Mei 2026",
    desc: "Cum Date Dividen Interim.",
    dividendValue: 84,
    dividendYield: 2.3,
    cumDate: "2026-05-18",
    exDate: "2026-05-19",
    recordingDate: "2026-05-21",
    paymentDate: "2026-06-05",
  },
];

const MOCK_HISTORICAL_FEAR_GREED = [
  { date: '17 Apr', value: 55 },
  { date: '18 Apr', value: 58 },
  { date: '19 Apr', value: 62 },
  { date: '20 Apr', value: 60 },
  { date: '21 Apr', value: 55 },
  { date: '22 Apr', value: 48 },
  { date: '23 Apr', value: 42 },
  { date: '24 Apr', value: 38 },
  { date: '25 Apr', value: 32 },
  { date: '26 Apr', value: 30 },
  { date: '27 Apr', value: 35 },
  { date: '28 Apr', value: 42 },
  { date: '29 Apr', value: 45 },
  { date: '30 Apr', value: 40 },
  { date: '01 Mei', value: 44 },
  { date: '02 Mei', value: 48 },
  { date: '03 Mei', value: 50 },
  { date: '04 Mei', value: 52 },
  { date: '05 Mei', value: 58 },
  { date: '06 Mei', value: 60 },
  { date: '07 Mei', value: 63 },
  { date: '08 Mei', value: 65 },
  { date: '09 Mei', value: 58 },
  { date: '10 Mei', value: 42 },
  { date: '11 Mei', value: 45 },
  { date: '12 Mei', value: 38 },
  { date: '13 Mei', value: 35 },
  { date: '14 Mei', value: 48 },
  { date: '15 Mei', value: 52 },
  { date: '16 Mei', value: 64 },
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

const SECTOR_DEFAULTS: Record<string, { price: number; volume: number; changePercent: number }> = {
  'Energi': { price: 2150.45, volume: 1850000, changePercent: 0.45 },
  'Barang Baku': { price: 1220.12, volume: 1450000, changePercent: -0.25 },
  'Perindustrian': { price: 1110.85, volume: 950000, changePercent: 0.15 },
  'Konsumer Primer': { price: 820.50, volume: 2200000, changePercent: -0.05 },
  'Konsumer Non-Primer': { price: 710.20, volume: 1600000, changePercent: 0.35 },
  'Kesehatan': { price: 1350.60, volume: 550000, changePercent: -0.10 },
  'Keuangan': { price: 1410.15, volume: 4500000, changePercent: 0.65 },
  'Properti': { price: 680.75, volume: 3100000, changePercent: -0.85 },
  'Teknologi': { price: 3400.30, volume: 4200000, changePercent: 1.25 },
  'Infrastruktur': { price: 1550.90, volume: 2800000, changePercent: 0.05 },
  'Logistik': { price: 980.40, volume: 800000, changePercent: -0.30 }
};

const MACRO_DEFAULTS: Record<string, { changePercent: number; price: number }> = {
  'IHSG': { changePercent: 0.12, price: 7250.32 },
  'USDIDR': { changePercent: -0.05, price: 16120.00 },
  'GOLD': { changePercent: 0.45, price: 2355.80 },
  'OIL': { changePercent: -0.60, price: 78.50 },
  'COAL': { changePercent: 1.15, price: 135.20 }
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
): { finalScore: number, flowMultiplier: number, preAlpha: number, textAlpha: number, macroAlpha: number } {
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
    else if (alphaDirection !== 0) flowMultiplier = 0.3;
  }

  // TAHAP 4: Menggabungkan Market Momentum (Actual Price Change)
  // actualDelta represents percentage change (-2.5%, +3.1%, etc.)
  // We amplify it to strongly impact the score (live reflection)
  let momentumAlpha = actualDelta * 2.5; 
  
  // TAHAP 5: Persamaan Agregasi Akhir & Normalisasi
  const totalAlpha = (preAlpha * flowMultiplier) + momentumAlpha;
  const finalScore = 50 + 50 * Math.tanh(TANH_SCALAR * totalAlpha);

  return {
    finalScore: Math.round(finalScore * 100) / 100,
    flowMultiplier, 
    preAlpha,
    textAlpha: totalTextImpact,
    macroAlpha: totalMacroImpact
  };
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRefreshingNews, setIsRefreshingNews] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: "info" | "error" | "success" }[]>([]);

  const addNotification = (message: string, type: "info" | "error" | "success" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const [realtimeOpp, setRealtimeOpp] = useState<any[]>([]);
  const [realtimeOppLoading, setRealtimeOppLoading] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  const handleMainScroll = (e: React.UIEvent<HTMLElement>) => {
    const currentScrollY = e.currentTarget.scrollTop;
    
    // Auto-hide mobile header logic
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      if (!isHeaderHidden) setIsHeaderHidden(true);
    } else if (currentScrollY < lastScrollY.current) {
      if (isHeaderHidden) setIsHeaderHidden(false);
    }
    
    lastScrollY.current = currentScrollY;
    
    if (currentScrollY > 30 !== isScrolled) {
        setIsScrolled(currentScrollY > 30);
    }
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  const [sectorMarketData, setSectorMarketData] = useState<
    Record<string, { volume: number; changePercent: number; price: number }>
  >({});
  const [macroMarketData, setMacroMarketData] = useState<
    Record<string, { changePercent: number; price: number }>
  >({});
  const [selectedStock, setSelectedStock] = useState<RecommendedStock | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNewsFilterOpen, setIsNewsFilterOpen] = useState(false);
  const [isSectorFilterOpen, setIsSectorFilterOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const executeSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim().toUpperCase();
    
    // check if in mock data
    const found = stocks.find(s => s.symbol.toUpperCase() === q);
    if (found) {
      setSelectedStock(found);
    } else {
      // Generate a generic one
      const genericStock: RecommendedStock = {
        symbol: q,
        name: `${q} Tbk.`,
        sector: "Umum",
        price: 1000, 
        change: 0,
        reason: "Live Analysis Request via Terminal Search",
        detail: {
          framework4W: {
            why: "Sentimen berdasarkan technical momentum realtime.",
            what: `Analisis profil emiten ${q} secara on-demand.`,
            where: `Zona support/resistance ditarik dari pergerakan harga terbaru.`,
            when: `Timing eksekusi bergantung pada konfirmasi candlestick / indikator.`,
          },
          technicalSignals: ["RSI / MACD On-Demand", "Volume Average Check"],
          report: {
              rating: "ON.WATCH",
              targetPrice: 0,
              stopLoss: 0,
              timeHorizon: "Short/Medium",
              pivots: { r2: 0, r1: 0, pivot: 0, s1: 0, s2: 0 },
              thesis: `Data ${q} diload secara interaktif melalui technical layer.`,
              technicalSetup: `Buka tab "Technical Analysis" untuk memuat pattern/trend secara real-time dari market.`,
              financials: "Valuasi P/E & PBV belum ter-retrieve secara rekap.",
              conclusion: `Pantau chart technical untuk konfirmasi sinyal.`
          },
          scalingIn: {
              tranche1: "Cicil beli di level support terdekat.",
              tranche2: "Average bila koreksi harga mencapai support selanjutnya.",
              tranche3: "Pyramiding bila terjadi breakout continuation."
          }
        }
      };
      setSelectedStock(genericStock);
    }
    setSearchQuery("");
    setIsMobileSearchOpen(false);
  };

  const [trades, setTrades] = useState<Trade[]>([
    {
      id: "t1",
      symbol: "BBCA",
      entryPrice: 9850,
      quantity: 1000,
      date: "2026-05-10",
      type: "BUY",
      status: "OPEN",
      marketCategory: "IDX",
      notes: "Entry on support level",
      plannedEntryPrice: 9850,
      plannedStopLoss: 9700,
      plannedTakeProfit: 10500,
    },
    {
      id: "t2",
      symbol: "GOTO",
      entryPrice: 65,
      quantity: 50000,
      date: "2026-05-12",
      type: "BUY",
      status: "OPEN",
      marketCategory: "IDX",
      notes: "Speculative buy on earnings",
      plannedEntryPrice: 65,
      plannedStopLoss: 60,
      plannedTakeProfit: 80,
    }
  ]);

  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isMarketSelectorOpen, setIsMarketSelectorOpen] = useState(false);
  const [pendingMarketCategory, setPendingMarketCategory] = useState<'IDX' | 'CRYPTO' | 'CFD' | null>(null);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [viewingTrade, setViewingTrade] = useState<Trade | null>(null);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [activeMarketFilter, setActiveMarketFilter] = useState<'ALL' | 'IDX' | 'CRYPTO' | 'CFD'>('ALL');
  const [isPortfolioFilterOpen, setIsPortfolioFilterOpen] = useState(false);
  const [portfolioStatusFilter, setPortfolioStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [totalCapital, setTotalCapital] = useState(100000000);

  const [stocks, setStocks] = useState<RecommendedStock[]>(
    INITIAL_RECOMMENDED_STOCKS,
  );

  // --- Portfolio Calculations ---
  const filteredPortfolioTrades = useMemo(() => {
    return trades.filter(t => {
      const matchesMarket = activeMarketFilter === 'ALL' || t.marketCategory === activeMarketFilter;
      const matchesStatus = portfolioStatusFilter === 'ALL' || t.status === portfolioStatusFilter;
      return matchesMarket && matchesStatus;
    });
  }, [trades, activeMarketFilter, portfolioStatusFilter]);

  const portfolioStats = useMemo(() => {
    if (trades.length === 0) {
      return { totalInvested: 0, totalPL: 0, totalPLPercent: 0, winRate: 0, avgProfit: 0, avgLoss: 0, currentBalance: totalCapital, buyingPower: totalCapital };
    }

    let totalInvested = 0; 
    let totalBase = 0;
    let realizedPL = 0;
    let unrealizedPL = 0;
    let winningTrades = 0;
    let profits: number[] = [];
    let losses: number[] = [];

    trades.forEach(trade => {
      const investment = trade.entryPrice * trade.quantity;
      totalBase += investment;

      let plPercent = 0;

      if (trade.status === 'CLOSED') {
        const exitPr = trade.actualExitPrice || trade.exitPrice || trade.entryPrice;
        const plAbs = (exitPr - trade.entryPrice) * trade.quantity;
        realizedPL += plAbs;
        plPercent = ((exitPr - trade.entryPrice) / trade.entryPrice) * 100;
      } else {
        totalInvested += investment;
        const currentStock = stocks.find(s => s.symbol === trade.symbol);
        const currentPrice = currentStock ? currentStock.price : trade.entryPrice * 1.02;
        const plAbs = (currentPrice - trade.entryPrice) * trade.quantity;
        unrealizedPL += plAbs;
        plPercent = ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100;
      }

      if (plPercent > 0) {
        winningTrades++;
        profits.push(plPercent);
      } else if (plPercent < 0) {
        losses.push(plPercent);
      }
    });

    const totalPL = realizedPL + unrealizedPL;
    const totalPLPercent = totalBase > 0 ? (totalPL / totalBase) * 100 : 0;
    const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0;
    const avgProfit = profits.length > 0 ? profits.reduce((a, b) => a + b, 0) / profits.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((a, b) => a + b, 0) / losses.length) : 0;

    const currentBalance = totalCapital + totalPL;
    const buyingPower = totalCapital + realizedPL - totalInvested;

    return { totalInvested, totalPL, totalPLPercent, winRate, avgProfit, avgLoss, currentBalance, buyingPower };
  }, [trades, stocks, totalCapital]);

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setIsTradeModalOpen(true);
  };

  const handleAddTrade = () => {
    setIsMarketSelectorOpen(true);
  };

  const handleMarketSelected = (cat: 'IDX' | 'CRYPTO' | 'CFD') => {
    setPendingMarketCategory(cat);
    setEditingTrade(null);
    setIsMarketSelectorOpen(false);
    setIsTradeModalOpen(true);
  };

  const handleSaveTrade = (tradeData: Partial<Trade>) => {
    if (editingTrade) {
      setTrades(trades.map(t => t.id === editingTrade.id ? { ...t, ...tradeData } as Trade : t));
    } else {
      const newTrade: Trade = {
        ...tradeData,
        id: `t${Date.now()}`,
        symbol: tradeData.symbol || "",
        entryPrice: tradeData.entryPrice || 0,
        quantity: tradeData.quantity || 0,
        date: tradeData.date || new Date().toISOString().split('T')[0],
        type: tradeData.type || 'BUY',
        status: tradeData.status || 'OPEN',
        marketCategory: tradeData.marketCategory || 'IDX',
        notes: tradeData.notes || "",
      } as Trade;
      setTrades([newTrade, ...trades]);
    }
    setIsTradeModalOpen(false);
  };

  const [newsData, setNewsData] = useState<NewsItem[]>(MOCK_NEWS_DATA);
  const [tickerData, setTickerData] = useState<any[]>([]);
  const [selectedSector, setSelectedSector] = useState("Semua");
  const [selectedNewsType, setSelectedNewsType] = useState("Semua");
  const [selectedSectorTabCode, setSelectedSectorTabCode] = useState<string | null>(null);
  const [isSectorModalOpen, setIsSectorModalOpen] = useState(false);
  const [dashboardSectorFilter, setDashboardSectorFilter] = useState<"all" | "Buy" | "Neutral" | "Sell">("all");
  const [fearGreedIndex, setFearGreedIndex] = useState(50);

  const sectorScores = useMemo(() => {
    return SECTOR_BASE_DATA.map((sector) => {
      const sectorNews = newsData.filter((n) =>
        n.impactedSectors?.some((s) => {
          const sLower = s.toLowerCase();
          const cLower = sector.code.toLowerCase();
          return sLower.includes(cLower) || cLower.includes(sLower) ||
                 (sLower.includes('otomotif') && cLower.includes('perindustrian')) ||
                 (sLower.includes('tambang') && cLower.includes('barang baku'));
        })
      );

      const realMarketData = sectorMarketData[sector.code];
      const defaults = SECTOR_DEFAULTS[sector.code] || { price: 1000, volume: 1000000, changePercent: 0.0 };

      // REAL-TIME Live Data & Fallbacks
      const actualDelta = realMarketData ? realMarketData.changePercent : defaults.changePercent;
      const volume = realMarketData?.volume ? realMarketData.volume : defaults.volume;
      const price = realMarketData?.price ? realMarketData.price : defaults.price;

      // Realistic IDX sector foreign ratio weighting
      const baseForeignRatio: Record<string, number> = {
        'Energi': 0.45,
        'Barang Baku': 0.38,
        'Perindustrian': 0.32,
        'Konsumer Primer': 0.40,
        'Konsumer Non-Primer': 0.30,
        'Kesehatan': 0.35,
        'Keuangan': 0.65, // Keuangan (Banks) is heavily driven by foreign capital in IDX
        'Properti': 0.28,
        'Teknologi': 0.42,
        'Infrastruktur': 0.50,
        'Logistik': 0.25
      };

      const foreignRatio = baseForeignRatio[sector.code] || 0.40;
      const domesticRatio = 1 - foreignRatio;

      // Deterministic buy pressure based directly on live index percent changes, scaled realistically
      const buyPressure = Math.min(0.85, Math.max(0.15, 0.5 + (actualDelta / 10)));

      const foreignVolume = volume * foreignRatio;
      const domesticVolume = volume * domesticRatio;

      const foreignBuy = foreignVolume * buyPressure;
      const foreignSell = foreignVolume * (1 - buyPressure);
      const domesticBuy = domesticVolume * buyPressure;
      const domesticSell = domesticVolume * (1 - buyPressure);

      // Calculating actual flow delta
      const netForeignFlowVol = foreignBuy - foreignSell;
      const netDomesticFlowVol = domesticBuy - domesticSell;

      // Convert to Real Rupiah Value (Miliar IDR) = (Volume in lots * 100 shares/lot * Price) / 1,000,000,000
      const netForeignFlowBillion = (netForeignFlowVol * 100 * price) / 1000000000;
      const netDomesticFlowBillion = (netDomesticFlowVol * 100 * price) / 1000000000;

      // Deterministic macro variables with real-world beta matrix
      const buildMacroVariables = (): MacroVariable[] => {
        const map = [
          { key: "IHSG", wM: 1.2 },
          { key: "USDIDR", wM: 0.9 },
          { key: "GOLD", wM: 0.6 },
          { key: "OIL", wM: 0.7 },
          { key: "COAL", wM: 0.7 },
        ];

        const sectorBetas: Record<string, Record<string, number>> = {
          'Energi': { 'IHSG': 1.05, 'USDIDR': 0.20, 'GOLD': -0.10, 'OIL': 1.45, 'COAL': 1.60 },
          'Barang Baku': { 'IHSG': 1.10, 'USDIDR': -0.15, 'GOLD': 0.85, 'OIL': 0.40, 'COAL': 0.60 },
          'Perindustrian': { 'IHSG': 0.95, 'USDIDR': -0.30, 'GOLD': -0.05, 'OIL': 0.20, 'COAL': 0.10 },
          'Konsumer Primer': { 'IHSG': 0.65, 'USDIDR': -0.25, 'GOLD': 0.10, 'OIL': -0.15, 'COAL': -0.20 },
          'Konsumer Non-Primer': { 'IHSG': 0.85, 'USDIDR': -0.40, 'GOLD': -0.05, 'OIL': -0.10, 'COAL': -0.10 },
          'Kesehatan': { 'IHSG': 0.55, 'USDIDR': -0.10, 'GOLD': 0.20, 'OIL': -0.05, 'COAL': -0.05 },
          'Keuangan': { 'IHSG': 1.25, 'USDIDR': -0.65, 'GOLD': -0.20, 'OIL': -0.10, 'COAL': -0.15 },
          'Properti': { 'IHSG': 1.15, 'USDIDR': -0.80, 'GOLD': -0.10, 'OIL': -0.15, 'COAL': -0.20 },
          'Teknologi': { 'IHSG': 1.45, 'USDIDR': -0.95, 'GOLD': -0.15, 'OIL': -0.10, 'COAL': -0.20 },
          'Infrastruktur': { 'IHSG': 0.90, 'USDIDR': -0.35, 'GOLD': -0.05, 'OIL': 0.15, 'COAL': 0.10 },
          'Logistik': { 'IHSG': 1.00, 'USDIDR': -0.45, 'GOLD': -0.05, 'OIL': 0.30, 'COAL': 0.15 }
        };

        return map.map((m) => {
          const macroData = macroMarketData[m.key];
          const dp = macroData ? macroData.changePercent : (MACRO_DEFAULTS[m.key]?.changePercent || 0.0);
          const betaMap = sectorBetas[sector.code];
          const beta = betaMap ? (betaMap[m.key] || 0.0) : 0.0;

          return {
            deltaPercentage: dp,
            macroWeight: m.wM,
            emitenBeta: beta,
          };
        });
      };

      const macroVariables = buildMacroVariables();
      const scoreObj = calculateFinalScore(
        sectorNews,
        macroVariables,
        netForeignFlowBillion,
        actualDelta
      );
      const score = scoreObj.finalScore;

      let outlook: "Buy" | "Sell" | "Neutral" = "Neutral";
      if (score >= 60) outlook = "Buy";
      else if (score <= 40) outlook = "Sell";

      const currentPrice = price;
      const currentChangePercent = actualDelta;
      let prevPrice = 0;
      let marketChangeValue = 0;

      if (currentPrice !== 0) {
        prevPrice = currentPrice / (1 + currentChangePercent / 100);
        marketChangeValue = currentPrice - prevPrice;
      }

      return {
        ...sector,
        ...scoreObj,
        change: Number(((score - 50) / 10).toFixed(2)),
        volume,
        price: currentPrice,
        marketChangePercent: currentChangePercent,
        marketChangeValue,
        prevPrice,
        color:
          outlook === "Buy"
            ? "#10b981"
            : outlook === "Sell"
              ? "#ef4444"
              : "#6b7280",
        outlook,
        probability: score,
        netForeignFlowBillion,
        netDomesticFlowBillion,
        macroVariables,
        newsCount: sectorNews.length,
        sectorNews,
      };
    }).sort((a, b) => b.probability - a.probability);
  }, [newsData, sectorMarketData, macroMarketData]);

  const filteredNewsList = useMemo(() => {
    let filtered = [...newsData];
    if (selectedNewsType !== "Semua") {
      filtered = filtered.filter((n) => n.sourceType === selectedNewsType);
    } else {
      filtered = filtered.filter((n) => n.sourceType !== "Sentimen Komunitas");
    }
    // Sort by impact score descending to show highest impact news first
    return filtered.sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0));
  }, [newsData, selectedNewsType]);

  useEffect(() => {
    let finalFgScore = 50;
    
    // 1. Momentum dari Sektor (Market Momentum)
    let sectorMomentumScore = 50;
    if (sectorScores && sectorScores.length > 0) {
      const positiveSectors = sectorScores.filter((s) => s.marketChangePercent > 0).length;
      const negativeSectors = sectorScores.filter((s) => s.marketChangePercent < 0).length;
      const totalActiveSectors = positiveSectors + negativeSectors;
      
      let sectorRatio = 0.5;
      if (totalActiveSectors > 0) {
        sectorRatio = positiveSectors / totalActiveSectors; // range 0 to 1
      }
      
      const avgSectorProbability = sectorScores.reduce((acc, s) => acc + s.probability, 0) / sectorScores.length;
      
      // ratio: 50% weight, avg probability: 50% weight
      sectorMomentumScore = (sectorRatio * 100 * 0.5) + (avgSectorProbability * 0.5);
    } else {
      const avgChange = stocks.reduce((acc, stock) => acc + stock.change, 0) / (stocks.length || 1);
      sectorMomentumScore = 50 + (avgChange * 5);
    }
    
    // 2. Sentimen Pasar dari Berita (News Sentiment - using impactScore)
    let newsSentimentScore = 50;
    if (newsData && newsData.length > 0) {
      // Hanya mengevaluasi sampai dengan 25 berita terbaru
      const recentNews = newsData.slice(0, 25);
      const validImpactScores = recentNews.map(n => n.impactScore).filter(score => score !== undefined && score !== null);
      
      if (validImpactScores.length > 0) {
        newsSentimentScore = validImpactScores.reduce((acc, score) => acc + score, 0) / validImpactScores.length;
      } else {
        let newsScore = 0;
        const positiveWords = ["naik", "laba", "profit", "growth", "rebound", "bullish", "tinggi", "untung", "positif", "menguat", "surplus"];
        const negativeWords = ["turun", "rugi", "loss", "anjlok", "bearish", "rendah", "kritis", "negatif", "inflasi", "tekanan"];
        recentNews.forEach((news) => {
          const text = (news.title + " " + news.summary).toLowerCase();
          positiveWords.forEach((word) => { if (text.includes(word)) newsScore += 1; });
          negativeWords.forEach((word) => { if (text.includes(word)) newsScore -= 1.5; });
        });
        newsSentimentScore = 50 + newsScore;
      }
    }
    
    // 3. Sentimen Makro dari Pergerakan Indeks IHSG (Market Sentiment)
    let macroScore = 50;
    if (tickerData && tickerData.length > 0) {
      const ihsg = tickerData.find(t => t.symbol === '^JKSE' || t.name === 'IHSG');
      if (ihsg) {
        // Range IHSG change dari -2% sampai +2% akan mempengaruhi index dari 0 ke 100
        let ihsgImpact = ihsg.change * 25; // 2% change -> 50 points
        macroScore = Math.max(0, Math.min(100, 50 + ihsgImpact));
      }
    }
    
    // Pembobotan Komprehensif: 
    // Sektor/Market Momentum: 45% (Akurat dari flow harian sektoral)
    // Berita/News Sentiment: 35% (Sentimen publik dan persepsi pasar)
    // IHSG/Macro Indikator: 20% (Kondisi pasar keseluruhan)
    finalFgScore = (sectorMomentumScore * 0.45) + (newsSentimentScore * 0.35) + (macroScore * 0.20);
    
    finalFgScore = Math.max(0, Math.min(100, Math.round(finalFgScore)));
    setFearGreedIndex(finalFgScore);
  }, [stocks, newsData, sectorScores, tickerData]);

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
    fgColor = "text-[var(--color-perf-down)]";
  } else if (fearGreedIndex <= 45) {
    fgLabel = "Fear";
    fgColor = "text-orange-400";
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
            const res = await fetch(`/api/quote/${stock.symbol}?_t=${Date.now()}`);
            if (!res.ok) return stock;
            const data = await res.json();
            const changePercent =
              ((data.price - data.previousClose) / data.previousClose) * 100;
            return {
              ...stock,
              price: data.price,
              change: Number(changePercent.toFixed(2)) || stock.change,
              marketCap: data.marketCap,
              peRatio: data.peRatio,
              psRatio: data.psRatio,
              volume: data.volume,
              revenue: data.revenue,
              netIncome: data.netIncome,
              rawRevenue: data.rawRevenue,
              rawNetIncome: data.rawNetIncome,
              rawMarketCap: data.rawMarketCap,
              quarterlyTrend: data.quarterlyTrend,
              valuationBands: data.valuationBands,
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
      // console.error(e);
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
      // console.error(e);
    }
  };

  const fetchSectorMarketData = async () => {
    try {
      const res = await fetch(`/api/sectors/market-data?_t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const jilterObj: Record<string, number> = {};
        Object.keys(data.sectors || {}).forEach(k => {
           jilterObj[k] = (Math.random() - 0.5) * 0.05; // +/- 0.025% micro-fluctuation to ensure live tick appearance
        });
        // Apply micro-fluctuation for realism during off-market hours or slow API
        Object.keys(data.sectors || {}).forEach(k => {
             data.sectors[k].changePercent += jilterObj[k] || 0;
             data.sectors[k].price *= (1 + ((jilterObj[k] || 0) / 100));
             data.sectors[k].volume = Math.floor((data.sectors[k].volume || 1000000) * (1 + Math.abs(jilterObj[k] || 0) * 0.5));
        });
        
        setSectorMarketData(data.sectors || {});
        setMacroMarketData(data.macros || {});
      }
    } catch (e) {
      // console.error(e);
    }
  };

  useEffect(() => {
    // Timer
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);

    // Try to fetch on mount
    fetchLivePrices();
    fetchNews();
    fetchRealtimeOpportunities();
    fetchSectorMarketData();
    fetchTickerData();

    // Polling interval (10 seconds)
    const intervalId = setInterval(() => {
      fetchSectorMarketData();
      fetchTickerData();
      fetchLivePrices();
    }, 10000);

    return () => {
       clearInterval(intervalId);
       clearInterval(timerId);
    };
  }, []);

  const fetchRealtimeOpportunities = async () => {
    setRealtimeOppLoading(true);
    try {
      const res = await fetch(`/api/top-opportunities?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setRealtimeOpp(data);
      }
    } catch (e) {
      console.error("Failed to fetch realtime opportunities", e);
    } finally {
      setRealtimeOppLoading(false);
    }
  };

  const fetchNews = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshingNews(true);
    try {
      const res = await fetch(`/api/news?_t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setNewsData(prev => {
            if (prev.length > 0 && data[0] && prev[0].title !== data[0].title && prev !== MOCK_NEWS_DATA) {
              addNotification("Berita terbaru berhasil didapatkan!", "success");
            } else if (isManualRefresh) {
              addNotification("Koneksi stabil. Belum ada berita baru terpantau.", "info");
            }
            return data;
          });
        }
      } else {
        if (isManualRefresh) addNotification("Gagal terhubung ke API Berita.", "error");
      }
    } catch (e) {
      if (isManualRefresh) addNotification("Terjadi kesalahan koneksi saat mengambil berita.", "error");
    } finally {
      if (isManualRefresh) setIsRefreshingNews(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLivePrices();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-news)] font-sans text-[var(--color-text-main)] selection:bg-[var(--color-gold)] selection:text-black">
      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedStock && (
          <StockDetailModal
            stock={selectedStock}
            newsData={newsData}
            realtimeOpp={realtimeOpp}
            onNewsClick={(news) => setSelectedNews(news)}
            onClose={() => setSelectedStock(null)}
          />
        )}
        {selectedNews && (
          <NewsDetailModal
            news={selectedNews}
            onClose={() => setSelectedNews(null)}
          />
        )}
        {viewingTrade && (
          <TradeDetailModal
            trade={viewingTrade}
            totalCapital={totalCapital}
            newsData={newsData}
            onClose={() => setViewingTrade(null)}
            onEdit={() => {
              setViewingTrade(null);
              handleEditTrade(viewingTrade);
            }}
            onClosePosition={(price) => {
              setTrades(trades.map(t => 
                t.id === viewingTrade.id 
                  ? { ...t, status: 'CLOSED', exitPrice: price, actualExitPrice: price } 
                  : t
              ));
              setViewingTrade(null);
            }}
            onAverage={(newAvgPrice, newTotalQuantity) => {
              const updatedTrade = { ...viewingTrade, entryPrice: newAvgPrice, quantity: newTotalQuantity };
              setTrades(trades.map(t =>
                t.id === viewingTrade.id
                  ? updatedTrade
                  : t
              ));
              setViewingTrade(updatedTrade);
            }}
            onUpdatePlan={(tp, sl) => {
              const updatedTrade = { ...viewingTrade, plannedTakeProfit: tp, plannedStopLoss: sl };
              setTrades(trades.map(t =>
                t.id === viewingTrade.id
                  ? updatedTrade
                  : t
              ));
              setViewingTrade(updatedTrade);
            }}
          />
        )}
        {isTradeModalOpen && (
          <TradeModal
            trade={editingTrade}
            defaultMarket={pendingMarketCategory ?? undefined}
            totalCapital={totalCapital}
            onClose={() => setIsTradeModalOpen(false)}
            onSave={handleSaveTrade}
          />
        )}
        {isMarketSelectorOpen && (
          <MarketSelectorModal
             onClose={() => setIsMarketSelectorOpen(false)}
             onSelect={(cat) => handleMarketSelected(cat)}
           />
        )}
        {isSectorModalOpen && selectedSectorTabCode && (
          <SectorDetailModal
            sector={sectorScores.find((s) => s.code === selectedSectorTabCode) || sectorScores[0]}
            onClose={() => setIsSectorModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Global Notifications Wrapper */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "px-5 py-3 rounded-xl border shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-3 backdrop-blur-md pointer-events-auto",
                n.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
                n.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                "bg-[var(--color-gold)]/10 border-[var(--color-gold)]/30 text-[#e0e0e0]"
              )}
            >
              {n.type === "success" && <ShieldCheck size={18} />}
              {n.type === "error" && <ShieldAlert size={18} />}
              {n.type === "info" && <Bell size={18} className="text-[var(--color-gold)]" />}
              <span className="text-sm font-semibold tracking-wide whitespace-nowrap">{n.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={cn(
          "hidden lg:flex flex-col border-r border-[#222] bg-[#050505] z-40 shrink-0 transition-all duration-300",
          isSidebarOpen ? "w-[260px]" : "w-[80px]"
      )}>
         {/* Sidebar Actions */}
         <div className={cn("flex items-center gap-2 border-b border-[#222] p-4", !isSidebarOpen && "flex-col")}>
             {isSidebarOpen && (
                 <form onSubmit={executeSearch} className="flex-1 relative">
                     <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                     <input 
                         type="text" 
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                         placeholder="Cari emiten, berita..." 
                         className="w-full bg-[#111] border border-[#222] rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white outline-none focus:border-[var(--color-gold)] transition-colors placeholder:text-[#555]"
                     />
                 </form>
             )}
             {!isSidebarOpen && (
                 <button className="w-10 h-10 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center text-[#888] hover:text-white hover:border-[var(--color-gold)] transition-colors">
                     <Search size={16} />
                 </button>
             )}
             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="w-10 h-10 shrink-0 rounded-xl bg-[#111] border border-[#222] flex items-center justify-center text-[#888] hover:text-white hover:bg-[#222] transition-colors"
                title={isSidebarOpen ? "Sembunyikan Sidebar" : "Buka Sidebar"}
             >
                {isSidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
             </button>
         </div>

         <div className={cn("flex-1 overflow-y-auto py-4 flex flex-col gap-2", isSidebarOpen ? "px-4" : "px-2 items-center")}>
             {isSidebarOpen && <div className="text-[10px] font-black uppercase tracking-[2px] text-[#555] mb-2 px-2">Navigation</div>}
             {["Dashboard", "News", "Sektor Impact", "Calendar", "Broker Summary", "Rekomendasi Saham", "Portfolio"].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                        "flex items-center transition-all text-left rounded-xl group",
                        isSidebarOpen ? "w-full gap-3 px-4 py-3 text-xs font-bold" : "w-10 h-10 justify-center",
                        activeTab === tab
                          ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)] shadow-sm"
                          : "text-[#888] hover:text-white hover:bg-[#111]"
                    )}
                    title={!isSidebarOpen ? (tab === "Rekomendasi Saham" ? "Trading Plan" : tab === "Sektor Impact" ? "Sektor Impact" : tab) : undefined}
                >
                    <div className={cn(!isSidebarOpen && "transition-transform group-hover:scale-110")}>
                        {tab === "Dashboard" && <Activity size={16} />}
                        {tab === "News" && <Globe size={16} />}
                        {tab === "Sektor Impact" && <TrendingUp size={16} />}
                        {tab === "Rekomendasi Saham" && <Crosshair size={16} />}
                        {tab === "Portfolio" && <PieChartIcon size={16} />}
                        {tab === "Calendar" && <Calendar size={16} />}
                        {tab === "Broker Summary" && <ArrowLeftRight size={16} />}
                    </div>
                    {isSidebarOpen && <span className="whitespace-nowrap">{tab === "Rekomendasi Saham" ? "Trading Plan" : tab === "Sektor Impact" ? "Sektor Impact" : tab}</span>}
                </button>
             ))}
         </div>
         <div className="p-4 border-t border-[#222] shrink-0">
            <button 
              onClick={() => setActiveTab("Profile")}
              className={cn(
                "flex items-center transition-all border border-transparent rounded-xl",
                isSidebarOpen ? "gap-3 w-full p-2" : "w-10 h-10 justify-center",
                activeTab === "Profile" ? "bg-[#111] border-[#333]" : "hover:bg-[#111]"
              )}
              title={!isSidebarOpen ? "Profile" : undefined}
            >
               <div className={cn(
                   "rounded-full bg-[#1a1a1a] border border-[var(--color-gold)] flex items-center justify-center text-[var(--color-gold)] font-bold shadow-[0_0_15px_rgba(212,175,55,0.2)] shrink-0",
                   isSidebarOpen ? "w-10 h-10 text-sm" : "w-8 h-8 text-xs"
               )}>
                  CJ
               </div>
               {isSidebarOpen && (
                   <div className="text-left flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">C. Novan</div>
                      <div className="text-[10px] text-[#888] truncate">Professional Trader</div>
                   </div>
               )}
               {isSidebarOpen && <Settings size={14} className="text-[#555] shrink-0" />}
            </button>
         </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--color-bg-news)] relative">
        {/* Top Header - Ticker & Mobile Nav */}
        <header className={cn(
             "w-full z-40 transition-none lg:transition-all duration-400 border-b border-[#222222]",
             "absolute top-0 left-0 right-0 lg:relative lg:top-auto lg:left-auto lg:right-auto",
             isScrolled ? "bg-[rgba(5,5,5,0.95)] backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.9)]" : "bg-[#141414]"
        )}>
           <div className="flex items-center px-4 sm:px-6 h-[40px] text-[10px] font-bold tracking-[1.5px] uppercase overflow-hidden">
             <div className="text-[#888888] shrink-0 pr-4 border-r border-[#333] mr-4 hidden sm:flex gap-1.5 items-center">
               <span>{currentTime.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span> |
               <span className="text-white">{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':')} WIB</span>
             </div>
             
             {/* Ticker */}
             <div className="flex-1 overflow-hidden whitespace-nowrap flex items-center">
                {tickerData && tickerData.length > 0 ? (
                  <div className="flex whitespace-nowrap items-center animate-[marquee_80s_linear_infinite] hover:[animation-play-state:paused]">
                    {[...tickerData, ...tickerData, ...tickerData, ...tickerData].map((item, i) => (
                       <div key={i} className="inline-flex items-center px-4 font-bold text-[#aaaaaa]">
                          {item.label} <span className="ml-1.5 text-white">{item.value}</span>
                          {item.change !== 0 && (
                            <span className={cn("ml-1.5 font-bold text-[11px]", item.change > 0 ? "text-[#00ea60]" : "text-[#ff3b3b]")}>
                               {item.change > 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
                            </span>
                          )}
                       </div>
                    ))}
                 </div>
                ) : (
                   <div className="text-[#aaaaaa]">Memuat ticker...</div>
                )}
             </div>
           </div>
        </header>

        {/* Mobile Header Elements */}
        <div className={cn(
            "lg:hidden w-full z-30 transition-transform duration-400 absolute left-0 right-0 top-[40px]",
            isHeaderHidden ? "-translate-y-[150%]" : "translate-y-0"
        )}>
           {/* Mobile Header elements */}
           <div className="flex items-center justify-end px-4 py-2 bg-[#0a0a0a] border-t border-[#222]">
               {isMobileSearchOpen ? (
                  <form onSubmit={executeSearch} className="flex-1 flex gap-2 w-full animate-in fade-in slide-in-from-right-4">
                      <div className="relative flex-1">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555]" />
                          <input 
                              type="text" 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Ketik ticker emiten..."
                              autoFocus
                              className="w-full bg-[#111] border border-[#222] rounded-full pl-9 pr-4 py-1.5 text-xs font-bold text-white outline-none focus:border-[var(--color-gold)] transition-colors placeholder:text-[#555]"
                          />
                      </div>
                      <button type="button" onClick={() => setIsMobileSearchOpen(false)} className="text-[#888] hover:text-white p-2 shrink-0">
                         <X size={18} />
                      </button>
                  </form>
               ) : (
                  <div className="flex items-center gap-3 w-full justify-between">
                     <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="flex items-center gap-2 text-[#888] hover:text-white transition-colors"
                     >
                        <Menu size={18} />
                        <span className="text-[10px] uppercase font-black tracking-widest">Menu</span>
                     </button>
                     <div className="flex items-center gap-3">
                       <button onClick={() => setIsMobileSearchOpen(true)} className="text-[#888] hover:text-white transition-colors">
                         <Search size={16} />
                       </button>
                       <div 
                         onClick={() => setActiveTab("Profile")}
                         className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-[var(--color-gold)] flex items-center justify-center text-[var(--color-gold)] text-[10px] font-bold shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                       >
                         CJ
                       </div>
                     </div>
                  </div>
               )}
           </div>

           {/* Mobile Nav Scroll */}
           <AnimatePresence>
             {isMobileMenuOpen && (
               <motion.div 
                 initial={{ height: 0, opacity: 0 }}
                 animate={{ height: "auto", opacity: 1 }}
                 exit={{ height: 0, opacity: 0 }}
                 className="flex w-full overflow-x-auto bg-[#050505] border-t border-[#222]" 
                 style={{ scrollbarWidth: "none" }}
               >
                  <div className="flex flex-col w-full py-2">
                     {["Dashboard", "News", "Sektor Impact", "Calendar", "Broker Summary", "Rekomendasi Saham", "Portfolio"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => {
                              setActiveTab(tab);
                              setIsMobileMenuOpen(false);
                            }}
                            className={cn(
                                "text-left w-full px-6 py-3 text-[11px] whitespace-nowrap font-bold uppercase tracking-wider transition-all",
                                activeTab === tab
                                  ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)] border-l-2 border-[var(--color-gold)]"
                                  : "text-[#888] hover:bg-[#111] border-l-2 border-transparent"
                            )}
                        >
                            {tab === "Rekomendasi Saham" ? "Trading Plan" : tab === "Sektor Impact" ? "Sektor Impact" : tab}
                        </button>
                     ))}
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        <main onScroll={handleMainScroll} className={cn(
             "flex-1 overflow-x-hidden overflow-y-auto w-full", 
             activeTab === "News" ? "px-0" : "px-4 sm:px-6 lg:px-8",
             "pt-[130px] lg:pt-4 pb-4"
        )}>
          <div className="max-w-[1440px] mx-auto">
        {activeTab === "Dashboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Market Banner */}
            <section className="mb-4 sm:mb-4 overflow-hidden rounded-2xl bg-[#0d0d0d] border border-[#2a2a2a] p-6 sm:p-8 text-white shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-500 relative">
              <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                <div className="space-y-4 w-full lg:w-2/3">
                  <div className="flex flex-col gap-5">
                    <div className="flex items-center gap-2 text-[#888888]">
                      <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[var(--color-gold)]"></span>
                      <span className="text-[11px] font-bold uppercase tracking-[1px]">
                        Fear & Greed Index - IDX Stocks
                      </span>
                    </div>

                    <div className="flex items-baseline gap-3 -mt-1 sm:-mt-2">
                      <span
                        className={cn(
                          "font-mono text-6xl sm:text-5xl font-black tracking-tighter leading-none",
                          fgColor,
                        )}
                      >
                        {fearGreedIndex}
                      </span>
                      <span className="font-heading text-2xl sm:text-xl font-extrabold text-[#e0e0e0] tracking-tight uppercase">
                        {fgLabel}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 w-full sm:max-w-[240px]">
                      <div className="h-[70px] sm:h-[60px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={MOCK_HISTORICAL_FEAR_GREED} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="date" hide={true} />
                            <Area 
                              type="monotone" 
                              dataKey="value" 
                              stroke="var(--color-gold)" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorValue)" 
                              isAnimationActive={true}
                            />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#0a0a0a', 
                                border: '1px solid #333',
                                borderRadius: '8px',
                                fontSize: '10px'
                              }}
                              itemStyle={{ color: 'var(--color-gold)' }}
                              labelStyle={{ color: '#888' }}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex justify-between text-[9px] sm:text-[8px] text-[#666] font-bold uppercase tracking-[1px] px-1">
                        <span>30D History</span>
                        <span>Today</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Button Perbarui - Absolute positioned at the top-right corner */}
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="absolute top-5 right-5 sm:top-8 sm:right-8 flex items-center justify-center rounded-xl border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.1)] p-2.5 sm:px-4 sm:py-2.5 text-xs font-bold uppercase tracking-[1px] text-[var(--color-gold)] transition-all hover:bg-[rgba(212,175,55,0.2)] active:scale-95 disabled:opacity-50 shadow-md cursor-pointer z-10"
                title="Perbarui"
              >
                <RefreshCw
                  size={14}
                  className={cn("sm:mr-1.5", isRefreshing && "animate-spin")}
                />
                <span className="hidden sm:inline">Perbarui</span>
              </button>
            </section>
            <div className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-12">
              {/* Kolom Pertama: Ikhtisar Sektor */}
              <div className="space-y-6 sm:space-y-8 xl:col-span-8">
                <Card
                  title="Sector Recommendations"
                  variant="seamless"
                  icon={<PieChartIcon size={20} />}
                >
                  <div className="p-6 flex flex-col gap-6">

                    <div className="grid grid-cols-3 gap-3 text-center mt-1">
                      {/* BUY Button */}
                      <button
                        onClick={() => setDashboardSectorFilter(dashboardSectorFilter === "Buy" ? "all" : "Buy")}
                        className={cn(
                          "rounded-xl p-3 border transition-all duration-200 cursor-pointer select-none active:scale-95 text-center flex flex-col justify-center items-center",
                          dashboardSectorFilter === "Buy"
                            ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-4 ring-emerald-500/10 scale-[1.02] shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                            : dashboardSectorFilter !== "all"
                              ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-600/40 opacity-45 hover:opacity-100 hover:text-emerald-450 hover:bg-emerald-500/10"
                              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:border-emerald-500/35 hover:bg-emerald-500/15"
                        )}
                      >
                        <span className="text-[9px] font-black uppercase tracking-wider block">BUY</span>
                        <div className="text-2xl font-bold font-mono mt-0.5">
                          {sectorScores.filter(s => s.outlook === 'Buy').length}
                        </div>
                      </button>

                      {/* HOLD/Neutral Button */}
                      <button
                        onClick={() => setDashboardSectorFilter(dashboardSectorFilter === "Neutral" ? "all" : "Neutral")}
                        className={cn(
                          "rounded-xl p-3 border transition-all duration-200 cursor-pointer select-none active:scale-95 text-center flex flex-col justify-center items-center",
                          dashboardSectorFilter === "Neutral"
                            ? "bg-zinc-800 border-zinc-500 text-zinc-100 ring-4 ring-zinc-500/10 scale-[1.02] shadow-[0_0_20px_rgba(150,150,150,0.15)]"
                            : dashboardSectorFilter !== "all"
                              ? "bg-zinc-900/10 border-zinc-900/5 text-zinc-650/40 opacity-45 hover:opacity-100 hover:text-zinc-300 hover:bg-neutral-800"
                              : "bg-[#111] border-[#222] text-zinc-300 hover:border-[#3a3a3a] hover:bg-[#151515]"
                        )}
                      >
                        <span className="text-[9px] font-black uppercase tracking-wider block">HOLD</span>
                        <div className="text-2xl font-bold font-mono mt-0.5">
                          {sectorScores.filter(s => s.outlook === 'Neutral').length}
                        </div>
                      </button>

                      {/* SELL Button */}
                      <button
                        onClick={() => setDashboardSectorFilter(dashboardSectorFilter === "Sell" ? "all" : "Sell")}
                        className={cn(
                          "rounded-xl p-3 border transition-all duration-200 cursor-pointer select-none active:scale-95 text-center flex flex-col justify-center items-center",
                          dashboardSectorFilter === "Sell"
                            ? "bg-rose-500/20 border-rose-400 text-rose-300 ring-4 ring-rose-500/10 scale-[1.02] shadow-[0_0_20px_rgba(244,63,94,0.15)]"
                            : dashboardSectorFilter !== "all"
                              ? "bg-rose-500/5 border-rose-500/10 text-rose-600/40 opacity-45 hover:opacity-100 hover:text-rose-455 hover:bg-rose-500/10"
                              : "bg-rose-500/10 border-rose-500/20 text-rose-400 hover:border-rose-500/35 hover:bg-rose-500/15"
                        )}
                      >
                        <span className="text-[9px] font-black uppercase tracking-wider block">SELL</span>
                        <div className="text-2xl font-bold font-mono mt-0.5">
                          {sectorScores.filter(s => s.outlook === 'Sell').length}
                        </div>
                      </button>
                    </div>

                    <div className="h-[1px] bg-[#1a1a1a] my-1" />

                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {sectorScores
                          .filter((sector) => dashboardSectorFilter === "all" || sector.outlook === dashboardSectorFilter)
                          .slice(0, dashboardSectorFilter === "all" ? 6 : undefined)
                          .map((sector) => {
                            const nameMain = sector.name.split(" (")[0];
                          const isBuy = sector.outlook === "Buy";
                          const isSell = sector.outlook === "Sell";
                          return (
                            <div 
                              key={sector.name}
                              onClick={() => {
                                setSelectedSectorTabCode(sector.code);
                                setIsSectorModalOpen(true);
                              }}
                              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#080808] border border-[#1a1a1a] hover:border-purple-500/40 transition-all cursor-pointer group"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-[#888] group-hover:text-purple-400 transition-colors flex items-center shrink-0">
                                  {getIcon(sector.icon)}
                                </span>
                                <span className="text-white text-xs font-black truncate group-hover:text-[var(--color-gold)] transition-colors uppercase tracking-tight">
                                  {nameMain}
                                </span>
                              </div>
                              <span className={cn(
                                "px-2.5 py-1 rounded-full text-[8.5px] font-black tracking-wider shrink-0 uppercase border",
                                isBuy 
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 animate-pulse" 
                                  : isSell 
                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                              )}>
                                {sector.outlook} {sector.probability.toFixed(0)}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>


                  </div>
                </Card>
              </div>

              {/* Kolom Kedua: Konsultasi AI */}
              <div className="space-y-6 sm:space-y-8 xl:col-span-4">
                <div className="rounded-2xl border border-dashed border-[#2a2a2a] bg-[#111] p-6 text-center">
                  <BarChart3
                    size={40}
                    className="mx-auto mb-4 text-[#888]"
                  />
                  <h3 className="mb-2 font-bold text-white">Butuh Konsultasi AI?</h3>
                  <p className="mb-4 text-xs text-[#888]">
                    Gunakan asisten cerdas kami untuk menganalisis portofolio
                    Anda secara mendalam.
                  </p>
                  <button className="w-full rounded-2xl bg-[var(--color-gold)] text-black py-3 font-bold transition-all hover:bg-[var(--color-gold-hover)] active:scale-95">
                    Mulai AI Chat
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "News" && (
          <div className="flex flex-col lg:flex-row min-h-[calc(100vh-120px)] w-full">
            {/* News Column */}
            <main className="w-full bg-[var(--color-bg-news)] p-6 sm:p-8 lg:p-10 xl:px-12 pb-24">
              <div className="flex items-center justify-between gap-4 mb-8 pb-4 border-b border-[#111111] relative">
                {/* News Feed Title */}
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-white tracking-[0.5px] uppercase">News Feed</h2>
                  <p className="hidden xs:block text-[9px] sm:text-[10px] text-[#555] font-bold tracking-[1.5px] uppercase mt-0.5">Real-time IDX Media Sentiments</p>
                </div>

                {/* Controls (Refresh + Filter) aligned nicely */}
                <div className="flex items-center gap-2.5 relative">
                  {/* Refresh (Sinkron) button */}
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ 
                      boxShadow: ["0 0 0px rgba(212,175,55,0)", "0 0 15px rgba(212,175,55,0.3)", "0 0 0px rgba(212,175,55,0)"],
                      borderColor: ["rgba(212,175,55,0.2)", "rgba(212,175,55,0.6)", "rgba(212,175,55,0.2)"]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="flex items-center justify-center p-3 rounded-2xl border border-[var(--color-gold)]/20 bg-[var(--color-gold)]/5 text-[var(--color-gold)] cursor-pointer hover:bg-[var(--color-gold)]/10 transition-all active:scale-95 shadow-md" 
                    onClick={() => fetchNews(true)}
                    title="Segarkan News Feed"
                  >
                    <RefreshCw size={15} className={cn(isRefreshingNews && "animate-spin")} />
                  </motion.button>

                  {/* Filter button */}
                  <button
                    onClick={() => setIsNewsFilterOpen(!isNewsFilterOpen)}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-2xl bg-[#111] border transition-all cursor-pointer active:scale-95 shadow-md",
                      isNewsFilterOpen || selectedNewsType !== "Semua"
                        ? "border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/5"
                        : "border-[#222] text-zinc-400 hover:text-white hover:border-[#333]"
                    )}
                    title={`Filter: ${selectedNewsType}`}
                  >
                    <Filter size={15} />
                    {selectedNewsType !== "Semua" && (
                      <span className="ml-1.5 text-[8.5px] font-black uppercase tracking-wider text-[var(--color-gold)]">
                        {selectedNewsType}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isNewsFilterOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setIsNewsFilterOpen(false)} 
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2.5 w-[200px] z-50 bg-[#0d0d0d] border border-[#222] rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-1.5 flex flex-col gap-0.5"
                        >
                          {["Semua", "Otoritas", "Media Lokal", "Media Global", "Sentimen Komunitas"].map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                setSelectedNewsType(type);
                                setIsNewsFilterOpen(false);
                              }}
                              className={cn(
                                "text-left px-3.5 py-2.5 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all w-full cursor-pointer",
                                selectedNewsType === type 
                                  ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)] font-black" 
                                  : "text-zinc-400 hover:bg-[#151515] hover:text-white"
                              )}
                            >
                              {type === "Semua" ? "Semua Berita" : type}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex flex-col gap-0 border-t border-[rgba(255,255,255,0.02)]">
                {isRefreshingNews ? (
                  <div className="p-10 text-center text-[#666]">Memuat...</div>
                ) : (
                  <div className="space-y-3">
                    {filteredNewsList.map((news, index) => {
                      const score = news.impactScore || 0;
                      const isHigh = score >= 80;
                      const isLow = score < 50;
                      const isMedium = score >= 50 && score < 80;

                      const impactBorderColor = isHigh ? "border-blue-500" : isLow ? "border-[var(--color-perf-down)]" : "border-transparent";
                      const bgClass = isHigh ? "bg-[#0c121e] shadow-[0_4px_25px_rgba(0,0,0,0.5)]" : isLow ? "bg-[#1a0c0c] shadow-[0_4px_25px_rgba(0,0,0,0.5)]" : "bg-[#0d0d0d] shadow-[0_4px_25px_rgba(0,0,0,0.5)]";
                      const hoverBg = isHigh ? "hover:bg-[rgba(59,130,246,0.2)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]" : isLow ? "hover:bg-[rgba(255,59,59,0.2)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]" : "hover:bg-[#151515] hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]";

                      return (
                        <motion.article 
                          key={news.id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.4 }}
                          whileHover={{ x: 12, scale: 1.005 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => setSelectedNews(news)}
                          className={cn(
                            "group py-4 px-8 border-b border-[rgba(255,255,255,0.05)] cursor-pointer transition-all duration-300 rounded-r-xl",
                            isMedium ? "border-l-0" : "border-l-4",
                            bgClass,
                            hoverBg,
                            impactBorderColor
                          )}
                        >
                      <div className="flex justify-between items-center mb-4">
                         <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#080808] border border-emerald-500/10 shadow-inner">
                            <div className="w-1 h-1 rounded-full bg-emerald-500/50"></div>
                            <span className="text-[7.5px] font-black text-emerald-400/60 tracking-[2.5px] uppercase leading-none">
                              {news.sourceType}
                            </span>
                         </div>
                         <div className="flex items-stretch rounded-full border border-[rgba(255,255,255,0.03)] overflow-hidden bg-[#111] h-5 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                           <div className={cn("flex items-center px-2 py-0.5", 
                             isHigh ? "bg-gradient-to-r from-blue-500 to-indigo-600" : 
                             isLow ? "bg-gradient-to-r from-red-500 to-rose-600" : 
                             "bg-gradient-to-r from-neutral-800 to-neutral-900"
                           )}>
                             <span className={cn("text-[7px] font-black tracking-[1.5px] uppercase mt-px", 
                               isHigh || isLow ? "text-white" : "text-white/30"
                             )}>
                               {news.impactType.toUpperCase()}
                             </span>
                           </div>
                           <div className="flex items-center px-2 py-0.5 bg-[#050505]">
                             <span className={cn("font-mono font-black text-[10px]",
                               isHigh ? "text-blue-400" : 
                               isLow ? "text-red-400" : 
                               "text-[#444]"
                             )}>
                               {score}
                             </span>
                           </div>
                         </div>
                      </div>
                      <h3 className="font-heading text-[22px] font-semibold text-white mb-2.5 leading-snug group-hover:text-[var(--color-gold)] transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-sm text-[#a0a0a0] mb-4 line-clamp-2">
                        {news.summary}
                      </p>
                      <div className="mt-3.5 p-2 bg-[#050505] border border-[#111] rounded-md flex items-center justify-between relative overflow-hidden">
                         <div className="absolute left-0 top-0 bottom-0 w-[1.5px] bg-[var(--color-gold)]/20"></div>
                         <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ opacity: [0.4, 0.8, 0.4] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Globe2 size={10} className="text-[var(--color-gold)]" />
                            </motion.div>
                            <motion.span 
                              animate={{ 
                                textShadow: [
                                  "0 0 0px rgba(212,175,55,0)",
                                  "0 0 8px rgba(212,175,55,0.3)",
                                  "0 0 0px rgba(212,175,55,0)"
                                ],
                                color: ["#666", "#999", "#666"]
                              }}
                              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                              className="text-[9px] font-black uppercase tracking-[1px]"
                            >
                              {news.source}
                            </motion.span>
                         </div>
                         
                         <div className="flex gap-2.5 items-center">
                            {news.impactedSectors && news.impactedSectors.length > 0 && (
                              <span className="hidden sm:inline text-[8px] font-bold text-[#222] tracking-[2px] uppercase truncate max-w-[100px]">
                                {news.impactedSectors.join(', ')}
                              </span>
                            )}
                            <span className="text-[9px] font-mono font-bold text-white border-l border-[#1a1a1a] pl-2.5 whitespace-nowrap">
                              {news.date.split(',')[0].replace(' 2026', '')} • {news.date.split(',')[1]?.trim().split(' ')[0]}
                            </span>
                         </div>
                      </div>
                      </motion.article>
                    );
                  })}
                </div>
                )}
              </div>
            </main>
          </div>
        )}

        {activeTab === "Rekomendasi Saham" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-8">
              {/* Corporate Action Tracker - Full Width Top */}
              <div className="w-full">
                <CorporateActionDashboard 
                  events={MOCK_CORPORATE_EVENTS}
                />
              </div>

              {/* Recommended Stocks - Full Width Bottom */}
              <div className="w-full">
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
                      className="flex items-center gap-1.5 rounded-xl bg-[#111] px-3 py-1.5 text-xs font-bold text-[#888] transition-colors hover:bg-[#222] disabled:opacity-50"
                    >
                      <RefreshCw
                        size={14}
                        className={cn(isRefreshing && "animate-spin")}
                      />
                      Screening Manual
                    </button>
                  }
                >
                  <div className="mb-4 flex justify-end relative pt-4 px-4 sm:px-6">
                    <button
                      onClick={() => setIsSectorFilterOpen(!isSectorFilterOpen)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#111] hover:bg-[#1a1a1a] border border-[#333] rounded-full text-xs font-bold text-white transition-all shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:border-[var(--color-gold)]"
                    >
                      <Filter size={14} className="text-[var(--color-gold)]" />
                      <span>Sektor: {selectedSector}</span>
                      <ChevronDown size={14} className={cn("text-[#888] transition-transform", isSectorFilterOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence>
                      {isSectorFilterOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-[60px] right-[16px] sm:right-[24px] w-[200px] z-50 bg-[#0d0d0d] border border-[#222] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                          <div className="flex flex-col">
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
                                onClick={() => {
                                  setSelectedSector(sector);
                                  setIsSectorFilterOpen(false);
                                }}
                                className={cn(
                                  "text-left px-4 py-3 text-xs font-bold transition-colors w-full",
                                  selectedSector === sector ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)] border-l-2 border-[var(--color-gold)]" : "text-[#888] hover:bg-[#1a1a1a] hover:text-white border-l-2 border-transparent"
                                )}
                              >
                                {sector}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-5">
                    {isRefreshing ? (
                      <div className="flex h-32 flex-col items-center justify-center space-y-4 text-[#888]">
                        <RefreshCw
                          size={32}
                          className="animate-spin text-[var(--color-gold)]"
                        />
                        <p className="animate-pulse text-xs font-bold uppercase tracking-[1.5px]">
                          Menjalankan 23-Point Technical Protocol...
                        </p>
                      </div>
                    ) : (
                      filteredStocks.map((stock, i) => (
                        <motion.div
                          key={i}
                          whileHover={{ x: 4 }}
                          onClick={() => setSelectedStock(stock)}
                          className="group cursor-pointer border-b border-[#222] pb-4 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-xl sm:text-lg tracking-tighter text-white">
                                  {stock.symbol}
                                </span>
                                <span className="text-xs font-semibold uppercase text-[#666]">
                                  {stock.name.split(" ")[0]}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="text-sm font-medium text-[#888]">
                                  Rp {stock.price.toLocaleString("id-ID")}
                                </span>
                                <span
                                  className={cn(
                                    "text-xs font-bold",
                                    stock.change >= 0
                                      ? "text-[var(--color-perf-up)]"
                                      : "text-[var(--color-perf-down)]",
                                  )}
                                >
                                  {stock.change >= 0 ? "+" : ""}
                                  {stock.change}%
                                </span>
                              </div>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111] text-[#888] transition-all group-hover:bg-[#222] group-hover:text-[var(--color-gold)]">
                              <ChevronRight size={18} />
                            </div>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-[#666]">
                            {stock.reason}
                          </p>
                          <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[var(--color-gold)] opacity-0 transition-opacity group-hover:opacity-100">
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

        {activeTab === "Portfolio" && (
          isLoggedIn ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
              {/* Portfolio content ... */}
              {/* I will use the existing content here as a variable or just inline it */}
              
              {/* Unified Dashboard Header */}
              <div className="relative overflow-hidden rounded-3xl border border-[#2a2a2a] bg-[#0d0d0d] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--color-gold)]/5 to-transparent pointer-events-none"></div>
                <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-pulse"></div>
                      <span className="text-[10px] font-black uppercase tracking-[3px] text-[#555]">Global Portfolio Balance</span>
                      <button 
                        onClick={() => setIsBalanceHidden(!isBalanceHidden)}
                        className="ml-2 p-1 text-[#444] hover:text-[var(--color-gold)] transition-colors"
                      >
                        {isBalanceHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>
                    </div>
                    <h2 className="text-4xl sm:text-5xl font-black text-white font-heading tracking-tighter">
                      {isBalanceHidden ? "Rp ••••••••" : `Rp ${portfolioStats.currentBalance.toLocaleString("id-ID")}`}
                    </h2>
                    <div className="mt-4 flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-[#444] uppercase tracking-wider">Est. P/L:</span>
                          <div className={cn(
                            "flex items-center gap-1.5 px-2 py-0.5 rounded font-bold text-xs border",
                            portfolioStats.totalPL >= 0 
                              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                              : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                          )}>
                            {portfolioStats.totalPL >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {portfolioStats.totalPLPercent >= 0 ? "+" : ""}{portfolioStats.totalPLPercent.toFixed(2)}%
                          </div>
                        </div>
                        <div className="flex items-center gap-2 border-l border-[#222] pl-4 sm:pl-6">
                          <span className="text-[10px] font-black text-[#444] uppercase tracking-wider">Positions:</span>
                          <span className="text-xs font-black text-white">{trades.filter(t => t.status === 'OPEN').length} Active</span>
                        </div>
                        <div className="flex items-center gap-2 border-l border-[#222] pl-4 sm:pl-6">
                          <span className="text-[10px] font-black text-[#444] uppercase tracking-wider">Win Rate:</span>
                          <span className="text-xs font-black text-[var(--color-gold)]">{portfolioStats.winRate.toFixed(0)}%</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-[#444] uppercase tracking-wider">Buying Power:</span>
                            <span className="text-xs font-black text-emerald-400">
                              {isBalanceHidden ? "Rp ••••••••" : `Rp ${portfolioStats.buyingPower.toLocaleString("id-ID")}`}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 border-l border-[#222] pl-4 sm:pl-6">
                            <span className="text-[10px] font-black text-[#444] uppercase tracking-wider">Invested Value:</span>
                            <span className="text-xs font-black text-[#888]">
                              {isBalanceHidden ? "Rp ••••••••" : `Rp ${portfolioStats.totalInvested.toLocaleString("id-ID")}`}
                            </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-4 w-full md:w-auto">
                    <button 
                      onClick={handleAddTrade}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-2xl bg-[var(--color-gold)] hover:bg-[var(--color-gold-hover)] px-8 py-5 text-xs font-black text-black transition-all active:scale-95 uppercase tracking-[2px] shadow-[0_10px_30px_rgba(212,175,55,0.2)]"
                    >
                      <Plus size={18} strokeWidth={3} />
                      Catat Entry
                    </button>
                  </div>
                </div>
              </div>

              {/* Split Content Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Trade Journal Table */}
                <div className="lg:col-span-8 space-y-6">
                  <div className="rounded-3xl border border-[#222] bg-[#080808]/40 overflow-hidden shadow-sm">
                    <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center justify-between bg-[#080808] gap-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-[var(--color-gold)]/10 p-2.5 rounded-xl border border-[var(--color-gold)]/20">
                          <Calendar size={18} className="text-[var(--color-gold)]" />
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-white uppercase tracking-wider">Trade Journal</h3>
                          <span className="text-[10px] font-bold text-[#666] tracking-[2px]">{filteredPortfolioTrades.length} TRANSAKSI</span>
                        </div>
                      </div>
                      
                      {/* Unified Dropdown Filter Button placed on the right corner */}
                      <div className="relative shrink-0">
                        <button 
                          onClick={() => setIsPortfolioFilterOpen(!isPortfolioFilterOpen)}
                          className={cn(
                            "flex items-center justify-center p-3.5 rounded-2xl bg-[#111] border transition-all cursor-pointer active:scale-95",
                            isPortfolioFilterOpen || activeMarketFilter !== 'ALL' || portfolioStatusFilter !== 'ALL'
                              ? "border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/5"
                              : "border-[#222] text-zinc-400 hover:text-white hover:border-[#333]"
                          )}
                          title="Filter Sektor & Status"
                        >
                          <Filter size={15} />
                        </button>

                        <AnimatePresence>
                          {isPortfolioFilterOpen && (
                            <>
                              <div 
                                className="fixed inset-0 z-40" 
                                onClick={() => setIsPortfolioFilterOpen(false)} 
                              />
                              <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 mt-2.5 w-56 rounded-2xl border border-[#222] bg-[#0c0c0c] p-3 shadow-2xl z-50 flex flex-col gap-3"
                              >
                                {/* Section Kategori Pasar */}
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2.5 block">Kategori Pasar</span>
                                  <div className="flex flex-col gap-0.5">
                                    {([
                                      { value: 'ALL', label: 'Semua Pasar' },
                                      { value: 'IDX', label: 'IDX Stocks' },
                                      { value: 'CRYPTO', label: 'Crypto' },
                                      { value: 'CFD', label: 'CFD Market' }
                                    ] as const).map((cat) => (
                                      <button
                                        key={cat.value}
                                        onClick={() => {
                                          setActiveMarketFilter(cat.value);
                                        }}
                                        className={cn(
                                          "w-full px-3 py-2 text-left rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer",
                                          activeMarketFilter === cat.value
                                            ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                                            : "text-zinc-400 hover:text-white hover:bg-[#151515]"
                                        )}
                                      >
                                        <span>{cat.label}</span>
                                        {activeMarketFilter === cat.value && <span className="text-[var(--color-gold)] font-sans text-xs">✓</span>}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div className="h-[1px] bg-[#1a1a1a] mx-2" />

                                {/* Section Status Transaksi */}
                                <div className="flex flex-col gap-1.5">
                                  <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest px-2.5 block">Status Transaksi</span>
                                  <div className="flex flex-col gap-0.5">
                                    {([
                                      { value: 'ALL', label: 'Semua Status' },
                                      { value: 'OPEN', label: 'Transaksi Aktif' },
                                      { value: 'CLOSED', label: 'Transaksi Selesai' }
                                    ] as const).map((status) => (
                                      <button
                                        key={status.value}
                                        onClick={() => {
                                          setPortfolioStatusFilter(status.value);
                                        }}
                                        className={cn(
                                          "w-full px-3 py-2 text-left rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-between cursor-pointer",
                                          portfolioStatusFilter === status.value
                                            ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)]"
                                            : "text-zinc-400 hover:text-white hover:bg-[#151515]"
                                        )}
                                      >
                                        <span>{status.label}</span>
                                        {portfolioStatusFilter === status.value && <span className="text-[var(--color-gold)] font-sans text-xs">✓</span>}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            </>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div className="overflow-x-auto p-2">
                      <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                          <tr className="text-left">
                            <th className="py-2 px-4 text-[9px] font-black uppercase tracking-[2px] text-[#444]">Identitas</th>
                            <th className="py-2 px-4 text-[9px] font-black uppercase tracking-[2px] text-[#444]">Volume</th>
                            <th className="py-2 px-4 text-[9px] font-black uppercase tracking-[2px] text-[#444] text-right">Entry</th>
                            <th className="py-2 px-4 text-[9px] font-black uppercase tracking-[2px] text-[#444] text-right">Valuasi</th>
                            <th className="py-2 px-4 text-[9px] font-black uppercase tracking-[2px] text-[#444] text-center">Risk</th>
                          </tr>
                        </thead>
                        <tbody className="space-y-2">
                          {filteredPortfolioTrades.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-16 text-center text-[#333] font-black uppercase tracking-[3px]">
                                Belum ada transaksi di {activeMarketFilter} {portfolioStatusFilter !== 'ALL' ? `(${portfolioStatusFilter})` : ''}
                              </td>
                            </tr>
                          ) : (
                             filteredPortfolioTrades.map((trade) => {
                              let riskColorItem = "bg-[#111] text-[#555] border-[#222]";
                              let riskTextItem = "-";
                              let displayRiskAmountItem: number | null = null;
                              if (trade.plannedStopLoss && trade.quantity && totalCapital > 0) {
                                const riskAmount = Math.abs(trade.entryPrice - trade.plannedStopLoss) * trade.quantity;
                                displayRiskAmountItem = riskAmount;
                                if (riskAmount > 0) {
                                    const riskPercent = (riskAmount / totalCapital) * 100;
                                    riskTextItem = `${riskPercent.toFixed(2)}%`;
                                    if (riskPercent <= 1) {
                                        riskColorItem = "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
                                    } else if (riskPercent <= 2) {
                                        riskColorItem = "bg-[var(--color-gold)]/10 text-[var(--color-gold)] border-[var(--color-gold)]/50";
                                    } else {
                                        riskColorItem = "bg-rose-500/10 text-rose-500 border-rose-500/50";
                                    }
                                }
                              }

                              let currentValuation = 0;
                              let plPercent = 0;
                              if (trade.status === 'CLOSED') {
                                 const exitPr = trade.actualExitPrice || trade.exitPrice || trade.entryPrice;
                                 currentValuation = exitPr * trade.quantity;
                                 plPercent = ((exitPr - trade.entryPrice) / trade.entryPrice) * 100;
                              } else {
                                 const currentStock = stocks.find(s => s.symbol === trade.symbol);
                                 const currentPrice = currentStock ? currentStock.price : trade.entryPrice * 1.02;
                                 currentValuation = currentPrice * trade.quantity;
                                 plPercent = ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100;
                              }

                              return (
                              <tr 
                                key={trade.id} 
                                className="group bg-[#0d0d0d] hover:bg-[#111] transition-all rounded-xl relative cursor-pointer"
                                onClick={() => setViewingTrade(trade)}
                              >
                                <td className="py-4 px-4 first:rounded-l-xl">
                                  <div className="flex flex-col">
                                    <span className="font-black text-white tracking-widest text-sm group-hover:text-[var(--color-gold)] transition-colors">{trade.symbol}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                      <TradeLiveStatusBadge trade={trade} />
                                      <span className="text-[9px] font-mono text-[#444] font-bold">{trade.date}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-4 font-mono font-bold text-[#888] text-xs">
                                  {trade.quantity / 100} Lots
                                  <div className="text-[8px] text-[#444] uppercase tracking-tighter mt-1">{trade.quantity.toLocaleString()} Shares</div>
                                </td>
                                <td className="py-4 px-4 text-right font-mono font-bold text-white text-xs">
                                  Rp {trade.entryPrice.toLocaleString("id-ID")}
                                </td>
                                <td className="py-4 px-4 text-right text-xs font-black text-white font-mono">
                                  <div className="flex flex-col items-end">
                                    <span>{isBalanceHidden ? "••••••••" : `Rp ${currentValuation.toLocaleString("id-ID")}`}</span>
                                    <span className={cn("text-[9px] font-black tracking-widest mt-0.5", plPercent >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                      {plPercent >= 0 ? "+" : ""}{plPercent.toFixed(2)}%
                                    </span>
                                  </div>
                                </td>
                                <td className="py-4 px-4 text-center last:rounded-r-xl">
                                  <div className="flex flex-col items-center gap-1">
                                    <div className={cn("inline-flex px-1.5 py-0.5 rounded border text-[10px] font-black font-mono tracking-wider", riskColorItem)}>
                                      {riskTextItem}
                                    </div>
                                    {displayRiskAmountItem !== null && displayRiskAmountItem > 0 && (
                                       <span className="text-[9px] font-bold text-[#666] font-mono tracking-wider">
                                          Rp {displayRiskAmountItem.toLocaleString("id-ID")}
                                       </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )})
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right: Insights and Metrics */}
                <div className="lg:col-span-4 space-y-8">
                  {/* Performance Analytics Card */}
                  <div className="rounded-3xl border border-[#2a2a2a] bg-[#0d0d0d] p-6 shadow-xl relative overflow-hidden group">
                    <div className="absolute -right-8 -top-8 w-24 h-24 bg-[var(--color-gold)]/5 rounded-full blur-2xl group-hover:bg-[var(--color-gold)]/10 transition-all"></div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-xl bg-[var(--color-gold)]/10 text-[var(--color-gold)] border border-[var(--color-gold)]/20 shadow-inner">
                        <TrendingUp size={22} className="group-hover:scale-110 transition-transform" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-tight">Journal Analytics</h3>
                        <p className="text-[9px] font-bold text-[#444] uppercase tracking-[2px]">Deep Performance Insights</p>
                      </div>
                    </div>
                    
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 rounded-2xl bg-[#080808] border border-[#1a1a1a] shadow-inner">
                          <span className="block text-[8px] font-black text-[#333] uppercase tracking-[2px] mb-2">Avg Profit</span>
                          <span className="text-xl font-black text-emerald-400 group-hover:text-emerald-300 transition-colors">
                            +{portfolioStats.avgProfit.toFixed(1)}%
                          </span>
                          <div className="mt-2 text-[7px] text-[#444] uppercase font-bold tracking-widest">Target: 4.0%</div>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#080808] border border-[#1a1a1a] shadow-inner">
                          <span className="block text-[8px] font-black text-[#333] uppercase tracking-[2px] mb-2">Avg Loss</span>
                          <span className="text-xl font-black text-rose-500 group-hover:text-rose-400 transition-colors">
                            -{portfolioStats.avgLoss.toFixed(1)}%
                          </span>
                          <div className="mt-2 text-[7px] text-[#444] uppercase font-bold tracking-widest">Max: 3.0%</div>
                        </div>
                      </div>
                      <div className="p-4 rounded-2xl bg-[#0a0a0a] border border-[#1a1a1a]">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[9px] font-black text-[#555] uppercase tracking-[2px]">Portfolio Health</span>
                          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[1px]">Robust</span>
                        </div>
                        <div className="flex gap-1 h-1.5">
                          {[1, 1, 1, 1, 0, 0, 0].map((v, i) => (
                             <div key={i} className={cn("flex-1 rounded-full", v ? "bg-[var(--color-gold)]/60" : "bg-[#1a1a1a]")}></div>
                          ))}
                        </div>
                        <p className="mt-3 text-[9px] text-[#555] italic leading-tight">Portofolio Anda memiliki kontrol risiko yang baik dengan drawdown minimal.</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Advisor Call-to-action */}
                  <div className="rounded-3xl border border-dashed border-[var(--color-gold)]/30 bg-gradient-to-br from-[#0d0d0d] to-[#050505] p-8 flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-[var(--color-gold)]/20 blur-2xl rounded-full scale-110"></div>
                      <div className="relative w-16 h-16 rounded-2xl bg-[#000] border border-[var(--color-gold)]/20 flex items-center justify-center text-[var(--color-gold)]">
                        <Sparkles size={32} />
                      </div>
                    </div>
                    <h4 className="text-lg font-black text-white uppercase tracking-tight mb-2">Smart AI Advisor</h4>
                    <p className="text-xs text-[#555] font-medium leading-relaxed mb-4 max-w-[220px]">Dapatkan analisis mendalam berbasis GenAI untuk mengoptimalkan strategi trading Anda secara personal.</p>
                    <button className="w-full py-4 bg-white hover:bg-[var(--color-gold)] text-black font-black uppercase text-[10px] tracking-[2.5px] rounded-2xl shadow-xl transition-all active:scale-[0.98]">
                      Analisis Journal Sekarang
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Corporate Action Tracker Integration in Portfolio */}
              <div className="mt-12">
                 <CorporateActionDashboard events={MOCK_CORPORATE_EVENTS} />
              </div>
            </div>
          ) : (
            <LoginPage onLoginSuccess={() => setIsLoggedIn(true)} />
          )
        )}

        {activeTab === "Calendar" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AstroCalendar />
          </div>
        )}

        {activeTab === "Broker Summary" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <BrokerSummaryDashboard />
          </div>
        )}

        {activeTab === "Sektor Impact" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            {/* Header Sektor */}
            <section className="p-6 sm:p-8 rounded-3xl border border-[#202020] bg-gradient-to-br from-[#0a0a0a] via-[#0d0d0d] to-[#060606] relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,_var(--color-gold-hover),transparent_20%)] opacity-5 pointer-events-none" />
              <div className="absolute -left-12 -top-12 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col gap-3.5 pr-12 max-w-3xl">
                {/* Premium Tech-Indicator Badge */}
                <motion.div 
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex items-center"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#111111]/80 border border-[#2a2a2a] shadow-inner">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-gold)] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-gold)]"></span>
                    </span>
                    <span className="text-[10px] font-black tracking-[0.16em] uppercase text-[#e0e0e0] font-mono leading-none">
                      IDX Sektor Analyzer AI
                    </span>
                  </div>
                </motion.div>

                {/* Sleek Professional Typography Header */}
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-2xl sm:text-3.5xl font-extrabold text-white tracking-tight uppercase leading-tight"
                >
                  Analisis Sentimen <span className="text-[var(--color-gold)] font-light font-serif">&</span> Mekanika Sektoral
                </motion.h1>
                
                {/* Elegant subtle accent line */}
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: 80 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                  className="h-[2px] bg-gradient-to-r from-[var(--color-gold)] to-transparent rounded-full mt-0.5" 
                />
              </div>

              <button
                onClick={async () => {
                  setIsRefreshingNews(true);
                  try {
                    await Promise.all([
                      fetchSectorMarketData(),
                      fetchNews(true),
                      fetchLivePrices()
                    ]);
                  } catch (e) {}
                  setIsRefreshingNews(false);
                }}
                disabled={isRefreshingNews}
                className="absolute top-6 right-6 flex items-center justify-center rounded-xl border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.1)] p-2.5 text-xs font-bold text-[var(--color-gold)] transition-all hover:bg-[rgba(212,175,55,0.2)] active:scale-95 disabled:opacity-50 shadow-md cursor-pointer z-10"
                title="Sinkronkan Data Live"
              >
                <RefreshCw size={14} className={isRefreshingNews ? "animate-spin" : ""} />
              </button>
            </section>

            {/* Layout Grid Utama Sektor (Elegantly Styled Bento Grid) */}
            <div className="space-y-4">


              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sectorScores.map((sector, index) => {
                  const nameSplit = sector.name.split(" (");
                  const titleMain = nameSplit[0];
                  const titleSub = nameSplit.length > 1 ? nameSplit[1].replace(")", "") : sector.code;
                  const isPositive = (sector.marketChangePercent || 0) >= 0;
                  const isAiPositive = sector.outlook === "Buy";
                  const isAiNegative = sector.outlook === "Sell";

                  return (
                    <motion.div
                      key={sector.name}
                      onClick={() => {
                        setSelectedSectorTabCode(sector.code);
                        setIsSectorModalOpen(true);
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.45, 
                        delay: Math.min(index * 0.04, 0.4), 
                        ease: [0.215, 0.61, 0.355, 1] 
                      }}
                      whileHover={{ scale: 1.02, y: -4, transition: { duration: 0.2 } }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "group w-full bg-[#0a0a0a] rounded-3xl p-5 border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-[200px]",
                        isAiPositive 
                          ? "border-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-500/[0.02]" 
                          : isAiNegative 
                            ? "border-rose-500/10 hover:border-rose-500/30 hover:bg-rose-500/[0.02]" 
                            : "border-[#1a1a1a] hover:border-[#333] hover:bg-zinc-900/40"
                      )}
                    >
                      {/* Ambient background glow of active recommendation on hover */}
                      <div className={cn(
                        "absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))]",
                        isAiPositive && "from-emerald-500/20 via-transparent to-transparent",
                        isAiNegative && "from-rose-500/20 via-transparent to-transparent",
                        !isAiPositive && !isAiNegative && "from-purple-500/20 via-transparent to-transparent"
                      )} />

                      <div>
                        {/* Header card */}
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div className="flex gap-2.5 items-center min-w-0">
                            <span className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center border shadow-inner transition-colors shrink-0",
                              isAiPositive 
                                ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400" 
                                : isAiNegative 
                                  ? "border-rose-500/20 bg-rose-500/5 text-rose-400" 
                                  : "border-purple-500/20 bg-purple-500/5 text-purple-400"
                            )}>
                              {getIcon(sector.icon)}
                            </span>
                            <div className="min-w-0">
                              <h4 className="font-black text-xs sm:text-sm text-white truncate leading-tight tracking-tight uppercase group-hover:text-[var(--color-gold)] transition-colors">
                                {titleMain}
                              </h4>
                              <p className="text-[#666] text-[9px] font-bold uppercase tracking-wider truncate mt-0.5">{titleSub}</p>
                            </div>
                          </div>
                        </div>

                        {/* Indeks info */}
                        <div className="flex items-baseline justify-between gap-1.5 border-t border-[#161616] pt-3 mt-1.5">
                          <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase text-[#444] tracking-wider">Harga Indeks</span>
                            <span className="text-zinc-200 font-bold text-xs sm:text-sm font-mono mt-0.5">
                              {sector.price > 0 ? sector.price.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '-'}
                            </span>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase text-[#444] tracking-wider">Chg %</span>
                            <span className={cn(
                              "font-bold text-xs sm:text-sm font-mono mt-0.5 flex items-center gap-0.5",
                              isPositive ? "text-emerald-400" : "text-rose-400"
                            )}>
                              {isPositive ? "+" : ""}{sector.marketChangePercent.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer card */}
                      <div className="flex items-center justify-between border-t border-[#111] pt-3 mt-3 w-full">
                        <div className="flex gap-2">
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest leading-none border uppercase flex items-center justify-center",
                            isAiPositive 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                              : isAiNegative 
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                                : "bg-neutral-800 text-neutral-400 border-neutral-700"
                          )}>
                            {sector.outlook}
                          </span>
                          <span className="px-2 py-1 rounded-lg bg-[#111] border border-[#222] text-[9.5px] font-black font-mono text-zinc-400 flex items-center justify-center">
                            PROB: {sector.probability.toFixed(0)}%
                          </span>
                        </div>
                        <span className="text-[8px] font-black text-purple-400/80 group-hover:text-purple-400 group-hover:underline uppercase tracking-widest transition-all">
                          Analisis Profil →
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "Profile" && (
          <ProfileView 
            isLoggedIn={isLoggedIn} 
            totalCapital={totalCapital}
            setTotalCapital={setTotalCapital}
            onLogout={() => {
              setIsLoggedIn(false);
              setActiveTab("Dashboard");
            }} 
          />
        )}
        </div>
      </main>

      <footer className="border-t border-[#222] bg-[#050505] py-4">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-xs text-[#555] font-bold uppercase tracking-widest mb-4 md:mb-0">
            © 2026 Research CNHL Terminal.
          </p>
          <div className="flex justify-center gap-6">
             <a href="#" className="text-[10px] font-black uppercase tracking-[2px] text-[#444] hover:text-white transition-colors">Privacy</a>
             <a href="#" className="text-[10px] font-black uppercase tracking-[2px] text-[#444] hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </footer>
      </div>
    </div>
    </div>
  );
}

function LoginPage({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      onLoginSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex items-center justify-center py-20 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-sm bg-[#080808] border border-[#2a2a2a] p-8 rounded-3xl shadow-2xl">
        <h2 className="text-white font-black text-2xl uppercase tracking-[2px] mb-4 text-center">Login Access</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-[#555]" size={18} />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={cn("w-full bg-[#111] border rounded-xl py-3 pl-10 pr-4 text-white font-bold outline-none", error ? "border-rose-500" : "border-[#222]")}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-[#555]" size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn("w-full bg-[#111] border rounded-xl py-3 pl-10 pr-4 text-white font-bold outline-none", error ? "border-rose-500" : "border-[#222]")}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[var(--color-gold)] text-black font-black uppercase text-[10px] tracking-[2px] py-4 rounded-xl hover:bg-[var(--color-gold-hover)] transition-all active:scale-95"
          >
            Masuk Terminal
          </button>
          {error && <p className="text-rose-500 text-xs font-bold text-center mt-2">Username/Password Salah!</p>}
        </form>
      </div>
    </div>
  );
}

function ProfileView({ 
  isLoggedIn, 
  onLogout,
  totalCapital,
  setTotalCapital
}: { 
  isLoggedIn: boolean; 
  onLogout: () => void;
  totalCapital: number;
  setTotalCapital: (val: number) => void; 
}) {
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; url: string; host: string; database: string } | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/db-status')
        .then(res => res.json())
        .then(data => setDbStatus(data))
        .catch(() => setDbStatus({ connected: false, url: 'Fail', host: 'N/A', database: 'N/A' }));
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="inline-flex p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 mb-4">
          <Lock size={48} />
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Akses Terbatas</h2>
        <p className="text-[#555] font-bold uppercase tracking-wider mb-4">Silakan login di menu Portfolio terlebih dahulu</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-[#2a2a2a] bg-[#0d0d0d] p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[var(--color-gold)]/5 to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-center gap-8">
           <div className="w-32 h-32 rounded-3xl bg-[#111] border-2 border-[var(--color-gold)] flex items-center justify-center text-[var(--color-gold)] shadow-[0_0_30px_rgba(212,175,55,0.1)]">
              <User size={64} />
           </div>
           <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-[3px] text-[var(--color-gold)]">Admin Privileged Account</span>
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase mb-4">Admin Research CJ</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                 <div className="bg-[#050505] p-4 rounded-xl border border-[#1a1a1a]">
                    <span className="block text-[8px] font-black text-[#555] uppercase tracking-widest mb-1">Username</span>
                    <span className="text-sm font-bold text-white">admin</span>
                  </div>
                 <div className="bg-[#050505] p-4 rounded-xl border border-[#1a1a1a]">
                    <span className="block text-[8px] font-black text-[#555] uppercase tracking-widest mb-1">Status</span>
                    <span className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Authorized</span>
                 </div>
              </div>
           </div>
           <button 
             onClick={onLogout}
             className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[2px] transition-all active:scale-95 shadow-xl"
           >
             Logout Session
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Account ID", value: "CNHL-2026-X88" },
          { label: "Auth Level", value: "SUPER-ADMIN" },
          { label: "Last Login", value: new Date().toLocaleTimeString() }
        ].map((item, i) => (
          <div key={i} className="p-6 rounded-2xl border border-[#1a1a1a] bg-[#0d0d0d]">
             <span className="block text-[8px] font-black text-[#555] uppercase tracking-widest mb-2">{item.label}</span>
             <span className="text-sm font-black text-white uppercase tracking-tighter">{item.value}</span>
          </div>
        ))}
      </div>

      {/* PostgreSQL Status Card */}
      <div className="p-8 rounded-3xl border border-[#2a2a2a] bg-[#0d0d0d] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Box size={16} className="text-blue-400" />
              PostgreSQL Database Integration
            </h3>
            <p className="text-[#888] text-xs">Integrasi ke database PostgreSQL lokal atau Cloud Anda untuk persistence data historis (news cache, trade plans).</p>
          </div>
          <div>
            {dbStatus ? (
              dbStatus.connected ? (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-black bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-ping"></span>
                  CONNECTED
                </span>
              ) : (
                <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-black bg-rose-500/10 border border-rose-500/30 text-rose-400 uppercase tracking-widest">
                  <span className="w-2 h-2 rounded-full bg-rose-500 mr-2"></span>
                  DISCONNECTED (FALLBACK ACTIVE)
                </span>
              )
            ) : (
              <span className="inline-flex items-center px-4 py-2 rounded-full text-xs font-black bg-[#151515] text-[#555] uppercase tracking-widest">
                Checking connection...
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
             <div className="bg-[#050505] p-5 rounded-2xl border border-[#1a1a1a] space-y-3">
                <span className="block text-[9px] font-black text-[#555] uppercase tracking-[1.5px]">Koneksi Server</span>
                <div className="flex items-center justify-between text-xs font-semibold text-[#aaa]">
                   <span>Host:</span>
                   <span className="font-mono text-white select-all">{dbStatus?.host || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#aaa]">
                   <span>Database Name:</span>
                   <span className="font-mono text-white select-all">{dbStatus?.database || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#aaa]">
                   <span>Configuration Status:</span>
                   <span className="font-mono text-yellow-500">{dbStatus?.url || 'Checking...'}</span>
                </div>
             </div>

             <div className="bg-[#0b132b]/20 p-5 rounded-2xl border border-blue-900/30 text-xs leading-relaxed text-[#8a99ad]">
                <h4 className="font-bold text-white uppercase tracking-wider mb-2 text-[10px]">💡 Catatan Integrasi</h4>
                <p>Website akan secara otomatis membuat tabel <code className="text-blue-300 font-mono">news</code> dan <code className="text-blue-300 font-mono">trading_plans</code> ketika pertama kali terhubung. Jika database tidak tersambung, website secara cerdas akan langsung beralih ke engine in-memory dan parsing realtime gratis agar sistem tetap beroperasi 100%.</p>
             </div>
          </div>

          <div className="bg-[#050505] p-6 rounded-2xl border border-[#1a1a1a]">
             <h4 className="text-[10px] font-black text-white uppercase tracking-[1.5px] mb-3">Cara Konfigurasi (Docker / Local):</h4>
             <p className="text-xs text-[#aaa] leading-relaxed mb-4">Tambahkan variabel lingkungan berikut ke dalam file <code className="text-[var(--color-gold)] font-mono">.env</code> lokal Anda atau set up pada parameter runner kontainer Docker Mac mini Anda:</p>
             <pre className="bg-[#000] p-4 rounded-xl text-[11px] font-mono text-emerald-400 border border-[#222] select-all overflow-x-auto whitespace-pre leading-normal">
{`# File .env (PostgreSQL Config)
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# ATAU konfigurasi terpisah:
PGHOST="ganti-dengan-ip-pc-anda"
PGPORT=5432
PGUSER="postgres"
PGPASSWORD="password_anda"
PGDATABASE="nama_db"`}
             </pre>
          </div>
        </div>
      </div>

      <div className="p-8 rounded-3xl border border-[#2a2a2a] bg-[#0d0d0d] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none"></div>
        <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-emerald-500" />
          Financial Setup
        </h3>
        <div className="max-w-sm">
          <label className="block text-[10px] font-black text-[#555] uppercase tracking-widest mb-3">Total Capital (IDR)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-black text-sm">Rp</span>
            <input
              type="number"
              value={totalCapital}
              onChange={(e) => setTotalCapital(Number(e.target.value))}
              className="w-full bg-[#111] border border-[#222] rounded-xl py-4 pl-12 pr-4 text-white font-bold text-lg outline-none focus:border-[var(--color-gold)] transition-colors"
              placeholder="100000000"
            />
          </div>
          <p className="mt-3 text-[10px] text-[#555] font-bold">Capital ini digunakan sebagai base kalkulasi risk parameter trade plan secara otomatis.</p>
        </div>
      </div>
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
  variant = "default",
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  headerAction?: React.ReactNode;
  variant?: "default" | "seamless";
}) {
  const isSeamless = variant === "seamless";
  
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative overflow-hidden transition-all duration-500",
        isSeamless 
          ? "bg-transparent p-0 border-0 shadow-none" 
          : "border border-[#2a2a2a] bg-[var(--color-bg-news)] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.5)] rounded-2xl",
        className,
      )}
    >
      <div className={cn(
        "mb-4 flex items-center justify-between border-b border-[#2a2a2a] pb-4",
        isSeamless && "border-white/5"
      )}>
        <div className="flex items-center gap-4">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111] border border-[#333] text-[var(--color-gold)]">
              {icon}
            </div>
          )}
          <h2
            className={cn(
              "font-heading text-2xl font-bold tracking-tight text-white",
              isSeamless && "text-3xl font-extrabold tracking-tighter",
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

function SectorDetailModal({
  sector,
  onClose,
}: {
  sector: any;
  onClose: () => void;
}) {
  if (!sector) return null;

  const nameSplit = sector.name.split(" (");
  const titleMain = nameSplit[0];
  const titleSub = nameSplit.length > 1 ? nameSplit[1].replace(")", "") : sector.code;
  const isPositive = (sector.marketChangePercent || 0) >= 0;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#2a2a2a] bg-[#0c0c0c] p-6 shadow-2xl z-10"
        style={{ scrollbarWidth: "thin" }}
      >
        {/* Header Sektor */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#222] pb-6">
          <div className="flex gap-4 items-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/5">
              {getIcon(sector.icon)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20 tracking-wider">
                  IDX Sektor Analyzer AI Profile
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Real-Time</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight uppercase tracking-tight">{titleMain}</h2>
              <p className="text-zinc-500 text-xs">{titleSub} • {sector.marketIndex}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className={cn(
              "flex flex-col px-3 py-1.5 rounded-xl border text-right",
              sector.outlook === "Buy" 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]" 
                : sector.outlook === "Sell" 
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-400" 
                  : "bg-[#111] border-[#222]"
            )}>
              <span className="text-[7px] font-black tracking-widest uppercase leading-none text-[#ffffffd0]">AI Outlook</span>
              <span className="text-sm font-black tracking-wider uppercase mt-0.5 leading-none">{sector.outlook}</span>
              <span className="text-[8px] font-bold font-mono opacity-80 mt-0.5 leading-none font-black">Prob: {sector.probability.toFixed(1)}%</span>
            </div>

            <button 
              onClick={onClose}
              className="p-2.5 rounded-xl border border-[#222] bg-[#111] hover:bg-[#222] text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="space-y-6 mt-6">
          {/* Market Pricing Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#060606] border border-[#111]">
            <div>
              <span className="text-[8px] font-black uppercase text-[#444] tracking-wider block">Harga Indeks</span>
              <span className="text-white font-black text-sm font-mono block mt-1">
                {sector.price > 0 ? sector.price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}
              </span>
            </div>
            <div>
              <span className="text-[8px] font-black uppercase text-[#444] tracking-wider block">Perubahan Indeks</span>
              <span className={cn("font-bold text-sm font-mono block mt-1", isPositive ? "text-emerald-400" : "text-rose-400")}>
                {isPositive ? "+" : ""}{(sector.marketChangeValue || 0).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[8px] font-black uppercase text-[#444] tracking-wider block">Persentase</span>
              <span className={cn("font-bold text-sm font-mono block mt-1", isPositive ? "text-emerald-400" : "text-rose-400")}>
                {isPositive ? "+" : ""}{(sector.marketChangePercent || 0).toFixed(2)}%
              </span>
            </div>
            <div>
              <span className="text-[8px] font-black uppercase text-[#444] tracking-wider block">Volume Transaksi</span>
              <span className="text-zinc-300 font-bold text-sm font-mono block mt-1">
                {(sector.volume || 0).toLocaleString('id-ID')} Lot
              </span>
            </div>
          </div>

          {/* Kuantitatif Engine Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Order Flow Institusi */}
            <div className="rounded-3xl border border-[#2a2a2a] bg-[#0c0c0c] p-5 space-y-4">
              <div className="flex items-center gap-1.5 border-b border-[#222] pb-3">
                <ArrowLeftRight size={16} className="text-indigo-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Order Flow Institusi (Harian)
                </h3>
              </div>

              <div className="space-y-4 pt-1">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#888] mb-1.5">
                    <span>Foreign Capital Net Flow</span>
                    <span className={cn("font-mono font-bold", sector.netForeignFlowBillion >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      {sector.netForeignFlowBillion >= 0 ? "+" : ""}{sector.netForeignFlowBillion.toFixed(2)} Miliar TR
                    </span>
                  </div>
                  {/* Horizontal Flow Indicator */}
                  <div className="h-2 rounded-full bg-[#111] overflow-hidden flex relative border border-[#222]">
                    <div className={cn("h-full rounded-full transition-all", sector.netForeignFlowBillion >= 0 ? "bg-emerald-500" : "bg-rose-500")}
                         style={{ 
                           width: `${Math.min(100, Math.max(10, Math.abs(sector.netForeignFlowBillion) * 2))}%`,
                           marginLeft: sector.netForeignFlowBillion >= 0 ? '50%' : 'auto',
                           marginRight: sector.netForeignFlowBillion < 0 ? '50%' : 'auto'
                         }} 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-[#888] mb-1.5">
                    <span>Domestic Capital Net Flow</span>
                    <span className={cn("font-mono font-bold", sector.netDomesticFlowBillion >= 0 ? "text-blue-400" : "text-amber-500")}>
                      {sector.netDomesticFlowBillion >= 0 ? "+" : ""}{sector.netDomesticFlowBillion.toFixed(2)} Miliar TR
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#111] overflow-hidden flex relative border border-[#222]">
                    <div className={cn("h-full rounded-full transition-all", sector.netDomesticFlowBillion >= 0 ? "bg-blue-500" : "bg-amber-500")}
                         style={{ 
                           width: `${Math.min(100, Math.max(10, Math.abs(sector.netDomesticFlowBillion) * 2))}%`,
                           marginLeft: sector.netDomesticFlowBillion >= 0 ? '50%' : 'auto',
                           marginRight: sector.netDomesticFlowBillion < 0 ? '50%' : 'auto'
                         }} 
                    />
                  </div>
                </div>

                <p className="text-[10px] leading-relaxed text-[#555] font-semibold uppercase tracking-tight">
                  💡 Kapital Asing terkonfirmasi {sector.netForeignFlowBillion >= 0 ? "Akumulasi Net Beli" : "Distribusi Net Jual"} di bursa modal hari ini.
                </p>
              </div>
            </div>

            {/* Box 2: Detail Model Aggregation Formula */}
            <div className="rounded-3xl border border-[#2a2a2a] bg-[#0c0c0c] p-5 space-y-4">
              <div className="flex items-center gap-1.5 border-b border-[#222] pb-3">
                <Sparkles size={16} className="text-[var(--color-gold)]" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                  Kalkulator Agregasi AI
                </h3>
              </div>

              <div className="space-y-3.5 text-xs text-[#888] leading-tight">
                <div className="flex justify-between items-center py-1">
                  <span>Engine Sentimen Berita Weight</span>
                  <span className="font-mono text-zinc-400 font-bold">{TEXT_WEIGHT * 100}%</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-[#181818]">
                  <span>Engine Makroekonomi Weight</span>
                  <span className="font-mono text-zinc-400 font-bold">{MACRO_WEIGHT * 100}%</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-[#181818]">
                  <span>Order Flow Multiplier Alpha</span>
                  <span className="font-mono text-zinc-400 font-bold">
                    {sector.flowMultiplier === 1.5 ? "Konfirmasi (1.5x)" : sector.flowMultiplier === 0.3 ? "Divergensi (0.3x)" : "Netral (0.8x)"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-t border-[#181818] bg-[var(--color-gold)]/5 rounded px-2">
                  <span className="text-[var(--color-gold)] font-bold uppercase tracking-wider text-[10px]">Skor Probabilitas AI</span>
                  <span className="font-mono text-[var(--color-gold)] font-black text-[13px]">{sector.probability.toFixed(2)} pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transmisi Makroekonomi & Beta Sektoral */}
          <div className="rounded-3xl border border-[#2a2a2a] bg-[#0c0c0c] p-5 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-[#222] pb-3">
              <Globe size={16} className="text-emerald-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Matriks Transmisi Sensitivitas Makro
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#222]">
                    <th className="pb-2.5 text-[8.5px] font-black uppercase tracking-widest text-[#555]">Indikator Makro</th>
                    <th className="pb-2.5 text-[8.5px] font-black uppercase tracking-widest text-[#555] text-center">Variabel Delta %</th>
                    <th className="pb-2.5 text-[8.5px] font-black uppercase tracking-widest text-[#555] text-center">Beta Sektor ({sector.code})</th>
                    <th className="pb-2.5 text-[8.5px] font-black uppercase tracking-widest text-[#555] text-right">Perkiraan Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {sector.macroVariables.map((macro: any, idx: number) => {
                    const names = ["IHSG (Jakarta Composite)", "USD to IDR Exchange", "Emas Kontrak Berjangka", "Minyak Mentah Brent", "Batu Bara NewCastle"];
                    const macroName = names[idx] || "Macro Index";
                    const isMacroPos = macro.deltaPercentage >= 0;
                    const impact = macro.deltaPercentage * macro.macroWeight * macro.emitenBeta;
                    const isImpactPos = impact >= 0;

                    return (
                      <tr key={idx} className="border-b border-[#181818] hover:bg-[#111]/30 transition-colors">
                        <td className="py-3 text-xs font-bold text-zinc-300">{macroName}</td>
                        <td className={cn("py-3 text-xs font-mono font-bold text-center", isMacroPos ? "text-emerald-400" : "text-rose-400")}>
                          {isMacroPos ? "+" : ""}{macro.deltaPercentage.toFixed(2)}%
                        </td>
                        <td className="py-3 text-xs font-mono font-bold text-center text-zinc-400">
                          {macro.emitenBeta.toFixed(2)}
                        </td>
                        <td className={cn("py-3 text-xs font-mono font-black text-right", isImpactPos ? "text-emerald-400" : "text-rose-400")}>
                          {isImpactPos ? "+" : ""}{impact.toFixed(4)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Live Berita Sektoral Terkait */}
          <div className="rounded-3xl border border-[#2a2a2a] bg-[#0c0c0c] p-5 space-y-4">
            <div className="flex items-center gap-1.5 border-b border-[#222] pb-3">
              <Newspaper size={16} className="text-yellow-400" />
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                Sentimen Berita
              </h3>
            </div>

            {sector.sectorNews && sector.sectorNews.length > 0 ? (
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {sector.sectorNews.map((news: any, idx: number) => {
                  const isNewsPos = news.nlpSentiment >= 0 || (news.impactScore ?? 50) >= 50;
                  return (
                    <div key={idx} className="p-3 bg-[#080808] hover:bg-[#111] transition-all border border-[#1a1a1a] rounded-2xl flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-relaxed">{news.title}</h4>
                        {news.summary && (
                          <p className="text-[10px] text-[#888] line-clamp-2 mt-0.5 mb-1 leading-relaxed">{news.summary}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-[9px] font-bold text-zinc-500 uppercase">{news.date || news.time}</span>
                          <span className="text-zinc-700 font-bold">•</span>
                          <span className="text-[9px] font-bold text-yellow-600/80 line-clamp-1">{news.source}</span>
                          <span className="text-zinc-700 font-bold hidden sm:inline">•</span>
                          <span className="text-[9px] font-bold text-zinc-600 hidden sm:inline">Conf: {(news.confidence ?? 0.85).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className={cn(
                        "px-2.5 py-1 rounded-xl text-[10px] font-black font-mono shrink-0 border text-center",
                        isNewsPos 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      )}>
                        {(news.impactScore ?? 50).toFixed(0)} pts
                        <span className="block text-[7px] font-black uppercase text-[#666] tracking-[0.5px] mt-0.5">Sentiment</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-[#555] font-bold text-xs uppercase tracking-wide py-4 text-center">
                Tidak ada berita media untuk sektor ini dalam siklus AI terkini.
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function StockDetailModal({
  stock,
  newsData,
  realtimeOpp,
  onClose,
  onNewsClick,
}: {
  stock: RecommendedStock;
  newsData: NewsItem[];
  realtimeOpp: any[];
  onClose: () => void;
  onNewsClick?: (news: NewsItem) => void;
}) {
  const [tab, setTab] = useState("Overview");
  const [selectedNewsType, setSelectedNewsType] = useState("Semua");
  const [isNewsFilterOpen, setIsNewsFilterOpen] = useState(false);
  const detail = stock.detail;

  const [liveStockNews, setLiveStockNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [hasFetchedNews, setHasFetchedNews] = useState(false);

  useEffect(() => {
    if (tab !== "News" || hasFetchedNews) return;
    let isMounted = true;
    const fetchSymbolNews = async () => {
      setLoadingNews(true);
      try {
        const res = await fetch(`/api/news?symbol=${stock.symbol}&name=${encodeURIComponent(stock.name || "")}&_t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (res.ok) {
           const data = await res.json();
           if (isMounted) {
             setLiveStockNews(data);
             setHasFetchedNews(true);
           }
        }
      } catch (err) {
        // console.error("Failed to fetch related news", err);
      } finally {
        if (isMounted) setLoadingNews(false);
      }
    };
    fetchSymbolNews();
    return () => { isMounted = false; };
  }, [tab, stock.symbol, hasFetchedNews]);

  const stockNews = useMemo(() => {
    if (liveStockNews.length > 0) return liveStockNews;
    return newsData.filter(n => 
      n.title.toUpperCase().includes(stock.symbol.toUpperCase()) || 
      n.summary.toUpperCase().includes(stock.symbol.toUpperCase()) ||
      (stock.sector && n.impactedSectors?.includes(stock.sector))
    );
  }, [newsData, stock.symbol, stock.sector, liveStockNews]);

  const filteredStockNewsList = useMemo(() => {
    if (selectedNewsType === "Semua") {
      return stockNews.filter((n) => n.sourceType !== "Sentimen Komunitas");
    }
    return stockNews.filter((n) => n.sourceType === selectedNewsType);
  }, [stockNews, selectedNewsType]);

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
        className="relative flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-2xl bg-[#0a0a0a] border border-[#2a2a2a] shadow-[0_20px_50px_rgba(0,0,0,1)]"
      >
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111] border border-[#333] text-[#888] hover:text-white transition-colors"
          >
            <RefreshCw className="rotate-45" size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12">
          <div className="mb-4 sm:mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <span className="font-heading text-4xl sm:text-5xl font-black tracking-tighter text-white">
                {stock.symbol}
              </span>
              <div
                className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[1px] w-fit",
                  stock.change >= 0
                    ? "bg-[rgba(0,234,96,0.1)] text-[var(--color-perf-up)] border border-[rgba(0,234,96,0.2)]"
                    : "bg-[rgba(255,59,59,0.1)] text-[var(--color-perf-down)] border border-[rgba(255,59,59,0.2)]",
                )}
              >
                {stock.change >= 0 ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                {stock.change}%
              </div>
            </div>
            <h3 className="mt-2 text-lg sm:text-xl font-bold text-[#888] font-heading">
              {stock.name}
            </h3>
            <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3">
              <span
                className={cn(
                  "rounded-sm px-3 py-1 text-[10px] font-black tracking-[2px] uppercase",
                  detail?.report?.rating.includes("BUY")
                    ? "bg-[var(--color-perf-up)] text-black"
                    : "bg-[#333] text-white",
                )}
              >
                {detail?.report?.rating || "BUY"}
              </span>
              {detail && (
                <span className="rounded-sm bg-[#111] border border-[#333] px-3 py-1 text-[10px] font-bold text-[var(--color-gold)] uppercase tracking-[1px]">
                  Target: Rp {detail.report.targetPrice.toLocaleString("id-ID")}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 sm:grid-cols-4 border-y border-[#222] py-4 sm:py-4 mb-4 sm:mb-4">
            <Metric
              label="Harga Terakhir"
              value={`Rp ${stock.price.toLocaleString("id-ID")}`}
            />
            <Metric label="Market Cap" value={stock.marketCap || "1.200 T"} />
            <Metric label="PER" value={stock.peRatio || "24.5x"} />
            <Metric label="Volume" value={stock.volume || "45.2 jt"} />
          </div>

          <div className="mt-6 sm:mt-8 flex overflow-x-auto gap-2 border-b border-[#1a1a1a] scrollbar-hide pb-2">
            {["Overview", "Financial Analysis", "Technical Analysis", "Corporate Action", "News"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "px-4 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap",
                  tab === t
                    ? "border-b-2 border-[var(--color-gold)] text-[var(--color-gold)]"
                    : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Financial Analysis" && (
            <div className="mt-6 sm:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Financial Content unchanged */}
               <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-[#555] mb-4">Financial Composition (Simulated)</h4>
                  
                  <div className="flex flex-col lg:flex-row items-center gap-12">
                    {/* Pie Chart */}
                    <div className="h-[280px] w-full lg:w-1/2">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Net Income', value: stock.rawNetIncome || 150 },
                              { name: 'Market Cap', value: stock.rawMarketCap || 1000 },
                              { name: 'Revenue', value: stock.rawRevenue || 500 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                          >
                            <Cell fill="#10b981" /> {/* Net Income - Green */}
                            <Cell fill="var(--color-gold)" /> {/* Market Cap - Gold */}
                            <Cell fill="#3b82f6" /> {/* Revenue - Blue */}
                          </Pie>
                          <Tooltip 
                             contentStyle={{ backgroundColor: "#000", border: "1px solid #222", fontSize: "12px", borderRadius: "8px" }}
                             formatter={(value: number) => [`Rp ${(value/1e12).toFixed(2)} T`, 'Value']}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Legend & Metrics */}
                    <div className="flex-1 space-y-6 w-full">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-neutral-900/30 rounded-xl border border-[#1a1a1a]">
                           <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
                              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Net Income</span>
                           </div>
                           <p className="text-xl font-mono font-bold text-white">{stock.netIncome || "0 T"}</p>
                        </div>
                        <div className="p-4 bg-neutral-900/30 rounded-xl border border-[#1a1a1a]">
                           <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]"></div>
                              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Market Cap</span>
                           </div>
                           <p className="text-xl font-mono font-bold text-white">{stock.marketCap || "0 T"}</p>
                        </div>
                        <div className="p-4 bg-neutral-900/30 rounded-xl border border-[#1a1a1a]">
                           <div className="flex items-center gap-2 mb-1">
                              <div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div>
                              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight">Revenue</span>
                           </div>
                           <p className="text-xl font-mono font-bold text-white">{stock.revenue || "0 T"}</p>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-[#1a1a1a] grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-black uppercase text-[#444] mb-1">P/E Ratio</p>
                          <p className="text-2xl font-mono font-bold text-[var(--color-gold)]">{stock.peRatio || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase text-[#444] mb-1">Price to Sales (P/S)</p>
                          <p className="text-2xl font-mono font-bold text-white">{stock.psRatio || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>

               {/* New Quarterly Trend Chart */}
               <div className="mt-8 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#555]">Tren Pendapatan & Laba (Quarterly)</h4>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight">Revenue</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight">Net Income</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stock.quarterlyTrend || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                        <XAxis 
                          dataKey="period" 
                          stroke="#333" 
                          fontSize={10} 
                          axisLine={false} 
                          tickLine={false}
                          dy={10}
                        />
                        <YAxis 
                          stroke="#333" 
                          fontSize={10} 
                          axisLine={false} 
                          tickLine={false}
                          tickFormatter={(value) => `Rp ${(value/1e12).toFixed(1)} T`}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#000", border: "1px solid #222", fontSize: "11px", borderRadius: "8px" }}
                          itemStyle={{ color: "#fff" }}
                          formatter={(value: number) => [`Rp ${(value/1e12).toFixed(2)} T`, '']}
                        />
                        <Bar 
                          dataKey="revenue" 
                          fill="#3b82f6" 
                          radius={[4, 4, 0, 0]} 
                          barSize={32} 
                          name="Revenue"
                        />
                        <Bar 
                          dataKey="netIncome" 
                          fill="#10b981" 
                          radius={[4, 4, 0, 0]} 
                          barSize={32} 
                          name="Net Income"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               {/* Valuation Band Positioning */}
               <div className="mt-8 bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#555]">P/E & P/BV Ratio Band (1Y History - 2 SD)</h4>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]"></div>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight">P/E</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#444]"></div>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight">P/E Mean</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-[2px] bg-[#333]"></div>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight">P/E ±1 SD</span>
                      </div>
                      <div className="flex items-center gap-1.5 border-r border-[#333] pr-4">
                        <div className="w-2 h-2 rounded-[2px] bg-[#222]"></div>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight">P/E ±2 SD</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight">P/BV</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#2563eb]"></div>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight">P/BV Mean</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-[2px] bg-[#1c4e80]"></div>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight">P/BV ±1 SD</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-[2px] bg-[#0f2a4a]"></div>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-tight">P/BV ±2 SD</span>
                      </div>
                    </div>
                  </div>

                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={stock.valuationBands || []} margin={{ left: -20, right: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
                        <XAxis dataKey="date" hide />
                        <YAxis yAxisId="left" stroke="#333" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => val.toFixed(1) + 'x'} />
                        <YAxis yAxisId="right" orientation="right" stroke="#333" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(val) => val.toFixed(1) + 'x'} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#000", border: "1px solid #222", fontSize: "11px", borderRadius: "8px" }}
                          itemStyle={{ color: "#fff" }}
                          labelStyle={{ color: "#888", marginBottom: "4px" }}
                          formatter={(value: number, name: string) => [value.toFixed(2) + 'x', name]}
                        />
                        
                        {/* PE Band (Left Axis) */}
                        <Line yAxisId="left" type="monotone" dataKey="pePlus2SD" stroke="#222" strokeDasharray="5 5" dot={false} strokeOpacity={0.8} name="PE +2 SD" />
                        <Line yAxisId="left" type="monotone" dataKey="pePlus1SD" stroke="#333" strokeDasharray="3 3" dot={false} strokeOpacity={0.8} name="PE +1 SD" />
                        <Line yAxisId="left" type="monotone" dataKey="peMean" stroke="#444" dot={false} strokeOpacity={0.8} name="PE Mean" />
                        <Line yAxisId="left" type="monotone" dataKey="peMinus1SD" stroke="#333" strokeDasharray="3 3" dot={false} strokeOpacity={0.8} name="PE -1 SD" />
                        <Line yAxisId="left" type="monotone" dataKey="peMinus2SD" stroke="#222" strokeDasharray="5 5" dot={false} strokeOpacity={0.8} name="PE -2 SD" />
                        <Line yAxisId="left" type="monotone" dataKey="pe" stroke="var(--color-gold)" strokeWidth={2} dot={false} name="Current P/E" />
                        
                        {/* PBV Band (Right Axis) */}
                        <Line yAxisId="right" type="monotone" dataKey="pbvPlus2SD" stroke="#0f2a4a" strokeDasharray="5 5" dot={false} strokeOpacity={0.8} name="PBV +2 SD" />
                        <Line yAxisId="right" type="monotone" dataKey="pbvPlus1SD" stroke="#1c4e80" strokeDasharray="3 3" dot={false} strokeOpacity={0.8} name="PBV +1 SD" />
                        <Line yAxisId="right" type="monotone" dataKey="pbvMean" stroke="#2563eb" dot={false} strokeOpacity={0.8} name="PBV Mean" />
                        <Line yAxisId="right" type="monotone" dataKey="pbvMinus1SD" stroke="#1c4e80" strokeDasharray="3 3" dot={false} strokeOpacity={0.8} name="PBV -1 SD" />
                        <Line yAxisId="right" type="monotone" dataKey="pbvMinus2SD" stroke="#0f2a4a" strokeDasharray="5 5" dot={false} strokeOpacity={0.8} name="PBV -2 SD" />
                        <Line yAxisId="right" type="monotone" dataKey="pbv" stroke="#3b82f6" strokeWidth={2} dot={false} name="Current P/BV" />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>
          )}

          {tab === "Technical Analysis" && (
            <div className="mt-6 sm:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 sm:p-8">
                  <TechnicalDashboard symbol={stock.symbol} />
               </div>
            </div>
          )}

          {tab === "Corporate Action" && (
            <div className="mt-6 sm:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                <CorporateActionDashboard 
                  events={MOCK_CORPORATE_EVENTS} 
                  initialSymbolFilter={stock.symbol}
                  className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 sm:p-8"
                />

                <section className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 sm:p-8">
                  <div className="flex items-center justify-between mb-4 border-b border-[#222] pb-4">
                    <h4 className="flex items-center gap-3 text-lg font-bold text-white uppercase tracking-[2px]">
                      <ShieldCheck className="text-emerald-500" size={20} />
                      Featured Analyst Picks
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {INITIAL_RECOMMENDED_STOCKS.slice(0, 4).map((rec, i) => (
                      <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-4 sm:p-8">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-black text-white tracking-widest text-lg">{rec.symbol}</span>
                          <div className="flex flex-col items-end">
                             <span className={cn("text-xs font-black", rec.change >= 0 ? "text-emerald-400" : "text-rose-400")}>
                               {rec.change >= 0 ? '+' : ''}{rec.change}%
                             </span>
                             <span className="text-[8px] font-bold text-[#444] uppercase tracking-tighter">Daily Chg</span>
                          </div>
                        </div>
                        <p className="text-[11px] text-[#888] line-clamp-2 leading-relaxed mb-4">"{rec.reason}"</p>
                        <div className="flex items-center justify-between">
                           <span className="text-[9px] font-black text-[#555] uppercase tracking-widest border border-[#222] px-2 py-0.5 rounded">High Alpha</span>
                           <ArrowUpRight size={14} className="text-[#333] group-hover:text-[var(--color-gold)] transition-colors" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
            </div>
          )}

          {tab === "News" && (
            <div className="mt-6 sm:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-end mb-6 relative">
                  <button
                    onClick={() => setIsNewsFilterOpen(!isNewsFilterOpen)}
                    className={cn(
                      "flex items-center justify-center p-3 rounded-full bg-[#111] border transition-all cursor-pointer active:scale-95 shadow-[0_4px_15px_rgba(0,0,0,0.3)]",
                      isNewsFilterOpen || selectedNewsType !== "All"
                        ? "border-[var(--color-gold)] text-[var(--color-gold)] bg-[var(--color-gold)]/5"
                        : "border-[#333] text-zinc-400 hover:text-white hover:border-[#444]"
                    )}
                    title={`Filter: ${selectedNewsType}`}
                  >
                    <Filter size={15} />
                  </button>

                  <AnimatePresence>
                    {isNewsFilterOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-2 right-0 w-[200px] z-50 bg-[#0d0d0d] border border-[#222] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden"
                      >
                        <div className="flex flex-col">
                          {["Semua", "Otoritas", "Media Lokal", "Media Global", "Sentimen Komunitas"].map((type) => (
                            <button
                              key={type}
                              onClick={() => {
                                setSelectedNewsType(type);
                                setIsNewsFilterOpen(false);
                              }}
                              className={cn(
                                "text-left px-4 py-3 text-xs font-bold transition-colors w-full",
                                selectedNewsType === type ? "bg-[var(--color-gold)]/10 text-[var(--color-gold)] border-l-2 border-[var(--color-gold)]" : "text-[#888] hover:bg-[#1a1a1a] hover:text-white border-l-2 border-transparent"
                              )}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
              </div>
              <div className="flex flex-col gap-0 border-t border-[rgba(255,255,255,0.02)]">
                {loadingNews ? (
                   <div className="p-16 flex flex-col items-center justify-center space-y-4">
                      <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mb-2"></div>
                      <span className="text-xs font-bold text-[#888] uppercase tracking-[2px]">Mencari Berita Terbaru...</span>
                      <span className="text-[10px] text-[#555]">Mengambil data dari otoritas dan media online</span>
                   </div>
                ) : filteredStockNewsList.length === 0 ? (
                  <div className="p-10 text-center text-[#666]">Tidak ada berita terkait emiten ini.</div>
                ) : (
                  <div className="space-y-3 pt-4">
                    {filteredStockNewsList.map((news, index) => {
                      const score = news.impactScore || 0;
                      const isHigh = score >= 80;
                      const isLow = score < 50;

                      const impactBorderColor = isHigh ? "border-blue-500" : isLow ? "border-[var(--color-perf-down)]" : "border-transparent";
                      const bgClass = isHigh ? "bg-[#0c121e] shadow-[0_4px_25px_rgba(0,0,0,0.5)]" : isLow ? "bg-[#1a0c0c] shadow-[0_4px_25px_rgba(0,0,0,0.5)]" : "bg-[#0d0d0d] shadow-[0_4px_25px_rgba(0,0,0,0.5)]";
                      const hoverBg = isHigh ? "hover:bg-[rgba(59,130,246,0.2)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]" : isLow ? "hover:bg-[rgba(255,59,59,0.2)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]" : "hover:bg-[#151515] hover:shadow-[0_8px_30px_rgba(0,0,0,0.6)]";
                      return (
                        <motion.article 
                          key={news.id} 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.4 }}
                          whileHover={{ x: 12, scale: 1.005 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => onNewsClick && onNewsClick(news)}
                          className={cn(
                            "group cursor-pointer rounded-2xl border border-[#2a2a2a] p-4 sm:p-5 transition-all text-white",
                            bgClass,
                            hoverBg,
                            impactBorderColor && `border-l-4 ${impactBorderColor}`
                          )}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={cn(
                                "flex items-center gap-1 rounded bg-[#1a1a1a] px-2 py-1 text-[10px] sm:text-[9px] font-bold uppercase tracking-[1px] whitespace-nowrap",
                                news.sourceType === "Otoritas" ? "text-purple-400" :
                                news.sourceType === "Media Lokal" ? "text-blue-400" :
                                news.sourceType === "Media Global" ? "text-amber-400" : "text-emerald-400"
                              )}>
                                {news.sourceType === "Otoritas" && <Building2 size={10} />}
                                {news.sourceType === "Media Lokal" && <Newspaper size={10} />}
                                {news.sourceType === "Media Global" && <Globe2 size={10} />}
                                {news.sourceType === "Sentimen Komunitas" && <Users size={10} />}
                                {news.sourceType || "News"}
                              </span>
                              <span className="text-[10px] text-white font-mono">
                                {news.date}
                              </span>
                            </div>
                            {news.impactScore && (
                              <div className={cn(
                                "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider",
                                isHigh ? "bg-[rgba(59,130,246,0.1)] text-blue-400 border border-blue-500/30" : 
                                isLow ? "bg-[rgba(255,59,59,0.1)] text-[var(--color-perf-down)] border border-[rgba(255,59,59,0.3)]" : 
                                "bg-[#1a1a1a] text-[#aaa] border border-[#333]"
                              )}>
                                <Activity size={10} /> Impact {news.impactScore}
                              </div>
                            )}
                          </div>
                          
                          <h3 className="mb-2 text-sm sm:text-base font-extrabold leading-snug line-clamp-2 text-neutral-100 group-hover:text-[var(--color-gold)] transition-colors">
                            {news.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[#888] line-clamp-2 leading-relaxed mb-4">
                            {news.summary}
                          </p>

                          <div className="flex flex-wrap items-center gap-2">
                            {news.impactedSectors?.map(sector => (
                              <span key={sector} className="rounded bg-[#1a1a1a] px-2 py-0.5 text-[9px] font-bold text-[#888] border border-[#333]">
                                #{sector}
                              </span>
                            ))}
                          </div>
                        </motion.article>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "Overview" && detail ? (
            <div className="mt-12 space-y-12">
              {/* Part I */}
              <section>
                <h4 className="mb-4 flex items-center gap-3 border-b border-[#222] pb-3 font-heading text-2xl font-bold text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-gold)] text-[var(--color-gold)] text-xs font-black">
                    I
                  </span>
                  Framework 4W & MPPT
                </h4>
                <div className="grid gap-4 sm:grid-cols-2">
                  {[
                    { label: "Why (Sentimen)", desc: detail.framework4W.why },
                    { label: "What (Fundamental)", desc: detail.framework4W.what },
                    { label: "Where (Technical Zone)", desc: detail.framework4W.where },
                    { label: "When (Timing)", desc: detail.framework4W.when },
                  ].map((item, idx) => (
                    <div key={idx} className="rounded-xl border border-[#222] bg-[#080808] p-5 hover:border-[#333] transition-colors">
                      <div className="mb-2 text-[10px] font-black uppercase tracking-[2px] text-[var(--color-gold)]">
                        {item.label}
                      </div>
                      <p className="text-sm text-[#aaa] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </section>


              {/* Part II */}
              <section>
                <h4 className="mb-4 flex items-center gap-3 border-b border-[#222] pb-3 font-heading text-2xl font-bold text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-gold)] text-[var(--color-gold)] text-xs font-black">
                    II
                  </span>
                  23-Point Technical Protocol
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8">
                  {detail.technicalSignals.map((sig, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 text-sm text-[#888] border-b border-[rgba(255,255,255,0.02)] pb-2"
                    >
                      <ShieldCheck
                        size={16}
                        className="mt-0.5 shrink-0 text-[var(--color-gold)]"
                      />
                      <span>{sig}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Part III: Intraday Trading Plan */}
              <div className="rounded-2xl border border-[rgba(212,175,55,0.2)] bg-[rgba(212,175,55,0.05)] p-8">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-gold)] text-black">
                      <Zap size={24} fill="black" />
                    </div>
                    <div>
                      <h4 className="font-heading text-2xl font-bold text-white leading-none mb-1">Trading Strategy</h4>
                      <p className="text-[11px] font-bold uppercase tracking-[1px] text-[var(--color-gold)]">Intraday Protocol Active</p>
                    </div>
                  </div>
                  <span className="rounded-sm bg-[rgba(0,234,96,0.1)] border border-[rgba(0,234,96,0.2)] px-3 py-1.5 text-[10px] font-black text-[var(--color-perf-up)] uppercase tracking-[1px]">
                    4W & MPPT Approved
                  </span>
                </div>

                {/* Strategy Execution Chart */}
                <div className="mb-10 bg-[#000] border border-[#222] rounded-2xl overflow-hidden p-2 sm:p-4">
                   <div className="flex items-center gap-2 mb-4 px-2">
                       <LineChartIcon size={14} className="text-[var(--color-gold)]" />
                       <span className="text-[10px] font-black text-[#888] uppercase tracking-widest">Setup Execution Visualization</span>
                   </div>
                   <StockChartApex symbol={stock.symbol} height={300} type="candlestick" />
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Pivot Point", value: `Rp ${detail.report.pivots.pivot.toLocaleString("id-ID")}`, desc: "Baseline MPPT Core." },
                    { label: "Target (TP)", value: `Rp ${detail.report.pivots.r1.toLocaleString("id-ID")}`, desc: "Resistance 1-2 Zone." },
                    { label: "Stop Loss", value: `< Rp ${detail.report.stopLoss.toLocaleString("id-ID")}`, desc: "Risk tolerance limit.", color: "text-[var(--color-perf-down)]" },
                    { label: "Horizon", value: "Intraday", desc: "1H-4H Timing Protocol.", color: "text-[var(--color-gold)]" },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <span className="mb-2 block text-[10px] font-black uppercase tracking-[2px] text-[#555]">
                        {item.label}
                      </span>
                      <span className={cn("text-xl font-black font-heading", item.color || "text-white")}>
                        {item.value}
                      </span>
                      <p className="mt-2 text-[11px] font-bold text-[#666] leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Part IV */}
              <section>
                <h4 className="mb-4 flex items-center gap-3 border-b border-[#222] pb-3 font-heading text-2xl font-bold text-white">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-gold)] text-[var(--color-gold)] text-xs font-black">
                    III
                  </span>
                  Execution Strategy (Scaling-In)
                </h4>
                <div className="space-y-4 relative">
                  <div className="absolute bottom-4 left-[15px] top-2 w-px bg-[#222]"></div>

                  {[
                    { label: "Tranche 1 (25%)", desc: detail.scalingIn.tranche1 },
                    { label: "Tranche 2 (35%)", desc: detail.scalingIn.tranche2 },
                    { label: "Tranche 3 (40%)", desc: detail.scalingIn.tranche3 },
                  ].map((item, idx) => (
                    <div key={idx} className="relative flex gap-6 pl-10">
                      <div className="absolute left-[7px] top-1.5 h-4 w-4 rounded-full border-2 border-[#0a0a0a] bg-[var(--color-gold)] shadow-[0_0_10px_rgba(212,175,55,0.3)]"></div>
                      <div className="w-full rounded-xl bg-[#080808] border border-[#222] p-4 text-sm hover:border-[#333] transition-colors">
                        <span className="block font-black text-white text-[12px] uppercase tracking-[1px] mb-1">
                          {item.label}
                        </span>
                        <span className="text-[#888] leading-relaxed">
                          {item.desc}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Integrated Tracker Pattern: Corporate Action followed by Recommendations */}
              <div className="space-y-12">
                <section className="pt-12 border-t border-[#1a1a1a]">
                  <CorporateActionDashboard 
                    events={MOCK_CORPORATE_EVENTS} 
                    initialSymbolFilter={stock.symbol}
                  />
                </section>

                <section className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="flex items-center gap-3 text-lg font-bold text-white uppercase tracking-wider">
                      <ShieldCheck className="text-emerald-500" size={20} />
                      Top Recommended Opportunities
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(realtimeOpp.length > 0 ? realtimeOpp : INITIAL_RECOMMENDED_STOCKS.slice(0, 4)).map((rec, i) => (
                      <div key={i} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-5 hover:border-[#333] transition-all group overflow-hidden relative">
                        {rec.rsi && (
                          <div className="absolute top-0 right-0 px-2 py-1 bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest">
                            RSI: {rec.rsi}
                          </div>
                        )}
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-black text-white tracking-widest text-lg">{rec.symbol}</span>
                          <span className={cn("text-xs font-bold", (rec.change || 0) >= 0 ? "text-emerald-400" : "text-rose-400")}>
                            {(rec.change || 0) >= 0 ? '+' : ''}{rec.change}%
                          </span>
                        </div>
                        <p className="text-[11px] text-[#666] line-clamp-2 italic mb-3">"{rec.reason}"</p>
                        <div className="flex items-center justify-between">
                          <button className="text-[9px] font-black uppercase text-[var(--color-gold)] tracking-[2px] opacity-40 group-hover:opacity-100 transition-opacity">View Deep Analysis →</button>
                          {rec.distFromLow !== undefined && (
                            <span className="text-[8px] font-black text-[#333] uppercase">Dist Low: {rec.distFromLow}%</span>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          ) : (
            <div className="mt-10 space-y-6">
              <div className="p-6 rounded-xl border border-[#222] bg-[#080808]">
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[2px] text-[var(--color-gold)] mb-4">
                  <BarChart3 size={16} />
                  Institutional Analysis
                </h4>
                <p className="text-lg leading-relaxed text-[#aaa] font-medium italic">
                  "{stock.reason}"
                </p>
              </div>
            </div>
          )}

          <div className="mt-12 flex flex-wrap gap-4 pt-8 border-t border-[#222]">
            <button className="flex-1 rounded-2xl bg-[var(--color-gold)] py-4 font-black text-black transition-all hover:bg-[var(--color-gold-hover)] active:scale-95 uppercase tracking-[1px] text-xs">
              Execute Protocol
            </button>
            <button
               onClick={onClose}
               className="flex-1 rounded-2xl bg-[#111] border border-[#333] py-4 font-black text-white hover:bg-[#222] transition-all uppercase tracking-[1px] text-xs"
            >
              Close Terminal
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
      <div className="text-[10px] font-black uppercase tracking-[2px] text-[#555] mb-2">
        {label}
      </div>
      <div className="text-2xl font-black tracking-tight text-white font-heading">{value}</div>
    </div>
  );
}

function MarketSelectorModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (market: 'IDX' | 'CRYPTO' | 'CFD') => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-[#0a0a0a] border border-[#2a2a2a] p-8 shadow-[0_20px_50px_rgba(0,0,0,1)]"
      >
        <h3 className="font-heading text-xl font-black text-white uppercase tracking-tight mb-4 text-center">
          Pilih Tipe Market
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { label: 'IDX Stocks', value: 'IDX' },
            { label: 'Crypto', value: 'CRYPTO' },
            { label: 'CFD Market', value: 'CFD' }
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => onSelect(cat.value as any)}
              className="w-full py-4 rounded-xl bg-[#111] border border-[#222] hover:border-[var(--color-gold)] text-white font-black uppercase text-[10px] tracking-[2px] transition-all hover:bg-[var(--color-gold)]/10"
            >
              {cat.label}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function TradeModal({
  trade,
  defaultMarket,
  totalCapital,
  onClose,
  onSave,
}: {
  trade: Trade | null;
  defaultMarket?: 'IDX' | 'CRYPTO' | 'CFD';
  totalCapital: number;
  onClose: () => void;
  onSave: (tradeData: Partial<Trade>) => void;
}) {
  const [formData, setFormData] = useState<Partial<Trade>>(
    trade || {
      symbol: "",
      entryPrice: 0,
      quantity: 0,
      date: new Date().toISOString().split('T')[0],
      type: 'BUY',
      status: 'OPEN',
      marketCategory: defaultMarket || 'IDX',
      notes: "",
    }
  );

  const [lotValue, setLotValue] = useState(trade ? trade.quantity / 100 : 0);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (formData.marketCategory === 'IDX') {
      const ep = formData.plannedEntryPrice;
      const sl = formData.plannedStopLoss;
      const risk = formData.riskPerTrade;

      if (ep && sl && risk && ep > sl) {
        const riskPerShare = ep - sl;
        const maxShares = risk / riskPerShare;
        const calculatedLots = Math.floor(maxShares / 100);
        
        if (calculatedLots > 0 && calculatedLots !== lotValue) {
          setLotValue(calculatedLots);
          if (!formData.entryPrice) {
             setFormData(prev => ({ ...prev, entryPrice: ep }));
          }
        }
      }
    }
  }, [formData.plannedEntryPrice, formData.plannedStopLoss, formData.riskPerTrade, formData.marketCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, boolean> = {};

    if (formData.marketCategory === 'IDX') {
      if (!formData.symbol) newErrors.symbol = true;
      if (!formData.date) newErrors.date = true;
      if (!formData.plannedEntryPrice) newErrors.plannedEntryPrice = true;
      if (!formData.plannedStopLoss) newErrors.plannedStopLoss = true;
      if (!formData.plannedTakeProfit) newErrors.plannedTakeProfit = true;
      if (!formData.riskPerTrade) newErrors.riskPerTrade = true;
      if (!formData.setupTrigger) newErrors.setupTrigger = true;
      if (!formData.marketRegime) newErrors.marketRegime = true;
      if (!formData.ihsgCondition) newErrors.ihsgCondition = true;
      if (!formData.psychologicalState) newErrors.psychologicalState = true;
      if (!formData.entryPrice) newErrors.entryPrice = true;
      if (!lotValue) newErrors.lotValue = true;
    } else {
      if (!formData.symbol) newErrors.symbol = true;
      if (!formData.date) newErrors.date = true;
      if (!formData.entryPrice) newErrors.entryPrice = true;
      if (!lotValue) newErrors.lotValue = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave({
      ...formData,
      quantity: lotValue * 100
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#0a0a0a] border border-[#2a2a2a] shadow-[0_20px_50px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]"
      >
        <div className="p-8 overflow-y-auto flex-1 min-h-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-xl bg-[var(--color-gold)] text-black">
                <Briefcase size={20} />
              </div>
              <h3 className="font-heading text-2xl font-black text-white uppercase tracking-tight">
                {trade ? "Edit Entry" : (formData.marketCategory === 'IDX' ? "IDX Stocks" : "Catat Entry Baru")}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-[#444] hover:text-white transition-colors"
            >
              <RefreshCw className="rotate-45" size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-[#555] ml-1">Symbol</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. BBRI"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                  className={cn("w-full bg-[#111] border rounded-xl px-4 py-3 text-white font-bold transition-all outline-none uppercase", errors.symbol ? "border-red-500 animate-shake" : "border-[#222] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-[#555] ml-1">Tanggal Entry</label>
                <input
                  required
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={cn("w-full bg-[#111] border rounded-xl px-4 py-3 text-white font-bold transition-all outline-none", errors.date ? "border-red-500 animate-shake" : "border-[#222] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)]/20")}
                />
              </div>
            </div>

            {formData.marketCategory === 'IDX' && (
              <div className="space-y-4 border border-[#222] p-5 rounded-2xl bg-[#080808]">
                <h5 className="text-[10px] font-black uppercase tracking-[2px] text-[var(--color-gold)] mb-4">IDX Trade Metrics</h5>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#444] ml-1">Planned Entry</label>
                    <input type="number" placeholder="Rp" value={formData.plannedEntryPrice || ''} onChange={(e) => { setFormData({...formData, plannedEntryPrice: Number(e.target.value)}); setErrors(prev => ({...prev, plannedEntryPrice: false})); }} className={cn("w-full bg-[#111] border rounded-xl px-4 py-2.5 text-white text-xs font-bold outline-none", errors.plannedEntryPrice ? "border-red-500 animate-shake" : "border-[#222] focus:border-[#444]")} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#444] ml-1">Planned Cut Loss</label>
                    <input type="number" placeholder="Rp" value={formData.plannedStopLoss || ''} onChange={(e) => { setFormData({...formData, plannedStopLoss: Number(e.target.value)}); setErrors(prev => ({...prev, plannedStopLoss: false})); }} className={cn("w-full bg-[#111] border rounded-xl px-4 py-2.5 text-white text-xs font-bold outline-none", errors.plannedStopLoss ? "border-red-500 animate-shake" : "border-[#222] focus:border-[#444]")} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#444] ml-1">Planned Take Profit</label>
                    <input type="number" placeholder="Rp" value={formData.plannedTakeProfit || ''} onChange={(e) => { setFormData({...formData, plannedTakeProfit: Number(e.target.value)}); setErrors(prev => ({...prev, plannedTakeProfit: false})); }} className={cn("w-full bg-[#111] border rounded-xl px-4 py-2.5 text-white text-xs font-bold outline-none", errors.plannedTakeProfit ? "border-red-500 animate-shake" : "border-[#222] focus:border-[#444]")} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-[#444] ml-1">Risk Per Trade</label>
                    <input type="number" placeholder="Rp" value={formData.riskPerTrade || ''} onChange={(e) => { setFormData({...formData, riskPerTrade: Number(e.target.value)}); setErrors(prev => ({...prev, riskPerTrade: false})); }} className={cn("w-full bg-[#111] border rounded-xl px-4 py-2.5 text-white text-xs font-bold outline-none", errors.riskPerTrade ? "border-red-500 animate-shake" : "border-[#222] focus:border-[#444]")} />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select value={formData.setupTrigger || ""} onChange={(e) => { setFormData({...formData, setupTrigger: e.target.value}); setErrors(prev => ({...prev, setupTrigger: false})); }} className={cn("w-full bg-[#111] border rounded-xl px-4 py-3 text-white text-xs font-bold outline-none", errors.setupTrigger ? "border-red-500 animate-shake" : "border-[#222]")}>
                      <option value="">-- Setup Trigger --</option>
                      <option value="MSB">Market Structure Break</option>
                      <option value="OB_FVG">Order Block / FVG Rejection</option>
                      <option value="POC">Volume Profile POC</option>
                      <option value="Breakout">Breakout / Buy on Weakness</option>
                  </select>

                  <select value={formData.marketRegime || ""} onChange={(e) => { setFormData({...formData, marketRegime: e.target.value as any}); setErrors(prev => ({...prev, marketRegime: false})); }} className={cn("w-full bg-[#111] border rounded-xl px-4 py-3 text-white text-xs font-bold outline-none", errors.marketRegime ? "border-red-500 animate-shake" : "border-[#222]")}>
                    <option value="">-- Market Regime --</option>
                    <option value="Bullish">Bullish</option>
                    <option value="Bearish">Bearish</option>
                    <option value="Sideways">Sideways</option>
                    <option value="Reversal">Reversal</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <select value={formData.ihsgCondition || ""} onChange={(e) => {
                    const cond = e.target.value as any;
                    let multiplier = 0;
                    if (cond === 'Uptrend') multiplier = 1.0;
                    else if (cond === 'Sideway') multiplier = 0.5;
                    else if (cond === 'Downtrend') multiplier = 0.25;
                    
                    // Assuming Total Capital is accessible or set a default/get from context if needed.
                    // Based on requirements, Risk = Capital * 0.01 * Value
                    const risk = totalCapital * 0.01 * multiplier;
                    
                    setFormData({...formData, ihsgCondition: cond, riskPerTrade: risk}); 
                    setErrors(prev => ({...prev, ihsgCondition: false, riskPerTrade: false}));
                  }} className={cn("w-full bg-[#111] border rounded-xl px-4 py-3 text-white text-xs font-bold outline-none", errors.ihsgCondition ? "border-red-500 animate-shake" : "border-[#222]")}>
                    <option value="">-- IHSG Condition --</option>
                    <option value="Uptrend">Uptrend</option>
                    <option value="Sideway">Sideway</option>
                    <option value="Downtrend">Downtrend</option>
                  </select>

                  <select value={formData.psychologicalState || ""} onChange={(e) => { setFormData({...formData, psychologicalState: Number(e.target.value) as any}); setErrors(prev => ({...prev, psychologicalState: false})); }} className={cn("w-full bg-[#111] border rounded-xl px-4 py-3 text-white text-xs font-bold outline-none", errors.psychologicalState ? "border-red-500 animate-shake" : "border-[#222]")}>
                    <option value="">-- Kondisi Psikologis (1-5) --</option>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
            )}

            {formData.marketCategory !== 'IDX' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-[#555] ml-1">Type Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'BUY' })}
                    className={cn(
                      "py-3 rounded-xl font-black text-[10px] uppercase tracking-[2px] transition-all border",
                      formData.type === 'BUY' 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                        : "bg-[#111] text-[#444] border-[#222] hover:border-[#333]"
                    )}
                  >
                    BUY / LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'SELL' })}
                    className={cn(
                      "py-3 rounded-xl font-black text-[10px] uppercase tracking-[2px] transition-all border",
                      formData.type === 'SELL' 
                        ? "bg-rose-500/10 text-rose-400 border-rose-500/30" 
                        : "bg-[#111] text-[#444] border-[#222] hover:border-[#333]"
                    )}
                  >
                    SELL / SHORT
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-[#555] ml-1">
                  Entry Price (Avg)
                </label>
                <input
                  required
                  type="number"
                  placeholder="0"
                  value={formData.entryPrice || ""}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormData({ ...formData, entryPrice: val });
                    setErrors(prev => ({...prev, entryPrice: false}));
                  }}
                  className={cn("w-full bg-[#111] border rounded-xl px-4 py-3 text-white font-mono font-bold transition-all outline-none", errors.entryPrice ? "border-red-500 animate-shake" : "border-[#222] focus:border-[var(--color-gold)]")}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-[#555] ml-1">Quantity (Lots)</label>
                <input
                  required
                  type="number"
                  placeholder="0"
                  value={lotValue || ""}
                  onChange={(e) => { setLotValue(Number(e.target.value)); setErrors(prev => ({...prev, lotValue: false})); }}
                  className={cn("w-full bg-[#111] border rounded-xl px-4 py-3 text-white font-mono font-bold transition-all outline-none", errors.lotValue ? "border-red-500 animate-shake" : "border-[#222] focus:border-[var(--color-gold)]")}
                />
              </div>
            </div>

            <div className="pt-4">
              <div className="flex justify-between items-center mb-4 p-4 rounded-2xl bg-[#080808] border border-[#222]">
                <span className="text-[10px] font-black uppercase tracking-[2px] text-[#555]">
                  Estimasi Kapital Investasi
                </span>
                <div className="flex flex-col items-end">
                  <span className="text-xl font-black text-[var(--color-gold)] font-mono tracking-tighter">
                    Rp {((formData.entryPrice || formData.plannedEntryPrice || 0) * lotValue * 100).toLocaleString("id-ID")}
                  </span>
                  {formData.marketCategory === 'IDX' && (
                    <span className="text-[10px] text-[#666] font-mono tracking-widest mt-1">{(lotValue * 100).toLocaleString("id-ID")} Lembar</span>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl border border-[#222] text-[#666] font-black uppercase text-[10px] tracking-[2px] hover:bg-[#111] transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-[var(--color-gold)] text-black font-black uppercase text-[10px] tracking-[2px] hover:bg-[var(--color-gold-hover)] shadow-xl active:scale-95 transition-all"
                >
                  Simpan Entry
                </button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
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
        className="absolute inset-0 bg-neutral-950/80 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-[#0a0a0a] border border-[#2a2a2a] shadow-[0_20px_50px_rgba(0,0,0,1)] max-h-[90vh] flex flex-col"
      >
        <div className="absolute top-6 right-6 z-10">
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111] border border-[#333] text-[#888] hover:text-white transition-colors"
          >
            <RefreshCw className="rotate-45" size={20} />
          </button>
        </div>

        <div
          className="p-8 lg:p-12 overflow-y-auto"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#333 transparent",
          }}
        >
          <div className="mb-4">
            <div className="flex flex-wrap items-center justify-between gap-6 px-1 mb-4">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-[#050505] border border-emerald-500/10">
                    <div className="w-[3px] h-3 bg-emerald-500/40 rounded-full"></div>
                    <span className="text-[9px] font-black text-emerald-400/50 uppercase tracking-[3px] leading-none">
                      {news.sourceType || "Berita"}
                    </span>
                  </div>
                  <div className={cn("px-2.5 py-0.5 rounded border flex items-center gap-1.5",
                    score >= 80 ? "bg-blue-500/5 border-blue-500/10 text-blue-500/60" :
                    score < 50 ? "bg-red-500/5 border-red-500/10 text-red-500/60" :
                    "bg-[#111] border-[#1a1a1a] text-[#333]"
                  )}>
                    <div className={cn("w-1 h-1 rounded-full animate-pulse",
                      score >= 80 ? "bg-blue-400/40" :
                      score < 50 ? "bg-red-400/40" :
                      "bg-[#222]"
                    )}></div>
                    <span className="text-[7px] font-black uppercase tracking-[1px]">
                      {score >= 80 ? "Critical Bullish" : score < 50 ? "Critical Bearish" : "Stable Neutral"}
                    </span>
                  </div>
               </div>
               
               <div className="flex items-stretch rounded-full border border-[rgba(255,255,255,0.02)] overflow-hidden bg-[#111] h-5 shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                 <div className={cn("flex items-center px-2 py-0.5", 
                   score >= 80 ? "bg-gradient-to-r from-blue-600/70 to-indigo-700/70" : 
                   score < 50 ? "bg-gradient-to-r from-red-600/70 to-rose-700/70" : 
                   "bg-gradient-to-r from-neutral-800 to-neutral-900"
                 )}>
                   <span className={cn("text-[7px] font-black tracking-[1.5px] uppercase mt-px", 
                     score >= 80 || score < 50 ? "text-white" : "text-white/10"
                   )}>
                     {news.impactType.toUpperCase()}
                   </span>
                 </div>
                 <div className="flex items-center px-2 py-0.5 bg-[#050505]">
                   <span className={cn("font-mono font-black text-[9px]",
                     score >= 80 ? "text-blue-500/60" : 
                     score < 50 ? "text-red-500/60" : 
                     "text-[#333]"
                   )}>
                     {score}
                   </span>
                 </div>
               </div>
            </div>
            <h3 className="font-heading text-4xl font-black text-white leading-[1.1] mb-4">
              {news.title}
            </h3>
            <div className="mt-4 p-3 bg-[#050505] border border-[#1a1a1a] rounded-lg flex items-center justify-between relative overflow-hidden">
               <div className="absolute left-0 top-0 bottom-0 w-[1.5px] bg-[var(--color-gold)]/30"></div>
               <div className="flex items-center gap-2.5">
                  <motion.div 
                    animate={{ 
                      boxShadow: [
                        "0 0 0px rgba(212,175,55,0)",
                        "0 0 10px rgba(212,175,55,0.1)",
                        "0 0 0px rgba(212,175,55,0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="p-1 rounded bg-[var(--color-gold)]/5 text-[var(--color-gold)]/60"
                  >
                    <Globe2 size={12} />
                  </motion.div>
                  <motion.span 
                    animate={{ 
                      textShadow: [
                        "0 0 0px rgba(212,175,55,0)",
                        "0 0 10px rgba(212,175,55,0.3)",
                        "0 0 0px rgba(212,175,55,0)"
                      ],
                      color: ["#999", "#ccc", "#999"]
                    }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                    className="text-xs font-black uppercase tracking-wide"
                  >
                    {news.source}
                  </motion.span>
               </div>
               
               <div className="px-2.5 py-0.5 rounded bg-[#0a0a0a] border border-[#151515] text-[10px] font-mono font-bold text-white">
                 {news.date}
               </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-lg text-[#aaa] leading-relaxed font-medium">
              {news.summary}
            </p>
            <div className="mt-10 p-6 bg-[#080808]/50 border border-[rgba(255,255,255,0.03)] rounded-2xl relative overflow-hidden">
               <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--color-gold)]/30"></div>
               <h4 className="text-[10px] font-black uppercase tracking-[2px] text-[var(--color-gold)]/60 mb-4 flex items-center gap-2">
                 <Zap size={12} />
                 Deep Analysis Insights
               </h4>
               <p className="text-[15px] text-[#888] leading-relaxed italic relative z-10">
                 Analisis model menunjukkan bahwa berita ini memiliki korelasi tinggi dengan pergerakan sektor {news.impactedSectors?.join(', ')}. Investor disarankan untuk memantau level likuiditas pada emiten terkait dalam 24 jam ke depan.
               </p>
            </div>
          </div>

          {news.impactedSectors && news.impactedSectors.length > 0 && (
            <div className="mt-10 p-6 bg-[#050505] border border-[#111] rounded-2xl relative overflow-hidden">
               <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 bg-[#333]"></div>
               <h4 className="text-[10px] font-black uppercase tracking-[2px] text-[#444] mb-4">Sektor Terdampak</h4>
               <div className="flex flex-wrap gap-2">
                 {news.impactedSectors.map((s) => (
                   <span
                     key={s}
                     className="bg-[#0a0a0a] border border-[#1a1a1a] text-[#ccc] px-4 py-2 text-[11px] font-bold rounded-lg uppercase tracking-[1px] hover:border-[var(--color-gold)]/30 transition-colors shadow-inner"
                   >
                     {s}
                   </span>
                 ))}
               </div>
            </div>
          )}

          <div className="mt-10 flex flex-wrap gap-4 pt-8">
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center rounded-2xl bg-[var(--color-gold)] py-4 font-bold text-black transition-all hover:bg-[var(--color-gold-hover)] active:scale-95"
            >
              Baca Artikel Asli
            </a>
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl bg-[#111] border border-[#333] py-4 font-bold text-white hover:bg-[#222] transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function TradeLiveStatusBadge({ trade }: { trade: Trade }) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const touchKey = `trade_touched_${trade.id}`;
  const [hasStartedRunning, setHasStartedRunning] = useState<boolean>(() => {
      return sessionStorage.getItem(touchKey) === 'true';
  });

  useEffect(() => {
    let isMounted = true;
    const fetchPrice = async () => {
      try {
        if (trade.marketCategory === 'IDX') {
             const res = await fetch(`/api/quote/${trade.symbol}`);
             if (res.ok) {
                const data = await res.json();
                if (data.price !== undefined && isMounted) {
                   setCurrentPrice(data.price);
                }
             }
        }
      } catch (err) {
        /* ignore */
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [trade.symbol, trade.marketCategory]);

  useEffect(() => {
     if (currentPrice !== null && !hasStartedRunning && trade.status === 'OPEN') {
         let touched = false;
         if (trade.type === 'BUY' && currentPrice <= trade.entryPrice) touched = true;
         if (trade.type === 'SELL' && currentPrice >= trade.entryPrice) touched = true;
         
         if (touched) {
             setHasStartedRunning(true);
             sessionStorage.setItem(touchKey, 'true');
         }
     }
  }, [currentPrice, trade.entryPrice, trade.status, trade.type, hasStartedRunning, touchKey]);

  let derivedStatus = 'Open';
  if (trade.status === 'CLOSED') {
     derivedStatus = (trade.type === 'BUY' ? (trade.exitPrice! >= trade.entryPrice) : (trade.exitPrice! <= trade.entryPrice)) 
         ? 'Take Profit' : 'Cut Loss';
  } else if (currentPrice !== null) {
      const tp = trade.plannedTakeProfit;
      const sl = trade.plannedStopLoss;
      
      let hitTP = false;
      let hitSL = false;
      if (trade.type === 'BUY') {
         if (tp && currentPrice >= tp) hitTP = true;
         else if (sl && currentPrice <= sl) hitSL = true;
      } else {
         if (tp && currentPrice <= tp) hitTP = true;
         else if (sl && currentPrice >= sl) hitSL = true;
      }
      
      if (hitTP) derivedStatus = 'Take Profit';
      else if (hitSL) derivedStatus = 'Cut Loss';
      else if (hasStartedRunning) derivedStatus = 'Running';
      else derivedStatus = 'Open';
  }

  const colors: Record<string, string> = {
      'Open': 'text-[#aaa] bg-[#222]',
      'Running': 'text-emerald-500 bg-emerald-500/10',
      'Take Profit': 'text-emerald-400 bg-emerald-900/30',
      'Cut Loss': 'text-rose-400 bg-rose-900/30'
  };

  return (
    <div className={cn("text-[8px] font-black uppercase tracking-[1px] px-1.5 py-0.5 rounded-sm flex items-center gap-1 w-max", colors[derivedStatus] || 'text-[#aaa]')}>
      {derivedStatus !== 'Open' && (
         <span className={cn("w-1 h-1 rounded-full animate-pulse", 
            derivedStatus === 'Running' ? 'bg-emerald-500' : 
            derivedStatus === 'Take Profit' ? 'bg-emerald-400' : 'bg-rose-400'
         )}></span>
      )}
      {derivedStatus}
    </div>
  );
}

function TradeDetailModal({ 
  trade, 
  totalCapital, 
  newsData,
  onClose,
  onEdit,
  onClosePosition,
  onAverage,
  onUpdatePlan
}: { 
  trade: Trade; 
  totalCapital: number; 
  newsData: NewsItem[];
  onClose: () => void;
  onEdit: () => void;
  onClosePosition: (price: number) => void;
  onAverage: (newAvgPrice: number, newTotalQuantity: number) => void;
  onUpdatePlan: (tp: number | undefined, sl: number | undefined) => void;
}) {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAveraging, setIsAveraging] = useState(false);
  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [showScenario, setShowScenario] = useState(trade.status !== 'CLOSED');
  const [editTP, setEditTP] = useState<number | undefined>(trade.plannedTakeProfit);
  const [editSL, setEditSL] = useState<number | undefined>(trade.plannedStopLoss);
  const [avgEntryPrice, setAvgEntryPrice] = useState<number>(trade.entryPrice);
  const [avgValuation, setAvgValuation] = useState<number>(0);

  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchSymbolNews = async () => {
      setLoadingNews(true);
      try {
        const res = await fetch(`/api/news?symbol=${trade.symbol}&_t=${Date.now()}`, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        if (res.ok) {
           const data = await res.json();
           if (isMounted) setRelatedNews(data);
        }
      } catch (err) {
        // console.error("Failed to fetch related news", err);
      } finally {
        if (isMounted) setLoadingNews(false);
      }
    };
    fetchSymbolNews();
    return () => { isMounted = false; };
  }, [trade.symbol]);

  useEffect(() => {
    let isMounted = true;
    const fetchPrice = async () => {
      try {
        setLoading(true);
        if (trade.marketCategory === 'IDX') {
             const res = await fetch(`/api/quote/${trade.symbol}`);
             if (res.ok) {
                const data = await res.json();
                if (isMounted && data.price) setCurrentPrice(data.price);
             }
        }
      } catch (err) {
        // console.error("Failed to fetch price", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchPrice();
    return () => { isMounted = false; };
  }, [trade]);

  const touchKey = `trade_touched_${trade.id}`;
  const [hasStartedRunning, setHasStartedRunning] = useState<boolean>(() => {
      return sessionStorage.getItem(touchKey) === 'true';
  });

  useEffect(() => {
     if (currentPrice !== null && !hasStartedRunning && trade.status === 'OPEN') {
         let touched = false;
         if (trade.type === 'BUY' && currentPrice <= trade.entryPrice) touched = true;
         if (trade.type === 'SELL' && currentPrice >= trade.entryPrice) touched = true;
         
         if (touched) {
             setHasStartedRunning(true);
             sessionStorage.setItem(touchKey, 'true');
         }
     }
  }, [currentPrice, trade.entryPrice, trade.status, trade.type, hasStartedRunning, touchKey]);

  let derivedStatus = 'Open';
  if (trade.status === 'CLOSED') {
     derivedStatus = (trade.type === 'BUY' ? (trade.exitPrice! >= trade.entryPrice) : (trade.exitPrice! <= trade.entryPrice)) 
         ? 'Take Profit' : 'Cut Loss';
  } else if (currentPrice !== null) {
      const tp = trade.plannedTakeProfit;
      const sl = trade.plannedStopLoss;
      
      let hitTP = false;
      let hitSL = false;
      if (trade.type === 'BUY') {
         if (tp && currentPrice >= tp) hitTP = true;
         else if (sl && currentPrice <= sl) hitSL = true;
      } else {
         if (tp && currentPrice <= tp) hitTP = true;
         else if (sl && currentPrice >= sl) hitSL = true;
      }
      
      if (hitTP) derivedStatus = 'Take Profit';
      else if (hitSL) derivedStatus = 'Cut Loss';
      else if (hasStartedRunning) derivedStatus = 'Running';
      else derivedStatus = 'Open';
  }
  
  const cp = currentPrice || trade.entryPrice;
  const isActive = derivedStatus !== 'Open';
  const pnl = isActive ? (trade.type === 'BUY' ? (cp - trade.entryPrice) : (trade.entryPrice - cp)) * trade.quantity : 0;
  const pnlPercent = isActive ? (trade.type === 'BUY' ? ((cp - trade.entryPrice) / trade.entryPrice) : ((trade.entryPrice - cp) / trade.entryPrice)) * 100 : 0;
  const isProfit = pnl >= 0;
  
  const currentTP = isEditingPlan ? editTP : trade.plannedTakeProfit;
  const currentSL = isEditingPlan ? editSL : trade.plannedStopLoss;

  useEffect(() => {
    if (derivedStatus === 'Take Profit' || derivedStatus === 'Cut Loss') {
      setShowScenario(false);
      setShowNews(false);
    }
  }, [derivedStatus]);

  const tpValue = currentTP ? (currentTP - trade.entryPrice) * trade.quantity : null;
  const slValue = currentSL ? (currentSL - trade.entryPrice) * trade.quantity : null;
  
  const tpInvestmentValue = currentTP ? currentTP * trade.quantity : null;
  const slInvestmentValue = currentSL ? currentSL * trade.quantity : null;

  // Calculate risk using totalCapital
  let riskColor = "bg-neutral-800 text-neutral-400";
  let riskBorder = "border-[#1a1a1a]";
  let riskText = "-";
  let displayRiskAmount: number | null = null;

  if (currentSL && trade.quantity && totalCapital > 0) {
    const riskAmount = Math.abs(trade.entryPrice - currentSL) * trade.quantity;
    displayRiskAmount = riskAmount;
    if (riskAmount > 0) {
        const riskPercent = (riskAmount / totalCapital) * 100;
        riskText = `${riskPercent.toFixed(2)}%`;
        if (riskPercent <= 1) {
            riskColor = "bg-emerald-500/10 text-emerald-500";
            riskBorder = "border-emerald-500/30";
        } else if (riskPercent <= 2) {
            riskColor = "bg-[var(--color-gold)]/10 text-[var(--color-gold)]";
            riskBorder = "border-[var(--color-gold)]/50";
        } else {
            riskColor = "bg-rose-500/10 text-rose-500";
            riskBorder = "border-rose-500/50";
        }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#2a2a2a] bg-[#0d0d0d] shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="shrink-0 px-6 py-5 border-b border-[#222] flex justify-between items-center bg-[#111]">
           <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
             <Target size={16} className="text-[var(--color-gold)]" />
             Posisi: {trade.symbol}
           </h3>
           <button onClick={onClose} className="p-1 text-[#555] hover:text-white transition-colors">
              <X size={18} />
           </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto min-h-0 flex-1">
            <div className="bg-[#050505] border border-[#222] rounded-2xl overflow-hidden p-2">
               <div className="flex items-center gap-2 mb-2 px-2 pt-2">
                   <LineChartIcon size={14} className="text-[var(--color-gold)]" />
                   <span className="text-[9px] font-black text-[#555] uppercase tracking-widest">Live Chart Insight</span>
               </div>
               <StockChartApex symbol={trade.symbol} height={200} type="candlestick" />
            </div>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#080808] p-4 rounded-xl border border-[#1a1a1a]">
                 <span className="block text-[10px] font-black uppercase text-[#555] tracking-widest mb-1">Status</span>
                 {(() => {
                    const colors: Record<string, string> = {
                       'Open': 'text-[#aaa] bg-[#222] border-[#333]',
                       'Running': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
                       'Take Profit': 'text-emerald-400 bg-emerald-900/20 border-emerald-500/30',
                       'Cut Loss': 'text-rose-400 bg-rose-900/20 border-rose-500/30'
                    };

                    return (
                       <motion.span 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={derivedStatus}
                          className={cn("text-xs font-black px-2 py-1 rounded border uppercase tracking-wider flex items-center gap-1.5", colors[derivedStatus] || 'text-[#aaa]')}
                       >
                          {derivedStatus !== 'Open' && (
                             <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", 
                                derivedStatus === 'Running' ? 'bg-emerald-500' : 
                                derivedStatus === 'Take Profit' ? 'bg-emerald-400' : 'bg-rose-400'
                             )}></span>
                          )}
                          {derivedStatus}
                       </motion.span>
                    );
                 })()}
              </div>
              <div className="bg-[#080808] p-4 rounded-xl border border-[#1a1a1a]">
                 <span className="block text-[10px] font-black uppercase text-[#555] tracking-widest mb-1">Tipe</span>
                 <span className={cn("text-xs font-bold uppercase tracking-wider", trade.type === 'BUY' ? "text-emerald-500" : "text-rose-500")}>
                    {trade.type}
                 </span>
              </div>
           </div>

           <div className="bg-[#050505] p-5 rounded-2xl border border-[#222]">
              <div className="flex justify-between items-center mb-4">
                 <span className="text-[10px] font-black uppercase text-[#666] tracking-widest">Detail Harga</span>
                 {loading && <span className="text-[10px] font-bold text-[#888] animate-pulse">Mengambil data...</span>}
              </div>
              <div className="grid grid-cols-2 gap-6 relative">
                 <div className="space-y-1">
                    <span className="text-[10px] uppercase text-[#444] font-bold">Harga Masuk</span>
                    <div className="text-lg font-mono font-black text-white">Rp {trade.entryPrice.toLocaleString("id-ID")}</div>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] uppercase text-[#444] font-bold">Harga Saat Ini</span>
                    <div className={cn("text-lg font-mono font-black", loading ? "text-[#555]" : "text-[var(--color-gold)]")}>
                      {loading ? "..." : `Rp ${cp.toLocaleString("id-ID")}`}
                    </div>
                 </div>
              </div>
              
              {!loading && (
                 <div className="mt-4 pt-4 border-t border-[#1a1a1a] flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-[#555] tracking-wider">
                      {derivedStatus === 'Take Profit' || derivedStatus === 'Cut Loss' ? 'Realized P/L' : 'Unrealized P/L'}
                    </span>
                    {isActive ? (
                       <div className={cn("flex items-center gap-2", isProfit ? "text-emerald-400" : "text-rose-400")}>
                          <span className="text-sm font-black font-mono">
                            {isProfit ? "+" : "-"}Rp {Math.abs(pnl).toLocaleString("id-ID")}
                          </span>
                          <span className="text-xs font-bold">({isProfit ? "+" : ""}{pnlPercent.toFixed(2)}%)</span>
                       </div>
                    ) : (
                       <div className="flex items-center gap-2 text-[#555]">
                          <span className="text-sm font-black font-mono">
                            Rp 0
                          </span>
                          <span className="text-xs font-bold">(0.00%)</span>
                       </div>
                    )}
                 </div>
              )}
           </div>

           <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center p-4 bg-[#080808] border border-[#1a1a1a] rounded-xl mb-1">
                  <span className="block text-[8px] font-black uppercase text-[#555] tracking-widest mb-1">Risk Per Trade</span>
                  <div className="flex gap-2 items-center">
                      <span className="text-xs font-bold text-white font-mono flex items-center pr-2 border-r border-[#222]">
                         {displayRiskAmount !== null ? `Rp ${displayRiskAmount.toLocaleString("id-ID")}` : "-"}
                      </span>
                      <div className={cn("inline-flex px-2 py-0.5 rounded border text-xs font-bold font-mono tracking-wider", riskColor, riskBorder)}>
                          {riskText}
                      </div>
                  </div>
              </div>

              <div className="bg-[#080808] border border-[#1a1a1a] rounded-xl overflow-hidden mt-1">
                                <button 
                   onClick={() => setShowScenario(!showScenario)}
                   className="w-full px-5 py-3 border-b border-[#1a1a1a] bg-[#111] flex justify-between items-center hover:bg-[#1a1a1a] transition-colors"
                 >
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white">Skenario Trading</span>
                   </div>
                   <div className="flex items-center gap-3">
                     {!isEditingPlan && (
                       <span className="text-[9px] font-bold uppercase tracking-widest text-[#444] px-2 py-1 bg-[#0a0a0a] rounded flex items-center gap-1">
                         {showScenario ? "Tutup" : "Lihat"}
                       </span>
                     )}
                   </div>
                 </button>

                 <AnimatePresence>
                   {showScenario && (
                     <motion.div
                       initial={{ height: 0, opacity: 0 }}
                       animate={{ height: "auto", opacity: 1 }}
                       exit={{ height: 0, opacity: 0 }}
                       className="overflow-hidden"
                     >
                       <div className="px-5 py-2 border-b border-[#1a1a1a]/50 bg-[#0d0d0d] flex justify-end">
                   {!isEditingPlan ? (
                     <button onClick={() => setIsEditingPlan(true)} className="text-[10px] font-black uppercase tracking-widest text-[#555] hover:text-[var(--color-gold)] transition-colors flex items-center gap-1">
                       <Pencil size={10} /> Edit
                     </button>
                   ) : (
                     <div className="flex gap-3">
                       <button onClick={() => {
                          onUpdatePlan(editTP, editSL);
                          setIsEditingPlan(false);
                       }} className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors">
                         Simpan
                       </button>
                       <button onClick={() => {
                          setEditTP(trade.plannedTakeProfit);
                          setEditSL(trade.plannedStopLoss);
                          setIsEditingPlan(false);
                       }} className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors">
                         Batal
                       </button>
                     </div>
                   )}
                </div>
                <div className="p-4 space-y-4">
                  {/* Take Profit Frame */}
                  <div className={cn("border rounded-2xl p-4 transition-all relative overflow-hidden", isEditingPlan ? "border-emerald-500/50 bg-emerald-500/[0.03] shadow-[0_0_20px_rgba(16,185,129,0.05)]" : "border-emerald-500/20 bg-[#0a0a0a]")}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 mt-1">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-[#888]">Take Profit</span>
                      </div>
                      <div>
                        {isEditingPlan ? (
                           <div className="relative">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] text-sm font-bold">Rp</span>
                             <input type="number" value={editTP || ''} onChange={e => setEditTP(Number(e.target.value) || undefined)} className="w-[140px] bg-[#111] border border-emerald-500/50 focus:border-emerald-500 rounded-xl pl-8 pr-3 py-2 text-emerald-400 text-sm font-bold font-mono outline-none transition-colors text-right" placeholder="0" />
                           </div>
                        ) : (
                           <span className="text-sm font-black font-mono text-emerald-400">{currentTP ? `Rp ${currentTP.toLocaleString("id-ID")}` : "-"}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-500/10">
                       <div>
                          <span className="text-[9px] font-black uppercase text-[#555] tracking-widest block mb-1">Valuasi</span>
                          <span className="text-sm font-bold font-mono text-white block">{tpInvestmentValue ? `Rp ${tpInvestmentValue.toLocaleString("id-ID")}` : "-"}</span>
                       </div>
                       <div className="text-right">
                          <span className="text-[9px] font-black uppercase text-[#555] tracking-widest block mb-1">Ekspektasi P/L</span>
                          <div className="flex flex-col items-end">
                             <span className="text-sm font-bold font-mono text-emerald-400 block">{tpValue ? `+Rp ${tpValue.toLocaleString("id-ID")}` : "-"}</span>
                             {currentTP && <span className="text-[9px] font-mono font-bold text-emerald-500 bg-emerald-500/10 inline-block px-1.5 py-0.5 rounded mt-1">+{(((currentTP - trade.entryPrice) / trade.entryPrice) * 100).toFixed(2)}%</span>}
                          </div>
                       </div>
                    </div>
                  </div>

                  {/* Stop Loss Frame */}
                  <div className={cn("border rounded-2xl p-4 transition-all relative overflow-hidden", isEditingPlan ? "border-rose-500/50 bg-rose-500/[0.03] shadow-[0_0_20px_rgba(244,63,94,0.05)]" : "border-rose-500/20 bg-[#0a0a0a]")}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2 mt-1">
                         <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"></div>
                         <span className="text-[10px] font-black uppercase tracking-widest text-[#888]">Stop Loss</span>
                      </div>
                      <div>
                        {isEditingPlan ? (
                           <div className="relative">
                             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] text-sm font-bold">Rp</span>
                             <input type="number" value={editSL || ''} onChange={e => setEditSL(Number(e.target.value) || undefined)} className="w-[140px] bg-[#111] border border-rose-500/50 focus:border-rose-500 rounded-xl pl-8 pr-3 py-2 text-rose-400 text-sm font-bold font-mono outline-none transition-colors text-right" placeholder="0" />
                           </div>
                        ) : (
                           <span className="text-sm font-black font-mono text-rose-400">{currentSL ? `Rp ${currentSL.toLocaleString("id-ID")}` : "-"}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-rose-500/10">
                       <div>
                          <span className="text-[9px] font-black uppercase text-[#555] tracking-widest block mb-1">Valuasi</span>
                          <span className="text-sm font-bold font-mono text-white block">{slInvestmentValue ? `Rp ${slInvestmentValue.toLocaleString("id-ID")}` : "-"}</span>
                       </div>
                       <div className="text-right">
                          <span className="text-[9px] font-black uppercase text-[#555] tracking-widest block mb-1">Ekspektasi P/L</span>
                          <div className="flex flex-col items-end">
                             <span className="text-sm font-bold font-mono text-rose-400 block">{slValue ? `-Rp ${Math.abs(slValue).toLocaleString("id-ID")}` : "-"}</span>
                             {currentSL && <span className="text-[9px] font-mono font-bold text-rose-500 bg-rose-500/10 inline-block px-1.5 py-0.5 rounded mt-1">{(((currentSL - trade.entryPrice) / trade.entryPrice) * 100).toFixed(2)}%</span>}
                          </div>
                       </div>
                    </div>
                  </div>                      </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
               </div>


               <div className="flex justify-between items-center p-4 bg-[#080808] border border-[var(--color-gold)]/30 rounded-xl mt-2">
                 <div>
                    <span className="block text-[8px] font-black uppercase text-[var(--color-gold)] tracking-widest mb-1">Nilai P/L Floating MTM</span>
                    <span className="text-xs font-bold text-white font-mono">Volume: {trade.quantity.toLocaleString("id-ID")} Shares</span>
                 </div>
                 <div className="text-right">
                    <span className={cn("text-xs font-bold font-mono", isProfit ? "text-emerald-400" : "text-rose-400")}>
                       {isProfit ? `+Rp ${pnl.toLocaleString("id-ID")}` : `-Rp ${Math.abs(pnl).toLocaleString("id-ID")}`}
                    </span>
                    <span className={cn("block text-[9px] font-mono mt-0.5 text-right", isProfit ? "text-emerald-500/70" : "text-rose-500/70")}>
                       {isProfit ? "+" : ""}{pnlPercent.toFixed(2)}%
                    </span>
                 </div>
              </div>
           </div>

           {/* Related News Section */}
           <div className="mt-4 bg-[#080808] border border-[#1a1a1a] rounded-xl overflow-hidden">
             <button
               onClick={() => setShowNews(!showNews)}
               className="w-full px-5 py-4 border-b border-[#1a1a1a] bg-[#111] flex justify-between items-center hover:bg-[#1a1a1a] transition-colors"
             >
               <div className="flex items-center gap-2">
                  <div className="relative">
                    <Globe2 size={14} className="text-[var(--color-gold)]" />
                    {relatedNews.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--color-gold)] animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.8)]"></span>
                    )}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-gold)]">Berita Terkait Emiten</span>
               </div>
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black tracking-widest text-[#555]">
                    {relatedNews.length} ARTIKEL
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#444] px-2 py-1 bg-[#0a0a0a] rounded flex items-center gap-1">
                    {showNews ? "Tutup" : "Lihat"}
                  </span>
               </div>
             </button>

             <AnimatePresence>
               {showNews && (
                 <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                 >
                    <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
                        {loadingNews ? (
                           <div className="flex flex-col items-center justify-center py-4 bg-[#0a0a0a] rounded-xl border border-[#111]">
                              <div className="w-5 h-5 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin mb-3"></div>
                              <span className="text-[10px] font-bold text-[#555] uppercase tracking-widest">MENCARI BERITA...</span>
                           </div>
                        ) : relatedNews.length === 0 ? (
                           <div className="text-center py-4 bg-[#0a0a0a] rounded-xl border border-[#111]">
                              <span className="text-[10px] font-bold text-[#444] uppercase tracking-widest block mb-2">TIDAK ADA BERITA</span>
                              <span className="text-xs text-[#333]">Belum ada berita terbaru untuk {trade.symbol}</span>
                           </div>
                        ) : (
                           relatedNews.map((news, idx) => (
                              <a href={news.url} target="_blank" rel="noopener noreferrer" key={idx} className="block p-4 bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl hover:border-[var(--color-gold)]/30 hover:bg-[#111] transition-all group">
                                 <h4 className="text-sm font-bold text-white leading-relaxed mb-1.5 group-hover:text-[var(--color-gold)] transition-colors">{news.title}</h4>
                                 <p className="text-[11px] text-[#888] line-clamp-2 leading-relaxed mb-3">{news.summary}</p>
                                 <div className="flex justify-between items-center">
                                     <div className="flex items-stretch rounded-full border border-[rgba(255,255,255,0.03)] overflow-hidden bg-[#111] h-5 shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
                                       <div className={cn("flex items-center px-2 py-0.5", 
                                         (news.impactScore || 0) >= 80 ? "bg-gradient-to-r from-blue-500 to-indigo-600" : 
                                         (news.impactScore || 0) < 50 ? "bg-gradient-to-r from-red-500 to-rose-600" : 
                                         "bg-gradient-to-r from-neutral-800 to-neutral-900"
                                       )}>
                                         <span className={cn("text-[7px] font-black tracking-[1.5px] uppercase mt-px", 
                                           (news.impactScore || 0) >= 80 || (news.impactScore || 0) < 50 ? "text-white" : "text-white/30"
                                         )}>
                                           {news.impactType?.toUpperCase() || 'EMITEN'}
                                         </span>
                                       </div>
                                       <div className="flex items-center px-2 py-0.5 bg-[#050505]">
                                         <span className={cn("font-mono font-black text-[10px]",
                                           (news.impactScore || 0) >= 80 ? "text-blue-400" : 
                                           (news.impactScore || 0) < 50 ? "text-red-400" : 
                                           "text-[#444]"
                                         )}>
                                           {news.impactScore || 0}
                                         </span>
                                       </div>
                                     </div>
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-white font-mono">{news.date.split(',')[0].replace(' 2026', '')}</span>
                                 </div>
                              </a>
                           ))
                        )}
                    </div>
                 </motion.div>
               )}
             </AnimatePresence>
           </div>

           {trade.status === 'OPEN' && !loading && (
             <div className="mt-6 pt-6 border-t border-[#1a1a1a]">
                {isAveraging ? (
                   <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-[#555] tracking-widest">Harga Avg (Rp)</label>
                            <input type="number" value={avgEntryPrice || ''} onChange={e => setAvgEntryPrice(Number(e.target.value))} className="w-full bg-[#111] border border-[#222] focus:border-[var(--color-gold)] rounded-xl px-4 py-2.5 text-white text-xs font-bold font-mono outline-none transition-colors" />
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-[#555] tracking-widest">Valuasi Tambah (Rp)</label>
                            <input type="number" value={avgValuation || ''} onChange={e => setAvgValuation(Number(e.target.value))} className="w-full bg-[#111] border border-[#222] focus:border-[var(--color-gold)] rounded-xl px-4 py-2.5 text-white text-xs font-bold font-mono outline-none transition-colors" />
                         </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                         <button 
                           onClick={() => {
                             if (avgEntryPrice > 0 && avgValuation > 0) {
                               const addedQty = avgValuation / avgEntryPrice;
                               const newTotalQty = trade.quantity + addedQty;
                               const newAvgPrice = ((trade.entryPrice * trade.quantity) + (avgEntryPrice * addedQty)) / newTotalQty;
                               onAverage(newAvgPrice, newTotalQty);
                               setIsAveraging(false);
                             }
                           }}
                           className="flex-1 bg-[var(--color-gold)] hover:brightness-110 text-black font-black uppercase tracking-widest text-[10px] py-3 rounded-xl transition-all"
                         >
                           Konfirmasi Avg
                         </button>
                         <button onClick={() => setIsAveraging(false)} className="bg-neutral-800 hover:bg-neutral-700 text-white font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl border border-[#2a2a2a] transition-all">
                           Batal
                         </button>
                      </div>
                   </div>
                ) : derivedStatus !== 'Take Profit' && derivedStatus !== 'Cut Loss' && (
                    <div className="flex gap-2">
                       {derivedStatus === 'Open' ? (
                           <button onClick={() => onClosePosition(trade.entryPrice)} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white border border-[#2a2a2a] font-black uppercase tracking-widest text-[10px] py-3 rounded-xl transition-all">
                               Cancel
                           </button>
                       ) : isProfit ? (
                           <button 
                             onClick={() => onClosePosition(cp)} 
                             className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 border border-emerald-500/50 font-black uppercase tracking-widest text-[10px] py-3 rounded-xl transition-all"
                           >
                               Cut Profit
                           </button>
                       ) : (
                           <button 
                             onClick={() => onClosePosition(cp)} 
                             className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 border border-rose-500/50 font-black uppercase tracking-widest text-[10px] py-3 rounded-xl transition-all"
                           >
                               Cut Loss
                           </button>
                       )}
                       <button onClick={() => setIsAveraging(true)} className="bg-neutral-800 hover:bg-neutral-700 text-white font-black uppercase tracking-widest text-[10px] px-6 py-3 rounded-xl border border-[#2a2a2a] transition-all">
                           Avg
                       </button>
                       <button onClick={onEdit} className="bg-neutral-800 hover:bg-neutral-700 text-white p-3 rounded-xl border border-[#2a2a2a] transition-all flex items-center justify-center">
                           <Pencil size={14} />
                       </button>
                    </div>
                )}
             </div>
           )}
        </div>
      </motion.div>
    </div>
  );
}
