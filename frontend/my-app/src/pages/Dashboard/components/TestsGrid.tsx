import React from "react";
import { useAppSelector } from "../../../store";
import { useNavigate } from "react-router-dom";
import styles from "./TestsGrid.module.css";

const TestsGrid: React.FC = () => {
  const tests = useAppSelector(s => s.dashboard.tests);
  const navigate = useNavigate();

  return (
    <section className={styles.grid}>
      {tests.length ? (
        tests.map(t => (
          <div
            key={t.id}
            className={styles.card}
            onClick={() => navigate(`/tests/${t.id}`)}
          >
            <h4 className={styles.title}>{t.title}</h4>
            <span className={styles.badge}>
              {t.status === "draft" ? "Черновик" : "Опубликован"}
            </span>
            <span className={styles.date}>
              {new Date(t.createdAt).toLocaleDateString()}
            </span>
          </div>
        ))
      ) : (
        <div style={{gridColumn: "1/-1", textAlign: "center"}}>Тестов пока нет</div>
      )}
    </section>
  );
};

export default TestsGrid;
