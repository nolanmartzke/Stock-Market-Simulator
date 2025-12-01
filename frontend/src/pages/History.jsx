// Added for read-only Trade History
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/AccountApi"; // shared axios (baseURL: /api/accounts) // Added for read-only Trade History
import { getAccountTransactions } from "../api/TransactionApi";

export default function History() {
  const { auth } = useAuth(); // localStorage → { id, ... }
  const userId = auth?.id;

  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load user's accounts (existing: GET /api/accounts?userId={id})
  useEffect(() => {
    if (!userId) return;
    // IMPORTANT: use '' so baseURL '/api/accounts' + '' → '/api/accounts'
    api
      .get("", { params: { userId } })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setAccounts(list);
        setAccountId((prev) => prev ?? (list[0]?.id ?? null));
      })
      .catch((err) => {
        console.error("Accounts fetch failed", err);
        setError("Unable to load accounts.");
      });
  }, [userId]);

  // Load trade history for selected account (existing: GET /api/transactions?accountId=)
  useEffect(() => {
    if (!accountId) return;
    setLoading(true);
    setError(null);
    getAccountTransactions(accountId, { page: 0, size: 20 })
      .then((res) => {
        const data = res.data;
        setRows(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Transactions fetch failed", err);
        setError("Unable to load trade history.");
        setRows([]);
      })
      .finally(() => setLoading(false));
  }, [accountId]);

  return (
    <div className="container py-3">
      <h2 className="mb-3">Trade History</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Account selector */}
      <div className="mb-3">
        <label className="form-label">Account</label>
        <select
          className="form-select"
          value={accountId || ""}
          onChange={(e) => setAccountId(Number(e.target.value))}
          disabled={loading}
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name || `Account #${a.id}`}
            </option>
          ))}
        </select>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-3">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && rows.length === 0 && (
        <p className="text-muted">No trades yet.</p>
      )}

      {/* Trade history table */}
      {!loading && rows.length > 0 && (
        <div className="table-responsive">
          <table className="table table-striped table-sm align-middle">
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Action</th>
                <th>Shares</th>
                <th>Price</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((tx) => (
                <tr key={tx.id}>
                  <td>{tx.stockTicker}</td>
                  <td>{(tx.action || "").toUpperCase()}</td>
                  <td>{tx.shares}</td>
                  <td>{tx.price}</td>
                  <td>{tx.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
