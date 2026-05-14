import { RecommendedStock } from './types';

export const INITIAL_RECOMMENDED_STOCKS: RecommendedStock[] = [];

const sectors = ['Keuangan', 'Energi', 'Konsumer', 'Teknologi', 'Infrastruktur'];

const stockTemplates: Record<string, string[]> = {
  'Keuangan': ['BBCA', 'BMRI', 'BBRI', 'BBNI', 'ARTO'],
  'Energi': ['ADRO', 'PTBA', 'ITMG', 'UNTR', 'MEDC'],
  'Konsumer': ['ICBP', 'INDF', 'MYOR', 'UNVR', 'AMRT'],
  'Teknologi': ['GOTO', 'BUKA', 'EMTK', 'WIRG', 'BELI'],
  'Infrastruktur': ['TLKM', 'EXCL', 'ISAT', 'JSMR', 'TOWR']
};

const stockNames: Record<string, string> = {
  'BBCA': 'Bank Central Asia Tbk.',
  'BMRI': 'Bank Mandiri (Persero) Tbk.',
  'BBRI': 'Bank Rakyat Indonesia Tbk.',
  'BBNI': 'Bank Negara Indonesia Tbk.',
  'ARTO': 'Bank Jago Tbk.',
  'ADRO': 'Adaro Energy Indonesia Tbk.',
  'PTBA': 'Bukit Asam Tbk.',
  'ITMG': 'Indo Tambangraya Megah Tbk.',
  'UNTR': 'United Tractors Tbk.',
  'MEDC': 'Medco Energi Internasional Tbk.',
  'ICBP': 'Indofood CBP Sukses Makmur Tbk.',
  'INDF': 'Indofood Sukses Makmur Tbk.',
  'MYOR': 'Mayora Indah Tbk.',
  'UNVR': 'Unilever Indonesia Tbk.',
  'AMRT': 'Sumber Alfaria Trijaya Tbk.',
  'GOTO': 'GoTo Gojek Tokopedia Tbk.',
  'BUKA': 'Bukalapak.com Tbk.',
  'EMTK': 'Elang Mahkota Teknologi Tbk.',
  'WIRG': 'WIR ASIA Tbk.',
  'BELI': 'Global Digital Niaga Tbk.',
  'TLKM': 'Telkom Indonesia Tbk.',
  'EXCL': 'XL Axiata Tbk.',
  'ISAT': 'Indosat Tbk.',
  'JSMR': 'Jasa Marga (Persero) Tbk.',
  'TOWR': 'Sarana Menara Nusantara Tbk.'
};

for (const sector of sectors) {
  for (let i = 0; i < 5; i++) {
    const symbol = stockTemplates[sector][i];
    const price = Math.floor(Math.random() * 9000) + 1000;
    const change = Number((Math.random() * 5).toFixed(2));
    
    INITIAL_RECOMMENDED_STOCKS.push({
      symbol,
      name: stockNames[symbol],
      sector,
      price,
      change,
      reason: `Potensi kenaikan sektoral dengan indikasi pergerakan volume positif pada sektor ${sector}.`,
      detail: {
        framework4W: {
          why: `Fundamental stabil dan sesuai dengan sentimen penguatan ${sector}.`,
          what: `Valuasi menarik dengan momentum yang didukung indikator teknikal.`,
          where: `Berada pada area support kunci di TF Daily.`,
          when: `Peluang trading buy muncul saat breakout terkonfirmasi.`
        },
        technicalSignals: [
          'Breakout indikator utama terkonfirmasi',
          'Golden cross MACD jangka pendek',
          'Volume accumulation terpantau'
        ],
        report: {
          rating: 'BUY',
          targetPrice: price * 1.1,
          stopLoss: price * 0.95,
          timeHorizon: 'Intraday to Swing',
          pivots: {
            r2: price * 1.05,
            r1: price * 1.02,
            pivot: price,
            s1: price * 0.98,
            s2: price * 0.95
          },
          thesis: `Momentum sektoral mendukung penguatan harga saham dengan risk vs reward favorable.`,
          technicalSetup: `Konsolidasi selesai, tekanan beli meningkat berdasarkan 23-Point Checklist.`,
          financials: `Valuasi kompetitif di industri sejenis.`,
          conclusion: `Beli saat harga menembus MA20 dengan konfirmasi volume.`
        },
        scalingIn: {
          tranche1: `Entry awal 30% dekat support: Rp ${Math.round(price * 0.99)}`,
          tranche2: `Average Up 40% jika breakout pivot Rp ${Math.round(price)}`,
          tranche3: `Finalisasi 30% mendekati resisten minor Rp ${Math.round(price * 1.02)}`
        }
      }
    });
  }
}
