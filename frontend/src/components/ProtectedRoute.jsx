import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsLoggedIn } from '../store/slices/authSlice'

// Guard for app pages that require an authenticated session.
// Renders the children (or a nested <Outlet> via <ProtectedRoute><Outlet/></ProtectedRoute>)
// only when the user is logged in. Otherwise redirects to /login, preserving
// the attempted path so LoginPage could redirect back after sign-in if wired.
export default function ProtectedRoute({ children }) {
  const loggedIn = useSelector(selectIsLoggedIn)
  const location = useLocation()

  if (!loggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  return children
}
