import React from "react";
import { useAppSelector } from "../../../store";
import styles from "./StatsCards.module.css";

const StatsCards: React.FC = () => {
  const stats = useAppSelector(s => s.dashboard.stats);
  const items = [
    { label: "Тестов",       value: stats.tests },
    { label: "Опросов",      value: stats.polls },
    { label: "Средний балл", value: stats.avgScore },
    { label: "Попыток/24ч",  value: stats.attempts24h }
  ];

  return (
    <div className={styles.grid}>
      {items.map(i => (
        <div key={i.label} className={styles.card}>
          <span className={styles.value}>{i.value}</span>
          <span className={styles.label}>{i.label}</span>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
