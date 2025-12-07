/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import { useAuth } from "./AuthContext";
import { getAccounts } from "../api/AccountApi";

export const AccountContext = createContext();

export function AccountProvider({ children }) {
  const { auth } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load accounts when user is authenticated
  useEffect(() => {
    if (!auth?.id) {
      setAccounts([]);
      setSelectedAccountId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    getAccounts(auth.id)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setAccounts(list);

        if (list.length > 0) {
          // Try to restore saved account selection
          const savedAccountId = localStorage.getItem("selectedAccountId");
          const savedId = savedAccountId ? Number(savedAccountId) : null;

          // Check if saved account still exists
          const isValidAccount = list.some((acc) => acc.id === savedId);

          if (isValidAccount) {
            setSelectedAccountId(savedId);
          } else {
            // Default to first account
            const firstAccountId = list[0].id;
            setSelectedAccountId(firstAccountId);
            localStorage.setItem("selectedAccountId", String(firstAccountId));
          }
        } else {
          setSelectedAccountId(null);
          localStorage.removeItem("selectedAccountId");
        }
      })
      .catch((err) => {
        console.error("Failed to load accounts", err);
        setAccounts([]);
        setSelectedAccountId(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [auth]);


  async function refreshAccounts() {
    if (!auth?.id) return [];

    try {
      const res = await getAccounts(auth.id);
      const list = Array.isArray(res.data) ? res.data : [];
      setAccounts(list);

      // Fix invalid selection
      if (selectedAccountId && !list.some(acc => acc.id === selectedAccountId)) {
        if (list.length > 0) {
          handleSetAccount(list[0].id);
        } else {
          handleSetAccount(null);
        }
      }

      return list; // ⬅ return updated list
    } catch (err) {
      console.error("Failed to refresh accounts", err);
      return [];
    }
  }


  // Handle account selection change
  const handleSetAccount = async (accountId) => {
    if (!accountId) {
      setSelectedAccountId(null);
      localStorage.removeItem("selectedAccountId");
      return;
    }

    const freshList = await refreshAccounts(); // ⬅ gets the updated accounts list

    const accountExists = freshList.some((acc) => acc.id === accountId);

    if (accountExists) {
      setSelectedAccountId(accountId);
      localStorage.setItem("selectedAccountId", String(accountId));
    }
  };



  // Get the currently selected account object
  const selectedAccount =
    accounts.find((acc) => acc.id === selectedAccountId) || null;

  return (
    <AccountContext.Provider
      value={{
        accounts,
        selectedAccountId,
        selectedAccount,
        setSelectedAccountId: handleSetAccount,
        loading,
        refreshAccounts
      }}
    >
      {children}
    </AccountContext.Provider>
  );
}

export const useAccount = () => useContext(AccountContext);
