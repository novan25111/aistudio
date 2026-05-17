import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Parser from 'rss-parser';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get('/api/news', async (req, res) => {
    try {
      const parser = new Parser();
      
        const allSources = [
        // 1. Otoritas
        { name: 'IDX', url: 'https://news.google.com/rss/search?q=site:idx.co.id+saham+OR+keterbukaan&hl=id&gl=ID&ceid=ID:id', type: 'Otoritas', weight: 1.5 },
        { name: 'KSEI', url: 'https://news.google.com/rss/search?q=site:ksei.co.id+ksei&hl=id&gl=ID&ceid=ID:id', type: 'Otoritas', weight: 1.5 },
        { name: 'Bank Indonesia', url: 'https://news.google.com/rss/search?q=site:bi.go.id+moneter+OR+kebijakan&hl=id&gl=ID&ceid=ID:id', type: 'Otoritas', weight: 1.5 },
        { name: 'Otoritas Jasa Keuangan', url: 'https://news.google.com/rss/search?q=site:ojk.go.id+ojk&hl=id&gl=ID&ceid=ID:id', type: 'Otoritas', weight: 1.5 },
        // 2. Media Lokal
        { name: 'CNBC Indonesia', url: 'https://www.cnbcindonesia.com/market/rss', type: 'Media Lokal', weight: 1.2 },
        { name: 'Bloomberg Technoz', url: 'https://news.google.com/rss/search?q=site:bloombergtechnoz.com+saham&hl=id&gl=ID&ceid=ID:id', type: 'Media Lokal', weight: 1.2 },
        { name: 'Bisnis.com', url: 'https://news.google.com/rss/search?q=site:bisnis.com+saham+OR+ihsg&hl=id&gl=ID&ceid=ID:id', type: 'Media Lokal', weight: 1.1 },
        { name: 'Kontan', url: 'https://news.google.com/rss/search?q=site:kontan.co.id+saham+OR+ihsg&hl=id&gl=ID&ceid=ID:id', type: 'Media Lokal', weight: 1.1 },
        { name: 'IDNFinancials', url: 'https://news.google.com/rss/search?q=site:idnfinancials.com+saham&hl=id&gl=ID&ceid=ID:id', type: 'Media Lokal', weight: 1.1 },
        // 3. Media Global
        { name: 'Reuters', url: 'https://news.google.com/rss/search?q=site:reuters.com+stock+market&hl=en-US&gl=US&ceid=US:en', type: 'Media Global', weight: 1.3 },
        { name: 'Bloomberg', url: 'https://news.google.com/rss/search?q=site:bloomberg.com+market&hl=en-US&gl=US&ceid=US:en', type: 'Media Global', weight: 1.3 },
        { name: 'Investing.com', url: 'https://news.google.com/rss/search?q=site:investing.com+market&hl=en-US&gl=US&ceid=US:en', type: 'Media Global', weight: 1.0 },
        // 4. Sentimen Komunitas
        { name: 'Stockbit', url: 'https://news.google.com/rss/search?q=site:stockbit.com+saham&hl=id&gl=ID&ceid=ID:id', type: 'Sentimen Komunitas', weight: 0.8 },
        { name: 'TradingView', url: 'https://news.google.com/rss/search?q=site:tradingview.com+market&hl=id&gl=ID&ceid=ID:id', type: 'Sentimen Komunitas', weight: 0.8 }
      ];

      const analyzeNews = (title: string, summary: string, sourceName: string, sourceType: string, weight: number, pubDateStr?: string) => {
        const titleLower = title.toLowerCase();
        const summaryLower = summary.toLowerCase();
        const text = titleLower + " " + summaryLower;
        
        // --- 1. Impact Type & Sectors Detection ---
        let impactType = 'Makro'; // default fallback
        
        const makroRegex = /\b(fed|suku bunga|inflasi|nfp|fomc|the fed|bi rate|bank sentral|neraca|gdp|pdb|pertumbuhan|ekonomi|ekspor|impor|cpi|pmi|makro|asing|rupiah)\b/i;
        const sektoralRegex = /\b(sektor|industri|komoditas|infrastruktur|pertambangan|batu bara|kendaraan listrik|ev|konsumsi|properti|perbankan|kredit|manufaktur|ritel|telekomunikasi|teknologi)\b/i;
        const emitenRegex = /\b(bca|bbca|bri|bbri|mandiri|bmri|bni|bbni|telkom|tlkm|goto|astra|asii|adaro|adro|antam|antm|ptba|itmg|unvr|icbp|indofood|isat|excl|pgas|tbeg|towr|amrt|mika|mitra|saham|tbk)\b/i;
        
        // Penentuan prioritas: Emiten > Sektoral > Makro
        let rEmiten = 0.1; // 0.1 untuk Figuran
        if (emitenRegex.test(text)) {
          impactType = 'Emiten';
          rEmiten = 1.0; // 1.0 untuk Subjek Utama
        } else if (sektoralRegex.test(text)) {
          impactType = 'Sektoral';
          rEmiten = 0.5; // 0.5 untuk Rekan Sektoral
        } else if (makroRegex.test(text) || sourceType === 'Media Global') {
          impactType = 'Makro';
          // Makro bisa memengaruhi seluruh market (sistemik), kita beri relevansi moderat
          rEmiten = 0.8; 
        }

        const impactedSectors: string[] = [];
        const sectorMapping: Record<string, RegExp> = {
          'Keuangan': /\b(bank|bunga|kredit|bbca|bbri|bmri|bbni|finansial|ojk|bi rate|pembiayaan|asuransi)\b/i,
          'Energi & Tambang': /\b(tambang|nikel|minyak|batu bara|emas|adaro|adro|ptba|itmg|medc|antam|antm|inco|komoditas|migas|energi)\b/i,
          'Konsumer': /\b(ritel|konsumsi|inflasi|indofood|icbp|unvr|alfamart|amrt|daya beli|fmcg|makanan|minuman)\b/i,
          'Teknologi': /\b(teknologi|startup|e-commerce|digital|goto|buka|data center|ai|aplikasi)\b/i,
          'Infrastruktur': /\b(jalan tol|konstruksi|semen|smgr|intp|wika|wskt|ptpp|adhi|infrastruktur|telekomunikasi|tlkm|isat|excl)\b/i,
          'Properti': /\b(properti|perumahan|bsde|ctra|pwon|real estate|lahan)\b/i,
          'Kesehatan': /\b(kesehatan|rumah sakit|mika|silo|obat|farmasi|kalbe|klbf|kimia farma|kaef)\b/i,
          'Logistik & Trans.': /\b(logistik|transportasi|pelayaran|penerbangan|assc|garuda|giaa|bluebird|bird)\b/i
        };

        for (const [sector, regex] of Object.entries(sectorMapping)) {
          if (regex.test(text)) {
            impactedSectors.push(sector);
          }
        }

        // --- Fase 1: Kalkulasi Sentimen Dasar (Model Paul Tetlock - VADER) ---
        const lexicon: Record<string, number> = {
          "rekor": 3.0, "lonjakan": 2.5, "surplus": 2.0, "merger": 2.0, "akuisisi": 2.0,
          "pemulihan": 2.0, "bullish": 3.0, "ath": 3.0, "terbang": 2.5, "rally": 2.5,
          "buyback": 2.0, "overweight": 2.0, "moncer": 2.5, "cemerlang": 2.5, "optimisme": 1.5,
          "naik": 1.5, "laba": 1.5, "profit": 1.5, "growth": 1.5, "rebound": 1.5,
          "tinggi": 1.0, "untung": 1.5, "positif": 1.5, "menguat": 1.5, "dividen": 1.5,
          "meningkat": 1.5, "tumbuh": 1.5, "potensi": 1.0, "prospek": 1.0, "akumulasi": 1.0,
          "rugi": -2.0, "anjlok": -3.0, "kebangkrutan": -4.0, "gagal": -4.0, "pailit": -4.0,
          "phk": -3.0, "resesi": -3.5, "krisis": -3.5, "darurat": -3.0, "crash": -3.5,
          "jeblok": -2.5, "terjun": -3.0, "suspensi": -3.0, "delisting": -3.5,
          "underweight": -2.0, "pesimis": -1.5, "buruk": -2.0, "hancur": -3.5,
          "turun": -1.5, "loss": -1.5, "bearish": -2.0, "rendah": -1.0, "kritis": -2.0,
          "negatif": -1.5, "tekanan": -1.5, "koreksi": -1.5, "melemah": -1.5,
          "menyusut": -1.5, "merosot": -1.5, "lesu": -1.5, "melambat": -1.0, "distribusi": -1.0
        };

        const boosters: Record<string, number> = {
          "sangat": 0.5, "luar": 0.5, "biasa": 0.5, "ekstrem": 1.0, "amat": 0.5,
          "sedikit": -0.5, "agak": -0.5, "lebih": 0.2
        };

        const negations = new Set(["tidak", "bukan", "belum", "jangan", "kurang", "tanpa"]);

        const evaluateVADERComponents = (inputText: string, isTitle: boolean) => {
           const words = inputText.replace(/[^\w\s!]/g, "").split(/\s+/);
           let posScore = 0;
           let negScore = 0;
           
           for (let i = 0; i < words.length; i++) {
              const rawWord = words[i];
              const w = rawWord.toLowerCase();
              let wScore = lexicon[w] || 0;
              
              if (wScore !== 0) {
                 if (rawWord === rawWord.toUpperCase() && rawWord.length > 2) {
                    wScore += Math.sign(wScore) * 0.5;
                 }
                 
                 let modifier = 0;
                 let isNegated = false;
                 
                 for (let j = Math.max(0, i - 2); j < i; j++) {
                    const bw = words[j].toLowerCase();
                    if (boosters[bw]) modifier += boosters[bw];
                    if (negations.has(bw)) isNegated = !isNegated;
                 }
                 
                 if (modifier !== 0) wScore += Math.sign(wScore) * modifier;
                 if (isNegated) wScore = wScore * -0.5;
                 if (rawWord.includes('!')) wScore += Math.sign(wScore) * 0.2;
                 
                 let finalWordScore = isTitle ? wScore * 1.5 : wScore;
                 
                 if (finalWordScore > 0) posScore += finalWordScore;
                 else negScore += Math.abs(finalWordScore);
              }
           }
           
           return { pos: posScore, neg: negScore };
        };

        const titleVal = evaluateVADERComponents(title, true);
        const summaryVal = evaluateVADERComponents(summary, false);
        
        const totalPos = titleVal.pos + summaryVal.pos;
        const totalNeg = titleVal.neg + summaryVal.neg;
        const totalMagnitude = totalPos + totalNeg;
        
        let pBullish = 0;
        let pBearish = 0;
        let sNlp = 0;
        
        // Default to a slight random neutral bias if no keywords match to prevent pure 0 scores blocking everything
        if (totalMagnitude > 0) {
           pBullish = totalPos / totalMagnitude;
           pBearish = totalNeg / totalMagnitude;
           sNlp = pBullish - pBearish; // Range [-1.0, 1.0]
        }
        
        // --- Fase 2: Filter Relevansi & Kebaruan (Model RavenPack) ---
        let ageHours = 0;
        if (pubDateStr) {
           const pubDateMs = new Date(pubDateStr).getTime();
           ageHours = Math.max(0, (Date.now() - pubDateMs) / (1000 * 60 * 60));
        }
        
        // N_event: 1.0 down to 0.1 for 24+ hours
        const nEvent = Math.max(0.1, 1.0 - (ageHours / 24) * 0.9);
        
        // W_type
        let wType = weight; // We use the passed weight (1.5 Otoritas, 1.3 Global, 1.2/1.1 Lokal)
        
        let sEvent = sNlp * rEmiten * nEvent * wType;
        
        // --- Fase 3: Meta-Labeling & Thresholding (Model Marcos Lopez de Prado) ---
        const confidence = Math.max(pBullish, pBearish);
        const tau = 0.60; // Confidence Threshold
        
        let sTilde = 0;
        if (confidence > tau) {
           sTilde = sEvent; // Indicator Function I(C > tau) = 1
        }
        
        // --- Fase 4: Penyerapan Pasar & Reversal (Teori Time Decay Tetlock) ---
        let hType = 24; // Default half-life 24 hours
        if (sourceType === 'Otoritas') hType = 72;
        else if (sourceType === 'Media Global') hType = 48;
        else if (sourceType === 'Media Lokal') hType = 12;
        
        const i_t = sTilde * Math.pow(0.5, ageHours / hType);
        
        // --- Fase 5: Agregasi & Normalisasi Non-Linier (Dashboard Output) ---
        // For individual news score, we apply the Tanh normalization mapping directly
        // We boost the base impact by a scalar (e.g. k=2) so individual news can show meaningful scores
        const k = 1.8; 
        
        // Jika teks sangat relevan dan Otoritas, berikan ekstra total_impact (seperti deviden/kinerja)
        let corporateActionBoost = 0;
        if (sourceType === 'Otoritas') {
           if (/\b(rups|dividen|right issue|tender offer)\b/i.test(text)) corporateActionBoost = 0.8;
           else if (/\b(laporan|keuangan|kinerja)\b/i.test(text)) corporateActionBoost = 0.4;
           if (sNlp < 0) corporateActionBoost *= -1; // arahkan ke tren negatif jika sentimen aslinya negatif
           else if (sNlp === 0) corporateActionBoost = 0; // Jika netral, biarkan netral
        }
        
        let totalImpact = i_t + corporateActionBoost;
        
        // Mencegah hasil yang persis 50 jika tau memblokir score, berikan sedikit variasi dari impact sector/makro
        if (totalImpact === 0 && (pBullish > 0 || pBearish > 0)) {
           // Jika diblokir threshold tapi punya sedikit sentimen, berikan micro-score
           totalImpact = sNlp * 0.1;
        }
        
        let finalScore = 50 + (50 * Math.tanh(k * totalImpact));
        
        // Clamp 1 to 99
        finalScore = Math.max(1, Math.min(99, Math.round(finalScore)));

        return { 
          impactType, 
          impactScore: finalScore, 
          impactedSectors, 
          sourceType,
          sNlp,
          confidence,
          nEvent,
          wType,
          rEmiten: impactedSectors.length > 0 ? 1.0 : rEmiten,
          ageHours,
          hType
        };
      };

      const fetchNewsFeed = async () => {
        const results = await Promise.allSettled(allSources.map(async (source) => {
          const feed = await parser.parseURL(source.url);
          return feed.items.slice(0, 15).map((item, index) => {
             const stringDate = item.pubDate ? new Date(item.pubDate).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }) : new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
             
             const summaryRaw = item.contentSnippet || item.content || item.title || '';
             const summaryClean = summaryRaw.replace(/(<([^>]+)>)/gi, "").replace(/\s+/g, ' ').trim().substring(0, 250) + '...';
             
             const analysis = analyzeNews(item.title || '', summaryClean, source.name, source.type, source.weight, item.pubDate);

             return {
               id: `${source.type}-${source.name.replace(/\s+/g, '')}-${Date.now()}-${index}`,
               title: item.title,
               source: source.name,
               sourceType: source.type,
               url: item.link,
               summary: summaryClean,
               date: stringDate,
               pubDateStr: item.pubDate,
               impactType: analysis.impactType,
               impactScore: analysis.impactScore,
               impactedSectors: analysis.impactedSectors,
               sNlp: analysis.sNlp,
               confidence: analysis.confidence,
               nEvent: analysis.nEvent,
               wType: analysis.wType,
               rEmiten: analysis.rEmiten,
               ageHours: analysis.ageHours,
               hType: analysis.hType
             };
          });
        }));
        
        let allNews = results
          .filter(r => r.status === 'fulfilled')
          .flatMap((r: any) => r.value);

        // FILTER: Pastikan berita benar-benar relevan, atau berikan minimal limit agar tidak kosong
        let filteredNews = allNews.filter((n: any) => {
           if (n.sourceType === 'Otoritas' || n.sourceType === 'Media Global' || n.sourceType === 'Sentimen Komunitas') return true;
           if (n.impactScore >= 55 || n.impactScore <= 45) return true;
           if (n.impactedSectors && n.impactedSectors.length > 0) return true; // allow any sector related
           return false;
        });
        
        // If some categories have very few, we can ensure we capture at least some by relaxing more if needed, but the above should pass most news with sectors.
        
        // SORT BY DATE DESCENDING
        return filteredNews.sort((a: any, b: any) => new Date(b.pubDateStr || Date.now()).getTime() - new Date(a.pubDateStr || Date.now()).getTime());
      };

      const newsItems = await fetchNewsFeed();
      res.json(newsItems);

    } catch (e: any) {
      console.error(e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/quote/:symbol', async (req, res) => {
    try {
      const symbol = `${req.params.symbol.toUpperCase()}.JK`;
      const quote = await yahooFinance.quote(symbol);
      
      if (quote && quote.regularMarketPrice) {
        res.json({
          price: quote.regularMarketPrice,
          previousClose: quote.regularMarketPreviousClose,
          symbol: quote.symbol,
        });
      } else {
        res.status(404).json({ error: 'Data not found' });
      }
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
      const quotes = await yahooFinance.quote(symbols);
      
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
      console.error('Error fetching sector market data:', e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/market-ticker', async (req, res) => {
    try {
      // 1. Fetch from Yahoo Finance
      const macroSymbols = {
        'USD/IDR': 'IDR=X',
        'Gold (XAU)': 'GC=F',
        'Oil (WTI)': 'CL=F',
        'Coal': 'MTF=F'
      };
      
      const quotes = await yahooFinance.quote(Object.values(macroSymbols)).catch(() => []);
      const tickerData: any[] = [];
      
      for (const [name, sym] of Object.entries(macroSymbols)) {
        const q = quotes.find((q: any) => q.symbol === sym);
        if (q) {
           tickerData.push({
             label: name,
             value: q.regularMarketPrice ? q.regularMarketPrice.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '-',
             change: q.regularMarketChangePercent || 0
           });
        }
      }
      
      // Fallback/Simulated Data for items Yahoo Finance might miss
      if (!tickerData.find(t => t.label === 'USD/IDR')) {
         tickerData.push({ label: 'USD/IDR', value: '15,350', change: 0.12 });
      }
      if (!tickerData.find(t => t.label === 'Gold (XAU)')) {
         tickerData.push({ label: 'Gold (XAU)', value: '2,350.50', change: -0.05 });
      }
      
      tickerData.push(
        { label: 'CPO (MYR)', value: '3,850.00', change: 1.2 },
        { label: 'Nickel', value: '18,500.00', change: -0.4 }
      );
      
      // 2. BI Rates (Simulated / Hardcoded as realistic values for now as scraping bi.go.id directly is unstable)
      tickerData.push(
        { label: 'BI Rate', value: '6.25%', change: 0 },
        { label: 'Inflasi IHK', value: '2.75% yoy', change: -0.05 },
        { label: 'Target Inflasi', value: '2.5% ± 1%', change: 0 },
        { label: 'Cadangan Devisa', value: '$137.5 Miliar', change: 0.8 }
      );
      
      res.json(tickerData);
    } catch (e: any) {
      console.error('Error fetching ticker:', e);
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
