import { useEffect, useMemo, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/services/api";
import styles from "./AnalyzeComplete.module.css";

type ReqBundle = {
  id: string;
  status: string;
  progress?: { percent: number; stage: string; status?: string };
  created_at: string;
  updated_at: string;
  selections?: { feedback_focus?: string | null; genre?: string | null; user_note?: string | null };
  upload?: {
    id: string;
    filename: string;
    file_path: string; // NOTE: we prepend backend base + /upload/
    duration?: number | null;
    size_mb?: number | null;
    genre?: string | null;
    feedback_focus?: string | null;
    status: string;
    created_at: string;
  } | null;
  reference_upload?: ReqBundle["upload"] | null;
  features?: {
    main?: any | null;
    reference?: any | null;
  };
  ai_feedback?: {
    id: string;
    mix_quality_score?: number | null;
    arrangement_score?: number | null;
    creativity_score?: number | null;
    suggestions_score?: number | null;
    mix_quality_text?: string | null;
    arrangement_text?: string | null;
    creativity_text?: string | null;
    suggestions_text?: string | null;
    recommendations?: Record<string, string[]>;
    reference_comparison_json?: any;
    reference_track_summary?: string | null;
    model?: string;
    prompt_version?: string | null;
    status: string;
    created_at: string;
    updated_at: string;
  } | null;
  computed?: { overall_score?: number | null };
};

type TabKey = "metrics" | "features" | "ai";

const emdash = "—";

// ---------- helpers ----------
function backendBase() {
  // allow "" (same-origin) or explicit http://localhost:8000
  return (import.meta as any)?.env?.VITE_BACKEND_URL ?? "http://localhost:8000";
}
function buildAudioUrl(relPath?: string | null) {
  if (!relPath) return "";
  // As requested: <backend>/<upload>/<file_path>
  return `${backendBase()}/uploads/${relPath}`.replace(/([^:]\/)\/+/g, "$1");
}

function extFromFilename(name?: string) {
  if (!name) return emdash;
  const i = name.lastIndexOf(".");
  if (i === -1) return emdash;
  return name.slice(i + 1).toUpperCase();
}
function formatSeconds(sec?: number | null) {
  if (sec == null) return emdash;
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}
function pct(n?: number | null) {
  if (n == null || Number.isNaN(n)) return emdash;
  return `${Math.round(n)}%`;
}
function titleCase(s: string) {
  return s.replace(/_/g, " ").replace(/\w\S*/g, (w) => w[0].toUpperCase() + w.slice(1));
}
function fmtNum(v: any, suffix?: string) {
  if (v == null || Number.isNaN(Number(v))) return emdash;
  const n = Number(v);
  return `${Math.round(n)}${suffix ? ` ${suffix}` : ""}`;
}

// ---------- components ----------
function MetricRow({ label, sub, value }: { label: string; sub: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={styles.metricRow}>
      <div className={styles.metricTitle}>
        <div className={styles.metricLabel}>{label}</div>
        <div className={styles.metricSub}>{sub}</div>
      </div>
      <div className={styles.metricBarWrap}>
        <div className={styles.metricBar}>
          <div className={styles.metricBarFill} style={{ width: `${clamped}%` }} />
        </div>
        <div className={styles.metricPct}>{clamped}%</div>
      </div>
    </div>
  );
}
function ScoreTile({ label, value }: { label: string; value?: number | null }) {
  const show = value != null && Number.isFinite(Number(value));
  const v = show ? Math.round(Number(value)) : null;
  return (
    <div className={styles.scoreTile}>
      <div className={styles.scoreTileLabel}>{label}</div>
      <div className={styles.scoreTileBar}>
        <div className={styles.scoreTileFill} style={{ width: show ? `${v}%` : "0%" }} />
      </div>
      <div className={styles.scoreTileValue}>{show ? `${v}%` : emdash}</div>
    </div>
  );
}
function KV({ title, value }: { title: string; value: string | number }) {
  return (
    <div className={styles.kv}>
      <div className={styles.kvLabel}>{title}</div>
      <div className={styles.kvValue}>{value as any}</div>
    </div>
  );
}
function renderMetricIfPresent(label: string, sub: string, value: number | null) {
  if (value == null) return null;
  return <MetricRow key={label} label={label} sub={sub} value={value} />;
}

const AnalyzeComplete = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ReqBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("ai"); // land on AI if present
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api(`/feedback/requests/${id}`);
        setData(res);
        // choose initial tab smartly
        if (res?.ai_feedback) setTab("ai");
        else if (res?.features?.main) setTab("features");
        else setTab("metrics");
      } catch (e) {
        console.error(e);
        setErr("Failed to load analysis.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const filename = data?.upload?.filename ?? "";
  const format = extFromFilename(filename);

  // Prefer feature duration if upload one is missing
  const durationSecs: number | null =
    (data?.upload?.duration ?? null) ??
    (data?.features?.main?.duration ?? null) ??
    null;
  const duration = formatSeconds(durationSecs);

  const tempo = data?.features?.main?.tempo as number | undefined;
  const keySig = data?.features?.main?.key as string | undefined;

  const peakObj = data?.features?.main?.peak_rms;
  const loudnessText =
    peakObj && typeof peakObj === "object" && Number.isFinite(peakObj?.dbfs)
      ? `${Math.round(Number(peakObj.dbfs))} dBFS`
      : peakObj && Number.isFinite(Number(peakObj))
      ? `${Math.round(Number(peakObj))} (lin)`
      : emdash;

  const flatness = data?.features?.main?.flatness as number | undefined;

  // tiles: useful quick facts
  const centroid = data?.features?.main?.spectral_centroid;
  const rolloff = data?.features?.main?.spectral_rolloff;
  const bandwidth = data?.features?.main?.bandwidth;
  const fileSizeMb = data?.upload?.size_mb;

  const audioSrc = buildAudioUrl(data?.upload?.file_path);
  console.log("audioSrc", audioSrc);

  const scoreText = useMemo(() => {
    if (data?.computed?.overall_score == null) return emdash;
    const x = Number(data.computed.overall_score);
    return Number.isFinite(x) ? x.toFixed(1) : emdash;
  }, [data?.computed?.overall_score]);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.centerWrap}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonCard} />
        </div>
      </div>
    );
  }
  if (err) {
    return (
      <div className={styles.page}>
        <div className={styles.centerWrap}>
          <div className={styles.error}>{err}</div>
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className={styles.page}>
        <div className={styles.centerWrap}>
          <div className={styles.error}>No data found.</div>
        </div>
      </div>
    );
  }

  const selFocus = data.selections?.feedback_focus ?? data.upload?.feedback_focus ?? null;
  const selGenre = data.selections?.genre ?? data.upload?.genre ?? null;
  const selNote = data.selections?.user_note ?? null;

  // snapshot metrics (if you ever populate them)
  const snapshot = data?.features?.main?.summary_snapshot ?? null;
  const danceability = snapshot?.danceability ?? null;
  const valence = snapshot?.valence ?? null;
  const liveness = snapshot?.liveness ?? null;
  const acousticness = snapshot?.acousticness ?? null;
  const instrumentalness = snapshot?.instrumentalness ?? null;

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.navbar}>
        <div className={styles.navInner}>
          <div className={styles.brandRow}>
            <div className={styles.brand}>
              TRAK<span>CHEK</span>
            </div>
            <div className={styles.navRight}>
              <Link to="/" className={styles.navLink}>Home</Link>
              <Link to="/upload" className={`${styles.navLink} ${styles.navLinkOutline}`}>Upload</Link>
              <Link to="/pricing" className={styles.navLink}>Pricing</Link>
              <Link to="/forum" className={styles.navLink}>Forum</Link>
              <Link to="/login" className={styles.loginBtn}>Login</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Title + actions */}
      <div className={styles.headerWrap}>
        <h1 className={styles.title}>Analysis Complete</h1>

        <div className={styles.fileRow}>
          <div className={styles.filePill} title={filename}>
            <div className={styles.fileDot} />
            <span className={styles.fileName}>{filename || "Your track"}</span>
          </div>

          <div className={styles.actions}>
            {/* takes you to homepage as requested */}
            <Link to="/" className={`${styles.ghostBtn} ${styles.actionBtn}`}>Analyze another track</Link>
            <button className={`${styles.ghostBtn} ${styles.actionBtn}`} type="button" disabled title="Coming soon">Share</button>
            <button className={`${styles.ghostBtn} ${styles.actionBtn}`} type="button" disabled title="Coming soon">Export report</button>
          </div>
        </div>

        {/* Selections summary */}
        <div className={styles.selectionBar}>
          <div className={styles.selectionItem}>
            <span className={styles.selectionLabel}>Genre</span>
            <span className={styles.selectionValue}>{selGenre || emdash}</span>
          </div>
          <div className={styles.selectionItem}>
            <span className={styles.selectionLabel}>Feedback focus</span>
            <span className={styles.selectionValue}>{selFocus || emdash}</span>
          </div>
          <div className={styles.selectionItemWide} title={selNote || ""}>
            <span className={styles.selectionLabel}>Note</span>
            <span className={styles.selectionValue}>{selNote || "No note provided"}</span>
          </div>
        </div>
      </div>

      {/* Score pill */}
      <div className={styles.scoreCard}>
        <div className={styles.scoreLeft}>
          <div className={styles.noteIcon} aria-hidden="true" />
          <div className={styles.scoreValue}>{scoreText}</div>
        </div>
        <div className={styles.scoreText}>
          <div className={styles.scoreTitle}>Overall Score</div>
          <div className={styles.scoreSub}>
            Combines mix, arrangement, creativity, and quality to show how polished and release-ready your track is.
          </div>
        </div>
      </div>

      {/* Main card */}
      <div className={styles.mainCard}>
        {/* Left column */}
        <div className={styles.leftCol}>
          <div className={styles.sectionHeader}>
            <div>
              <div className={styles.sectionTitle}>Audio Overview</div>
              <div className={styles.sectionSub}>Waveform analysis</div>
            </div>

            <div className={styles.infoSplit}>
              <div className={styles.infoCell}>
                <div className={styles.infoLabel}>Format</div>
                <div className={styles.infoValue}>{format}</div>
              </div>
              <div className={styles.vertSep} />
              <div className={styles.infoCell}>
                <div className={styles.infoLabel}>Duration</div>
                <div className={styles.infoValue}>{duration}</div>
              </div>
            </div>
          </div>

          {/* Real audio player */}
          <div className={styles.playerWrap}>
            {audioSrc ? (
              <audio
                ref={audioRef}
                className={styles.audio}
                src={audioSrc}
                controls
                preload="metadata"
              />
            ) : (
              <div className={styles.audioEmpty}>Audio file unavailable.</div>
            )}
          </div>

          {/* Badges */}
          <div className={styles.badges}>
            <div className={styles.badge}>
              <span className={styles.badgeLabel}>Tempo</span>
              <span className={styles.badgeValue}>
                {tempo != null ? `${Math.round(tempo)} BPM` : emdash}
              </span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeLabel}>Key</span>
              <span className={styles.badgeValue}>{keySig || emdash}</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeLabel}>Loudness</span>
              <span className={styles.badgeValue}>{loudnessText}</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeLabel}>Flatness</span>
              <span className={styles.badgeValue}>
                {flatness != null ? Number(flatness).toFixed(3) : emdash}
              </span>
            </div>
          </div>

          {/* Quick facts tiles (replacing sample rate/bitrate/time signature) */}
          <div className={styles.tileGrid}>
            <div className={styles.tile}>
              <div className={styles.tileLabel}>File Size</div>
              <div className={styles.tileValue}>
                {fileSizeMb ? `${fileSizeMb.toFixed(2)} MB` : emdash}
              </div>
            </div>
            <div className={styles.tile}>
              <div className={styles.tileLabel}>Spectral Centroid</div>
              <div className={styles.tileValue}>{fmtNum(centroid, "Hz")}</div>
            </div>
            <div className={styles.tile}>
              <div className={styles.tileLabel}>Spectral Rolloff</div>
              <div className={styles.tileValue}>{fmtNum(rolloff, "Hz")}</div>
            </div>
            <div className={styles.tile}>
              <div className={styles.tileLabel}>Bandwidth</div>
              <div className={styles.tileValue}>{fmtNum(bandwidth, "Hz")}</div>
            </div>
          </div>
        </div>

        {/* Right column with tabs */}
        <div className={styles.rightCol}>
          <div className={styles.tabsRow}>
            <button
              className={`${styles.tab} ${tab === "features" ? styles.tabActive : ""}`}
              onClick={() => setTab("features")}
              type="button"
            >
              Spectral / Features
            </button>
            <button
              className={`${styles.tab} ${tab === "ai" ? styles.tabActive : ""}`}
              onClick={() => setTab("ai")}
              type="button"
            >
              AI Feedback
            </button>
          </div>

          {/* Tab panels */}
          {tab === "metrics" && (
            <div className={styles.metricsCol}>
              {renderMetricIfPresent("Danceability", "How suitable the track is for dancing.", danceability)}
              {renderMetricIfPresent("Valence", "Musical positivity and uplifting quality.", valence)}
              {renderMetricIfPresent("Instrumentalness", "Predicts whether a track contains vocals.", instrumentalness)}
              {renderMetricIfPresent("Liveness", "Performance recorded with audience ambience.", liveness)}
              {renderMetricIfPresent("Acousticness", "Likelihood of the track being acoustic.", acousticness)}
              {danceability == null &&
                valence == null &&
                instrumentalness == null &&
                liveness == null &&
                acousticness == null && (
                  <div className={styles.metricsEmpty}>
                    No summarized audio metrics available for this track yet.
                  </div>
                )}
            </div>
          )}

          {tab === "features" && (
            <div className={styles.featuresPanel}>
              <KV title="Spectral Centroid" value={fmtNum(centroid, "Hz")} />
              <KV title="Spectral Rolloff" value={fmtNum(rolloff, "Hz")} />
              <KV title="Bandwidth" value={fmtNum(bandwidth, "Hz")} />
              <KV title="Flatness" value={flatness != null ? Number(flatness).toFixed(6) : emdash} />
              <KV
                title="Transient count"
                value={Array.isArray(data?.features?.main?.transients_info) ? data!.features!.main!.transients_info.length : emdash}
              />
              <KV
                title="Drop timestamps"
                value={Array.isArray(data?.features?.main?.drop_timestamps) ? data!.features!.main!.drop_timestamps.length : emdash}
              />
              <KV
                title="Vocal events"
                value={Array.isArray(data?.features?.main?.vocal_timestamps) ? data!.features!.main!.vocal_timestamps.length : emdash}
              />
              <div className={styles.noteBox}>
                Extracted at:{" "}
                {data?.features?.main?.extracted_at ? new Date(data.features.main.extracted_at).toLocaleString() : emdash}
              </div>
            </div>
          )}

          {tab === "ai" && (
            <div className={styles.aiPanel}>
              <div className={styles.aiScoreGrid}>
                <ScoreTile label="Mix Quality" value={data?.ai_feedback?.mix_quality_score} />
                <ScoreTile label="Arrangement" value={data?.ai_feedback?.arrangement_score} />
                <ScoreTile label="Creativity" value={data?.ai_feedback?.creativity_score} />
                <ScoreTile label="Suggestions" value={data?.ai_feedback?.suggestions_score} />
              </div>

              <AIBlock
                title="Mix Quality"
                body={data?.ai_feedback?.mix_quality_text}
                bullets={data?.ai_feedback?.recommendations?.mix_quality}
              />
              <AIBlock
                title="Arrangement"
                body={data?.ai_feedback?.arrangement_text}
                bullets={data?.ai_feedback?.recommendations?.arrangement}
              />
              <AIBlock
                title="Creativity"
                body={data?.ai_feedback?.creativity_text}
                bullets={data?.ai_feedback?.recommendations?.creativity}
              />
              <AIBlock
                title="Overall Suggestions"
                body={data?.ai_feedback?.suggestions_text}
                bullets={data?.ai_feedback?.recommendations?.suggestions_for_improvement}
              />

              <div className={styles.metaRow}>
                <span>Model: {data?.ai_feedback?.model || emdash}</span>
                <span>Prompt v{data?.ai_feedback?.prompt_version || emdash}</span>
                <span>
                  Generated:{" "}
                  {data?.ai_feedback?.created_at ? new Date(data.ai_feedback.created_at).toLocaleString() : emdash}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function AIBlock({ title, body, bullets }: { title: string; body?: string | null; bullets?: string[] }) {
  if (!body && !bullets?.length) return null;
  return (
    <div className={styles.aiText}>
      <div className={styles.aiTextTitle}>{title}</div>
      {body && <p className={styles.aiTextBody}>{body}</p>}
      {bullets?.length ? (
        <ul className={styles.aiBulletList}>
          {bullets.slice(0, 6).map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default AnalyzeComplete;
