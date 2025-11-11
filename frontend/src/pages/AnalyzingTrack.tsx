import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { feedbackService } from "@/services/feedbackService";
import styles from "./AnalyzingTrack.module.css";

const POLL_INTERVAL = 5000;

const AnalyzingTrack = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [progress, setProgress] = useState<{ percent: number; stage?: string }>({ percent: 0 });

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

  return (
    <div className={styles.analyzingTrack}>
      <div className={styles.analyzingTrackDiv}>
        <div className={styles.slot}>
          <div className={styles.analyzingTrackContainer}>
            <b className={styles.weAreAnalyzing}>We are analyzing your track!</b>
            <div className={styles.theAiIs}>
              The AI is picking up every beat, tone, and transition.<br />
              Sit tight, your personalized feedback will be ready soon!
            </div>
            <div style={{ marginTop: 40 }}>
              <p>Current stage: {progress.stage ?? "..."}</p>
              <p>Progress: {progress.percent ?? 0}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzingTrack;
