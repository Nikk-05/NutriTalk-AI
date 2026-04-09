import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { lazy, Suspense } from 'react'

const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))
const ChatPage = lazy(() => import('./pages/ChatPage.jsx'))
const DietPlanPage = lazy(() => import('./pages/DietPlanPage.jsx'))
const UpgradePage = lazy(() => import('./pages/UpgradePage.jsx'))


export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<h2>Loading.....</h2>}>
        <Routes>
          {/* Auth pages — standalone, no shared layout */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* App pages — wrapped in shared layout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/diet-plan" element={<DietPlanPage />} />
            <Route path="/upgrade" element={<UpgradePage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
