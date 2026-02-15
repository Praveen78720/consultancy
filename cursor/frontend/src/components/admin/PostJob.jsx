import { useState } from 'react'
import { API_BASE_URL } from '../../config'

const PostJob = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    phoneNumber: '',
    location: '',
    issue: '',
    workDate: '',
    priority: '',
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      customer_name: formData.customerName,
      phone_number: formData.phoneNumber,
      location: formData.location,
      issue: formData.issue,
      work_date: formData.workDate,
      priority: formData.priority,
      status: 'open',
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Failed to post job:', response.status, errorText)
        alert('Failed to post job. Please check the server logs.')
        return
      }

      const data = await response.json()
      console.log('Job posted successfully:', data)

      // Reset form
      setFormData({
        customerName: '',
        phoneNumber: '',
        location: '',
        issue: '',
        workDate: '',
        priority: '',
      })

      alert('Job posted successfully!')
    } catch (error) {
      console.error('Error posting job:', error)
      alert('An unexpected error occurred while posting the job.')
    }
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Post Job</h1>
        <p className="text-text-secondary mb-8">Create a new service job request</p>

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Customer Detail</h2>
          </div>

          <div>
            <label htmlFor="customerName" className="block text-sm font-semibold text-text-primary mb-2">
              Customers / Company name
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
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-semibold text-text-primary mb-2">
              Location
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Enter location"
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="issue" className="block text-sm font-semibold text-text-primary mb-2">
              Issue
            </label>
            <textarea
              id="issue"
              name="issue"
              value={formData.issue}
              onChange={handleChange}
              placeholder="Describe the issue"
              rows="4"
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="workDate" className="block text-sm font-semibold text-text-primary mb-2">
              Work date
            </label>
            <input
              type="date"
              id="workDate"
              name="workDate"
              value={formData.workDate}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-semibold text-text-primary mb-2">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="flex justify-center pt-4">
            <button type="submit" className="btn-primary px-8 py-3">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PostJob


