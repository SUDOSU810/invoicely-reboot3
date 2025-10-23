import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/theme-provider'
import { AuthProvider } from '@/lib/hooks/useAuth'
import { Toaster } from 'sonner'
import Layout from './components/Layout'
import AuthGuard from './components/AuthGuard'

// Pages
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import SignInPage from './pages/SignInPage'
import CreateAccountPage from './pages/CreateAccountPage'
import OTPVerifyPage from './pages/OTPVerifyPage'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="invoice-app-theme">
      <AuthProvider>
        <Routes>
          {/* Public pages without layout */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth pages - redirect if already authenticated */}
          <Route path="/sign-in" element={
            <AuthGuard requireAuth={false} redirectTo="/home">
              <SignInPage />
            </AuthGuard>
          } />
          <Route path="/create-account" element={
            <AuthGuard requireAuth={false} redirectTo="/home">
              <CreateAccountPage />
            </AuthGuard>
          } />
          <Route path="/verify-otp" element={
            <AuthGuard requireAuth={false} redirectTo="/home">
              <OTPVerifyPage />
            </AuthGuard>
          } />
          
          {/* Protected app pages - require authentication */}
          <Route path="/home" element={
            <AuthGuard requireAuth={true}>
              <Layout><HomePage /></Layout>
            </AuthGuard>
          } />
          <Route path="/history" element={
            <AuthGuard requireAuth={true}>
              <Layout><HistoryPage /></Layout>
            </AuthGuard>
          } />
          <Route path="/settings" element={
            <AuthGuard requireAuth={true}>
              <Layout><SettingsPage /></Layout>
            </AuthGuard>
          } />
        </Routes>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
