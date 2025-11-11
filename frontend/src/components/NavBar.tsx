import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import styles from "../pages/UploadTrack.module.css";
import logo from "@/assets/trakchek-logo.webp";

export default function NavBar() {
  const { user, logout, status } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const openLogin = () => {
    // Preserve "from" so ProtectedRoute or LoginDialog can bounce back
    navigate("/login", { state: { from: location } });
  };

  return (
    <div className={styles.navbar}>
      <div className={styles.div}>
        <div className={styles.container}>
          <div className={styles.flex}>
            <Link to="/" className={styles.brand}>
              <img src={logo} className={styles.trakchekBlk1Icon} alt="TrakChek" />
            </Link>
            <div className={styles.uploadTrackFlex}>
              <div className={styles.flex2}>
                <Link to="/" className={styles.button}><div className={styles.home}>Home</div></Link>
                <Link to="/process" className={styles.button}><div className={styles.home}>Upload</div></Link>
                <div className={styles.uploadTrackButton} />
                <Link to="/pricing" className={styles.button}><div className={styles.home}>Pricing</div></Link>
                <Link to="/forum" className={styles.button}><div className={styles.home}>Forum</div></Link>
              </div>

              {user ? (
                <div className={styles.userRow}>
                  <span className={styles.userName}>{user.full_name || user.email}</span>
                  <button type="button" className={styles.button4} onClick={logout}>
                    <div className={styles.home}>Logout</div>
                  </button>
                </div>
              ) : (
                <button type="button" className={styles.button4} onClick={openLogin} disabled={status === "loading"}>
                  <div className={styles.home}>{status === "loading" ? "…" : "Login"}</div>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
