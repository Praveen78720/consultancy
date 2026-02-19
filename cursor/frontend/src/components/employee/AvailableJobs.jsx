import { useEffect, useState } from 'react'
import { api, endpoints } from '../../services/api'
import { useToast } from '../Toast'
import Breadcrumbs from '../Breadcrumbs'
import EmptyState from '../EmptyState'

const AvailableJobs = () => {
  const { success: showSuccessToast, error: showErrorToast } = useToast()
  const [searchQuery, setSearchQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [acceptingJobId, setAcceptingJobId] = useState(null)

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await api.get(endpoints.jobs.list)
        // Only show 'open' jobs in the available jobs list
        const openJobs = data
          .filter((job) => job.status === 'open')
          .map((job) => ({
            id: job.id,
            customer: job.customer_name,
            location: job.location,
            issue: job.issue,
            postedDate: job.work_date,
            estimatedTime: '2-3 hours',
            priority: job.priority,
            status: job.status,
            skills: [],
          }))
        setJobs(openJobs)
      } catch (err) {
        console.error('Error fetching jobs:', err)
        setError(err.message || 'An unexpected error occurred while loading jobs.')
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  const handleAcceptJob = async (jobId) => {
    const job = jobs.find((j) => j.id === jobId)
    if (!job) return

    setAcceptingJobId(jobId)

    try {
      // Update job status to 'in_progress' (accepted)
      await api.patch(endpoints.jobs.detail(jobId), { status: 'in_progress' })

      // Remove accepted job from the available jobs list
      setJobs((prev) => prev.filter((j) => j.id !== jobId))

      // Show success message
      showSuccessToast(`Job #${jobId} accepted successfully! View it in On-going Job page.`)
    } catch (error) {
      console.error('Error accepting job:', error)
      showErrorToast(error.message || 'Failed to accept job. Please try again.')
    } finally {
      setAcceptingJobId(null)
    }
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.issue.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || job.priority === priorityFilter
    return matchesSearch && matchesPriority
  })

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-priority-high'
      case 'medium':
        return 'bg-priority-medium'
      case 'low':
        return 'bg-priority-low'
      default:
        return 'bg-text-secondary'
    }
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs />
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Available Jobs</h1>
            <p className="text-text-secondary">Welcome back, Staff Member</p>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="relative">
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></div>
              <svg className="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-text-primary font-medium">{currentDate}</p>
          </div>
        </div>

        {/* Section Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Available Service Jobs</h2>
          <p className="text-text-secondary">Review and accept service requests that match your skills.</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by customer, location, or issue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        {/* Job Listings */}
        <div className="space-y-6">
          {loading && (
            <div className="card">
              <p className="text-text-secondary">Loading jobs...</p>
            </div>
          )}

          {error && (
            <div className="card border border-red-300 bg-red-50">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {!loading && !error && filteredJobs.length === 0 && (
            <EmptyState
              icon="job"
              title="No Available Jobs"
              description="There are no open jobs at the moment. Check back later for new job postings."
            />
          )}

          {filteredJobs.map((job) => (
            <div key={job.id} className="card">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-xl font-bold text-text-primary">Job #{job.id}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium text-white ${getPriorityColor(job.priority)}`}>
                      {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium text-white bg-status-open">
                      Open
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-text-primary">
                      <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{job.customer}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-primary">
                      <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Posted {job.postedDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-text-primary">
                      <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Est. {job.estimatedTime}</span>
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
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-background-grey text-text-primary rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleAcceptJob(job.id)}
                  disabled={acceptingJobId === job.id}
                  className="btn-primary flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {acceptingJobId === job.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Accepting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Accept Job
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AvailableJobs
