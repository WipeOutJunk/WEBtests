import React from "react";
import { useAppSelector } from "../../../store";
import styles from "./StatsCards.module.css";

const StatsCards: React.FC = () => {
    const stats = useAppSelector(s => s.dashboard.stats);
    const items = [
      { label: "Мои тесты", value: stats.totalTests },
      { label: "Опубликовано", value: stats.publishedTests },
      { label: "Попыток/24ч", value: stats.attempts24h },
      { label: "Всего попыток", value: stats.totalAttempts }
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
