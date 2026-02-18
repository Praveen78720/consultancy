import { useState, useRef, useEffect } from 'react'
import { API_BASE_URL } from '../../config'
import { api, endpoints } from '../../services/api'

const RentalProduct = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    serialNumber: '',
    fromDate: '',
    toDate: '',
    rentalDays: '',
    securityDeposit: '',
    idProof: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [availableDevices, setAvailableDevices] = useState([])
  const [loadingDevices, setLoadingDevices] = useState(true)
  const fileInputRef = useRef(null)

  // Fetch available devices on mount
  useEffect(() => {
    fetchAvailableDevices()
  }, [])

  const fetchAvailableDevices = async () => {
    try {
      setLoadingDevices(true)
      const data = await api.get(endpoints.devices.list)
      const available = data.filter(d => d.availability === 'available')
      setAvailableDevices(available)
    } catch (error) {
      console.error('Error fetching devices:', error)
    } finally {
      setLoadingDevices(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear message when user starts typing
    if (message.text) setMessage({ type: '', text: '' })
  }

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      idProof: e.target.files[0],
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: '', text: '' })

    const securityDeposit = Number(formData.securityDeposit) || 0

    const formDataToSend = new FormData()
    formDataToSend.append('customer_name', formData.customerName)
    formDataToSend.append('phone_number', formData.phoneNumber)
    formDataToSend.append('device_serial', formData.serialNumber)
    formDataToSend.append('from_date', formData.fromDate)
    formDataToSend.append('to_date', formData.toDate)
    formDataToSend.append('rental_days', Number(formData.rentalDays))
    formDataToSend.append('security_deposit', securityDeposit)
    if (formData.idProof) {
      formDataToSend.append('id_proof', formData.idProof)
    }

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('authToken')

      const response = await fetch(`${API_BASE_URL}/api/rentals/`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Token ${token}` : '',
        },
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to submit rental:', response.status, errorData)
        setMessage({
          type: 'error',
          text: errorData.error || errorData.detail || 'Failed to submit rental. Please try again.',
        })
        return
      }

      // Reset form
      setFormData({
        customerName: '',
        phoneNumber: '',
        serialNumber: '',
        fromDate: '',
        toDate: '',
        rentalDays: '',
        securityDeposit: '',
        idProof: null,
      })

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      setMessage({
        type: 'success',
        text: 'Rental submitted successfully!',
      })

      // Auto-hide success message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error submitting rental:', error)
      setMessage({
        type: 'error',
        text: error.message || 'An unexpected error occurred while submitting the rental.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Rental Product</h1>
        <p className="text-text-secondary mb-8">Create a new product rental request</p>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div className="text-center border-b border-border-light pb-4">
            <h2 className="text-2xl font-semibold text-text-primary">Rental form</h2>
          </div>

          <div>
            <label htmlFor="customerName" className="block text-sm font-semibold text-text-primary mb-2">
              Customer name / Company name
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Enter customer or company name"
              className="input-field"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-semibold text-text-primary mb-2">
              Phone number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              className="input-field"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="serialNumber" className="block text-sm font-semibold text-text-primary mb-2">
              Serial number (device) *
            </label>
            
            {loadingDevices ? (
              <div className="flex items-center gap-2 text-text-secondary">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                Loading available devices...
              </div>
            ) : availableDevices.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  No available devices found. Please add devices first.
                </p>
                <a href="/admin/add-device" className="mt-2 text-primary hover:underline text-sm font-medium inline-block">
                  Go to Add Devices →
                </a>
              </div>
            ) : (
              <select
                id="serialNumber"
                name="serialNumber"
                value={formData.serialNumber}
                onChange={handleChange}
                className="input-field"
                required
                disabled={isSubmitting}
              >
                <option value="">-- Select a device --</option>
                {availableDevices.map((device) => (
                  <option key={device.id} value={device.serial_no}>
                    {device.device_name || 'Unnamed Device'} - {device.serial_no} ({device.model})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fromDate" className="block text-sm font-semibold text-text-primary mb-2">
                From date
              </label>
              <input
                type="date"
                id="fromDate"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                className="input-field"
                required
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label htmlFor="toDate" className="block text-sm font-semibold text-text-primary mb-2">
                To date
              </label>
              <input
                type="date"
                id="toDate"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                className="input-field"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div>
            <label htmlFor="rentalDays" className="block text-sm font-semibold text-text-primary mb-2">
              Number of rental days
            </label>
            <input
              type="number"
              id="rentalDays"
              name="rentalDays"
              value={formData.rentalDays}
              onChange={handleChange}
              placeholder="Enter number of days"
              className="input-field"
              min="1"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="securityDeposit" className="block text-sm font-semibold text-text-primary mb-2">
              Security deposit amount
            </label>
            <input
              type="number"
              id="securityDeposit"
              name="securityDeposit"
              value={formData.securityDeposit}
              onChange={handleChange}
              placeholder="Enter security deposit amount"
              className="input-field no-spinner"
              min="0"
              step="0.01"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="idProof" className="block text-sm font-semibold text-text-primary mb-2">
              ID proof
            </label>
            <input
              ref={fileInputRef}
              type="file"
              id="idProof"
              name="idProof"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className="input-field"
              required
              disabled={isSubmitting}
            />
            {formData.idProof && (
              <p className="text-sm text-text-secondary mt-2">Selected: {formData.idProof.name}</p>
            )}
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="btn-primary px-8 py-3 flex items-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RentalProduct
