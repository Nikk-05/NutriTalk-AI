// dashboardSlice.js — fetches and stores dashboard data from the backend.
// Uses Redux Toolkit's createAsyncThunk for async API calls.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchAPI } from '../../utils/apiCalls'

// Recalculates calories + macros totals from the meals that are currently logged.
// Called after every toggle so the progress ring/bars update instantly.
function recalcFromMeals(summary, meals) {
  const logged  = meals.filter(m => m.logged)
  const consumed = logged.reduce((s, m) => s + (m.calories       || 0), 0)
  const protein  = logged.reduce((s, m) => s + (m.macros?.proteinG || 0), 0)
  const carbs    = logged.reduce((s, m) => s + (m.macros?.carbsG   || 0), 0)
  const fats     = logged.reduce((s, m) => s + (m.macros?.fatG     || 0), 0)
  const target   = summary.calories.target
  return {
    calories: { ...summary.calories, consumed, remaining: Math.max(0, target - consumed) },
    macros: {
      protein: { ...summary.macros.protein, consumed: protein },
      carbs:   { ...summary.macros.carbs,   consumed: carbs   },
      fats:    { ...summary.macros.fats,    consumed: fats    },
    },
  }
}

// Fetch overall dashboard summary (calories, macros, meals, streak, weight, activity)
// Calls GET /dashboard/summary
export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (_, { rejectWithValue }) => {
    const res = await fetchAPI('/dashboard/summary', 'GET')
    if (res.status === 'success') return res.data
    return rejectWithValue(res.error?.message || 'Failed to load dashboard')
  }
)

// Toggle a meal's logged status — PUT /meals/:id { logged: bool }
// Uses optimistic update: flips the flag immediately, recalculates
// calorie + macro totals in Redux, then confirms with the backend.
// On failure the original summary snapshot is restored.
export const toggleMealLogged = createAsyncThunk(
  'dashboard/toggleMealLogged',
  async ({ mealId, logged }, { getState, rejectWithValue }) => {
    const res = await fetchAPI(`/meals/${mealId}`, 'PUT', { logged })
    if (res.status === 'success') return { mealId, logged }
    return rejectWithValue({ mealId, logged: !logged }) // signal rollback
  }
)

// Fetch weight history for a given period ('7d' or '30d')
// Calls GET /dashboard/weight-history?period=<period>
export const fetchWeightHistory = createAsyncThunk(
  'dashboard/fetchWeightHistory',
  async (period = '7d', { rejectWithValue }) => {
    const res = await fetchAPI(`/dashboard/weight-history?period=${period}`, 'GET')
    if (res.status === 'success') return { ...res.data, period }
    return rejectWithValue(res.error?.message || 'Failed to load weight history')
  }
)

const initialState = {
  summary: null,          // full summary object from GET /dashboard/summary
  weightHistory: [],      // array of { date, kg } entries
  period: '7d',           // currently selected chart period
  loading: false,         // true while fetchDashboardSummary is in flight
  error: null,            // error message if fetch failed
  togglingMealIds: [],    // meal IDs currently awaiting PUT /meals/:id response
}

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Switch chart period and trigger a new weight-history fetch from the component
    setPeriod: (state, action) => {
      state.period = action.payload
    },
    // Reset dashboard state (e.g. on logout)
    clearDashboard: (state) => {
      state.summary = null
      state.weightHistory = []
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // ── fetchDashboardSummary lifecycle ──────────────────
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.loading = false
        state.summary = action.payload
        // Weight history is also embedded in the summary (last 7 entries)
        state.weightHistory = action.payload.weightHistory || []
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

      // ── fetchWeightHistory lifecycle ─────────────────────
      .addCase(fetchWeightHistory.fulfilled, (state, action) => {
        state.weightHistory = action.payload.weightHistory || []
        state.period = action.payload.period
      })

      // ── toggleMealLogged lifecycle ────────────────────────
      // pending  → optimistically flip the flag + recalculate totals immediately
      .addCase(toggleMealLogged.pending, (state, action) => {
        const { mealId, logged } = action.meta.arg
        if (!state.summary) return
        state.togglingMealIds.push(mealId)
        const meals = state.summary.todaysMeals.map(m =>
          m.id === mealId ? { ...m, logged } : m
        )
        state.summary.todaysMeals = meals
        const recalc = recalcFromMeals(state.summary, meals)
        state.summary.calories = recalc.calories
        state.summary.macros   = recalc.macros
      })
      // fulfilled → just remove from in-flight set (state already correct)
      .addCase(toggleMealLogged.fulfilled, (state, action) => {
        state.togglingMealIds = state.togglingMealIds.filter(id => id !== action.payload.mealId)
      })
      // rejected  → roll back to the pre-toggle value and recalculate
      .addCase(toggleMealLogged.rejected, (state, action) => {
        const { mealId, logged: originalLogged } = action.payload ?? {}
        if (!state.summary || !mealId) return
        state.togglingMealIds = state.togglingMealIds.filter(id => id !== mealId)
        const meals = state.summary.todaysMeals.map(m =>
          m.id === mealId ? { ...m, logged: originalLogged } : m
        )
        state.summary.todaysMeals = meals
        const recalc = recalcFromMeals(state.summary, meals)
        state.summary.calories = recalc.calories
        state.summary.macros   = recalc.macros
      })
  },
})

export const { setPeriod, clearDashboard } = dashboardSlice.actions
export default dashboardSlice.reducer

// Selectors
export const selectSummary = (state) => state.dashboard.summary
export const selectWeightHistory = (state) => state.dashboard.weightHistory
export const selectDashboardLoading = (state) => state.dashboard.loading
export const selectDashboardError = (state) => state.dashboard.error
export const selectPeriod = (state) => state.dashboard.period