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
  category = "general",
  pageSize = 10,
  title = "Related News",
  description = "Top headlines related to popular stocks.",
  wrapInCard = true,
}) {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
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

  useEffect(() => {
    if (page > totalPages) setPage(1)
  }, [totalPages, page])

  const startIdx = (page - 1) * pageSize;
  const pageItems = news.slice(startIdx, startIdx + pageSize);

  const content = (
    <>
      {title && <h5 className="card-title">{title}</h5>}
      {description && <p className="text-muted">{description}</p>}

      {loading && <div className="text-center py-3">Loading news...</div>}
      {error && <div className="text-danger">Error loading news.</div>}

      {!loading && !error && pageItems.length === 0 && (
        <div className="text-muted">No news available.</div>
      )}

      <ul className="list-unstyled">
        {pageItems.map((item) => (
          <li key={item.id} className="mb-3">
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className={`d-flex text-decoration-none ${
                wrapInCard ? "text-dark" : ""
              }`}
              style={wrapInCard ? {} : { color: "white" }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt="thumb"
                  style={{ width: 84, height: 56, objectFit: "cover" }}
                  className="me-3 rounded"
                />
              ) : (
                <div
                  style={{ width: 84, height: 56 }}
                  className="me-3 bg-light rounded"
                />
              )}

              <div>
                <div className="fw-semibold">{item.headline}</div>
                <div className="text-muted small">
                  {item.source} • {formatDate(item.datetime)}
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-2">
          <div className="small text-muted">
            Showing {startIdx + 1}-{Math.min(startIdx + pageSize, total)} of{" "}
            {total}
          </div>
          <div>
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </button>
                </li>
                {/* show up to 5 page buttons centered around current page */}
                {Array.from({ length: totalPages }).map((_, i) => {
                  const p = i + 1;
                  // only render nearby pages to avoid long lists
                  if (Math.abs(p - page) > 2 && p !== 1 && p !== totalPages)
                    return null;
                  return (
                    <li
                      key={p}
                      className={`page-item ${p === page ? "active" : ""}`}
                    >
                      <button className="page-link" onClick={() => setPage(p)}>
                        {p}
                      </button>
                    </li>
                  );
                })}
                <li
                  className={`page-item ${
                    page === totalPages ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );

  if (wrapInCard) {
    return (
      <div>
        <div className="card">
          <div className="card-body">{content}</div>
        </div>
      </div>
    );
  }

  return <div>{content}</div>;
}
