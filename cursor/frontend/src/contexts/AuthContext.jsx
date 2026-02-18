import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [authToken, setAuthToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Initialize auth state from localStorage on mount
  useEffect(() => {
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

  const login = useCallback(async (email, password) => {
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
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await response.json()
      const { token, user: userData } = data

      setUser(userData.email)
      setUserRole(userData.role)
      setAuthToken(token)

      localStorage.setItem('user', userData.email)
      localStorage.setItem('userRole', userData.role)
      localStorage.setItem('authToken', token)

      return { success: true, role: userData.role }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setUserRole(null)
    setAuthToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('authToken')
    navigate('/login', { replace: true })
  }, [navigate])

  const isAuthenticated = !!authToken
  const isAdmin = userRole === 'admin'
  const isEmployee = userRole === 'employee'

  const value = {
    user,
    userRole,
    authToken,
    loading,
    isAuthenticated,
    isAdmin,
    isEmployee,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
