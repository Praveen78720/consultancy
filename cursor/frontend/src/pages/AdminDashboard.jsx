import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-background-light">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar user={user} userRole="admin" onLogout={logout} onClose={closeSidebar} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-border-light sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={toggleSidebar}
              className="p-2 -ml-2 rounded-lg hover:bg-background-light active:bg-gray-200 transition-colors touch-target"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="font-bold text-text-primary text-sm">Best In Solutions</span>
            </div>
            <div className="w-10"></div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="post-job" element={<PostJob />} />
            
            {/* Jobs Routes */}
            <Route path="jobs/ongoing" element={<OngoingJobs />} />
            <Route path="jobs/open" element={<OpenJobs />} />
            <Route path="jobs/completed" element={<CompletedJobs />} />
            <Route path="job-history" element={<Navigate to="/admin/jobs/open" replace />} />
            
            {/* Rentals Routes */}
            <Route path="rental-product" element={<RentalProduct />} />
            <Route path="rentals/ongoing" element={<OngoingRentals />} />
            <Route path="rentals/completed" element={<RentalHistory />} />
            <Route path="ongoing-rentals" element={<Navigate to="/admin/rentals/ongoing" replace />} />
            <Route path="rental-history" element={<Navigate to="/admin/rentals/completed" replace />} />
            
            <Route path="available-devices" element={<AvailableDevices />} />
            <Route path="add-device" element={<AddDevice />} />
            <Route path="settings" element={<AdminSettings />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
