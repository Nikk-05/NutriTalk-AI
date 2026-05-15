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
// Clears unlogged planned meals first, then creates new MealLog entries (logged: false).
export const seedTodayFromPlan = createAsyncThunk(
  'dietPlan/seedToday',
  async (planId, { rejectWithValue }) => {
    const res = await fetchAPI(`/diet-plans/${planId}/seed-today`, 'POST')
    if (res.status === 'success') return res.data
    return rejectWithValue(res.error?.message || 'Failed to seed meals for today')
  }
)

// Delete a saved plan — DELETE /diet-plans/:id
export const deletePlan = createAsyncThunk(
  'dietPlan/delete',
  async (planId, { rejectWithValue }) => {
    const res = await fetchAPI(`/diet-plans/${planId}`, 'DELETE')
    if (res.status === 'success') return planId
    return rejectWithValue(res.error?.message || 'Failed to delete plan')
  }
)

// Set a plan as the active plan — PATCH /diet-plans/:id/set-active
export const setActivePlan = createAsyncThunk(
  'dietPlan/setActive',
  async (planId, { rejectWithValue }) => {
    const res = await fetchAPI(`/diet-plans/${planId}/set-active`, 'PATCH')
    if (res.status === 'success') return res.data.plan
    return rejectWithValue(res.error?.message || 'Failed to set active plan')
  }
)

// ── Slice ─────────────────────────────────────────────────────

const initialState = {
  savedPlans:    [],    // array of isSaved=true plan objects
  currentPlan:   null,  // plan currently rendered on the right panel
  currentPlanId: null,  // MongoDB _id of currentPlan
  activePlanId:  null,  // _id of the plan marked isActive=true
  isSaved:       false, // whether currentPlan has been saved to DB
  isSeeded:      false, // whether today's meals were seeded from currentPlan
  seededCount:   0,     // number of meals seeded in the last seed operation
  generating:    false,
  saving:        false,
  seeding:       false,
  deleting:      null,  // planId currently being deleted (null = none)
  settingActive: null,  // planId currently being set active (null = none)
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
        // Identify which plan is active
        const active = action.payload.find(p => p.isActive) || action.payload[0] || null
        if (active) state.activePlanId = active._id
        // Auto-load the active plan if nothing is currently displayed
        if (!state.currentPlan && active) {
          state.currentPlan   = active
          state.currentPlanId = active._id
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
        state.saving        = false
        state.isSaved       = true
        state.currentPlan   = action.payload
        state.activePlanId  = action.payload._id
        // Mark all others as inactive in the local list, add/update this one
        state.savedPlans = state.savedPlans.map(p => ({ ...p, isActive: false }))
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
        state.seeding      = false
        state.isSeeded     = true
        state.seededCount  = action.payload.seeded ?? 0
        // Seeding also sets this plan as active on the backend
        if (state.currentPlanId) {
          state.activePlanId = state.currentPlanId
          state.savedPlans = state.savedPlans.map(p =>
            ({ ...p, isActive: p._id === state.currentPlanId })
          )
        }
      })
      .addCase(seedTodayFromPlan.rejected, (state) => {
        state.seeding = false
      })

      // ── deletePlan ──────────────────────────────────────────
      .addCase(deletePlan.pending, (state, action) => {
        state.deleting = action.meta.arg
      })
      .addCase(deletePlan.fulfilled, (state, action) => {
        const deletedId = action.payload
        state.deleting   = null
        state.savedPlans = state.savedPlans.filter(p => p._id !== deletedId)

        // If we just deleted the currently viewed plan, switch to next available
        if (state.currentPlanId === deletedId) {
          const next = state.savedPlans[0] ?? null
          state.currentPlan   = next
          state.currentPlanId = next ? next._id : null
          state.isSaved       = !!next
          state.isSeeded      = false
        }

        // If deleted was the active plan, promote the next saved plan
        if (state.activePlanId === deletedId) {
          const next = state.savedPlans[0] ?? null
          state.activePlanId = next ? next._id : null
          // Direct mutation — no spread of Immer draft
          if (next) state.savedPlans[0].isActive = true
        }
      })
      .addCase(deletePlan.rejected, (state, action) => {
        state.deleting = null
        state.error    = action.payload
      })

      // ── setActivePlan ───────────────────────────────────────
      .addCase(setActivePlan.pending, (state, action) => {
        state.settingActive = action.meta.arg
      })
      .addCase(setActivePlan.fulfilled, (state, action) => {
        state.settingActive = null
        state.activePlanId  = action.payload._id
        state.savedPlans    = state.savedPlans.map(p =>
          ({ ...p, isActive: p._id === action.payload._id })
        )
        state.isSeeded      = false // need to re-seed for the new active plan
      })
      .addCase(setActivePlan.rejected, (state, action) => {
        state.settingActive = null
        state.error         = action.payload
      })
  },
})

export const { setCurrentPlan, clearError, clearDietPlan } = dietPlanSlice.actions
export default dietPlanSlice.reducer

// ── Selectors ─────────────────────────────────────────────────
export const selectSavedPlans    = (state) => state.dietPlan.savedPlans
export const selectCurrentPlan   = (state) => state.dietPlan.currentPlan
export const selectCurrentPlanId = (state) => state.dietPlan.currentPlanId
export const selectActivePlanId  = (state) => state.dietPlan.activePlanId
export const selectIsPlanSaved   = (state) => state.dietPlan.isSaved
export const selectIsSeeded      = (state) => state.dietPlan.isSeeded
export const selectSeededCount   = (state) => state.dietPlan.seededCount
export const selectGenerating    = (state) => state.dietPlan.generating
export const selectSaving        = (state) => state.dietPlan.saving
export const selectSeeding       = (state) => state.dietPlan.seeding
export const selectDeleting      = (state) => state.dietPlan.deleting
export const selectSettingActive = (state) => state.dietPlan.settingActive
export const selectLoadingPlans  = (state) => state.dietPlan.loadingPlans
export const selectDietPlanError = (state) => state.dietPlan.error
