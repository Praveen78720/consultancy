import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../config'

const JobHistory = () => {
  const [ongoingJobs, setOngoingJobs] = useState([])
  const [recentCompleted, setRecentCompleted] = useState([])
  const [completedHistory, setCompletedHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/`)
      if (response.ok) {
        const data = await response.json()
        const ongoing = data.filter(job => job.status === 'in_progress')
        const completed = data.filter(job => job.status === 'completed')
        setOngoingJobs(ongoing.slice(0, 5)) // recent ongoing
        setRecentCompleted(completed.slice(0, 5)) // recent completed
        setCompletedHistory(completed) // all completed
      } else {
        console.error('Failed to fetch jobs')
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const JobCard = ({ job, showDetails }) => (
    <div className="card hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary mb-1">Job #{job.id}</h3>
          <p className="text-sm text-text-secondary mb-2">{job.customer_name}</p>
          <p className="text-sm text-text-primary">{job.issue}</p>
          <p className="text-xs text-text-secondary mt-2">Date: {job.work_date}</p>
        </div>
        {showDetails && (
          <button className="text-primary hover:text-primary-dark text-sm font-medium" onClick={() => alert(`Details for Job #${job.id}: ${job.issue}`)}>
            Details
          </button>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Job History</h1>
          <p className="text-text-secondary mb-8">Loading...</p>
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
              {ongoingJobs.map((job) => (
                <JobCard key={job.id} job={job} showDetails={true} />
              ))}
            </div>
          </div>

          {/* Recent Completed Job */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Recent Completed Job</h2>
            <div className="space-y-4">
              {recentCompleted.map((job) => (
                <JobCard key={job.id} job={job} showDetails={true} />
              ))}
            </div>
          </div>

          {/* History of Completed Job */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-text-primary mb-4">History of Completed Job</h2>
            <div className="space-y-4">
              {completedHistory.map((job) => (
                <JobCard key={job.id} job={job} showDetails={true} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobHistory



