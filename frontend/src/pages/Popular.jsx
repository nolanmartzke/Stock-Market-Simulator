import React, { useEffect, useMemo, useState } from 'react';
import NewsCard from '../components/NewsCard';
import { getQuote } from '../api/StockApi';

const topicFilters = [
  { label: 'All Market News', category: 'general', hint: 'Broad market headlines and sentiment.' },
  { label: 'Forex & Macro', category: 'forex', hint: 'Currencies, rates, and macro shifts.' },
  { label: 'Crypto', category: 'crypto', hint: 'Digital assets, blockchain, and tokens.' },
  { label: 'M&A / Deals', category: 'merger', hint: 'Acquisitions, IPO chatter, and deal flow.' }
];

const etfs = [
  { ticker: 'SPY', name: 'SPDR S&P 500' },
  { ticker: 'QQQ', name: 'Invesco QQQ' },
  { ticker: 'VTI', name: 'Vanguard Total Stock Market' },
];

const equities = [
  { ticker: 'AAPL', name: 'Apple' },
  { ticker: 'MSFT', name: 'Microsoft' },
  { ticker: 'AMZN', name: 'Amazon' },
  { ticker: 'GOOGL', name: 'Alphabet' },
  { ticker: 'NVDA', name: 'NVIDIA' },
];

const formatUSD = (num) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(num) || 0);

const formatPercent = (num) => {
  const val = Number(num);
  if (!Number.isFinite(val)) return '0.00%';
  return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
};

const Popular = () => {
  const [activeTopic, setActiveTopic] = useState(topicFilters[0]);
  const [quotes, setQuotes] = useState({});

  const watchlist = useMemo(() => [...etfs, ...equities], []);

  useEffect(() => {
    let mounted = true;
    const fetchQuotes = async () => {
      const results = {};
      for (const item of watchlist) {
        try {
          const res = await getQuote(item.ticker);
          results[item.ticker] = res.data;
        } catch (err) {
          results[item.ticker] = null;
        }
      }
      if (mounted) setQuotes(results);
    };
    fetchQuotes();
    return () => {
      mounted = false;
    };
  }, [watchlist]);

  return (
    <div
      className="min-vh-100"
      style={{
        background:
          'radial-gradient(160% 140% at 80% 0%, rgba(92,99,255,0.12), transparent 40%), radial-gradient(140% 120% at 10% 80%, rgba(14,165,233,0.12), transparent 45%), linear-gradient(135deg, #0b0f1e 0%, #05060d 100%)',
        color: '#e7ecf7',
      }}
    >
      <div className="container-xl py-4">
        <div className="d-flex flex-wrap align-items-baseline justify-content-between gap-3 mb-3">
          <div>
            <div className="text-uppercase small" style={{ letterSpacing: '0.2em', color: 'rgba(232,237,255,0.65)' }}>
              Discovery
            </div>
            <h1 className="mb-0 text-light">Popular</h1>
            <p className="mb-0" style={{ color: '#aeb8de' }}>
              Dial in topics, scan headlines, and spot the most-watched tickers.
            </p>
          </div>
        </div>

        <div className="row g-4 justify-content-center">
          <main className="col-12 col-xl-8 d-flex flex-column gap-3">
            <div
              className="p-3 p-md-4"
              style={{
                background: 'rgba(13,17,38,0.82)',
                borderRadius: '18px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
              }}
            >
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3">
                <div>
                  <div className="text-uppercase small" style={{ letterSpacing: '0.16em', color: 'rgba(232,237,255,0.65)' }}>
                    Topics
                  </div>
                  <p className="mb-0" style={{ color: '#aeb8de' }}>
                    Use filters to refocus the news feed.
                  </p>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {topicFilters.map((topic) => {
                    const isActive = topic.category === activeTopic.category;
                    return (
                      <button
                        key={topic.category}
                        className="btn btn-sm fw-semibold"
                        style={{
                          borderRadius: '12px',
                          background: isActive ? 'linear-gradient(135deg, #22c55e, #0ea5e9)' : 'rgba(255,255,255,0.08)',
                          color: isActive ? '#0b1023' : '#e7ecf7',
                          border: isActive ? 'none' : '1px solid rgba(255,255,255,0.14)',
                        }}
                        onClick={() => setActiveTopic(topic)}
                      >
                        {topic.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className="p-3 p-md-4"
              style={{
                background: 'rgba(13,17,38,0.82)',
                borderRadius: '18px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
              }}
            >
              <NewsCard
                category={activeTopic.category}
                pageSize={8}
                heading={`${activeTopic.label} News`}
                subtitle={activeTopic.hint}
                wrapInCard={false}
              />
            </div>
          </main>

          <aside className="col-12 col-xl-4">
            <div
              className="p-3 p-md-4"
              style={{
                background: 'rgba(13,17,38,0.82)',
                borderRadius: '18px',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
              }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="mb-0 text-light">Top Stocks</h5>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-uppercase small mb-2" style={{ letterSpacing: '0.14em', color: '#aeb8de' }}>
                  ETFs
                </div>
                <div className="d-grid gap-2">
                  {etfs.map((item) => {
                    const quote = quotes[item.ticker];
                    const price = quote?.c;
                    const change = quote?.dp;
                    const isUp = (change ?? 0) > 0;
                    return (
                      <div
                        key={item.ticker}
                        className="d-flex justify-content-between align-items-center p-3 rounded-3"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <div>
                          <div className="fw-bold text-light">{item.ticker}</div>
                          <div style={{ color: '#aeb8de' }}>{item.name}</div>
                        </div>
                        <div className="text-end">
                          <div className="fw-semibold text-light">{price ? formatUSD(price) : '—'}</div>
                          <div style={{ color: isUp ? '#22c55e' : '#ef4444' }}>
                            {change !== undefined ? formatPercent(change) : '—'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="text-uppercase small mb-2" style={{ letterSpacing: '0.14em', color: '#aeb8de' }}>
                  Equities
                </div>
                <div className="d-grid gap-2">
                  {equities.map((item) => {
                    const quote = quotes[item.ticker];
                    const price = quote?.c;
                    const change = quote?.dp;
                    const isUp = (change ?? 0) > 0;
                    return (
                      <div
                        key={item.ticker}
                        className="d-flex justify-content-between align-items-center p-3 rounded-3"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                      >
                        <div>
                          <div className="fw-bold text-light">{item.ticker}</div>
                          <div style={{ color: '#aeb8de' }}>{item.name}</div>
                        </div>
                        <div className="text-end">
                          <div className="fw-semibold text-light">{price ? formatUSD(price) : '—'}</div>
                          <div style={{ color: isUp ? '#22c55e' : '#ef4444' }}>
                            {change !== undefined ? formatPercent(change) : '—'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Popular;
