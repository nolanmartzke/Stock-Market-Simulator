import React from 'react'
import { Zap } from 'lucide-react'

const GetStarted = () => {
  return (
    <div className="container-fluid py-4">
      <div className="container">
        <section className="card mb-4">
          <div className="card-body p-4">
            <h2 className="h4 fw-bold mb-3"><Zap className="me-2 text-danger" size={20} />Get Started</h2>
            <p className="text-muted mb-3">Short onboarding steps to create/import a portfolio and place your first simulated trade.</p>
            <ol>
              <li>Create or import a portfolio</li>
              <li>Search and add a few tickers</li>
              <li>Place your first simulated order</li>
            </ol>
          </div>
        </section>
      </div>
    </div>
  )
}

export default GetStarted
