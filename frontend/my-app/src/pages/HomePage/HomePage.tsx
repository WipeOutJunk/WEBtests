import React from "react";
import styles from "./HomePage.module.css";
import { useEffect, useState } from "react";

const features = [
  {
    title: "Авторизация",
    text: "Безопасное хеширование паролей и двухфакторная аутентификация",
    icon: "🔒",
  },
  {
    title: "Конструктор тестов",
    text: "Гибкие настройки времени и лимита попыток",
    icon: "📝",
  },
  {
    title: "ИИ-Генератор",
    text: "Автоматическое создание вопросов нейросетью",
    icon: "🧠",
  },
  {
    title: "Аналитика",
    text: "Детальная история выполнения и статистика",
    icon: "📊",
  },
  {
    title: "Опросы",
    text: "Уникальные ссылки и конструктор форм",
    icon: "🔗",
  },
  {
    title: "Обучение",
    text: "Интерактивные уроки с проверкой знаний",
    icon: "🎓",
  },
];

const HomePage: React.FC = () => {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      setShowScroll(window.pageYOffset > 400); // Показывать кнопку после 400px прокрутки
    };
    
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className={styles.layout}>
      <div className={styles.glowEffect}></div>

      <section className={styles.hero}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <span className={styles.highlight}>AI-Test</span> Platform
            <div className={styles.animatedUnderline}></div>
          </h1>
          <p className={styles.subtitle}>
            Интеллектуальная система для создания и анализа тестов
            <span className={styles.blinkingCursor}>|</span>
          </p>
        </div>

        <div className={styles.grid}>
          {features.map((feature, i) => (
            <article key={feature.title} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>{feature.icon}</span>
                <span className={styles.cardNumber}>0{i + 1}</span>
              </div>
              <h3 className={styles.cardTitle}>{feature.title}</h3>
              <p className={styles.cardText}>{feature.text}</p>
              <div className={styles.cardHoverEffect}></div>
            </article>
          ))}
        </div>
      </section>

      {/* Кнопка для прокрутки наверх */}
      <div 
        className={`${styles.scrollTop} ${showScroll ? styles.visible : ''}`} 
        onClick={scrollToTop}
      >
        ↑
      </div>
    </main>
  );
};

export default HomePage;
