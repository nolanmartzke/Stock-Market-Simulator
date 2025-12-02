import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/AccountApi";
import { getAccountTransactions } from "../api/TransactionApi";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "numeric",
  minute: "2-digit",
});

const relativeFormatter =
  typeof Intl !== "undefined" && Intl.RelativeTimeFormat
    ? new Intl.RelativeTimeFormat("en", { numeric: "auto" })
    : null;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

const shareFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

const styles = {
  page: {
    minHeight: "100vh",
    padding: "3rem clamp(1.25rem, 4vw, 4rem)",
    background:
      "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.9), transparent 50%), #f4f5f7",
    fontFamily:
      '"SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    color: "#050505",
  },
  panel: {
    maxWidth: 1100,
    margin: "0 auto",
    background: "rgba(255,255,255,0.92)",
    borderRadius: "30px",
    padding: "2.5rem clamp(1.5rem, 3vw, 3rem)",
    boxShadow: "0 30px 60px rgba(12, 12, 20, 0.12)",
    backdropFilter: "blur(20px)",
  },
  headerRow: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },
  eyebrow: {
    textTransform: "uppercase",
    letterSpacing: "0.35em",
    fontSize: "0.7rem",
    color: "#9a9aa3",
    marginBottom: "0.5rem",
  },
  title: {
    fontSize: "clamp(2.1rem, 4vw, 3.2rem)",
    margin: 0,
    fontWeight: 600,
    letterSpacing: "-0.01em",
  },
  subtitle: {
    margin: 0,
    color: "#5a5a62",
    maxWidth: 520,
    lineHeight: 1.5,
  },
  selectorGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    minWidth: 220,
  },
  label: {
    fontSize: "0.75rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#898995",
  },
  select: {
    borderRadius: "999px",
    padding: "0.85rem 1rem",
    border: "1px solid rgba(0,0,0,0.1)",
    fontFamily: "inherit",
    backgroundColor: "#fff",
    fontSize: "1rem",
  },
  alert: {
    marginBottom: "1.25rem",
    borderRadius: "16px",
    padding: "0.9rem 1rem",
    background: "rgba(255, 225, 225, 0.9)",
    color: "#b3261e",
    fontWeight: 500,
  },
  state: {
    textAlign: "center",
    padding: "2rem 1rem",
    color: "#6a6a72",
  },
  tableWrapper: {
    overflowX: "auto",
    marginTop: "1rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "auto",
  },
  th: {
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    fontSize: "0.72rem",
    color: "#9a9aa4",
    padding: "0 1rem 0.75rem 0",
    textAlign: "left",
  },
  thRight: {
    textTransform: "uppercase",
    letterSpacing: "0.15em",
    fontSize: "0.72rem",
    color: "#9a9aa4",
    padding: "0 1rem 0.75rem 1rem",
    textAlign: "right",
  },
  td: {
    padding: "1rem 1rem 1rem 0",
    borderTop: "1px solid rgba(15,15,20,0.08)",
    verticalAlign: "middle",
  },
  tdRight: {
    padding: "1rem 1rem",
    borderTop: "1px solid rgba(15,15,20,0.08)",
    verticalAlign: "middle",
    textAlign: "right",
  },
  tdLast: {
    padding: "1rem 0 1rem 4rem",
    borderTop: "1px solid rgba(15,15,20,0.08)",
    verticalAlign: "middle",
  },
  ticker: {
    fontWeight: 600,
    fontSize: "1.05rem",
    letterSpacing: "0.04em",
  },
  subtext: {
    fontSize: "0.84rem",
    color: "#8c8c95",
    marginTop: "0.15rem",
  },
  numeric: {
    fontVariantNumeric: "tabular-nums",
    textAlign: "right",
  },
  timestamp: {
    minWidth: 220,
  },
  pill: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "999px",
    padding: "0.35rem 0.9rem",
    fontWeight: 600,
    fontSize: "0.88rem",
    letterSpacing: "0.04em",
  },
};

const formatRelativeTime = (date) => {
  if (!relativeFormatter) {
    return dateFormatter.format(date);
  }

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);

  if (Math.abs(diffMinutes) < 60) {
    return relativeFormatter.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return relativeFormatter.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 7) {
    return relativeFormatter.format(diffDays, "day");
  }

  const diffWeeks = Math.round(diffDays / 7);
  return relativeFormatter.format(diffWeeks, "week");
};

const formatTimestampParts = (timestamp) => {
  if (!timestamp) return { primary: "—", secondary: "" };
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return { primary: timestamp, secondary: "" };
  }

  return {
    primary: `${dateFormatter.format(date)} · ${timeFormatter.format(date)}`,
    secondary: formatRelativeTime(date),
  };
};

