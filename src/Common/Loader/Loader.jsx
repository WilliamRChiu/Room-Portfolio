import React from "react";
import styles from "./styles.module.scss";

export default function Loader() {
  const message = "Setting up William's room";

  return (
    <div className={styles.loaderWrapper}>
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
  );
}
