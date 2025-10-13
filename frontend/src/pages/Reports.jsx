import React from 'react'
import { LineChart, DollarSign } from 'lucide-react'

const Reports = () => {
  return (
    <div className="container-fluid py-4">
      <div className="container">
        <section className="card mb-4">
          <div className="card-body p-4">
            <h2 className="h4 fw-bold mb-3"><LineChart className="me-2" size={20} />Reports</h2>
            <p className="text-muted mb-3">Portfolio performance summaries and visualizations (placeholder).</p>

            <div className="row g-4">
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="fw-semibold">Performance</h5>
                    <p className="text-muted small">Graph and summary metrics go here.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card h-100">
                  <div className="card-body">
                    <h5 className="fw-semibold">Holdings</h5>
                    <p className="text-muted small">Snapshot of current holdings and allocation.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Reports
