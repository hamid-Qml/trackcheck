import { FC, useEffect, useRef, useState } from "react";
import styles from "./LoginDialog.module.css";
import longLogo from "@/assets/long-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

type Props = { open: boolean; onClose: () => void };

const LoginDialog: FC<Props> = ({ open, onClose }) => {
  const { login, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !loading && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  // Focus email when opened
  useEffect(() => {
    if (open) setTimeout(() => emailRef.current?.focus(), 0);
  }, [open]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setErrMsg(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      // If user came from a protected page, go back there; otherwise to /dashboard (or /)
      const to = location.state?.from?.pathname || "/dashboard";
      onClose();
      navigate(to, { replace: true });
    } catch (err: any) {
      const data = err?.data;
      const serverMessage =
        (typeof data?.message === "string" && data.message) ||
        (Array.isArray(data?.message) && data.message.join("\n")) ||
        err?.message ||
        "Login failed. Please try again.";
      setErrMsg(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  const busy = loading || status === "loading";

  return (
    <div className={styles.overlay} onClick={() => !busy && onClose()} aria-hidden={false}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.dialogCloseIcon} onClick={onClose} aria-label="Close" disabled={busy}>
          <span className={styles.iconX} />
        </button>

        <div className={styles.flex}>
          <img className={styles.logoIcon} src={longLogo} alt="TrakChek" />
        </div>

        <div className={styles.flexVertical}>
          <div className={styles.header}>
            <b id="login-title" className={styles.loginToYour}>Login to your account</b>
            <div className={styles.enterYourEmail}>Enter your email below to login to your account.</div>
          </div>

          <form className={styles.form} onSubmit={submit}>
            {errMsg && (
              <div className={styles.error} role="alert" aria-live="polite">
                {errMsg}
              </div>
            )}

            <div className={styles.dialogFlexVertical}>
              <div className={styles.flexVertical2}>
                <div className={styles.inputBasic}>
                  <label className={styles.email} htmlFor="login-email">Email</label>
                  <div className={styles.input}>
                    <input
                      id="login-email"
                      ref={emailRef}
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      disabled={busy}
                    />
                  </div>
                </div>

                <div className={styles.inputBasic}>
                  <label className={styles.email} htmlFor="login-password">Password</label>
                  <div className={styles.input}>
                    <input
                      id="login-password"
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="current-password"
                      disabled={busy}
                    />
                  </div>
                </div>
              </div>

              <a className={styles.forgotYourPassword} href="/forgot-password">
                Forgot your password?
              </a>
            </div>

            <button className={styles.button} type="submit" disabled={busy}>
              <div className={styles.analyzeTrack}>{busy ? "Logging in…" : "Login"}</div>
            </button>

            <div className={styles.dialogFlex}>
              <div className={styles.dontHaveAn}>Don’t have an account?</div>
              <a className={styles.signUp} href="/signup">Sign up</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginDialog;
