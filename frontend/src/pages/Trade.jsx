import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ArrowRightCircle,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { searchBar, getQuote, search, getMetrics, getHistory, getProfile } from "../api/StockApi";
import { useNavigate } from "react-router-dom";
import api, { loadAccount, trade } from "../api/AccountApi";
import { Form } from "react-bootstrap";

/**
 * Trade page that fetches the user’s first account, supports symbol
 * search/autocomplete, and submits buy/sell orders against the backend.
 */
const Trade = () => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [holdings, setHoldings] = useState([]);
  const timer = useRef(null);
  const navigate = useNavigate();
  const [, setStockName] = useState("");
  const [, setPrice] = useState(0);
  const [, setMetrics] = useState(null);
  const [, setHistory] = useState([]);
  const [, setProfile] = useState(null);

  const [accountId, setAccountId] = useState(null);

  const [shares, setShares] = useState(0);
  const [ticker, setTicker] = useState("");
  const [orderType, setOrderType] = useState("buy");
  const [selectedStock, setSelectedStock] = useState(null);

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

  /** 
   * On mount, grab the authenticated user from localStorage and fetch
   * the first account so subsequent trades know which ID to target.
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

  /**
   * When the selected account changes, load the latest balances/
   * holdings so both the order ticket and recent orders stay in sync.
   */
  useEffect(() => {
    console.log("useEffect triggered for accountId:", accountId);
    if (!accountId) return;
    loadAccount(accountId)
      .then((res) => {
        setHoldings(res.data.holdings || []);
        console.log("Loaded holdings:", res.data.holdings);
      })
      .catch((err) => console.error("Error loading account:", err))
      .finally(() => {
        console.log("Finished loading account");
      });
  }, [accountId]);

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
        setDayChangePercent(`+${quote.dp}%`);
      } else {
        setDayChange("negative");
        setDayChangeDollars(`${formatUSD(quote.d)}`);
        setDayChangePercent(`${quote.dp}%`);
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
      alert("Please fill in all order details.");
      return;
    }
    if (!accountId) {
      alert("No account selected!");
      return;
    }

    const quoteRes = await getQuote(ticker);
    const price = quoteRes.data.c;

    try {
      const order = {
        action: orderType.toLowerCase(),
        ticker: ticker,
        shares: Number(shares),
        price: price,
      };

      console.log("Submitting order:", {
        action: orderType,
        ticker,
        shares,
        price
      });
      
      const res = await trade(accountId, order);
      console.log("Trade placed:", res.data, accountId);

      alert(
        `Successfully placed ${orderType.toUpperCase()} order for ${shares} shares of ${ticker.toUpperCase()}`
      );

      loadAccount(accountId)
        .then((res) => setHoldings(res.data.holdings || []))
        .catch(console.error);

      setTicker("");
      setShares(0);
      setOrderType("");
    } catch (error) {
      console.error("Trade failed:", error);
      alert(error.response?.data || "Failed to place order.");
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="container">
        <section className="card mb-4">
          <div className="card-body p-4">
            <h2 className="h4 fw-bold mb-3">Trade</h2>
            <p className="text-muted mb-3">
              Search for a stock here to begin placing an order.
            </p>

            <div className="row g-3 align-items-center mb-4">
              <div className="col-auto flex-grow-1 position-relative">
                <div className="input-group">
                  <span className="input-group-text">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search symbol or company"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    aria-autocomplete="list"
                  />
                </div>

                {query && suggestions && suggestions.length > 0 && (
                  <ul
                    className="list-group position-absolute w-100 mt-1"
                    style={{ zIndex: 2000 }}
                  >
                    {suggestions.slice(0, 6).map((s) => (
                      <li
                        key={s.symbol}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: "pointer" }}
                        onClick={async () => {
                          try {
                            const quoteRes = await getQuote(s.symbol);
                            const price = quoteRes.data.c;

                            setTicker(s.symbol);
                            setQuote(quoteRes.data);
                            setSelectedStock({
                              symbol: s.symbol,
                              name: s.description,
                              price: price,
                            });
                            setQuery("");
                            setSuggestions([]);
                          } catch (error) {
                            console.error("Failed to fetch quote:", error);
                            alert("Failed to fetch quote for selected symbol.");
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
                  <div className="small text-muted mt-1">Searching...</div>
                )}
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
              {selectedStock && (
                <div className="alert alert-info d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{selectedStock.symbol}</strong> - {selectedStock.name}
                  </div>
                  <div className="text-center">
                    <span
                      className={`fw-semibold d-block fs-3 ${
                        dayChange === "negative"
                          ? "text-danger"
                          : dayChange === "positive"
                          ? "text-success"
                          : "text-body"
                      }`}
                    >
                      ${selectedStock.price?.toFixed(2)}
                    </span>
                    {typeof quote?.dp === "number" &&
                      typeof quote?.d === "number" && (
                        <div className="d-flex justify-content-center gap-2 mt-2 fw-semibold">
                          <span
                            className={`badge rounded-pill d-inline-flex align-items-center gap-2 ${
                              dayChange === "positive"
                                ? "bg-success-subtle text-success"
                                : "bg-danger-subtle text-danger"
                            }`}
                            style={{ fontSize: "0.85rem" }}
                          >
                            {dayChange === "positive" ? (
                              <ArrowUpRight size={14} />
                            ) : (
                              <ArrowDownRight size={14} />
                            )}
                            {dayChangePercent}
                          </span>
                          <span
                            className={`badge rounded-pill ${
                              dayChange === "positive"
                                ? "bg-success-subtle text-success"
                                : "bg-danger-subtle text-danger"
                            }`}
                            style={{ fontSize: "0.85rem" }}
                          >
                            {dayChangeDollars}
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              )}
                <h5 className="mb-3">Order Information</h5>
                <div className="text-muted mb-2">Enter the number of shares to {orderType || "buy/sell"}:</div>
                <Form.Control
                  type="number"
                  className="mb-3"
                  placeholder="Quantity"
                  onChange={(e) => setShares(Number(e.target.value))}
                  onFocus={() => {
                    if (shares === 0) setShares("");
                  }}
                  onBlur={() => {
                    if (shares === "") setShares(0);
                  }}
                  value={shares}
                />
                {selectedStock && shares > 0 && (
                  <div className="text-muted mb-3">
                    Estimated cost: ${(selectedStock.price * shares).toFixed(2)}
                  </div>
                )}

                <div className="d-flex mb-3">
                  <button
                    className={`btn flex-fill me-2 ${
                      orderType === "buy" ? "btn-success" : "btn-outline-success"
                    }`}
                    onClick={() => setOrderType("buy")}
                  >
                    Buy
                  </button>
                  <button
                    className={`btn flex-fill ${
                      orderType === "sell" ? "btn-danger" : "btn-outline-danger"
                    }`}
                    onClick={() => setOrderType("sell")}
                  >
                    Sell
                  </button>
                </div>

                <div className="d-flex justify-content-end">
                  <button 
                    className="btn btn-outline-secondary me-2"
                    onClick={() => {
                      setTicker("");
                      setShares(0);
                      setOrderType("");
                    }}
                  >
                    Reset
                  </button>
                  <button 
                    className={`btn d-flex align-items-center ${
                      orderType === "buy" ? "btn-success" : "btn-danger"
                    }`}
                    onClick={handleOrderSubmit}
                  >
                    {orderType === "buy" ? "Buy" : "Sell"} {ticker || "Stock"}
                    <ArrowRightCircle className="ms-2" size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-body p-4">
            <h3 className="h5 fw-semibold mb-3">Recent Orders</h3>
            {/* Holdings display */}
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Side</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.length > 0 ? (
                    [...holdings]
                      .reverse()
                      .slice(0, 5)
                      .map((holding) => (
                        <tr key={holding.stockTicker}>
                          <td>{holding.stockTicker}</td>
                          <td>{holding.shares > 0 ? "LONG" : "SHORT"}</td>
                          <td>{holding.shares}</td>
                          <td>${holding.averagePrice?.toFixed(2) ?? "--"}</td>
                          <td>OPEN</td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={async () => {
                                setTicker(holding.stockTicker);
                                setShares(Math.abs(holding.shares));
                                setOrderType("sell");
                                try {
                                  const quoteRes = await getQuote(
                                    holding.stockTicker
                                  );
                                  setQuote(quoteRes.data);
                                  setSelectedStock({
                                    symbol: holding.stockTicker,
                                    name: holding.stockTicker,
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
                              Close
                            </button>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-muted text-center">
                        No holdings yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Trade;
