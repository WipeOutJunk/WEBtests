import React, { useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./Header.module.css";

const Header: React.FC = () => {
  useEffect(() => {
    const handleScroll = () => {
      const header = document.querySelector(`.${styles.bar}`);
      if (window.scrollY > 50) {
        header?.classList.add(styles.scrolled);
      } else {
        header?.classList.remove(styles.scrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={styles.bar}>
      <Link to="/" className={styles.logo}>
        <span className={styles.logoGradient}>IntelliTest</span>
      </Link>

      <nav className={styles.nav}>
        <NavLink to="/"  className={({ isActive }) =>
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
      </nav>
    </header>
  );
};

export default Header;
