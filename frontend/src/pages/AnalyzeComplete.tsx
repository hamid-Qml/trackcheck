import {
  useEffect,
  useMemo,
  useState,
  useRef,
  type MouseEvent,
} from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "@/services/api";
import styles from "./AnalyzeComplete.module.css";

// ---- icon assets ----
import AiInsightsIcon from "@/assets/analyze_comlpete/ai_insights.png";
import AnalyzeAnotherIcon from "@/assets/analyze_comlpete/analyze_another_track.svg";
import AudioMetricsIcon from "@/assets/analyze_comlpete/audio_metrics.png";
import EnergyIcon from "@/assets/analyze_comlpete/energy.svg";
import ExportReportIcon from "@/assets/analyze_comlpete/export_report.svg";
import KeyIcon from "@/assets/analyze_comlpete/Key.svg";
import LoudnessIcon from "@/assets/analyze_comlpete/loudness.png";
import PauseAudioIcon from "@/assets/analyze_comlpete/PauseAudio.png";
import PlayAudioIcon from "@/assets/analyze_comlpete/PlayAudio.svg";
import ShareIcon from "@/assets/analyze_comlpete/share.svg";
import SpectralAnalysisIcon from "@/assets/analyze_comlpete/spectral_analysis.png";
import TempoIcon from "@/assets/analyze_comlpete/tempo.svg";

