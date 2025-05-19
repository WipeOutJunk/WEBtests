// src/store/lessonSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { TestData } from "../pages/TestConstructor/TestConstructor";
import { refreshToken } from "./authSlice"; // <-- импорт thunk для обновления токена

/* ---------- THUNK -------------------------------------------------- */
// ❶ отправляем TestData, ждём { id, publicLink? }
//     при 401 пробуем dispatch(refreshToken()), затем повторяем запрос с новым токеном
export const createLesson = createAsyncThunk<
  { id: string; publicLink?: string }, // fulfilled
  TestData, // аргумент
  { rejectValue: string }
>("lesson/create", async (body, { dispatch, rejectWithValue }) => {
  try {
    // первичный запрос
    let token = localStorage.getItem("access") || "";
    let res = await fetch("/api/lessons", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    // если 401 — пробуем обновить токен
    if (res.status === 401) {
      const refreshResult = await dispatch(refreshToken());
      if (refreshToken.fulfilled.match(refreshResult)) {
        // получили новый accessToken
        token = refreshResult.payload.accessToken;
        res = await fetch("/api/lessons", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: JSON.stringify(body),
        });
      } else {
        return rejectWithValue("Не удалось обновить сессию");
      }
    }

    // если после (повторного) запроса не ok — вычитываем текст/JSON ошибки
    if (!res.ok) {
      try {
        const err = await res.json();
        return rejectWithValue(err.message || "Не удалось создать урок");
      } catch {
        return rejectWithValue(await res.text());
      }
    }

    return (await res.json()) as { id: string; publicLink?: string };
  } catch (e) {
    return rejectWithValue(e instanceof Error ? e.message : "Сетевая ошибка");
  }
});

/* ---------- STATE -------------------------------------------------- */
export interface LessonState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastLessonId: string | null;
  lastPublicLink: string | null;
}

const initialState: LessonState = {
  status: "idle",
  error: null,
  lastLessonId: null,
  lastPublicLink: null,
};

/* ---------- SLICE -------------------------------------------------- */
const lessonSlice = createSlice({
  name: "lesson",
  initialState,
  reducers: {
    resetLessonState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createLesson.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(createLesson.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.lastLessonId = a.payload.id;
        s.lastPublicLink = a.payload.publicLink ?? null;
      })
      .addCase(createLesson.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload ?? "Не удалось создать урок";
      });
  },
});

export const { resetLessonState } = lessonSlice.actions;
export default lessonSlice.reducer;

/* ---------- СЕЛЕКТОРЫ ---------------------------------------- */
export const selectLessonStatus = (st: { lesson: LessonState }) =>
  st.lesson.status;
export const selectLessonError = (st: { lesson: LessonState }) =>
  st.lesson.error;
export const selectLastLessonId = (st: { lesson: LessonState }) =>
  st.lesson.lastLessonId;
export const selectLastPublicLink = (st: { lesson: LessonState }) =>
  st.lesson.lastPublicLink;


