// AnalyzingTrack.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { feedbackService } from "@/services/feedbackService";
import styles from "./AnalyzingTrack.module.css";
import beats from "@/assets/beats.mp4"; // ⬅️ add this import

const POLL_INTERVAL = 5000;

const AnalyzingTrack = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [progress, setProgress] = useState<{ percent: number; stage?: string }>({ percent: 0 });

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    let timer: any;

    async function poll() {
      try {
        const res = await feedbackService.getStatus(id!);
        setStatus(res.status);
        setProgress(res.progress);
        if (res.status === "completed") {
          navigate(`/analysis/${id}`);
          return;
        }
      } catch (err) {
        console.warn("Polling failed", err);
      }
      timer = setTimeout(poll, POLL_INTERVAL);
    }

    poll();
    return () => clearTimeout(timer);
  }, [id, navigate]);

  // Respect reduced motion; pause/remove autoplay if user prefers it
  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    const el = videoRef.current;
    if (!mq || !el) return;
    const apply = () => {
      if (mq.matches) { el.pause(); el.removeAttribute("autoplay"); }
      else if (el.paused) { el.play().catch(() => {}); }
    };
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  return (
    <div className={styles.analyzingTrack}>
      <div className={styles.analyzingTrackDiv}>
        <div className={styles.slot}>
          {/* 🔽 Background media layer */}
          <div className={styles.mediaBg} aria-hidden="true">
            <video
              ref={videoRef}
              className={styles.videoBg}
              src={beats}
              muted
              loop
              autoPlay
              playsInline
              preload="auto"
            />
            <div className={styles.vignette} />
          </div>

          {/* Foreground content */}
           <div className={styles.analyzingTrackContainer}>
            <b className={styles.weAreAnalyzing}>We are analyzing your track!</b>
            <div className={styles.theAiIs}>
              The AI is picking up every beat, tone, and transition.<br />
              Your personalized feedback will be ready soon.
            </div>

            {/* Progress only (no stage text) */}
            <div className={styles.progressWrap}
                 role="progressbar"
                 aria-label="Analysis progress"
                 aria-valuemin={0}
                 aria-valuemax={100}
                 aria-valuenow={Math.round(progress.percent ?? 0)}>
              <div
                className={styles.progressBar}
                style={{ width: `${Math.max(0, Math.min(100, progress.percent || 0))}%` }}
              />
            </div>
            <div className={styles.progressText}>
              {Math.round(progress.percent || 0)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzingTrack;
