import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, endpoints } from '../../services/api'

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCard, setSelectedCard] = useState(null)
  const [detailsData, setDetailsData] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleteSuccess, setDeleteSuccess] = useState('')

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.get(endpoints.dashboard.stats)
      setStats(data)
    } catch (err) {
      setError(err.message || 'An error occurred while loading dashboard data')
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
          data = await api.get(endpoints.jobs.list)
          break
        case 'rentals':
          data = await api.get(endpoints.rentals.list)
          break
        case 'devices':
          data = await api.get(endpoints.devices.list)
          break
        case 'users':
          data = await api.get(endpoints.users.list)
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

  const handleDeleteUser = (user) => {
    setUserToDelete(user)
  }

  const confirmDeleteUser = async () => {
    if (!userToDelete) return

    try {
      setDeletingUserId(userToDelete.id)
      setDeleteSuccess('')

      await api.post(endpoints.users.delete(userToDelete.id), {})

      setDeleteSuccess(`User ${userToDelete.username} has been deactivated successfully`)

      setDetailsData((prevData) =>
        prevData.map((user) =>
          user.id === userToDelete.id ? { ...user, is_active: false } : user
        )
      )

      setTimeout(() => {
        setDeleteSuccess('')
      }, 3000)
    } catch (err) {
      console.error('Error deleting user:', err)
      setError(err.message || 'Failed to delete user. Please try again.')
    } finally {
      setDeletingUserId(null)
      setUserToDelete(null)
    }
  }

  const cancelDeleteUser = () => {
    setUserToDelete(null)
  }

  const handleRetry = () => {
    fetchDashboardStats()
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

                {selectedCard === 'users' &&
                  detailsData.map((user) => (
                    <div
                      key={user.id}
                      className="p-4 bg-background-light rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-text-primary">
                            {user.username}
                          </h4>
                          <p className="text-sm text-text-secondary mt-1">{user.email}</p>
                          <p className="text-xs text-text-secondary mt-1">
                            Joined: {user.date_joined || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {user.role}
                          </span>
                          <p className={`text-xs mt-1 ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </p>
                          {user.is_active && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              disabled={deletingUserId === user.id}
                              className="mt-2 px-3 py-1 text-xs font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors flex items-center gap-1 ml-auto"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary">No data available</p>
              </div>
            )}
          </div>

          {deleteSuccess && (
            <div className="p-4 bg-green-50 border-t border-green-200">
              <div className="flex items-center gap-2 text-green-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{deleteSuccess}</span>
              </div>
            </div>
          )}

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
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-text-secondary">Loading dashboard data...</span>
            </div>
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
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={handleRetry}
                className="btn-primary px-6 py-2 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
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

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Confirm User Removal</h3>
                  <p className="text-sm text-text-secondary">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-text-primary mb-6">
                Are you sure you want to remove <strong>{userToDelete.username}</strong>? This will deactivate the user account and they will no longer be able to log in.
              </p>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDeleteUser}
                  disabled={deletingUserId === userToDelete.id}
                  className="btn-secondary px-4 py-2"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  disabled={deletingUserId === userToDelete.id}
                  className="btn-primary px-4 py-2 bg-red-600 hover:bg-red-700 flex items-center gap-2"
                >
                  {deletingUserId === userToDelete.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Removing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Remove User</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
