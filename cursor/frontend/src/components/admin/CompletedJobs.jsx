import { useState, useEffect } from 'react'
import { api, endpoints } from '../../services/api'
import Breadcrumbs from '../Breadcrumbs'
import EmptyState from '../EmptyState'
import DataTable from '../DataTable'
import FilterPanel from '../FilterPanel'
import LoadingSkeleton from '../LoadingSkeleton'

const CompletedJobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [activeFilters, setActiveFilters] = useState({})

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await api.get(endpoints.jobs.list)
      // Filter for completed jobs only
      const completedJobs = data.filter((job) => job.status === 'completed')
      setJobs(completedJobs)
    } catch (error) {
      console.error('Error fetching completed jobs:', error)
      setError(error.message || 'Failed to load completed jobs')
    } finally {
      setLoading(false)
    }
  }

  // Apply filters
  const filteredJobs = jobs.filter((job) => {
    // Priority filter
    if (activeFilters.priority && activeFilters.priority !== 'all') {
      if (job.priority !== activeFilters.priority) return false
    }

    // Date range filter
    if (activeFilters.date_from && job.work_date) {
      if (new Date(job.work_date) < new Date(activeFilters.date_from)) return false
    }
    if (activeFilters.date_to && job.work_date) {
      if (new Date(job.work_date) > new Date(activeFilters.date_to)) return false
    }

    return true
  })

  const handleFilterChange = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleClearFilters = () => {
    setActiveFilters({})
  }

  const openJobDetails = (job) => {
    setSelectedJob(job)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedJob(null)
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

  const tableColumns = [
    {
      key: 'id',
      title: 'ID',
      render: (value) => `#${value}`,
    },
    {
      key: 'customer_name',
      title: 'Customer',
      searchable: true,
    },
    {
      key: 'location',
      title: 'Location',
      render: (value) => (
        <span className="truncate max-w-[200px] inline-block" title={value}>
          {value}
        </span>
      ),
      searchable: true,
    },
    {
      key: 'work_date',
      title: 'Work Date',
    },
    {
      key: 'priority',
      title: 'Priority',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(value)}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'assigned_to_details',
      title: 'Completed By',
      render: (value) => {
        if (!value) return <span className="text-text-secondary">Unknown</span>
        return (
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{value.username}</span>
          </div>
        )
      },
    },
    {
      key: 'updated_at',
      title: 'Completed At',
      render: (value) => value ? new Date(value).toLocaleString() : '-',
    },
  ]

  const rowActions = [
    {
      label: 'View Details',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeJoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      onClick: (row) => openJobDetails(row),
    },
  ]

  const filterConfig = [
    {
      key: 'priority',
      label: 'Priority',
      type: 'select',
      options: [
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' },
      ],
    },
    {
      key: 'date',
      label: 'Work Date Range',
      type: 'date-range',
    },
  ]

  const JobDetailsModal = () => {
    if (!showModal || !selectedJob) return null

    const assignedEmployee = selectedJob.assigned_to_details

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div className="bg-green-600 p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl font-bold">Job #{selectedJob.id} - Completed</h2>
            </div>
            <button onClick={closeModal} className="text-white hover:text-gray-200 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[70vh]">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Completed
              </span>
            </div>

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
                  <label className="text-sm font-medium text-text-secondary">Created At</label>
                  <p className="text-text-primary">{new Date(selectedJob.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-text-secondary">Completed At</label>
                  <p className="text-text-primary">{selectedJob.updated_at ? new Date(selectedJob.updated_at).toLocaleString() : 'Not recorded'}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-text-primary mb-4 border-b border-border-light pb-2">
                Completion Information
              </h3>
              {assignedEmployee ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-text-secondary">Completed By</label>
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
                      {selectedJob.assigned_at ? new Date(selectedJob.assigned_at).toLocaleString() : 'Not recorded'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-text-secondary">This job was handled by a former employee (user no longer exists in the system).</p>
                </div>
              )}
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-green-800 mb-2">Job Status</h4>
              <p className="text-sm text-green-600">
                This job has been successfully completed. 
                Check the Submit Report section for detailed completion report and photos.
              </p>
            </div>
          </div>

          <div className="p-4 border-t border-border-light bg-gray-50 flex justify-end">
            <button onClick={closeModal} className="btn-secondary px-6 py-2">
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Completed Jobs</h1>
            <p className="text-text-secondary">View history of all completed jobs</p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            <div className="bg-green-50 px-4 py-2 rounded-lg border border-green-200">
              <span className="text-2xl font-bold text-green-700">{filteredJobs.length}</span>
              <span className="text-sm text-green-600 ml-2">Completed</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="card">
            <LoadingSkeleton type="table-row" count={5} />
          </div>
        ) : error ? (
          <div className="card border border-red-300 bg-red-50">
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-700 mb-4">{error}</p>
              <button onClick={fetchJobs} className="btn-primary px-6 py-2">
                Try Again
              </button>
            </div>
          </div>
        ) : jobs.length > 0 ? (
          <>
            <FilterPanel
              filters={filterConfig}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              activeFilters={activeFilters}
            />

            <div className="card">
              <DataTable
                data={filteredJobs}
                columns={tableColumns}
                keyField="id"
                searchable={true}
                searchPlaceholder="Search completed jobs..."
                pagination={filteredJobs.length > 10}
                itemsPerPage={10}
                onRowClick={openJobDetails}
                rowActions={rowActions}
              />
            </div>
          </>
        ) : (
          <EmptyState 
            icon="success" 
            title="No Completed Jobs" 
            description="No jobs have been completed yet." 
          />
        )}

        <JobDetailsModal />
      </div>
    </div>
  )
}

export default CompletedJobs
