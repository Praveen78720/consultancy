import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import Dashboard from '../components/admin/Dashboard'
import PostJob from '../components/admin/PostJob'
import JobHistory from '../components/admin/JobHistory'
import OngoingJobs from '../components/admin/OngoingJobs'
import OpenJobs from '../components/admin/OpenJobs'
import CompletedJobs from '../components/admin/CompletedJobs'
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
          
          {/* Jobs Routes */}
          <Route path="jobs/ongoing" element={<OngoingJobs />} />
          <Route path="jobs/open" element={<OpenJobs />} />
          <Route path="jobs/completed" element={<CompletedJobs />} />
          {/* Legacy route - redirect to open jobs */}
          <Route path="job-history" element={<Navigate to="/admin/jobs/open" replace />} />
          
          {/* Rentals Routes */}
          <Route path="rental-product" element={<RentalProduct />} />
          <Route path="rentals/ongoing" element={<OngoingRentals />} />
          <Route path="rentals/completed" element={<RentalHistory />} />
          {/* Legacy route - redirect to completed rentals */}
          <Route path="ongoing-rentals" element={<Navigate to="/admin/rentals/ongoing" replace />} />
          <Route path="rental-history" element={<Navigate to="/admin/rentals/completed" replace />} />
          
          <Route path="available-devices" element={<AvailableDevices />} />
          <Route path="add-device" element={<AddDevice />} />
          <Route path="settings" element={<AdminSettings />} />
        </Routes>
      </main>
    </div>
  )
}

export default AdminDashboard
