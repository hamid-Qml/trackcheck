import { FunctionComponent } from "react";
import styles from "./Toast.module.css";

type ToastProps = {
  open: boolean;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  onClose?: () => void; // (optional) click outside / timer if you later add it
};

const Toast: FunctionComponent<ToastProps> = ({
  open,
  title = "Unsupported file format",
  description = "Please upload a track in MP3, WAV, M4A, or AAC format and try again.",
  actionText = "Try again",
  onAction,
}) => {
  if (!open) return null;

  return (
    <div className={styles.toast}>
      <div className={styles.contentWrapper}>
        <div className={styles.toasttext}>
          <div className={styles.unsupportedFileFormat}>{title}</div>
          <div className={styles.pleaseUploadA}>{description}</div>
        </div>
        <button className={styles.button} type="button" onClick={onAction}>
          <div className={styles.toastButton}>{actionText}</div>
        </button>
      </div>
    </div>
  );
};

export default Toast;
