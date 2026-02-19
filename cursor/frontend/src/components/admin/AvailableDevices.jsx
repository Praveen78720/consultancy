import { useState, useEffect } from 'react'
import { api, endpoints } from '../../services/api'
import Breadcrumbs from '../Breadcrumbs'
import EmptyState from '../EmptyState'
import DataTable from '../DataTable'

const AvailableDevices = () => {
  const [allDevices, setAllDevices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.get(endpoints.devices.list)
      // Sort by serial number (alphabetical)
      const sortedDevices = data.sort((a, b) => a.serial_no.localeCompare(b.serial_no))
      setAllDevices(sortedDevices)
    } catch (error) {
      console.error('Error fetching devices:', error)
      setError(error.message || 'Failed to load devices')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    fetchDevices()
  }

  const getAvailabilityColor = (status) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'rented':
        return 'bg-red-100 text-red-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const tableColumns = [
    {
      key: 'id',
      title: 'ID',
      render: (value) => `#${value}`,
    },
    {
      key: 'device_name',
      title: 'Device Name',
      render: (value) => value || 'Unnamed Device',
      searchable: true,
    },
    {
      key: 'serial_no',
      title: 'Serial Number',
      searchable: true,
    },
    {
      key: 'model',
      title: 'Model',
      searchable: true,
    },
    {
      key: 'availability',
      title: 'Status',
      render: (value) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(value)}`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: 'created_at',
      title: 'Added Date',
      render: (value) => {
        if (!value) return 'N/A'
        return new Date(value).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      },
    },
  ]

  const availableDevices = allDevices.filter((d) => d.availability === 'available')
  const rentedDevices = allDevices.filter((d) => d.availability === 'rented')
  const maintenanceDevices = allDevices.filter((d) => d.availability === 'maintenance')

  if (loading) {
    return (
      <div className="p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Devices</h1>
          <p className="text-text-secondary mb-8">Loading device inventory...</p>
          <div className="card">
            <div className="animate-pulse space-y-4">
              <div className="h-10 bg-gray-200 rounded w-full"></div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-gray-100 rounded w-full"></div>
              ))}
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">Devices</h1>
          <div className="card border border-red-300 bg-red-50">
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-700 mb-4">{error}</p>
              <button onClick={handleRetry} className="btn-primary px-6 py-2">
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
        <Breadcrumbs />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Device Inventory</h1>
            <p className="text-text-secondary">View and manage all devices</p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <p className="text-3xl font-bold text-text-primary">{allDevices.length}</p>
            <p className="text-sm text-text-secondary">Total Devices</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="card bg-green-50 border-green-200">
            <p className="text-green-600 text-sm font-medium">Available</p>
            <p className="text-2xl font-bold text-green-900">{availableDevices.length}</p>
          </div>
          <div className="card bg-red-50 border-red-200">
            <p className="text-red-600 text-sm font-medium">Rented</p>
            <p className="text-2xl font-bold text-red-900">{rentedDevices.length}</p>
          </div>
          <div className="card bg-yellow-50 border-yellow-200">
            <p className="text-yellow-600 text-sm font-medium">Maintenance</p>
            <p className="text-2xl font-bold text-yellow-900">{maintenanceDevices.length}</p>
          </div>
        </div>

        {allDevices.length > 0 ? (
          <div className="card">
            <h2 className="text-lg font-semibold text-text-primary mb-4">All Devices</h2>
            <DataTable
              data={allDevices}
              columns={tableColumns}
              keyField="id"
              searchable={true}
              searchPlaceholder="Search by device name, serial number, or model..."
              pagination={true}
              itemsPerPage={15}
              loading={loading}
            />
          </div>
        ) : (
          <EmptyState
            icon="device"
            title="No Devices Found"
            description="No devices in the inventory. Add your first device to get started."
            action={true}
            actionLabel="Add New Device"
            onAction={() => (window.location.href = '/admin/add-device')}
          />
        )}
      </div>
    </div>
  )
}

export default AvailableDevices
