// src/store/authSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

/* ---------- THUNKS -------------------------------------------------- */
export const login = createAsyncThunk<
  { accessToken: string; refreshToken: string; expiresIn: number },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (body, { rejectWithValue }) => {
  const res = await fetch("api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) return rejectWithValue(await res.text());
  return res.json();
});

export const register = createAsyncThunk<
  { message: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/register", async (body, { rejectWithValue }) => {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) return rejectWithValue(await res.text());
  return res.json();
});

export const confirm = createAsyncThunk<
  { accessToken: string; refreshToken: string; expiresIn: number },
  { email: string; code: string },
  { rejectValue: string }
>("auth/confirm", async (body, { rejectWithValue }) => {
  const res = await fetch("/api/auth/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) return rejectWithValue(await res.text());
  return res.json();
});

export const refreshToken = createAsyncThunk<
  { accessToken: string; refreshToken: string; expiresIn: number },
  void,
  { rejectValue: string }
>('auth/refresh', async (_, { rejectWithValue }) => {
  const stored = localStorage.getItem('refresh');   // может быть null

  const res = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',                         // cookie по-любому придёт
    body: stored ? JSON.stringify({ refreshToken: stored }) : undefined,
  });

  if (!res.ok) return rejectWithValue(await res.text());
  return res.json();                                // { accessToken, refreshToken }
});


/* ---------- STATE --------------------------------------------------- */
interface AuthState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  token: string | null;
  isCheckingToken: boolean; 
}

const initialState: AuthState = {
  status: "idle",
  error: null,
  token: localStorage.getItem("access"), 
  isCheckingToken: false
};

/* ---------- SLICE --------------------------------------------------- */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    /* --- LOGIN --- */
    b.addCase(login.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(login.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.token = a.payload.accessToken;
      localStorage.setItem("access", a.payload.accessToken);
      localStorage.setItem("refresh", a.payload.refreshToken); // Сохраняем refreshToken
    });
    b.addCase(login.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload ?? a.error.message ?? "Ошибка";
    });

    /* --- REGISTER --- */
    b.addCase(register.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(register.fulfilled, (s) => {
      s.status = "succeeded";
    });
    b.addCase(register.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload ?? a.error.message ?? "Ошибка";
    });

    /* --- CONFIRM --- */
    b.addCase(confirm.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(confirm.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.token  = a.payload.accessToken;
      localStorage.setItem("access", a.payload.accessToken); // <-- тоже сохраняем
    });
    b.addCase(confirm.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload ?? a.error.message ?? "Ошибка";
    });
    // refresh
    b.addCase(refreshToken.pending, (s) => {
      s.isCheckingToken = true;
      s.error = null;
    });
    b.addCase(refreshToken.fulfilled, (state, action) => {
      state.isCheckingToken = false;
      state.status = 'succeeded';
      state.token = action.payload.accessToken;
    

      localStorage.setItem('access', action.payload.accessToken);
      localStorage.setItem('refresh', action.payload.refreshToken);
    });
    b.addCase(refreshToken.rejected, (s, a) => {
      s.isCheckingToken = false;
      s.status = "failed";
      s.error = a.payload ?? "Не удалось обновить токен";
      s.token = null; // Очищаем токен
      localStorage.removeItem("access"); // Удаляем из localStorage
    });
  },
});

export default authSlice.reducer;
