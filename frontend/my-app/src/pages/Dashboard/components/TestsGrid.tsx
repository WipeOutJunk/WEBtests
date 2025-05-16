import React from "react";
import { useAppSelector } from "../../../store";
import clsx from "clsx"; // Добавить импорт clsx
import { useNavigate } from "react-router-dom";
import styles from "./TestsGrid.module.css";

const TestsGrid: React.FC = () => {
    const tests = useAppSelector(s => s.dashboard.tests);
    const navigate = useNavigate(); // Инициализируем navigate
    const handlePublish = (testId: string) => {
        // TODO: вызвать API публикации / снятия публикации
        console.log("Publish toggle for test:", testId);
      };
    return (
      <section className={styles.grid}>
        {tests.map(t => (
          <div key={t.id} className={styles.card}>
            <div className={styles.header}>
              <h4>{t.title}</h4>
              <span className={clsx(styles.badge, 
                t.status === "draft" ? styles.draft : styles.published)}>
                {t.status === "draft" ? "Черновик" : "Опубликован"}
              </span>
            </div>
            <div className={styles.meta}>
              <span>Попыток: {t.attemptsCount}</span>
              <span>Создан: {new Date(t.createdAt).toLocaleDateString()}</span>
            </div>
            <div className={styles.actions}>
              <button onClick={() => navigate(`/tests/${t.id}/edit`)}>
                Редактировать
              </button>
              <button onClick={() => handlePublish(t.id)}>
                {t.status === 'draft' ? 'Опубликовать' : 'Снять'}
              </button>
            </div>
          </div>
        ))}
      </section>
    );
  };

export default TestsGrid;
