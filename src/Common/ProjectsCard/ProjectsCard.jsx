import React from "react";
import styles from "./styles.module.scss";

export default function ProjectsCard({ title, codeUrl, description, tech = []}) {
  return (
    <article className={styles.card}>
      {/* Title */}
      <h2 className={styles.title}>{title}</h2>


      {tech.length > 0 && (
        <ul className={styles.techBar}>
          {tech.map((t) => (
            <li key={t} className={styles.techPill}>
              {t}
            </li>
          ))}
        </ul>
      )}

      {/* Description */}
      <p className={styles.description}>{description}</p>

      {/* Link */}
      <a
        href={codeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        View code
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M14 3l7 7m0 0l-7 7m7-7H3"
          />
        </svg>
      </a>
    </article>
  );
}
