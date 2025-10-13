import React from 'react'
import { Trophy } from 'lucide-react'

const Leaderboard = () => {
  return (
    <div className="container-fluid py-4">
      <div className="container">
        <section className="card mb-4">
          <div className="card-body p-4">
            <h2 className="h4 fw-bold mb-3"><Trophy className="me-2 text-warning" size={20} />Leaderboard</h2>
            <p className="text-muted mb-3">Top performing mock portfolios and users (placeholder).</p>

            <div className="list-group">
              <div className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold">User123</div>
                  <div className="text-muted small">Portfolio value: $150,000</div>
                </div>
                <div className="fw-semibold">#1</div>
              </div>
              <div className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold">TraderJane</div>
                  <div className="text-muted small">Portfolio value: $143,200</div>
                </div>
                <div className="fw-semibold">#2</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Leaderboard
