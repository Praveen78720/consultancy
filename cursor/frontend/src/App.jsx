import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import { API_BASE_URL } from './config'

function App() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [authToken, setAuthToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user')
    const storedRole = localStorage.getItem('userRole')
    const storedToken = localStorage.getItem('authToken')

    if (storedUser && storedRole && storedToken) {
      setUser(storedUser)
      setUserRole(storedRole)
      setAuthToken(storedToken)
    }
    setLoading(false)
  }, [])

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Login failed:', errorData)
        return false
      }

      const data = await response.json()
      const { token, user: userData } = data

      setUser(userData.email)
      setUserRole(userData.role)
      setAuthToken(token)

      localStorage.setItem('user', userData.email)
      localStorage.setItem('userRole', userData.role)
      localStorage.setItem('authToken', token)

      return true
    } catch (error) {
      console.error('Error during login:', error)
      return false
    }
  }

  const handleLogout = () => {
    setUser(null)
    setUserRole(null)
    setAuthToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('authToken')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />
          ) : (
            <Login onLogin={handleLogin} />
          )
        }
      />
      <Route
        path="/admin/*"
        element={
          user && userRole === 'admin' ? (
            <AdminDashboard user={user} onLogout={handleLogout} authToken={authToken} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/employee/*"
        element={
          user && userRole === 'employee' ? (
            <EmployeeDashboard user={user} onLogout={handleLogout} authToken={authToken} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App



