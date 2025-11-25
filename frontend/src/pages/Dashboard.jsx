import React, { useEffect, useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";
import { Button, Container, Form, Row, Col, Card } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { loadDashboard } from "../api/AccountApi";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getQuote, getMetrics, search } from "../api/StockApi";
import NewsCard from "../components/NewsCard";

const Dashboard = () => {
  const { auth } = useAuth();

  const [portfolioValue, setPortfolioValue] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [cashBalance, setCashBalance] = useState(0);
  const [positions, setPositions] = useState([]);
  const [quotes, setQuotes] = useState({});

  const [dayChange, setDayChange] = useState("positive");
  const [dayChangeDollars, setDayChangeDollars] = useState("$0.00");
  const [dayChangePercent, setDayChangePercent] = useState("0%");

  useEffect(() => {
    if (!auth) return;

    setFirstName(auth.name.split(" ")[0]);

    loadDashboard(auth.id)
      .then((response) => response.data)
      .then((data) => {
        console.log(data);
        setCashBalance(data.totalCash);
        // filter so that do not show positions with 0 shares
        const filteredPositions = Object.fromEntries(
          Object.entries(data.totalStocks).filter(([key, value]) => value !== 0)
        );
        setPositions(filteredPositions);
      })
      .catch((err) => console.log(err));
  }, [auth]);

  useEffect(() => {
    if (!positions) return;

    for (const [ticker, numShares] of Object.entries(positions)) {
      if (!(ticker in quotes)) {
        getQuote(ticker)
          .then((response) => response.data)
          .then((data) => {
            console.log(data);
            setQuotes((prev) => ({ ...prev, [ticker]: data }));
          })
          .catch((err) => console.log(err));
      }
    }
  }, [positions]);

  useEffect(() => {
    if (!positions || !quotes) return;

    const cash = cashBalance;
    const equity = Object.entries(positions).reduce((sum, [ticker, shares]) => {
      const price = quotes[ticker]?.c ?? 0;
      return sum + shares * price;
    }, 0);

    setPortfolioValue(cash + equity);
  }, [positions, quotes]);

  const formatUSD = (num) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);

  const formatPercent = (num) => {
    const roundedNum = Number(num).toFixed(2);
    let prefix = "";
    if (num >= 0) prefix = "+";
    return prefix + roundedNum + "%";
  };

  const formattedPortfolioValue = formatUSD(portfolioValue);
  const formattedCashBalance = formatUSD(cashBalance);

  return (
    <Container className="py-4">
      {/* portfolio value + welcome */}
      <Container className="p-3">
        <Card
          className="bg-gradient shadow-lg border-0 p-3"
          style={{
            backgroundColor: "#000000ff",
            color: "white",
            borderRadius: "10px",
          }}
        >
          <Card.Body
            className="d-flex justify-content-between align-items-center"
            style={{ paddingLeft: "5%", paddingRight: "5%" }}
          >
            <div className="text-end px-4 py-3 rounded-4 border">
              <h2 className="mb-0 fw-semibold" style={{ fontSize: "2.5rem" }}>
                {formattedPortfolioValue}
              </h2>
              <div
                className={`d-inline-flex align-items-center gap-2 mt-2 px-2 py-1 rounded-pill fw-semibold ${
                  dayChange === "positive"
                    ? "bg-success-subtle text-success"
                    : "bg-danger-subtle text-danger"
                }`}
                style={{
                  boxShadow:
                    dayChange === "positive"
                      ? "0 10px 24px rgba(34, 197, 94, 0.25)"
                      : "0 10px 24px rgba(239, 68, 68, 0.25)",
                  fontSize: "0.8rem",
                }}
              >
                {dayChange === "positive" ? (
                  <ArrowUp size={16} />
                ) : (
                  <ArrowDown size={16} />
                )}
                <span>{dayChangeDollars}</span>
                <span className="opacity-75">({dayChangePercent})</span>
              </div>
            </div>
            <div className="flex-grow-1 text-center">
              <h1 className="mb-0 fw-semibold" style={{ fontSize: "3rem" }}>
                Welcome {firstName}!
              </h1>
            </div>
          </Card.Body>
        </Card>
      </Container>

      <Container>
        <Row>
          {/* Graph + Everything else */}
          <Col xs={12} md={12} xl={8} className="p-3">
            <Card
              className="bg-gradient shadow-lg border-0"
              style={{
                backgroundColor: "#011936",
                color: "white",
                borderRadius: "10px",
                minHeight: "500px",
              }}
            >
              <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                <h5 className="mb-4 fw-bold">Stock Graph</h5>
                <div>[ Graph Placeholder ]</div>
              </Card.Body>
            </Card>

            <Card
              className="my-4 bg-gradient shadow-lg border-0"
              style={{
                backgroundColor: "#183962ff",
                color: "white",
                borderRadius: "10px",
                minHeight: "300px",
              }}
            >
              <Card.Body className="d-flex flex-column align-items-center">
                <h5 className="py-4 fw-bold">Watchlist</h5>
              </Card.Body>
            </Card>

            <Card
              className="my-4 bg-gradient shadow-lg border-0 py-2"
              style={{
                backgroundColor: "#183962ff",
                color: "white",
                borderRadius: "10px",
                minHeight: "300px",
              }}
            >
              <Card.Body>
                <NewsCard
                  category="general"
                  pageSize={5}
                  title="Market News"
                  description="Latest market headlines and financial news."
                  wrapInCard={false}
                />
              </Card.Body>
            </Card>
          </Col>

          {/* Postions card */}
          <Col xs={12} md={12} xl={4} className="p-3">
            <Card
              className="bg-gradient shadow-lg border-0 px-2"
              style={{
                backgroundColor: "black",
                color: "white",
                borderRadius: "10px",
                minHeight: "600px",
              }}
            >
              <Card.Body>
                <h2 className="text-center my-3">Positions</h2>
                <hr className="border border-secondary mb-3" />
                <div className="py-1 d-flex justify-content-between px-2">
                  <h5>Cash</h5>
                  <h5>{formattedCashBalance}</h5>
                </div>
                <hr className="border border-secondary mb-1" />

                {positions && (
                  <div className="py-3 px-1">
                    {Object.entries(positions).map(([ticker, count]) => (
                      <Link
                        to={`/stocks/${ticker}`}
                        key={ticker}
                        className="text-decoration-none text-white"
                      >
                        <div className="position-card d-flex justify-content-between align-items-center rounded-3 py-2 px-3 mb-2">
                          <div>
                            <h5 className="fw-bold">{ticker}</h5>
                            <p
                              className="mb-1 ps-2"
                              style={{ fontSize: "0.9rem" }}
                            >
                              {" "}
                              {count} shares
                            </p>
                          </div>
                          <div>
                            <h5>
                              {quotes[ticker]
                                ? formatUSD(quotes[ticker].c)
                                : "$0.00"}
                            </h5>
                            <p
                              className="mb-0 text-end"
                              style={{
                                fontSize: "0.8rem",
                                color:
                                  quotes[ticker]?.dp > 0
                                    ? "#22C55E"
                                    : quotes[ticker]?.dp < 0
                                    ? "#EF4444"
                                    : "#9CA3AF",
                              }}
                            >
                              {quotes[ticker]
                                ? formatPercent(quotes[ticker].dp)
                                : "0.00%"}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Container>
  );
};

export default Dashboard;
