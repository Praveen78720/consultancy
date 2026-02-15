import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { API_BASE_URL } from '../../config'

const SubmitReport = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const urlJobId = searchParams.get('jobId')

  const [selectedJobId, setSelectedJobId] = useState(urlJobId || '')
  const [inProgressJobs, setInProgressJobs] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(false)

  const [formData, setFormData] = useState({
    companyName: '',
    timeTaken: '',
    equipmentUsed: '',
    workDescription: '',
    completionPhoto: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' })

  // Fetch in-progress jobs on component mount
  useEffect(() => {
    fetchInProgressJobs()
  }, [])

  const fetchInProgressJobs = async () => {
    setLoadingJobs(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/`)
      if (response.ok) {
        const data = await response.json()
        const inProgress = data.filter(job => job.status === 'in_progress')
        setInProgressJobs(inProgress)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoadingJobs(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      completionPhoto: e.target.files[0] || null,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!selectedJobId) {
      setSubmitStatus({ type: 'error', message: 'Please select a job to submit the report for.' })
      return
    }

    // Validate all required fields
    if (!formData.companyName || !formData.timeTaken || !formData.equipmentUsed || !formData.workDescription) {
      setSubmitStatus({ type: 'error', message: 'Please fill in all required fields.' })
      return
    }

    setIsSubmitting(true)
    setSubmitStatus({ type: '', message: '' })

    const payload = {
      job: Number(selectedJobId),
      company_name: formData.companyName,
      time_taken: formData.timeTaken,
      equipment_used: formData.equipmentUsed,
      work_description: formData.workDescription,
      completion_photo_url: formData.completionPhoto?.name || '',
    }

    try {
      // 1) Create report record
      const reportResponse = await fetch(`${API_BASE_URL}/api/reports/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!reportResponse.ok) {
        const errorData = await reportResponse.json().catch(() => ({}))
        console.error('Failed to submit report:', reportResponse.status, errorData)
        setSubmitStatus({
          type: 'error',
          message: errorData.detail || errorData.error || 'Failed to submit report. Please try again.',
        })
        return
      }

      const reportData = await reportResponse.json()
      console.log('Report submitted and saved:', reportData)

      // 2) Mark job as completed
      const jobResponse = await fetch(`${API_BASE_URL}/api/jobs/${selectedJobId}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'completed' }),
      })

      if (!jobResponse.ok) {
        const errorData = await jobResponse.json().catch(() => ({}))
        console.error('Failed to update job status to completed:', jobResponse.status, errorData)
        setSubmitStatus({
          type: 'warning',
          message: 'Report saved, but failed to update job status. Please contact admin.',
        })
        return
      }

      const jobData = await jobResponse.json()
      console.log('Job marked as completed:', jobData)

      setSubmitStatus({
        type: 'success',
        message: 'Report submitted and job marked as completed!',
      })

      // Reset form after successful submission
      setFormData({
        companyName: '',
        timeTaken: '',
        equipmentUsed: '',
        workDescription: '',
        completionPhoto: null,
      })
      setSelectedJobId('')

      // Navigate after a short delay so user sees the success message
      setTimeout(() => {
        navigate('/employee/recently-completed')
      }, 1500)
    } catch (error) {
      console.error('Error submitting report:', error)
      setSubmitStatus({
        type: 'error',
        message: 'An unexpected error occurred while submitting the report. Please check your connection and try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Report Form</h1>
        <p className="text-text-secondary mb-8">
          {selectedJobId ? `Submit report for Job #${selectedJobId}` : 'Submit a completion report'}
        </p>

        {submitStatus.message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              submitStatus.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : submitStatus.type === 'warning'
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {submitStatus.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* Job Selector */}
          <div>
            <label htmlFor="jobSelector" className="block text-sm font-semibold text-text-primary mb-2">
              Select Job <span className="text-red-500">*</span>
            </label>
            {loadingJobs ? (
              <p className="text-text-secondary">Loading available jobs...</p>
            ) : inProgressJobs.length > 0 ? (
              <select
                id="jobSelector"
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="input-field"
                required
                disabled={isSubmitting}
              >
                <option value="">-- Select an in-progress job --</option>
                {inProgressJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    Job #{job.id} - {job.customer_name} ({job.location})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  No in-progress jobs available. Please accept a job from "Available Jobs" first.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/employee/available-jobs')}
                  className="mt-2 text-primary hover:text-primary-dark text-sm font-medium"
                >
                  Go to Available Jobs →
                </button>
              </div>
            )}
            {selectedJobId && (
              <p className="text-sm text-green-600 mt-2">
                ✓ Submitting report for Job #{selectedJobId}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="companyName" className="block text-sm font-semibold text-text-primary mb-2">
              Company / Customer name
            </label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="Enter company or customer name"
              className="input-field"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="timeTaken" className="block text-sm font-semibold text-text-primary mb-2">
              Time taken
            </label>
            <input
              type="text"
              id="timeTaken"
              name="timeTaken"
              value={formData.timeTaken}
              onChange={handleChange}
              placeholder="e.g., 2 hours 30 minutes"
              className="input-field"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="equipmentUsed" className="block text-sm font-semibold text-text-primary mb-2">
              Equipment used
            </label>
            <input
              type="text"
              id="equipmentUsed"
              name="equipmentUsed"
              value={formData.equipmentUsed}
              onChange={handleChange}
              placeholder="List equipment used"
              className="input-field"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="workDescription" className="block text-sm font-semibold text-text-primary mb-2">
              Work description
            </label>
            <textarea
              id="workDescription"
              name="workDescription"
              value={formData.workDescription}
              onChange={handleChange}
              placeholder="Describe the work completed"
              rows="5"
              className="input-field"
              required
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label htmlFor="completionPhoto" className="block text-sm font-semibold text-text-primary mb-2">
              Completion photo
            </label>
            <input
              type="file"
              id="completionPhoto"
              name="completionPhoto"
              onChange={handleFileChange}
              accept="image/*"
              className="input-field"
              disabled={isSubmitting}
            />
            {formData.completionPhoto && (
              <p className="text-sm text-text-secondary mt-2">Selected: {formData.completionPhoto.name}</p>
            )}
            <p className="text-xs text-text-secondary mt-1">
              Photo name will be recorded. Upload the actual file to your storage system separately.
            </p>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="submit"
              className="btn-primary px-8 py-3"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubmitReport


