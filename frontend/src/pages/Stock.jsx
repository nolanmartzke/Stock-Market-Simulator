import React, { useState } from 'react';
import { Search, PlusCircle, ArrowRightCircle } from 'lucide-react';
import { useNavigate, useParams, Link } from "react-router-dom"; 
import { Button, Container, Form, Row, Col, Card } from "react-bootstrap";


const Stock = () => { 
    const { ticker } = useParams(); 

    const [price, setPrice] = useState("$100.00");
    const [stock, setStock] = useState(ticker);

    const [cash, setCash] = useState("$20,000.00"); // user's cash balance
    const [mode, setMode] = useState("buy"); // buy or sell
    const [shares, setShares] = useState(0); // number of shares user wants to buy/sell


    // placeholder stats
    const stats = {
       "Earnings Per Share" : "$5",
       "Market Cap" : "$10 million",
       "Current Ratio" : "2.4",
    };
    
    const wantedStats = ["Earnings Per Share", "Market Cap"];
    const filteredStats = Object.entries(stats).filter(([key, value]) => wantedStats.includes(key));
    

    return ( 
        <div className="container-fluid py-4"> 
            
            {/* stock name and price */}
            <Container className="p-3">
                <Card className="bg-gradient shadow-lg border-0 p-3" style={{ backgroundColor: "#1F456E", color: "white", borderRadius: "10px" }}>
                    <Card.Body className="d-flex justify-content-between align-items-center" style={{ paddingLeft: "15%", paddingRight: "15%" }}>
                        <h1 className="mb-0 fw-semibold" style={{ fontSize: "3rem" }}>
                            {stock}
                        </h1>
                        <h2 className="mb-0 fw-semibold text-success" style={{ fontSize: "2.5rem" }}>
                            {price}
                        </h2>
                    </Card.Body>
                </Card>
            </Container>

            <Container>
                <Row>
                    {/* Graph placeholder */}
                    <Col xs={12} md={12} lg={8} className="p-3">
                        <Card className="bg-gradient shadow-lg border-0 h-100" style={{ backgroundColor: "#011936", color: "white", borderRadius: "10px" }}>
                            <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                                <h5 className="mb-4 fw-bold">Stock Graph</h5>
                                <div>
                                    [ Graph Placeholder ]
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    {/* Trading panel placeholder */}
                    <Col xs={12} md={12} lg={4} className="p-3">
                        <Card className="bg-gradient shadow-lg border-0 h-100 px-4" style={{ backgroundColor: "black", color: "white", borderRadius: "10px" }}>
                            <Card.Body>

                                <h2 className="text-center my-3">Trade</h2>

                                {/* Buy/Sell */}
                                <div className="d-flex w-100 rounded-pill px-1 py-1 text-white-50 fw-semibold bg-dark">
                                    <button type="button" onClick={() => setMode("buy")}
                                        className={`flex-fill py-1 rounded-pill border-0 transition ${
                                            mode === "buy"
                                                ? "bg-success text-white shadow shadow-primary-subtle"
                                                : "bg-transparent text-white-50"
                                            }`}
                                    >
                                        Buy {ticker}
                                    </button>
                                    <button type="button" onClick={() => setMode("sell")}
                                        className={`flex-fill py-1 rounded-pill border-0 transition ${
                                            mode === "sell" ? "bg-danger text-white shadow" : "bg-transparent text-white-50"}`}
                                    >
                                        Sell {ticker}
                                    </button>
                                </div>

                                {/* Order Type / Buy In */}
                                <div className="d-flex justify-content-between align-items-center my-4">
                                    <p>Order type</p>
                                    <Form.Select size="md w-auto"
                                    style={{ backgroundColor: "#1f1f1f", color: "white", border: "none" }}
                                    >
                                    <option>Market order</option>
                                    <option>Limit order</option>
                                    </Form.Select>
                                </div>
                                <div className="d-flex justify-content-between align-items-center my-4">
                                    <p>Buy In</p>
                                    <Form.Select size="md w-auto"
                                        style={{ backgroundColor: "#1f1f1f", color: "white", border: "none" }}
                                    >
                                        <option>Shares</option>
                                        <option>Dollars</option>
                                    </Form.Select>
                                </div>

                                {/* Shares/Dollars */}
                                <div className="d-flex justify-content-between align-items-center my-4">
                                    <p>Shares</p>
                                    <Form.Control size="sm" type="number" className="no-spin border-0 w-25"
                                        style={{ backgroundColor: "#1f1f1f", color: "white", textAlign: "right" }}
                                        onChange={(e) => setShares(Number(e.target.value))}
                                        onFocus={() => { if (shares === 0) setShares(""); }}
                                        onBlur={() => { if (shares === "") setShares(0); }} // 
                                        value={shares}
                                    />
                                </div>

                                {/* Market/Limit Price */}
                                <div className="d-flex justify-content-between align-items-center mt-2">
                                    <p style={{ color: "#4ade80" }}>Market Price</p> 
                                    <p>{price}</p>
                                </div>

                                <hr class="border border-secondary mb-3" />

                                {/* Estimated cost */}
                                <div className="d-flex justify-content-between mb-3">
                                    <h5 style={{ fontWeight: "600" }}>Estimated cost</h5>
                                    <h5>${(shares * parseFloat(price.replace(/[^0-9.]/g, ""))).toFixed(2)}</h5>
                                </div>

                                {/* Review Button */}
                                <Button
                                    variant="success"
                                    className="bg-success w-100 border-0 rounded-pill fw-bold text-white py-3"
                                >
                                    Review Order
                                </Button>

                                {/* Buying power */}
                                <div className="text-center mt-3">
                                    <small className="text-secondary">
                                        {cash} buying power available
                                    </small>
                                </div>

                                {/* Account Type */}
                                {/* <div className="d-flex justify-content-center mt-2">
                                    <small className="text-secondary">
                                        Individual investing ·{" "}
                                        <Form.Select size="sm" style={{ display: "inline-block", width: "auto", backgroundColor: "#121212", color: "white", border: "none"}}>
                                            <option>Individual</option>
                                            <option>Retirement</option>
                                        </Form.Select>
                                    </small>
                                </div> */}

                            </Card.Body>
                            </Card>
                    </Col>
                </Row>
            </Container>




            {/* stats */}
            <Container>
                <Row>
                    {
                        filteredStats.map(([name, value])  => (
                            <Col xs={12} s={12} md={6} lg={4} xl={3} key={name} className="p-3">
                                <Card className="bg-gradient shadow-lg border-0 text-center" style={{ backgroundColor: "#1F456E", color: "white", borderRadius: "10px" }}>
                                    <Card.Body className="p-5">
                                        <h4>{name}</h4>
                                        <hr class="border border-secondary mb-3" />
                                        <h3>{value}</h3>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))
                    }
                </Row>
            </Container>

        </div> 
    ) 
} 
    
    
    
export default Stock