const LoadingSkeleton = ({ type = 'card', count = 1, className = '' }) => {
  const skeletons = []

  for (let i = 0; i < count; i++) {
    switch (type) {
      case 'card':
        skeletons.push(
          <div key={i} className={`card ${className}`}>
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="flex justify-between pt-4">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        )
        break

      case 'table-row':
        skeletons.push(
          <tr key={i} className="animate-pulse">
            <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
            <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
            <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
            <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
            <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
          </tr>
        )
        break

      case 'stat-card':
        skeletons.push(
          <div key={i} className={`card ${className}`}>
            <div className="animate-pulse">
              <div className="flex justify-between items-start">
                <div className="space-y-3 w-full">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        )
        break

      case 'form':
        skeletons.push(
          <div key={i} className={`card ${className}`}>
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        )
        break

      case 'page-header':
        skeletons.push(
          <div key={i} className={`animate-pulse ${className}`}>
            <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
        )
        break

      case 'list-item':
        skeletons.push(
          <div key={i} className={`animate-pulse flex items-center gap-4 py-4 border-b border-border-light ${className}`}>
            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        )
        break

      default:
        skeletons.push(
          <div key={i} className={`animate-pulse ${className}`}>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        )
    }
  }

  if (type === 'table-row') {
    return <>{skeletons}</>
  }

  if (count === 1) {
    return <>{skeletons[0]}</>
  }

  return <div className="space-y-4">{skeletons}</div>
}

export default LoadingSkeleton
