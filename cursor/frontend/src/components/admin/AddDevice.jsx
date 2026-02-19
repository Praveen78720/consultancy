import { useState, useEffect } from 'react'
import { api, endpoints } from '../../services/api'
import { useToast } from '../Toast'
import Breadcrumbs from '../Breadcrumbs'

const AddDevice = () => {
  const { success: showSuccessToast, error: showErrorToast } = useToast()
  const [formData, setFormData] = useState({
    deviceName: '',
    modelName: '',
    serialNumber: ''
  })
  const [existingDevices, setExistingDevices] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serialError, setSerialError] = useState('')

  // Fetch existing devices for validation
  useEffect(() => {
    fetchExistingDevices()
  }, [])

  const fetchExistingDevices = async () => {
    try {
      const data = await api.get(endpoints.devices.list)
      setExistingDevices(data)
    } catch (error) {
      console.error('Error fetching devices:', error)
    }
  }

  // Real-time serial number validation
  const validateSerialNumber = (serial) => {
    const exists = existingDevices.some(d => 
      d.serial_no.toLowerCase() === serial.toLowerCase()
    )
    if (exists) {
      setSerialError('Serial number already exists')
      return false
    }
    setSerialError('')
    return true
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Validate serial number immediately
    if (name === 'serialNumber') {
      validateSerialNumber(value)
    }
    
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Final validation
    if (!validateSerialNumber(formData.serialNumber)) {
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        device_name: formData.deviceName,
        model: formData.modelName,
        serial_no: formData.serialNumber,
        availability: 'available'
      }

      await api.post(endpoints.devices.list, payload)
      
      showSuccessToast('Device added successfully! You can add another device.')
      
      // Reset form but stay on page
      setFormData({
        deviceName: '',
        modelName: '',
        serialNumber: ''
      })
      setSerialError('')
      
      // Refresh existing devices list
      fetchExistingDevices()
      
    } catch (error) {
      showErrorToast(error.message || 'Failed to add device. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-2xl mx-auto">
        <Breadcrumbs />
        <h1 className="text-3xl font-bold text-text-primary mb-2">Add New Device</h1>
        <p className="text-text-secondary mb-8">Add a new device to the inventory</p>

        {/* Add Device Form */}
        <form onSubmit={handleSubmit} className="card space-y-6">
          <div className="text-center border-b border-border-light pb-4">
            <h2 className="text-2xl font-semibold text-text-primary">Device Details</h2>
          </div>

          {/* Device Name */}
          <div>
            <label htmlFor="deviceName" className="block text-sm font-semibold text-text-primary mb-2">
              Device Name *
            </label>
            <input
              type="text"
              id="deviceName"
              name="deviceName"
              value={formData.deviceName}
              onChange={handleChange}
              placeholder="Enter device name (e.g., Dell Laptop)"
              className="input-field"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Model Name */}
          <div>
            <label htmlFor="modelName" className="block text-sm font-semibold text-text-primary mb-2">
              Model Name *
            </label>
            <input
              type="text"
              id="modelName"
              name="modelName"
              value={formData.modelName}
              onChange={handleChange}
              placeholder="Enter model name (e.g., Inspiron 15 3000)"
              className="input-field"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Serial Number */}
          <div>
            <label htmlFor="serialNumber" className="block text-sm font-semibold text-text-primary mb-2">
              Serial Number *
            </label>
            <input
              type="text"
              id="serialNumber"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              placeholder="Enter unique serial number"
              className={`input-field ${
                serialError ? 'border-red-500 focus:border-red-500' : ''
              }`}
              required
              disabled={isSubmitting}
            />
            {serialError && (
              <p className="mt-2 text-sm text-red-600">{serialError}</p>
            )}
            <p className="mt-1 text-xs text-text-secondary">
              Serial number must be unique. Real-time validation enabled.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="btn-primary px-8 py-3 flex items-center gap-2"
              disabled={isSubmitting || serialError}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Adding Device...
                </>
              ) : (
                'Add Device'
              )}
            </button>
          </div>
        </form>

        {/* Quick Tips */}
        <div className="mt-8 bg-background-light rounded-lg p-6 border border-border">
          <h3 className="text-base font-semibold text-text-primary mb-3">Tips:</h3>
          <ul className="space-y-2 text-sm text-text-secondary list-disc list-inside">
            <li>Serial numbers must be unique across all devices</li>
            <li>Device will be marked as "Available" by default</li>
            <li>Once rented, device will not appear in Available Devices</li>
            <li>You can add multiple devices consecutively</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AddDevice
