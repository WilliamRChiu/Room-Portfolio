import React from "react";
import styles from "./styles.module.scss";

export default function Loader() {
  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.spinner}></div>
      <p className={styles.text}>Loading...</p>
      <p className={styles.subtext}>For the best viewing experience, use desktop.</p>
    </div>
  );
}
