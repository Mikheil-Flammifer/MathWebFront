import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyOtpPage from './pages/auth/VerifyOtpPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Main pages
import HomePage from './pages/home/HomePage'
import VideoPlayerPage from './pages/video/VideoPlayerPage'
import QuestMapPage from './pages/quest/QuestMapPage'
import QuestDetailPage from './pages/quest/QuestDetailPage'
import ProblemPage from './pages/problem/ProblemPage'
import ProfilePage from './pages/profile/ProfilePage'
import SubscriptionPage from './pages/subscription/SubscriptionPage'

// Layout
import MainLayout from './components/layout/MainLayout'

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public only route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return !isAuthenticated ? children : <Navigate to="/home" replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute><RegisterPage /></PublicRoute>
      } />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/forgot-password" element={
        <PublicRoute><ForgotPasswordPage /></PublicRoute>
      } />
      <Route path="/reset-password" element={
        <PublicRoute><ResetPasswordPage /></PublicRoute>
      } />

      {/* Protected routes with layout */}
      <Route element={
        <ProtectedRoute><MainLayout /></ProtectedRoute>
      }>
        <Route path="/home" element={<HomePage />} />
        <Route path="/videos/:id" element={<VideoPlayerPage />} />
        <Route path="/quests" element={<QuestMapPage />} />
        <Route path="/quests/:id" element={<QuestDetailPage />} />
        <Route path="/quests/:questId/problems/:problemId"
               element={<ProblemPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/subscribe" element={<SubscriptionPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}