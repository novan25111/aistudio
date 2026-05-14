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
  sourceType?: 'Otoritas' | 'Media Lokal' | 'Media Global' | 'Sentimen Komunitas';
  url: string;
  summary: string;
  date: string;
  category: 'local' | 'international';
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
  type: string;
  date: string;
  desc: string;
}

export interface RecommendedStock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  reason: string;
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
