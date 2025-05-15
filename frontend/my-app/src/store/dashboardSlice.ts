import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

export interface Stats {
  tests: number;
  polls: number;
  avgScore: number;
  attempts24h: number;
}

export interface Attempt {
  id: string;
  title: string;
  date: string;
  participant: string;
  score: number | null;
}

export interface TestCard {
  id: string;
  title: string;
  status: 'draft' | 'published';
  createdAt: string;
}

interface DashboardState {
  stats: Stats;
  attempts: Attempt[];
  tests: TestCard[];
  loading: boolean;
  error: string | null; // Explicitly string or null
}

const initialState: DashboardState = {
  stats: { tests: 0, polls: 0, avgScore: 0, attempts24h: 0 },
  attempts: [],
  tests: [],
  loading: false,
  error: null,
};

export const fetchStats = createAsyncThunk<Stats, void, { rejectValue: string }>(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access');
      const res = await fetch('/api/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json(); // Предполагаем, что сервер возвращает JSON с ошибкой
        return rejectWithValue(errorData.message || 'Не удалось загрузить статистику');
      }
      return res.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  },
);

export const fetchAttempts = createAsyncThunk<
  Attempt[],
  { limit: number },
  { rejectValue: string }
>(
  'dashboard/fetchAttempts',
  async ({ limit }, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access');
      const res = await fetch(`/api/attempts?limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(errorData.message || 'Не удалось загрузить попытки');
      }
      return res.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  },
);

export const fetchTests = createAsyncThunk<
  TestCard[],
  void,
  { rejectValue: string }
>(
  'dashboard/fetchTests',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('access');
      const res = await fetch('/api/tests', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        return rejectWithValue(errorData.message || 'Не удалось загрузить тесты');
      }
      return res.json();
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Неизвестная ошибка');
    }
  },
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Неизвестная ошибка'; // Убеждаемся, что всегда строка
      })
      .addCase(fetchAttempts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttempts.fulfilled, (state, action) => {
        state.loading = false;
        state.attempts = action.payload;
      })
      .addCase(fetchAttempts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Неизвестная ошибка'; // Убеждаемся, что всегда строка
      })
      .addCase(fetchTests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTests.fulfilled, (state, action) => {
        state.loading = false;
        state.tests = action.payload;
      })
      .addCase(fetchTests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Неизвестная ошибка'; // Убеждаемся, что всегда строка
      });
  },
});

export default dashboardSlice.reducer;