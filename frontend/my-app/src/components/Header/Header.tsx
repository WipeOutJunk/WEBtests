import React from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./Header.module.css";

const Header: React.FC = () => {
  return (
    <header className={styles.bar}>
      <Link to="/" className={styles.logo}>
        <span className={styles.logoGradient}>IntelliTest</span>
      </Link>

      <nav className={styles.nav}>
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.activeLink : ""}`
          }
        >
          Главная
          <span className={styles.linkUnderline}></span>
        </NavLink>
        <NavLink
          to="/features"
          className={({ isActive }) =>
            `${styles.link} ${isActive ? styles.activeLink : ""}`
          }
        >
          Возможности
          <span className={styles.linkUnderline}></span>
        </NavLink>
        
        {/* Новая кнопка CTA */}
        <Link 
          to="/auth" 
          className={styles.ctaButton}
        >
          🚀 Начать создание тестов
        </Link>
      </nav>
    </header>
  );
};

export default Header;