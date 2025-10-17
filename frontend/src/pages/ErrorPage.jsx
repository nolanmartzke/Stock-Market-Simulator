import React from 'react';
import { Link } from 'react-router-dom';

export default function ErrorPage() {
    return (
        <div
      style={{
        height: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "6rem", marginBottom: "1rem" }}>404</h1>
      <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
        Oops! The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        style={{
          textDecoration: "none",
          padding: "10px 20px",
          backgroundColor: "#0d6efd",
          color: "#fff",
          borderRadius: "5px",
          fontSize: "1rem",
        }}
      >
        Go Home
      </Link>
    </div>
  );
}