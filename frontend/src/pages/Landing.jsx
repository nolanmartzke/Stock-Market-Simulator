import React from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Button, Card } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import { User } from "lucide-react";
import "../styles/landing.css";

export default function Landing() {
  const currentYear = new Date().getFullYear();
  const { auth } = useAuth();
  const isAuthenticated = !!auth;

  return (
    <div className="landing-page">
      <a
        href="#main-content"
        className="visually-hidden-focusable position-absolute top-0 start-0 bg-danger text-white px-3 py-2 m-2 rounded"
      >
        Skip to main content
      </a>

      {/* Header / Navbar */}
      <Navbar
        expand="lg"
        bg="dark"
        variant="dark"
        as="nav"
        role="navigation"
        className="py-3"
      >
        <Container fluid className="px-4 px-lg-5">
          {/* Brand */}
          <Navbar.Brand as={Link} to="/" className="fw-bold fs-3">
            <span className="me-2 text-danger">TRD</span>
            <span className="text-light">Wars</span>
          </Navbar.Brand>

          {/* Mobile toggle */}
          <Navbar.Toggle aria-controls="navbarNav" />

          {/* Nav items */}
          <Navbar.Collapse id="navbarNav">
            <Nav className="ms-auto align-items-lg-center">
              <Nav.Link href="#how" className="me-3 fs-5 fw-medium">
                How it works
              </Nav.Link>

              {isAuthenticated ? (
                // Authenticated user: Show name + Dashboard
                <>
                  <Nav.Item className="me-2">
                    <Button
                      as={Link}
                      to="/dashboard"
                      variant="danger"
                      size="lg"
                      style={{ borderRadius: "12px" }}
                    >
                      Dashboard
                    </Button>
                  </Nav.Item>
                  <Nav.Item>
                    <Button
                      as={Link}
                      to="/account"
                      variant="outline-light"
                      size="lg"
                      style={{ borderRadius: "12px" }}
                      className="d-flex align-items-center gap-2"
                    >
                      <User size={18} />
                      {auth.name}
                    </Button>
                  </Nav.Item>
                </>
              ) : (
                // Guest user: Show auth buttons
                <>
                  <Nav.Item className="me-2">
                    <Button
                      as={Link}
                      to="/signin"
                      variant="outline-light"
                      size="lg"
                      style={{ borderRadius: "12px" }}
                    >
                      Log in
                    </Button>
                  </Nav.Item>
                  <Nav.Item>
                    <Button
                      as={Link}
                      to="/signup"
                      variant="danger"
                      size="lg"
                      style={{ borderRadius: "12px" }}
                    >
                      Create free account
                    </Button>
                  </Nav.Item>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Hero Section */}
      <main id="main-content">
        <section
          className="hero-bg bg-dark text-white py-5"
          aria-labelledby="hero-heading"
        >
          <div className="container py-5">
            <div className="row align-items-center">
              {/* Left column: Copy + CTAs */}
              <div className="col-lg-6 mb-5 mb-lg-0">
                {/* Badge */}
                <span className="badge text-bg-danger mb-3">Auth live now</span>

                {/* Headline with fade-in-up spans */}
                <h1 id="hero-heading" className="display-3 fw-bold mb-4">
                  <span className="fade-in-up d-block">Practice trading.</span>
                  <span className="fade-in-up d2 d-block">Zero risk.</span>
                  <span className="fade-in-up d3 d-block">Real learning.</span>
                </h1>

                {/* Supporting text */}
                <p className="lead mb-4 fade-in-up d4 text-muted-on-dark">
                  Create an account, log in, and explore the interface.
                </p>

                {/* CTAs */}
                <div className="d-flex gap-3 fade-in-up d5">
                  <Link
                    className="btn btn-danger btn-lg"
                    to="/signup"
                    style={{ borderRadius: "12px" }}
                  >
                    Get started
                  </Link>
                  <a
                    className="btn btn-outline-light btn-lg"
                    href="#how"
                    style={{ borderRadius: "12px" }}
                  >
                    See how it works
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section
          id="how"
          className="py-5 bg-light"
          aria-labelledby="how-heading"
        >
          <div className="container py-5">
            <div className="row">
              <div className="col-lg-8 mx-auto text-center mb-5">
                <h2 id="how-heading" className="fw-bold mb-3 text-dark">
                  How it works
                </h2>
                <p className="text-muted">
                  Get started in two steps. Trading features coming soon.
                </p>
              </div>
            </div>

            <div className="row g-4">
              {/* Step 1: Sign up */}
              <div className="col-md-4">
                <Card
                  className="h-100 border-0 shadow-lg"
                  style={{ borderRadius: "20px" }}
                >
                  <Card.Body className="text-center p-4">
                    <div
                      className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <span className="fs-4 fw-bold text-danger">1</span>
                    </div>
                    <Card.Title as="h3" className="fw-bold text-dark">
                      Create your account
                    </Card.Title>
                    <Card.Text className="text-muted mb-3">
                      Sign up with your email and choose a secure password.
                    </Card.Text>
                    <Button
                      as={Link}
                      to="/signup"
                      variant="outline-danger"
                      size="sm"
                      style={{ borderRadius: "12px" }}
                    >
                      Sign up
                    </Button>
                  </Card.Body>
                </Card>
              </div>

              {/* Step 2: Log in */}
              <div className="col-md-4">
                <Card
                  className="h-100 border-0 shadow-lg"
                  style={{ borderRadius: "20px" }}
                >
                  <Card.Body className="text-center p-4">
                    <div
                      className="rounded-circle bg-danger bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <span className="fs-4 fw-bold text-danger">2</span>
                    </div>
                    <Card.Title as="h3" className="fw-bold text-dark">
                      Log in
                    </Card.Title>
                    <Card.Text className="text-muted mb-3">
                      Access your account and explore the interface.
                    </Card.Text>
                    <Button
                      as={Link}
                      to="/signin"
                      variant="outline-danger"
                      size="sm"
                      style={{ borderRadius: "12px" }}
                    >
                      Log in
                    </Button>
                  </Card.Body>
                </Card>
              </div>

              {/* Step 3: Coming soon */}
              <div className="col-md-4">
                <Card
                  className="h-100 border-0 shadow-lg"
                  style={{ borderRadius: "20px" }}
                >
                  <Card.Body className="text-center p-4">
                    <div
                      className="rounded-circle bg-secondary bg-opacity-10 d-inline-flex align-items-center justify-content-center mb-3"
                      style={{ width: "60px", height: "60px" }}
                    >
                      <span className="fs-4 fw-bold text-secondary">3</span>
                    </div>
                    <Card.Title as="h3" className="fw-bold text-dark">
                      Practice trading
                    </Card.Title>
                    <Card.Text className="text-muted mb-3">
                      Trading features are in development.
                    </Card.Text>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      disabled
                      style={{ borderRadius: "12px" }}
                    >
                      Coming soon
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-dark text-white py-4" role="contentinfo">
          <div className="container">
            <p className="text-center text-muted small mb-0">
              © {currentYear} Trade Wars • React · Spring Boot · MySQL
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
