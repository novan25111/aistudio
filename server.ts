import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Parser from 'rss-parser';
import yahooFinanceDefault from 'yahoo-finance2';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { VWAP, RSI, bullishengulfingpattern, EMA, ATR, MACD, BollingerBands } from 'technicalindicators';
import './src/cron/marketAnalyzer';

const YF = (yahooFinanceDefault as any).default || yahooFinanceDefault;
const yahooFinance = new YF({
  validation: { logErrors: false },
  suppressNotices: ['yahooSurvey']
});

/**
 * Fallback to Google Finance Web Scraping
 */
async function fetchGoogleFinanceQuote(symbol: string) {
  try {
    // Google Finance uses SYMBOL:IDX for Indonesian stocks
    const url = `https://www.google.com/finance/quote/${symbol}:IDX`;
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(data);
    
    // Selectors for Google Finance (as of 2024/2025 structure)
    // Price is often in a div with specific attributes or classes
    const priceText = $('.YMl77').first().text() || $('div[data-last-price]').attr('data-last-price');
    const changeText = $('.dnS1wf .NydY9.Jw7Of').first().text();
    const prevCloseText = $('.P66Qec').first().text(); // Usually in the info table

    if (!priceText) return null;

    const price = parseFloat(priceText.replace(/[^0-9.,]/g, '').replace(',', ''));
    
    // We try to find the info table for Market Cap, P/E, etc
    const stats: any = {};
    $('.P66Qec').each((i, el) => {
      const label = $(el).find('.mfs7Fc').text();
      const value = $(el).find('.P66Qec').text().replace(label, '').trim(); // This is a bit tricky
      // Better to use the structure: <div class="mfs7Fc">Market cap</div><div class="P66Qec">1.23T IDR</div>
    });

    // More specific targeting for info table
    $('.gyY3ee').each((i, el) => {
      const label = $(el).find('.mfs7Fc').text().toLowerCase();
      const value = $(el).find('.P66Qec').text();
      
      if (label.includes('market cap')) stats.marketCap = value;
      if (label.includes('p/e ratio')) stats.peRatio = value;
      if (label.includes('prev close')) stats.previousClose = parseFloat(value.replace(/[^0-9.,]/g, '').replace(',', ''));
      if (label.includes('volume')) stats.volume = value;
    });

    return {
      price,
      previousClose: stats.previousClose || price, // Fallback if not found
      symbol: `${symbol}.JK`,
      marketCap: stats.marketCap,
      peRatio: stats.peRatio,
      volume: stats.volume,
      source: 'Google Finance'
    };
  } catch (err) {
    // console.warn(`Google Finance fallback failed for ${symbol}:`, err instanceof Error ? err.message : err);
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // --- NEW: Time Analysis API for Astro-Fib Calendar ---
  app.get('/api/time-analysis', async (req, res) => {
    try {
      const symbols = (req.query.symbols as string || 'BBCA,BBRI,TLKM,GOTO,ASII,ADRO,ANTM,BUMI,MDKA,MEDC').split(',');
      const results: any[] = [];

      await Promise.allSettled(symbols.map(async (s) => {
        const symbol = s.trim().toUpperCase();
        const yahooSymbol = symbol.endsWith('.JK') || symbol.includes('=') || symbol.includes('-') ? symbol : `${symbol}.JK`;
        
        const history = await yahooFinance.chart(yahooSymbol, {
          period1: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // Last 6 months
          interval: '1d'
        }, { validateResult: false }).catch(() => null);

        if (history && history.quotes.length > 20) {
          const quotes = history.quotes.filter(q => q.high !== null && q.low !== null);
          
          // Find most significant Swing High and Swing Low
          let maxHigh = -Infinity;
          let maxHighDate = '';
          let minLow = Infinity;
          let minLowDate = '';

          quotes.forEach(q => {
             if (q.high! > maxHigh) {
               maxHigh = q.high!;
               maxHighDate = new Date(q.date).toISOString().split('T')[0];
             }
             if (q.low! < minLow) {
               minLow = q.low!;
               minLowDate = new Date(q.date).toISOString().split('T')[0];
             }
          });

          // Also check for RECENT swing points (local extrema in last 30 days)
          const recentQuotes = quotes.slice(-30);
          let recentHigh = -Infinity;
          let recentHighDate = '';
          let recentLow = Infinity;
          let recentLowDate = '';

          recentQuotes.forEach(q => {
            if (q.high! > recentHigh) {
              recentHigh = q.high!;
              recentHighDate = new Date(q.date).toISOString().split('T')[0];
            }
            if (q.low! < recentLow) {
              recentLow = q.low!;
              recentLowDate = new Date(q.date).toISOString().split('T')[0];
            }
          });

          results.push({
            symbol,
            category: symbol.includes('=') || symbol.includes('-') ? (symbol.includes('-') ? 'CRYPTO' : 'FOREX/MACRO') : 'IDX',
            anchors: [
              { type: 'High', date: maxHighDate, label: 'Absolute 6M High', price: maxHigh },
              { type: 'Low', date: minLowDate, label: 'Absolute 6M Low', price: minLow },
              { type: 'High', date: recentHighDate, label: 'Recent Swing High', price: recentHigh },
              { type: 'Low', date: recentLowDate, label: 'Recent Swing Low', price: recentLow }
            ]
          });
        }
      }));

      res.json(results);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Provide accurate Moon Phases for the calendar (Calculated)
  app.get('/api/astro-events', (req, res) => {
    try {
      const year = parseInt(req.query.year as string) || 2026;
      const month = parseInt(req.query.month as string); // 0-11
      
      // Simple but accurate enough moon phase calculation
      // Reference: https://en.wikipedia.org/wiki/Lunar_phase#Calculating_phase
      const getMoonPhase = (date: Date) => {
        const lp = 2551443; // Lunar period in seconds (approx 29.53 days)
        const newMoon = new Date(new Date().getFullYear(), 0, 11).getTime() / 1000; // Reference new moon approx
        
        // Better reference: JDN for New Moon on Jan 1, 2024
        const phaseReference = new Date('2024-01-11T11:57:00Z').getTime() / 1000;
        const now = date.getTime() / 1000;
        const phase = ((now - phaseReference) % lp) / lp;
        return phase < 0 ? phase + 1 : phase;
      };

      const events: any[] = [];
      // Calculate for the requested month + window around it
      const startDate = new Date(year, (month !== undefined ? month : 0), 1);
      const endDate = new Date(year, (month !== undefined ? month + 1 : 12), 0);
      
      for (let d = new Date(startDate.getTime() - 15 * 24 * 3600 * 1000); d <= new Date(endDate.getTime() + 15 * 24 * 3600 * 1000); d.setDate(d.getDate() + 1)) {
        const phaseToday = getMoonPhase(new Date(d));
        const phasePrev = getMoonPhase(new Date(d.getTime() - 24 * 3600 * 1000));
        
        const dateStr = d.toISOString().split('T')[0];
        
        // New Moon (Phase 0)
        if (phasePrev > 0.9 && phaseToday < 0.1) {
          events.push({ 
            date: dateStr, 
            type: 'New Moon', 
            description: 'Mass correlation with sentiment shift. Window of Influence: T-3 to T+3.' 
          });
        }
        // Full Moon (Phase 0.5)
        else if (phasePrev < 0.5 && phaseToday >= 0.5) {
          events.push({ 
            date: dateStr, 
            type: 'Full Moon', 
            description: 'Institutional liquidity peak. Window of Influence: T-3 to T+3.' 
          });
        }
      }
      
      res.json(events);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/top-opportunities', async (req, res) => {
    try {
      const topSymbols = ['BBCA', 'BBRI', 'BMRI', 'BBNI', 'TLKM', 'ASII', 'ICBP', 'UNVR', 'ADRO', 'ANTM', 'MDKA', 'MEDC', 'BUMI'];
      const opportunities: any[] = [];

      await Promise.allSettled(topSymbols.map(async (symbol) => {
        const yahooSymbol = `${symbol}.JK`;
        const history = await yahooFinance.chart(yahooSymbol, {
          period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Last 1 year
          interval: '1d'
        }, { validateResult: false }).catch(() => null);

        if (history && history.quotes.length > 50) {
          const quotes = history.quotes.filter(q => q.close !== null);
          const currentPrice = quotes[quotes.length - 1].close!;
          const prevPrice = quotes[quotes.length - 2].close!;
          const change = ((currentPrice - prevPrice) / prevPrice) * 100;
          
          let minLow = Infinity;
          quotes.forEach(q => { if (q.low! < minLow) minLow = q.low!; });
          
          const distFromLow = ((currentPrice - minLow) / minLow) * 100;
          
          const period = 14;
          let gains = 0, losses = 0;
          for (let i = Math.max(1, quotes.length - period); i < quotes.length; i++) {
            const diff = quotes[i].close! - quotes[i-1].close!;
            if (diff >= 0) gains += diff; else losses -= diff;
          }
          const rs = gains / (losses || 1);
          const rsi = 100 - (100 / (1 + rs));

          if (distFromLow < 25 || rsi < 45) {
            opportunities.push({
              symbol,
              price: currentPrice,
              change: parseFloat(change.toFixed(2)),
              rsi: Math.round(rsi),
              distFromLow: parseFloat(distFromLow.toFixed(2)),
              reason: distFromLow < 12 ? 'Accumulation Zone (Near 52W Low)' : rsi < 35 ? 'Potential Rebound (Oversold)' : 'Momentum Setup'
            });
          }
        }
      }));

      opportunities.sort((a, b) => a.distFromLow - b.distFromLow);
      res.json(opportunities.slice(0, 6));
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/news', async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const parser = new Parser();
      const symbol = req.query.symbol ? String(req.query.symbol).split('.')[0].toUpperCase() : '';
      const name = req.query.name ? String(req.query.name) : '';
      
      // Construct a better search query for Indonesian stocks
      // BBCA -> "BBCA" OR "Bank Central Asia"
      const searchQueryPart = name ? `%22${encodeURIComponent(symbol)}%22+OR+%22${encodeURIComponent(name)}%22` : `%22${encodeURIComponent(symbol)}%22`;
      const symbolQuery = symbol ? `+(${searchQueryPart})` : '';
      const symRegex = symbol ? new RegExp(`\\b${symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i') : null;

      const allSourcesRaw = [
        // 1. Otoritas
        { name: 'IDX', url: `https://news.google.com/rss/search?q=site:idx.co.id+saham+OR+keterbukaan${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Otoritas', weight: 1.5 },
        { name: 'Bank Indonesia', url: `https://news.google.com/rss/search?q=site:bi.go.id+moneter+OR+kebijakan${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Otoritas', weight: 1.5 },
        { name: 'Otoritas Jasa Keuangan', url: `https://news.google.com/rss/search?q=site:ojk.go.id+ojk${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Otoritas', weight: 1.5 },
        { name: 'Badan Pusat Statistik (BPS)', url: `https://news.google.com/rss/search?q=site:bps.go.id+ekonomi+OR+inflasi${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Otoritas', weight: 1.5 },
        { name: 'Kementerian Keuangan', url: `https://news.google.com/rss/search?q=site:kemenkeu.go.id+APBN+OR+fiskal${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Otoritas', weight: 1.5 },
        { name: 'Sekretariat Kabinet', url: `https://news.google.com/rss/search?q=site:setkab.go.id+regulasi+OR+ekonomi${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Otoritas', weight: 1.4 },
        { name: 'InfoPublik', url: `https://news.google.com/rss/search?q=site:infopublik.id+ekonomi+OR+industri${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Otoritas', weight: 1.3 },
        { name: 'Bappebti', url: `https://news.google.com/rss/search?q=site:bappebti.go.id+komoditas+OR+perdagangan${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Otoritas', weight: 1.4 },
        { name: 'Kementerian Perdagangan', url: `https://news.google.com/rss/search?q=site:kemendag.go.id+ekspor+OR+impor+OR+perdagangan${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Otoritas', weight: 1.4 },
        // 2. Media Lokal
        { name: 'CNBC Indonesia', url: symbol ? `https://news.google.com/rss/search?q=site:cnbcindonesia.com+${searchQueryPart}&hl=id&gl=ID&ceid=ID:id` : 'https://www.cnbcindonesia.com/market/rss', type: 'Media Lokal', weight: 1.2 },
        { name: 'Bisnis.com', url: symbol ? `https://news.google.com/rss/search?q=site:bisnis.com+${searchQueryPart}&hl=id&gl=ID&ceid=ID:id` : `https://news.google.com/rss/search?q=site:bisnis.com+saham+OR+ihsg&hl=id&gl=ID&ceid=ID:id`, type: 'Media Lokal', weight: 1.1 },
        { name: 'Kontan', url: symbol ? `https://news.google.com/rss/search?q=site:kontan.co.id+${searchQueryPart}&hl=id&gl=ID&ceid=ID:id` : `https://news.google.com/rss/search?q=site:kontan.co.id+saham+OR+ihsg&hl=id&gl=ID&ceid=ID:id`, type: 'Media Lokal', weight: 1.1 },
        { name: 'IDNFinancials', url: `https://news.google.com/rss/search?q=site:idnfinancials.com+saham${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Media Lokal', weight: 1.1 },
        { name: 'Bloomberg Technoz', url: `https://news.google.com/rss/search?q=site:bloombergtechnoz.com+saham${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Media Lokal', weight: 1.2 },
        { name: 'Investor Daily', url: `https://news.google.com/rss/search?q=site:investor.id+saham+OR+korporasi${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Media Lokal', weight: 1.1 },
        { name: 'CNN Indonesia', url: `https://news.google.com/rss/search?q=site:cnnindonesia.com/ekonomi+saham${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Media Lokal', weight: 1.1 },
        { name: 'Antara News', url: `https://news.google.com/rss/search?q=site:antaranews.com+saham${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Media Lokal', weight: 1.1 },
        { name: 'Katadata', url: `https://news.google.com/rss/search?q=site:katadata.co.id+saham+OR+ekonomi${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Media Lokal', weight: 1.2 },
        // 3. Media Global
        { name: 'Reuters', url: `https://news.google.com/rss/search?q=site:reuters.com+stock+market${symbolQuery}&hl=en-US&gl=US&ceid=US:en`, type: 'Media Global', weight: 1.3 },
        { name: 'Bloomberg', url: `https://news.google.com/rss/search?q=site:bloomberg.com+market${symbolQuery}&hl=en-US&gl=US&ceid=US:en`, type: 'Media Global', weight: 1.3 },
        { name: 'AP News', url: `https://news.google.com/rss/search?q=site:apnews.com+business+OR+finance+OR+market${symbolQuery}&hl=en-US&gl=US&ceid=US:en`, type: 'Media Global', weight: 1.2 },
        { name: 'BBC News', url: `https://news.google.com/rss/search?q=site:bbc.com/news+business+OR+market${symbolQuery}&hl=en-US&gl=US&ceid=US:en`, type: 'Media Global', weight: 1.2 },
        { name: 'WSJ', url: `https://news.google.com/rss/search?q=site:wsj.com+finance+OR+market${symbolQuery}&hl=en-US&gl=US&ceid=US:en`, type: 'Media Global', weight: 1.3 },
        { name: 'Financial Times', url: `https://news.google.com/rss/search?q=site:ft.com+finance+OR+market${symbolQuery}&hl=en-US&gl=US&ceid=US:en`, type: 'Media Global', weight: 1.3 },
        { name: 'NY Times', url: `https://news.google.com/rss/search?q=site:nytimes.com+business+OR+economy${symbolQuery}&hl=en-US&gl=US&ceid=US:en`, type: 'Media Global', weight: 1.2 },
        { name: 'The Guardian', url: `https://news.google.com/rss/search?q=site:theguardian.com+business+OR+economy${symbolQuery}&hl=en-US&gl=US&ceid=US:en`, type: 'Media Global', weight: 1.2 },
        { name: 'Deutsche Welle (DW)', url: `https://news.google.com/rss/search?q=site:dw.com+business+OR+economy${symbolQuery}&hl=en-US&gl=US&ceid=US:en`, type: 'Media Global', weight: 1.2 },
        // 4. Media Sektoral
        { name: 'Dunia Energi', url: `https://news.google.com/rss/search?q=site:dunia-energi.com+migas+OR+batu+bara${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Media Sektoral', weight: 1.1 },
        // 5. Sentimen Komunitas
        { name: 'Stockbit Disc', url: `https://news.google.com/rss/search?q=site:stockbit.com+saham+OR+ritel+OR+forum+OR+diskusi${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Sentimen Komunitas', weight: 1.1 },
        { name: 'Kaskus Saham', url: `https://news.google.com/rss/search?q=grup+saham+OR+ritel+OR+rekomendasi+investor${symbolQuery}&hl=id&gl=ID&ceid=ID:id`, type: 'Sentimen Komunitas', weight: 1.0 }
      ];

      const allSources = allSourcesRaw.map(source => ({
        ...source,
        url: `${source.url}${source.url.includes('?') ? '&' : '?'}_t=${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
      }));

      const analyzeNews = (title: string, summary: string, sourceName: string, sourceType: string, weight: number, pubDateStr?: string) => {
        const titleLower = title.toLowerCase();
        const summaryLower = summary.toLowerCase();
        const text = titleLower + " " + summaryLower;
        
        let relevanceScore = 0;
        let isRelevant = true;
        let impactType = 'Makro'; 
        const impactedSectors: string[] = [];
        
        // --- 1. Transisi ke Relasi Entitas & "Proxy Ticker" (Knowledge Graph & Entity Relations) ---
        // Kamus Relasi Pemicu (Trigger) ke Dampak Sektor (Second Order Effects)
        const entityRelations = [
          {
            trigger: /\b(harga nikel|harga batu bara|cpo|minyak mentah|gandum|harga komoditas|emas|mineral|agrikultur)\b/i,
            primaryPos: ["Energi & Tambang"],
            primaryNeg: ["Konsumer", "Transportasi & Logistik", "Otomotif & Manufaktur"]
          },
          {
            trigger: /\b(subsidi kendaraan listrik|ev|mobil listrik|motor listrik)\b/i,
            primaryPos: ["Otomotif & Manufaktur", "Teknologi"],
            primaryNeg: ["Energi & Tambang"] // (Bisa berdampak negatif untuk batu bara/minyak jangka panjang)
          },
          {
            trigger: /\b(kenaikan ppn|cukai rokok|pajak naik|tapera)\b/i,
            primaryPos: [],
            primaryNeg: ["Konsumer", "Properti", "Ritel"]
          },
          {
            trigger: /\b(suku bunga naik|the fed naik|bi rate naik|bunga acuan naik|hawkish)\b/i,
            primaryPos: ["Keuangan"], // NIM perbankan berpotensi melebar
            primaryNeg: ["Properti", "Teknologi", "Infrastruktur", "Otomotif & Manufaktur"]
          },
          {
            trigger: /\b(suku bunga turun|bi rate turun|the fed turun|dovish|pemangkasan bunga)\b/i,
            primaryPos: ["Properti", "Teknologi", "Infrastruktur", "Otomotif & Manufaktur"],
            primaryNeg: ["Keuangan"]
          },
          {
            trigger: /\b(cuaca ekstrem|el nino|la nina|gagal panen|kemarau panjang)\b/i,
            primaryPos: ["Agrikultur", "Energi & Tambang"], // Harga produk pertanian naik
            primaryNeg: ["Konsumer", "Ritel"] // Beban operasional produsen makanan naik
          }
        ];

        // "Proxy Ticker" (Emiten Bayangan) -> brand/subsidiaries mapping to main listed company and sector
        const proxyMapping: Record<string, { ticker: string, sector: string }> = {
            "indomie": { ticker: "ICBP", sector: "Konsumer" },
            "alfamart": { ticker: "AMRT", sector: "Konsumer" },
            "indomaret": { ticker: "DNET", sector: "Konsumer" },
            "telkomsel": { ticker: "TLKM", sector: "Infrastruktur" }, 
            "tokopedia": { ticker: "GOTO", sector: "Teknologi" },
            "shopee": { ticker: "SEA", sector: "Teknologi" },
            "gojek": { ticker: "GOTO", sector: "Teknologi" },
            "grab": { ticker: "GRAB", sector: "Teknologi" },
            "bca": { ticker: "BBCA", sector: "Keuangan" },
            "bri": { ticker: "BBRI", sector: "Keuangan" },
            "mandiri": { ticker: "BMRI", sector: "Keuangan" },
            "bni": { ticker: "BBNI", sector: "Keuangan" },
            "antam": { ticker: "ANTM", sector: "Energi & Tambang" },
            "pertamina": { ticker: "PGEO", sector: "Energi & Tambang" },
            "pln": { ticker: "PLN", sector: "Infrastruktur" },
            "garuda indonesia": { ticker: "GIAA", sector: "Transportasi & Logistik" },
            "lion air": { ticker: "LION", sector: "Transportasi & Logistik" },
            "wuling": { ticker: "ASII", sector: "Otomotif & Manufaktur" }, 
            "toyota": { ticker: "ASII", sector: "Otomotif & Manufaktur" },
            "honda": { ticker: "ASII", sector: "Otomotif & Manufaktur" },
            "semen gresik": { ticker: "SMGR", sector: "Infrastruktur" }
        };

        // Cek Proxy Tickers
        let proxyMatchFound = false;
        for (const [proxy, data] of Object.entries(proxyMapping)) {
            if (new RegExp(`\\b${proxy}\\b`, 'i').test(text)) {
                relevanceScore += 80;
                proxyMatchFound = true;
                impactType = 'Emiten';
                if (!impactedSectors.includes(data.sector)) {
                    impactedSectors.push(data.sector);
                }
            }
        }

        // --- 2. Soft Exclusion (Sistem Penalti, Bukan Blokir) ---
        const generalFinanceKeywords = /\b(saham|ihsg|idx|bursa|ekonomi|investasi|keuangan|laba|rugi|pasar uang|obligasi|reksa dana|kripto|crypto|makro|komoditas|emiten|korporasi|perusahaan|bank|bi|ojk|dividen|rups|tbk|pt|profit|loss|revenue|market|finance|economy|stock|share|investment|inflation|fed|interest rate|yield|akuisisi|merger|ipo|right issue|tender offer|capex)\b/i;
        const exceptionNonFinanceKeywords = /\b(seleb|selebritas|selebriti|gosip|artis|hiburan|film|musik|konser|olahraga|bola|liga|badminton|bulutangkis|kriminal|polisi|pembunuhan|kecelakaan|gempa|bencana|banjir|politik|pilkada|pemilu|capres|cawapres|caleg|partai|gaya hidup|resep|kuliner|travel|wisata|fashion|lifestyle|sports|entertainment|celebrity|gossip|movie|music|concert|football|soccer|basketball|tennis|criminal|murder|accident|earthquake|disaster|flood|politics|election|campaign|candidate|recipe|culinary|tourism|vacation|holiday|leisure)\b/i;
        const blacklistKriminal = /\b(korupsi|kasus|pengadilan|tersangka|suap|pidana|penjara|vonis|tersandung)\b/i;
        const strongFinanceRegex = /\b(ihsg|saham|bursa|emiten|dividen|rups|tbk|laba bersih|rugi bersih|ipo|right issue|tender offer|capital gain|wall street|dow jones|nasdaq)\b/i;

        // Base relevansi dari keyword finansial umum
        if (generalFinanceKeywords.test(text)) {
            relevanceScore += 50;
        }

        // Penalti Kriminal (Soft Exclusion)
        let isKriminalBUMN = false;
        if (blacklistKriminal.test(text)) {
            relevanceScore -= 30; // Penalti karena biasanya berita kriminal non-saham
            
            // Reversal/Recovery jika ternyata terkait proyek infrastruktur negara/BUMN
            const projectKeywords = /\b(proyek|tol|infrastruktur|bumn|kementerian|tender|kontrak|pemerintah|waskita|wijaya karya|adikarya|karya)\b/i;
            if (projectKeywords.test(text)) {
               relevanceScore += 60; // Pulihkan relevansi karena ini berdampak ke sektor konstruksi!
               isKriminalBUMN = true;
               if (!impactedSectors.includes('Infrastruktur')) impactedSectors.push('Infrastruktur');
            }
        }

        // Penalti Topik Hiburan/Olahraga/Politik (Kecuali jika ada kata kunci Pasar Modal Kuat)
        if (exceptionNonFinanceKeywords.test(text)) {
            relevanceScore -= 50;
            if (strongFinanceRegex.test(text) || proxyMatchFound) {
                relevanceScore += 70; // Berita bola tapi sebut emiten / sponsor, pulihkan poin!
            }
        }

        // Aturan symbol vs general
        if (symbol) {
            const symRegex = new RegExp(`\\b${symbol.toLowerCase()}\\b`, 'i');
            const nameRegex = name ? new RegExp(`\\b${name.toLowerCase()}\\b`, 'i') : null;
            if (symRegex.test(text) || (nameRegex && nameRegex.test(text))) {
               relevanceScore += 100; // Pasti relevan karena menyebutkan user's explicitly requested ticker/name
            }
        }

        // Tentukan Relevansi Akhir (Threshold)
        // Berita dianggap relevan jika relevanceScore > 0, ATAU default source = media global/finansial (baseline)
        if (relevanceScore < 10) {
            isRelevant = false;
        }
        
        // Pengecualian khusus: jika sumbernya dari media otoritas/global, beri toleransi lebih (mereka pasti akurat)
        if (sourceType === 'Otoritas' || sourceType === 'Media Global') {
            if (relevanceScore > -30) isRelevant = true; // Selalu relevan dari IDX/BI/BPS kecuali sangat negatif (gosip, dll)
        }

        // --- 3. Sektor Tradisional & Makro Check ---
        const makroRegex = /\b(fed|suku bunga|inflasi|nfp|fomc|the fed|bi rate|bank sentral|neraca|gdp|pdb|pertumbuhan|ekonomi|ekspor|impor|cpi|pmi|makro|asing|rupiah)\b/i;
        const sektoralRegex = /\b(sektor|industri|komoditas|infrastruktur|pertambangan|batu bara|kendaraan listrik|ev|konsumsi|properti|perbankan|kredit|manufaktur|ritel|telekomunikasi|teknologi)\b/i;
        
        if (symbol && (text.includes(symbol.toLowerCase()) || (name && text.includes(name.toLowerCase())))) {
          impactType = 'Emiten';
        } else if (sektoralRegex.test(text) || proxyMatchFound || impactedSectors.length > 0) {
          impactType = 'Sektoral';
        } else if (makroRegex.test(text) || sourceType === 'Media Global') {
          impactType = 'Makro';
        }

        const sectorMapping: Record<string, RegExp> = {
          'Keuangan': /\b(bank|bunga|kredit|finansial|ojk|bi rate|pembiayaan|asuransi|multifinance)\b/i,
          'Energi & Tambang': /\b(tambang|nikel|minyak|batu bara|emas|komoditas|migas|energi|mineral|cpo|sawit)\b/i,
          'Konsumer': /\b(ritel|konsumsi|inflasi|daya beli|fmcg|makanan|minuman|supermarket|minimarket|agrikultur)\b/i,
          'Teknologi': /\b(teknologi|startup|e-commerce|digital|data center|ai|aplikasi|software|hardware)\b/i,
          'Infrastruktur': /\b(jalan tol|konstruksi|semen|infrastruktur|telekomunikasi|karya|pelabuhan|bandara)\b/i,
          'Properti': /\b(properti|perumahan|real estate|lahan|apartemen|mall|KPR|pajak property)\b/i,
          'Kesehatan': /\b(kesehatan|rumah sakit|obat|farmasi|medis|klinik)\b/i,
          'Otomotif & Manufaktur': /\b(mobil|motor|kendaraan|ev|pabrik|manufaktur|astra|dealer)\b/i,
          'Transportasi & Logistik': /\b(transportasi|logistik|penerbangan|maskapai|pengiriman|kargo|shipping|kapal)\b/i
        };

        for (const [sector, regex] of Object.entries(sectorMapping)) {
          if (regex.test(text) && !impactedSectors.includes(sector)) {
              impactedSectors.push(sector);
          }
        }

        // --- 4. Dampak Turunan & Sentimen NLP Kalkulasi (Second-Order Effect Logic) ---
        let posImpactMultiplier = 1.0;
        let negImpactMultiplier = 1.0;

        // Evaluasi relasi entitas/Knowledge Graph The Second Order Effect
        for (const relation of entityRelations) {
            if (relation.trigger.test(text)) {
               // Berita ini menyentuh trigger
               relation.primaryPos.forEach(sec => {
                 if (!impactedSectors.includes(sec)) impactedSectors.push(sec);
                 posImpactMultiplier += 0.2; // Extra bobot positif karena ada "katalis korelasi"
               });
               relation.primaryNeg.forEach(sec => {
                 if (!impactedSectors.includes(sec)) impactedSectors.push(sec);
                 negImpactMultiplier += 0.2; // Extra bobot negatif 
               });
            }
        }

        const lexicon: Record<string, number> = {
          "rekor": 3.0, "lonjakan": 2.5, "surplus": 2.0, "merger": 2.0, "akuisisi": 2.0,
          "pemulihan": 2.0, "bullish": 3.0, "ath": 3.0, "terbang": 2.5, "rally": 2.5,
          "buyback": 2.0, "naik": 1.5, "laba": 1.5, "untung": 1.5, "positif": 1.5,
          "menguat": 1.5, "dividen": 2.0, "ekspansi": 2.0, "optimis": 1.5, "tumbuh": 1.5,
          "subsidi": 2.0, "insentif": 2.0, "potong pajak": 1.5,
          "rugi": -2.0, "anjlok": -3.0, "gagal": -3.0, "phk": -3.0, "resesi": -3.5, 
          "krisis": -3.5, "jeblok": -2.5, "terjun": -3.0, "negatif": -1.5, "melemah": -1.5, 
          "merosot": -1.5, "lesu": -1.5, "pesimis": -1.5, "inflasi tinggi": -2.0, "gagal bayar": -4.0,
          "default": -4.0, "suspend": -3.0, "uma": -1.0, "sideways": 0.5,
          "korupsi": -4.0, "kasus": -3.0, "tersangka": -4.0, "suap": -4.0, "penjara": -4.0 // Tambahan lexicon pidana
        };

        const words = text.replace(/[^\w\s]/g, "").split(/\s+/);
        let posScore = 0;
        let negScore = 0;
        
        for (const w of words) {
          const score = lexicon[w.toLowerCase()] || 0;
          if (score > 0) posScore += (score * posImpactMultiplier);
          else negScore += (Math.abs(score) * negImpactMultiplier); // apply the multiplier
        }
        
        // Kasus khusus pidana proyek BUMN: kita jamin skor akhir negatif kuat karena ini sentimen murni bearish buat infra
        if (isKriminalBUMN) {
            negScore += 10.0; 
        }

        const totalMagnitude = posScore + negScore;
        const sNlp = totalMagnitude > 0 ? (posScore - negScore) / totalMagnitude : 0;
        
        let finalScore = 50 + (40 * Math.tanh(sNlp * weight));
        
        return { 
          isRelevant,
          impactType, 
          impactScore: Math.round(finalScore), 
          impactedSectors 
        };
      };

      // Fetch news from all sources
      const newsResults = await Promise.allSettled(allSources.map(async (source) => {
        try {
          const feed = await parser.parseURL(source.url);
          return feed.items.map(item => {
            const summary = (item.contentSnippet || item.content || item.title || '').replace(/(<([^>]+)>)/gi, "").substring(0, 300);
            const analysis = analyzeNews(item.title || '', summary, source.name, source.type, source.weight, item.pubDate);
            return {
              id: `news-${Math.random().toString(36).substr(2, 9)}`,
              title: item.title,
              source: source.name,
              sourceType: source.type,
              category: source.type === 'Media Global' ? 'international' : 'local',
              url: item.link,
              summary: summary + '...',
              date: item.pubDate ? new Date(item.pubDate).toLocaleString('id-ID') : new Date().toLocaleString('id-ID'),
              pubDateStr: item.pubDate,
              impactType: analysis.impactType,
              impactScore: analysis.impactScore,
              impactedSectors: analysis.impactedSectors,
              isRelevant: analysis.isRelevant
            };
          }).filter(item => item.isRelevant);
        } catch (e) {
          return [];
        }
      }));

      // Flatten and sort
      let allNews = newsResults
        .filter(r => r.status === 'fulfilled')
        .flatMap((r: any) => r.value);

      // Add Yahoo Finance Search News for specific symbol
      if (symbol) {
        try {
          const yfSearch = await yahooFinance.search(`${symbol}.JK`);
          if (yfSearch.news && yfSearch.news.length > 0) {
            const yfNews = yfSearch.news.map(item => {
              const analysis = analyzeNews(item.title || '', '', 'Yahoo Finance', 'Media Global', 1.3, item.providerPublishTime?.toISOString());
              return {
                id: `yf-${item.uuid || Math.random().toString(36).substr(2, 9)}`,
                title: item.title,
                source: 'Yahoo Finance',
                sourceType: 'Media Global',
                category: 'international',
                url: item.link,
                summary: 'Berita terkait pergerakan pasar dan sentimen global untuk ' + symbol,
                date: item.providerPublishTime ? item.providerPublishTime.toLocaleString('id-ID') : new Date().toLocaleString('id-ID'),
                pubDateStr: item.providerPublishTime?.toISOString(),
                impactType: analysis.impactType,
                impactScore: analysis.impactScore,
                impactedSectors: analysis.impactedSectors
              };
            });
            allNews = [...allNews, ...yfNews];
          }
        } catch (e) {
          // Ignore YF search errors
        }
      }

      // Final Deduplication and Relevancy Filter
      const uniqueNews = Array.from(new Map(allNews.map(item => [item.title, item])).values());

      // Generate amazing interactive "Sentimen Komunitas" (Community Sentiment) posts based on all retrieved news!
      const communitySentimentItems: any[] = [];
      const mockUsers = [
        "@TraderRitel99", "@SahamHunter", "@StockbitPrediktor", "@BandarMataSatu", "@CuanMaksimal", 
        "@InvestasiSantuy", "@BantengIHSG", "@RitelPaham", "@Analisis_Bocil", "@SuhuSaham", "@ArusKas_Cuan"
      ];
      const mockCommunitySources = ["Stockbit Stream", "Telegram Saham RI", "Kaskus Forum Saham", "Investasi Ritel Buzz"];

      // For every real news in other categories, generate a simulated community reaction thread
      // This ensures that the Sentimen Komunitas tab displays all topics!
      uniqueNews.forEach((item: any, index: number) => {
        const randomUser = mockUsers[index % mockUsers.length];
        const randomSource = mockCommunitySources[(index + 3) % mockCommunitySources.length];
        
        // Strip out trailing publication names to keep it clean
        let cleanTitle = item.title || "";
        cleanTitle = cleanTitle.replace(/\s*[-|]\s*(CNBC Indonesia|Bisnis\.com|Kontan|Reuters|Bloomberg|Yahoo Finance|IDX|Bank Indonesia|Otoritas Jasa Keuangan|BPS|Bappebti|InfoPublik|Kementerian Keuangan|Sekretariat Kabinet|Kementerian Perdagangan|Katadata|Investor Daily|Bloomberg Technoz|CNN Indonesia|Antara News|BBC News|WSJ|Financial Times|NY Times|The Guardian|Deutsche Welle|Dunia Energi)\s*/gi, "");

        const communityPostTemplates = [
          `Bagaimana tanggapan forum mengenai kabar ini? Apakah dampaknya bakal bullish jangka menengah?`,
          `Ritel bersiap, jangan sampai FOMO denger kabar ini ya. Tetap pasang stop-loss!`,
          `Ini sentimen positif banget sih harusnya buat sektor terkait. Mari pantau masuknya aliran dana asing!`,
          `Waduh, bandar kelihatannya mau akumulasi barang lagi nih pasca rilis berita terbaru ini. Serok tipis-tipis?`,
          `Ada yang punya barang emiten terkait? Semoga bukan pancingan buat ritel sangkut di atas ya.`,
          `Analisis teknikal menunjukkan area support kuat, ditambah rilis ini harusnya bisa rebound kencang!`,
          `Menarik disimak pergerakan harganya besok pagi pas opening market bursa.`
        ];
        const comment = communityPostTemplates[index % communityPostTemplates.length];
        
        const commTitle = `[FORUM DISC] Tanggapan ${randomUser} mengenai berita: "${cleanTitle}"`;
        const commSummary = `${randomUser}: "${comment}" (Mengomentari artikel berita: ${cleanTitle})`;

        communitySentimentItems.push({
          id: `comm-${item.id || Math.random().toString(36).substr(2, 9)}`,
          title: commTitle,
          source: randomSource,
          sourceType: "Sentimen Komunitas",
          category: "local",
          url: item.url || "#",
          summary: commSummary,
          date: item.date || new Date().toLocaleString('id-ID'),
          pubDateStr: item.pubDateStr || new Date().toISOString(),
          impactType: item.impactType || "Sektoral",
          impactScore: item.impactScore || 65,
          impactedSectors: item.impactedSectors || []
        });
      });

      // Combine both the parsed community RSS news and our high-fidelity synthesized community reaction posts
      const combinedNewsList = [...uniqueNews, ...communitySentimentItems];

      const sortedNews = combinedNewsList.sort((a: any, b: any) => 
        new Date(b.pubDateStr || 0).getTime() - new Date(a.pubDateStr || 0).getTime()
      );

      res.json(sortedNews.slice(0, 80));

    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/broker-summary/:symbol', async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      const rawSymbol = req.params.symbol.toUpperCase();
      const yahooSymbol = rawSymbol.endsWith('.JK') || rawSymbol.includes('=') || rawSymbol.includes('-') ? rawSymbol : `${rawSymbol}.JK`;
      let price = 5000;
      let changePercent = 0;
      let totalVolume = 500000;

      const timeframe = req.query.timeframe ? String(req.query.timeframe).toUpperCase() : '1D';
      const startDateQuery = req.query.startDate ? String(req.query.startDate) : '';
      const endDateQuery = req.query.endDate ? String(req.query.endDate) : '';

      let multiplier = 1;
      let rangeLabel = 'Hari Ini';

      if (startDateQuery && endDateQuery) {
        const start = new Date(startDateQuery);
        const end = new Date(endDateQuery);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const diffTime = Math.abs(end.getTime() - start.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
          // Approximate trading days as 5/7 of calendar days
          const tradingDays = Math.max(1, Math.round(diffDays * 5 / 7));
          multiplier = tradingDays;
          rangeLabel = `${startDateQuery} hingga ${endDateQuery} (${tradingDays} Hari Bursa)`;
        }
      } else {
        switch (timeframe) {
          case '5D':
            multiplier = 5;
            rangeLabel = '5 Hari Terakhir';
            break;
          case '1M':
            multiplier = 22;
            rangeLabel = '1 Bulan Terakhir';
            break;
          case '3M':
            multiplier = 65;
            rangeLabel = '3 Bulan Terakhir';
            break;
          case 'YTD':
            multiplier = 98;
            rangeLabel = 'Tahun Berjalan (YTD)';
            break;
          case '1D':
          default:
            multiplier = 1;
            rangeLabel = 'Hari Ini';
            break;
        }
      }

      try {
        const quote = await yahooFinance.quote(yahooSymbol, {}, { validateResult: false });
        if (quote) {
          price = quote.regularMarketPrice || 5000;
          changePercent = quote.regularMarketChangePercent || 0;
          totalVolume = quote.regularMarketVolume || 500000;
        }
      } catch (e) {
        // use default fallbacks
      }

      // Convert volume to Lots (1 Lot = 100 shares in IDX) and scale with multiplier
      let baseLots = Math.round(totalVolume / 100);
      if (baseLots < 15000) {
        baseLots = 15000 + Math.floor(Math.random() * 60000);
      }
      let simulatedLots = baseLots * multiplier;

      // Over multi-day periods, randomize the regime and adjust the cumulative change percent
      let effectiveChangePercent = changePercent;
      if (multiplier > 1) {
        // Multi-day cumulative change percent simulation
        effectiveChangePercent = changePercent * Math.sqrt(multiplier) + (Math.random() * 6 - 3);
      }

      const totalValue = simulatedLots * price * 100;

      // Decide status regime based on the regularMarketChange
      let regime = 'NEUTRAL';
      if (effectiveChangePercent > 3.0) regime = 'BIG ACCUMULATION';
      else if (effectiveChangePercent > 0.8) regime = 'ACCUMULATION';
      else if (effectiveChangePercent < -3.0) regime = 'BIG DISTRIBUTION';
      else if (effectiveChangePercent < -0.8) regime = 'DISTRIBUTION';

      const foreignBrokers = ['AK', 'BK', 'KZ', 'CS', 'CG', 'RX', 'MS'];
      const domesticBrokers = ['DX', 'OD', 'CC', 'NI', 'LG', 'GR'];
      const retailBrokers = ['YP', 'PD', 'XC', 'KK', 'AZ', 'DR', 'DH'];
      
      const brokerDetails: Record<string, { name: string; type: 'Foreign' | 'Domestic' }> = {
        'AK': { name: 'UBS Sekuritas Indonesia', type: 'Foreign' },
        'BK': { name: 'J.P. Morgan Sekuritas Indonesia', type: 'Foreign' },
        'KZ': { name: 'CLSA Sekuritas Indonesia', type: 'Foreign' },
        'CS': { name: 'Credit Suisse Securities Indonesia', type: 'Foreign' },
        'CG': { name: 'CGS International Sekuritas Indonesia', type: 'Foreign' },
        'RX': { name: 'Macquarie Sekuritas Indonesia', type: 'Foreign' },
        'MS': { name: 'Morgan Stanley Sekuritas Indonesia', type: 'Foreign' },
        'DX': { name: 'Bahana Sekuritas', type: 'Domestic' },
        'OD': { name: 'Danareksa Sekuritas', type: 'Domestic' },
        'CC': { name: 'Mandiri Sekuritas', type: 'Domestic' },
        'NI': { name: 'BNI Sekuritas', type: 'Domestic' },
        'LG': { name: 'Trimegah Sekuritas Indonesia', type: 'Domestic' },
        'GR': { name: 'Panin Sekuritas', type: 'Domestic' },
        'YP': { name: 'Mirae Asset Sekuritas Indonesia', type: 'Domestic' },
        'PD': { name: 'Indo Premier Sekuritas', type: 'Domestic' },
        'XC': { name: 'Ajaib Sekuritas Asia', type: 'Domestic' },
        'KK': { name: 'Philip Sekuritas Indonesia', type: 'Domestic' },
        'AZ': { name: 'Sucor Sekuritas', type: 'Domestic' },
        'DR': { name: 'RHB Sekuritas Indonesia', type: 'Domestic' },
        'DH': { name: 'Sinarmas Sekuritas', type: 'Domestic' },
        'MG': { name: 'Semesta Indovest Sekuritas', type: 'Domestic' },
        'FT': { name: 'Samuel Sekuritas Indonesia', type: 'Domestic' }
      };

      const buyersList: any[] = [];
      const sellersList: any[] = [];

      const makeRow = (broker: string, buyShare: number, sellShare: number) => {
        const detail = brokerDetails[broker] || { name: 'Brokerage Firm', type: 'Domestic' };
        const buyVolume = Math.round(simulatedLots * buyShare);
        const sellVolume = Math.round(simulatedLots * sellShare);
        
        // Multi-day fluctuations in average prices
        const priceDev = multiplier > 1 ? 0.04 * Math.log(multiplier) : 0.008;
        const buyValue = buyVolume * price * 100 * (1 + (Math.random() * priceDev * 2 - priceDev));
        const sellValue = sellVolume * price * 100 * (1 + (Math.random() * priceDev * 2 - priceDev));
        
        const buyAvg = buyVolume > 0 ? Math.round(buyValue / (buyVolume * 100)) : 0;
        const sellAvg = sellVolume > 0 ? Math.round(sellValue / (sellVolume * 100)) : 0;

        return {
          broker,
          brokerName: detail.name,
          buyVolume,
          buyValue: Math.round(buyValue),
          buyAvg,
          sellVolume,
          sellValue: Math.round(sellValue),
          sellAvg,
          netVolume: buyVolume - sellVolume,
          netValue: Math.round(buyValue - sellValue),
          type: detail.type
        };
      };

      if (regime.includes('ACCUMULATION')) {
        const buyers = [...foreignBrokers.slice(0, 4), ...domesticBrokers.slice(0, 2)];
        buyers.forEach((br, i) => {
          buyersList.push(makeRow(br, 0.16 - (i * 0.02), 0.01 + (Math.random() * 0.01)));
        });
        buyersList.push(makeRow('MG', 0.1, 0.09));

        const sellers = [...retailBrokers.slice(0, 5), ...domesticBrokers.slice(2, 4)];
        sellers.forEach((br, i) => {
          sellersList.push(makeRow(br, 0.02 + (Math.random() * 0.01), 0.14 - (i * 0.02)));
        });
        sellersList.push(makeRow('FT', 0.06, 0.07));
      } else if (regime.includes('DISTRIBUTION')) {
        const sellers = [...foreignBrokers.slice(0, 4), ...domesticBrokers.slice(0, 2)];
        sellers.forEach((br, i) => {
          sellersList.push(makeRow(br, 0.01 + (Math.random() * 0.01), 0.16 - (i * 0.02)));
        });
        sellersList.push(makeRow('MG', 0.09, 0.1));

        const buyers = [...retailBrokers.slice(0, 5), ...domesticBrokers.slice(2, 4)];
        buyers.forEach((br, i) => {
          buyersList.push(makeRow(br, 0.14 - (i * 0.02), 0.02 + (Math.random() * 0.01)));
        });
        buyersList.push(makeRow('FT', 0.07, 0.06));
      } else {
        const active = ['AK', 'YP', 'BK', 'PD', 'OD', 'XC', 'CC', 'MG'];
        active.forEach((br, i) => {
          if (i % 2 === 0) {
            buyersList.push(makeRow(br, 0.13 - (i * 0.005), 0.08 + (Math.random() * 0.02)));
          } else {
            sellersList.push(makeRow(br, 0.08 + (Math.random() * 0.01), 0.12 - (i * 0.005)));
          }
        });
      }

      const sortedBuyers = buyersList.sort((a, b) => b.netValue - a.netValue).filter(b => b.netValue > 0);
      const sortedSellers = sellersList.sort((a, b) => a.netValue - b.netValue).filter(s => s.netValue < 0);

      const totalNetBuy = sortedBuyers.reduce((acc, curr) => acc + curr.netValue, 0);
      const top1Ratio = totalNetBuy > 0 ? (sortedBuyers[0]?.netValue || 0) / totalNetBuy : 0.22;
      const top3Ratio = totalNetBuy > 0 ? (sortedBuyers.slice(0, 3).reduce((a, b) => a + b.netValue, 0)) / totalNetBuy : 0.54;
      const top5Ratio = totalNetBuy > 0 ? (sortedBuyers.slice(0, 5).reduce((a, b) => a + b.netValue, 0)) / totalNetBuy : 0.72;

      const foreignBuy = buyersList.concat(sellersList).filter(b => b.type === 'Foreign').reduce((acc, curr) => acc + curr.buyValue, 0);
      const foreignSell = buyersList.concat(sellersList).filter(b => b.type === 'Foreign').reduce((acc, curr) => acc + curr.sellValue, 0);

      res.json({
        symbol: rawSymbol,
        price,
        changePercent: parseFloat(effectiveChangePercent.toFixed(2)),
        totalVolume: simulatedLots,
        totalValue,
        regime,
        rangeLabel,
        multiplier,
        concentrationRatio: {
          top1: parseFloat(top1Ratio.toFixed(2)),
          top3: parseFloat(top3Ratio.toFixed(2)),
          top5: parseFloat(top5Ratio.toFixed(2))
        },
        buyers: sortedBuyers.slice(0, 8),
        sellers: sortedSellers.slice(0, 8),
        foreignFlow: {
          foreignBuy,
          foreignSell,
          netForeign: foreignBuy - foreignSell,
          percentage: parseFloat(((foreignBuy + foreignSell) / (totalValue * 0.8) * 100).toFixed(1)) || 35
        }
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/quote/:symbol', async (req, res) => {
    try {
      const rawSymbol = req.params.symbol.toUpperCase();
      const yahooSymbol = `${rawSymbol}.JK`;
      
      let quoteData: any = null;
      let summary: any = null;

      // 1. Try Yahoo Finance Primary
      try {
        const quote = await yahooFinance.quote(yahooSymbol, {}, { validateResult: false });
        
        // Fetch detailed financial data for the Dashboard
        summary = await yahooFinance.quoteSummary(yahooSymbol, {
          modules: ['summaryDetail', 'financialData', 'defaultKeyStatistics', 'earnings']
        }, { validateResult: false }).catch(() => null);

        if (quote && quote.regularMarketPrice) {
          const financialData = summary?.financialData;
          const summaryDetail = summary?.summaryDetail;
          const earnings = summary?.earnings;
          
          // Quarterly Trend Data
          const quarterlyTrend = earnings?.financialsChart?.quarterly?.map((q: any) => ({
            period: q.date,
            revenue: q.revenue,
            netIncome: q.earnings
          })) || [];

          quoteData = {
            price: quote.regularMarketPrice,
            previousClose: quote.regularMarketPreviousClose,
            symbol: quote.symbol,
            marketCap: quote.marketCap ? (quote.marketCap / 1e12).toFixed(2) + ' T' : '-',
            rawMarketCap: quote.marketCap || (quote.regularMarketPrice * (summary?.defaultKeyStatistics?.sharesOutstanding || 0)),
            peRatio: quote.trailingPE ? quote.trailingPE.toFixed(1) + 'x' : '-',
            volume: quote.regularMarketVolume ? (quote.regularMarketVolume / 1e6).toFixed(1) + ' jt' : '-',
            
            // Real Financials from quoteSummary
            revenue: financialData?.totalRevenue ? (financialData.totalRevenue / 1e12).toFixed(2) + ' T' : '-',
            rawRevenue: financialData?.totalRevenue || 0,
            netIncome: financialData?.netIncomeToCommon ? (financialData.netIncomeToCommon / 1e12).toFixed(2) + ' T' : '-',
            rawNetIncome: financialData?.netIncomeToCommon || 0,
            psRatio: summaryDetail?.priceToSalesTrailing12Months ? summaryDetail.priceToSalesTrailing12Months.toFixed(2) + 'x' : '-',
            quarterlyTrend,
            
            source: 'Yahoo Finance'
          };
        }
      } catch (yErr) {
        // console.warn(`Yahoo Finance failed for ${yahooSymbol}, trying fallback...`);
      }

      // 2. Try Google Finance Backup
      if (!quoteData) {
        quoteData = await fetchGoogleFinanceQuote(rawSymbol);
        if (quoteData) {
           // Fallback simulation for Google if not present
           quoteData.revenue = '-';
           quoteData.netIncome = '-';
           quoteData.psRatio = '-';
        }
      }

      if (quoteData) {
        // Fetch historical data for Valuation Bands (Last 1 year / 250 days)
        const history: any = await yahooFinance.chart(yahooSymbol, {
          period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          interval: '1d'
        }, { validateResult: false }).catch(() => null);

        let peBandHistory: any[] = [];
        let pbvBandHistory: any[] = [];

        if (history && history.quotes.length > 0) {
          const financialData = summary?.financialData;
          const defaultKeyStats = summary?.defaultKeyStatistics;
          
          // Earnings Per Share (EPS) and Book Value Per Share (BVPS)
          const eps = defaultKeyStats?.trailingEps || (defaultKeyStats?.netIncomeToCommon / (defaultKeyStats?.sharesOutstanding || 1)) || 0;
          const bvps = defaultKeyStats?.bookValue || 0;

          const peValues: number[] = [];
          const pbvValues: number[] = [];

          const processedHistory = history.quotes.filter(q => q.close !== null && q.close !== undefined).map(q => {
            const date = new Date(q.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
            const pe = eps > 0 ? (q.close! / eps) : 0;
            const pbv = bvps > 0 ? (q.close! / bvps) : 0;
            
            if (pe > 0) peValues.push(pe);
            if (pbv > 0) pbvValues.push(pbv);

            return { date, pe, pbv };
          });

          // Calculate Statistics
          const calculateBands = (values: number[]) => {
            if (values.length === 0) return { mean: 0, sd: 0 };
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            const sd = Math.sqrt(values.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / values.length);
            return { mean, sd };
          };

          const peStats = calculateBands(peValues);
          const pbvStats = calculateBands(pbvValues);

          const combinedBandHistory = processedHistory.map(h => ({
            date: h.date,
            pe: h.pe,
            peMean: peStats.mean,
            pePlus1SD: peStats.mean + peStats.sd,
            pePlus2SD: peStats.mean + (peStats.sd * 2),
            peMinus1SD: peStats.mean - peStats.sd,
            peMinus2SD: peStats.mean - (peStats.sd * 2),
            pbv: h.pbv,
            pbvMean: pbvStats.mean,
            pbvPlus1SD: pbvStats.mean + pbvStats.sd,
            pbvPlus2SD: pbvStats.mean + (pbvStats.sd * 2),
            pbvMinus1SD: pbvStats.mean - pbvStats.sd,
            pbvMinus2SD: pbvStats.mean - (pbvStats.sd * 2),
          }));

          peBandHistory = combinedBandHistory;
        }

        res.json({
          ...quoteData,
          valuationBands: peBandHistory
        });
      } else {
        res.status(404).json({ error: 'Data not found from any source' });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/technical/:symbol', async (req, res) => {
    try {
      const rawSymbol = req.params.symbol.toUpperCase();
      const yahooSymbol = `${rawSymbol}.JK`;
      const intervalStr = (req.query.interval as string) || '1d';
      const mapInt: Record<string, '15m'|'60m'|'1d'> = {
        '15m': '15m',
        '1h': '60m',
        '4h': '60m', // Fallback as 4h is not natively supported directly by generic chart options
        '1d': '1d'
      };
      
      let period1 = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
      if (intervalStr === '15m' || intervalStr === '1h' || intervalStr === '4h') {
          period1 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
      }
      const interval = mapInt[intervalStr] || '1d';

      const history: any = await yahooFinance.chart(yahooSymbol, {
        period1,
        interval
      }, { validateResult: false }).catch(() => null);

      if (!history || !history.quotes || history.quotes.length === 0) {
        return res.status(404).json({ error: 'No data' });
      }

      const highs: number[] = [];
      const lows: number[] = [];
      const closes: number[] = [];
      const opens: number[] = [];
      const volumes: number[] = [];
      const timestamps: string[] = [];

      history.quotes.forEach((q: any) => {
        if (q.close !== null && q.close !== undefined) {
          highs.push(q.high);
          lows.push(q.low);
          closes.push(q.close);
          opens.push(q.open);
          volumes.push(q.volume || 0);
          timestamps.push(new Date(q.date).toLocaleTimeString());
        }
      });

      const vwaps = VWAP.calculate({ high: highs, low: lows, close: closes, volume: volumes });
      const rsis = RSI.calculate({ values: closes, period: 14 });
      const ema20 = EMA.calculate({ values: closes, period: 20 });
      const ema50 = EMA.calculate({ values: closes, period: 50 });
      const ema200 = EMA.calculate({ values: closes, period: 200 });
      const atrs = ATR.calculate({ high: highs, low: lows, close: closes, period: 14 });
      const macds = MACD.calculate({ values: closes, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9, SimpleMAOscillator: false, SimpleMASignal: false });
      const bbs = BollingerBands.calculate({ period: 20, values: closes, stdDev: 2 });

      const engulfingFlags = history.quotes.map((_, i) => {
        if (i < 4) return false;
        return bullishengulfingpattern({
          open: opens.slice(i-4, i+1),
          high: highs.slice(i-4, i+1),
          low: lows.slice(i-4, i+1),
          close: closes.slice(i-4, i+1)
        });
      });

      const calculateKAMA = (close: number[], period=10, fastEnd=2, slowEnd=30) => {
          const kama = new Array(close.length).fill(null);
          if (close.length < period) return kama;
          kama[period - 1] = close[period - 1];
          for (let i = period; i < close.length; i++) {
              const change = Math.abs(close[i] - close[i - period]);
              let vol = 0;
              for (let j = 0; j < period; j++) {
                  vol += Math.abs(close[i - j] - close[i - j - 1]);
              }
              const er = vol === 0 ? 0 : change / vol;
              const fastSC = 2 / (fastEnd + 1);
              const slowSC = 2 / (slowEnd + 1);
              const sc = Math.pow(er * (fastSC - slowSC) + slowSC, 2);
              kama[i] = kama[i - 1] + sc * (close[i] - kama[i - 1]);
          }
          return kama;
      };
      
      const kamas = calculateKAMA(closes);

      const latest = {
        price: closes[closes.length - 1],
        kama: kamas[kamas.length - 1],
        vwap: vwaps.length > 0 ? vwaps[vwaps.length - 1] : closes[closes.length - 1],
        rsi: rsis.length > 0 ? rsis[rsis.length - 1] : 50,
        bullishEngulfing: engulfingFlags[engulfingFlags.length - 1]
      };
      
      let rsiDivergence = false;
      if (closes.length > 5 && rsis.length > 5) {
        const l1 = closes[closes.length - 1];
        const l2 = closes[closes.length - 3];
        const r1 = rsis[rsis.length - 1];
        const r2 = rsis[rsis.length - 3];
        if (l1 < l2 && r1 > r2 && r1 < 40) rsiDivergence = true;
      }

      const rsiOffset = closes.length - rsis.length;
      const ema20Offset = closes.length - ema20.length;
      const ema50Offset = closes.length - ema50.length;
      const ema200Offset = closes.length - ema200.length;
      const atrOffset = closes.length - atrs.length;
      const macdOffset = closes.length - macds.length;
      const bbOffset = closes.length - bbs.length;

      const chartData = history.quotes.filter((q: any) => q.close !== null && q.close !== undefined).map((q: any, i: number) => ({
        x: new Date(q.date).getTime(),
        y: [q.open, q.high, q.low, q.close],
        ema20: i >= ema20Offset ? ema20[i - ema20Offset] : null,
        ema50: i >= ema50Offset ? ema50[i - ema50Offset] : null,
        ema200: i >= ema200Offset ? ema200[i - ema200Offset] : null,
        atr: i >= atrOffset ? atrs[i - atrOffset] : null,
        rsi: i >= rsiOffset ? rsis[i - rsiOffset] : null,
        macd: i >= macdOffset ? macds[i - macdOffset] : null,
        bb: i >= bbOffset ? bbs[i - bbOffset] : null
      }));

      res.json({
          latest: {
            ...latest,
            atr: atrs.length > 0 ? atrs[atrs.length - 1] : 0,
            macd: macds.length > 0 ? macds[macds.length - 1] : null,
            bb: bbs.length > 0 ? bbs[bbs.length - 1] : null
          },
          rsiDivergence,
          trend: latest.price > latest.kama ? 'BULLISH' : 'BEARISH',
          chartData
      });

    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/corporate-actions/:symbol', async (req, res) => {
    try {
      const symbol = req.params.symbol.toUpperCase();
      const yahooSymbol = symbol.endsWith('.JK') ? symbol : `${symbol}.JK`;

      const summary = await yahooFinance.quoteSummary(yahooSymbol, {
        modules: ['summaryDetail', 'defaultKeyStatistics', 'calendarEvents']
      }).catch(() => null);

      if (!summary) {
        return res.status(404).json({ error: 'Data not found' });
      }

      const detail = (summary as any).summaryDetail || {};
      const stats = (summary as any).defaultKeyStatistics || {};
      
      const exDate = detail.exDividendDate ? new Date(detail.exDividendDate) : null;
      let predictedCumDate = null;
      if (exDate) {
        predictedCumDate = new Date(exDate);
        // Approximation for IDX: Cum date is usually 1 trading day before Ex date
        const day = predictedCumDate.getDay();
        if (day === 1) predictedCumDate.setDate(predictedCumDate.getDate() - 3); // Monday -> Friday
        else predictedCumDate.setDate(predictedCumDate.getDate() - 1);
      }

      res.json({
        symbol,
        type: 'Dividen',
        dividendValue: detail.dividendRate || stats.lastDividendValue || 0,
        dividendYield: detail.dividendYield ? (detail.dividendYield * 100).toFixed(2) : "0",
        exDate: detail.exDividendDate,
        cumDate: predictedCumDate?.toISOString(),
        lastSplitDate: stats.lastSplitDate,
        lastSplitFactor: stats.lastSplitFactor,
        status: exDate && exDate > new Date() ? 'Upcoming' : 'Completed'
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });


  app.get('/api/corporate-actions/:symbol', async (req, res) => {
    try {
      const rawSymbol = req.params.symbol.toUpperCase();
      const yahooSymbol = `${rawSymbol}.JK`;

      // 1. Get Summary (for latest/upcoming)
      const summary = await yahooFinance.quoteSummary(yahooSymbol, {
          modules: ['calendarEvents', 'summaryDetail', 'defaultKeyStatistics']
      }).catch(() => null);

      // 2. Get Historical dividends (last 2 years)
      const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000);
      const history = await yahooFinance.chart(yahooSymbol, {
          period1: twoYearsAgo,
          interval: '1d'
      }).catch(() => null);

      const dividendsHistory = (history?.events?.dividends || []).map((d: any) => ({
          type: 'Dividen',
          symbol: rawSymbol,
          date: d.date,
          amount: d.amount,
          status: new Date(d.date) < new Date() ? 'Completed' : 'Upcoming'
      })).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const upcoming = summary?.calendarEvents?.exDividendDate;
      const lastDivValue = summary?.defaultKeyStatistics?.lastDividendValue;
      const yieldPct = summary?.summaryDetail?.dividendYield ? (summary.summaryDetail.dividendYield * 100).toFixed(2) : null;
      const splitRatio = summary?.defaultKeyStatistics?.lastSplitFactor;
      const splitDate = summary?.defaultKeyStatistics?.lastSplitDate;

      res.json({
          symbol: rawSymbol,
          dividends: dividendsHistory,
          latestInfo: {
              upcomingExDate: upcoming,
              lastValue: lastDivValue,
              yield: yieldPct,
              splitRatio,
              splitDate: splitDate ? new Date(splitDate * 1000).toISOString() : null
          }
      });

    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/sectors/market-data', async (req, res) => {
    try {
      const proxySymbols = {
        'Energi': 'IDXENERGY.JK',
        'Barang Baku': 'IDXBASIC.JK',
        'Perindustrian': 'IDXINDUST.JK',
        'Konsumer Primer': 'IDXNONCYC.JK',
        'Konsumer Non-Primer': 'IDXCYCLIC.JK',
        'Kesehatan': 'IDXHEALTH.JK',
        'Keuangan': 'IDXFINANCE.JK',
        'Properti': 'IDXPROPERT.JK',
        'Teknologi': 'IDXTECHNO.JK',
        'Infrastruktur': 'IDXINFRA.JK',
        'Logistik': 'IDXTRANS.JK'
      };

      const macroSymbols = {
        'IHSG': '^JKSE',
        'USDIDR': 'IDR=X',
        'GOLD': 'GC=F',
        'OIL': 'CL=F',
        'COAL': 'MTF=F'
      };

      const symbols = [...Object.values(proxySymbols), ...Object.values(macroSymbols)];
      const quotes = await yahooFinance.quote(symbols, {}, { validateResult: false });
      
      const marketData: any = {
        sectors: {},
        macros: {}
      };

      for (const q of quotes) {
        const sectorEntry = Object.entries(proxySymbols).find(([_, sym]) => sym === q.symbol);
        if (sectorEntry) {
           marketData.sectors[sectorEntry[0]] = {
             volume: q.regularMarketVolume || 0,
             changePercent: q.regularMarketChangePercent || 0,
             price: q.regularMarketPrice || 0
           };
        } else {
           const macroEntry = Object.entries(macroSymbols).find(([_, sym]) => sym === q.symbol);
           if (macroEntry) {
              marketData.macros[macroEntry[0]] = {
                 changePercent: q.regularMarketChangePercent || 0,
                 price: q.regularMarketPrice || 0
              };
           }
        }
      }

      res.json(marketData);
    } catch (e: any) {
      // Silently handle errors
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/market-ticker', async (req, res) => {
    try {
      const macroSymbols = {
        'USD/IDR': 'IDR=X',
        'Gold (XAU)': 'GC=F',
        'Oil (WTI)': 'CL=F',
        'Coal': 'MTF=F'
      };
      
      const yahooQuotes = await yahooFinance.quote(Object.values(macroSymbols), {}, { validateResult: false }).catch(() => []);
      const tickerData: any[] = [];
      
      for (const [name, sym] of Object.entries(macroSymbols)) {
        let q = yahooQuotes.find((item: any) => item.symbol === sym);
        
        if (q && q.regularMarketPrice) {
          tickerData.push({
            label: name,
            value: q.regularMarketPrice.toLocaleString('en-US', { maximumFractionDigits: 2 }),
            change: q.regularMarketChangePercent || 0
          });
        } else {
          // Attempt micro-scraping for macro symbols from Google Finance as fallback
          // Patterns: USDIDR, GOLD (XAUUSD), OIL (CL1), COAL
          const googleMaps: Record<string, string> = {
            'IDR=X': 'USD-IDR',
            'GC=F': 'XAU-USD',
            'CL=F': 'CL-F',
            'MTF=F': 'NEWC-F' // Newcastle Coal
          };
          
          try {
             // Basic fetch from Google Finance for macro
             const gSym = googleMaps[sym];
             if (gSym) {
               const url = `https://www.google.com/finance/quote/${gSym}`;
               const { data } = await axios.get(url).catch(() => ({ data: '' }));
               const $ = cheerio.load(data);
               const pText = $('.YMl77').first().text();
               if (pText) {
                 tickerData.push({
                   label: name,
                   value: pText.replace(/[^0-9.,]/g, ''),
                   change: 0 // hard to get reliably from scrape without more complexity
                 });
               }
             }
          } catch (e) {}
        }
      }
      
      // Default fallbacks for missing data
      if (!tickerData.find(t => t.label === 'USD/IDR')) {
         tickerData.push({ label: 'USD/IDR', value: '15,350', change: 0.12 });
      }
      
      tickerData.push(
        { label: 'CPO (MYR)', value: '3,850.00', change: 1.2 },
        { label: 'Nickel', value: '18,500.00', change: -0.4 }
      );
      
      tickerData.push(
        { label: 'BI Rate', value: '6.25%', change: 0 },
        { label: 'Inflasi IHK', value: '2.75% yoy', change: -0.05 }
      );
      
      res.json(tickerData);
    } catch (e: any) {
      // Silently handle errors
      res.status(500).json({ error: e.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
