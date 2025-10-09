import React from "react";
import { Wallet, TrendingUp, ListChecks, ArrowRightCircle } from "lucide-react";

const Home = () => {
  const stats = [
    {
      value: "$125,430",
      label: "Portfolio Value",
      icon: Wallet,
      change: "1.2%",
      changeColor: "text-success",
    },
    {
      value: "+3.8%",
      label: "24h Change",
      icon: TrendingUp,
      change: "Since Yesterday",
      changeColor: "text-success",
    },
    {
      value: "42",
      label: "Open Positions",
      icon: ListChecks,
      change: "1.4x Avg. Vol.",
      changeColor: "text-primary",
    },
  ];

  return (
    <div className="container-fluid py-4">
      <div className="container">
        <section
          className="card shadow-lg mb-4"
          style={{ borderRadius: "20px" }}
        >
          <div className="card-body p-5">
            <h1 className="display-4 fw-bold text-dark mb-3">
              Welcome to Trade Wars
            </h1>
            <p className="lead text-muted mb-4">
              Track mock portfolios, place simulated trades, and explore market
              data in a risk-free environment.
            </p>

            {/* Quick Stats */}
            <div className="row g-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="col-md-4">
                    <div
                      className="card h-100 border-0 shadow-sm"
                      style={{ borderRadius: "16px" }}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <Icon className="text-success" size={32} />
                          <span
                            className={`badge bg-light ${stat.changeColor} border`}
                          >
                            {stat.change}
                          </span>
                        </div>
                        <div className="display-6 fw-bold text-dark mb-1">
                          {stat.value}
                        </div>
                        <div className="text-muted text-uppercase small fw-medium">
                          {stat.label}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="card shadow" style={{ borderRadius: "20px" }}>
          <div className="card-body p-4">
            <h3 className="h3 fw-semibold text-dark mb-4">Get Started</h3>
            <div className="list-group list-group-flush">
              <div className="list-group-item border-0 px-0">
                <div className="d-flex align-items-center">
                  <ArrowRightCircle className="text-danger me-3" size={20} />
                  <span className="fw-medium">
                    Create or import a mock portfolio
                  </span>
                </div>
              </div>
              <div className="list-group-item border-0 px-0">
                <div className="d-flex align-items-center">
                  <ArrowRightCircle className="text-danger me-3" size={20} />
                  <span className="fw-medium">
                    Search for stocks and place simulated orders
                  </span>
                </div>
              </div>
              <div className="list-group-item border-0 px-0">
                <div className="d-flex align-items-center">
                  <ArrowRightCircle className="text-danger me-3" size={20} />
                  <span className="fw-medium">
                    View detailed trade history and performance metrics
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
