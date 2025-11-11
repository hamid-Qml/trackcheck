import { FunctionComponent } from "react";
import styles from "./ProgressBar.module.css";

/**
 * Indeterminate progress bar for "uploading..."
 */
const ProgressBar: FunctionComponent<{ visible?: boolean }> = ({ visible = false }) => {
  if (!visible) return null;
  return (
   <div
    className={styles.aspectRatio}
    role="progressbar"
    aria-label="Uploading"
    aria-busy="true"
    aria-live="polite"
  >
    <div className={styles.aspectRatioKeeperRotated} />
  </div>
  );
};

export default ProgressBar;
