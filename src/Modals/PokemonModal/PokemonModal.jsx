import React from "react";
import styles from "./styles.module.scss";
import partyData from "../../Locales/Pokemon.json";

function PokeballIcon() {
  return (
    <svg className={styles.pokeballIcon} viewBox="0 0 20 20">
      <circle cx="10" cy="10" r="9" fill="#f0f0f0" stroke="#303030" strokeWidth="1.5" />
      <path d="M1.1,10 A8.9,8.9 0 0,1 18.9,10 Z" fill="#e03030" />
      <rect x="1" y="9.25" width="18" height="1.5" fill="#303030" />
      <circle cx="10" cy="10" r="3" fill="#f0f0f0" stroke="#303030" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="1.2" fill="#303030" />
    </svg>
  );
}

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
      <PokeballIcon />
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
          <span className={styles.level}>Lv.{data.level}</span>
          <span className={styles.hpNumbers}>
            {data.currentHp}/{data.maxHp}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PokemonModal() {
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
        <div className={styles.textBox}>
          <span className={styles.chooseText}>Choose a Pokémon.</span>
        </div>
        <button className={styles.cancelBtn} onClick={() => window.closeModal()}>
          CANCEL
        </button>
      </div>
    </div>
  );
}
