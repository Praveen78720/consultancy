import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../config'

const RentalHistory = () => {
  const [rentals, setRentals] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRentalsAndDevices()
  }, [])

  const fetchRentalsAndDevices = async () => {
    try {
      // Fetch rentals and devices in parallel
      const [rentalsResponse, devicesResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/rentals/`),
        fetch(`${API_BASE_URL}/api/devices/`),
      ])

      if (!rentalsResponse.ok || !devicesResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const rentalsData = await rentalsResponse.json()
      const devicesData = await devicesResponse.json()

      // Create a map of device serial to device info
      const deviceMap = {}
      devicesData.forEach((device) => {
        deviceMap[device.serial_no] = device
      })

      // Enrich rental data with device info
      const enrichedRentals = rentalsData.map((rental) => {
        const device = deviceMap[rental.device_serial] || {}
        const today = new Date()
        const toDate = new Date(rental.to_date)
        const fromDate = new Date(rental.from_date)

        // Determine status based on dates
        let status
        if (toDate < today) {
          status = 'completed'
        } else if (fromDate <= today && toDate >= today) {
          status = 'active'
        } else {
          status = 'upcoming'
        }

        return {
          id: rental.id,
          customerName: rental.customer_name,
          phoneNumber: rental.phone_number,
          deviceSerial: rental.device_serial,
          deviceModel: device.model || 'Unknown Device',
          fromDate: rental.from_date,
          toDate: rental.to_date,
          rentalDays: rental.rental_days,
          securityDeposit: rental.security_deposit,
          status: status,
          idProof: rental.id_proof,
          createdAt: rental.created_at,
        }
      })

      setRentals(enrichedRentals)
      setDevices(devicesData)
    } catch (err) {
      console.error('Error fetching rentals:', err)
      setError('Failed to load rental history. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0'
    return '₹' + Number(amount).toLocaleString('en-IN')
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-green-500">
            Active
          </span>
        )
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-blue-500">
            Completed
          </span>
        )
      case 'upcoming':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-yellow-500">
            Upcoming
          </span>
        )
      default:
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-gray-500">
            Unknown
          </span>
        )
    }
  }

  const activeRentals = rentals.filter((r) => r.status === 'active' || r.status === 'upcoming')
  const completedRentals = rentals.filter((r) => r.status === 'completed')

  const RentalCard = ({ rental }) => (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-text-primary text-lg">Rental #{rental.id}</h3>
            <p className="text-sm text-text-secondary">{rental.customerName}</p>
          </div>
          {getStatusBadge(rental.status)}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-wide">Product</p>
            <p className="font-medium text-text-primary">{rental.deviceModel}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-wide">Serial No</p>
            <p className="font-medium text-text-primary">{rental.deviceSerial}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-wide">Phone</p>
            <p className="font-medium text-text-primary">{rental.phoneNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-wide">Rental Days</p>
            <p className="font-medium text-text-primary">{rental.rentalDays} days</p>
          </div>
        </div>

        <div className="border-t border-border-light pt-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-wide">Rental Period</p>
              <p className="text-text-primary">
                {formatDate(rental.fromDate)} <span className="text-text-secondary">→</span>{' '}
                {formatDate(rental.toDate)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-text-secondary text-xs uppercase tracking-wide">Security Deposit</p>
              <p className="font-semibold text-text-primary text-lg">
                {formatCurrency(rental.securityDeposit)}
              </p>
            </div>
          </div>
        </div>

        {rental.idProof && (
          <div className="border-t border-border-light pt-3">
            <p className="text-text-secondary text-xs uppercase tracking-wide mb-2">ID Proof</p>
            <a
              href={`${API_BASE_URL}${rental.idProof}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-dark text-sm font-medium inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View ID Proof
            </a>
          </div>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Rental History</h1>
          <p className="text-text-secondary mb-8">Loading rental data...</p>
          <div className="card">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Rental History</h1>
          <div className="card border border-red-300 bg-red-50">
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchRentalsAndDevices}
              className="mt-4 text-primary hover:text-primary-dark font-medium"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Rental History</h1>
            <p className="text-text-secondary">View and manage all product rentals</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-text-primary">{activeRentals.length}</p>
              <p className="text-sm text-text-secondary">Active/Upcoming</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-text-primary">{completedRentals.length}</p>
              <p className="text-sm text-text-secondary">Completed</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-text-primary">{rentals.length}</p>
              <p className="text-sm text-text-secondary">Total</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Active/Upcoming Rentals */}
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              Active & Upcoming Rentals
              <span className="text-sm font-normal text-text-secondary">({activeRentals.length})</span>
            </h2>
            <div className="space-y-4">
              {activeRentals.length > 0 ? (
                activeRentals.map((rental) => <RentalCard key={rental.id} rental={rental} />)
              ) : (
                <div className="card text-center py-8">
                  <p className="text-text-secondary">No active or upcoming rentals.</p>
                </div>
              )}
            </div>
          </div>

          {/* Completed Rentals */}
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              Completed Rentals
              <span className="text-sm font-normal text-text-secondary">({completedRentals.length})</span>
            </h2>
            <div className="space-y-4">
              {completedRentals.length > 0 ? (
                completedRentals.map((rental) => <RentalCard key={rental.id} rental={rental} />)
              ) : (
                <div className="card text-center py-8">
                  <p className="text-text-secondary">No completed rentals yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {rentals.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-blue-50 border-blue-200">
              <p className="text-blue-600 text-sm font-medium">Total Security Deposits</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(rentals.reduce((sum, r) => sum + Number(r.securityDeposit || 0), 0))}
              </p>
            </div>
            <div className="card bg-green-50 border-green-200">
              <p className="text-green-600 text-sm font-medium">Active Deposits Held</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(
                  activeRentals.reduce((sum, r) => sum + Number(r.securityDeposit || 0), 0)
                )}
              </p>
            </div>
            <div className="card bg-purple-50 border-purple-200">
              <p className="text-purple-600 text-sm font-medium">Total Rentals</p>
              <p className="text-2xl font-bold text-purple-900">{rentals.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default RentalHistory