type ReqBundle = {
  id: string;
  status: string;
  progress?: { percent: number; stage: string; status?: string };
  created_at: string;
  updated_at: string;
  selections?: {
    feedback_focus?: string | null;
    genre?: string | null;
    user_note?: string | null;
  };
  upload?: {
    id: string;
    filename: string;
    file_path: string;
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
function uploadsBase() {
  // Optional: VITE_UPLOAD_BASE can be "https://trackcheck..." in prod
  // If not set, we assume same-origin and just use "/uploads"
  return (import.meta as any)?.env?.VITE_UPLOAD_BASE ?? "";
}

function buildAudioUrl(relPath?: string | null) {
  if (!relPath) return "";
  return `${uploadsBase()}/uploads/${relPath}`.replace(/([^:]\/)\/+/g, "$1");
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

function fmtNum(v: any, suffix?: string) {
  if (v == null || Number.isNaN(Number(v))) return emdash;
  const n = Number(v);
  return `${Math.round(n)}${suffix ? ` ${suffix}` : ""}`;
}

// ---------- small components ----------
function ScoreTile({ label, value }: { label: string; value?: number | null }) {
  const show = value != null && Number.isFinite(Number(value));
  const v = show ? Math.round(Number(value)) : null;
  return (
    <div className={styles.scoreTile}>
      <div className={styles.scoreTileLabel}>{label}</div>
      <div className={styles.scoreTileBar}>
        <div
          className={styles.scoreTileFill}
          style={{ width: show ? `${v}%` : "0%" }}
        />
      </div>
      <div className={styles.scoreTileValue}>
        {show ? `${v}%` : emdash}
      </div>
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

// Simple “sparkline” style graph for energy_profile
function EnergyGraph({ profile }: { profile?: { t: number; rms: number }[] }) {
  if (!profile || !profile.length) {
    return (
      <div className={styles.metricsEmpty}>
        No energy profile available for this track.
      </div>
    );
  }

  const maxLen = 120;
  const step = Math.max(1, Math.floor(profile.length / maxLen));
  const bars = profile.filter((_, idx) => idx % step === 0);
  const max = bars.reduce((m, b) => (b.rms > m ? b.rms : m), 0) || 1;

  return (
    <div className={styles.energyBlock}>
      <div className={styles.energyHeader}>
        <div className={styles.energyTitle}>Energy over time</div>
        <div className={styles.energySub}>
          Each bar shows relative RMS loudness across the track.
        </div>
      </div>
      <div className={styles.energyGraph}>
        {bars.map((b, i) => (
          <div
            key={i}
            className={styles.energyBar}
            style={{ height: `${(b.rms / max) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}

type EnergyPoint = { t: number; rms: number };

function EnergyTimeline({
  duration,
  energyProfile,
  vocalSegments,
  dropTimestamps,
}: {
  duration: number | null;
  energyProfile?: EnergyPoint[];
  vocalSegments?: { start: number; end: number }[];
  dropTimestamps?: number[];
}) {
  if (!duration || duration <= 0) {
    return (
      <div className={styles.metricsEmpty}>
        No timeline information available for this track.
      </div>
    );
  }

  const profile = energyProfile && energyProfile.length ? energyProfile : undefined;

  let bars: EnergyPoint[] = [];
  let maxRms = 1;

  if (profile) {
    const maxLen = 120;
    const step = Math.max(1, Math.floor(profile.length / maxLen));
    bars = profile.filter((_, idx) => idx % step === 0);
    maxRms =
      bars.reduce((m, b) => (typeof b.rms === "number" && b.rms > m ? b.rms : m), 0) ||
      1;
  }

  const drops = (dropTimestamps || []).filter((t) => t >= 0 && t <= duration);
  const vocals = (vocalSegments || []).filter(
    (seg) =>
      typeof seg?.start === "number" &&
      typeof seg?.end === "number" &&
      seg.end > seg.start
  );

  return (
    <div className={styles.energyBlock}>
      <div className={styles.energyHeader}>
        <div className={styles.energyTitle}>Timeline</div>
        <div className={styles.energySub}>
          RMS loudness (bars), vocal sections (teal bands) and drops (markers).
        </div>
      </div>

      <div className={styles.timeline}>
        {/* background energy bars */}
        {bars.length > 0 && (
          <div className={styles.energyGraph}>
            {bars.map((b, i) => (
              <div
                key={i}
                className={styles.energyBar}
                style={{ height: `${(b.rms / maxRms) * 100}%` }}
              />
            ))}
          </div>
        )}

        {/* overlay: vocal segments */}
        <div className={styles.timelineOverlay}>
          {vocals.map((seg, i) => {
            const left = (seg.start / duration) * 100;
            const width = ((seg.end - seg.start) / duration) * 100;
            return (
              <div
                key={i}
                className={styles.timelineVocal}
                style={{ left: `${left}%`, width: `${width}%` }}
              />
            );
          })}

          {/* overlay: drops */}
          {drops.map((t, i) => {
            const left = (t / duration) * 100;
            return (
              <div
                key={i}
                className={styles.timelineDrop}
                style={{ left: `${left}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------- AI text block ----------
function AIBlock({
  title,
  body,
  bullets,
}: {
  title: string;
  body?: string | null;
  bullets?: string[];
}) {
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

// ---------- main component ----------
const AnalyzeComplete = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ReqBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("ai");

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);


  const [intrinsicDuration, setIntrinsicDuration] = useState<number | null>(
    null
  );

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api(`/feedback/requests/${id}`);
        setData(res);
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

  const durationSecsFromData: number | null =
    (data?.upload?.duration ?? null) ??
    (data?.features?.main?.duration ?? null) ??
    null;

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
  const centroid = data?.features?.main?.spectral_centroid;
  const rolloff = data?.features?.main?.spectral_rolloff;
  const bandwidth = data?.features?.main?.bandwidth;

  const fileSizeMb = data?.upload?.size_mb;

  const energyProfile = data?.features?.main?.energy_profile as
    | { t: number; rms: number }[]
    | undefined;

  const audioSrc = buildAudioUrl(data?.upload?.file_path);
  console.log("Audio src", { audioSrc });

  const totalDurationForUI = durationSecsFromData ?? intrinsicDuration ?? null;

  const durationLabel = formatSeconds(totalDurationForUI ?? durationSecsFromData);

  const scoreText = useMemo(() => {
    if (data?.computed?.overall_score == null) return emdash;
    const x = Number(data.computed.overall_score);
    return Number.isFinite(x) ? x.toFixed(1) : emdash;
  }, [data?.computed?.overall_score]);

  // audio event wiring
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTime = () => setCurrentTime(audio.currentTime || 0);
    const handleLoaded = () => setIntrinsicDuration(audio.duration || null);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("loadedmetadata", handleLoaded);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("loadedmetadata", handleLoaded);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [audioSrc]);

  // reset when new audio path comes in
  useEffect(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, [audioSrc]);

  const progressPct =
    totalDurationForUI && totalDurationForUI > 0
      ? Math.min(100, Math.max(0, (currentTime / totalDurationForUI) * 100))
      : 0;

  const handlePlayToggle = async () => {
  const audio = audioRef.current;

  if (!audio || !audioSrc) {
    console.warn("No audio element or source", { audio, audioSrc });
    return;
  }

  try {
    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  } catch (err) {
    console.error("Error playing audio:", err);
  }
};


  const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !totalDurationForUI || totalDurationForUI <= 0) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const newTime = ratio * totalDurationForUI;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

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

  const selFocus =
    data.selections?.feedback_focus ?? data.upload?.feedback_focus ?? null;
  const selGenre = data.selections?.genre ?? data.upload?.genre ?? null;
  const selNote = data.selections?.user_note ?? null;

  const snapshot = data?.features?.main?.summary_snapshot ?? null;

  // ---------- render ----------
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
              <Link to="/" className={styles.navLink}>
                Home
              </Link>
              <Link
                to="/upload"
                className={`${styles.navLink} ${styles.navLinkOutline}`}
              >
                Upload
              </Link>
              <Link to="/pricing" className={styles.navLink}>
                Pricing
              </Link>
              <Link to="/forum" className={styles.navLink}>
                Forum
              </Link>
              <Link to="/login" className={styles.loginBtn}>
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Header / file row */}
      <div className={styles.headerWrap}>
        <h1 className={styles.title}>Analysis Complete</h1>

        <div className={styles.fileRow}>
          <div className={styles.filePill} title={filename}>
            <div className={styles.fileDot} />
            <span className={styles.fileName}>{filename || "Your track"}</span>
          </div>

          <div className={styles.actions}>
            <Link to="/" className={`${styles.ghostBtn} ${styles.actionBtn}`}>
              <img src={AnalyzeAnotherIcon} alt="" className={styles.btnIcon} />
              <span>Analyze another track</span>
            </Link>
            <button
              className={`${styles.ghostBtn} ${styles.actionBtn}`}
              type="button"
              disabled
              title="Coming soon"
            >
              <img src={ShareIcon} alt="" className={styles.btnIcon} />
              <span>Share</span>
            </button>
            <button
              className={`${styles.ghostBtn} ${styles.actionBtn}`}
              type="button"
              disabled
              title="Coming soon"
            >
              <img src={ExportReportIcon} alt="" className={styles.btnIcon} />
              <span>Export report</span>
            </button>
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
            <span className={styles.selectionValue}>
              {selNote || "No note provided"}
            </span>
          </div>
        </div>
      </div>

      {/* Score pill */}
      <div className={styles.scoreCard}>
        <div className={styles.scoreLeft}>
          <div className={styles.scoreValue}>{scoreText}</div>
        </div>
        <div className={styles.scoreText}>
          <div className={styles.scoreTitle}>Overall Score</div>
          <div className={styles.scoreSub}>
            Combines mix, arrangement, creativity, and quality to show how polished
            and release-ready your track is.
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
                <div className={styles.infoValue}>{durationLabel}</div>
              </div>
            </div>
          </div>

          {/* Custom audio player */}
          <div className={styles.playerWrap}>
            <div className={styles.playerInner}>
              <button
                type="button"
                className={styles.playBtn}
                onClick={handlePlayToggle}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                <img
                  src={isPlaying ? PauseAudioIcon : PlayAudioIcon}
                  alt=""
                  className={styles.playIcon}
                />
              </button>

              <div className={styles.playerMain}>
                <div className={styles.wave} onClick={handleSeek}>
                  <div className={styles.waveBg} />
                  <div
                    className={styles.waveProgress}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <div className={styles.timeRow}>
                  <span className={styles.timeLabel}>
                    {formatSeconds(currentTime)}
                  </span>
                  <span className={styles.timeLabel}>{durationLabel}</span>
                </div>
              </div>
            </div>

            {/* Hidden but always-mounted audio element for ref */}
           
<audio
  ref={audioRef}
  src={audioSrc || undefined}
  preload="metadata"
  crossOrigin="anonymous"
  onError={() => {
    const a = audioRef.current;
    const code = a?.error?.code; // 1..4
  }}
  className={styles.hiddenAudio}
/>


          </div>

          {/* Badges row (tempo/key/loudness/file size) */}
          <div className={styles.badges}>
            <div className={styles.badge}>
              <img src={TempoIcon} alt="" className={styles.badgeIcon} />
              <span className={styles.badgeLabel}>Tempo</span>
              <span className={styles.badgeValue}>
                {tempo != null ? `${Math.round(tempo)} BPM` : emdash}
              </span>
            </div>
            <div className={styles.badge}>
              <img src={KeyIcon} alt="" className={styles.badgeIcon} />
              <span className={styles.badgeLabel}>Key</span>
              <span className={styles.badgeValue}>{keySig || emdash}</span>
            </div>
            <div className={styles.badge}>
              <img src={LoudnessIcon} alt="" className={styles.badgeIcon} />
              <span className={styles.badgeLabel}>Loudness</span>
              <span className={styles.badgeValue}>{loudnessText}</span>
            </div>
            <div className={styles.badge}>
              <img src={EnergyIcon} alt="" className={styles.badgeIcon} />
              <span className={styles.badgeLabel}>File Size</span>
              <span className={styles.badgeValue}>
                {fileSizeMb ? `${fileSizeMb.toFixed(2)} MB` : emdash}
              </span>
            </div>
          </div>

          {/* Tabs row */}
          <div className={styles.tabsRow}>
            <button
              className={`${styles.tab} ${tab === "metrics" ? styles.tabActive : ""
                }`}
              onClick={() => setTab("metrics")}
              type="button"
            >
              <img src={AudioMetricsIcon} alt="" className={styles.tabIcon} />
              <span>Audio Metrics</span>
            </button>
            <button
              className={`${styles.tab} ${tab === "features" ? styles.tabActive : ""
                }`}
              onClick={() => setTab("features")}
              type="button"
            >
              <img src={SpectralAnalysisIcon} alt="" className={styles.tabIcon} />
              <span>Spectral Analysis</span>
            </button>
            <button
              className={`${styles.tab} ${tab === "ai" ? styles.tabActive : ""
                }`}
              onClick={() => setTab("ai")}
              type="button"
            >
              <img src={AiInsightsIcon} alt="" className={styles.tabIcon} />
              <span>AI Insights</span>
            </button>
          </div>

          {/* Tab panels directly under tabs */}
          <div className={styles.tabPanels}>
            {tab === "metrics" && (
              <>
                {/* Optional snapshot metrics if present */}
                {snapshot?.danceability != null && (
                  <div className={styles.metricRowSimple}>
                    <div className={styles.metricLabel}>Danceability</div>
                    <div className={styles.metricValue}>
                      {pct(snapshot.danceability)}
                    </div>
                  </div>
                )}
                {snapshot?.valence != null && (
                  <div className={styles.metricRowSimple}>
                    <div className={styles.metricLabel}>Valence</div>
                    <div className={styles.metricValue}>
                      {pct(snapshot.valence)}
                    </div>
                  </div>
                )}
                {snapshot?.liveness != null && (
                  <div className={styles.metricRowSimple}>
                    <div className={styles.metricLabel}>Liveness</div>
                    <div className={styles.metricValue}>
                      {pct(snapshot.liveness)}
                    </div>
                  </div>
                )}
                {snapshot?.acousticness != null && (
                  <div className={styles.metricRowSimple}>
                    <div className={styles.metricLabel}>Acousticness</div>
                    <div className={styles.metricValue}>
                      {pct(snapshot.acousticness)}
                    </div>
                  </div>
                )}
                {snapshot?.instrumentalness != null && (
                  <div className={styles.metricRowSimple}>
                    <div className={styles.metricLabel}>Instrumentalness</div>
                    <div className={styles.metricValue}>
                      {pct(snapshot.instrumentalness)}
                    </div>
                  </div>
                )}

                <EnergyTimeline
                  duration={totalDurationForUI ?? durationSecsFromData ?? null}
                  energyProfile={energyProfile}
                  vocalSegments={data?.features?.main?.vocal_timestamps}
                  dropTimestamps={data?.features?.main?.drop_timestamps}
                />
              </>
            )}

            {tab === "features" && (
              <div className={styles.metricsCol}>
                <KV title="Spectral Centroid" value={fmtNum(centroid, "Hz")} />
            <KV title="Spectral Rolloff" value={fmtNum(rolloff, "Hz")} />
            <KV title="Bandwidth" value={fmtNum(bandwidth, "Hz")} />
                <EnergyGraph profile={energyProfile} />
              </div>
            )}

            {tab === "ai" && (
              <div className={styles.metricsCol}>
                {data.ai_feedback && (
                  <div className={styles.aiPanel}>
                    <div className={styles.noteBox}>
                      AI Scores:
                    </div>
                    <div className={styles.aiScoreGrid}>
                      <ScoreTile
                        label="Mix Quality"
                        value={data.ai_feedback.mix_quality_score}
                      />
                      <ScoreTile
                        label="Arrangement"
                        value={data.ai_feedback.arrangement_score}
                      />
                      <ScoreTile
                        label="Creativity"
                        value={data.ai_feedback.creativity_score}
                      />
                      <ScoreTile
                        label="Suggestions"
                        value={data.ai_feedback.suggestions_score}
                      />
                    </div>
                  </div>
                )}
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
                  bullets={
                    data?.ai_feedback?.recommendations
                      ?.suggestions_for_improvement
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* Right column – always-visible stats */}
        <div className={styles.rightCol}>
          <div className={styles.featuresPanel}>
            <KV
              title="Flatness"
              value={
                flatness != null ? Number(flatness).toFixed(6) : (emdash as any)
              }
            />
            <KV
              title="Transient count"
              value={
                Array.isArray(data?.features?.main?.transients_info)
                  ? data.features.main.transients_info.length
                  : emdash
              }
            />
            <KV
              title="Drop events"
              value={
                Array.isArray(data?.features?.main?.drop_timestamps)
                  ? data.features.main.drop_timestamps.length
                  : emdash
              }
            />
            <KV
              title="Vocal events"
              value={
                Array.isArray(data?.features?.main?.vocal_timestamps)
                  ? data.features.main.vocal_timestamps.length
                  : emdash
              }
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalyzeComplete;
