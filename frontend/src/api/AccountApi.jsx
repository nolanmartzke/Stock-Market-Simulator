import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api/accounts",
  headers: {
    "Content-Type": "application/json",
  },
});

export function loadDashboard(userId) {
  return api.get("/dashboard", {
    params: { userId },
  });
}

export function loadAccount(accountId) {
  return api.get(`/${accountId}`);
}

export function trade(accountId, tradeData) {
  return api.post(`/${accountId}/trade`, tradeData);
}

// Added for read-only Trade History
export default api;
