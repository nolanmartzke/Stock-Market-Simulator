import React, { useEffect, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Activity,
  Wallet,
  Sparkles,
  Compass,
  Plus,
} from "lucide-react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";
import { loadAccount } from "../api/AccountApi";
import { Link } from "react-router-dom";
import { getQuote } from "../api/StockApi";
import NewsCard from "../components/NewsCard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {
  const { auth } = useAuth();
  const { selectedAccountId, selectedAccount } = useAccount();

  const [portfolioValue, setPortfolioValue] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [cashBalance, setCashBalance] = useState(0);
  const [positions, setPositions] = useState([]);
  const [quotes, setQuotes] = useState({});

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

  const change = portfolioValue - 10000 >= 0 ? "positive" : "negative";
  const changeDollars = formatUSD(portfolioValue - 10000); // start balance is always $10,000
  const changePercent = formatPercent(((portfolioValue - 10000) / 10000) * 100);

  useEffect(() => {
    if (!auth) return;
    setFirstName(auth.name.split(" ")[0]);
  }, [auth]);

  useEffect(() => {
    if (!selectedAccountId) return;

    loadAccount(selectedAccountId)
      .then((response) => response.data)
      .then((data) => {
        console.log(data);
        setCashBalance(data.cash);
        // Convert holdings array to positions object, filter 0 shares
        const filteredPositions = {};
        (data.holdings || []).forEach((h) => {
          if (h.shares !== 0) filteredPositions[h.stockTicker] = h.shares;
        });
        setPositions(filteredPositions);
        setQuotes({}); // Reset quotes when switching accounts
      })
      .catch((err) => console.log(err));
  }, [selectedAccountId]);

  useEffect(() => {
    if (!positions) return;

    for (const [ticker] of Object.entries(positions)) {
      if (!(ticker in quotes)) {
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

  const formattedPortfolioValue = formatUSD(portfolioValue);
  const formattedCashBalance = formatUSD(cashBalance);
  const positionCount = positions ? Object.keys(positions).length : 0;
  // const equityValue = positions
  //   ? Object.entries(positions).reduce((sum, [ticker, shares]) => {
  //       const price = quotes[ticker]?.c ?? 0;
  //       return sum + shares * price;
  //     }, 0)
  //   : 0;
  const chartData = [
    { name: "Mon", price: portfolioValue * 0.94 || 11850 },
    { name: "Tue", price: portfolioValue * 0.97 || 12010 },
    { name: "Wed", price: portfolioValue * 1.01 || 12240 },
    { name: "Thu", price: portfolioValue * 1.04 || 12410 },
    { name: "Fri", price: portfolioValue * 1.02 || 12300 },
  ];
  const hour = new Date().getHours();
  const greeting =
    hour < 4
      ? "Good night"
      : hour < 12
      ? "Good morning"
      : hour < 18
      ? "Good afternoon"
      : hour < 22
      ? "Good evening"
      : "Good night";

  return (
    <Container fluid className="dashboard-page py-4">
      <div className="container-xl d-flex flex-column gap-4">
        <div className="glass-panel gradient-border dashboard-hero p-4 p-lg-5 card-arc">
          <div className="d-flex flex-wrap align-items-start justify-content-between gap-4">
            <div>
              <div className="pill-gradient text-uppercase small mb-2 d-inline-flex">
                Portfolio
              </div>

              <div className="d-flex align-items-center gap-5">
                <h1 className="display-5 mb-0 text-light">
                  {formattedPortfolioValue}
                </h1>

                <div
                  className={`metric-pill ${
                    change === "positive" ? "positive" : "negative"
                  }`}
                >
                  {change === "positive" ? (
                    <ArrowUp size={16} />
                  ) : (
                    <ArrowDown size={16} />
                  )}
                  <span>{changeDollars}</span>
                  <span className="opacity-75">({changePercent})</span>
                </div>
              </div>
            </div>

            <div className="text-end d-flex flex-column align-items-end gap-2">
              <div className="text-gradient fw-semibold fs-2">
                {greeting}, {firstName || "trader"}.
              </div>
              {selectedAccount && (
                <div
                  className="fw-medium mt-3"
                  style={{
                    color: "rgba(232,237,255,0.85)",
                    fontSize: "1.25rem",
                  }}
                >
                  Viewing:{" "}
                  <span style={{ color: "#60a5fa" }}>
                    {selectedAccount.name || "Account"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <Row className="g-4">
          <Col xs={12} xl={8} className="d-flex flex-column gap-4">
            <Card className="glass-panel gradient-border card-arc chart-card">
              <Card.Body className="p-4 h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="text-uppercase section-sub small">
                      Live chart
                    </div>
                    <h5 className="section-heading mb-0">Market pulse</h5>
                  </div>
                  <span className="pill-gradient small">Realtime</span>
                </div>
                <div className="flex-grow-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="areaGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#60a5fa"
                            stopOpacity={0.55}
                          />
                          <stop
                            offset="100%"
                            stopColor="#111827"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke="rgba(255,255,255,0.05)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: "#aeb8de" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: "#aeb8de" }}
                        axisLine={false}
                        tickLine={false}
                        width={60}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "#0b1023",
                          border: "1px solid rgba(255,255,255,0.08)",
                          borderRadius: 12,
                          color: "#fff",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="#60a5fa"
                        strokeWidth={3}
                        fill="url(#areaGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>

            {/* <Card className="glass-panel gradient-border card-arc watchlist-card">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="text-uppercase section-sub small">
                      Watchlist
                    </div>
                    <h5 className="section-heading mb-0">Stay on top</h5>
                  </div>
                  <span className="pill-ghost">
                    <Plus size={14} /> Add from Trade
                  </span>
                </div>
                <div className="watchlist-empty">
                  Create a curated set of tickers to track intraday moves, news,
                  and alerts.
                </div>
              </Card.Body>
            </Card> */}

            <Card className="glass-panel gradient-border card-arc news-card">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-uppercase section-sub small">News</div>
                    <h5 className="section-heading mb-0">Market headlines</h5>
                    <div className="section-sub">
                      Fresh stories across your followed tickers.
                    </div>
                  </div>
                  <span className="pill-gradient small">Realtime</span>
                </div>
                <div className="news-shell mt-3">
                  <NewsCard
                    category="general"
                    pageSize={5}
                    wrapInCard={false}
                  />
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} xl={4} className="d-flex flex-column gap-4">
            <Card className="glass-panel gradient-border card-arc positions-card sticky-card">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="text-uppercase section-sub small">
                      Current
                    </div>
                    <h4 className="section-heading mb-0">Positions</h4>
                  </div>
                  <span className="pill-gradient text-white">
                    {positionCount} assets
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center m-4">
                  <span className="section-sub">Cash on hand</span>
                  <span className="fw-semibold text-light">
                    {formattedCashBalance}
                  </span>
                </div>
                <div className="positions-scroller d-grid gap-2">
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
                            <div
                              className="small mb-0"
                              style={{ color: "rgba(223, 227, 255, 0.8)" }}
                            >
                              {count} shares
                            </div>
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
                      No open positions yet. Start trading to see your holdings
                      appear here.
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
