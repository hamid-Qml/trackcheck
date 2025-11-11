import { FunctionComponent, useEffect, useMemo, useState } from "react";
import styles from "./TrackUploaded.module.css";

import musicNote from "@/assets/MusicNoteSimple.svg";
import NavBar from "@/components/NavBar";
import trackUploadedBg from "@/assets/trackUploadedBg.png";
import { feedbackService } from "@/services/feedbackService";

type UploadedAudio = { uploadId: string; name: string; url: string };
const STORAGE_KEY = "uploadedAudio";

const GENRES = [
  "House",
  "Techno",
  "Hip-Hop",
  "Pop",
  "Rock",
  "Ambient",
  "Trap",
  "Drum & Bass",
];

const FEEDBACK_FOCUS = [
  "Mix & Master",
  "Arrangement",
  "Sound Design",
  "Composition",
  "Vocals",
  "Dynamics",
  "Stereo Image",
];

const TrackUploaded: FunctionComponent = () => {
  const [audio, setAudio] = useState<UploadedAudio | null>(null);
  const [genre, setGenre] = useState<string>("");
  const [focus, setFocus] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load the uploaded audio details from sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) {
        window.location.replace("/");
        return;
      }
      const parsed = JSON.parse(raw) as UploadedAudio;
      if (!parsed?.url || !parsed?.uploadId) {
        window.location.replace("/");
        return;
      }
      setAudio(parsed);
    } catch {
      window.location.replace("/");
    }
  }, []);

  const canAnalyze = useMemo(() => !!(audio && genre && focus && !submitting), [audio, genre, focus, submitting]);

  const changeTrack = () => {
    // free preview URL and let the user pick a new file
    try { if (audio?.url) URL.revokeObjectURL(audio.url); } catch { }
    sessionStorage.removeItem(STORAGE_KEY);
    window.location.assign("/");
  };

  const analyze = async () => {
    if (!canAnalyze || !audio) return;
    setSubmitting(true);
    setErr(null);
    try {
      const res = await feedbackService.createFromUpload({
        upload_id: audio.uploadId,
        genre,
        feedback_focus: focus,
      });
      window.location.assign(`/analyzing/${res.requestId}`);
    } catch (e: any) {
      setErr(e?.message || "Could not start analysis. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };


  if (!audio) return null;

  return (
    <div className={styles.trackUploaded}>
      <div className={styles.slot} style={{ ["--bg-url" as any]: `url(${trackUploadedBg})` }}>
        <NavBar />

        {/* Main content */}
        <div className={styles.trackUploadedContainer}>
          <div className={styles.header}>
            <div className={styles.weveGotYour}>We’ve got your track!</div>
            <div className={styles.chooseAGenre}>Choose a genre and feedback type to begin analysis.</div>
          </div>

          <div className={styles.trackUploaded2}>
            <div className={styles.card}>
              <div className={styles.cardContent}>
                {/* Uploaded file card */}
                <div className={styles.flexVertical}>
                  <div className={styles.uploadedContent}>
                    <div className={styles.flex3}>
                      <div className={styles.musicnotesimple}>
                        <img className={styles.noteImg} src={musicNote} alt="" />
                      </div>
                      <div className={styles.flex4}>
                        <div className={styles.gammaWhatsYour}>{audio.name}</div>
                      </div>
                    </div>

                    {/* audio preview */}
                    <audio className={styles.audio} controls preload="metadata" src={audio.url} />

                    <button type="button" className={styles.button7} onClick={changeTrack}>
                      <div className={styles.home}>Change track</div>
                    </button>
                  </div>
                </div>

                {/* Selections + CTA */}
                <div className={styles.trackUploadedFlexVertical}>
                  <div className={styles.flexVertical2}>
                    <div className={styles.dropdownGroup}>
                      {/* Genre */}
                      <div className={styles.dropdownItem}>
                        <div className={styles.genre}>Genre *</div>
                        <div className={styles.selectGenre}>
                          <select
                            aria-label="Select genre"
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                          >
                            <option value="" disabled>Select genre</option>
                            {GENRES.map((g) => (<option key={g} value={g}>{g}</option>))}
                          </select>
                          <img className={styles.noteTiny} src={musicNote} alt="" />
                        </div>
                      </div>

                      {/* Feedback focus */}
                      <div className={styles.dropdownItem}>
                        <div className={styles.genre}>Feedback focus *</div>
                        <div className={styles.selectGenre}>
                          <select
                            aria-label="Select feedback type"
                            value={focus}
                            onChange={(e) => setFocus(e.target.value)}
                          >
                            <option value="" disabled>Select feedback type</option>
                            {FEEDBACK_FOCUS.map((f) => (<option key={f} value={f}>{f}</option>))}
                          </select>
                          <img className={styles.noteTiny} src={musicNote} alt="" />
                        </div>
                      </div>
                    </div>

                    {err && (
                      <div style={{ color: "#fecaca", marginTop: 8, fontSize: 13 }}>
                        {err}
                      </div>
                    )}

                    <button
                      className={`${styles.button9} ${canAnalyze ? styles.button9Active : ""}`}
                      type="button"
                      onClick={analyze}
                      disabled={!canAnalyze}
                      aria-disabled={!canAnalyze}
                    >
                      <div className={styles.gammaWhatsYour}>
                        {submitting ? "Starting…" : "Analyze track"}
                      </div>
                      <img className={styles.noteTiny} src={musicNote} alt="" />
                    </button>
                  </div>

                  <div className={styles.yourTrackWill}>
                    Your track will be automatically deleted after 30 days.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Main content */}
      </div>
    </div>
  );
};

export default TrackUploaded;
