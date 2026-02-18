import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'

// Protected Route component - redirects to login if not authenticated
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // User is authenticated but doesn't have the required role
    return <Navigate to={userRole === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />
  }

  return <Outlet />
}

// Public Route - redirects to dashboard if already logged in
const PublicRoute = () => {
  const { isAuthenticated, userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    )
  }

  if (isAuthenticated) {
    const redirectPath = userRole === 'admin' ? '/admin/dashboard' : '/employee/dashboard'
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Route>

      {/* Protected Employee Routes */}
      <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
        <Route path="/employee/*" element={<EmployeeDashboard />} />
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
