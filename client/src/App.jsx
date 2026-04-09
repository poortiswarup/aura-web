import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout    from './components/Layout'
import Landing   from './pages/Landing'
import Features  from './pages/Features'
import About     from './pages/About'
import Pricing   from './pages/Pricing'
import Login     from './pages/Login'
import Dashboard from './pages/Dashboard'
import NewsFeed  from './pages/NewsFeed'
import Companies from './pages/Companies'
import Sentiment from './pages/Sentiment'
import Market    from './pages/Market'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div className="spinner spinner-lg" />
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return null
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/"         element={<Landing  />} />
      <Route path="/features" element={<Features />} />
      <Route path="/about"    element={<About    />} />
      <Route path="/pricing"  element={<Pricing  />} />
      <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <Login />} />

      {/* Protected dashboard */}
      <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      <Route path="/news"      element={<RequireAuth><NewsFeed  /></RequireAuth>} />
      <Route path="/companies" element={<RequireAuth><Companies /></RequireAuth>} />
      <Route path="/sentiment" element={<RequireAuth><Sentiment /></RequireAuth>} />
      <Route path="/market"    element={<RequireAuth><Market    /></RequireAuth>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
