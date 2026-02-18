import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Sidebar from '../components/Sidebar'
import AvailableJobs from '../components/employee/AvailableJobs'
import OngoingJob from '../components/employee/OngoingJob'
import RecentlyCompleted from '../components/employee/RecentlyCompleted'
import SubmitReport from '../components/employee/SubmitReport'

const EmployeeDashboard = () => {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-background-light">
      <Sidebar user={user} userRole="employee" onLogout={logout} />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/employee/available-jobs" replace />} />
          <Route path="dashboard" element={<Navigate to="/employee/available-jobs" replace />} />
          <Route path="available-jobs" element={<AvailableJobs />} />
          <Route path="ongoing-job" element={<OngoingJob />} />
          <Route path="recently-completed" element={<RecentlyCompleted />} />
          <Route path="submit-report" element={<SubmitReport />} />
        </Routes>
      </main>
    </div>
  )
}

export default EmployeeDashboard
