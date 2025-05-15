import { configureStore } from "@reduxjs/toolkit";
import auth from "./authSlice";
import dashboard from "./dashboardSlice"
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

export const store = configureStore({ reducer: { auth,    dashboard,   // ← добавили
} });

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
/* кастомные хуки */

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();

