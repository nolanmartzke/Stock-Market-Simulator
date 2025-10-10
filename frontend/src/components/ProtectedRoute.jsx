
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const auth = JSON.parse(localStorage.getItem("auth"));

    if (!auth) {
        // not signed in, send user to login
        return <Navigate to="/signin" replace />;
    }

    // signed in, can show protected page
    return children;
}