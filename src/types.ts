export interface MarketData {
  index: number;
  change: number;
  changePercent: number;
  lastUpdate: string;
  history: { time: string; value: number }[];
}

export interface SectorPerformance {
  name: string;
  change: number;
  icon: string;
  color: string;
  outlook?: 'Buy' | 'Sell' | 'Neutral';
  probability?: number;
  volume?: number;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  sourceType?: 'Announcement' | 'Otoritas' | 'Media Lokal' | 'Media Global' | 'Sentimen Komunitas';
  url: string;
  summary: string;
  date: string;
  pubDateStr?: string;
  category?: 'local' | 'international';
  impactType?: 'Makro' | 'Sektoral' | 'Emiten';
  impactScore?: number; // 0 to 100
  impactedSectors?: string[];
  sNlp?: number;
  confidence?: number;
  nEvent?: number;
  wType?: number;
  rEmiten?: number;
  ageHours?: number;
  hType?: number;
}

export interface CorporateEvent {
  id: string;
  symbol: string;
  companyName?: string;
  type: 'Dividen' | 'Stock Split' | 'Right Issue' | 'Saham Bonus' | 'RUPS' | 'Earnings' | string;
  status: 'Upcoming' | 'Active' | 'Completed';
  date: string;
  desc: string;
  
  // Data Khusus Dividen
  dividendValue?: number;
  dividendYield?: number;
  cumDate?: string;
  exDate?: string;
  recordingDate?: string;
  paymentDate?: string;
  
  // Data Khusus Stock Split
  splitRatio?: string;
  pricePre?: number;
  pricePost?: number;
  sharesPre?: string;
  sharesPost?: string;
  effectiveDate?: string;
}

export interface RecommendedStock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  reason: string;
  marketCap?: string;
  peRatio?: string;
  psRatio?: string;
  volume?: string;
  revenue?: string;
  netIncome?: string;
  rawRevenue?: number;
  rawNetIncome?: number;
  rawMarketCap?: number;
  quarterlyTrend?: { period: string; revenue: number; netIncome: number }[];
  valuationBands?: { date: string; pe: number; peMean: number; pePlus1SD: number; pePlus2SD: number; peMinus1SD: number; peMinus2SD: number; pbv: number; pbvMean: number; pbvPlus1SD: number; pbvPlus2SD: number; pbvMinus1SD: number; pbvMinus2SD: number }[];
  detail?: {
    framework4W: {
      why: string;
      what: string;
      where: string;
      when: string;
    };
    technicalSignals: string[];
    report: {
      rating: string;
      targetPrice: number;
      stopLoss: number;
      timeHorizon: string;
      pivots: { r2: number; r1: number; pivot: number; s1: number; s2: number };
      thesis: string;
      technicalSetup: string;
      financials: string;
      conclusion: string;
    };
    scalingIn: {
      tranche1: string;
      tranche2: string;
      tranche3: string;
    };
  };
}

export interface Trade {
  id: string;
  symbol: string;
  entryPrice: number;
  quantity: number;
  date: string;
  type: 'BUY' | 'SELL';
  status: 'OPEN' | 'CLOSED';
  marketCategory: 'IDX' | 'CRYPTO' | 'CFD';
  notes?: string;
  exitPrice?: number;
  // IDX Stocks specific fields
  plannedEntryPrice?: number;
  plannedStopLoss?: number;
  plannedTakeProfit?: number;
  riskPerTrade?: number;
  actualExitPrice?: number;
  setupTrigger?: string;
  marketRegime?: 'Bullish' | 'Bearish' | 'Sideways' | 'Reversal';
  ihsgCondition?: 'Uptrend' | 'Sideway' | 'Downtrend';
  psychologicalState?: 1 | 2 | 3 | 4 | 5;
}

export interface AstroEvent {
  date: string; // ISO format
  type: 'New Moon' | 'Full Moon' | 'First Quarter' | 'Last Quarter';
  description: string;
}

export interface FibonacciNode {
  date: string;
  value: number;
  label: string;
}

export interface TimeSupportSignal {
  id: string;
  date: string;
  symbol: string;
  category: 'IDX' | 'CRYPTO' | 'XAU';
  type: 'Astro' | 'Fibonacci' | 'Hybrid';
  strength: 'High' | 'Medium' | 'Low';
  instruction: string;
  priceZone?: string;
  impactSide?: 'Peak' | 'Bottom' | 'Neutral';
}
