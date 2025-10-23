import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/stock',
  headers: {
    'Content-Type': 'application/json',
  },
});

export function search(query) {
  return api.get('/search', { params: { query: query } });
}

export function getQuote(ticker) {
  return api.get('/quote', { params: { ticker: ticker } });}

export function getMetrics(ticker) {
  return api.get('/metrics', { params: { ticker: ticker } });
}


