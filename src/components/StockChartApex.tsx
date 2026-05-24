import React, { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { cn } from '../lib/utils';
import { RefreshCw } from 'lucide-react';

interface StockChartApexProps {
  symbol: string;
  height?: number;
  type?: 'line' | 'candlestick' | 'area';
  showToolbar?: boolean;
}

export function StockChartApex({ symbol, height = 300, type = 'candlestick', showToolbar = false }: StockChartApexProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/technical/${symbol}?interval=1d&isSearch=true`);
        if (res.ok) {
          const data = await res.json();
          if (data.chartData) {
            setChartData(data.chartData);
          } else {
            setError('No chart data found');
          }
        } else {
          setError('Failed to fetch data');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol]);

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-[#080808] border border-[#222] rounded-xl" style={{ height }}>
        <RefreshCw size={24} className="animate-spin text-[var(--color-gold)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center bg-[#080808] border border-[#222] rounded-xl text-[#555] text-xs font-bold uppercase tracking-widest" style={{ height }}>
        {error}
      </div>
    );
  }

  const series: any = [
    {
      name: symbol,
      type: type,
      data: type === 'line' ? chartData.map(d => ({ x: d.x, y: d.y[3] })) : chartData
    }
  ];

  if (type === 'candlestick') {
    series.push({
      name: 'EMA 20',
      type: 'line',
      data: chartData.map(d => ({ x: d.x, y: d.ema20 }))
    });
    series.push({
      name: 'EMA 50',
      type: 'line',
      data: chartData.map(d => ({ x: d.x, y: d.ema50 }))
    });
    series.push({
      name: 'EMA 200',
      type: 'line',
      data: chartData.map(d => ({ x: d.x, y: d.ema200 }))
    });
  }

  const options: any = {
    chart: {
      type: type,
      height: height,
      background: 'transparent',
      toolbar: {
        show: showToolbar
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
            enabled: true,
            delay: 150
        },
        dynamicAnimation: {
            enabled: true,
            speed: 350
        }
      }
    },
    colors: ['#3b82f6', '#f59e0b', '#ef4444', '#10b981'], // Custom colors for EMA lines
    theme: {
      mode: 'dark'
    },
    xaxis: {
      type: 'datetime',
      labels: {
        style: {
          colors: '#888',
          fontSize: '10px'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#888',
          fontSize: '10px'
        },
        formatter: (val: number) => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val?.toFixed(0)
      }
    },
    grid: {
      borderColor: '#1a1a1a',
      strokeDashArray: 4,
      xaxis: {
          lines: {
              show: true
          }
      }
    },
    stroke: {
      width: type === 'line' ? [2, 1, 1, 1] : [1, 1.5, 1.5, 1.5],
      curve: 'smooth'
    },
    legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'left',
        fontSize: '10px',
        fontFamily: 'inherit',
        labels: {
            colors: '#666'
        },
        markers: {
            width: 8,
            height: 8,
            radius: 12
        }
    },
    tooltip: {
      theme: 'dark',
      x: {
        format: 'dd MMM yyyy'
      }
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#10b981',
          downward: '#ef4444'
        },
        wick: {
            useFillColor: true
        }
      }
    },
    markers: {
        size: 0
    }
  };

  const latestAtr = chartData.length > 0 ? chartData[chartData.length - 1].atr : 0;

  return (
    <div className="w-full relative">
      {type === 'candlestick' && (
          <div className="absolute top-2 right-4 z-10 bg-[#111]/80 border border-[#222] px-2 py-1 rounded-md">
              <span className="text-[9px] font-black text-[#555] uppercase tracking-widest mr-2">ATR(14):</span>
              <span className="text-[10px] font-black text-[var(--color-gold)]">{latestAtr?.toFixed(2)}</span>
          </div>
      )}
      <Chart options={options} series={series} type={type} height={height} />
    </div>
  );
}
