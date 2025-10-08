import React from 'react'

export default function Home() {
  return (
    <main className="home">
      <section className="hero">
        <h2>Welcome to Trade Wars</h2>
        <p>Track mock portfolios, place simulated trades, and explore market data.</p>
        <div className="quick-stats">
          <div className="stat">
            <div className="value">$125,430</div>
            <div className="label">Portfolio Value</div>
          </div>
          <div className="stat">
            <div className="value">+3.8%</div>
            <div className="label">24h Change</div>
          </div>
          <div className="stat">
            <div className="value">42</div>
            <div className="label">Open Positions</div>
          </div>
        </div>
      </section>

      <section className="features">
        <h3>Get started</h3>
        <ul>
          <li>Create or import a portfolio</li>
          <li>Search for stocks and place simulated orders</li>
          <li>View trade history and performance</li>
        </ul>
      </section>
    </main>
  )
}
