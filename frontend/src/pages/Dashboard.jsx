import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button, Container, Form, Row, Col, Card } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";



const Dashboard = () => {

  const { auth } = useAuth();

  const [portfolioValue, setPortfolioValue] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [positions, setPotions] = useState([]);

  const [dayChange, setDayChange] = useState("positive");
  const [dayChangeDollars, setDayChangeDollars] = useState("$0.00");
  const [dayChangePercent, setDayChangePercent] = useState("0%");


  useEffect(() => {
    if (auth)
      setFirstName(auth.name.split(" ")[0]);
  }, [auth]);

  const formatUSD = (num) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
  }).format(num);

  const formattedPortfolioValue = formatUSD(portfolioValue);

  return (
    <Container className="py-4">

      {/* portfolio value + welcome */}
      <Container className="p-3">
          <Card className="bg-gradient shadow-lg border-0 p-3" style={{ backgroundColor: "#000000ff", color: "white", borderRadius: "10px" }}>
              <Card.Body className="d-flex justify-content-between align-items-center" style={{ paddingLeft: "5%", paddingRight: "5%" }}>
                  <div className="text-end px-4 py-3 rounded-4 border">
                      <h2 className="mb-0 fw-semibold" style={{ fontSize: "2.5rem" }}>
                          {formattedPortfolioValue}
                      </h2>
                      <div
                        className={`d-inline-flex align-items-center gap-2 mt-2 px-2 py-1 rounded-pill fw-semibold ${ dayChange === "positive" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"}`}
                        style={{ boxShadow: dayChange === "positive"? "0 10px 24px rgba(34, 197, 94, 0.25)" : "0 10px 24px rgba(239, 68, 68, 0.25)", fontSize: "0.8rem", }}
                      >
                        {dayChange === "positive" ? (<ArrowUp size={16} />) : (<ArrowDown size={16} />)}
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
            <Col xs={12} md={12} xl={7} className="p-3">
                <Card className="bg-gradient shadow-lg border-0" style={{ backgroundColor: "#011936", color: "white", borderRadius: "10px", minHeight: "450px" }}>
                    <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                        <h5 className="mb-4 fw-bold">Stock Graph</h5>
                        <div>
                            [ Graph Placeholder ]
                        </div>
                    </Card.Body>
                </Card>
                
                <Card className="my-4 bg-gradient shadow-lg border-0" style={{ backgroundColor: "#183962ff", color: "white", borderRadius: "10px", minHeight: "300px"}}>
                    <Card.Body className="d-flex flex-column align-items-center">
                        <h5 className="py-4 fw-bold">Watchlist</h5>
                    </Card.Body>
                </Card>

                <Card className="my-4 bg-gradient shadow-lg border-0 py-2" style={{ backgroundColor: "#183962ff", color: "white", borderRadius: "10px", minHeight: "300px" }}>
                    <Card.Body className="d-flex flex-column align-items-center">
                        <h5 className="py-4 fw-bold">Market News</h5>
                    </Card.Body>
                </Card>

            </Col>

            {/* Postions card */}
            <Col xs={12} md={12} xl={5} className="p-3">
                <Card className="bg-gradient shadow-lg border-0 px-4" style={{ backgroundColor: "black", color: "white", borderRadius: "10px", minHeight: "550px"}}>
                    <Card.Body>

                        <h2 className="text-center my-3">Positions</h2>





                    </Card.Body>
                    </Card>
            </Col>
        </Row>
      </Container>

    </Container>
  )
}

export default Dashboard
