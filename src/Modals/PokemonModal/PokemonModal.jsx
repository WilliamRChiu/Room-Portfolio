import React from "react";
import styles from "./styles.module.scss";
import partyData from "../../Locales/Pokemon.json";

function HpBar({ current, max }) {
  const ratio = max > 0 ? current / max : 0;
  let colorClass = styles.hpGreen;
  if (ratio <= 0.25) colorClass = styles.hpRed;
  else if (ratio <= 0.5) colorClass = styles.hpYellow;

  return (
    <div className={styles.hpBarTrack}>
      <div className={styles.hpLabel}>HP</div>
      <div className={styles.hpBarOuter}>
        <div
          className={`${styles.hpBarFill} ${colorClass}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

function GenderIcon({ gender }) {
  if (gender === "male") return <span className={styles.genderMale}>♂</span>;
  if (gender === "female") return <span className={styles.genderFemale}>♀</span>;
  return null;
}

function PokemonSlot({ data, index }) {
  if (!data) {
    return <div className={`${styles.slot} ${styles.emptySlot}`} />;
  }

  const isLead = index === 0;

  return (
    <div className={`${styles.slot} ${isLead ? styles.leadSlot : ""}`}>
      <div className={styles.spriteArea}>
        {data.sprite ? (
          <img src={data.sprite} alt={data.name} className={styles.sprite} />
        ) : (
          <div className={styles.spritePlaceholder} />
        )}
      </div>
      <div className={styles.info}>
        <div className={styles.nameRow}>
          <span className={styles.name}>{data.name}</span>
          <GenderIcon gender={data.gender} />
        </div>
        <HpBar current={data.currentHp} max={data.maxHp} />
        <div className={styles.statsRow}>
          <span className={styles.level}>Lv{data.level}</span>
          <span className={styles.hpNumbers}>
            {data.currentHp}/{data.maxHp}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PokemonModal() {
  // Pad to 6 slots
  const party = [...partyData];
  while (party.length < 6) party.push(null);

  return (
    <div className={styles.container}>
      <div className={styles.partyGrid}>
        {party.slice(0, 6).map((mon, i) => (
          <PokemonSlot key={i} data={mon} index={i} />
        ))}
      </div>
      <div className={styles.bottomBar}>
        <span className={styles.chooseText}>Choose a Pokemon.</span>
        <button className={styles.cancelBtn} onClick={() => window.closeModal()}>
          CANCEL
        </button>
      </div>
    </div>
  );
}
