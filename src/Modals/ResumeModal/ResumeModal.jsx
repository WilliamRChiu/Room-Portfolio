import React from "react";
import styles from "./styles.module.scss";

export default function ResumeModal() {
  return (
    <div className={styles.resumeContainer}>
      <iframe
        src="/CV.pdf#view=FitH"
        title="Resume"
        width="100%"
        height="600"
        className={styles.iframe}
      />
      <a
        href="https://www.overleaf.com/read/qmcwdckyvbwc#c9be1f"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.downloadButton}
      >
        Download PDF
      </a>
    </div>
  );
}