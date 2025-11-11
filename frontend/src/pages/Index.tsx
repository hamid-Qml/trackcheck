import React, { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Upload, Music, ArrowRight, LogIn } from "lucide-react";

import bg from "@/assets/track-upload-bg.webp";
import logo from "@/assets/logo.webp";

const Index: React.FC = () => {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [hover, setHover] = useState(false);
  const openPicker = () => fileRef.current?.click();

  return (
    <div
      className="relative min-h-screen text-white overflow-hidden"
      /* Put the background image on the parent (no negative z-index issue) */
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        /* base tint similar to Figma */
        backgroundColor: "#05090f",
      }}
    >
      {/* subtle bottom vignette */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45vh] bg-gradient-to-b from-transparent to-[#03060b]" />

      {/* NAV */}
      <div className="w-full flex justify-center pt-6 relative z-10">
        <div className="w-[1100px] max-w-[92%]">
          <div
            className="flex items-center justify-between px-5 py-3 rounded-full"
            style={{
              background: "rgba(16, 21, 28, 0.6)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(64, 79, 96, 0.5)",
              boxShadow: "0 10px 30px rgba(0,0,0,.35)",
            }}
          >
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="TrakChek" className="h-7 w-auto" />
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link>
              <Link to="/forum" className="hover:text-white transition-colors">Forum</Link>
              <Link to="/login" className="ml-2">
                <button
                  className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium"
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </button>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* HERO */}
      <section className="relative z-10 w-[1100px] max-w-[92%] mx-auto pt-16 md:pt-24 pb-12 text-center">
        <h1 className="text-[34px] md:text-[48px] font-extrabold tracking-[-0.02em]">
          Upload your track
        </h1>
        <p className="mt-3 text-[14px] md:text-base text-white/75">
          Get AI-powered feedback in seconds.
        </p>
      </section>

      {/* DROP ZONE CARD */}
      <section className="relative z-10 w-[1100px] max-w-[92%] mx-auto">
        <div
          className="rounded-2xl px-6 py-8 md:px-10 md:py-10"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,24,31,0.7) 0%, rgba(12,15,20,0.7) 100%)",
            border: "1px solid rgba(85, 97, 110, 0.45)",
            boxShadow: "0 10px 30px rgba(0,0,0,.35)",
          }}
        >
          <div
            className="rounded-xl p-10 md:p-12"
            style={{
              border: "2px dashed rgba(160, 175, 189, 0.55)",
              background: "rgba(10,14,19,0.4)",
            }}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div
                className="p-3 rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, #22D3EE 0%, #005666 100%)",
                  boxShadow: "0 0 22px rgba(34,211,238,.25)",
                }}
              >
                <Music className="w-5 h-5 text-[#041218]" />
              </div>

              <p className="text-[13px] md:text-[14px] text-white/85">
                Drop your track here or click to browse
              </p>
              <p className="text-[11px] tracking-wide text-white/55 -mt-2">
                Supports WAV, MP3, M4A, AAC
              </p>

              <button
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
                onClick={openPicker}
                className="mt-2 inline-flex items-center rounded-full px-4 py-2 text-sm font-medium"
                style={{
                  color: "#0a0f14",
                  background:
                    "linear-gradient(90deg, #22D3EE 0%, #005666 100%)",
                  boxShadow: "0 0 22px rgba(34,211,238,.25)",
                }}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select file
                <ArrowRight
                  className={`w-4 h-4 ml-2 transition-transform ${hover ? "translate-x-1" : ""}`}
                />
              </button>

              <input
                ref={fileRef}
                type="file"
                accept="audio/wav,audio/x-wav,audio/mpeg,audio/mp4,audio/aac,.wav,.mp3,.m4a,.aac"
                className="hidden"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="h-24" />
    </div>
  );
};

export default Index;
