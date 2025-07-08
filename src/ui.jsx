import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import gsap from "gsap";
import "./style.scss";
import ProjectsModal from "./Modals/ProjectsModal/ProjectsModal";
import ResumeModal from "./Modals/ResumeModal/ResumeModal";
import Loader from "./Common/Loader/Loader";
import AboutModal from "./Modals/AboutModal/AboutModal";

/* ---------------- modal component ---------------- */
function Modal({ type, onClose }) {
  useEffect(() => {
    gsap.fromTo(
      ".modal-wrapper",
      { opacity: 0 },
      { opacity: 1, duration: 0.4 }
    );
  }, []);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      onClose();
    }
  });

  if (!type) return null;

  return (
    <div className="modal-wrapper">
      <div className={`${type} modal`}>
        <button
          aria-label="Close modal"
          className="absolute right-4 top-4 text-2xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h1 className="modal-title">{`${type}`}</h1>
        {type === "Projects" && <ProjectsModal/>}
        {type === "About" && <AboutModal/>}
        {type === "Contact" && <p>Contact modal 📫</p>}
        {type === "Resume" && <ResumeModal/>}
      </div>
    </div>
  );
}

/* ------------- bridge so vanilla JS can open modals ------------- */
function UIBridge() {
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // expose helpers globally
    window.openModal = (name) => setModal(name);
    window.closeModal = () => setModal(null);

    //make the loading available to 3.js
    window.hideLoader = () => setLoading(false);
  }, []);

  return (
    <>
        {loading && <Loader/>}
        <Modal
        type={modal}
        onClose={() => {
            setModal(null);
            if (window.controls) window.controls.enabled = true; // re-enable orbit
        }}
        />
    </>
  );
}

/* -------------- mount once ---------------- */
createRoot(document.getElementById("react-root")).render(<UIBridge />);
