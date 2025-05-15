// src/store/authSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

/* ---------- THUNKS -------------------------------------------------- */
export const login = createAsyncThunk<
  { accessToken: string; expiresIn: number },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (body, { rejectWithValue }) => {
  const res = await fetch("api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // <-- cookie refresh
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

/* ---------- STATE --------------------------------------------------- */
interface AuthState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  token: string | null;
}

const initialState: AuthState = {
  status: "idle",
  error: null,
  token: localStorage.getItem("access"), // <-- читаем при старте
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
      s.token = a.payload.accessToken; // ← accessToken
      localStorage.setItem("access", a.payload.accessToken); // <-- сохраняем
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
  },
});

export default authSlice.reducer;
