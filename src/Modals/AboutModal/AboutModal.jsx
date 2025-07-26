import React, { useEffect, useState } from "react";
import styles from "./styles.module.scss";
import About from "../../Locales/About.json"

export default function AboutModal() {
  const images = [
    "/AboutImages/AboutPicture1.jpg",
    "/AboutImages/AboutPicture2.jpg",
    "/AboutImages/AboutPicture3.jpg",
    "/AboutImages/AboutPicture4.jpg",
  ];

  const [currentImage, setCurrentImage] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);

      setTimeout(() => {
        setCurrentImage((prev) => (prev + 1) % images.length);
        setFade(true);
      }, 500);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className={styles.container}>
      <div className={styles.left}>
        <div
          className={`${styles.imageCircle} ${fade ? styles.fadeIn : styles.fadeOut}`}
          style={{ backgroundImage: `url(${images[currentImage]})` }}
        />
      </div>
      <div className={styles.divider} />
      <div className={styles.right}>
        <p className={styles.description}>{About.Description}</p>
      </div>
    </div>
  );
}
