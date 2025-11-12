import { FunctionComponent } from "react";
import styles from "./ProgressBar.module.css";

type Props = {
  visible?: boolean;
  state?: "indeterminate" | "success"; // success = quick fill to 100%
};

const ProgressBar: FunctionComponent<Props> = ({ visible = false, state = "indeterminate" }) => {
  if (!visible) return null;

  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-label="Uploading"
      aria-busy={state !== "success"}
      aria-live="polite"
    >
      {state === "indeterminate" ? (
        <div className={styles.sweep} />
      ) : (
        <div className={styles.fill} />
      )}
    </div>
  );
};

export default ProgressBar;
