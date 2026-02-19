import { Link, useLocation } from 'react-router-dom'

const Breadcrumbs = () => {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  // Map of route paths to readable names
  const routeNames = {
    'admin': 'Admin',
    'dashboard': 'Dashboard',
    'post-job': 'Post Job',
    'job-history': 'Job History',
    'jobs': 'Jobs',
    'ongoing': 'Ongoing',
    'open': 'Open',
    'completed': 'Completed',
    'rental-product': 'Product Rental',
    'rentals': 'Rentals',
    'ongoing-rentals': 'Ongoing Rentals',
    'rental-history': 'Rental History',
    'available-devices': 'Available Devices',
    'add-device': 'Add Devices',
    'settings': 'Settings',
    'employee': 'Employee',
    'available-jobs': 'Available Jobs',
    'ongoing-job': 'Ongoing Jobs',
    'recently-completed': 'Recently Completed',
    'submit-report': 'Submit Report',
  }

  if (pathnames.length === 0) {
    return null
  }

  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2 text-sm">
        <li>
          <Link
            to="/admin/dashboard"
            className="text-text-secondary hover:text-primary transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Home
          </Link>
        </li>
        
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
          const isLast = index === pathnames.length - 1
          const displayName = routeNames[name] || name.charAt(0).toUpperCase() + name.slice(1)

          return (
            <li key={name} className="flex items-center">
              <svg className="w-4 h-4 text-text-secondary mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              
              {isLast ? (
                <span className="text-text-primary font-medium" aria-current="page">
                  {displayName}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  className="text-text-secondary hover:text-primary transition-colors"
                >
                  {displayName}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
