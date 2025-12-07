import React from 'react';
import { Trophy, BarChart2, TrendingUp, ShoppingCart, LineChart, Compass, Zap, ArrowRight } from 'lucide-react';

const topRow = [
  {
    icon: Trophy,
    title: 'Tournaments',
    body: ['Open the Tournaments page and join active events.', 'Review prizes, rules, and timing before you enter.', 'Track your rank and P/L as you compete.'],
    accent: 'linear-gradient(135deg, #f59e0b, #f97316)',
  },
  {
    icon: BarChart2,
    title: 'Leaderboards',
    body: ['Inside each tournament, check the live leaderboard.', 'Use ranks to benchmark your performance.', 'Watch movements to spot momentum, .'],
    accent: 'linear-gradient(135deg, #38bdf8, #0ea5e9)',
  },
  {
    icon: TrendingUp,
    title: 'Portfolio growth',
    body: ['Visit Dashboard to see portfolio value and daily change.', 'Use range toggles (1W–2Y) to study trends.', 'Track how well you are doing, and how far you are to your tournament goal'],
    accent: 'linear-gradient(135deg, #22c55e, #16a34a)',
  },
];

const bottomCard = {
  icon: ShoppingCart,
  title: 'Start Trading',
  bullets: [
    {
      label: 'Trading',
      text: 'Use Dashboard/Stock pages to open the trade ticket. Choose Buy/Sell, set shares, and confirm in the review modal (quotes via Finnhub).',
      accent: 'linear-gradient(135deg, #22c55e, #0ea5e9)',
    },
    {
      label: 'Charts',
      text: 'On Stock pages, pick ranges (1W–2Y), hover for tooltips, and compare price/percent moves before placing orders.',
      accent: 'linear-gradient(135deg, #10b981, #22c55e)',
    },
    {
      label: 'Find Stocks',
      text: 'Use the search bar or Popular page to explore tickers; Market News surfaces fresh headlines per topic or symbol.',
      accent: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    },
  ],
};

const GetStarted = () => {
  return (
    <div
      className="min-vh-100"
      style={{
        background:
          'radial-gradient(160% 140% at 80% 0%, rgba(92,99,255,0.12), transparent 40%), radial-gradient(140% 120% at 10% 80%, rgba(14,165,233,0.12), transparent 45%), linear-gradient(135deg, #0b0f1e 0%, #05060d 100%)',
        color: '#e7ecf7',
      }}
    >
      <div className="container-xl py-4 d-flex flex-column gap-3">
        <div
          className="p-4 p-md-5"
          style={{
            background: 'rgba(13, 17, 38, 0.82)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 30px 70px rgba(0, 0, 0, 0.35)',
            backdropFilter: 'blur(14px)',
          }}
        >
          <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
            <div>
              <div className="text-uppercase small" style={{ letterSpacing: '0.2em', color: 'rgba(232,237,255,0.65)' }}>
                Start fast
              </div>
              <h1 className="mb-2 text-light">Get Started</h1>
              <p className="mb-0" style={{ color: '#aeb8de' }}>
                Follow these quick steps to join tournaments, trade, and track your progress.
              </p>
            </div>
            <div
              className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill fw-semibold"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#0b1023',
              }}
            >
              <Zap size={16} /> You'll be ready in minutes
            </div>
          </div>
        </div>

        <div className="row g-3">
          {topRow.map((card) => {
            const Icon = card.icon;
            return (
              <div className="col-12 col-md-6 col-xl-4" key={card.title}>
                <div
                  className="h-100 p-4 d-flex flex-column"
                  style={{
                    background: 'rgba(13, 17, 38, 0.82)',
                    borderRadius: '18px',
                    border: '1px solid rgba(255,255,255,0.08)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-3"
                      style={{
                        width: 44,
                        height: 44,
                        background: card.accent,
                        color: '#0b1023',
                      }}
                    >
                      <Icon size={22} />
                    </div>
                  </div>
                  <h5 className="text-light mb-3">{card.title}</h5>
                  <ul className="mb-0 ps-3" style={{ color: '#cdd7ff' }}>
                    {card.body.map((line) => (
                      <li key={line} className="mb-2">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div
          className="px-5 py-5"
          style={{
            background: 'rgba(13, 17, 38, 0.82)',
            borderRadius: '18px',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          }}
        >
          <div className="d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center gap-3 mb-2 mt-0">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: 44,
                  height: 44,
                  background: bottomCard.bullets[0].accent,
                  color: '#0b1023',
                }}
              >
                <bottomCard.icon size={22} />
              </div>
              <div>
                <h4 className="text-light mb-0">{bottomCard.title}</h4>
              </div>
            </div>
          </div>
          <div className="row g-3">
            {bottomCard.bullets.map((item) => (
              <div className="col-12 col-md-4" key={item.label}>
                <div
                  className="p-3 h-100 rounded-3"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <div
                    className="d-inline-flex align-items-center justify-content-center rounded-pill px-3 py-1 fw-semibold mb-2"
                    style={{ background: item.accent, color: '#0b1023' }}
                  >
                    {item.label}
                  </div>
                  <div style={{ color: '#cdd7ff', lineHeight: 1.5 }}>{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
