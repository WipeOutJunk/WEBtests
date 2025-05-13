import React, { useEffect } from "react";
import { Link } from "react-router-dom";
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
        <span style={{ color: "rgba(255,255,255,0.9)" }}>Suite</span>
      </Link>

      <nav className={styles.nav}>
        <Link to="/" className={styles.link}>
          Главная
          <span className={styles.linkUnderline}></span>
        </Link>
        <Link to="/features" className={styles.link}>
          Возможности
          <span className={styles.linkUnderline}></span>
        </Link>
      </nav>
    </header>
  );
};

export default Header;
