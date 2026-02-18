import { useState, useEffect } from 'react'
import { api, endpoints } from '../../services/api'

const RecentlyCompleted = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCompletedJobs()
  }, [])

  const fetchCompletedJobs = async () => {
    try {
      const data = await api.get(endpoints.jobs.list)
      const completed = data.filter(job => job.status === 'completed')
      // For each completed job, fetch the report
      const jobsWithReports = await Promise.all(completed.map(async (job) => {
        try {
          const reports = await api.get(endpoints.reports.byJob(job.id))
          const report = reports[0]
          return {
            id: job.id,
            customer: report ? report.company_name : job.customer_name,
            workDescription: report ? report.work_description : 'No description available',
          }
        } catch (error) {
          console.error('Error fetching report for job', job.id, error)
          return {
            id: job.id,
            customer: job.customer_name,
            workDescription: 'No description available',
          }
        }
      }))
      setJobs(jobsWithReports)
      setError(null)
    } catch (error) {
      console.error('Error fetching jobs:', error)
      setError(error.message || 'Failed to load completed jobs')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Recently Completed Job</h1>
          <p className="text-text-secondary mb-8">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Recently Completed Job</h1>
        <p className="text-text-secondary mb-8">View your recently completed jobs</p>

        {error && (
          <div className="card border border-red-300 bg-red-50 mb-6">
            <p className="text-red-700 p-4">{error}</p>
            <button 
              onClick={fetchCompletedJobs}
              className="mt-2 text-primary hover:underline px-4 pb-4"
            >
              Retry
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="card">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Job {job.id}</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-text-secondary">(i) Company or Customer name</label>
                  <p className="text-text-primary font-semibold mt-1">{job.customer}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">(ii) Work description</label>
                  <p className="text-text-primary mt-1">{job.workDescription}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-text-secondary">No recently completed jobs.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default RecentlyCompleted



