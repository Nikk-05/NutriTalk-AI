import axios from 'axios'
import { API } from '../constants/appConstants'

const api = axios.create({
    baseURL: API.NODE_BASE_URL,
    withCredentials: true, // send httpOnly refresh-token cookie on every request
    headers: {
        "Content-Type": "application/json",
    },
})

// ── Request interceptor — attach latest access token ─────────
// Reads from sessionStorage so the token stays current after a refresh.
api.interceptors.request.use(config => {
    const token = sessionStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

// ── Token refresh queue ───────────────────────────────────────
// Prevents multiple simultaneous refresh calls when several requests
// fail with 401 at the same time. They all queue up and retry once
// the single refresh resolves.
let isRefreshing = false
let failedQueue  = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(({ resolve, reject }) =>
        error ? reject(error) : resolve(token)
    )
    failedQueue = []
}

// ── Response interceptor — handle expired access tokens ───────
// When the backend returns 401 TOKEN_EXPIRED:
//   1. Call POST /auth/refresh — the browser automatically sends the
//      httpOnly refreshToken cookie (withCredentials: true above).
//   2. Store the new access token in sessionStorage.
//   3. Retry the original failed request with the new token.
//   4. If the refresh itself fails, clear session and redirect to /login.
api.interceptors.response.use(
    response => response,
    async error => {
        const original = error.config
        const code     = error.response?.data?.error?.code

        if (
            error.response?.status === 401 &&
            code === 'TOKEN_EXPIRED' &&
            !original._retry // prevent infinite retry loop
        ) {
            if (isRefreshing) {
                // Another refresh is already in flight — queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    original.headers.Authorization = `Bearer ${token}`
                    return api(original)
                })
            }

            original._retry = true
            isRefreshing    = true

            try {
                // POST /auth/refresh — cookie is sent automatically
                const refreshRes = await api.post('/auth/refresh')
                const newToken   = refreshRes.data?.data?.accessToken
                if (!newToken) throw new Error('No token in refresh response')

                // Persist new token so future requests use it immediately
                sessionStorage.setItem('token', newToken)
                api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
                original.headers.Authorization = `Bearer ${newToken}`

                processQueue(null, newToken)
                return api(original) // retry original request
            } catch (refreshError) {
                processQueue(refreshError, null)
                // Refresh token is invalid or expired — force re-login.
                // Hard redirect re-initialises the app so Redux is wiped cleanly.
                sessionStorage.removeItem('token')
                sessionStorage.removeItem('user')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export const fetchAPI = async (url, method, data) => {
    try {
        const response = await api.request({ url, method, data })
        return response.data
    } catch (error) {
        return error.response?.data ?? { status: 'error', error: { message: error.message } }
    }
}

export const auth = {
    isLoggedIn: () => !!sessionStorage.getItem('token'),
    setToken:   (token) => sessionStorage.setItem('token', token),
    logout: () => {
        sessionStorage.removeItem('token')
        sessionStorage.removeItem('user')
    },
    getUser: () => {
        const raw = sessionStorage.getItem('user')
        return raw ? JSON.parse(raw) : null
    },
    setUser: (user) => sessionStorage.setItem('user', JSON.stringify(user)),
}