const formatActionLabel = (action) => {
  if (!action) return "—";
  const normalized = action.toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const formatCurrency = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue)
    ? currencyFormatter.format(numericValue)
    : value ?? "—";
};

const formatShares = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue)
    ? shareFormatter.format(numericValue)
    : value ?? "—";
};

const getPillStyle = (action) => {
  const base = styles.pill;
  if (!action) {
    return {
      ...base,
      backgroundColor: "rgba(15,15,20,0.08)",
      color: "#2f2f36",
    };
  }
  const lowered = action.toLowerCase();
  if (lowered === "buy") {
    return {
      ...base,
      backgroundColor: "rgba(25, 206, 123, 0.15)",
      color: "#056647",
    };
  }
  if (lowered === "sell") {
    return {
      ...base,
      backgroundColor: "rgba(255, 107, 107, 0.2)",
      color: "#b3261e",
    };
  }
  return { ...base, backgroundColor: "rgba(15,15,20,0.08)", color: "#2f2f36" };
};

export default function History() {
  const { auth } = useAuth();
  const userId = auth?.id;

  const [accounts, setAccounts] = useState([]);
  const [accountId, setAccountId] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    api
      .get("", { params: { userId } })
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setAccounts(list);
        setAccountId((current) => {
          if ((current ?? null) !== null || !list.length) {
            return current;
          }
          return list[0]?.id ?? null;
        });
      })
      .catch((err) => {
        console.error("Accounts fetch failed", err);
        setError("Unable to load accounts.");
      });
  }, [userId]);

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

  const hasAccounts = accounts.length > 0;

  return (
    <div style={styles.page}>
      <div style={styles.panel}>
        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>Trade History</h1>
          </div>
          <div style={styles.selectorGroup}>
            <label htmlFor="history-account-select" style={styles.label}>
              Account
            </label>
            <select
              id="history-account-select"
              style={styles.select}
              value={accountId ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                setAccountId(value ? Number(value) : null);
              }}
              disabled={!hasAccounts || loading}
            >
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name || `Account #${account.id}`}
                </option>
              ))}
            </select>
            {!hasAccounts && (
              <small style={{ color: "#9a9aa4" }}>
                Link an account to see its moves.
              </small>
            )}
          </div>
        </div>

        {error && (
          <div style={styles.alert} role="alert">
            {error}
          </div>
        )}

        {!hasAccounts && (
          <div style={styles.state}>
            <p>You’re all clear.</p>
            <p>Add an account to start building a timeline.</p>
          </div>
        )}

        {hasAccounts && loading && (
          <div style={styles.state} role="status">
            Fetching your latest trades…
          </div>
        )}

        {hasAccounts && !loading && rows.length === 0 && (
          <div style={styles.state}>
            <p>No trades yet.</p>
            <p>Once you buy or sell, every detail appears here instantly.</p>
          </div>
        )}

        {hasAccounts && !loading && rows.length > 0 && (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Ticker</th>
                  <th style={styles.th}>Action</th>
                  <th style={styles.thRight}>Shares</th>
                  <th style={styles.thRight}>Price</th>
                  <th style={{ ...styles.th, padding: "0 0 0.75rem 4rem" }}>
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((tx, index) => {
                  const timestampParts = formatTimestampParts(tx.timestamp);
                  const key =
                    tx.id ?? `${tx.stockTicker}-${tx.timestamp}-${index}`;

                  return (
                    <tr key={key}>
                      <td style={styles.td}>
                        <div style={styles.ticker}>{tx.stockTicker || "—"}</div>
                        <div style={styles.subtext}>
                          {tx.id ? `Order #${tx.id}` : "Pending reference"}
                        </div>
                      </td>
                      <td style={styles.td}>
                        <span style={getPillStyle(tx.action)}>
                          {formatActionLabel(tx.action)}
                        </span>
                      </td>
                      <td
                        style={{
                          ...styles.tdRight,
                          ...styles.numeric,
                        }}
                      >
                        {formatShares(tx.shares)}
                      </td>
                      <td
                        style={{
                          ...styles.tdRight,
                          ...styles.numeric,
                        }}
                      >
                        {formatCurrency(tx.price)}
                      </td>
                      <td
                        style={{
                          ...styles.tdLast,
                          ...styles.timestamp,
                        }}
                      >
                        <span>{timestampParts.primary}</span>
                        {timestampParts.secondary && (
                          <div style={styles.subtext}>
                            {timestampParts.secondary}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
