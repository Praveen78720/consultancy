import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, endpoints } from '../../services/api'
import { useToast } from '../Toast'
import Breadcrumbs from '../Breadcrumbs'
import DataTable from '../DataTable'
import LoadingSkeleton from '../LoadingSkeleton'
import AnimatedList from '../AnimatedList'

const Dashboard = () => {
  const navigate = useNavigate()
  const { success: showSuccessToast, error: showErrorToast } = useToast()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCard, setSelectedCard] = useState(null)
  const [detailsData, setDetailsData] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState(null)
  const [userToDelete, setUserToDelete] = useState(null)

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

      await api.post(endpoints.users.delete(userToDelete.id), {})

      showSuccessToast(`User ${userToDelete.username} has been deactivated successfully`)

      // Remove user from the list
      setDetailsData((prevData) =>
        prevData.filter((user) => user.id !== userToDelete.id)
      )
    } catch (err) {
      console.error('Error deleting user:', err)
      showErrorToast(err.message || 'Failed to delete user. Please try again.')
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

  const StatCard = ({ title, value, subtitle, icon, color, onClick, clickable = true }) => {
    const gradientColors = {
      'bg-blue-500': 'from-blue-500 to-blue-600',
      'bg-green-500': 'from-green-500 to-green-600',
      'bg-purple-500': 'from-purple-500 to-purple-600',
      'bg-orange-500': 'from-orange-500 to-orange-600',
    }
    
    const gradient = gradientColors[color] || 'from-primary to-primary-light'
    
    return (
      <div
        onClick={onClick}
        className={`card card-interactive overflow-hidden ${
          clickable ? 'cursor-pointer group' : ''
        }`}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-text-secondary text-sm font-semibold uppercase tracking-wide">{title}</p>
              <h3 className="text-4xl font-bold text-text-primary mt-2 bg-gradient-to-r from-text-primary to-text-secondary bg-clip-text">{value}</h3>
              {subtitle && <p className="text-sm text-text-secondary/80 mt-2 font-medium">{subtitle}</p>}
            </div>
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg shadow-${color.split('-')[1]}-500/30 group-hover:scale-110 transition-transform duration-300`}>
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
              </svg>
            </div>
          </div>
          {clickable && (
            <div className="mt-5 pt-4 border-t border-border-light/50">
              <p className="text-xs text-primary font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                Click for details
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

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
                  <DataTable
                    data={detailsData}
                    columns={[
                      {
                        key: 'username',
                        title: 'Username',
                        searchable: true,
                      },
                      {
                        key: 'email',
                        title: 'Email',
                        searchable: true,
                      },
                      {
                        key: 'role',
                        title: 'Role',
                        render: (value) => (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              value === 'admin'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {value}
                          </span>
                        ),
                      },
                      {
                        key: 'date_joined',
                        title: 'Joined',
                        render: (value) => value || 'N/A',
                      },
                    ]}
                    rowActions={[
                      {
                        label: 'Remove User',
                        icon: (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        ),
                        onClick: (user) => handleDeleteUser(user),
                        disabled: (user) => deletingUserId === user.id,
                        className: 'text-red-600 hover:text-red-800 hover:bg-red-50',
                      },
                    ]}
                    keyField="id"
                    searchable={true}
                    searchPlaceholder="Search users..."
                    pagination={true}
                    itemsPerPage={10}
                  />
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
      <div className="p-6 md:p-8 lg:p-10 page-transition">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton type="page-header" className="mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <LoadingSkeleton type="stat-card" count={4} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <LoadingSkeleton type="card" count={2} />
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
    <div className="p-6 md:p-8 lg:p-10 page-transition">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Admin Dashboard</h1>
          <p className="text-text-secondary">Overview of your service and rental operations</p>
        </div>

        {/* Quick Stats Grid - Clickable Cards */}
        <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" staggerDelay={0.1}>
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
        </AnimatedList>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Jobs Breakdown */}
          <div className="card card-gradient">
            <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              Job Status Breakdown
            </h2>
            <AnimatedList className="space-y-3" staggerDelay={0.05}>
              <div
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl cursor-pointer hover:from-blue-100 hover:to-blue-200/50 transition-all hover:shadow-md group"
                onClick={() => navigate('/admin/job-history')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-sm">{stats?.jobs?.open || 0}</span>
                  </div>
                  <span className="text-text-primary font-medium">Open Jobs</span>
                </div>
                <svg className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div
                className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100/50 rounded-xl cursor-pointer hover:from-yellow-100 hover:to-yellow-200/50 transition-all hover:shadow-md group"
                onClick={() => navigate('/admin/job-history')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-sm">{stats?.jobs?.in_progress || 0}</span>
                  </div>
                  <span className="text-text-primary font-medium">In Progress</span>
                </div>
                <svg className="w-5 h-5 text-yellow-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div
                className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl cursor-pointer hover:from-green-100 hover:to-green-200/50 transition-all hover:shadow-md group"
                onClick={() => navigate('/admin/job-history')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-sm">{stats?.jobs?.completed || 0}</span>
                  </div>
                  <span className="text-text-primary font-medium">Completed</span>
                </div>
                <svg className="w-5 h-5 text-green-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </AnimatedList>
          </div>

          {/* Rentals Breakdown */}
          <div className="card card-gradient">
            <h2 className="text-xl font-semibold text-text-primary mb-6 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Rental Status Breakdown
            </h2>
            <AnimatedList className="space-y-3" staggerDelay={0.05}>
              <div
                className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl cursor-pointer hover:from-green-100 hover:to-green-200/50 transition-all hover:shadow-md group"
                onClick={() => navigate('/admin/rental-history')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-sm">{stats?.rentals?.active || 0}</span>
                  </div>
                  <span className="text-text-primary font-medium">Active Rentals</span>
                </div>
                <svg className="w-5 h-5 text-green-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div
                className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl cursor-pointer hover:from-blue-100 hover:to-blue-200/50 transition-all hover:shadow-md group"
                onClick={() => navigate('/admin/rental-history')}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                    <span className="text-white font-bold text-sm">{stats?.rentals?.completed || 0}</span>
                  </div>
                  <span className="text-text-primary font-medium">Completed Rentals</span>
                </div>
                <svg className="w-5 h-5 text-blue-500 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </AnimatedList>
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
