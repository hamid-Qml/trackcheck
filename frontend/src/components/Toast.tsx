import { FunctionComponent, useEffect, useRef, useState } from "react";
import styles from "./Toast.module.css";

type ToastProps = {
  open: boolean;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  onClose?: () => void;     // parent must set open=false here
  duration?: number;        // ms
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center";
};

const Toast: FunctionComponent<ToastProps> = ({
  open,
  title = "Unsupported file format",
  description = "Please upload a track in MP3, WAV, M4A, or AAC format and try again.",
  actionText = "Try again",
  onAction,
  onClose,
  duration = 3000,
  position = "top-center",   // default to top center now
}) => {
  const [hiding, setHiding] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // start/clear timer when `open` changes
  useEffect(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    if (open) {
      setHiding(false);
      hideTimer.current = setTimeout(() => setHiding(true), duration);
    }
    return () => { if (hideTimer.current) clearTimeout(hideTimer.current); };
  }, [open, duration]);

  const handleAnimationEnd = () => {
    if (hiding) {
      // tell parent to close; parent must set open=false
      onClose?.();
      setHiding(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className={[styles.toast, styles[position], hiding ? styles.exit : styles.enter].join(" ")}
      role="status"
      aria-live="assertive"
      onAnimationEnd={handleAnimationEnd}
    >
      <div className={styles.contentWrapper}>
        <div className={styles.toasttext}>
          <div className={styles.unsupportedFileFormat}>{title}</div>
          <div className={styles.pleaseUploadA}>{description}</div>
        </div>
        {actionText && (
          <button
            className={styles.button}
            type="button"
            onClick={() => {
              onAction?.();
              setHiding(true);      // trigger close animation
            }}
          >
            <div className={styles.toastButton}>{actionText}</div>
          </button>
        )}
      </div>

      <div className={styles.timer} style={{ animationDuration: `${duration}ms` }} aria-hidden="true" />
    </div>
  );
};

export default Toast;
