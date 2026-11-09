import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useSocket } from './hooks/useSocket'
import { useAuth } from './hooks/useAuth'
import Auth from './pages/Auth'
import TripPlanner from './pages/TripPlanner'
import TripDetail from './pages/TripDetail'
import AcceptInvite from './pages/AcceptInvite'
import LanguageSwitcher from './components/LanguageSwitcher'
import './App.css'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('authToken')
  return token ? <>{children}</> : <Navigate to="/" />
}

function AppHeader() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isConnected, setIsConnected] = useState(false)
  const token = localStorage.getItem('authToken')
  const socket = useSocket(token)

  useEffect(() => {
    if (!socket) {
      setIsConnected(false)
      return
    }
    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)
    setIsConnected(socket.connected)
    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('connect_error', onDisconnect)
    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('connect_error', onDisconnect)
    }
  }, [socket])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header>
      <div className="header-content">
        <h1>{t('app.title')}</h1>
        <div className="header-actions">
          {token && (
            <>
              <span
                className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}
                role="status"
                title={isConnected ? t('app.connected') : t('app.disconnected')}
                aria-label={isConnected ? t('app.connected') : t('app.disconnected')}
              />
              <button onClick={handleLogout} className="logout-button">
                {t('app.logout')}
              </button>
            </>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <Router>
      <div className="app">
        <AppHeader />
        <main>
          <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/accept-invite/:token" element={<AcceptInvite />} />
            <Route
              path="/trips"
              element={
                <ProtectedRoute>
                  <TripPlanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trips/:groupId"
              element={
                <ProtectedRoute>
                  <TripDetail />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
