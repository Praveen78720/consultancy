import { API_BASE_URL } from '../config'

/**
 * Centralized API Service with automatic authentication handling
 * All API calls go through this service to ensure consistent auth headers and error handling
 */

// Get auth token from localStorage
const getToken = () => localStorage.getItem('authToken')

// Get default headers with auth token
const getHeaders = (isJson = true) => {
  const headers = {}
  const token = getToken()

  if (token) {
    headers['Authorization'] = `Token ${token}`
  }

  if (isJson) {
    headers['Content-Type'] = 'application/json'
  }

  return headers
}

// Handle API response
const handleResponse = async (response) => {
  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    localStorage.removeItem('authToken')
    window.location.href = '/login'
    throw new Error('Session expired. Please login again.')
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || errorData.detail || `Request failed with status ${response.status}`)
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return null
  }

  return response.json()
}

// HTTP methods
export const api = {
  // GET request
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
    })
    return handleResponse(response)
  },

  // POST request
  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  },

  // PATCH request
  patch: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse(response)
  },

  // DELETE request
  delete: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    return handleResponse(response)
  },
}

// API Endpoints
export const endpoints = {
  // Auth
  auth: {
    login: '/api/auth/login/',
    register: '/api/auth/register/',
    profile: '/api/auth/profile/',
  },

  // Dashboard
  dashboard: {
    stats: '/api/dashboard/stats/',
  },

  // Jobs
  jobs: {
    list: '/api/jobs/',
    detail: (id) => `/api/jobs/${id}/`,
  },

  // Rentals
  rentals: {
    list: '/api/rentals/',
    detail: (id) => `/api/rentals/${id}/`,
    return: (id) => `/api/rentals/${id}/return/`,
  },

  // Devices
  devices: {
    list: '/api/devices/',
    detail: (id) => `/api/devices/${id}/`,
    bySerial: (serial) => `/api/devices/?serial_no=${serial}`,
  },

  // Reports
  reports: {
    list: '/api/reports/',
    detail: (id) => `/api/reports/${id}/`,
    byJob: (jobId) => `/api/reports/?job=${jobId}`,
  },

  // Users
  users: {
    list: '/api/users/',
    delete: (id) => `/api/users/${id}/delete/`,
  },
}

export default api
