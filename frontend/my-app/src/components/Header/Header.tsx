import React from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./Header.module.css";
import { useAppSelector } from "../../store";

const Header: React.FC = () => {
  const token = useAppSelector(s => s.auth.token);  // <-- токен из Redux

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
        
        {/* CTA */}
        {token ? (
          <Link to="/dashboard" className={styles.ctaButton}>
            👤 Личный&nbsp;кабинет
          </Link>
        ) : (
          <Link to="/auth" className={styles.ctaButton}>
            🚀 Начать&nbsp;создание&nbsp;тестов
          </Link>
        )}
      </nav>
    </header>
  );
};

export default Header;