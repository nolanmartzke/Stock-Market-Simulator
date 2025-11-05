import React, { useState, useEffect, useRef } from 'react'
import { Search, PlusCircle, ArrowRightCircle } from 'lucide-react'
import { searchBar } from '../api/StockApi'
import { useNavigate } from 'react-router-dom'
import { loadAccount } from '../api/AccountApi'

const Trade = () => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [account, setAccount] = useState(null)
  const [accountLoading, setAccountLoading] = useState(false)
  const [holdings, setHoldings] = useState([])
  const timer = useRef(null)
  const navigate = useNavigate()

  let accountId = 0
  
  const authString = localStorage.getItem("auth")
    if (authString) {
        const auth = JSON.parse(authString);
        accountId = auth.id;
        console.log("Account ID:", accountId);
    }
  useEffect(() => {
    console.log("useEffect triggered for accountId:", accountId);
    if (!accountId) return;
    setAccountLoading(true)
    loadAccount(accountId)
      .then((res) => {
        setAccount(res.data)
        setHoldings(res.data.holdings || [])
        console.log("Loaded holdings:", res.data.holdings)
      })
      .catch((err) => console.error("Error loading account:", err))
      .finally(() => {
        console.log("Finished loading account");
        setAccountLoading(false)
      })
  }, [accountId])

  useEffect(() => {
    if (!query || query.length < 1) {
      setSuggestions([])
      setLoading(false)
      return
    }

    setLoading(true)
    if (timer.current) clearTimeout(timer.current)
    // debounce
    timer.current = setTimeout(() => {
      searchBar(query)
        .then((res) => {
          // expected shape { count, result }
          setSuggestions((res.data && res.data.result) || [])
        })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(timer.current)
  }, [query])

  function selectSymbol(symbol) {
    setQuery('')
    setSuggestions([])
    navigate(`/stocks/${symbol}`)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && suggestions.length > 0) {
      selectSymbol(suggestions[0].symbol)
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="container">
        <section className="card mb-4">
          <div className="card-body p-4">
            <h2 className="h4 fw-bold mb-3">Trade</h2>
            <p className="text-muted mb-3">Search for a ticker, view quote info and place a simulated order.</p>

            <div className="row g-3 align-items-center mb-4">
              <div className="col-auto flex-grow-1 position-relative">
                <div className="input-group">
                  <span className="input-group-text"><Search size={18} /></span>
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
                  <ul className="list-group position-absolute w-100 mt-1" style={{ zIndex: 2000 }}>
                    {suggestions.slice(0, 10).map((s) => (
                      <li
                        key={s.symbol}
                        className="list-group-item list-group-item-action"
                        style={{ cursor: 'pointer' }}
                        onClick={() => selectSymbol(s.symbol)}
                      >
                        <strong>{s.symbol}</strong> <span className="text-muted">{s.description}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {query && loading && <div className="small text-muted mt-1">Searching...</div>}
              </div>
              <div className="col-auto">
                <button className="btn btn-primary d-flex align-items-center">
                  <PlusCircle className="me-2" size={16} /> New Order
                </button>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="mb-3">Order Entry (placeholder)</h5>
                <p className="text-muted">Ticker, quantity, order type and confirm button will go here.</p>
                <div className="d-flex justify-content-end">
                  <button className="btn btn-outline-secondary me-2">Reset</button>
                  <button className="btn btn-danger d-flex align-items-center">Place Order <ArrowRightCircle className="ms-2" size={16} /></button>
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
                        <td>{holding.shares > 0 ? 'LONG' : 'SHORT'}</td>
                        <td>{holding.shares}</td>
                        <td>${holding.averagePrice?.toFixed(2) ?? '--'}</td>
                        <td>OPEN</td>
                        <td>
                          <button className="btn btn-sm btn-outline-secondary">Close</button>
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
  )
}

export default Trade
