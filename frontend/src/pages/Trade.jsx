import React from 'react'
import { Search, PlusCircle, ArrowRightCircle } from 'lucide-react'

const Trade = () => {
  return (
    <div className="container-fluid py-4">
      <div className="container">
        <section className="card mb-4">
          <div className="card-body p-4">
            <h2 className="h4 fw-bold mb-3">Trade</h2>
            <p className="text-muted mb-3">Search for a ticker, view quote info and place a simulated order.</p>

            <div className="row g-3 align-items-center mb-4">
              <div className="col-auto flex-grow-1">
                <div className="input-group">
                  <span className="input-group-text"><Search size={18} /></span>
                  <input type="text" className="form-control" placeholder="Search symbol or company" />
                </div>
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
            <h3 className="h5 fw-semibold mb-3">Open Orders & Positions</h3>
            <p className="text-muted">This table will show simulated open orders and positions.</p>
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
                  <tr>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    <td>--</td>
                    <td><button className="btn btn-sm btn-outline-secondary">Cancel</button></td>
                  </tr>
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
