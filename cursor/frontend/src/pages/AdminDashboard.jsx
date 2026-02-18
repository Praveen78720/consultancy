import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import Dashboard from '../components/admin/Dashboard'
import PostJob from '../components/admin/PostJob'
import JobHistory from '../components/admin/JobHistory'
import RentalProduct from '../components/admin/RentalProduct'
import OngoingRentals from '../components/admin/OngoingRentals'
import RentalHistory from '../components/admin/RentalHistory'
import AvailableDevices from '../components/admin/AvailableDevices'
import AddDevice from '../components/admin/AddDevice'
import AdminSettings from '../components/admin/AdminSettings'

const AdminDashboard = () => {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-background-light">
      <Sidebar user={user} userRole="admin" onLogout={logout} />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="post-job" element={<PostJob />} />
          <Route path="job-history" element={<JobHistory />} />
          <Route path="rental-product" element={<RentalProduct />} />
          <Route path="ongoing-rentals" element={<OngoingRentals />} />
          <Route path="rental-history" element={<RentalHistory />} />
          <Route path="available-devices" element={<AvailableDevices />} />
          <Route path="add-device" element={<AddDevice />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  )
}

export default AdminDashboard
