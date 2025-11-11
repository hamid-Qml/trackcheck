import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "@/services/api";
import styles from "./AnalyzeComplete.module.css";

const AnalyzeComplete = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api(`/feedback/requests/${id}`);
        setData(res);
      } catch (err) {
        console.error("Failed to load analysis", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className={styles.analyzeComplete}>Loading analysis...</div>;
  if (!data) return <div className={styles.analyzeComplete}>No data found.</div>;

  // For now, show JSON preview
  return (
    <div className={styles.analyzeComplete}>
      <div className={styles.analyzeCompleteDiv}>
        <div className={styles.slot}>
          <div className={styles.analyzeCompleteContainer}>
            <b className={styles.analysisComplete}>Analysis Complete</b>
            <pre style={{ textAlign: "left", background: "#111", padding: 20, borderRadius: 8 }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzeComplete;
