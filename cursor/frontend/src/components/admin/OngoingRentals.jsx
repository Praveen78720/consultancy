import { useState, useEffect } from 'react'
import { api, endpoints } from '../../services/api'

const OngoingRentals = () => {
  const [rentals, setRentals] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [returningId, setReturningId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    fetchRentalsAndDevices()
  }, [])

  const fetchRentalsAndDevices = async () => {
    try {
      setLoading(true)
      setError('')

      const [rentalsData, devicesData] = await Promise.all([
        api.get(endpoints.rentals.list),
        api.get(endpoints.devices.list),
      ])

      const deviceMap = {}
      devicesData.forEach((device) => {
        deviceMap[device.serial_no] = device
      })

      const enrichedRentals = rentalsData.map((rental) => {
        const device = deviceMap[rental.device_serial] || {}
        const today = new Date()
        const toDate = new Date(rental.to_date)
        const fromDate = new Date(rental.from_date)

        let dateStatus
        if (toDate < today) {
          dateStatus = 'overdue'
        } else if (fromDate <= today && toDate >= today) {
          dateStatus = 'active'
        } else {
          dateStatus = 'upcoming'
        }

        return {
          id: rental.id,
          customerName: rental.customer_name,
          phoneNumber: rental.phone_number,
          deviceSerial: rental.device_serial,
          deviceModel: device.model || 'Unknown Device',
          deviceName: device.device_name || 'Unnamed Device',
          fromDate: rental.from_date,
          toDate: rental.to_date,
          rentalDays: rental.rental_days,
          securityDeposit: rental.security_deposit,
          status: rental.status,
          dateStatus: dateStatus,
          idProof: rental.id_proof,
          createdAt: rental.created_at,
        }
      })

      const ongoingRentals = enrichedRentals.filter(
        (rental) => rental.status === 'active'
      )

      setRentals(ongoingRentals)
      setDevices(devicesData)
    } catch (err) {
      console.error('Error fetching rentals:', err)
      setError(err.message || 'Failed to load ongoing rentals. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = async (rentalId) => {
    try {
      setReturningId(rentalId)
      setError('')
      setSuccessMessage('')

      const response = await api.post(
        endpoints.rentals.return(rentalId),
        {}
      )

      setSuccessMessage(
        `Device returned successfully! ${response.device_serial} is now available.`
      )

      setRentals((prevRentals) =>
        prevRentals.filter((rental) => rental.id !== rentalId)
      )

      setTimeout(() => {
        setSuccessMessage('')
      }, 3000)
    } catch (err) {
      console.error('Error returning rental:', err)
      setError(err.message || 'Failed to return rental. Please try again.')
    } finally {
      setReturningId(null)
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

  const getDateStatusBadge = (dateStatus) => {
    switch (dateStatus) {
      case 'active':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-green-500">
            Currently Active
          </span>
        )
      case 'overdue':
        return (
          <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-red-500">
            Overdue
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

  const RentalCard = ({ rental }) => (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-text-primary text-lg">
              Rental #{rental.id}
            </h3>
            <p className="text-sm text-text-secondary">{rental.customerName}</p>
          </div>
          {getDateStatusBadge(rental.dateStatus)}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-wide">
              Device
            </p>
            <p className="font-medium text-text-primary">{rental.deviceName}</p>
            <p className="text-xs text-text-secondary">{rental.deviceModel}</p>
          </div>
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-wide">
              Serial No
            </p>
            <p className="font-medium text-text-primary">
              {rental.deviceSerial}
            </p>
          </div>
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-wide">
              Phone
            </p>
            <p className="font-medium text-text-primary">
              {rental.phoneNumber || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-wide">
              Rental Days
            </p>
            <p className="font-medium text-text-primary">
              {rental.rentalDays} days
            </p>
          </div>
        </div>

        <div className="border-t border-border-light pt-3">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-text-secondary text-xs uppercase tracking-wide">
                Rental Period
              </p>
              <p className="text-text-primary">
                {formatDate(rental.fromDate)}{' '}
                <span className="text-text-secondary">→</span>{' '}
                {formatDate(rental.toDate)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-text-secondary text-xs uppercase tracking-wide">
                Security Deposit
              </p>
              <p className="font-semibold text-text-primary text-lg">
                {formatCurrency(rental.securityDeposit)}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border-light pt-4">
          <button
            onClick={() => handleReturn(rental.id)}
            disabled={returningId === rental.id}
            className={`w-full btn-primary py-3 flex items-center justify-center gap-2 ${
              returningId === rental.id
                ? 'opacity-70 cursor-not-allowed'
                : ''
            }`}
          >
            {returningId === rental.id ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Mark as Returned</span>
              </>
            )}
          </button>
          <p className="text-xs text-text-secondary text-center mt-2">
            This will mark the device as returned and make it available again
          </p>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Ongoing Rentals
          </h1>
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            Ongoing Rentals
          </h1>
          <div className="card border border-red-300 bg-red-50">
            <div className="flex flex-col items-center justify-center py-8">
              <svg
                className="w-12 h-12 text-red-500 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={fetchRentalsAndDevices}
                className="btn-primary px-6 py-2 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Retry
              </button>
            </div>
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
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              Ongoing Rentals
            </h1>
            <p className="text-text-secondary">
              Manage active rentals and process returns
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold text-text-primary">
                {rentals.length}
              </p>
              <p className="text-sm text-text-secondary">Active Rentals</p>
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {rentals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentals.map((rental) => (
              <RentalCard key={rental.id} rental={rental} />
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              No Ongoing Rentals
            </h3>
            <p className="text-text-secondary mb-4">
              There are currently no active rentals in the system.
            </p>
          </div>
        )}

        {rentals.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card bg-blue-50 border-blue-200">
              <p className="text-blue-600 text-sm font-medium">
                Total Security Deposits
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {formatCurrency(
                  rentals.reduce(
                    (sum, r) => sum + Number(r.securityDeposit || 0),
                    0
                  )
                )}
              </p>
            </div>
            <div className="card bg-yellow-50 border-yellow-200">
              <p className="text-yellow-600 text-sm font-medium">
                Upcoming Returns
              </p>
              <p className="text-2xl font-bold text-yellow-900">
                {
                  rentals.filter((r) => r.dateStatus === 'upcoming').length
                }
              </p>
            </div>
            <div className="card bg-red-50 border-red-200">
              <p className="text-red-600 text-sm font-medium">Overdue</p>
              <p className="text-2xl font-bold text-red-900">
                {rentals.filter((r) => r.dateStatus === 'overdue').length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OngoingRentals
