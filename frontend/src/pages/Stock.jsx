import React, { useEffect, useMemo, useState } from "react";
import { Search, PlusCircle, ArrowRightCircle, ArrowUpRight, ArrowDownRight, TrendingUp, Layers, CircleDollarSign, } from "lucide-react";
import { ComposedChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, } from "recharts";
import { useParams } from "react-router-dom";
import { Button, Container, Form, Row, Col, Card, Modal } from "react-bootstrap";
import { getQuote, getMetrics, search, getHistory, getProfile, } from "../api/StockApi";
import api, { trade, loadAccount } from "../api/AccountApi";
import { motion, AnimatePresence } from "framer-motion";

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

  function refreshHoldings() {
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
  } 
  /**
   * Whenever the account or ticker changes, refresh holdings so we can
   * show share count and average cost for the selected symbol.
   */
  useEffect(() => {
    refreshHoldings();
  }, [accountId, ticker, query]);

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
      setDayChangePercent(`+${quote.dp}%`);
    } else {
      setDayChange("negative");
      setDayChangeDollars(`${formatUSD(quote.d)}`);
      setDayChangePercent(`${quote.dp}%`);
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
    <div className="container-fluid">

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
              "linear-gradient(135deg, rgba(9,20,45,0.95), rgba(16,80,120,0.9))",
            color: "#f8fbff",
            border: "1px solid rgba(255,255,255,0.18)",
            outline: "2px solid rgba(255,255,255,0.12)",
            outlineOffset: "2px",
            boxShadow: "0 18px 55px rgba(0,0,0,0.35)",
            borderRadius: "14px",
            backdropFilter: "blur(8px)",
            fontSize: "28px",
            lineHeight: "1.45",
            padding: "14px 10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          },
        }}
      />

      {/* stock name and price */}
      <Container className="py-2 pb-0 px-3">
        <Card
          className="bg-gradient shadow-lg border-0 py-3"
          style={{
            backgroundColor: "#01497c",
            color: "white",
            borderRadius: "10px",
          }}
        >
          <Card.Body
            className="d-flex justify-content-between align-items-center"
            style={{ paddingLeft: "2%", paddingRight: "5%" }}
          >
            <div
              className="text-end px-4 py-3 me-5 rounded-4 border"
              style={{
                background:
                  dayChange === "positive"
                    ? "linear-gradient(135deg, rgba(34, 197, 94, 0.55), rgba(34, 197, 94, 0.35))"
                    : "linear-gradient(135deg, rgba(248, 113, 113, 0.55), rgba(248, 113, 113, 0.35))",
                borderColor:
                  dayChange === "positive"
                    ? "rgba(22, 163, 74, 0.25)"
                    : "rgba(220, 38, 38, 0.25)",
                boxShadow:
                  dayChange === "positive"
                    ? "0 14px 30px rgba(22, 163, 74, 0.18)"
                    : "0 14px 30px rgba(220, 38, 38, 0.18)",
              }}
            >
              <h2 className="mb-0 fw-semibold" style={{ fontSize: "2.5rem" }}>
                {formattedPrice}
              </h2>
              <div
                className={`d-inline-flex align-items-center gap-2 mt-2 px-3 py-1 rounded-pill fw-semibold ${
                  dayChange === "positive"
                    ? "bg-success-subtle text-success"
                    : "bg-danger-subtle text-danger"
                }`}
                style={{
                  boxShadow:
                    dayChange === "positive"
                      ? "0 10px 24px rgba(34, 197, 94, 0.25)"
                      : "0 10px 24px rgba(239, 68, 68, 0.25)",
                }}
              >
                <span
                  className={`d-inline-flex align-items-center justify-content-center rounded-circle border ${
                    dayChange === "positive"
                      ? "border-success-subtle text-success"
                      : "border-danger-subtle text-danger"
                  }`}
                  style={{
                    width: "26px",
                    height: "26px",
                    backgroundColor: "white",
                  }}
                >
                  {dayChange === "positive" ? (
                    <ArrowUpRight size={16} />
                  ) : (
                    <ArrowDownRight size={16} />
                  )}
                </span>
                <span>{dayChangeDollars}</span>
                <span className="opacity-75">({dayChangePercent})</span>
              </div>
            </div>
            <div className="flex-grow-1 text-center">
              <div className="d-flex align-items-center justify-content-center gap-3">
                {profile && profile.logo ? (
                  <img
                    src={profile.logo}
                    alt={`${stockName} logo`}
                    style={{
                      width: 64,
                      height: 64,
                      objectFit: "contain",
                      borderRadius: 8,
                    }}
                  />
                ) : null}
                <h1
                  className="mb-0 fw-semibold text-truncate"
                  style={{ fontSize: "3rem" }}
                >
                  {stockName}
                </h1>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <Container>
        <Row>
          {/* Graph */}
          <Col xs={12} md={12} xl={8} className="p-3">
            <Card
              className="shadow-lg border-0 h-100"
              style={{
                backgroundColor: "#0a1324",
                backgroundImage:
                  "radial-gradient(circle at 18% 22%, rgba(96,165,250,0.18), transparent 26%), radial-gradient(circle at 82% 12%, rgba(14,165,233,0.22), transparent 22%), linear-gradient(145deg, #0a1324 0%, #0d2340 52%, #0b1a33 100%)",
                color: "#f5f9ff",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 24px 70px rgba(0,0,0,0.6)",
              }}
            >
              <Card.Body
                className="d-flex flex-column justify-content-center align-items-center"
                style={{ background: "transparent", color: "#f5f9ff" }}
              >
                <div className="w-100 d-flex align-items-center justify-content-between px-1">
                  <div
                    className="text-uppercase small fw-semibold"
                    style={{ letterSpacing: "0.12em", color: "rgba(229, 238, 255, 0.9)" }}
                  >
                    Price Journey
                  </div>
                  <div
                    className="px-3 py-1 rounded-pill"
                    style={{
                      background:
                        "linear-gradient(120deg, rgba(56,189,248,0.24), rgba(94,234,212,0.18))",
                      color: "#0b1120",
                      fontSize: "0.85rem",
                      border: "1px solid rgba(255,255,255,0.08)",
                      boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                    }}
                  >
                    Live overview
                  </div>
                </div>
                <div
                  style={{
                    width: "100%",
                    minWidth: 0,
                    height: 400,
                    marginTop: 10,
                    background:
                      "linear-gradient(180deg, rgba(9,12,24,0.92) 0%, rgba(7,12,22,0.9) 40%, rgba(4,7,15,0.92) 100%)",
                    borderRadius: "14px",
                    padding: "8px 6px 2px",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={filteredHistory}
                      margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
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
                          <feDropShadow
                            dx="0"
                            dy="10"
                            stdDeviation="12"
                            floodColor="#38bdf8"
                            floodOpacity="0.28"
                          />
                        </filter>
                      </defs>
                      <XAxis
                        dataKey="date"
                        ticks={chartTicks}
                        tickFormatter={formatDateTick}
                        tick={{ fill: "rgba(226,232,240,0.95)", fontSize: 12 }}
                        tickLine={{ stroke: "rgba(226,232,240,0.3)" }}
                        axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
                        minTickGap={10}
                      />
                      <YAxis
                        domain={["auto", "auto"]}
                        tickFormatter={formatPriceTick}
                        tick={{ fill: "rgba(226,232,240,0.95)", fontSize: 12 }}
                        tickLine={{ stroke: "rgba(226,232,240,0.3)" }}
                        axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
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
                        isAnimationActive={true}
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
                <div className="d-flex flex-wrap gap-2 mb-2 mt-3 justify-content-center">
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
                        padding: "8px 14px",
                        letterSpacing: "0.04em",
                      }}
                      onClick={() => setRange(r)}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {/* shares, average price and portfolio percentage of this stock */}
                {numHoldingShares > 0 && (
                  <Card
                    className="border-0 shadow-lg mt-1 w-100"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(2,22,46,0.95), rgba(0,10,20,0.92))",
                      color: "white",
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Card.Body className="d-flex flex-column gap-3">
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
                    </Card.Body>
                  </Card>
                )}
              </Card.Body>
            </Card>
          </Col>
          {/* Trading panel */}
          <Col xs={12} md={12} xl={4} className="p-3">
            <Card
              className="bg-gradient shadow-lg border-0 h-100 px-4"
              style={{
                backgroundColor: "black",
                color: "white",
                borderRadius: "10px",
              }}
            >
              <Card.Body>
                <h2 className="text-center my-3">Trade</h2>

                {/* Buy/Sell */}
                <div className="d-flex w-100 rounded-pill px-1 py-1 text-white-50 fw-semibold bg-dark">
                  <button
                    type="button"
                    onClick={() => setMode("buy")}
                    className={`flex-fill py-1 rounded-pill border-0 transition ${
                      mode === "buy"
                        ? "bg-success text-white shadow shadow-primary-subtle"
                        : "bg-transparent text-white-50"
                    }`}
                  >
                    Buy {stockTicker}
                  </button>
                  <button
                    disabled={numHoldingShares === 0}
                    type="button"
                    onClick={() => setMode("sell")}
                    className={`flex-fill py-1 rounded-pill border-0 transition ${
                      mode === "sell"
                        ? "bg-danger text-white shadow"
                        : "bg-transparent text-white-50"
                    }`}
                  >
                    Sell {stockTicker}
                  </button>
                </div>

                {/* Order Type / Buy In */}
                <div className="d-flex justify-content-between align-items-center my-4">
                  <p>Order type</p>
                  <Form.Select
                    size="md w-auto"
                    style={{
                      backgroundColor: "#1f1f1f",
                      color: "white",
                      border: "none",
                    }}
                  >
                    <option>Market order</option>
                    <option>Limit order</option>
                  </Form.Select>
                </div>
                <div className="d-flex justify-content-between align-items-center my-4">
                  <p>Buy In</p>
                  <Form.Select
                    size="md w-auto"
                    style={{
                      backgroundColor: "#1f1f1f",
                      color: "white",
                      border: "none",
                    }}
                  >
                    <option>Shares</option>
                    <option>Dollars</option>
                  </Form.Select>
                </div>

                {/* Shares/Dollars */}
                <div className="d-flex justify-content-between align-items-center my-4">
                  <p>Shares</p>
                  <Form.Control
                    size="sm"
                    type="number"
                    className="no-spin border-0 w-25"
                    style={{
                      backgroundColor: "#1f1f1f",
                      color: "white",
                      textAlign: "right",
                    }}
                    onChange={(e) => setShares(Number(e.target.value))}
                    onFocus={() => {
                      if (shares === 0) setShares("");
                    }}
                    onBlur={() => {
                      if (shares === "") setShares(0);
                    }} //
                    value={shares}
                  />
                </div>

                {/* Market/Limit Price */}
                <div className="d-flex justify-content-between align-items-center mt-2">
                  <p style={{ color: "#4ade80" }}>Market Price</p>
                  <p>{formattedPrice}</p>
                </div>

                <hr className="border border-secondary mb-3" />

                {/* Estimated cost */}
                <div className="d-flex justify-content-between mb-3">
                  <h5 style={{ fontWeight: "600" }}>Estimated cost</h5>
                  <h5>{estimatedCostDollars}</h5>
                </div>

                      
                <motion.button // idle | notEnoughBP | notEnoughShares | missingRequiredInput
                  className=" w-100 border-0 rounded-pill fw-bold text-white py-3"
                  style={{
                    borderRadius: "12px",
                    backgroundColor: {
                      idle: "var(--bs-success)",
                      notEnoughBP: "var(--bs-danger)",
                      notEnoughShares: "var(--bs-danger)",
                      missingRequiredInput: "var(--bs-danger)",
                    }[reviewButtonStatus],
                  }}
                  // animation upon click
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReviewOrder}
                >
                  <AnimatePresence mode="wait">
                    <motion.span // fades the text in and out
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
                          : reviewButtonStatus === "missingRequiredInput"
                          ? "Enter Shares"
                          : "Review Order" // default
                      }
                    </motion.span>
                  </AnimatePresence>
                </motion.button>

        

                {/* Buying power */}
                <div className="text-center mt-3">
                  <small className="text-secondary">
                    {formatUSD(cash)} buying power available
                  </small>
                </div>

                {/* Account Type */}
                <div className="d-flex justify-content-center mt-2">
                  <small className="text-secondary">
                      <Form.Select size="sm" style={{ display: "inline-block", width: "auto", backgroundColor: "#121212", color: "white", border: "none"}}>
                          <option>Main Account</option>
                          <option>Account 2</option>
                          <option>Account 3</option>
                          {/* TODO: Raj should add accounts here */}
                      </Form.Select>
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Container>
        {/* Company profile details */}
        {profile && (
          <Row>
            <Col xs={12} className="px-3 py-0">
              <Card
                className="bg-gradient shadow-lg border-0 text-white"
                style={{ backgroundColor: "#0c2f49ff", borderRadius: "15px" }}
              >
                <Card.Body className="mx-5 py-4 d-flex flex-column">
                  <h3
                    className="mt-2 fw-semibold text-white mb-4 pb-3"
                    style={{ borderBottom: "2px solid rgba(255,255,255,0.12)" }}
                  >
                    Company Profile
                  </h3>
                  <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-3 g-2">
                    <Col>
                      <p>
                        <strong>Industry:</strong>{" "}
                        {profile.finnhubIndustry || "—"}
                      </p>
                    </Col>
                    <Col>
                      <p>
                        <strong>Exchange:</strong> {profile.exchange || "—"}
                      </p>
                    </Col>
                    <Col>
                      <p>
                        <strong>Country:</strong> {profile.country || "—"}
                      </p>
                    </Col>
                    <Col>
                      <p>
                        <strong>Currency:</strong> {profile.currency || "—"}
                      </p>
                    </Col>
                    <Col>
                      <p>
                        <strong>Market Cap:</strong>{" "}
                        {profile.marketCapitalization
                          ? new Intl.NumberFormat().format(
                              profile.marketCapitalization
                            )
                          : "—"}
                      </p>
                    </Col>
                    <Col>
                      <p>
                        <strong>Shares Outstanding:</strong>{" "}
                        {profile.shareOutstanding
                          ? new Intl.NumberFormat().format(
                              Math.round(profile.shareOutstanding)
                            )
                          : "—"}
                      </p>
                    </Col>
                    <Col>
                      <p>
                        <strong>IPO Date:</strong> {profile.ipo || "—"}
                      </p>
                    </Col>
                    <Col>
                      <p>
                        <strong>Phone:</strong> {profile.phone || "—"}
                      </p>
                    </Col>
                    <Col>
                      <p>
                        <strong>Website:</strong>{" "}
                        {profile.weburl ? (
                          <a
                            href={profile.weburl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              color: "#fff",
                              textDecoration: "underline",
                            }}
                          >
                            {profile.weburl}
                          </a>
                        ) : (
                          "—"
                        )}
                      </p>
                    </Col>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* metrics */}
        {Object.keys(metrics || {}).length > 0 && (
          <Row className="">
            <Col xs={12} className="py-3">
              <Card
                className="border-0 shadow-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #020b1f 0%, #04112a 55%, #071b3d 100%)",
                  color: "white",
                  borderRadius: "22px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Card.Body className="p-4 p-md-5">
                  <h3 className="mb-0 fw-semibold text-white mb-4">
                    Key Metrics
                  </h3>
                  <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-4">
                    {Object.entries(metrics).map(([name, value]) => (
                      <div key={name} className="col d-flex">
                        <div
                          className="flex-grow-1 py-3 px-2"
                          style={{
                            borderTop: "1px solid rgba(255,255,255,0.12)",
                          }}
                        >
                          <p className="text-white-50 text-uppercase small mb-1 fw-semibold">
                            {" "}
                            {name}{" "}
                          </p>
                          <h4 className="text-white mb-0 fw-semibold">
                            {" "}
                            {value}{" "}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Public/private confirmation modal */}
        <Modal
          show={tradeConfirmModal}
          onHide={() => setTradeConfirmModal(false)}
          centered
          backdrop="static"
          className="modern-trade-modal"
        >
          <Modal.Header
            closeButton
            className="bg-dark bg-gradient border-0 text-white px-4 py-3 rounded-top shadow-lg"
          >
            <Modal.Title className="fw-bold text-uppercase">
              Confirm {ticker} Order
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="bg-dark text-white px-4 py-4 border-top border-secondary-subtle">
            <div className="d-flex justify-content-between align-items-center mb-3 px-3 py-2 rounded-3 bg-black bg-opacity-25 shadow-sm">
              <span className="text-uppercase text-white-50 small">Action</span>
              <span className="fw-semibold text-uppercase text-white">
                {mode === "buy" ? "Buy" : "Sell"}
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3 px-3 py-2 rounded-3 bg-black bg-opacity-25 shadow-sm">
              <span className="text-uppercase text-white-50 small">Quantity</span>
              <span className="fw-semibold text-white">{shares || 0} shares</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3 px-3 py-2 rounded-3 bg-black bg-opacity-25 shadow-sm">
              <span className="text-uppercase text-white-50 small">Order Type</span>
              <span className="fw-semibold text-white">Market</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3 px-3 py-2 rounded-3 bg-black bg-opacity-25 shadow-sm">
              <span className="text-uppercase text-white-50 small">Market Price</span>
              <span className="fw-semibold text-white">{formattedPrice}</span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-1 px-3 py-2 rounded-3 bg-black bg-opacity-25 shadow-sm">
              <span className="text-uppercase text-white-50 small">Total</span>
              <span className="fw-semibold text-white">{estimatedCostDollars}</span>
            </div>
    
          </Modal.Body>

          <Modal.Footer className="bg-dark border-0 d-flex flex-column flex-sm-row align-items-stretch gap-3 px-4 pb-4">
            <Button className="w-100 text-uppercase fw-semibold rounded-pill py-2 btn-light"
              onClick={() => setTradeConfirmModal(false) }>Cancel</Button>
            <Button
                className="w-100 text-uppercase fw-bold rounded-pill py-3 shadow-lg"
                onClick={handleSubmitOrder}
            >
                Place Order
            </Button>
          </Modal.Footer>
               
        </Modal>
        

      </Container>
    </div>
  );
};

export default Stock;
