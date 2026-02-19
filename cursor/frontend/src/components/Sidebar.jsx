import { NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const Sidebar = ({ user, userRole, onLogout, onClose }) => {
  const location = useLocation()
  
  // Load expanded state from localStorage or default to collapsed
  const [expandedMenus, setExpandedMenus] = useState(() => {
    const saved = localStorage.getItem('sidebarExpandedMenus')
    return saved ? JSON.parse(saved) : { jobs: false, rentals: false }
  })
  
  // Save expanded state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarExpandedMenus', JSON.stringify(expandedMenus))
  }, [expandedMenus])

  const toggleMenu = (menuName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuName]: !prev[menuName]
    }))
  }

  // Helper to check if a child route is active
  const isChildActive = (paths) => {
    return paths.some(path => location.pathname.startsWith(path))
  }

  const adminMenuStructure = [
    { 
      type: 'item', 
      path: '/admin/dashboard', 
      label: 'Dashboard', 
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' 
    },
    { 
      type: 'item', 
      path: '/admin/post-job', 
      label: 'Post Job', 
      icon: 'M12 4v16m8-8H4' 
    },
    {
      type: 'submenu',
      key: 'jobs',
      label: 'JOBS',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      childPaths: ['/admin/jobs'],
      children: [
        { path: '/admin/jobs/ongoing', label: 'Ongoing Jobs', icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
        { path: '/admin/jobs/open', label: 'Open Jobs', icon: 'M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4' },
        { path: '/admin/jobs/completed', label: 'Completed Jobs', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      ]
    },
    { 
      type: 'item', 
      path: '/admin/rental-product', 
      label: 'Product Rental', 
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' 
    },
    {
      type: 'submenu',
      key: 'rentals',
      label: 'RENTALS',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
      childPaths: ['/admin/rentals'],
      children: [
        { path: '/admin/rentals/ongoing', label: 'Ongoing Rentals', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { path: '/admin/rentals/completed', label: 'Completed Rentals', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
      ]
    },
    { 
      type: 'item', 
      path: '/admin/available-devices', 
      label: 'Available Device', 
      icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z' 
    },
    { 
      type: 'item', 
      path: '/admin/add-device', 
      label: 'Add Devices', 
      icon: 'M12 4v16m8-8H4' 
    },
    { 
      type: 'item', 
      path: '/admin/settings', 
      label: 'Admin Setting', 
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' 
    },
  ]

  const employeeMenuItems = [
    { path: '/employee/available-jobs', label: 'Available Jobs', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { path: '/employee/ongoing-job', label: 'On going Job', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/employee/recently-completed', label: 'Recently Completed Job', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/employee/submit-report', label: 'Submit Report', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ]

  const menuItems = userRole === 'admin' ? adminMenuStructure : employeeMenuItems
  const roleLabel = userRole === 'admin' ? 'Admin' : 'Staff Member'
  const roleSubtext = userRole === 'admin' ? 'Administrator' : 'Staff'

  const renderMenuItem = (item, index) => {
    if (item.type === 'submenu') {
      const isExpanded = expandedMenus[item.key]
      const isChildActiveState = isChildActive(item.childPaths)
      
      return (
        <div key={item.key} className="space-y-1">
          {/* Parent Menu Button - Only clickable, no hover expansion */}
          <button
            onClick={() => toggleMenu(item.key)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group bg-transparent ${
              isChildActiveState
                ? 'text-primary font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <div className="flex items-center gap-3">
              <svg 
                className={`w-5 h-5 transition-colors duration-200 ${
                  isChildActiveState ? 'text-primary' : 'text-text-secondary group-hover:text-text-primary'
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            {/* Chevron Icon with Rotation */}
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                isExpanded ? 'rotate-180' : 'rotate-0'
              } ${isChildActiveState ? 'text-primary' : 'text-text-secondary'}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Submenu Items with Animation */}
          <div 
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="pl-4 space-y-1 border-l-2 border-border-light ml-6">
              {item.children.map((child) => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm ${
                      isActive
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-transparent text-text-secondary hover:text-text-primary'
                    }`
                  }
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={child.icon} />
                  </svg>
                  <span className="font-medium">{child.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )
    }
    
    // Regular menu item
    return (
      <NavLink
        key={item.path}
        to={item.path}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            isActive
              ? 'bg-primary text-white shadow-sm'
              : 'bg-transparent text-text-secondary hover:text-text-primary'
          }`
        }
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
        </svg>
        <span className="text-sm font-medium">{item.label}</span>
      </NavLink>
    )
  }

  return (
    <div className="w-64 bg-background-grey min-h-screen flex flex-col border-r border-border-light">
      {/* Logo Section */}
      <div className="p-4 lg:p-6 border-b border-border-light">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-text-primary truncate">Best In Solutions</h2>
              <p className="text-xs text-text-secondary hidden lg:block">Service Management</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-background-light active:bg-gray-200 transition-colors touch-target"
            aria-label="Close menu"
          >
            <svg className="w-6 h-6 text-text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {userRole === 'admin' 
          ? adminMenuStructure.map((item, index) => renderMenuItem(item, index))
          : employeeMenuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-transparent text-text-secondary hover:text-text-primary'
                  }`
                }
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            ))
        }
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border-light">
        <div className="flex items-center justify-between p-3 rounded-lg cursor-pointer" onClick={onLogout}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">{roleLabel}</p>
              <p className="text-xs text-text-secondary">{roleSubtext}</p>
            </div>
          </div>
          <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
