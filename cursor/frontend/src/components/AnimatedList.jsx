import { useEffect, useRef } from 'react'

const AnimatedList = ({ children, staggerDelay = 0.05, className = '' }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const children = container.children
    Array.from(children).forEach((child, index) => {
      child.style.opacity = '0'
      child.style.animation = `fade-in-up 0.4s ease-out forwards`
      child.style.animationDelay = `${index * staggerDelay}s`
    })
  }, [children, staggerDelay])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

export default AnimatedList
