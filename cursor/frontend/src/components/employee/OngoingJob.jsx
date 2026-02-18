import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, endpoints } from '../../services/api'

const OngoingJob = () => {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOngoingJobs = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.get(endpoints.jobs.list)

        // Filter only in_progress jobs
        const ongoing = data
          .filter((job) => job.status === 'in_progress')
          .map((job) => ({
            id: job.id,
            customer: job.customer_name,
            location: job.location,
            issue: job.issue,
            startedDate: job.work_date,
            priority: job.priority,
          }))

        setJobs(ongoing)
      } catch (err) {
        console.error('Error fetching ongoing jobs:', err)
        setError(err.message || 'Failed to load ongoing jobs from server.')
      } finally {
        setLoading(false)
      }
    }

    fetchOngoingJobs()
  }, [])

  const handleFinished = (jobId) => {
    // Navigate to report form with job ID – report page will also update DB
    navigate(`/employee/submit-report?jobId=${jobId}`)
  }

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-priority-high',
      medium: 'bg-priority-medium',
      low: 'bg-priority-low',
    }
    return colors[priority] || 'bg-text-secondary'
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-2">On-going Job</h1>
          <p className="text-text-secondary mb-8">Loading your ongoing jobs...</p>
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
          <h1 className="text-3xl font-bold text-text-primary mb-2">On-going Job</h1>
          <div className="card border border-red-300 bg-red-50">
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary px-6 py-2 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
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
        <h1 className="text-3xl font-bold text-text-primary mb-2">On-going Job</h1>
        <p className="text-text-secondary mb-8">View and manage your ongoing jobs</p>

        <div className="space-y-6">
          {jobs.length === 0 ? (
            <div className="card text-center py-12">
              <svg className="w-16 h-16 text-text-secondary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-text-secondary text-lg mb-2">No ongoing jobs at the moment.</p>
              <p className="text-text-secondary text-sm">Accepted jobs will appear here. Go to Available Jobs to accept new work.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <div key={job.id} className="card">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="text-xl font-bold text-text-primary">Job #{job.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getPriorityBadge(job.priority)}`}>
                        {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)} Priority
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-yellow-500">
                        In Progress
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-text-primary">
                        <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{job.customer}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-primary">
                        <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-start gap-2 text-text-primary">
                        <svg className="w-5 h-5 text-text-secondary mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{job.issue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary text-sm">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Started: {job.startedDate}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFinished(job.id)}
                    className="btn-primary flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Finish
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default OngoingJob
