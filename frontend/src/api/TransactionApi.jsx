import axios from "axios";

const transactionApi = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

/** Read-only trade history from existing endpoint. */
export function getAccountTransactions(
  accountId,
  { page = 0, size = 20 } = {}
) {
  return transactionApi.get("/transactions", {
    params: { accountId, page, size },
  });
}
