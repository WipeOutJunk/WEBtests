import React, { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../store";
import { login, register } from "../../store/authSlice";
import Illustration from "./Illustration";
import styles from "./AuthPage.module.css";

const emailRx = /^\S+@\S+\.\S+$/;

const AuthPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(s => s.auth);

  const [mode, setMode] = useState<"login"|"register">("login");
  const [email, setEmail]       = useState("");
  const [pass,  setPass]        = useState("");
  const [conf,  setConf]        = useState("");
  const [error, setError]       = useState<string|null>(null);
  const [sent,  setSent]        = useState(false);

  /* submit ------------------------------------------------------------ */
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!emailRx.test(email))      return setError("Неверный email");
    if (pass.length < 6)           return setError("Пароль ≥ 6 символов");
    if (mode==="register" && pass!==conf) return setError("Пароли не совпадают");
    setError(null);

    if (mode==="login") {
      dispatch(login({ email, password: pass }));
    } else {
      dispatch(register({ email, password: pass }))
        .then(res => register.fulfilled.match(res) && setSent(true));
    }
  };

  return (
    <div className={styles.layout}>
      {/* Иллюстрация — фон под всем */}
      <Illustration />

      {/* Стеклянная панель справа */}
      <div className={styles.glass}>
        {sent ? (
          <div className={styles.info}>
            <h2>Проверьте почту</h2>
            <p>Мы отправили ссылку на <strong>{email}</strong>.</p>
            <button className={styles.btn} onClick={()=>setSent(false)}>
              Вернуться
            </button>
          </div>
        ) : (
          <>
            <h1 className={styles.title}>{mode==="login"?"Вход":"Регистрация"}</h1>

            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{opacity:0,x:40}}
                animate={{opacity:1,x:0}}
                exit={{opacity:0,x:-40}}
                transition={{duration:.25}}
                onSubmit={submit}
                className={styles.form}
              >
                <input
                  className={styles.input}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                />
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Пароль"
                  value={pass}
                  onChange={e=>setPass(e.target.value)}
                />
                {mode==="register" && (
                  <input
                    className={styles.input}
                    type="password"
                    placeholder="Повторите пароль"
                    value={conf}
                    onChange={e=>setConf(e.target.value)}
                  />
                )}

                {error && <div className={styles.error}>{error}</div>}

                <button
                  className={styles.btn}
                  disabled={auth.status==="loading"}
                >
                  {mode==="login" ? "Войти" : "Зарегистрироваться"}
                </button>
              </motion.form>
            </AnimatePresence>

            <div className={styles.switch}>
              {mode==="login" ? "Нет аккаунта?" : "Есть аккаунт?"}
              <button
                className={styles.link}
                onClick={()=>{ setMode(mode==="login"?"register":"login"); setError(null); }}
              >
                {mode==="login" ? "Регистрация" : "Войти"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
