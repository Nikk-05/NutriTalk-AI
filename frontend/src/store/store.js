// store.js — root Redux store combining all feature slices.

import { configureStore } from '@reduxjs/toolkit'
import authReducer     from './slices/authSlice'
import dashboardReducer from './slices/dashboardSlice'
import dietPlanReducer  from './slices/dietPlanSlice'

export const store = configureStore({
  reducer: {
    auth:      authReducer,      // authenticated user data
    dashboard: dashboardReducer, // dashboard summary, weight history, loading states
    dietPlan:  dietPlanReducer,  // saved plans, current plan, generate/save/seed states
  },
})
