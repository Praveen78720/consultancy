import { useState } from 'react'
import { API_BASE_URL } from '../../config'

const AdminSettings = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin', // Default to admin for this page
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear message when user starts typing
    if (message.text) setMessage({ type: '', text: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `${formData.role === 'admin' ? 'Admin' : 'Employee'} added successfully! They can now log in with their email and password.`,
        })
        // Reset form
        setFormData({
          username: '',
          email: '',
          password: '',
          role: 'admin',
        })
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to add user. Please try again.',
        })
      }
    } catch (error) {
      console.error('Error creating user:', error)
      setMessage({
        type: 'error',
        text: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Admin Setting</h1>
        <p className="text-text-secondary mb-8">Add a new administrator or employee</p>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">Add New User</h2>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-semibold text-text-primary mb-2">
              User Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="admin">Administrator</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-semibold text-text-primary mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-text-primary mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="input-field"
              required
              minLength="8"
            />
            <p className="text-xs text-text-secondary mt-1">
              Password must be at least 8 characters long.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              className="btn-primary px-8 py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </form>

        <div className="mt-8 card bg-blue-50 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">How it works:</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Administrators can access all admin features including user management</li>
            <li>Employees can view jobs, accept work, and submit reports</li>
            <li>New users can log in immediately using their email and password</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings



