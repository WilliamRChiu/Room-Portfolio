import React from "react";
import styles from "./styles.module.scss";

const DEFAULT_PLAYLIST = "https://open.spotify.com/embed/playlist/3kIXxUOYCHMWH3l39RQJah?utm_source=generator";

export const SPOTIFY_EMBED_URL =
  import.meta.env.VITE_SPOTIFY_EMBED_URL || DEFAULT_PLAYLIST;

const SPOTIFY_PROFILE_URL = "https://open.spotify.com";

export default function SpotifyModal() {
  return (
    <div className={styles.container}>
      <p className={styles.subtitle}>What I've been listening to</p>
      <div className={styles.embedWrapper}>
        <iframe
          src={SPOTIFY_EMBED_URL}
          width="100%"
          height="380"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          title="Spotify Playlist"
        />
      </div>
      <a
        href={SPOTIFY_PROFILE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.profileLink}
      >
        Open in Spotify
      </a>
    </div>
  );
}
