import React from 'react'

export const BentoGrid = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-5 auto-rows-max ${className}`}>
      {children}
    </div>
  )
}

export const BentoCard = ({ children, className = '', colSpan = 'md:col-span-3 lg:col-span-4', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-black border border-brand-gray-200 dark:border-brand-gray-800 rounded-[2rem] p-6 transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:border-black dark:hover:border-white btn-active-scale' : ''
      } ${colSpan} ${className}`}
    >
      {children}
    </div>
  )
}
