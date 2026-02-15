import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config'

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCard, setSelectedCard] = useState(null)
  const [detailsData, setDetailsData] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/stats/`)
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      } else {
        setError('Failed to load dashboard statistics')
      }
    } catch (err) {
      setError('An error occurred while loading dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchDetails = async (type) => {
    setLoadingDetails(true)
    setDetailsData(null)
    try {
      let data = []
      switch (type) {
        case 'jobs':
          const jobsRes = await fetch(`${API_BASE_URL}/api/jobs/`)
          if (jobsRes.ok) data = await jobsRes.json()
          break
        case 'rentals':
          const rentalsRes = await fetch(`${API_BASE_URL}/api/rentals/`)
          if (rentalsRes.ok) data = await rentalsRes.json()
          break
        case 'devices':
          const devicesRes = await fetch(`${API_BASE_URL}/api/devices/`)
          if (devicesRes.ok) data = await devicesRes.json()
          break
        case 'users':
          // Users data comes from stats, no detailed endpoint yet
          data = []
          break
        default:
          break
      }
      setDetailsData(data)
    } catch (err) {
      console.error('Error fetching details:', err)
    } finally {
      setLoadingDetails(false)
    }
  }

  const handleCardClick = (cardType) => {
    setSelectedCard(cardType)
    fetchDetails(cardType)
  }

  const closeModal = () => {
    setSelectedCard(null)
    setDetailsData(null)
  }

  const StatCard = ({ title, value, subtitle, icon, color, onClick, clickable = true }) => (
    <div
      onClick={onClick}
      className={`card hover:shadow-lg transition-all ${
        clickable ? 'cursor-pointer hover:scale-[1.02]' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-text-secondary text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-bold text-text-primary mt-2">{value}</h3>
          {subtitle && <p className="text-sm text-text-secondary mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
          </svg>
        </div>
      </div>
      {clickable && (
        <div className="mt-4 pt-3 border-t border-border-light">
          <p className="text-xs text-primary font-medium flex items-center gap-1">
            Click for details
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </p>
        </div>
      )}
    </div>
  )

  // Modal to show details
  const DetailsModal = () => {
    if (!selectedCard) return null

    const getModalTitle = () => {
      switch (selectedCard) {
        case 'jobs':
          return 'All Jobs'
        case 'rentals':
          return 'All Rentals'
        case 'devices':
          return 'All Devices'
        case 'users':
          return 'Users Overview'
        default:
          return 'Details'
      }
    }

    const getModalColor = () => {
      switch (selectedCard) {
        case 'jobs':
          return 'bg-blue-500'
        case 'rentals':
          return 'bg-green-500'
        case 'devices':
          return 'bg-purple-500'
        case 'users':
          return 'bg-orange-500'
        default:
          return 'bg-gray-500'
      }
    }

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
          <div className={`${getModalColor()} p-6 text-white flex justify-between items-center`}>
            <h2 className="text-2xl font-bold">{getModalTitle()}</h2>
            <button
              onClick={closeModal}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {loadingDetails ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-text-secondary">Loading details...</span>
              </div>
            ) : detailsData && detailsData.length > 0 ? (
              <div className="space-y-3">
                {selectedCard === 'jobs' &&
                  detailsData.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 bg-background-light rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/job-history`)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-text-primary">
                            Job #{job.id} - {job.customer_name}
                          </h4>
                          <p className="text-sm text-text-secondary mt-1">{job.issue}</p>
                          <p className="text-xs text-text-secondary mt-1">
                            Location: {job.location} | Date: {job.work_date}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            job.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : job.status === 'in_progress'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                    </div>
                  ))}

                {selectedCard === 'rentals' &&
                  detailsData.map((rental) => (
                    <div
                      key={rental.id}
                      className="p-4 bg-background-light rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-text-primary">
                            Rental #{rental.id} - {rental.customer_name}
                          </h4>
                          <p className="text-sm text-text-secondary mt-1">
                            Device: {rental.device_serial}
                          </p>
                          <p className="text-xs text-text-secondary mt-1">
                            {rental.from_date} → {rental.to_date} ({rental.rental_days} days)
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-text-primary">
                            ₹{Number(rental.security_deposit).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-text-secondary">deposit</p>
                        </div>
                      </div>
                    </div>
                  ))}

                {selectedCard === 'devices' &&
                  detailsData.map((device) => (
                    <div
                      key={device.id}
                      className="p-4 bg-background-light rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-text-primary">{device.model}</h4>
                          <p className="text-sm text-text-secondary">S/N: {device.serial_no}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            device.availability === 'available'
                              ? 'bg-green-100 text-green-800'
                              : device.availability === 'rented'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {device.availability}
                        </span>
                      </div>
                    </div>
                  ))}

                {selectedCard === 'users' && (
                  <div className="text-center py-8">
                    <p className="text-text-secondary mb-4">User management is available in Admin Settings</p>
                    <button
                      onClick={() => {
                        closeModal()
                        navigate('/admin/settings')
                      }}
                      className="btn-primary px-6 py-2"
                    >
                      Go to Settings
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary">No data available</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border-light bg-gray-50 flex justify-end">
            <button onClick={closeModal} className="btn-secondary px-6 py-2">
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-8">Admin Dashboard</h1>
          <div className="card">
            <p className="text-text-secondary">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-8">Admin Dashboard</h1>
          <div className="card border border-red-300 bg-red-50">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Admin Dashboard</h1>
          <p className="text-text-secondary">Overview of your service and rental operations</p>
        </div>

        {/* Quick Stats Grid - Clickable Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Jobs"
            value={stats?.jobs?.total || 0}
            subtitle={`${stats?.jobs?.open || 0} open, ${stats?.jobs?.in_progress || 0} in progress`}
            icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            color="bg-blue-500"
            onClick={() => handleCardClick('jobs')}
          />
          <StatCard
            title="Total Rentals"
            value={stats?.rentals?.total || 0}
            subtitle={`${stats?.rentals?.active || 0} active, ${stats?.rentals?.completed || 0} completed`}
            icon="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            color="bg-green-500"
            onClick={() => handleCardClick('rentals')}
          />
          <StatCard
            title="Available Devices"
            value={stats?.devices?.available || 0}
            subtitle={`${stats?.devices?.rented || 0} currently rented`}
            icon="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
            color="bg-purple-500"
            onClick={() => handleCardClick('devices')}
          />
          <StatCard
            title="Total Users"
            value={stats?.users?.total || 0}
            subtitle={`${stats?.users?.admins || 0} admins, ${stats?.users?.employees || 0} employees`}
            icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            color="bg-orange-500"
            onClick={() => handleCardClick('users')}
          />
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Jobs Breakdown */}
          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Job Status Breakdown</h2>
            <div className="space-y-4">
              <div
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => navigate('/admin/job-history')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-status-open"></div>
                  <span className="text-text-primary">Open Jobs</span>
                </div>
                <span className="font-semibold text-text-primary">{stats?.jobs?.open || 0}</span>
              </div>
              <div
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors"
                onClick={() => navigate('/admin/job-history')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-priority-medium"></div>
                  <span className="text-text-primary">In Progress</span>
                </div>
                <span className="font-semibold text-text-primary">{stats?.jobs?.in_progress || 0}</span>
              </div>
              <div
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => navigate('/admin/job-history')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-status-completed"></div>
                  <span className="text-text-primary">Completed</span>
                </div>
                <span className="font-semibold text-text-primary">{stats?.jobs?.completed || 0}</span>
              </div>
            </div>
          </div>

          {/* Rentals Breakdown */}
          <div className="card">
            <h2 className="text-xl font-semibold text-text-primary mb-6">Rental Status Breakdown</h2>
            <div className="space-y-4">
              <div
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                onClick={() => navigate('/admin/rental-history')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-text-primary">Active Rentals</span>
                </div>
                <span className="font-semibold text-text-primary">{stats?.rentals?.active || 0}</span>
              </div>
              <div
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
                onClick={() => navigate('/admin/rental-history')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-text-primary">Completed Rentals</span>
                </div>
                <span className="font-semibold text-text-primary">{stats?.rentals?.completed || 0}</span>
              </div>
              <div
                className="flex items-center justify-between p-3 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
                onClick={() => navigate('/admin/available-devices')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                  <span className="text-text-primary">Available Devices</span>
                </div>
                <span className="font-semibold text-text-primary">{stats?.devices?.available || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      <DetailsModal />
    </div>
  )
}

export default Dashboard
