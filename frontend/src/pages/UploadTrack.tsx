import { FunctionComponent, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./UploadTrack.module.css";

import bg from "@/assets/track-upload-bg.jpg";
import musicIcon from "@/assets/music-notes-simple.png";
import arrowRight from "@/assets/icon-arrow-right.png";
import LoginDialog from "@/components/LoginDialog";
import NavBar from "@/components/NavBar";
import Toast from "@/components/Toast";
import ProgressBar from "@/components/ProgressBar";
import { uploadService } from "@/services/feedbackService";

// What we persist across the step
type UploadedState = {
  uploadId: string;
  name: string;
  url: string; // local blob URL for preview on /process
};
const STORAGE_KEY = "uploadedAudio"; // reused by /process page

const ACCEPTED_EXT = ["mp3", "wav", "m4a", "aac"];
const ACCEPTED_MIME = [
  "audio/mpeg", // mp3
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/aac",
  "audio/m4a",
  "audio/x-m4a",
  "audio/mp4", // some m4a come as mp4
];

function isSupported(file: File) {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (ACCEPTED_EXT.includes(ext)) return true;
  if (file.type && ACCEPTED_MIME.includes(file.type.toLowerCase())) return true;
  return false;
}

const UploadTrack: FunctionComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const loginOpen = location.pathname === "/login";
  const closeLogin = () => navigate("/", { replace: true });

  const inputRef = useRef<HTMLInputElement>(null);

  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | undefined>(undefined);

  const [uploading, setUploading] = useState(false);

  const triggerSelect = () => inputRef.current?.click();

  const onFileChosen = async (file: File) => {
    // validation
    if (!isSupported(file)) {
      setToastMsg(undefined);
      setShowToast(true);
      return;
    }

    // upload
    try {
      setShowToast(false);
      setUploading(true);

      const res = await uploadService.uploadAudio(file);
      const blobUrl = URL.createObjectURL(file);

      const payload: UploadedState = {
        uploadId: res.id,
        name: file.name,
        url: blobUrl,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

      // Go to process screen
      navigate("/process", { replace: true });
    } catch (e: any) {
      setToastMsg(e?.message || "Upload failed. Please try again.");
      setShowToast(true);
    } finally {
      setUploading(false);
      // Note: we do not revoke the blob URL here because we want /process to play it.
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[1] ? e.target.files[0] : e.target.files?.[0];
    if (!f) return;
    onFileChosen(f);
    // allow selecting the same file again by resetting the input
    e.currentTarget.value = "";
  };

  return (
    <div className={styles.uploadTrack} style={{ ["--bg-url" as any]: `url(${bg})` }}>
      <div className={styles.slot}>
        {/* NAVBAR */}
        <NavBar />

        {/* HERO + DROPZONE */}
        <div className={styles.uploadTrackContainer}>
          <div className={styles.header}>
            <div className={styles.uploadYourTrack}>Upload your track</div>
            <div className={styles.getAiPoweredFeedback}>Get AI-powered feedback in seconds.</div>
          </div>

          <div className={styles.contentWrapper}>
            <div className={styles.hoverUpload}>
              <div className={styles.uploadTrackDiv}>
                <div className={styles.container2}>
                  <div className={styles.title}>
                    <img src={musicIcon} className={styles.musicnotessimpleIcon} alt="Music" />
                    <div className={styles.title}>
                      <div className={styles.dropYourTrack}>Drop your track here or click to browse</div>
                      <div className={styles.supportsWavMp3}>Supports WAV, MP3, M4A, AAC</div>
                    </div>
                  </div>

                  <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPTED_EXT.map((e) => "." + e).join(",")}
                    onChange={onInputChange}
                    style={{ display: "none" }}
                  />

                  <button className={styles.button6} onClick={triggerSelect} disabled={uploading}>
                    <div className={styles.home}>{uploading ? "Uploading..." : "Select file"}</div>
                    <img src={arrowRight} className={styles.iconArrowright} alt="" />
                  </button>

                  {/* Uploading indicator */}
                  <div style={{ marginTop: 16 }}>
                    <ProgressBar visible={uploading} />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Error toast */}
      <Toast
        open={showToast}
        title="Unsupported file format"
        description={toastMsg || "Please upload a track in MP3, WAV, M4A, or AAC format and try again."}
        actionText="Try again"
        onAction={() => {
          setShowToast(false);
          triggerSelect();
        }}
      />

      {/* Route-driven login modal */}
      <LoginDialog open={loginOpen} onClose={closeLogin} />
    </div>
  );
};

export default UploadTrack;
