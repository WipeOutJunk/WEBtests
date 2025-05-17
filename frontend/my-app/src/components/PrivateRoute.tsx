import { Navigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store";
import { useEffect, useRef, type JSX } from "react";
import { refreshToken } from "../store/authSlice";

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const dispatch = useAppDispatch();
  const { token, isCheckingToken } = useAppSelector((s) => s.auth);

  // флаг, что мы уже пытались сделать refresh
  const triedRefresh = useRef(false);

  useEffect(() => {
    // если нет токена и ещё не пробовали — запускаем refreshToken()
    if (!token && !triedRefresh.current) {
      triedRefresh.current = true;
      dispatch(refreshToken());
    }
  }, [token, dispatch]);

  // 1) Если уже есть accessToken — сразу показываем контент
  if (token) {
    return children;
  }

  // 2) Пока не делали refresh или запрос в процессе — показываем спиннер
  if (!triedRefresh.current || isCheckingToken) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-blue-500" />
          <p className="mt-4 text-gray-700">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // 3) После попытки обновления, если токена так и нет — редиректим на /auth
  return <Navigate to="/auth" replace />;
};
