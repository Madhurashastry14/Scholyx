import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoMark from "../components/LogoMark";
import { useAuth } from "../context/auth.js";
import { parseLoginError } from "../services/api.js";
import {
  LOGIN_FIELDS,
  validateLogin,
  validateLoginField,
} from "../utils/loginValidation.js";
import "../styles/login.css";

const INITIAL_VALUES = { username: "", password: "" };
const TOUCHED_ALL = { username: true, password: true };

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { status, notice, clearNotice, login } = useAuth();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState(() => {
    if (typeof notice === "string" && notice) {
      return { type: "success", message: notice };
    }
    if (typeof location.state?.message === "string" && location.state.message) {
      return { type: "success", message: location.state.message };
    }
    return null;
  });
  const [liveMessage, setLiveMessage] = useState("");
  const submittingRef = useRef(false);
  const bannerRef = useRef(null);
  const fieldRefs = useRef({});

  const redirectFrom = location.state?.from;
  const destination =
    typeof redirectFrom?.pathname === "string" &&
    redirectFrom.pathname &&
    redirectFrom.pathname !== "/login"
      ? `${redirectFrom.pathname}${redirectFrom.search || ""}${
          redirectFrom.hash || ""
        }`
      : "/dashboard";

  useEffect(() => {
    if (status === "authenticated") {
      navigate(destination, { replace: true });
    }
  }, [status, destination, navigate]);

  useEffect(() => {
    if (notice) {
      clearNotice();
    }
  }, [notice, clearNotice]);

  const focusFirstError = (fieldErrors) => {
    const firstInvalid = LOGIN_FIELDS.find((field) => fieldErrors[field]);
    if (!firstInvalid) {
      return;
    }
    window.requestAnimationFrame(() => {
      fieldRefs.current[firstInvalid]?.focus();
    });
  };

  const focusBanner = () => {
    window.requestAnimationFrame(() => {
      bannerRef.current?.focus();
    });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      if (touched[name] || currentErrors[name]) {
        const message = validateLoginField(name, nextValues);
        if (message) {
          nextErrors[name] = message;
        } else {
          delete nextErrors[name];
        }
      }
      return nextErrors;
    });

    if (banner?.type === "error") {
      setBanner(null);
    }
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      const message = validateLoginField(name, values);
      if (message) {
        nextErrors[name] = message;
      } else {
        delete nextErrors[name];
      }
      return nextErrors;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submittingRef.current) {
      return;
    }

    const nextErrors = validateLogin(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setTouched(TOUCHED_ALL);
      setBanner({
        type: "error",
        message: "Please enter your username and password.",
      });
      focusFirstError(nextErrors);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setBanner(null);
    setLiveMessage("");

    try {
      await login(values);
      setLiveMessage("Signed in. Taking you to your dashboard.");
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      const message = parseLoginError(error);
      setBanner({ type: "error", message });
      setLiveMessage(message);
      focusBanner();
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-atmosphere" aria-hidden="true">
        <span className="login-glow login-glow--teal" />
        <span className="login-glow login-glow--navy" />
        <span className="login-ring login-ring--gold" />
        <span className="login-ring login-ring--teal" />
        <span className="login-dots" />
      </div>

      <div className="login-shell">
        <header className="login-header">
          <Link to="/" className="login-logo">
            <LogoMark />
            <span className="login-logo-word">
              Schol<span>yx</span>
            </span>
          </Link>
          <Link to="/" className="login-back-link">
            <span aria-hidden="true">←</span> Back to Home
          </Link>
        </header>

        <main className="login-main">
          <div className="login-visual login-visual--left" aria-hidden="true">
            <div className="login-certificate">
              <span className="login-certificate-sheet" />
              <span className="login-certificate-face">
                <span className="login-certificate-cap">🎓</span>
                <span className="login-certificate-line login-certificate-line--long" />
                <span className="login-certificate-line" />
                <span className="login-certificate-line login-certificate-line--short" />
                <span className="login-certificate-seal">✦</span>
              </span>
            </div>
            <span className="login-orb login-orb--teal" />
            <span className="login-orb login-orb--gold" />
          </div>

          <div className="login-card">
            <span className="login-eyebrow">WELCOME BACK</span>
            <h1>Log in to Scholyx</h1>
            <p className="login-intro">
              Pick up where you left off and keep exploring scholarships
              you&apos;re eligible for.
            </p>

            {banner && (
              <div
                ref={bannerRef}
                className={`login-banner login-banner--${banner.type}`}
                role={banner.type === "error" ? "alert" : "status"}
                tabIndex={-1}
              >
                <span className="login-banner-icon" aria-hidden="true">
                  {banner.type === "error" ? "!" : "✓"}
                </span>
                <span>{banner.message}</span>
              </div>
            )}

            <p
              className="login-sr-only"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {liveMessage}
            </p>

            <form noValidate onSubmit={handleSubmit} aria-busy={submitting}>
              <fieldset className="login-fieldset">
                <legend className="login-sr-only">Login details</legend>

                <div
                  className={`login-field ${
                    errors.username ? "login-field--error" : ""
                  }`}
                >
                  <label htmlFor="username">
                    Username{" "}
                    <span className="login-required" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className="login-input"
                    value={values.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="asha.rao"
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    readOnly={submitting}
                    aria-required="true"
                    aria-invalid={Boolean(errors.username)}
                    aria-describedby={
                      errors.username ? "username-error" : undefined
                    }
                    ref={(node) => {
                      fieldRefs.current.username = node;
                    }}
                  />
                  {errors.username && (
                    <p className="login-field-error" id="username-error">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div
                  className={`login-field login-field--last ${
                    errors.password ? "login-field--error" : ""
                  }`}
                >
                  <label htmlFor="password">
                    Password{" "}
                    <span className="login-required" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <div className="login-field-control">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="login-input"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      readOnly={submitting}
                      aria-required="true"
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={
                        errors.password ? "password-error" : undefined
                      }
                      ref={(node) => {
                        fieldRefs.current.password = node;
                      }}
                    />
                    <button
                      type="button"
                      className="login-toggle"
                      onClick={() => setShowPassword((visible) => !visible)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="login-field-error" id="password-error">
                      {errors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="login-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="login-spinner" aria-hidden="true" />
                      Signing in…
                    </>
                  ) : (
                    "Log In"
                  )}
                </button>
              </fieldset>
            </form>

            <p className="login-switch">
              New to Scholyx? <Link to="/register">Create an account</Link>
            </p>
          </div>

          <div className="login-visual login-visual--right" aria-hidden="true">
            <div className="login-medal">
              <span className="login-medal-ribbon login-medal-ribbon--left" />
              <span className="login-medal-ribbon login-medal-ribbon--right" />
              <span className="login-medal-disc">
                <span className="login-medal-star">★</span>
              </span>
            </div>
            <span className="login-spark login-spark--one">✦</span>
            <span className="login-spark login-spark--two">✦</span>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Login;
