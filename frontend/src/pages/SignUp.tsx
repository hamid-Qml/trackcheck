import { FunctionComponent, useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SignUp.module.css";

import logo from "@/assets/trakchek-logo.png";
import flexVertical from "@/assets/flex-vertical.png";
import { useAuth } from "@/contexts/AuthContext";

const SignUp: FunctionComponent = () => {
  const navigate = useNavigate();
  const { signup, status } = useAuth();

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
    return !(submitting || status === "loading") && email.trim() && password.length >= 8 && agree;
  }, [submitting, status, email, password, agree]);

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
      // success – pick a good post-signup page
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      const message = err?.message || "Something went wrong. Please try again.";
      setError(message);
      if (typeof message === "string") {
        if (message.toLowerCase().includes("email")) setFieldErrors((fe) => ({ ...fe, email: message }));
        else if (message.toLowerCase().includes("password")) setFieldErrors((fe) => ({ ...fe, password: message }));
      }
    } finally {
      setSubmitting(false);
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
                  <div
                    style={{
                      border: "1px solid #7f1d1d",
                      background: "rgba(239,68,68,0.08)",
                      color: "#fecaca",
                      borderRadius: 6,
                      padding: "10px 12px",
                      marginBottom: 8,
                      fontSize: 13,
                      lineHeight: "18px",
                    }}
                  >
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
                      />
                    </div>
                    {fieldErrors.fullName && <small id="name-error" style={{ color: "#fca5a5" }}>{fieldErrors.fullName}</small>}
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
                      />
                    </div>
                    {fieldErrors.email && <small id="email-error" style={{ color: "#fca5a5" }}>{fieldErrors.email}</small>}
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
                      />
                    </div>
                    {fieldErrors.password && <small id="password-error" style={{ color: "#fca5a5" }}>{fieldErrors.password}</small>}
                  </div>

                  <label className={styles.checkboxRow} htmlFor="agree">
                    <input id="agree" type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                    <span className={styles.checkboxText}>
                      I agree to the{" "}
                      <a className={styles.link} href="/terms" target="_blank" rel="noreferrer">Terms &amp; Conditions</a>
                    </span>
                  </label>
                  {fieldErrors.agree && <small style={{ color: "#fca5a5", marginTop: -8 }}>{fieldErrors.agree}</small>}

                  <button className={styles.cta} type="submit" disabled={!canSubmit}>
                    {submitting || status === "loading" ? "Creating account…" : "Create account"}
                  </button>

                  <div className={styles.footerNote}>
                    <span>Already have an account?</span>
                    <a className={styles.link} href="/login">Login</a>
                  </div>
                </form>
              </div>
            </div>
          </section>

          {/* RIGHT: Image panel */}
          <section className={styles.rightPane} style={{ ["--panel-bg" as any]: `url(${flexVertical})` }} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
