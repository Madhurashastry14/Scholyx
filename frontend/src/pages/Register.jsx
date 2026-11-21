import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import LogoMark from "../components/LogoMark";
import { parseApiErrors, registerStudent } from "../services/api";
import {
  FIELD_ORDER,
  getPasswordChecks,
  validateField,
  validateRegistration,
} from "../utils/registerValidation";
import "../styles/register.css";

const INITIAL_VALUES = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
};

const TOUCHED_ALL = {
  fullName: true,
  username: true,
  email: true,
  password: true,
  confirmPassword: true,
};

const REQUIREMENT_MARKERS = {
  met: "✓",
  unmet: "•",
  pending: "…",
};

const REQUIREMENT_LABELS = {
  met: "requirement met",
  unmet: "requirement not met yet",
  pending: "checked when you register",
};

function setFieldMessage(errors, field, message) {
  if (message) {
    errors[field] = message;
  } else {
    delete errors[field];
  }
  return errors;
}

function Register() {
  const navigate = useNavigate();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [banner, setBanner] = useState(null);
  const [liveMessage, setLiveMessage] = useState("");
  const timerRef = useRef(null);
  const submittingRef = useRef(false);
  const abortRef = useRef(null);
  const bannerRef = useRef(null);
  const fieldRefs = useRef({});
  const passwordChecks = getPasswordChecks(values);

  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      abortRef.current?.abort();
    },
    [],
  );

  const focusFirstError = (fieldErrors) => {
    const firstInvalid = FIELD_ORDER.find((field) => fieldErrors[field]);
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
      const fieldsToRevalidate = [name];

      if (
        name === "password" &&
        (touched.confirmPassword || currentErrors.confirmPassword)
      ) {
        fieldsToRevalidate.push("confirmPassword");
      }

      fieldsToRevalidate.forEach((field) => {
        if (touched[field] || currentErrors[field]) {
          setFieldMessage(
            nextErrors,
            field,
            validateField(field, nextValues),
          );
        }
      });

      return nextErrors;
    });

    if (banner?.type === "error") {
      setBanner(null);
    }
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((currentErrors) =>
      setFieldMessage(
        { ...currentErrors },
        name,
        validateField(name, values),
      ),
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submittingRef.current || succeeded) {
      return;
    }

    const nextErrors = validateRegistration(values);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setTouched(TOUCHED_ALL);
      setBanner({
        type: "error",
        message: "Please fix the highlighted fields and try again.",
      });
      focusFirstError(nextErrors);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setBanner(null);
    setLiveMessage("");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await registerStudent(values, { signal: controller.signal });

      if (controller.signal.aborted) {
        return;
      }

      const message =
        "Account created successfully. Redirecting to login…";
      setSucceeded(true);
      setBanner({ type: "success", message });
      setLiveMessage(message);
      focusBanner();

      timerRef.current = setTimeout(() => {
        navigate("/login", {
          state: { message: "Account created successfully. Please log in." },
        });
      }, 1200);
    } catch (error) {
      if (error?.name === "AbortError" || controller.signal.aborted) {
        return;
      }

      const { fieldErrors, message } = parseApiErrors(error);

      if (Object.keys(fieldErrors).length > 0) {
        setErrors((currentErrors) => ({ ...currentErrors, ...fieldErrors }));
        setTouched(TOUCHED_ALL);
        focusFirstError(fieldErrors);
      } else {
        focusBanner();
      }

      setBanner({ type: "error", message });
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-atmosphere" aria-hidden="true">
        <span className="register-glow register-glow--teal" />
        <span className="register-glow register-glow--navy" />
        <span className="register-ring register-ring--gold" />
        <span className="register-ring register-ring--teal" />
        <span className="register-dots" />
      </div>

      <div className="register-shell">
        <header className="register-header">
          <Link to="/" className="register-logo">
            <LogoMark />
            <span className="register-logo-word">
              Schol<span>yx</span>
            </span>
          </Link>
          <Link to="/" className="register-back-link">
            <span aria-hidden="true">←</span> Back to Home
          </Link>
        </header>

        <main className="register-main">
          <div className="register-visual register-visual--left" aria-hidden="true">
            <div className="register-certificate">
              <span className="register-certificate-sheet" />
              <span className="register-certificate-face">
                <span className="register-certificate-cap">🎓</span>
                <span className="register-certificate-line register-certificate-line--long" />
                <span className="register-certificate-line" />
                <span className="register-certificate-line register-certificate-line--short" />
                <span className="register-certificate-seal">✦</span>
              </span>
            </div>
            <span className="register-orb register-orb--teal" />
            <span className="register-orb register-orb--gold" />
          </div>

          <div className="register-card">
            <span className="register-eyebrow">CREATE YOUR ACCOUNT</span>
            <h1>Join Scholyx</h1>
            <p className="register-intro">
              Create your account to find scholarships you&apos;re eligible
              for. It only takes a minute.
            </p>

            {banner && (
              <div
                ref={bannerRef}
                className={`register-banner register-banner--${banner.type}`}
                role={banner.type === "error" ? "alert" : "status"}
                tabIndex={-1}
              >
                <span className="register-banner-icon" aria-hidden="true">
                  {banner.type === "error" ? "!" : "✓"}
                </span>
                <span>{banner.message}</span>
              </div>
            )}

            <p
              className="register-sr-only"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {liveMessage}
            </p>

            <form noValidate onSubmit={handleSubmit} aria-busy={submitting}>
              <fieldset className="register-fieldset">
                <legend className="register-sr-only">Account details</legend>

                <div
                  className={`register-field ${
                    errors.fullName ? "register-field--error" : ""
                  }`}
                >
                  <label htmlFor="fullName">
                    Full name{" "}
                    <span className="register-required" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    className="register-input"
                    value={values.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Asha Rao"
                    autoComplete="name"
                    readOnly={submitting}
                    aria-required="true"
                    aria-invalid={Boolean(errors.fullName)}
                    aria-describedby={
                      errors.fullName ? "fullName-error" : undefined
                    }
                    ref={(node) => {
                      fieldRefs.current.fullName = node;
                    }}
                  />
                  {errors.fullName && (
                    <p className="register-field-error" id="fullName-error">
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div
                  className={`register-field ${
                    errors.username ? "register-field--error" : ""
                  }`}
                >
                  <label htmlFor="username">
                    Username{" "}
                    <span className="register-required" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    className="register-input"
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
                    <p className="register-field-error" id="username-error">
                      {errors.username}
                    </p>
                  )}
                </div>

                <div
                  className={`register-field ${
                    errors.email ? "register-field--error" : ""
                  }`}
                >
                  <label htmlFor="email">
                    Email address{" "}
                    <span className="register-required" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="register-input"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="asha@example.com"
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    readOnly={submitting}
                    aria-required="true"
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    ref={(node) => {
                      fieldRefs.current.email = node;
                    }}
                  />
                  {errors.email && (
                    <p className="register-field-error" id="email-error">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div
                  className={`register-field ${
                    errors.password ? "register-field--error" : ""
                  }`}
                >
                  <label htmlFor="password">
                    Password{" "}
                    <span className="register-required" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <div className="register-field-control">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      className="register-input"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      readOnly={submitting}
                      aria-required="true"
                      aria-invalid={Boolean(errors.password)}
                      aria-describedby={`${
                        errors.password ? "password-error " : ""
                      }password-requirements`}
                      ref={(node) => {
                        fieldRefs.current.password = node;
                      }}
                    />
                    <button
                      type="button"
                      className="register-toggle"
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
                    <p className="register-field-error" id="password-error">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div
                  className="register-password-hint"
                  id="password-requirements"
                >
                  <p className="register-password-hint-title">Password must:</p>
                  <ul>
                    {passwordChecks.map((check) => (
                      <li
                        key={check.id}
                        className={`register-requirement register-requirement--${check.status}`}
                      >
                        <span
                          className="register-requirement-marker"
                          aria-hidden="true"
                        >
                          {REQUIREMENT_MARKERS[check.status]}
                        </span>
                        <span>{check.label}</span>
                        <span className="register-sr-only">
                          {" "}
                          — {REQUIREMENT_LABELS[check.status]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div
                  className={`register-field register-field--last ${
                    errors.confirmPassword ? "register-field--error" : ""
                  }`}
                >
                  <label htmlFor="confirmPassword">
                    Confirm password{" "}
                    <span className="register-required" aria-hidden="true">
                      *
                    </span>
                  </label>
                  <div className="register-field-control">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      className="register-input"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      readOnly={submitting}
                      aria-required="true"
                      aria-invalid={Boolean(errors.confirmPassword)}
                      aria-describedby={
                        errors.confirmPassword
                          ? "confirmPassword-error"
                          : undefined
                      }
                      ref={(node) => {
                        fieldRefs.current.confirmPassword = node;
                      }}
                    />
                    <button
                      type="button"
                      className="register-toggle"
                      onClick={() =>
                        setShowConfirmPassword((visible) => !visible)
                      }
                      aria-label={
                        showConfirmPassword
                          ? "Hide confirm password"
                          : "Show confirm password"
                      }
                      aria-pressed={showConfirmPassword}
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p
                      className="register-field-error"
                      id="confirmPassword-error"
                    >
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="register-submit"
                  disabled={submitting || succeeded}
                >
                  {succeeded ? (
                    "Account created"
                  ) : submitting ? (
                    <>
                      <span className="register-spinner" aria-hidden="true" />
                      Creating account…
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </fieldset>
            </form>

            <p className="register-login-link">
              Already have an account? <Link to="/login">Login</Link>
            </p>
          </div>

          <div className="register-visual register-visual--right" aria-hidden="true">
            <div className="register-medal">
              <span className="register-medal-ribbon register-medal-ribbon--left" />
              <span className="register-medal-ribbon register-medal-ribbon--right" />
              <span className="register-medal-disc">
                <span className="register-medal-star">★</span>
              </span>
            </div>
            <span className="register-spark register-spark--one">✦</span>
            <span className="register-spark register-spark--two">✦</span>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Register;
