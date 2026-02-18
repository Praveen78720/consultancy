import { useState, useEffect } from 'react'
import { api, endpoints } from '../../services/api'

const JobHistory = () => {
  const [ongoingJobs, setOngoingJobs] = useState([])
  const [recentCompleted, setRecentCompleted] = useState([])
  const [completedHistory, setCompletedHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.get(endpoints.jobs.list)
      const ongoing = data.filter(job => job.status === 'in_progress')
      const completed = data.filter(job => job.status === 'completed')
      setOngoingJobs(ongoing.slice(0, 5)) // recent ongoing
      setRecentCompleted(completed.slice(0, 5)) // recent completed
      setCompletedHistory(completed) // all completed
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setError(error.message || 'Failed to load job history')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    fetchJobs()
  }

  const openJobDetails = (job) => {
    setSelectedJob(job)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedJob(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-orange-100 text-orange-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const JobCard = ({ job, showDetails }) => {
    const assignedEmployee = job.assigned_to_details
    
    return (
      <div className="card hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-text-primary">Job #{job.id}</h3>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
            </div>
            <p className="text-sm text-text-secondary mb-2">{job.customer_name}</p>
            <p className="text-sm text-text-primary line-clamp-2">{job.issue}</p>
            <p className="text-xs text-text-secondary mt-2">Date: {job.work_date}</p>
            
            {/* Show assigned employee */}
            {assignedEmployee && (
              <div className="mt-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs text-text-primary">
                  Assigned: {assignedEmployee.username} ({assignedEmployee.email})
                </span>
              </div>
            )}
            
            {!assignedEmployee && job.status !== 'open' && (
              <div className="mt-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs text-text-secondary">Former Employee</span>
              </div>
            )}
          </div>
          {showDetails && (
            <button 
              className="text-primary hover:text-primary-dark text-sm font-medium ml-2" 
              onClick={() => openJobDetails(job)}
            >
              Details
            </button>
          )}
        </div>
      </div>
    )
  }

  const JobDetailsModal = () => {
    if (!showModal || !selectedJob) return null

    const assignedEmployee = selectedJob.assigned_to_details

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-6 text-white flex justify-between items-center">
            <h2 className="text-2xl font-bold">Job #{selectedJob.id} Details</h2>
            <button
              onClick={closeModal}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[70vh]">
            {/* Job Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-light pb-2">
                Job Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-text-secondary">Customer Name</label>
                  <p className="text-text-primary font-semibold">{selectedJob.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Phone Number</label>
                  <p className="text-text-primary">{selectedJob.phone_number}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-text-secondary">Location</label>
                  <p className="text-text-primary">{selectedJob.location}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-text-secondary">Issue Description</label>
                  <p className="text-text-primary bg-gray-50 p-3 rounded-lg mt-1">{selectedJob.issue}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Work Date</label>
                  <p className="text-text-primary">{selectedJob.work_date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Priority</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedJob.priority)}`}>
                    {selectedJob.priority}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedJob.status)}`}>
                    {selectedJob.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Created At</label>
                  <p className="text-text-primary">{new Date(selectedJob.created_at).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Employee Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-light pb-2">
                Employee Information
              </h3>
              {assignedEmployee ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Assigned To</label>
                    <p className="text-text-primary font-semibold">{assignedEmployee.username}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Email</label>
                    <p className="text-text-primary">{assignedEmployee.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Role</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      assignedEmployee.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {assignedEmployee.role}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Assigned At</label>
                    <p className="text-text-primary">
                      {selectedJob.assigned_at 
                        ? new Date(selectedJob.assigned_at).toLocaleString() 
                        : 'Not recorded'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-text-secondary">
                    {selectedJob.status === 'open' 
                      ? 'This job has not been assigned to any employee yet.'
                      : 'This job was handled by a former employee (user no longer exists in the system).'}
                  </p>
                </div>
              )}
            </div>

            {/* Completion Report Section (if completed) */}
            {selectedJob.status === 'completed' && (
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-light pb-2">
                  Completion Information
                </h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-green-800">
                    This job has been completed by {assignedEmployee ? assignedEmployee.username : 'the assigned employee'}.
                  </p>
                  <p className="text-sm text-green-600 mt-2">
                    Check the Submit Report section for detailed completion report.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border-light bg-gray-50 flex justify-end">
            <button 
              onClick={closeModal} 
              className="btn-secondary px-6 py-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Job History</h1>
          <p className="text-text-secondary mb-8">Loading job history...</p>
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">Job History</h1>
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
        <h1 className="text-3xl font-bold text-text-primary mb-2">Job History</h1>
        <p className="text-text-secondary mb-8">View and manage job history</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* On-going Job */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-text-primary mb-4">On-going Job</h2>
            <div className="space-y-4">
              {ongoingJobs.length > 0 ? (
                ongoingJobs.map((job) => (
                  <JobCard key={job.id} job={job} showDetails={true} />
                ))
              ) : (
                <div className="card text-center py-8">
                  <p className="text-text-secondary">No ongoing jobs</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Completed Job */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Recent Completed Job</h2>
            <div className="space-y-4">
              {recentCompleted.length > 0 ? (
                recentCompleted.map((job) => (
                  <JobCard key={job.id} job={job} showDetails={true} />
                ))
              ) : (
                <div className="card text-center py-8">
                  <p className="text-text-secondary">No recently completed jobs</p>
                </div>
              )}
            </div>
          </div>

          {/* History of Completed Job */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-text-primary mb-4">History of Completed Job</h2>
            <div className="space-y-4">
              {completedHistory.length > 0 ? (
                completedHistory.map((job) => (
                  <JobCard key={job.id} job={job} showDetails={true} />
                ))
              ) : (
                <div className="card text-center py-8">
                  <p className="text-text-secondary">No completed jobs</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Details Modal */}
      <JobDetailsModal />
    </div>
  )
}

export default JobHistory
