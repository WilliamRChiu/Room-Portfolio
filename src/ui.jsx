import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import gsap from "gsap";
import "./style.scss";
import ProjectsModal from "./Modals/ProjectsModal/ProjectsModal";
import ResumeModal from "./Modals/ResumeModal/ResumeModal";
import Loader from "./Common/Loader/Loader";
import AboutModal from "./Modals/AboutModal/AboutModal";
import ContactModal from "./Modals/ContactModal/ContactModal";
import PokemonModal from "./Modals/PokemonModal/PokemonModal";
import ScrapbookModal from "./Modals/ScrapbookModal/ScrapbookModal";
import { SPOTIFY_EMBED_URL } from "./Modals/SpotifyModal/SpotifyModal";


/* ---------------- modal component ---------------- */
function Modal({ type, onClose }) {
  const [closing, setClosing] = useState(false);
  const [closeSparkles, setCloseSparkles] = useState(null);
  const closeBtnRef = useRef(null);
  const modalRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!type) return;
    gsap.fromTo(wrapperRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
    if (type === "Scrapbook") {
      gsap.fromTo(modalRef.current,
        { opacity: 0, y: window.innerHeight },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.05, clearProps: "all" }
      );
    } else {
      gsap.fromTo(modalRef.current,
        { scale: 0.85, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.4)", delay: 0.05, clearProps: "all" }
      );
    }
  }, [type]);

  const startClose = useCallback(() => {
    if (closing || !type) return;
    setClosing(true);

    const modalEl = modalRef.current;
    if (modalEl && type === "Pokemon") {
      const rect = modalEl.getBoundingClientRect();
      setCloseSparkles({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setClosing(false);
        setCloseSparkles(null);
        onClose();
      },
    });

    if (closeBtnRef.current) {
      tl.to(closeBtnRef.current, { rotation: 360, duration: 0.35, ease: "power2.in" }, 0);
    }
    if (modalEl) {
      tl.to(modalEl, { scale: 1.05, duration: 0.2, ease: "power2.out" }, 0.05);
    }
    if (modalEl) {
      tl.to(modalEl, { scale: 0, opacity: 0, duration: 0.35, ease: "power2.in" }, 0.25);
    }
    if (wrapperRef.current) {
      tl.to(wrapperRef.current, { opacity: 0, duration: 0.35 }, 0.25);
    }
  }, [closing, type, onClose]);

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && startClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [startClose]);

  if (!type) return null;

  const closeEvent = (e) => {
    e.stopPropagation();
    startClose();
  };

  return (
    <>
      <div className="modal-wrapper" ref={wrapperRef} onClick={closeEvent}>
        <div
          className={`${type} modal`}
          ref={modalRef}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <button
            ref={closeBtnRef}
            aria-label="Close modal"
            className="absolute right-4 top-4 text-2xl font-bold"
            onClick={closeEvent}
          >
            ×
          </button>

          <h1 id="modal-title" className="modal-title">{type}</h1>
          <div className="modal-body">
            {type === "Projects"  && <ProjectsModal />}
            {type === "About"     && <AboutModal />}
            {type === "Contact"   && <ContactModal />}
            {type === "Resume"    && <ResumeModal />}
            {type === "Pokemon"   && <PokemonModal />}
            {type === "Scrapbook" && <ScrapbookModal />}
          </div>
        </div>
      </div>
      {closeSparkles && (
        <SparkleOverlay position={closeSparkles} onComplete={() => setCloseSparkles(null)} />
      )}
    </>
  );
}
/* -------------------- sparkle overlay -------------------- */
function SparkleOverlay({ position, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 360;
    const distance = 40 + Math.random() * 60;
    const size = 4 + Math.random() * 8;
    const delay = Math.random() * 0.15;
    return { angle, distance, size, delay, id: i };
  });

  const posStyle = position
    ? { left: `${position.x}px`, top: `${position.y}px` }
    : { left: '50%', top: '50%' };

  return (
    <div className="sparkle-overlay">
      <div className="sparkle-origin" style={posStyle}>
        {particles.map((p) => (
          <div
            key={p.id}
            className="sparkle-particle"
            style={{
              '--angle': `${p.angle}deg`,
              '--distance': `${p.distance}px`,
              '--size': `${p.size}px`,
              '--delay': `${p.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------- music note overlay -------------------- */
const RAINBOW = ['#ff375f','#ff9f0a','#ffd60a','#34c759','#007aff','#5e5ce6','#af52de','#ff375f'];

function MusicNoteOverlay({ position, onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  const notes = ['♪', '♫', '♩', '♬', '♪', '♫', '♩', '♬'];
  const particles = notes.map((char, i) => ({
    char,
    id: i,
    color: RAINBOW[i % RAINBOW.length],
    xSpread: (Math.random() - 0.5) * 120,
    size: 14 + Math.random() * 14,
    delay: Math.random() * 0.2,
  }));

  const rings = [0, 1, 2];

  const posStyle = position
    ? { left: `${position.x}px`, top: `${position.y}px` }
    : { left: '50%', top: '50%' };

  return (
    <div className="music-note-overlay">
      <div className="music-note-origin" style={posStyle}>
        {rings.map((i) => (
          <div
            key={`ring-${i}`}
            className="sound-wave-ring"
            style={{ '--ring-delay': `${i * 0.15}s`, '--ring-color': RAINBOW[i * 2 % RAINBOW.length] }}
          />
        ))}
        {particles.map((p) => (
          <span
            key={p.id}
            className="music-note-particle"
            style={{
              '--x-spread': `${p.xSpread}px`,
              '--note-size': `${p.size}px`,
              '--note-delay': `${p.delay}s`,
              '--note-color': p.color,
            }}
          >
            {p.char}
          </span>
        ))}
      </div>
    </div>
  );
}

/* -------------------- mini player -------------------- */
function MiniPlayer({ expanded, onCollapse, onDismiss, hidden }) {
  const [trayOpen, setTrayOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const playerRef = useRef(null);
  const overlayRef = useRef(null);
  const closeBtnRef = useRef(null);

  // Animate overlay in when expanded
  useEffect(() => {
    if (!expanded || !overlayRef.current) return;
    gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
  }, [expanded]);

  // Close tray on outside click
  useEffect(() => {
    if (!trayOpen || expanded) return;
    const handleClickOutside = (e) => {
      if (playerRef.current && !playerRef.current.contains(e.target)) {
        setTrayOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [trayOpen, expanded]);

  // Esc closes expanded view
  useEffect(() => {
    if (!expanded) return;
    const handleKey = (e) => e.key === "Escape" && startClose();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [expanded]);

  const startClose = useCallback(() => {
    if (closing || !expanded) return;
    setClosing(true);

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(playerRef.current, { clearProps: "all" });
        gsap.set(closeBtnRef.current, { clearProps: "all" });
        setClosing(false);
        onCollapse();
      },
    });

    if (closeBtnRef.current) {
      tl.to(closeBtnRef.current, { rotation: 360, duration: 0.35, ease: "power2.in" }, 0);
    }
    if (playerRef.current) {
      tl.to(playerRef.current, { scale: 1.05, xPercent: -50, yPercent: -50, duration: 0.2, ease: "power2.out" }, 0.05);
      tl.to(playerRef.current, { scale: 0, opacity: 0, xPercent: -50, yPercent: -50, duration: 0.35, ease: "power2.in" }, 0.25);
    }
    if (overlayRef.current) {
      tl.to(overlayRef.current, { opacity: 0, duration: 0.35 }, 0.25);
    }
  }, [closing, expanded, onCollapse]);

  const handleIconClick = () => {
    if (expanded) return;
    setTrayOpen((prev) => !prev);
  };

  const handleExpand = () => {
    setTrayOpen(false);
    window.openModal("Spotify");
  };

  const hiddenStyle = hidden ? { visibility: "hidden", pointerEvents: "none" } : undefined;

  return (
    <>
      {expanded && !hidden && <div className="mini-player-overlay" ref={overlayRef} onClick={startClose} />}
      <div
        className={`mini-player ${expanded ? "mini-player--expanded" : ""}`}
        ref={playerRef}
        style={hiddenStyle}
      >
        {!expanded && (
          <div className="mini-player-icon" onClick={handleIconClick} title="Now Playing">
            <span className="mini-player-note">♪</span>
          </div>
        )}
        {expanded && (
          <div className="mini-player-expanded-header">
            <h1 className="modal-title">Spotify</h1>
            <button ref={closeBtnRef} className="mini-player-expanded-close" onClick={startClose}>×</button>
            <p className="mini-player-subtitle">What I've been listening to</p>
          </div>
        )}
        <div className={`mini-player-tray ${trayOpen || expanded ? "mini-player-tray--open" : ""}`}>
          <div className="mini-player-embed">
            <iframe
              src={SPOTIFY_EMBED_URL}
              width="100%"
              height={expanded ? 380 : 80}
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify Player"
            />
          </div>
          {!expanded && trayOpen && (
            <div className="mini-player-tray-controls">
              <button className="mini-player-tray-btn" onClick={handleExpand} aria-label="Expand" title="Expand">↗</button>
              <button className="mini-player-tray-btn mini-player-tray-btn--dismiss" onClick={onDismiss} aria-label="Dismiss" title="Dismiss">×</button>
            </div>
          )}
        </div>
        {expanded && (
          <div className="mini-player-expanded-footer">
            <a
              href="https://open.spotify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mini-player-spotify-link"
            >
              Open in Spotify
            </a>
          </div>
        )}
      </div>
    </>
  );
}

/* ------------- bridge so vanilla JS can open modals ------------- */
function UIBridge() {
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sparkle, setSparkle] = useState(false);
  const [sparklePos, setSparklePos] = useState(null);
  const [pendingModal, setPendingModal] = useState(null);
  const [musicNote, setMusicNote] = useState(false);
  const [musicNotePos, setMusicNotePos] = useState(null);
  const [spotifyActivated, setSpotifyActivated] = useState(false);
  const [spotifyExpanded, setSpotifyExpanded] = useState(false);
  const [miniPlayerDismissed, setMiniPlayerDismissed] = useState(false);

  useEffect(() => {
    // expose helpers globally
    window.openModal = (name) => {
      if (name === "Spotify") {
        setSpotifyActivated(true);
        setSpotifyExpanded(true);
        setMiniPlayerDismissed(false);
        window.isModalOpen = true;
        document.body.style.overflow = "hidden";
        if (window.controls) window.controls.enabled = false;
        if (window.stopShudderPolling) window.stopShudderPolling();
        return;
      }
      // Collapse expanded Spotify (keeps mini player alive)
      setSpotifyExpanded(false);
      setModal(name);
      window.isModalOpen = true;
      document.body.style.overflow = "hidden";
      if (window.stopShudderPolling) window.stopShudderPolling();
    };
    window.closeModal = () => {
      setModal(null);
      window.isModalOpen = false;
      document.body.style.overflow = "";
      if (window.startShudderPolling) window.startShudderPolling();
    };

    // sparkle then open modal (used by pokeball)
    window.playSparkleAndOpenModal = (name, x, y) => {
      setSparklePos(x != null && y != null ? { x, y } : null);
      setSparkle(true);
      setPendingModal(name);
    };

    // music note then open modal (used by headphones)
    window.playMusicAndOpenModal = (x, y) => {
      setMusicNotePos(x != null && y != null ? { x, y } : null);
      setMusicNote(true);
      setPendingModal("Spotify");
    };

    // make the loading available to 3.js
    window.hideLoader = () => setLoading(false);
  }, []);

  const handleSparkleComplete = () => {
    setSparkle(false);
    if (pendingModal) {
      window.openModal(pendingModal);
      setPendingModal(null);
    }
  };

  const handleMusicNoteComplete = () => {
    setMusicNote(false);
    if (pendingModal) {
      window.openModal(pendingModal);
      setPendingModal(null);
    }
  };

  const handleModalClose = () => {
    setModal(null);
    window.isModalOpen = false;
    document.body.style.overflow = "";
    if (window.controls) window.controls.enabled = true;
    if (window.startShudderPolling) window.startShudderPolling();
  };

  const handleSpotifyCollapse = () => {
    setSpotifyExpanded(false);
    window.isModalOpen = false;
    document.body.style.overflow = "";
    if (window.controls) window.controls.enabled = true;
    if (window.startShudderPolling) window.startShudderPolling();
  };

  const handleMiniPlayerDismiss = () => {
    setMiniPlayerDismissed(true);
  };

  return (
    <>
        {loading && <Loader/>}
        {sparkle && <SparkleOverlay position={sparklePos} onComplete={handleSparkleComplete} />}
        {musicNote && <MusicNoteOverlay position={musicNotePos} onComplete={handleMusicNoteComplete} />}
        {spotifyActivated && !miniPlayerDismissed && (
          <MiniPlayer
            expanded={spotifyExpanded}
            onCollapse={handleSpotifyCollapse}
            onDismiss={handleMiniPlayerDismiss}
            hidden={!!modal}
          />
        )}
        <Modal
        type={modal}
        onClose={handleModalClose}
        />
    </>
  );
}

/* -------------- mount once ---------------- */
createRoot(document.getElementById("react-root")).render(<UIBridge />);
