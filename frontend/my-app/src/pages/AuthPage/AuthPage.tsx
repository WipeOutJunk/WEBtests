import React, { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../store";
import { login, register } from "../../store/authSlice";
import Illustration from "./Illustration";
import styles from "./AuthPage.module.css";

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

const AuthPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((s) => s.auth);

  /* UI‑состояния ------------------------------------------------------ */
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);

  /* ----------- Отправка формы --------------------------------------- */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    /* ===== Валидация ================================================= */
    if (!emailRegex.test(email)) {
      setLocalError("Введите корректный email.");
      return;
    }
    if (password.length < 6) {
      setLocalError("Пароль должен быть не короче 6 символов.");
      return;
    }
    if (mode === "register" && password !== confirm) {
      setLocalError("Пароли не совпадают.");
      return;
    }

    /* ===== Диспатч =================================================== */
    if (mode === "login") {
      dispatch(login({ email, password }));
    } else {
      dispatch(register({ email, password })).then((res) => {
        if (register.fulfilled.match(res)) setRegSuccess(true);
      });
    }
    setLocalError(null);
  };

  /* JSX =============================================================== */
  return (
    <div className={styles.layout}>
      <div className={styles.glowEffect} />

      <div className={styles.splitWrapper}>
        <div className={styles.illustrationPane}>
          <Illustration />
        </div>

        {/* Правая часть ------------------------------------------------ */}
        <div className={styles.formPane}>
          {/* ---------- Если регистрация прошла ------------------------ */}
          {regSuccess ? (
            <div className={styles.infoPane}>
              <h2>Почти готово!</h2>
              <p>
                Мы отправили письмо на <br />
                <strong>{email}</strong>.<br />
                Перейдите по ссылке, чтобы завершить регистрацию.
              </p>
              <button onClick={() => setRegSuccess(false)}>
                Ок, я проверю
              </button>
            </div>
          ) : (
            <>
              <h1 className={styles.title}>
                {mode === "login" ? "Вход" : "Регистрация"}
              </h1>
              <div className={styles.animatedUnderline} />

              <AnimatePresence mode="wait">
                <motion.form
                  key={mode}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.25 }}
                  onSubmit={handleSubmit}
                  className={styles.authForm}
                >
                  {/* Email ------------------------------------------------ */}
                  <div className={styles.inputGroup}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ваш email"
                      className={styles.inputField}
                      autoComplete="email"
                    />
                    <span className={styles.inputUnderline} />
                  </div>

                  {/* Password -------------------------------------------- */}
                  <div className={styles.inputGroup}>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Пароль"
                      className={styles.inputField}
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                    />
                    <span className={styles.inputUnderline} />
                  </div>

                  {/* Confirm password (только при регистрации) ----------- */}
                  {mode === "register" && (
                    <div className={styles.inputGroup}>
                      <input
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        placeholder="Повторите пароль"
                        className={styles.inputField}
                        autoComplete="new-password"
                      />
                      <span className={styles.inputUnderline} />
                    </div>
                  )}

                  {/* Ошибки --------------------------------------------- */}
                  {(localError || auth.error) && (
                    <div className={styles.errorText}>
                      {localError || auth.error}
                    </div>
                  )}

                  {/* Submit --------------------------------------------- */}
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={auth.status === "loading"}
                  >
                    {mode === "login" ? "Войти" : "Зарегистрироваться"}
                  </button>
                </motion.form>
              </AnimatePresence>

              {/* Переключатель ---------------------------------------- */}
              <div className={styles.switchMode}>
                {mode === "login"
                  ? "Еще не с нами?"
                  : "Уже есть аккаунт?"}
                <button
                  className={styles.switchButton}
                  onClick={() => {
                    setMode(mode === "login" ? "register" : "login");
                    setLocalError(null);
                  }}
                >
                  {mode === "login" ? "Зарегистрироваться" : "Войти"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
