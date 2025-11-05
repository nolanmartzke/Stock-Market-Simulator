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

export function searchBar(query) {
  return api.get('/searchbar', { params: { query: query } });
}

export function getNews(category, minId) {
  const params = { category };
  if (typeof minId !== 'undefined' && minId !== null) params.minId = minId;
  return api.get('/news', { params });
}

export function getQuote(ticker) {
  return api.get('/quote', { params: { ticker: ticker } });}


export function getMetrics(ticker) {
  return api.get('/metrics', { params: { ticker: ticker } });
}

export function getHistory(ticker, range) {
  return api.get('/historical', { params: { ticker: ticker, range: range } });
}
