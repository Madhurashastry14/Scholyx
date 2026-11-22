import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import EligibilityCriteria from "../components/EligibilityCriteria";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import RequiredDocuments from "../components/RequiredDocuments";
import { useAuth } from "../context/auth.js";
import { fetchScholarshipDetails } from "../services/api";
import "../styles/scholarshipDetails.css";

function formatAmount(amount) {
  const value = Number(amount);
  return Number.isFinite(value)
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(value)
    : "Not specified";
}

function formatDate(value) {
  if (!value) {
    return "Not specified";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getStatus(scholarship) {
  const deadline = scholarship.deadline
    ? new Date(`${scholarship.deadline}T00:00:00`)
    : null;
  if (deadline && !Number.isNaN(deadline.getTime())) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil(
      (deadline.getTime() - today.getTime()) / 86400000,
    );
    if (daysRemaining < 0) {
      return { label: "Expired", className: "expired" };
    }
    if (daysRemaining <= 7 && scholarship.status === "active") {
      return { label: "Closing soon", className: "closing" };
    }
  }

  const statusLabels = {
    active: { label: "Active", className: "active" },
    closed: { label: "Closed", className: "expired" },
    draft: { label: "Draft", className: "closing" },
  };
  return statusLabels[scholarship.status] || {
    label: "Status not specified",
    className: "unspecified",
  };
}

function ScholarshipDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { status: authStatus } = useAuth();
  const [result, setResult] = useState({
    id: null,
    status: "loading",
    scholarship: null,
  });
  const [eligibilityNotice, setEligibilityNotice] = useState({
    id: null,
    message: "",
  });

  useEffect(() => {
    if (!/^[1-9]\d*$/.test(id || "")) {
      return undefined;
    }

    const controller = new AbortController();

    fetchScholarshipDetails(id, { signal: controller.signal })
      .then((data) => {
        if (controller.signal.aborted) {
          return;
        }
        if (!data || typeof data !== "object" || !data.id) {
          setResult({ id, status: "not-found", scholarship: null });
          return;
        }
        setResult({ id, status: "ready", scholarship: data });
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.name === "AbortError") {
          return;
        }
        setResult({
          id,
          status: error?.status === 404 ? "not-found" : "error",
          scholarship: null,
        });
      });

    return () => controller.abort();
  }, [id]);

  const isValidId = /^[1-9]\d*$/.test(id || "");
  const requestState = !isValidId
    ? "not-found"
    : result.id === id
      ? result.status
      : "loading";
  const scholarship =
    requestState === "ready" ? result.scholarship : null;

  const handleEligibilityCheck = () => {
    if (authStatus !== "authenticated") {
      navigate("/login", {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        },
      });
      return;
    }
    setEligibilityNotice({
      id,
      message:
        "Eligibility checking will be available soon. You can review the criteria above in the meantime.",
    });
  };

  const renderPageState = (title, message, isError = false) => (
    <main className="scholarship-details-page">
      <div className={`details-state ${isError ? "details-state-error" : ""}`}>
        <h1>{title}</h1>
        <p>{message}</p>
        <Link to="/scholarships" className="details-primary-link">
          Back to Scholarships
        </Link>
      </div>
    </main>
  );

  return (
    <div className="scholarship-details-shell">
      <Navbar />
      {requestState === "loading" &&
        renderPageState("Loading scholarship…", "Fetching scholarship details.")}
      {requestState === "not-found" &&
        renderPageState(
          "Scholarship not found",
          "This scholarship may no longer be available, or the link may be incorrect.",
        )}
      {requestState === "error" &&
        renderPageState(
          "Unable to load scholarship",
          "We couldn't load this scholarship right now. Please try again.",
          true,
        )}
      {requestState === "ready" && scholarship && (
        <main className="scholarship-details-page">
          <Link to="/scholarships" className="details-back-link">
            <span aria-hidden="true">←</span> Back to Scholarships
          </Link>

          <div className="scholarship-details-layout">
            <div className="scholarship-details-main">
              <header className="scholarship-details-header">
                <span className="details-eyebrow">SCHOLARSHIP OPPORTUNITY</span>
                <h1>{scholarship.name}</h1>
                <p className="details-provider">{scholarship.provider}</p>
                <p className="details-description">
                  {scholarship.description || "No description is available."}
                </p>
                <div className="details-links">
                  {scholarship.official_website && (
                    <a
                      href={scholarship.official_website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Official website <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {scholarship.application_url && (
                    <a
                      href={scholarship.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Application information <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>
              </header>

              <EligibilityCriteria scholarship={scholarship} />
              <RequiredDocuments documents={scholarship.required_documents} />
            </div>

            <aside className="scholarship-details-sidebar">
              <section className="details-card summary-card">
                <span className="summary-label">SCHOLARSHIP AMOUNT</span>
                <p className="summary-amount">{formatAmount(scholarship.amount)}</p>
                <div className="summary-divider" />
                <div className="summary-detail">
                  <span className="summary-detail-icon" aria-hidden="true">◷</span>
                  <div>
                    <span className="summary-label">Application deadline</span>
                    <strong>{formatDate(scholarship.deadline)}</strong>
                  </div>
                </div>
                <div className="summary-detail">
                  <span className="summary-detail-icon summary-status-icon" aria-hidden="true">●</span>
                  <div>
                    <span className="summary-label">Status</span>
                    <span
                      className={`details-status details-status-${getStatus(scholarship).className}`}
                    >
                      {getStatus(scholarship).label}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="details-action-button"
                  onClick={handleEligibilityCheck}
                  disabled={authStatus === "loading"}
                >
                  {authStatus === "loading"
                    ? "Checking session…"
                    : "Check Eligibility"}
                </button>
                {scholarship.application_url ? (
                  <a
                    className="details-action-button details-action-secondary"
                    href={scholarship.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply Now <span aria-hidden="true">↗</span>
                  </a>
                ) : (
                  <p className="application-unavailable">
                    Application link not available.
                  </p>
                )}
                {authStatus === "authenticated" && (
                  <button
                    type="button"
                    className="details-action-button details-action-muted"
                    disabled
                    title="Application tracking will be available soon"
                  >
                    Track Application
                  </button>
                )}
                {eligibilityNotice.id === id && eligibilityNotice.message && (
                  <p className="eligibility-notice" role="status">
                    {eligibilityNotice.message}
                  </p>
                )}
              </section>
            </aside>
          </div>
        </main>
      )}
      <Footer />
    </div>
  );
}

export default ScholarshipDetails;
