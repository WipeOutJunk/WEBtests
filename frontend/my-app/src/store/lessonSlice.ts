// src/store/lessonSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { TestData } from "../pages/TestConstructor/TestConstructor";
import { refreshToken } from "./authSlice";

export interface LessonState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  lastLessonId: string | null;
  lastPublicLink: string | null;
  currentLesson: TestData | null;      // ← сюда придёт загруженный тест
}

const initialState: LessonState = {
  status: "idle",
  error: null,
  lastLessonId: null,
  lastPublicLink: null,
  currentLesson: null,
};

// POST /api/lessons
export const createLesson = createAsyncThunk<
  { id: string; publicLink?: string },
  TestData,
  { rejectValue: string }
>("lesson/create", async (body, { dispatch, rejectWithValue }) => {
  let token = localStorage.getItem("access") || "";
  let res = await fetch("/api/lessons", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    const refreshResult = await dispatch(refreshToken());
    if (refreshToken.fulfilled.match(refreshResult)) {
      token = refreshResult.payload.accessToken;
      res = await fetch("/api/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify(body),
      });
    } else {
      return rejectWithValue("Не удалось обновить сессию");
    }
  }
  if (!res.ok) {
    const txt = await res.text();
    return rejectWithValue(txt);
  }
  return (await res.json()) as { id: string; publicLink?: string };
});

// GET /api/tests/:id
export const fetchLesson = createAsyncThunk<
  TestData,               // payload
  string,                 // id
  { rejectValue: string }
>('lesson/fetchOne', async (id, { dispatch, rejectWithValue }) => {
  const makeRequest = async (token?: string) => {
    return fetch(`/api/tests/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      credentials: 'include',
    });
  };

  /* ❶ первый запрос с текущим токеном (если есть) */
  let token = localStorage.getItem('access') || '';
  let res   = await makeRequest(token);

  /* ❷ если 401 – пробуем обновить токен и повторяем */
  if (res.status === 401) {
    const r = await dispatch(refreshToken());
    if (refreshToken.fulfilled.match(r)) {
      token = r.payload.accessToken;
      res   = await makeRequest(token);
    } else {
      return rejectWithValue('Не удалось обновить сессию');
    }
  }

  /* ❸ обрабатываем результат */
  if (!res.ok) {
    const msg = await res.text();
    return rejectWithValue(msg || 'Не удалось загрузить тест');
  }
  return res.json() as Promise<TestData>;
});

// PUT /api/tests/:id
export const updateLesson = createAsyncThunk<
  { id: string },
  { id: string; body: TestData },
  { rejectValue: string }
>("lesson/update", async ({ id, body }, { dispatch, rejectWithValue }) => {
  let token = localStorage.getItem("access") || "";
  let res = await fetch(`/api/tests/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    const refreshResult = await dispatch(refreshToken());
    if (refreshToken.fulfilled.match(refreshResult)) {
      token = refreshResult.payload.accessToken;
      res = await fetch(`/api/tests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        credentials: "include",
        body: JSON.stringify(body),
      });
    } else {
      return rejectWithValue("Не удалось обновить сессию");
    }
  }
  if (!res.ok) {
    const txt = await res.text();
    return rejectWithValue(txt);
  }
  return res.json();
});

const lessonSlice = createSlice({
  name: "lesson",
  initialState,
  reducers: {
    resetLessonState: () => initialState,
  },
  extraReducers: (b) => {
    b.addCase(createLesson.pending, (s) => { s.status = "loading"; s.error = null; })
      .addCase(createLesson.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.lastLessonId = a.payload.id;
        s.lastPublicLink = a.payload.publicLink ?? null;
      })
      .addCase(createLesson.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload ?? "Ошибка создания";
      })

      .addCase(fetchLesson.pending, (s) => { s.status = "loading"; s.error = null; })
      .addCase(fetchLesson.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.currentLesson = a.payload;
      })
      .addCase(fetchLesson.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload ?? "Ошибка загрузки";
      })

      .addCase(updateLesson.pending, (s) => { s.status = "loading"; s.error = null; })
      .addCase(updateLesson.fulfilled, (s) => {
        s.status = "succeeded";
      })
      .addCase(updateLesson.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.payload ?? "Ошибка обновления";
      });
  },
});

export const { resetLessonState } = lessonSlice.actions;
export default lessonSlice.reducer;

/* ===========================================================
   SELECTORS
   =========================================================== */
export const selectLessonStatus = (s: { lessonReducer: LessonState }) =>
  s.lessonReducer.status;
export const selectLessonError = (s: { lessonReducer: LessonState }) =>
  s.lessonReducer.error;
export const selectLastLessonId = (s: { lessonReducer: LessonState }) =>
  s.lessonReducer.lastLessonId;
export const selectLastPublicLink = (s: { lessonReducer: LessonState }) =>
  s.lessonReducer.lastPublicLink;
export const selectCurrentLesson = (s: { lessonReducer: LessonState }) =>
  s.lessonReducer.currentLesson;
export const selectLastError = selectLessonError;
