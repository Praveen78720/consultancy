import { useState, useEffect } from 'react'
import { api, endpoints } from '../../services/api'

const AvailableDevices = () => {
  const [devices, setDevices] = useState([])
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
      // Filter available devices and sort by serial number (alphabetical)
      const availableDevices = data
        .filter(device => device.availability === 'available')
        .sort((a, b) => a.serial_no.localeCompare(b.serial_no))
      setDevices(availableDevices)
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
        return 'bg-status-completed text-white'
      case 'rented':
        return 'bg-status-open text-white'
      default:
        return 'bg-text-secondary text-white'
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Available Devices</h1>
          <p className="text-text-secondary mb-8">Loading devices...</p>
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">Available Devices</h1>
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Available Devices</h1>
        <p className="text-text-secondary mb-8">View and manage device inventory</p>

        {devices.length === 0 ? (
          <div className="card text-center py-12">
            <svg className="w-12 h-12 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-text-secondary">No available devices found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <div key={device.id} className="card">
                <h3 className="text-lg font-semibold text-text-primary mb-2">{device.device_name || 'Unnamed Device'}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Serial No</label>
                    <p className="text-text-primary font-semibold">{device.serial_no}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Model</label>
                    <p className="text-text-primary font-semibold">{device.model}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Availability</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getAvailabilityColor(device.availability)}`}>
                      {device.availability}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AvailableDevices
