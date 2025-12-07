import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ArrowRightCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  RefreshCcw,
} from "lucide-react";
import {
  searchBar,
  getQuote,
  search,
  getMetrics,
  getHistory,
  getProfile,
} from "../api/StockApi";
import { useNavigate, Link } from "react-router-dom";
import { loadAccount, trade } from "../api/AccountApi";
import { Form } from "react-bootstrap";
import { Toaster, toast } from "sonner";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useAccount } from "../context/AccountContext";

/**
 * Trade page that fetches the user’s first account, supports symbol
 * search/autocomplete, and submits buy/sell orders against the backend.
 */
const Trade = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [holdings, setHoldings] = useState([]);
  const [cash, setCash] = useState(0);
  const timer = useRef(null);
  const navigate = useNavigate();
  const [, setStockName] = useState("");
  const [, setPrice] = useState(0);
  const [, setMetrics] = useState(null);
  const [, setHistory] = useState([]);
  const [, setProfile] = useState(null);

  const { selectedAccountId, selectedAccount, refreshAccounts } = useAccount();

  const [shares, setShares] = useState(0);
  const [ticker, setTicker] = useState("");
  const [orderType, setOrderType] = useState("buy");
  const [selectedStock, setSelectedStock] = useState(null);
  const [reviewButtonStatus, setReviewButtonStatus] = useState("idle"); // idle | notEnoughBP | notEnoughShares | missingRequiredInput | error

  const [dayChange, setDayChange] = useState("positive");
  const [dayChangeDollars, setDayChangeDollars] = useState(0);
  const [dayChangePercent, setDayChangePercent] = useState(0);
  const [quote, setQuote] = useState([]);

  const formatUSD = (value) => {
    if (typeof value !== "number" || Number.isNaN(value)) {
      return "--";
    }
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPercent = (num) => {
    const roundedNum = Number(num).toFixed(2);
    let prefix = "";
    if (num >= 0) prefix = "+";
    return prefix + roundedNum + "%";
  };

  /**
   * When the selected account changes, load the latest balances/
   * holdings so both the order ticket and recent orders stay in sync.
   */
  useEffect(() => {
    console.log("useEffect triggered for accountId:", selectedAccountId);
    if (!selectedAccountId) return;
    loadAccount(selectedAccountId)
      .then((res) => {
        setHoldings(res.data.holdings || []);
        setCash(res.data.cash || 0);
        console.log("Loaded holdings:", res.data.holdings);
      })
      .catch((err) => console.error("Error loading account:", err))
      .finally(() => {
        console.log("Finished loading account");
      });
  }, [selectedAccountId]);

  /**
   * Debounce the symbol search box and populate autocomplete results.
   */
  useEffect(() => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    if (timer.current) clearTimeout(timer.current);
    // debounce
    timer.current = setTimeout(() => {
      searchBar(query)
        .then((res) => {
          // expected shape { count, result }
          setSuggestions((res.data && res.data.result) || []);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer.current);
  }, [query]);

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
    if (
      typeof quote?.d !== "number" ||
      Number.isNaN(quote.d) ||
      typeof quote?.dp !== "number" ||
      Number.isNaN(quote.dp)
    ) {
      setDayChange(null);
      setDayChangeDollars("--");
      setDayChangePercent("--");
      return;
    }

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
   * Navigate to the Stock page when a suggestion is clicked.
   */
  function selectSymbol(symbol) {
    setQuery("");
    setSuggestions([]);
    navigate(`/stocks/${symbol}`);
  }

  /**
   * If the user presses Enter inside the search box, jump to the first
   * suggestion to mimic brokerage search behavior.
   */
  function handleKeyDown(e) {
    if (e.key === "Enter" && suggestions.length > 0) {
      selectSymbol(suggestions[0].symbol);
    }
  }

  /**
   * Validates the order ticket, fetches a fresh quote, and posts the
   * trade to the backend. Alerts the user on validation or API errors.
   */
  async function handleOrderSubmit() {
    if (!ticker || shares <= 0 || !orderType) {
      setReviewButtonStatus("missingRequiredInput");
      setTimeout(() => setReviewButtonStatus("idle"), 1200);
      return;
    }
    if (!selectedAccountId) {
      setReviewButtonStatus("missingRequiredInput");
      setTimeout(() => setReviewButtonStatus("idle"), 1200);
      return;
    }

    const holdingShares =
      holdings.find((h) => h.stockTicker === ticker)?.shares || 0;
    if (orderType === "sell" && shares > Math.abs(holdingShares)) {
      setReviewButtonStatus("notEnoughShares");
      setTimeout(() => setReviewButtonStatus("idle"), 1200);
      return;
    }

    try {
      const quoteRes = await getQuote(ticker);

      const price = quoteRes.data.c;
      const order = {
        action: orderType.toLowerCase(),
        ticker: ticker,
        shares: Number(shares),
        price: price,
      };

      if (orderType === "buy" && price * shares > cash) {
        setReviewButtonStatus("notEnoughBP");
        setTimeout(() => setReviewButtonStatus("idle"), 1200);
        return;
      }

      const res = await trade(selectedAccountId, order);
      console.log("Trade placed:", res.data, selectedAccountId);

      toast.success(
        `${
          orderType === "buy" ? "Bought" : "Sold"
        } ${shares} ${ticker.toUpperCase()} @ ${formatUSD(price)}`
      );
      refreshAccounts();

      loadAccount(selectedAccountId)
        .then((res) => {
          setHoldings(res.data.holdings || []);
          setCash(res.data.cash || 0);
        })
        .catch((err) => console.error(err));

      setTicker("");
      setShares(0);
      setOrderType("buy");
      setSelectedStock(null);
      setReviewButtonStatus("idle");
    } catch (error) {
      console.error("Trade failed:", error);
      setReviewButtonStatus("error");
      setTimeout(() => setReviewButtonStatus("idle"), 1200);
      toast.error("Failed to place order.");
    }
  }

  const estimatedCost =
    selectedStock?.price && shares > 0 ? selectedStock.price * shares : null;

  return (
    <div
      className="min-vh-100"
      style={{
        background:
          "radial-gradient(160% 140% at 80% 0%, rgba(92,99,255,0.12), transparent 40%), radial-gradient(140% 120% at 10% 80%, rgba(14,165,233,0.12), transparent 45%), linear-gradient(135deg, #0b0f1e 0%, #05060d 100%)",
        color: "#e7ecf7",
      }}
    >
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
      <div className="container-xl py-4 d-flex flex-column gap-3">
        <div
          className="p-4 p-md-5"
          style={{
            background: "rgba(13, 17, 38, 0.82)",
            borderRadius: "24px",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 30px 70px rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(14px)",
          }}
        >
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
            <div>
              <h1 className="mb-1 text-light">Quick Trade</h1>
              <p className="mb-0" style={{ color: "#aeb8de" }}>
                Pull a live quote, set number of shares, and place a buy or sell
                in seconds.
              </p>
            </div>
            {selectedAccount && (
                <div
                  className="fw-medium mb-3"
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

          <div className="row g-3">
            <div className="col-12 col-lg-8">
              <div
                className="p-3 p-md-4 h-100 d-flex flex-column"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "18px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="mb-3">
                  <div
                    className="text-uppercase small mb-2"
                    style={{
                      letterSpacing: "0.16em",
                      color: "rgba(232,237,255,0.65)",
                    }}
                  >
                    Symbol search
                  </div>
                  <div className="position-relative">
                    <div
                      className="nav-search p-2"
                      style={{ borderRadius: "12px" }}
                    >
                      <div className="input-group">
                        <span className="input-group-text">
                          <Search size={16} />
                        </span>
                        <input
                          type="text"
                          className="form-control trade-search-input"
                          placeholder="Please Enter Stock"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                          onKeyDown={handleKeyDown}
                          aria-autocomplete="list"
                        />
                      </div>
                    </div>

                    {query && suggestions && suggestions.length > 0 && (
                      <ul
                        className="list-group position-absolute w-100 mt-1 search-suggestions"
                        style={{ zIndex: 2000 }}
                      >
                        {suggestions.slice(0, 6).map((s) => (
                          <li
                            key={s.symbol}
                            className="list-group-item list-group-item-action py-3"
                            style={{ cursor: "pointer" }}
                            onClick={async () => {
                              try {
                                const quoteRes = await getQuote(s.symbol);
                                const priceVal = quoteRes.data.c;

                                setTicker(s.symbol);
                                setQuote(quoteRes.data);
                                setSelectedStock({
                                  symbol: s.symbol,
                                  name: s.description,
                                  price: priceVal,
                                });
                                setQuery("");
                                setSuggestions([]);
                              } catch (error) {
                                console.error("Failed to fetch quote:", error);
                                toast.error(
                                  "Failed to fetch quote for selected symbol."
                                );
                              }
                            }}
                          >
                            <strong>{s.symbol}</strong>{" "}
                            <span className="text-muted">{s.description}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    {query && loading && (
                      <div className="small text-light mt-1">Searching...</div>
                    )}
                  </div>
                </div>

                {selectedStock && (
                  <>
                    <div
                      className="p-3 rounded-3 mb-3 popular-card"
                      style={{ background: "rgba(255,255,255,0.04)" }}
                    >
                      <Link
                        key={selectedStock.symbol}
                        to={`/stocks/${selectedStock.symbol}`}
                        className="text-decoration-none"
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-bold text-light">
                              {selectedStock.symbol}
                            </div>
                            <div style={{ color: "#aeb8de" }}>
                              {selectedStock.name}
                            </div>
                          </div>
                          <div className="text-end">
                            <div className="fw-semibold text-light fs-4">
                              {formatUSD(selectedStock.price)}
                            </div>
                            {typeof quote?.dp === "number" &&
                              typeof quote?.d === "number" && (
                                <div className="d-flex justify-content-end gap-2 mt-1 fw-semibold">
                                  <span
                                    className="badge rounded-pill d-inline-flex align-items-center gap-1"
                                    style={{
                                      background:
                                        dayChange === "positive"
                                          ? "rgba(34,197,94,0.15)"
                                          : "rgba(239,68,68,0.15)",
                                      color:
                                        dayChange === "positive"
                                          ? "#22c55e"
                                          : "#ef4444",
                                    }}
                                  >
                                    {dayChange === "positive" ? (
                                      <ArrowUpRight size={12} />
                                    ) : (
                                      <ArrowDownRight size={12} />
                                    )}{" "}
                                    {dayChangePercent}
                                  </span>
                                  <span
                                    className="badge rounded-pill"
                                    style={{
                                      background:
                                        dayChange === "positive"
                                          ? "rgba(34,197,94,0.15)"
                                          : "rgba(239,68,68,0.15)",
                                      color:
                                        dayChange === "positive"
                                          ? "#22c55e"
                                          : "#ef4444",
                                    }}
                                  >
                                    {dayChangeDollars}
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      </Link>
                    </div>

                    <div className="d-flex align-items-center gap-5 mt-3 mb-3">
                      <div className="d-flex flex-fill gap-2">
                        <button
                          className="btn btn-sm fw-semibold text-white"
                          style={{
                            width: "40%",
                            borderRadius: "10px",
                            background:
                              orderType === "buy"
                                ? "linear-gradient(135deg, #22c55e, #0ea5e9)"
                                : "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: orderType === "buy" ? "#0b1023" : "#e7ecf7",
                            padding: "5px 5px",
                          }}
                          onClick={() => setOrderType("buy")}
                        >
                          Buy
                        </button>
                        <button
                          className="btn btn-sm fw-semibold text-white"
                          style={{
                            width: "40%",
                            borderRadius: "10px",
                            background:
                              orderType === "sell"
                                ? "linear-gradient(135deg, #ef4444, #f97316)"
                                : "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.12)",
                            color: orderType === "sell" ? "#0b1023" : "#e7ecf7",
                            padding: "10px 12px",
                          }}
                          onClick={() => setOrderType("sell")}
                        >
                          Sell
                        </button>
                      </div>

                      <div
                        className="d-flex align-items-center gap-2"
                        style={{ minWidth: "220px" }}
                      >
                        <button
                          className="btn text-light"
                          style={{
                            borderRadius: "10px",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}
                          onClick={() =>
                            setShares((prev) =>
                              Math.max(0, (Number(prev) || 0) - 1)
                            )
                          }
                        >
                          <Minus size={16} />
                        </button>
                        <Form.Control
                          type="number"
                          className="no-spin text-center bg-transparent text-light trade-search-input"
                          style={{
                            borderRadius: "12px",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}
                          placeholder="Shares"
                          onChange={(e) => setShares(Number(e.target.value))}
                          onFocus={() => {
                            if (shares === 0) setShares("");
                          }}
                          onBlur={() => {
                            if (shares === "") setShares(0);
                          }}
                          value={shares}
                        />
                        <button
                          className="btn text-light"
                          style={{
                            borderRadius: "10px",
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}
                          onClick={() =>
                            setShares((prev) => (Number(prev) || 0) + 1)
                          }
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    <div
                      className="d-flex justify-content-between align-items-center mb-3"
                      style={{ color: "#cdd7ff" }}
                    >
                      <div>Order type</div>
                      <span className="pill-ghost">Market</span>
                    </div>

                    <div
                      className="d-flex justify-content-between align-items-center mb-3"
                      style={{ color: "#cdd7ff" }}
                    >
                      <div>Estimated total</div>
                      <div className="fw-semibold text-light">
                        {estimatedCost ? formatUSD(estimatedCost) : "--"}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between gap-5 mt-4">
                      <button
                        className="btn text-light"
                        style={{
                          borderRadius: "12px",
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                        }}
                        onClick={() => {
                          setTicker("");
                          setShares(0);
                          setOrderType("buy");
                          setSelectedStock(null);
                          setQuote([]);
                          toast.info("Form reset");
                        }}
                      >
                        <RefreshCcw size={16} className="me-1" /> Reset
                      </button>
                      <Motion.button
                        whileTap={{ scale: 0.97 }}
                        className="btn fw-semibold text-white px-4 py-2"
                        style={{
                          width: "40%",
                          borderRadius: "12px",
                          background: {
                            idle: "linear-gradient(135deg, #22c55e, #0ea5e9)",
                            notEnoughBP:
                              "linear-gradient(135deg, #ef4444, #f97316)",
                            notEnoughShares:
                              "linear-gradient(135deg, #ef4444, #f97316)",
                            missingRequiredInput:
                              "linear-gradient(135deg, #ef4444, #f97316)",
                            error: "linear-gradient(135deg, #ef4444, #f97316)",
                          }[reviewButtonStatus],
                          border: "none",
                          boxShadow: "0 14px 40px rgba(14,165,233,0.25)",
                        }}
                        onClick={handleOrderSubmit}
                      >
                        <AnimatePresence mode="wait">
                          <Motion.span
                            key={reviewButtonStatus}
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: 1,
                              transition: { duration: 0.12 },
                            }}
                            exit={{
                              opacity: 0,
                              transition: { duration: 0.12 },
                            }}
                            className="d-inline-flex align-items-center"
                          >
                            {reviewButtonStatus === "idle"
                              ? "Submit order"
                              : reviewButtonStatus === "notEnoughBP"
                              ? "Not enough cash"
                              : reviewButtonStatus === "notEnoughShares"
                              ? "Not enough shares"
                              : reviewButtonStatus === "error"
                              ? "Server Error"
                              : "Enter details"}
                            {reviewButtonStatus === "idle" && (
                              <ArrowRightCircle className="ms-2" size={16} />
                            )}
                          </Motion.span>
                        </AnimatePresence>
                      </Motion.button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="col-12 col-lg-4">
              <div
                className="p-3 p-md-4 h-100"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  borderRadius: "18px",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div
                  className="text-uppercase small mb-2"
                  style={{
                    letterSpacing: "0.16em",
                    color: "rgba(232,237,255,0.65)",
                  }}
                >
                  Recent Acquisitions
                </div>
                <div className="d-grid gap-2">
                  {holdings && holdings.length > 0 ? (
                    [...holdings]
                      .reverse()
                      .slice(0, 5)
                      .map((holding) => (
                        <Link
                          key={holding.stockTicker}
                          to={`/stocks/${holding.stockTicker}`}
                          className="text-decoration-none popular-card p-3 rounded-3 d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <div className="fw-bold text-light">
                              {holding.stockTicker}
                            </div>
                            <div style={{ color: "#aeb8de" }}>
                              {holding.shares} shares
                            </div>
                          </div>
                          <div className="d-flex gap-2">
                            <button
                              className="btn btn-sm text-light"
                              style={{
                                borderRadius: "10px",
                                background:
                                  "linear-gradient(135deg, #22c55e, #0ea5e9)",
                                border: "none",
                              }}
                              onClick={async (e) => {
                                e.preventDefault();
                                setTicker(holding.stockTicker);
                                setShares(1);
                                setOrderType("buy");
                                try {
                                  const quoteRes = await getQuote(
                                    holding.stockTicker
                                  );
                                  const searchResult = await search(
                                    holding.stockTicker
                                  );
                                  setQuote(quoteRes.data);
                                  setSelectedStock({
                                    symbol: holding.stockTicker,
                                    name: searchResult.data.description,
                                    price: quoteRes.data.c,
                                  });
                                } catch (error) {
                                  console.error(
                                    "Failed to fetch quote when buying holding:",
                                    error
                                  );
                                  setSelectedStock({
                                    symbol: holding.stockTicker,
                                    name: holding.stockTicker,
                                    price: holding.averagePrice,
                                  });
                                }
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              Buy
                            </button>
                            <button
                              className="btn btn-sm text-light"
                              style={{
                                borderRadius: "10px",
                                background:
                                  "linear-gradient(135deg, #ef4444, #f97316)",
                                border: "none",
                              }}
                              onClick={async (e) => {
                                e.preventDefault();
                                setTicker(holding.stockTicker);
                                setShares(Math.abs(holding.shares));
                                setOrderType("sell");
                                try {
                                  const quoteRes = await getQuote(
                                    holding.stockTicker
                                  );
                                  setQuote(quoteRes.data);
                                  const searchResult = await search(
                                    holding.stockTicker
                                  );
                                  setSelectedStock({
                                    symbol: holding.stockTicker,
                                    name: searchResult.data.description,
                                    price: quoteRes.data.c,
                                  });
                                } catch (error) {
                                  console.error(
                                    "Failed to fetch quote when closing holding:",
                                    error
                                  );
                                  setSelectedStock({
                                    symbol: holding.stockTicker,
                                    name: holding.stockTicker,
                                    price: holding.averagePrice,
                                  });
                                }
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              Sell
                            </button>
                          </div>
                        </Link>
                      ))
                  ) : (
                    <div style={{ color: "#aeb8de" }}>No holdings yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trade;
