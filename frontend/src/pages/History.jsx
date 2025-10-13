import React from 'react'
import { Clock, List } from 'lucide-react'

const History = () => {
  const entries = [
    { id: 1, time: '2025-10-01 10:02', symbol: 'AAPL', action: 'Buy', qty: 10, price: '$150.00' },
    { id: 2, time: '2025-10-03 14:12', symbol: 'TSLA', action: 'Sell', qty: 5, price: '$230.00' },
  ]

  return (
    <div className="container-fluid py-4">
      <div className="container">
        <section className="card mb-4">
          <div className="card-body p-4">
            <h2 className="h4 fw-bold mb-2">Trade History</h2>
            <p className="text-muted mb-3">A chronological list of executed simulated trades.</p>

            <div className="list-group">
              {entries.map(e => (
                <div key={e.id} className="list-group-item d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-semibold">{e.symbol} — {e.action} {e.qty} @ {e.price}</div>
                    <div className="text-muted small">{e.time}</div>
                  </div>
                  <div className="text-muted small">Details</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default History
