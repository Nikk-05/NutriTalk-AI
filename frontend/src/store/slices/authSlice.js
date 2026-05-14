// authSlice.js — manages authenticated user state across the app.
// Initial state is hydrated from sessionStorage so the user stays
// logged in across page refreshes without hitting the server again.

import { createSlice } from '@reduxjs/toolkit'
import { auth as authStorage } from '../../utils/apiCalls'

const initialState = {
  user: authStorage.getUser(),           // full user object (name, email, preferences, metrics…)
  token: sessionStorage.getItem('token'), // JWT access token
  isLoggedIn: authStorage.isLoggedIn(),  // boolean convenience flag
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called after successful login or signup — stores user + token in Redux
    setCredentials: (state, action) => {
      const { user, token } = action.payload
      state.user = user
      state.token = token
      state.isLoggedIn = true
    },

    // Called on logout — wipes all auth state from Redux
    clearCredentials: (state) => {
      state.user = null
      state.token = null
      state.isLoggedIn = false
    },
  },
})

export const { setCredentials, clearCredentials } = authSlice.actions
export default authSlice.reducer

// Selectors
export const selectUser = (state) => state.auth.user
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn
export const selectToken = (state) => state.auth.token