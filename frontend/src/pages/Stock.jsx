import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Layers, CircleDollarSign, } from "lucide-react";
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, } from "recharts";
import { useParams } from "react-router-dom";
import { Button, Form, Row, Col, Modal } from "react-bootstrap";
import { getQuote, getMetrics, search, getHistory, getProfile, } from "../api/StockApi";
import api, { trade, loadAccount } from "../api/AccountApi";
import { motion as Motion, AnimatePresence } from "framer-motion";

import { Toaster, toast } from "sonner";


/**
 * Stock detail page that loads quote data, fundamentals, price history,
 * and account-specific holdings so users can trade a single ticker.
 */
const Stock = () => {
  const { query } = useParams();

  const [price, setPrice] = useState("$0");
  const [ticker, setTicker] = useState("");
  const stockTicker = (ticker || "").toUpperCase();
  const [stockName, setStockName] = useState("Loading...");
  const [metrics, setMetrics] = useState([]);
  const [quote, setQuote] = useState([]);
  const [profile, setProfile] = useState(null);

  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [range, setRange] = useState("2Y");

  const [dayChange, setDayChange] = useState("positive");
  const [dayChangeDollars, setDayChangeDollars] = useState(0);
  const [dayChangePercent, setDayChangePercent] = useState(0);

  const [cash, setCash] = useState("0"); // user's cash balance

  const [mode, setMode] = useState("buy"); // buy or sell
  const [shares, setShares] = useState(0); // number of shares user wants to buy/sell

  const [accountId, setAccountId] = useState(null);
  const [numHoldingShares, setNumHoldingShares] = useState(0);
  const [averageCost, setAverageCost] = useState(0);

  const [tradeConfirmModal, setTradeConfirmModal] = useState(false);
  const [reviewButtonStatus, setReviewButtonStatus] = useState("idle"); // idle | notEnoughBP | notEnoughShares | missingRequiredInput
  
  /**
   * On mount, resolve the authenticated user’s first brokerage account
   * so subsequent trades can be tied to a concrete account ID.
   */
  useEffect(() => {
    const authString = localStorage.getItem("auth");
    if (!authString) return;
    const auth = JSON.parse(authString);
    // IMPORTANT: use '' so baseURL '/api/accounts' + '' → '/api/accounts'
    api
      .get("", { params: { userId: auth.id } })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        if (list.length) setAccountId(list[0].id);
      })
      .catch((err) => console.error("Failed to load accounts", err));
  }, []);

  const refreshHoldings = useCallback(() => {
    if (!accountId) return;
    if (!ticker) return;

    loadAccount(accountId)
      .then((response) => response.data)
      .then((data) => {
        if (!data.holdings) return;
        setCash(data.cash)

        const currHolding = data.holdings.find((h) => h.stockTicker === ticker);
        if (!currHolding) {
          setNumHoldingShares(0);
          setAverageCost(null);
        } else {
          setNumHoldingShares(currHolding.shares);
          setAverageCost(currHolding.averagePrice);
        }

        console.log(data);
      })
      .catch((err) => console.log(err));
  }, [accountId, ticker]); 
  /**
   * Whenever the account or ticker changes, refresh holdings so we can
   * show share count and average cost for the selected symbol.
   */
  useEffect(() => {
    refreshHoldings();
  }, [accountId, ticker, query, refreshHoldings]);

  /**
   * Respond to route changes by loading quotes, metrics, history, and
   * the company profile for the requested symbol.
   */
  useEffect(() => {
    search(query)
      .then((response) => response.data)
      .then((data) => {
        console.log(data);
        setStockName(data.description);
        setTicker(data.symbol);
        return data.symbol;
      })
      .then((ticker) => {
        getQuote(ticker)
          .then((response) => response.data)
          .then((data) => {
            console.log(data);
            setPrice(data.c);
            setQuote(data);
          })
          .catch((err) => console.log(err));

        getMetrics(ticker)
          .then((response) => response.data)
          .then((data) => {
            console.log(data);
            setMetrics(data);
          })
          .catch((err) => console.log(err));

        getHistory(ticker, "2Y")
          .then((response) => response.data)
          .then((data) => {
            setHistory(data.results);
          })
          .catch((err) => console.log(err));

        // fetch company profile from backend (/profile2)
        getProfile(ticker)
          .then((response) => response.data)
          .then((data) => {
            setProfile(data);
          })
          .catch((err) => {
            console.log("getProfile error", err);
            setProfile(null);
          });
      })
      .catch((err) => console.log(err));
  }, [query]);

  /**
   * Derive the day-change badges whenever the latest quote updates.
   */
  useEffect(() => {
    if (quote.d >= 0) {
      setDayChange("positive");
      setDayChangeDollars(`+${formatUSD(quote.d)}`);
      setDayChangePercent(`${formatPercent(quote.dp)}`);
    } else {
      setDayChange("negative");
      setDayChangeDollars(`${formatUSD(quote.d)}`);
      setDayChangePercent(`${formatPercent(quote.dp)}`);
    }
  }, [quote]);

  /**
   * Re-filter cached history when the user switches the range selector.
   */
  useEffect(() => {
    let data = history.map((item) => ({
      date: new Date(item.t).toISOString().split("T")[0], // format as "YYYY-MM-DD"
      price: item.c,
    }));

    let cutoff = new Date();

    switch (range) {
      case "1Y":
        cutoff.setFullYear(cutoff.getFullYear() - 1);
        break;
      case "YTD":
        cutoff = new Date(cutoff.getFullYear(), 0, 1);
        break;
      case "3M":
        cutoff.setMonth(cutoff.getMonth() - 3);
        break;
      case "1M":
        cutoff.setMonth(cutoff.getMonth() - 1);
        break;
      case "1W":
        cutoff.setDate(cutoff.getDate() - 7);
        break;
      default:
        cutoff = null;
    }

    if (cutoff) data = data.filter((item) => new Date(item.date) >= cutoff);

    data.length > 1 && console.log(data);

    setFilteredHistory(data);
  }, [history, range]);

  /**
   * Utility that formats numbers as USD strings for reuse throughout
   * the component (cash balance, share value, estimated cost, etc.).
   */
  const formatUSD = (num) => {
    if (!num)
      num = 0
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  }

  const formatPercent = (num) => {
    const roundedNum = Number(num).toFixed(2);
    let prefix = "";
    if (num >= 0) prefix = "+";
    return prefix + roundedNum + "%";
  };

  const formatDateTick = (value) => {
    const dateObj = new Date(value);
    if (Number.isNaN(dateObj)) return value;

    const month = dateObj.toLocaleString("en-US", { month: "short" });
    const day = dateObj.getDate();
    const year = dateObj.getFullYear().toString().slice(-2);

    switch (range) {
      case "1W":
        return `${month} ${day}`;
      case "1M":
      case "3M":
        return `${month} ${day}`;
      case "YTD":
        return month;
      case "1Y":
        return `${month} '${year}`;
      case "2Y":
        return `${month} '${year}`;
      default:
        return `${month} ${day}`;
    }
  };

  const formatTooltipLabel = (value) => {
    const dateObj = new Date(value);
    if (Number.isNaN(dateObj)) return value;
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const renderTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const price = payload[0]?.value ?? payload[payload.length - 1]?.value;
    return (
      <div
        style={{
          background: "rgba(9,14,26,0.9)",
          border: "1px solid rgba(148,163,184,0.2)",
          borderRadius: "12px",
          boxShadow: "0 20px 55px rgba(0,0,0,0.35)",
          color: "#e8f1ff",
          backdropFilter: "blur(4px)",
          padding: "10px 12px",
        }}
      >
        <div style={{ marginBottom: 6, fontWeight: 600 }}>
          {formatTooltipLabel(label)}
        </div>
        <div style={{ fontWeight: 600 }}>{formatUSD(price)}</div>
      </div>
    );
  };

  const chartTicks = useMemo(() => {
    if (!filteredHistory?.length) return [];

    const parsed = filteredHistory
      .map((p) => ({ ...p, dateObj: new Date(p.date) }))
      .filter((p) => !Number.isNaN(p.dateObj))
      .sort((a, b) => a.dateObj - b.dateObj);

    const ensureLast = (list, lastDate) => {
      if (lastDate && list[list.length - 1] !== lastDate) list.push(lastDate);
      return list;
    };

    // Collapse to one tick per month using the first available date in that month.
    const monthMap = new Map();
    parsed.forEach((p) => {
      const key = `${p.dateObj.getFullYear()}-${p.dateObj.getMonth()}`;
      const existing = monthMap.get(key);
      if (!existing || p.dateObj < existing.dateObj) {
        monthMap.set(key, { date: p.date, dateObj: p.dateObj });
      }
    });
    const months = Array.from(monthMap.values()).sort(
      (a, b) => a.dateObj - b.dateObj
    );

    if (range === "YTD") {
      const step = 2; // every 2 months
      const ticks = months
        .filter((_, idx) => idx % step === 0)
        .map((m) => m.date);
      return ensureLast(ticks, months[months.length - 1]?.date);
    }

    if (range === "1Y") {
      if (!months.length) return [];
      const step = 2; // every 2 months
      const ticks = months
        .filter((_, idx) => idx % step === 0)
        .map((m) => m.date);
      return ensureLast(ticks, months[months.length - 1]?.date);
    }

    if (range === "2Y") {
      if (!months.length) return [];
      const step = Math.max(1, Math.round(months.length / 6)); // aim ~6 ticks
      const ticks = months
        .filter((_, idx) => idx % step === 0)
        .map((m) => m.date);
      return ensureLast(ticks, months[months.length - 1]?.date);
    }

    const minGapInDays =
      {
        "1W": 1,
        "1M": 5,
        "3M": 12,
      }[range] || 30;

    const ticks = [];
    let lastTickDate = null;

    parsed.forEach((point) => {
      const currentDate = point.dateObj;
      if (!lastTickDate) {
        ticks.push(point.date);
        lastTickDate = currentDate;
        return;
      }

      const daysSinceLast =
        Math.abs(currentDate - lastTickDate) / (1000 * 60 * 60 * 24);

      if (daysSinceLast >= minGapInDays) {
        ticks.push(point.date);
        lastTickDate = currentDate;
      }
    });

    return ensureLast(ticks, parsed[parsed.length - 1]?.date);
  }, [filteredHistory, range]);

  const formatPriceTick = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return value;
    const formatted = num.toLocaleString("en-US", {
      minimumFractionDigits: num >= 50 ? 0 : 2,
      maximumFractionDigits: 2,
    });
    return `$${formatted}`;
  };


  const formattedPrice = formatUSD(price);
  const holdingsMarketValue = formatUSD(
    (Number(numHoldingShares) || 0) * (Number(price) || 0)
  );
  const formattedAverageCost = formatUSD(Number(averageCost) || 0);
  const formattedShareCount = (Number(numHoldingShares) || 0).toLocaleString(
    "en-US"
  );
  const estimatedCost = (shares * price).toFixed(2);
  const estimatedCostDollars = formatUSD(estimatedCost);
  const formatCompact = (num) => {
    const n = Number(num);
    if (!n) return "—";
    const abs = Math.abs(n);
    if (abs >= 1e12) return `${(n / 1e12).toFixed(2)}T`;
    if (abs >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
    if (abs >= 1e6) return `${(n / 1e6).toFixed(2)}M`;
    if (abs >= 1e3) return `${(n / 1e3).toFixed(2)}K`;
    return n.toFixed(2);
  };
  const marketCapDisplay = profile?.marketCapitalization
    ? `$${formatCompact(profile.marketCapitalization)}`
    : "—";
  const ipoDate = profile?.ipo || "—";
  const industry = profile?.finnhubIndustry || "—";
  const exchange = profile?.exchange || stockTicker || query;
  const currency = profile?.currency || "USD";
  const website = profile?.weburl || null;
  const sharesOutstandingDisplay = profile?.shareOutstanding
    ? `${formatCompact(profile.shareOutstanding)} shares`
    : "—";


  function handleReviewOrder() {
    if (!shares || shares <= 0) {
      setReviewButtonStatus("missingRequiredInput")
      setTimeout(() => setReviewButtonStatus("idle"), 1000);
      return;
    }
    if (mode === "buy" && shares * price > cash){
      setReviewButtonStatus("notEnoughBP")
      setTimeout(() => setReviewButtonStatus("idle"), 1500);
      return;
    }
    if (mode === "sell" && shares > numHoldingShares){
      setReviewButtonStatus("notEnoughShares")
      setTimeout(() => setReviewButtonStatus("idle"), 1500);
      return;
    }

    setTradeConfirmModal(true); // passed inital checks
  }
  /**
   * Validates the share count, assembles a trade payload, and posts it
   * to the backend. On success, refreshes cash and clears the ticket.
   */
  const handleSubmitOrder = async () => {

    setTradeConfirmModal(false);

    try {
      const order = {
        action: mode,
        ticker: stockTicker,
        shares: shares,
        price: quote.c,
      };

      const updatedAccount = await trade(accountId, order);
      
      setCash(updatedAccount.data.cash);
      refreshHoldings();
      console.log(cash);
      toast.success("Successfully Executed!")
      setShares(0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to execute trade.")
    }
  };

  return (
    <div className="dashboard-page">
      <Toaster
        position="bottom-center"
        theme="dark"
        richColors
        closeButton
        expand
        offset={12}
        toastOptions={{
          duration: 3200,
          className: "border-0",
          descriptionClassName: "text-white-50",
          style: {
            background:
              "linear-gradient(135deg, rgba(10,15,30,0.95), rgba(20,35,70,0.92))",
            color: "#f1f5ff",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 20px 55px rgba(0,0,0,0.35)",
            borderRadius: "16px",
            backdropFilter: "blur(10px)",
            fontSize: "16px",
            lineHeight: "1.35",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          },
        }}
      />

      <div className="container-xl py-4 d-flex flex-column gap-4">
        <div className="glass-panel gradient-border card-arc p-4 p-lg-5">
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-4">
            <div className="d-flex align-items-start gap-3 flex-wrap">
              {profile?.logo ? (
                <img
                  src={profile.logo}
                  alt={`${stockName} logo`}
                  style={{ width: 72, height: 72, objectFit: "contain", borderRadius: 16, background: "rgba(255,255,255,0.05)", padding: 8 }}
                />
              ) : null}
              <div>
                <div className="pill-gradient small text-uppercase mb-1 d-inline-flex">
                  {stockTicker || query}
                </div>
                <h2 className="text-light mb-1">{stockName}</h2>
                <div className="section-sub">{exchange} • {currency}</div>
              </div>
            </div>
            <div className="text-end">
              <div className="display-5 text-light">{formattedPrice}</div>
              <div className={`metric-pill mt-2 ${dayChange === "positive" ? "positive" : "negative"}`}>
                <span className="d-inline-flex align-items-center justify-content-center rounded-circle border" style={{ width: 26, height: 26, backgroundColor: "rgba(255,255,255,0.08)" }}>
                  {dayChange === "positive" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </span>
                <span>{dayChangeDollars}</span>
                <span className="opacity-75">({dayChangePercent})</span>
              </div>
            </div>
          </div>
        </div>

        <Row className="g-4">
          <Col xs={12} xl={8} className="d-flex flex-column gap-4">
            <div className="glass-panel gradient-border card-arc chart-card">
              <div className="p-4 h-100 d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center gap-3">
                  <div>
                    <div className="text-uppercase section-sub small">Price history</div>
                    <h5 className="section-heading mb-0">Market pulse</h5>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {["1W", "1M", "3M", "YTD", "1Y", "2Y"].map((r) => (
                      <button
                        key={r}
                        className="btn btn-sm border-0 fw-semibold"
                        style={{
                          background:
                            range === r
                              ? "linear-gradient(135deg, #22c55e, #0ea5e9)"
                              : "rgba(255,255,255,0.08)",
                          color: range === r ? "#0b1120" : "rgba(232,241,255,0.9)",
                          boxShadow:
                            range === r
                              ? "0 12px 30px rgba(14,165,233,0.35)"
                              : "inset 0 0 0 1px rgba(255,255,255,0.12)",
                          borderRadius: "10px",
                          padding: "8px 12px",
                          letterSpacing: "0.04em",
                        }}
                        onClick={() => setRange(r)}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-grow-1 mt-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={filteredHistory}
                      margin={{ top: 20, right: 10, left: -10, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient id="priceLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#38bdf8" />
                          <stop offset="50%" stopColor="#22c55e" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                        <linearGradient id="priceAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(56,189,248,0.32)" />
                          <stop offset="45%" stopColor="rgba(34,197,94,0.22)" />
                          <stop offset="100%" stopColor="rgba(10,31,54,0)" />
                        </linearGradient>
                        <filter id="priceShadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#38bdf8" floodOpacity="0.28" />
                        </filter>
                      </defs>
                      <XAxis
                        dataKey="date"
                        ticks={chartTicks}
                        tickFormatter={formatDateTick}
                        tick={{ fill: "rgba(226,232,240,0.95)", fontSize: 12 }}
                        tickLine={{ stroke: "rgba(226,232,240,0.3)" }}
                        axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
                        tickMargin={10}
                        minTickGap={10}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        tickFormatter={formatPriceTick}
                        tick={{ fill: "rgba(226,232,240,0.95)", fontSize: 12 }}
                        tickLine={{ stroke: "rgba(226,232,240,0.3)" }}
                        axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
                        tickMargin={12}
                        width={70}
                      />
                      <Tooltip
                        content={renderTooltip}
                        cursor={{
                          stroke: "rgba(226,232,240,0.5)",
                          strokeWidth: 1.2,
                          strokeDasharray: "5 5",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="none"
                        fill="url(#priceAreaGradient)"
                        fillOpacity={1}
                        opacity={0.7}
                        isAnimationActive
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="url(#priceLineGradient)"
                        strokeWidth={3.5}
                        dot={false}
                        activeDot={{
                          r: 6,
                          fill: "#0ea5e9",
                          stroke: "#e2e8f0",
                          strokeWidth: 2,
                          filter: "url(#priceShadow)",
                        }}
                        strokeLinecap="round"
                        filter="url(#priceShadow)"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* shares, average price and portfolio percentage of this stock */}
            {numHoldingShares > 0 && (

                  <div className="d-flex flex-column flex-md-row gap-3 w-100">
                    <div
                      className="flex-fill p-3 rounded-4 d-flex flex-column gap-1"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase small fw-semibold">
                        <TrendingUp size={24} className="text-success" />
                        <span> Your Equity</span>
                      </div>
                      <h4 className="mb-0 fw-semibold text-white text-center">
                        {holdingsMarketValue}
                      </h4>
                    </div>
                    <div
                      className="flex-fill p-3 rounded-4 d-flex flex-column gap-1"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase small fw-semibold">
                        <Layers size={24} className="text-info" />
                        <span>Shares Held</span>
                      </div>
                      <h4 className="mb-0 fw-semibold text-white text-center">
                        {formattedShareCount} shares
                      </h4>
                    </div>
                    <div
                      className="flex-fill p-3 rounded-4 d-flex flex-column gap-1"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 text-white-50 text-uppercase small fw-semibold">
                        <CircleDollarSign
                          size={24}
                          className="text-warning"
                        />
                        <span>Average Cost</span>
                      </div>
                      <h4 className="mb-0 fw-semibold text-white text-center">
                        {formattedAverageCost}
                      </h4>
                    </div>
                  </div>
            )}

            {profile && (
              <div className="glass-panel gradient-border card-arc p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="text-uppercase section-sub small">Company</div>
                    <h5 className="section-heading mb-0">Profile</h5>
                  </div>
                  <span className="pill-gradient small">Overview</span>
                </div>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 g-3">
                  <Col>
                    <div className="section-sub">Industry</div>
                    <div className="text-light fw-semibold">{industry}</div>
                  </Col>
                  <Col>
                    <div className="section-sub">Country</div>
                    <div className="text-light fw-semibold">{profile.country || "—"}</div>
                  </Col>
                  <Col>
                    <div className="section-sub">Market Cap</div>
                    <div className="text-light fw-semibold">{marketCapDisplay}</div>
                  </Col>
                  <Col>
                    <div className="section-sub">IPO</div>
                    <div className="text-light fw-semibold">{ipoDate}</div>
                  </Col>
                  <Col>
                    <div className="section-sub">Currency</div>
                    <div className="text-light fw-semibold">{currency}</div>
                  </Col>
                  <Col>
                    <div className="section-sub">Shares Out.</div>
                    <div className="text-light fw-semibold">{sharesOutstandingDisplay}</div>
                  </Col>
                  <Col>
                    <div className="section-sub">Phone</div>
                    <div className="text-light fw-semibold">{profile.phone || "—"}</div>
                  </Col>
                  <Col>
                    <div className="section-sub">Website</div>
                    {website ? (
                      <a href={website} target="_blank" rel="noreferrer" className="text-decoration-none text-light fw-semibold">
                        {website}
                      </a>
                    ) : (
                      <div className="text-light">—</div>
                    )}
                  </Col>
                </div>
              </div>
            )}

            {Object.keys(metrics || {}).length > 0 && (
              <div className="glass-panel gradient-border card-arc p-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <div className="text-uppercase section-sub small">Fundamentals</div>
                    <h5 className="section-heading mb-0">Key metrics</h5>
                  </div>
                  <span className="pill-ghost">Snapshot</span>
                </div>
                <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3">
                  {Object.entries(metrics).map(([name, value]) => (
                    <div key={name} className="col">
                      <div className="p-3 card-arc" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div className="text-uppercase section-sub small mb-1">{name}</div>
                        <div className="text-light fw-semibold">{value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Col>

          <Col xs={12} xl={4} className="d-flex flex-column gap-4">
            <div className="glass-panel gradient-border card-arc p-4 sticky-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="section-heading mb-0">Trade {stockTicker || query}</h5>
                <span className="pill-ghost">{mode === "buy" ? "Buying" : "Selling"}</span>
              </div>

              <div className="d-flex w-100 rounded-pill px-1 py-1 text-white-50 fw-semibold" style={{ background: "rgba(255,255,255,0.06)" }}>
                <button
                  type="button"
                  onClick={() => setMode("buy")}
                  className={`flex-fill py-2 rounded-pill border-0 transition ${mode === "buy" ? "btn-quick-primary" : ""}`}
                  style={{ color: mode === "buy" ? "#0b1023" : "#dfe3ff", background: mode === "buy" ? "linear-gradient(135deg, #22c55e, #0ea5e9)" : "transparent" }}
                >
                  Buy
                </button>
                <button
                  disabled={numHoldingShares === 0}
                  type="button"
                  onClick={() => setMode("sell")}
                  className={`flex-fill py-2 rounded-pill border-0 transition ${mode === "sell" ? "btn-quick-primary" : ""}`}
                  style={{ color: mode === "sell" ? "#0b1023" : "#dfe3ff", background: mode === "sell" ? "linear-gradient(135deg, #ef4444, #f97316)" : "transparent" }}
                >
                  Sell
                </button>
              </div>

              <div className="mt-4 d-flex flex-column gap-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="section-sub">Order type</span>
                  <Form.Select size="sm" className="bg-dark text-light border-0" style={{ width: "auto" }}>
                    <option>Market order</option>
                    {/* <option>Limit order</option> */}
                  </Form.Select>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="section-sub">Buy In</span>
                  <Form.Select size="sm" className="bg-dark text-light border-0" style={{ width: "auto" }}>
                    <option>Shares</option>
                    {/* <option>Dollars</option> */}
                  </Form.Select>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="section-sub">Shares</span>
                  <Form.Control
                    size="sm"
                    type="number"
                    className="no-spin text-end bg-dark text-light border-0"
                    style={{ width: "120px" }}
                    onChange={(e) => setShares(Number(e.target.value))}
                    onFocus={() => { if (shares === 0) setShares(""); }}
                    onBlur={() => { if (shares === "") setShares(0); }}
                    value={shares}
                  />
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-success">Market price</span>
                  <span className="text-light fw-semibold">{formattedPrice}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="section-sub">Estimated cost</span>
                  <span className="text-light fw-semibold">{estimatedCostDollars}</span>
                </div>
              </div>

              <Motion.button
                className="w-100 border-0 rounded-3 fw-bold text-white py-3 mt-3"
                style={{
                  borderRadius: "14px",
                  background: {
                    idle: "linear-gradient(135deg, #22c55e, #0ea5e9)",
                    notEnoughBP: "linear-gradient(135deg, #ef4444, #f97316)",
                    notEnoughShares: "linear-gradient(135deg, #ef4444, #f97316)",
                    missingRequiredInput: "linear-gradient(135deg, #ef4444, #f97316)",
                  }[reviewButtonStatus],
                }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReviewOrder}
              >
                <AnimatePresence mode="wait">
                  <Motion.span
                    key={reviewButtonStatus}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.1 } }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                  >
                    {
                      reviewButtonStatus === "idle"
                        ? "Review Order"
                        : reviewButtonStatus === "notEnoughBP"
                        ? "Not Enough Cash"
                        : reviewButtonStatus === "notEnoughShares"
                        ? "Not Enough Shares"
                        : "Enter Shares"
                    }
                  </Motion.span>
                </AnimatePresence>
              </Motion.button>

              <div className="text-center mt-3">
                <small className="section-sub">{formatUSD(cash)} buying power available</small>
              </div>
              <div className="d-flex justify-content-center mt-2">
                <small className="section-sub">
                  <Form.Select size="sm" className="bg-dark text-light border-0" style={{ display: "inline-block", width: "auto" }}>
                    <option>Main Account</option>
                    <option>Account 2</option>
                    <option>Account 3</option>
                  </Form.Select>
                </small>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Public/private confirmation modal */}
      <Modal
        show={tradeConfirmModal}
        onHide={() => setTradeConfirmModal(false)}
        centered
        backdrop="static"
        dialogClassName="modal-dialog-centered"
        contentClassName="border-0 bg-transparent"
      >


        {/* BODY */}
        <Modal.Body className="p-4" style={{ background: "#0a0e17", borderRadius: "18px 18px 0 0" }}>
          <div className="mb-3">
            <div className="text-uppercase fw-bold" style={{ letterSpacing: "0.04em", fontSize: "0.95rem", color: "#e5e7eb" }}>
              Please confirm order
            </div>
          </div>
          <div
            className="p-4 rounded-4"
            style={{
              background: "#111726",
              border: "1px solid rgba(255,255,255,0.05)",
              boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.03)",
              textAlign: "left",
            }}
          >
            <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
              <div
                className="px-3 py-1 rounded-pill fw-bold text-white"
                style={{
                  fontSize: "0.9rem",
                  background:
                    mode === "buy"
                      ? "linear-gradient(135deg, #22c55e, #0ea5e9)"
                      : "linear-gradient(135deg, #f97316, #ef4444)",
                  letterSpacing: "0.03em",
                }}
              >
                {mode === "buy" ? "Buy" : "Sell"}
              </div>
              <div className="pill-ghost small" style={{ borderRadius: "12px", padding: "6px 10px" }}>
                {stockTicker || ticker || query}
              </div>
            </div>

            <div className="text-light" style={{ fontSize: "1.05rem" }}>
              {mode === "buy" ? "Buying" : "Selling"} {shares || 0} {shares === 1 ? "share" : "shares"} of{" "}
              {stockTicker || ticker || query} at {formattedPrice} each.
            </div>

            <div
              className="mt-2 fw-semibold"
              style={{ fontSize: "1.25rem", color: "#f8fafc" }}
            >
              Estimated total: {estimatedCostDollars}
            </div>
          </div>
        </Modal.Body>


        {/* FOOTER */}
        <Modal.Footer
        className="d-flex flex-row gap-3 border-0 p-4"
        style={{ background: "#0a0e17" }}
        >
          <Button
          className="flex-fill fw-semibold rounded-4 py-2"
          variant="light"
          onClick={() => setTradeConfirmModal(false)}
          style={{
          background: "#e2e8f0",
          color: "#0f172a",
          border: "none",
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
          }}
          >
            Cancel
          </Button>


          <Motion.button
          whileTap={{ scale: 0.96 }}
          className="flex-fill fw-bold rounded-4 py-2 text-white border-0"
          onClick={handleSubmitOrder}
          style={{
          background: "linear-gradient(135deg, #22c55e, #0ea5e9)",
          boxShadow: "0 10px 30px rgba(14,165,233,0.35)",
          fontSize: "1rem",
          }}
          >
            Place Order
          </Motion.button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Stock;
