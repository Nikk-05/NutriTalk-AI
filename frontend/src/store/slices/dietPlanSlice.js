// dietPlanSlice.js — manages all diet plan state globally.
// Replaces local component state so plans persist across navigation
// without hitting the server again on every page visit.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { fetchAPI } from '../../utils/apiCalls'

// ── Async Thunks ──────────────────────────────────────────────

// Fetch all saved plans for the user — GET /diet-plans
export const fetchSavedPlans = createAsyncThunk(
  'dietPlan/fetchSaved',
  async (_, { rejectWithValue }) => {
    const res = await fetchAPI('/diet-plans', 'GET')
    if (res.status === 'success') return res.data.plans
    return rejectWithValue(res.error?.message || 'Failed to load saved plans')
  }
)

// Generate a new AI plan — POST /diet-plans/generate
export const generatePlan = createAsyncThunk(
  'dietPlan/generate',
  async (payload, { rejectWithValue }) => {
    const res = await fetchAPI('/diet-plans/generate', 'POST', payload)
    if (res.status === 'created' || res.status === 'success') return res.data.plan
    return rejectWithValue(res.error?.message || 'Failed to generate plan. Please try again.')
  }
)

// Persist a generated plan — POST /diet-plans/:id/save
export const savePlan = createAsyncThunk(
  'dietPlan/save',
  async ({ planId, title }, { rejectWithValue }) => {
    const res = await fetchAPI(`/diet-plans/${planId}/save`, 'POST', { title })
    if (res.status === 'success') return res.data.plan
    return rejectWithValue(res.error?.message || 'Failed to save plan')
  }
)

// Seed today's meals into MealLog from a saved plan — POST /diet-plans/:id/seed-today
// Creates MealLog entries (logged: false) so the dashboard can display today's plan.
// Idempotent — backend skips meals already seeded for today.
export const seedTodayFromPlan = createAsyncThunk(
  'dietPlan/seedToday',
  async (planId, { rejectWithValue }) => {
    const res = await fetchAPI(`/diet-plans/${planId}/seed-today`, 'POST')
    if (res.status === 'success') return res.data
    return rejectWithValue(res.error?.message || 'Failed to seed meals for today')
  }
)

// ── Slice ─────────────────────────────────────────────────────

const initialState = {
  savedPlans:    [],    // array of isSaved=true plan objects
  currentPlan:   null,  // plan currently rendered on the right panel
  currentPlanId: null,  // MongoDB _id of currentPlan
  isSaved:       false, // whether currentPlan has been saved to DB
  isSeeded:      false, // whether today's meals were seeded from currentPlan
  seededCount:   0,     // number of meals seeded in the last seed operation
  generating:    false,
  saving:        false,
  seeding:       false,
  loadingPlans:  false,
  error:         null,
}

const dietPlanSlice = createSlice({
  name: 'dietPlan',
  initialState,
  reducers: {
    // Load a saved plan into the right panel without a network call
    setCurrentPlan: (state, action) => {
      state.currentPlan   = action.payload
      state.currentPlanId = action.payload._id
      state.isSaved       = action.payload.isSaved ?? true
      state.isSeeded      = false
      state.error         = null
    },
    clearError: (state) => { state.error = null },
    // Reset plan state on logout
    clearDietPlan: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ── fetchSavedPlans ─────────────────────────────────────
      .addCase(fetchSavedPlans.pending, (state) => {
        state.loadingPlans = true
      })
      .addCase(fetchSavedPlans.fulfilled, (state, action) => {
        state.loadingPlans = false
        state.savedPlans   = action.payload
        // Auto-load the most recent plan if nothing is currently displayed
        if (!state.currentPlan && action.payload.length > 0) {
          state.currentPlan   = action.payload[0]
          state.currentPlanId = action.payload[0]._id
          state.isSaved       = true
        }
      })
      .addCase(fetchSavedPlans.rejected, (state) => {
        state.loadingPlans = false
      })

      // ── generatePlan ────────────────────────────────────────
      .addCase(generatePlan.pending, (state) => {
        state.generating  = true
        state.error       = null
        state.currentPlan = null
        state.isSaved     = false
        state.isSeeded    = false
        state.seededCount = 0
      })
      .addCase(generatePlan.fulfilled, (state, action) => {
        state.generating    = false
        state.currentPlan   = action.payload
        state.currentPlanId = action.payload._id
        state.isSaved       = false
      })
      .addCase(generatePlan.rejected, (state, action) => {
        state.generating = false
        state.error      = action.payload
      })

      // ── savePlan ────────────────────────────────────────────
      .addCase(savePlan.pending,  (state) => { state.saving = true })
      .addCase(savePlan.fulfilled, (state, action) => {
        state.saving      = false
        state.isSaved     = true
        state.currentPlan = action.payload
        // Update or prepend in savedPlans list
        const idx = state.savedPlans.findIndex(p => p._id === action.payload._id)
        if (idx >= 0) state.savedPlans[idx] = action.payload
        else state.savedPlans.unshift(action.payload)
      })
      .addCase(savePlan.rejected, (state, action) => {
        state.saving = false
        state.error  = action.payload
      })

      // ── seedTodayFromPlan ───────────────────────────────────
      .addCase(seedTodayFromPlan.pending,  (state) => { state.seeding = true })
      .addCase(seedTodayFromPlan.fulfilled, (state, action) => {
        state.seeding     = false
        state.isSeeded    = true
        state.seededCount = action.payload.seeded ?? 0
      })
      .addCase(seedTodayFromPlan.rejected, (state) => {
        state.seeding = false
        // Don't block the user — seed failure is non-critical
      })
  },
})

export const { setCurrentPlan, clearError, clearDietPlan } = dietPlanSlice.actions
export default dietPlanSlice.reducer

// ── Selectors ─────────────────────────────────────────────────
export const selectSavedPlans    = (state) => state.dietPlan.savedPlans
export const selectCurrentPlan   = (state) => state.dietPlan.currentPlan
export const selectCurrentPlanId = (state) => state.dietPlan.currentPlanId
export const selectIsPlanSaved   = (state) => state.dietPlan.isSaved
export const selectIsSeeded      = (state) => state.dietPlan.isSeeded
export const selectSeededCount   = (state) => state.dietPlan.seededCount
export const selectGenerating    = (state) => state.dietPlan.generating
export const selectSaving        = (state) => state.dietPlan.saving
export const selectSeeding       = (state) => state.dietPlan.seeding
export const selectLoadingPlans  = (state) => state.dietPlan.loadingPlans
export const selectDietPlanError = (state) => state.dietPlan.error
