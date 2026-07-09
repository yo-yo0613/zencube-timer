import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const CalendarHeatmap = ({ solves = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Parse solves and count them by date string "YYYY-MM-DD"
  const solveCountsByDate = solves.reduce((acc, solve) => {
    if (!solve.created_at) return acc
    const dateStr = new Date(solve.created_at).toISOString().split('T')[0]
    acc[dateStr] = (acc[dateStr] || 0) + 1
    return acc
  }, {})

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Get first day of the month (0 = Sunday, 6 = Saturday)
  const firstDayIndex = new Date(year, month, 1).getDay()
  
  // Get number of days in the month
  const totalDays = new Date(year, month + 1, 0).getDate()

  // Generate calendar days
  const daysArray = []
  // Fill empty slots before first day
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null)
  }
  // Fill actual days
  for (let i = 1; i <= totalDays; i++) {
    daysArray.push(i)
  }

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ]

  const getIntensityClass = (count) => {
    if (!count) return 'bg-brand-gray-100 dark:bg-brand-gray-900 text-brand-gray-400 dark:text-brand-gray-600'
    if (count <= 3) return 'bg-brand-gray-300 dark:bg-brand-gray-800 text-brand-gray-700 dark:text-brand-gray-300 font-bold'
    if (count <= 10) return 'bg-brand-gray-500 dark:bg-brand-gray-600 text-white font-bold'
    if (count <= 25) return 'bg-brand-gray-700 dark:bg-brand-gray-400 text-white dark:text-black font-bold'
    return 'bg-black dark:bg-white text-white dark:text-black font-extrabold ring-2 ring-brand-gray-400'
  }

  const weekdays = ['日', '一', '二', '三', '四', '五', '六']

  return (
    <div className="bg-white dark:bg-black p-5 rounded-3xl border border-brand-gray-200 dark:border-brand-gray-800 h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-sm text-brand-gray-500 dark:text-brand-gray-400 uppercase tracking-wider">練習日曆</h3>
          <span className="text-xl font-extrabold font-mono tracking-tight">{year}年 {monthNames[month]}</span>
        </div>
        <div className="flex gap-1 bg-brand-gray-100 dark:bg-brand-gray-900 p-1 rounded-xl">
          <button
            onClick={prevMonth}
            className="p-1.5 hover:bg-white dark:hover:bg-brand-gray-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 hover:bg-white dark:hover:bg-brand-gray-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {weekdays.map((d, i) => (
          <span key={i} className="text-[10px] font-bold text-brand-gray-400 dark:text-brand-gray-600">
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysArray.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const count = solveCountsByDate[dateStr] || 0
          
          return (
            <div
              key={`day-${day}`}
              title={`${dateStr}: ${count} 次練習`}
              className={`aspect-square rounded-lg flex items-center justify-center text-xs relative group cursor-pointer transition-all duration-200 btn-active-scale ${getIntensityClass(count)}`}
            >
              <span>{day}</span>
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-gray-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-gray-500"></span>
                </span>
              )}
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 border border-brand-gray-800 shadow-xl">
                {count} 次練習
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-brand-gray-100 dark:border-brand-gray-900 flex justify-between items-center text-[10px] text-brand-gray-400 dark:text-brand-gray-500">
        <span>累積練習日: {Object.keys(solveCountsByDate).length} 天</span>
        <div className="flex gap-1 items-center">
          <span>少</span>
          <div className="w-2.5 h-2.5 rounded bg-brand-gray-100 dark:bg-brand-gray-900" />
          <div className="w-2.5 h-2.5 rounded bg-brand-gray-300 dark:bg-brand-gray-800" />
          <div className="w-2.5 h-2.5 rounded bg-brand-gray-500 dark:bg-brand-gray-600" />
          <div className="w-2.5 h-2.5 rounded bg-black dark:bg-white" />
          <span>多</span>
        </div>
      </div>
    </div>
  )
}

export default CalendarHeatmap
