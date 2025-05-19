import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../store";
import { ArrowUpRight, Edit, Globe } from "lucide-react";
import { Link, ClipboardCopy } from "lucide-react";

import clsx from "clsx";

import styles from "./TestsGrid.module.css";

const TestsGrid: React.FC = () => {
  const tests = useAppSelector((s) => s.dashboard.tests);
  const navigate = useNavigate();

  const handlePublish = (id: string) => {
    /* TODO: API-запрос публикации / снятия публикации */
    // eslint-disable-next-line no-console
    console.log("toggle publish for", id);
  };

  return (
    <section className={styles.grid}>
      {tests.map((t) => (
        <article key={t.id} className={styles.card}>
          {/* верхняя полоса-индикатор статуса */}
          <span
            className={clsx(
              styles.statusBar,
              t.status === "draft" ? styles.draft : styles.published
            )}
          />

          {/* заголовок + бейдж */}
          <header className={styles.header}>
            <h4 className={styles.title}>{t.title || "Без названия"}</h4>
            <span
              className={clsx(
                styles.badge,
                t.status === "draft" ? styles.badgeDraft : styles.badgePub
              )}
            >
              {t.status === "draft" ? "Черновик" : "Опубликован"}
            </span>
          </header>

          {/* мета-информация */}
          <ul className={styles.meta}>
            <li>
              <Globe size={14} strokeWidth={2} />
              {t.isPublic ? "Публичный" : "Приватный"}
            </li>
            <li>
              <ArrowUpRight size={14} strokeWidth={2} />
              Попыток: <strong>{t.attemptsCount}</strong>
            </li>
            <li>Создан: {new Date(t.createdAt).toLocaleDateString()}</li>
          </ul>

          {/* действия */}
          <div className={styles.actions}>
            <button
              className={styles.btnPrimary}
              onClick={() => navigate(`/tests/${t.id}/edit`)}
            >
              <Edit size={16} />
              Редактировать
            </button>
            <button
              className={styles.btnSecondary}
              onClick={() => handlePublish(t.id)}
            >
              {t.status === "draft" ? "Опубликовать" : "Снять"}
            </button>
          </div>
          {t.publicLink && (
            <button
              className={styles.btnLink}
              onClick={() =>
                navigator.clipboard.writeText(
                  `${window.location.origin}${t.publicLink}`
                )
              }
            >
              <ClipboardCopy size={16} />
              Копировать ссылку
            </button>
          )}
        </article>
      ))}
    </section>
  );
};

export default TestsGrid;
