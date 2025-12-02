import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, Activity, Wallet, Sparkles, Compass, Plus } from 'lucide-react';
import { Container, Row, Col, Card } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { loadDashboard } from '../api/AccountApi';
import { Link } from "react-router-dom"; 
import { getQuote } from '../api/StockApi';
import NewsCard from '../components/NewsCard';


const Dashboard = () => {
  const { auth } = useAuth();

  const [portfolioValue, setPortfolioValue] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [cashBalance, setCashBalance] = useState(0);
  const [positions, setPositions] = useState([]);
  const [quotes, setQuotes] = useState({});

  const dayChange = "positive";
  const dayChangeDollars = "$0.00";
  const dayChangePercent = "0%";

  useEffect(() => {
    if (!auth) return;

    setFirstName(auth.name.split(" ")[0]);

    loadDashboard(auth.id)
      .then(response => response.data)
      .then(data => {
          console.log(data);
          setCashBalance(data.totalCash)
          // filter so that do not show positions with 0 shares
          const filteredPositions = Object.fromEntries(
            Object.entries(data.totalStocks).filter(([, value]) => value !== 0)
          );
          setPositions(filteredPositions);
      })
      .catch((err) => console.log(err));
  }, [auth]);

  useEffect(() => {
    if (!positions) return;

    for (const [ticker] of Object.entries(positions)) {
      if (!(ticker in quotes)){
        getQuote(ticker)
          .then((response) => response.data)
          .then((data) => {
            console.log(data);
            setQuotes((prev) => ({ ...prev, [ticker]: data }));
          })
          .catch((err) => console.log(err));
      }
    }

  }, [positions, quotes]);

  useEffect(() => {
    if (!positions || !quotes) return;

    const cash = cashBalance;
    const equity = Object.entries(positions).reduce((sum, [ticker, shares]) => {
      const price = quotes[ticker]?.c ?? 0;
      return sum + shares * price;
    }, 0);

    setPortfolioValue(cash + equity);

  }, [positions, quotes, cashBalance]);

  const formatUSD = (num) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);

  const formatPercent = (num) => {
    const roundedNum = Number(num).toFixed(2);
    let prefix = "";
    if (num >= 0) prefix = "+";
    return prefix + roundedNum + "%";
  };

  const formattedPortfolioValue = formatUSD(portfolioValue);
  const formattedCashBalance = formatUSD(cashBalance);
  const positionCount = positions ? Object.keys(positions).length : 0;

  return (
    <Container fluid className="dashboard-page py-4">
      <div className="container-xl d-flex flex-column gap-4">
        <div className="glass-panel gradient-border dashboard-hero p-4 p-lg-5">
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-4">
            <div>
              <div className="pill-gradient text-uppercase small mb-2 d-inline-flex">Portfolio</div>
              <h1 className="display-5 mb-1 text-light">{formattedPortfolioValue}</h1>
              <div className={`metric-pill mt-2 ${dayChange === "positive" ? "positive" : "negative"}`}>
                {dayChange === "positive" ? (
                  <ArrowUp size={16} />
                ) : (
                  <ArrowDown size={16} />
                )}
                <span>{dayChangeDollars}</span>
                <span className="opacity-75">({dayChangePercent})</span>
              </div>
            </div>
            <div className="text-end">
              <div className="text-gradient fw-semibold">Welcome back, {firstName || "trader"}.</div>
              <div className="stat-chip mt-2">
                <Wallet size={16} /> Cash: {formattedCashBalance}
              </div>
              <div className="stat-chip mt-2">
                <Compass size={16} /> Holdings: {positionCount} tickers
              </div>
            </div>
          </div>
          <div className="d-flex flex-wrap gap-2 mt-4">
            <span className="stat-chip">
              <Activity size={14} /> Live market feed
            </span>
            <span className="stat-chip">
              <Sparkles size={14} /> Personalized insights on deck
            </span>
          </div>
        </div>

        <Row className="g-4">
          <Col xs={12} xl={8} className="d-flex flex-column gap-4">
            <Card className="glass-panel gradient-border h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="text-uppercase text-muted small">Live chart</div>
                    <h5 className="mb-0 text-light">Market pulse</h5>
                  </div>
                  <span className="pill-gradient small">Realtime</span>
                </div>
                <div className="chart-placeholder w-100">
                  <div className="fw-semibold">Your graph will live here</div>
                  <div className="text-muted small">Plug in indicators and overlays to customize.</div>
                </div>
              </Card.Body>
            </Card>

            <Card className="glass-panel gradient-border">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="text-uppercase text-muted small">Watchlist</div>
                    <h5 className="mb-0 text-light">Stay on top</h5>
                  </div>
                  <span className="stat-chip"><Plus size={14} /> Add from Trade</span>
                </div>
                <div className="watchlist-empty">
                  Create a curated set of tickers to track intraday moves, news, and alerts.
                </div>
              </Card.Body>
            </Card>

            <Card className="glass-panel gradient-border">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="text-uppercase text-muted small">News</div>
                    <h5 className="mb-0 text-light">Market headlines</h5>
                  </div>
                  <span className="pill-gradient small">Realtime</span>
                </div>
                <NewsCard
                  category="general"
                  pageSize={5}
                  title="Market News"
                  description="Latest market headlines and financial news."
                  wrapInCard={false}
                />
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} xl={4}>
            <Card className="glass-panel gradient-border positions-card h-100">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="text-uppercase text-muted small">Holdings</div>
                    <h4 className="text-light mb-0">Positions</h4>
                  </div>
                  <span className="pill-gradient small">{positionCount} assets</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-muted">Cash on hand</span>
                  <span className="fw-semibold text-light">{formattedCashBalance}</span>
                </div>
                <div className="d-grid gap-2">
                  {positions && Object.keys(positions).length > 0 ? (
                    Object.entries(positions).map(([ticker, count]) => (
                      <Link
                        to={`/stocks/${ticker}`}
                        key={ticker}
                        className="text-decoration-none text-light"
                      >
                        <div className="position-row d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-bold">{ticker}</div>
                            <div className="text-muted small mb-0">{count} shares</div>
                          </div>
                          <div className="text-end">
                            <div className="fw-semibold">
                              {quotes[ticker]
                                ? formatUSD(quotes[ticker].c)
                                : "$0.00"}
                            </div>
                            <div
                              className="small"
                              style={{
                                color:
                                  quotes[ticker]?.dp > 0
                                    ? "#22C55E"
                                    : quotes[ticker]?.dp < 0
                                    ? "#EF4444"
                                    : "#9CA3AF",
                              }}
                            >
                              {quotes[ticker]
                                ? formatPercent(quotes[ticker].dp)
                                : "0.00%"}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="watchlist-empty">
                      No open positions yet. Start trading to see your holdings appear here.
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </Container>
  );
};

export default Dashboard;
