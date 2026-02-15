import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../config'

const RecentlyCompleted = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompletedJobs()
  }, [])

  const fetchCompletedJobs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/`)
      if (response.ok) {
        const data = await response.json()
        const completed = data.filter(job => job.status === 'completed')
        // For each completed job, fetch the report
        const jobsWithReports = await Promise.all(completed.map(async (job) => {
          try {
            const reportResponse = await fetch(`${API_BASE_URL}/api/reports/?job=${job.id}`)
            if (reportResponse.ok) {
              const reports = await reportResponse.json()
              const report = reports[0] // assume one report per job
              return {
                id: job.id,
                customer: report ? report.company_name : job.customer_name,
                workDescription: report ? report.work_description : 'No description available',
              }
            }
          } catch (error) {
            console.error('Error fetching report for job', job.id, error)
          }
          return {
            id: job.id,
            customer: job.customer_name,
            workDescription: 'No description available',
          }
        }))
        setJobs(jobsWithReports)
      } else {
        console.error('Failed to fetch jobs')
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
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



