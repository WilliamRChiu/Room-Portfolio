import React from "react";
import styles from "./styles.module.scss";

const leftPhotos = [
  { src: "/AboutImages/AboutPicture1.jpg", rotation: -3, corners: true },
  { src: "/AboutImages/AboutPicture3.jpg", rotation: 2, corners: false },
];

const rightPhotos = [
  { src: "/AboutImages/AboutPicture2.jpg", rotation: 2.5, corners: false },
  { src: "/AboutImages/AboutPicture4.jpg", rotation: -1.5, corners: true },
];

function PhotoCard({ photo, index }) {
  return (
    <div
      className={`${styles.photoFrame} ${photo.corners ? styles.withCorners : styles.withTape}`}
      style={{
        "--rotation": `${photo.rotation}deg`,
        animationDelay: `${index * 0.12}s`,
      }}
    >
      {photo.corners && (
        <>
          <span className={`${styles.corner} ${styles.cornerTL}`} />
          <span className={`${styles.corner} ${styles.cornerTR}`} />
          <span className={`${styles.corner} ${styles.cornerBL}`} />
          <span className={`${styles.corner} ${styles.cornerBR}`} />
        </>
      )}
      <img src={photo.src} alt={`Photo ${index + 1}`} draggable={false} />
    </div>
  );
}

export default function ScrapbookModal() {
  return (
    <div className={styles.book}>
      <div className={styles.page}>
        <div className={styles.pageInner}>
          {leftPhotos.map((photo, i) => (
            <PhotoCard key={i} photo={photo} index={i} />
          ))}
        </div>
      </div>
      <div className={styles.spine} />
      <div className={styles.page}>
        <div className={styles.pageInner}>
          {rightPhotos.map((photo, i) => (
            <PhotoCard key={i} photo={photo} index={i + leftPhotos.length} />
          ))}
        </div>
      </div>
    </div>
  );
}
