import React, { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../store";
import { login, register, confirm } from "../../store/authSlice";
import Illustration from "./Illustration";
import styles from "./AuthPage.module.css";

const emailRx = /^\S+@\S+\.\S+$/;

const AuthPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(s => s.auth);
  const navigate = useNavigate();

  /* UI-шаги ----------------------------------------------------------- */
  const [step,  setStep]  = useState<"login"|"register"|"sent"|"confirm">("login");

  /* общие поля -------------------------------------------------------- */
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [conf,  setConf]  = useState("");
  const [code,  setCode]  = useState("");
  const [error, setError] = useState<string|null>(null);

  /* submit ------------------------------------------------------------ */
  const submit = (e: FormEvent) => {
    e.preventDefault();

    if (step==="login") {
      if (!emailRx.test(email))  return setError("Неверный email");
      dispatch(login({ email, password: pass }))
      .unwrap()
      .then(() => {
        navigate("/dashboard");     // например, туда
      })
      .catch(() => {/* ошибка */});
      return;
    }

    if (step==="register") {
      if (!emailRx.test(email))  return setError("Неверный email");
      if (pass.length < 6)       return setError("Пароль ≥ 6 символов");
      if (pass !== conf)         return setError("Пароли не совпадают");
      dispatch(register({ email, password: pass }))
        .then(res => register.fulfilled.match(res) && setStep("sent"));
      return;
    }

    if (step==="confirm") {
      if (code.length !== 6) return setError("Код из 6 цифр");
      dispatch(confirm({ email, code }))
      .unwrap()
      .then(() => {
        navigate("/dashboard");
      })
      .catch(() => {/* ошибка */});
    }
  };

  /* ---------- JSX ---------- */
  return (
    <div className={styles.layout}>
      <Illustration />
      <div className={styles.glass}>
        <AnimatePresence mode="wait">
          {/* ---------- LOGIN / REGISTER формы ---------- */}
          {(step==="login" || step==="register") && (
            <motion.form
              key={step}
              initial={{opacity:0,x:40}}
              animate={{opacity:1,x:0}}
              exit={{opacity:0,x:-40}}
              transition={{duration:.25}}
              onSubmit={submit}
              className={styles.form}
            >
              <h1 className={styles.title}>{step==="login"?"Вход":"Регистрация"}</h1>

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
              {step==="register" && (
                <input
                  className={styles.input}
                  type="password"
                  placeholder="Повторите пароль"
                  value={conf}
                  onChange={e=>setConf(e.target.value)}
                />
              )}
              {error && <div className={styles.error}>{error}</div>}

              <button className={styles.btn} disabled={auth.status==="loading"}>
                {step==="login"?"Войти":"Зарегистрироваться"}
              </button>

              <div className={styles.switch}>
                {step==="login"?"Нет аккаунта?":"Есть аккаунт?"}
                <button
                  className={styles.link}
                  type="button"
                  onClick={()=>{
                    setStep(step==="login"?"register":"login");
                    setError(null);
                  }}
                >
                  {step==="login"?"Регистрация":"Войти"}
                </button>
              </div>
            </motion.form>
          )}

          {/* ---------- SENT ---------- */}
          {step==="sent" && (
            <motion.div
              key="sent"
              initial={{opacity:0,y:40}}
              animate={{opacity:1,y:0}}
              exit={{opacity:0,y:-40}}
              transition={{duration:.25}}
              className={styles.info}
            >
              <h2>Проверьте почту</h2>
              <p>Мы отправили код на <strong>{email}</strong>.</p>
              <button className={styles.btn} onClick={()=>setStep("confirm")}>
                Ввести код
              </button>
            </motion.div>
          )}

          {/* ---------- CONFIRM ---------- */}
          {step==="confirm" && (
            <motion.form
              key="confirm"
              initial={{opacity:0,x:40}}
              animate={{opacity:1,x:0}}
              exit={{opacity:0,x:-40}}
              transition={{duration:.25}}
              onSubmit={submit}
              className={styles.form}
            >
              <h1 className={styles.title}>Подтверждение почты</h1>
              <input
                className={styles.input}
                type="text"
                placeholder="6-значный код"
                value={code}
                onChange={e=>setCode(e.target.value)}
              />
              {error && <div className={styles.error}>{error}</div>}
              <button className={styles.btn} disabled={auth.status==="loading"}>
                Подтвердить
              </button>
              <button
                className={styles.link}
                type="button"
                onClick={()=>setStep("sent")}
              >
                Назад
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
export default AuthPage;
