import { Routes, Route, Navigate } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Dashboard from '../components/admin/Dashboard'
import PostJob from '../components/admin/PostJob'
import JobHistory from '../components/admin/JobHistory'
import RentalProduct from '../components/admin/RentalProduct'
import RentalHistory from '../components/admin/RentalHistory'
import AvailableDevices from '../components/admin/AvailableDevices'
import AdminSettings from '../components/admin/AdminSettings'

const AdminDashboard = ({ user, onLogout, authToken }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-background-light">
      <Sidebar user={user} userRole="admin" onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/post-job" element={<PostJob />} />
          <Route path="/admin/job-history" element={<JobHistory />} />
          <Route path="/admin/rental-product" element={<RentalProduct />} />
          <Route path="/admin/rental-history" element={<RentalHistory />} />
          <Route path="/admin/available-devices" element={<AvailableDevices />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  )
}

export default AdminDashboard



