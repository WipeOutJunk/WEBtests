import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface AuthState {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  token: string | null;
}
const initialState: AuthState = { status: "idle", error: null, token: null };

/* ======== LOGIN ======================================================= */
export const login = createAsyncThunk<
  { token: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (body, { rejectWithValue }) => {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return rejectWithValue("Неверный email или пароль.");
  return res.json();
});

/* ======== REGISTER ==================================================== */
export const register = createAsyncThunk<
  { message: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/register", async (body, { rejectWithValue }) => {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return rejectWithValue("Не удалось зарегистрироваться.");
  return res.json();
});

/* ======== SLICE ======================================================= */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    /* login */
    b.addCase(login.pending, (s) => { s.status = "loading"; s.error = null; });
    b.addCase(login.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.token = a.payload.token;
    });
    b.addCase(login.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload ?? a.error.message ?? "Ошибка";
    });

    /* register */
    b.addCase(register.pending, (s) => { s.status = "loading"; s.error = null; });
    b.addCase(register.fulfilled, (s) => { s.status = "succeeded"; });
    b.addCase(register.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload ?? a.error.message ?? "Ошибка";
    });
  },
});
export default authSlice.reducer;
