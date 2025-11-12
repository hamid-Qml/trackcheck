import { FunctionComponent, useCallback, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SignUp.module.css";

import logo from "@/assets/trakchek-logo.webp";
import flexVertical from "@/assets/flex-vertical.webp";
import { useAuth } from "@/contexts/AuthContext";

const SignUp: FunctionComponent = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  // form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);

  // ui state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; fullName?: string; agree?: string }>({});

  const canSubmit = useMemo(() => {
    const ok = fullName.trim() && email.trim() && password.length >= 8 && agree;
    return !submitting && !!ok;
  }, [submitting, fullName, email, password, agree]);

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const nextFieldErrors: typeof fieldErrors = {};
    if (!fullName.trim()) nextFieldErrors.fullName = "Please enter your name.";
    if (!email.trim()) nextFieldErrors.email = "Email is required.";
    if (password.length < 8) nextFieldErrors.password = "Minimum 8 characters.";
    if (!agree) nextFieldErrors.agree = "Please accept the Terms & Conditions.";

    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    try {
      setSubmitting(true);
      await signup({ email: email.trim(), password, full_name: fullName.trim() });
      navigate("/", { replace: true });
    } catch (err: any) {
      const message = err?.message || "Something went wrong. Please try again.";
      const lower = message.toLowerCase();

      if (lower.includes("email")) {
        setFieldErrors((fe) => ({ ...fe, email: message }));
      } else if (lower.includes("password")) {
        setFieldErrors((fe) => ({ ...fe, password: message }));
      } else {
        setError(message); // only for generic ones
      }
    }
    finally {
      setSubmitting(false); // allow instant retry

    }
  }, [agree, email, fullName, password, navigate, signup]);

  return (
    <div className={styles.signUp}>


      <div className={styles.frame}>
        <div className={styles.container}>
          {/* LEFT: Logo + Form */}
          <section className={styles.leftPane}>
            <div className={styles.leftInner}>
              <div className={styles.logoRow}>
                <img src={logo} className={styles.trakchekBlk1Icon} alt="TrakChek" />
              </div>

              <div className={styles.formCard}>
                <header className={styles.cardHeader}>
                  <b className={styles.createAnAccount}>Create an account</b>
                  <p className={styles.letsGetStarted}>Let’s get started. Fill in the details below to create your account.</p>
                </header>

                {error && (
                  <div className={styles.inlineError}>
                    {error}
                  </div>
                )}

                <form className={styles.form} onSubmit={onSubmit} noValidate>
                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="name">Name</label>
                    <div className={styles.input}>
                      <input
                        id="name"
                        name="name"
                        placeholder="Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        aria-invalid={!!fieldErrors.fullName}
                        aria-describedby={fieldErrors.fullName ? "name-error" : undefined}
                        autoComplete="name"
                      />
                    </div>
                    {fieldErrors.fullName && <small id="name-error" className={styles.fieldError}>{fieldErrors.fullName}</small>}
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.label} htmlFor="email">Email</label>
                    <div className={styles.input}>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        aria-invalid={!!fieldErrors.email}
                        aria-describedby={fieldErrors.email ? "email-error" : undefined}
                        autoComplete="email"
                      />
                    </div>
                    {fieldErrors.email && <small id="email-error" className={styles.fieldError}>{fieldErrors.email}</small>}
                  </div>

                  <div className={styles.fieldGroup}>
                    <div className={styles.labelRow}>
                      <label className={styles.label} htmlFor="password">Password</label>
                      <span className={styles.hint}>Minimum 8 characters.</span>
                    </div>
                    <div className={styles.input}>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Password"
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        aria-invalid={!!fieldErrors.password}
                        aria-describedby={fieldErrors.password ? "password-error" : undefined}
                        autoComplete="new-password"
                      />
                    </div>
                    {fieldErrors.password && <small id="password-error" className={styles.fieldError}>{fieldErrors.password}</small>}
                  </div>

                  <label className={styles.checkboxRow} htmlFor="agree">
                    <input id="agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                    <span className={styles.checkboxText}>
                      I agree to the{" "}
                      <a className={styles.link} href="/terms" target="_blank" rel="noreferrer">Terms &amp; Conditions</a>
                    </span>
                  </label>
                  {fieldErrors.agree && <small className={styles.fieldError} style={{ marginTop: -8 }}>{fieldErrors.agree}</small>}

                  <button className={styles.cta} type="submit" disabled={!canSubmit}>
                    {submitting ? "Creating account…" : "Create account"}
                  </button>

                  <div className={styles.footerNote}>
                    <span>Already have an account?</span>
                    <a className={styles.link} href="/login">Login</a>
                  </div>
                </form>
              </div>
            </div>
          </section>

          {/* RIGHT: Image panel with margin/rounding */}
          <section
            className={styles.rightPane}
            style={{ ["--panel-bg" as any]: `url(${flexVertical})` }}  // <-- needs quotes
            aria-hidden="true"
          >
            <div className={styles.rightBox} />
          </section>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
