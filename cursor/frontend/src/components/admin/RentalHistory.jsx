import { useState, useEffect, useMemo } from 'react'
import { api, endpoints } from '../../services/api'
import { useToast } from '../Toast'
import Breadcrumbs from '../Breadcrumbs'
import EmptyState from '../EmptyState'
import DataTable from '../DataTable'
import FilterPanel from '../FilterPanel'
import LoadingSkeleton from '../LoadingSkeleton'

const RentalHistory = () => {
  const { success: showSuccessToast } = useToast()
  const [rentals, setRentals] = useState([])
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilters, setActiveFilters] = useState({})

  useEffect(() => {
    fetchRentalsAndDevices()

    const handleFocus = () => fetchRentalsAndDevices()
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchRentalsAndDevices()
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
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
          securityDeposit: Number(rental.security_deposit) || 0,
          status: rental.status,
          idProof: rental.id_proof,
          createdAt: rental.created_at,
          returnedAt: rental.updated_at || rental.created_at,
        }
      })

      const returnedRentals = enrichedRentals.filter(
        (rental) => rental.status === 'returned'
      )

      setRentals(returnedRentals)
      setDevices(devicesData)
    } catch (err) {
      console.error('Error fetching rentals:', err)
      setError(err.message || 'Failed to load rental history. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Filter logic
  const filteredRentals = useMemo(() => {
    return rentals.filter((rental) => {
      // Date range filter
      if (activeFilters.date_from && rental.returnedAt) {
        if (new Date(rental.returnedAt) < new Date(activeFilters.date_from)) return false
      }
      if (activeFilters.date_to && rental.returnedAt) {
        if (new Date(rental.returnedAt) > new Date(activeFilters.date_to)) return false
      }

      return true
    })
  }, [rentals, activeFilters])

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setActiveFilters({})
    showSuccessToast('Filters cleared')
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const formatCurrency = (amount) => {
    return '₹' + Number(amount).toLocaleString('en-IN')
  }

  const tableColumns = [
    {
      key: 'id',
      title: 'ID',
      render: (value) => `#${value}`,
    },
    {
      key: 'customerName',
      title: 'Customer',
      searchable: true,
    },
    {
      key: 'phoneNumber',
      title: 'Phone',
      render: (value) => value || 'N/A',
    },
    {
      key: 'deviceName',
      title: 'Device',
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-text-secondary">{row.deviceModel}</div>
        </div>
      ),
      searchable: true,
    },
    {
      key: 'deviceSerial',
      title: 'Serial No',
    },
    {
      key: 'fromDate',
      title: 'From Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'toDate',
      title: 'To Date',
      render: (value) => formatDate(value),
    },
    {
      key: 'rentalDays',
      title: 'Days',
      render: (value) => `${value} days`,
    },
    {
      key: 'securityDeposit',
      title: 'Deposit',
      render: (value) => formatCurrency(value),
    },
    {
      key: 'status',
      title: 'Status',
      render: () => (
        <span className="px-2 py-1 rounded-full text-xs font-medium text-white bg-green-600">
          Returned
        </span>
      ),
    },
  ]

  const rowActions = [
    {
      label: 'View ID Proof',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      onClick: (row) => {
        if (row.idProof) {
          window.open(row.idProof, '_blank')
        } else {
          showSuccessToast('No ID proof available for this rental')
        }
      },
      disabled: (row) => !row.idProof,
    },
  ]

  const filterConfig = [
    {
      key: 'date',
      label: 'Return Date Range',
      type: 'date-range',
    },
  ]

  const totalDeposits = filteredRentals.reduce((sum, r) => sum + r.securityDeposit, 0)
  const totalDays = filteredRentals.reduce((sum, r) => sum + r.rentalDays, 0)

  if (loading) {
    return (
      <div className="p-6 md:p-8 lg:p-10 page-transition">
        <div className="max-w-7xl mx-auto">
          <LoadingSkeleton type="page-header" className="mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <LoadingSkeleton type="stat-card" count={3} />
          </div>
          <LoadingSkeleton type="card" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Rental History</h1>
          <div className="card border border-red-300 bg-red-50">
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-700 mb-4">{error}</p>
              <button onClick={fetchRentalsAndDevices} className="btn-primary px-6 py-2">
                Retry
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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Rental History</h1>
            <p className="text-text-secondary">View all returned product rentals</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-3xl font-bold text-text-primary">{filteredRentals.length}</p>
            <p className="text-sm text-text-secondary">Returned Rentals</p>
          </div>
        </div>

        {rentals.length > 0 ? (
          <>
            <FilterPanel
              filters={filterConfig}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              activeFilters={activeFilters}
            />

            <DataTable
              data={filteredRentals}
              columns={tableColumns}
              keyField="id"
              searchable={true}
              searchPlaceholder="Search by customer, device, or serial number..."
              pagination={true}
              itemsPerPage={10}
              rowActions={rowActions}
              loading={loading}
            />

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card bg-green-50 border-green-200">
                <p className="text-green-600 text-sm font-medium">Total Returned Rentals</p>
                <p className="text-2xl font-bold text-green-900">{filteredRentals.length}</p>
              </div>
              <div className="card bg-blue-50 border-blue-200">
                <p className="text-blue-600 text-sm font-medium">Total Deposits Returned</p>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalDeposits)}</p>
              </div>
              <div className="card bg-purple-50 border-purple-200">
                <p className="text-purple-600 text-sm font-medium">Total Rental Days</p>
                <p className="text-2xl font-bold text-purple-900">{totalDays}</p>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon="rental"
            title="No Returned Rentals"
            description="There are no returned rentals in the history yet. When you mark a rental as returned from Ongoing Rentals, it will appear here."
          />
        )}
      </div>
    </div>
  )
}

export default RentalHistory
