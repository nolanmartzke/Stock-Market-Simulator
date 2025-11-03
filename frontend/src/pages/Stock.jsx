import React, { useEffect, useState } from 'react';
import { Search, PlusCircle, ArrowRightCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useNavigate, useParams, Link } from "react-router-dom"; 
import { Button, Container, Form, Row, Col, Card } from "react-bootstrap";
import { getQuote, getMetrics, search, getHistory } from '../api/StockApi';


const Stock = () => { 
    const { query } = useParams(); 

    const [price, setPrice] = useState("$0");
    const [ticker, setTicker] = useState("");
    const stockTicker = (ticker || "").toUpperCase();
    const [stockName, setStockName] = useState("Loading...");
    const [metrics, setMetrics] = useState([]);
    const [quote, setQuote] = useState([]);

    const [history, setHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [range, setRange] = useState("2Y");

    const [dayChange, setDayChange] = useState("positive");
    const [dayChangeDollars, setDayChangeDollars] = useState(0);
    const [dayChangePercent, setDayChangePercent] = useState(0);

    const [cash, setCash] = useState("$20,000.00"); // user's cash balance

    const [mode, setMode] = useState("buy"); // buy or sell
    const [shares, setShares] = useState(0); // number of shares user wants to buy/sell

    useEffect(() => {
        search(query)
            .then(response => response.data)
            .then(data => {
                console.log(data);
                setStockName(data.description);
                setTicker(data.symbol);
                return data.symbol;
            })
            .then(ticker => {
                getQuote(ticker)
                    .then(response => response.data)
                    .then(data => {
                        console.log(data);
                        setPrice(data.c);
                        setQuote(data);
                    })
                    .catch(err => console.log(err));

                getMetrics(ticker)
                    .then(response => response.data)
                    .then(data => {
                        console.log(data);
                        setMetrics(data);
                    })
                    .catch(err => console.log(err));

                getHistory(ticker, "2Y")
                    .then(response => response.data)
                    .then(data => {
                        setHistory(data.results);
                    })
                    .catch(err => console.log(err));
            })
            .catch(err => console.log(err));
    }, [query]);

    useEffect(() => {
        if (quote.d >= 0){
            setDayChange("positive")
            setDayChangeDollars(`+${formatUSD(quote.d)}`)
            setDayChangePercent(`+${quote.dp}%`);
        }
        else{
            setDayChange("negative")
            setDayChangeDollars(`${formatUSD(quote.d)}`)
            setDayChangePercent(`${quote.dp}%`);
        }
    }, [quote]);

    useEffect(() => {
        let data = history.map(item => ({
            date: new Date(item.t).toISOString().split("T")[0], // format as "YYYY-MM-DD"
            price: item.c
        }));

        let cutoff = new Date();

        switch(range) {
            case "1Y":
                cutoff.setFullYear(cutoff.getFullYear() - 1);
                break;
            case "YTD":
                cutoff = new Date(cutoff.getFullYear(), 0, 1);
                break;
            case "3M":
                cutoff.setMonth(cutoff.getMonth() - 3);
                break;
            case "1M":
                cutoff.setMonth(cutoff.getMonth() - 1);
                break;
            case "1W":
                cutoff.setDate(cutoff.getDate() - 7);
                break;
            default:
                cutoff = null;
        }

        if (cutoff)
            data = data.filter(item => new Date(item.date) >= cutoff);

        console.log(data)

        setFilteredHistory(data);
    }, [history,range]);

    const formatUSD = (num) =>
        new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
    }).format(num);

    const formattedPrice = formatUSD(price);
    const estimatedCost = (shares * price).toFixed(2);
    const estimatedCostDollars = formatUSD(estimatedCost);

    return ( 
        <div className="container-fluid py-4"> 
            
            {/* stock name and price */}
            <Container className="p-3">
                <Card className="bg-gradient shadow-lg border-0 p-3" style={{ backgroundColor: "#01497c", color: "white", borderRadius: "10px" }}>
                    <Card.Body className="d-flex justify-content-between align-items-center" style={{ paddingLeft: "5%", paddingRight: "5%" }}>

                        <div
                            className="text-end px-4 py-3 rounded-4 border"
                            style={{
                                background: dayChange === "positive" ? "linear-gradient(135deg, rgba(34, 197, 94, 0.55), rgba(34, 197, 94, 0.35))" : "linear-gradient(135deg, rgba(248, 113, 113, 0.55), rgba(248, 113, 113, 0.35))",
                                borderColor: dayChange === "positive" ? "rgba(22, 163, 74, 0.25)" : "rgba(220, 38, 38, 0.25)",
                                boxShadow: dayChange === "positive" ? "0 14px 30px rgba(22, 163, 74, 0.18)" : "0 14px 30px rgba(220, 38, 38, 0.18)",
                            }}
                        >
                            <h2 className="mb-0 fw-semibold" style={{ fontSize: "2.5rem" }}>
                                {formattedPrice}
                            </h2>
                            <div
                                className={`d-inline-flex align-items-center gap-2 mt-2 px-3 py-1 rounded-pill fw-semibold ${
                                    dayChange === "positive" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
                                }`}
                                style={{
                                    boxShadow: dayChange === "positive"? "0 10px 24px rgba(34, 197, 94, 0.25)" : "0 10px 24px rgba(239, 68, 68, 0.25)",
                                }}
                            >
                                <span className={`d-inline-flex align-items-center justify-content-center rounded-circle border ${ 
                                    dayChange === "positive" ? "border-success-subtle text-success" : "border-danger-subtle text-danger"}`}
                                    style={{ width: "26px", height: "26px", backgroundColor: "white" }}
                                >
                                    {dayChange === "positive" ? (<ArrowUpRight size={16} />) : (<ArrowDownRight size={16} />)}
                                </span>
                                <span>{dayChangeDollars}</span>
                                <span className="opacity-75">({dayChangePercent})</span>
                            </div>
                            
                        </div>
                        <div className="flex-grow-1 text-center">
                            <h1 className="mb-0 fw-semibold" style={{ fontSize: "3rem" }}>
                                {stockName}
                            </h1>
                        </div>
                    </Card.Body>
                </Card>
            </Container>

            <Container>
                <Row>
                    {/* Graph placeholder */}
                    <Col xs={12} md={12} xl={8} className="p-3">
                        <Card className="bg-gradient shadow-lg border-0 h-100" style={{ backgroundColor: "#011936", color: "white", borderRadius: "10px" }}>
                            <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                                <div style={{ width: "100%", height: 400 }}> 
                                    <ResponsiveContainer> 
                                        <LineChart data={filteredHistory}> 
                                            <CartesianGrid strokeDasharray="3 3" /> 
                                            <XAxis dataKey="date" /> 
                                            <YAxis domain={['auto', 'auto']} /> 
                                            <Tooltip
                                                formatter={(value, name, props) => {
                                                    const date = props?.payload?.date;
                                                    const price = `$${value.toFixed(2)}`
                                                    return [`${price} on ${date}`];
                                                }}
                                            />
                                            <Line type="monotone" dataKey="price" stroke="#22C55E" strokeWidth={2} dot={false} /> 
                                        </LineChart> 
                                    </ResponsiveContainer>
                                </div>
                                <div className="d-flex gap-2 mb-2" >
                                    {["1W","1M","3M","YTD","1Y","2Y"].map(r => (
                                    <button
                                        key={r}
                                        className={`btn btn-sm ${range === r ? "btn-success" : "btn-outline-success"}`}
                                        onClick={() => setRange(r)}
                                    >
                                        {r}
                                    </button>
                                    ))}
                                </div>
                                
                            </Card.Body>
                        </Card>
                    </Col>
                    {/* Trading panel placeholder */}
                    <Col xs={12} md={12} xl={4} className="p-3">
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
                                        Buy {stockTicker}
                                    </button>
                                    <button type="button" onClick={() => setMode("sell")}
                                        className={`flex-fill py-1 rounded-pill border-0 transition ${
                                            mode === "sell" ? "bg-danger text-white shadow" : "bg-transparent text-white-50"}`}
                                    >
                                        Sell {stockTicker}
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
                                    <p>{formattedPrice}</p>
                                </div>

                                <hr className="border border-secondary mb-3" />

                                {/* Estimated cost */}
                                <div className="d-flex justify-content-between mb-3">
                                    <h5 style={{ fontWeight: "600" }}>Estimated cost</h5>
                                    <h5>{estimatedCostDollars}</h5>
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

            {/* metrics */}
            <Container>
                <Row>
                    {
                        Object.entries(metrics).map(([name, value])  => (
                            <Col xs={12} s={12} md={6} lg={4} xl={3} key={name} className="p-3">
                                <Card className="bg-gradient shadow-lg border-0 text-center" style={{ backgroundColor: "#01497c", color: "white", borderRadius: "15px" }}>
                                    <Card.Body className="p-4 d-flex flex-column justify-content-between h-30">
                                        <h4>{name}</h4>
                                        <hr className="border border-secondary mb-3" />
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
