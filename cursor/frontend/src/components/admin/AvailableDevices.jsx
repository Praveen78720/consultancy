import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../config'

const AvailableDevices = () => {
  const [devices, setDevices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/devices/`)
      if (response.ok) {
        const data = await response.json()
        setDevices(data.filter(device => device.availability === 'available'))
      } else {
        console.error('Failed to fetch devices')
      }
    } catch (error) {
      console.error('Error fetching devices:', error)
    } finally {
      setLoading(false)
    }
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
          <p className="text-text-secondary mb-8">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Available Devices</h1>
        <p className="text-text-secondary mb-8">View and manage device inventory</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <div key={device.id} className="card">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Device {device.id}</h3>
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
      </div>
    </div>
  )
}

export default AvailableDevices



