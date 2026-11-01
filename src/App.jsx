import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import VerifyOtpPage from './pages/auth/VerifyOtpPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Admin pages
import AdminQuestsPage from './pages/quest/AdminQuestsPage'
import AdminQuestCreatePage from './pages/quest/AdminQuestCreatePage'
import AdminQuestSettingsPage from './pages/quest/AdminQuestSettingsPage'
import AdminProblemCreatePage from './pages/problem/AdminProblemCreatePage'
import AdminProblemEditPage from './pages/problem/AdminProblemEditPage'
import AdminVideoCreatePage from './pages/video/AdminVideoCreatePage'
import AdminVideoEditPage from './pages/video/AdminVideoEditPage'
import AdminVideosPage from './pages/video/AdminVideosPage'

// Main pages
import HomePage from './pages/home/HomePage'
import VideoPlayerPage from './pages/video/VideoPlayerPage'
import QuestMapPage from './pages/quest/QuestMapPage'
import QuestDetailPage from './pages/quest/QuestDetailPage'
import QuestMapEditorPage from './pages/quest/QuestMapEditorPage'
import ProblemPage from './pages/problem/ProblemPage'
import ProfilePage from './pages/profile/ProfilePage'
import SubscriptionPage from './pages/subscription/SubscriptionPage'
import ProgressPage from './pages/progress/ProgressPage'
import MistakesPage from './pages/progress/MistakesPage'

// Public pages
import LandingPage from './pages/landing/LandingPage'
import TermsPage from './pages/legal/TermsPage'
import PrivacyPage from './pages/legal/PrivacyPage'
import RefundPage from './pages/legal/RefundPage'

// Layout
import MainLayout from './components/layout/MainLayout'
import PublicLayout from './components/layout/PublicLayout'
import StaffRoute from './components/layout/StaffRoute'

// Protected route wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()
  if (isAuthenticated) return children
  // remember where the visitor wanted to go, LoginPage sends them back there
  return (
    <Navigate
      to="/login"
      replace
      state={{ from: location.pathname + location.search }}
    />
  )
}

// Public only route (redirect if logged in)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return !isAuthenticated ? children : <Navigate to="/home" replace />
}

// "/" shows the landing page to visitors and the app to logged-in users
const RootRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <Navigate to="/home" replace /> : <LandingPage />
}

export default function App() {
  return (
    <Routes>
      {/* Public pages with header and footer, open to everyone */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<RootRoute />} />
        <Route path="/subscribe" element={<SubscriptionPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/refund" element={<RefundPage />} />
      </Route>

      {/* Public routes */}
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

        <Route path="/problems/:id" element={<ProblemPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/progress/mistakes" element={<MistakesPage />} />

        <Route path="/profile" element={<ProfilePage />} />

        {/* Staff only: ADMIN or TEACHER */}
        <Route element={<StaffRoute />}>
          <Route path="/admin/problems/new" element={<AdminProblemCreatePage />} />
          <Route path="/admin/problems/:id/edit" element={<AdminProblemEditPage />} />

          <Route path="/quests/:id/edit" element={<QuestMapEditorPage />} />
          <Route path="/admin/quests" element={<AdminQuestsPage />} />
          <Route path="/admin/quests/new" element={<AdminQuestCreatePage />} />
          <Route path="/admin/quests/:id/settings" element={<AdminQuestSettingsPage />} />

          <Route path="/admin/videos" element={<AdminVideosPage />} />
          <Route path="/admin/videos/new" element={<AdminVideoCreatePage />} />
          <Route path="/admin/videos/:id/edit" element={<AdminVideoEditPage />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}