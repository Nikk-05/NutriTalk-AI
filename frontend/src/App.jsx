import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/ProtectedRoute'
import { lazy, Suspense } from 'react'

const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))
const ChatPage = lazy(() => import('./pages/ChatPage.jsx'))
const DietPlanPage = lazy(() => import('./pages/DietPlanPage.jsx'))
const UpgradePage = lazy(() => import('./pages/UpgradePage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))


export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<h2>Loading.....</h2>}>
        <Routes>
          {/* Auth pages — standalone, no shared layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* App pages — wrapped in shared layout. Landing is public; the
              rest require a logged-in session and redirect to /login if not. */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/chat"      element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="/diet-plan" element={<ProtectedRoute><DietPlanPage /></ProtectedRoute>} />
            <Route path="/upgrade"   element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />
            <Route path="/profile"   element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
          </Route>

          {/* 404 fallback — rendered inside AppLayout so it keeps the navbar */}
          <Route element={<AppLayout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
