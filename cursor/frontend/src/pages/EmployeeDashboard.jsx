import { Routes, Route, Navigate } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import AvailableJobs from '../components/employee/AvailableJobs'
import OngoingJob from '../components/employee/OngoingJob'
import RecentlyCompleted from '../components/employee/RecentlyCompleted'
import SubmitReport from '../components/employee/SubmitReport'

const EmployeeDashboard = ({ user, onLogout, authToken }) => {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-background-light">
      <Sidebar user={user} userRole="employee" onLogout={handleLogout} />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/employee" element={<Navigate to="/employee/available-jobs" replace />} />
          <Route path="/employee/dashboard" element={<Navigate to="/employee/available-jobs" replace />} />
          <Route path="/employee/available-jobs" element={<AvailableJobs />} />
          <Route path="/employee/ongoing-job" element={<OngoingJob />} />
          <Route path="/employee/recently-completed" element={<RecentlyCompleted />} />
          <Route path="/employee/submit-report" element={<SubmitReport />} />
        </Routes>
      </main>
    </div>
  )
}

export default EmployeeDashboard



