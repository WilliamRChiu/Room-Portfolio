import React, { useEffect } from "react";
import styles from "./styles.module.scss";

const EXIT_DURATION_MS = 3600;

export default function Loader({ exiting = false, onExitComplete }) {
  const message = "Setting up William's room";

  useEffect(() => {
    if (!exiting) return undefined;

    const timer = setTimeout(() => {
      onExitComplete?.();
    }, EXIT_DURATION_MS);

    return () => clearTimeout(timer);
  }, [exiting, onExitComplete]);

  return (
    <div className={`${styles.loaderWrapper} ${exiting ? styles.exiting : ""}`}>
      <div className={styles.loaderContent}>
        <div className={styles.envelope} aria-hidden="true">
          <span className={styles.envelopeBody} />
          <span className={styles.envelopeLeft} />
          <span className={styles.envelopeRight} />
          <span className={styles.envelopeFlap} />
        </div>

        <div className={styles.loadingBody}>
          <div className={styles.scene}>
            <div className={`${styles.shape} ${styles.circle}`} />
            <div className={`${styles.shape} ${styles.square}`} />
            <div className={`${styles.shape} ${styles.diamond}`} />

            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} className={styles.sparkle} />
            ))}
          </div>

          <p className={styles.text}>
            {message.split("").map((char, i) => (
              <span
                key={i}
                className={styles.letter}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </p>
          <p className={styles.subtext}>Best experienced on desktop</p>
        </div>
      </div>
    </div>
  );
}
