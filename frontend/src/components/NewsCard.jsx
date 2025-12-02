import React, { useEffect, useState } from "react";
import { getNews } from "../api/StockApi";

function formatDate(unix) {
  try {
    const d = new Date(unix * 1000);
    return d.toLocaleString();
  } catch {
    return "";
  }
}

export default function NewsCard({
  category = 'general',
  pageSize = 10,
  heading = 'Related News',
  subtitle = 'Top headlines related to popular stocks.',
  title,
  description,
  wrapInCard = true
}) {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    setNews([]) // clear existing so old articles don't flash during category switches
    setPage(1)
    getNews(category)
      .then((res) => {
        if (!mounted) return;
        // backend returns { count, result }
        const data = res.data && res.data.result ? res.data.result : [];
        setNews(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [category]);

  const total = news.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const cardHeading = heading || title || 'Related News';
  const cardSubtitle = subtitle || description || 'Top headlines related to popular stocks.';

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  const startIdx = (page - 1) * pageSize;
  const pageItems = news.slice(startIdx, startIdx + pageSize);

  const content = (
    <>


      {loading && <div className="text-center py-3">Loading news...</div>}
      {error && <div className="text-danger">Error loading news.</div>}

      {!loading && !error && pageItems.length === 0 && (
        <div className="text-muted">No news available.</div>
      )}

      {!loading && (
        <ul className="list-unstyled">
          {pageItems.map((item) => (
            <li key={item.id || item.url} className="mb-3">
              <a href={item.url} target="_blank" rel="noreferrer" className="d-flex text-decoration-none text-light">
                {item.image ? (
                  <img src={item.image} alt="thumb" style={{ width: 84, height: 56, objectFit: 'cover' }} className="me-3 rounded" />
                ) : (
                  <div style={{ width: 84, height: 56 }} className="me-3 bg-light rounded" />
                )}

                <div>
                  <div className="fw-semibold text-light">{item.headline}</div>
                  <div className="small" style={{ color: '#aeb8de' }}>{item.source} • {formatDate(item.datetime)}</div>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="small" style={{ color: "#aeb8de" }}>
            Showing {startIdx + 1}-{Math.min(startIdx + pageSize, total)} of {total}
          </div>
          <div className="d-flex align-items-center gap-2">
            <button
              className="btn btn-lg text-light"
              style={{
                borderRadius: "12px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              ‹
            </button>
            <button
              className="btn btn-lg text-light"
              style={{
                borderRadius: "12px",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.14)",
              }}
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </>
  );

  if (wrapInCard) {
    return (
      <div className="card">
        <div className="card-body">{content}</div>
      </div>
    );
  }

  return <div>{content}</div>;
}
