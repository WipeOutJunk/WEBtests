import React, { useEffect, useRef } from "react";
import styles from "./FeaturesPage.module.css"; // Создайте новый CSS-модуль

const featuresDetails = [
  {
    title: "Авторизация",
    description: "Многоуровневая система безопасности доступа",
    details: [
      "Хеширование паролей по алгоритму bcrypt",
      "Двухфакторная аутентификация через Google Authenticator",
      "Ролевая модель доступа (Админ/Преподаватель/Студент)",
      "Сессионное управление с JWT-токенами"
    ],
    image: "/images/auth-placeholder.svg", // Заглушка для иллюстрации
    icon: "🔒"
  },
  {
    title: "Конструктор тестов",
    description: "Гибкие настройки тестирования",
    details: [
      "10+ типов вопросов (один выбор, множественный, сопоставление)",
      "Настройка временных ограничений",
      "Лимит попыток прохождения",
      "Шаблоны для быстрого создания"
    ],
    image: "/images/builder-placeholder.svg",
    icon: "📝"
  },
  // Добавьте остальные элементы по аналогии
];

const FeaturesPage: React.FC = () => {
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach(ref => ref && observer.observe(ref));
    
    return () => observer.disconnect();
  }, []);
  return (
    <div className={styles.layout}>
      <section className={styles.hero}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <span>Возможности платформы</span>
            <div className={styles.animatedUnderline}></div>
          </h1>
        </div>

        <div className={styles.featuresContainer}>
          {featuresDetails.map((feature, index) => (
            <div key={feature.title} className={styles.featureSection}>
              <div className={styles.featureIllustration}>
                {/* Заглушка для иллюстрации */}
                <div className={styles.imagePlaceholder}>
                  {feature.icon}
                </div>
              </div>
              
              <div className={styles.featureContent}>
                <div className={styles.featureHeader}>
                  <h2>{feature.title}</h2>
                  <span className={styles.featureNumber}>0{index + 1}</span>
                </div>
                
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
                
                <ul className={styles.featureList}>
                  {feature.details.map((detail, i) => (
                    <li key={i} className={styles.featureListItem}>
                      <span className={styles.listMarker}>✓</span>
                      {detail}
                    </li>
                  ))}
                </ul>
                
                <div className={styles.featureExamples}>
                  <h4>Примеры использования:</h4>
                  <div className={styles.examplePlaceholder}></div>
                  <div className={styles.examplePlaceholder}></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;