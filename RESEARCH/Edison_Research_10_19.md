# Research Report

## Stock APIs researched — FinnHub, Alpha Vantage, Twelve Data

### Summary of Work

I investigated three stock market data APIs that we could use for pulling quotes and historical prices. The three were FinnHub, Alpha Vantage, and Twelve Data. For each API I reviewed authentication, key endpoints (quote/price and historical/time-series), rate limits, error handling considerations, and found a minimal curl example for pulling the latest quote.

This research is intended to satisfy the user story: "As a developer, I want for each of us to research Stock APIs that we can use to implement our trading logic". The goal of this is to compare free options and pick one for our backend to use.

### Motivation

We need a market data provider to support the trading logic in our application. Different APIs have different coverage, latency, and rate limits. By researching multiple providers we can choose one that best fits our app.

### Time Spent

- 20 minutes — read overview docs for all three APIs
- 30 minutes — experimented with FinnHub and wrote example script
- 20 minutes — experimented with Alpha Vantage and Twelve Data and wrote minimal examples and notes

Total: ~70 minutes

---

## 1) FinnHub

High level notes I took from reading FinnHub's docs

- Authentication: API key via `token` query param
- Endpoints: `GET /quote` for realtime quote, time-series endpoints for candles and historical data (only for premium so we can't use it), WebSocket for streaming ticks.
- Docs: https://finnhub.io/docs/api/introduction
- Rate limits: tiered by account; free tier provides a limited quota of 60 calls per minute.

Curl test

```bash
curl 'https://finnhub.io/api/v1/quote?symbol=AAPL&token=YOUR_API_KEY'
```

Pros / cons

- Pros: simple REST and WebSocket support, broad coverage, and well documented endpoints.
- Cons: free-tier has limits for high-frequency api calls and bulk historical requests to pull previous data.

---

## 2) Alpha Vantage

High level notes

- Authentication: API key passed as a query parameter like apikey=YOUR_KEY.
- Endpoints: `GLOBAL_QUOTE` (for real-time quote), `TIME_SERIES_INTRADAY`, `TIME_SERIES_DAILY`, `TIME_SERIES_WEEKLY`, `TIME_SERIES_MONTHLY`, and many technical indicators.
- Docs: https://www.alphavantage.co/documentation/
- Rate limits: Alpha Vantage is commonly used in free projects. The free tier is intentionally restrictive ( 5 requests/minute, 500/day)

Curl example for GLOBAL_QUOTE

```bash
curl "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=YOUR_API_KEY"
```

Pros / cons

- Pros: free tier is easy to sign up for and has many pre-built technical indicators and time-series functions which can be handy for prototyping our trading logic.
- Cons: strict rate limits on the free tier which is not ideal for high-frequency or large-batch historical pulls without a paid plan.

---

## 3) Twelve Data

High level notes

- Authentication: API key via `apikey` query parameter.
- Endpoints: quote endpoint, time series (intraday/daily), technical indicators, forex/crypto coverage depending on which plan.
- Docs: https://twelvedata.com/documentation
- Rate limits: Twelve Data has free and paid plans with documented limits on calls per minute/day. The free plan is limited to 8 API (800 calls a day)

Minimal curl example (quote)

```bash
curl "https://api.twelvedata.com/price?symbol=AAPL&apikey=YOUR_API_KEY"
```

Pros / cons

- Pros: modern API that supports many asset types (stocks, FX, crypto), and straightforward JSON responses.
- Cons: free-tier limits so historical/time-series endpoints often require paid tiers for bulk access or higher rates which we can't use.

---

## Comparison & recommendations

- Coverage: FinnHub and Twelve Data both offer wide asset coverage and WebSocket (FinnHub) or streaming alternatives. Alpha Vantage is strong for built-in technical indicators.
- Rate limits & cost: All three have free tiers suitable for our app and demos but there are limits to them. Alpha Vantage is known to be strict with rate limits. FinnHub and Twelve Data have different limits per plan, but Twelve Data's free plan has higher rate limits.
- Ease of integration: All three provide simple REST endpoints and return JSON. Alpha Vantage uses a different response (often nested) but is still straightforward.

Recommendation for our project

- For prototyping and initial development: FinnHub (since we already looked at it) or Twelve Data. Both are simple to integrate and have good coverage.
- For signal generation where many historical requests are required: Alpha Vantage because of its indicator functions.
- In production: use Finnhub's streaming (WebSocket) where for live updates.

### Sources

- FinnHub API Introduction and authentication: https://finnhub.io/docs/api/introduction
- FinnHub Quote docs: https://finnhub.io/docs/api#quote
- Alpha Vantage docs: https://www.alphavantage.co/documentation/
- Twelve Data docs: https://twelvedata.com/documentation

[^1]: https://finnhub.io/docs/api/introduction
[^2]: https://finnhub.io/docs/api#quote
[^3]: https://www.alphavantage.co/documentation/
[^4]: https://twelvedata.com/documentation

