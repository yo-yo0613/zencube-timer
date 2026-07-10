import React from 'react'
import Sq1Preview from './Sq1Preview'

const CubePreview = React.memo(({ scramble, puzzleType }) => {
  const eventMap = {
    '333': '333',
    '222': '222',
    '444': '444',
    '555': '555',
    '666': '666',
    '777': '777',
    'pyram': 'pyram',
    'skewb': 'skewb',
    'minx': 'minx',
    'clock': 'clock',
    'sq1': 'sq1'
  }

  const wcaEvent = eventMap[puzzleType]
  if (!wcaEvent) return null

  if (puzzleType === 'sq1') {
    return <Sq1Preview scramble={scramble} />
  }

  return (
    <div className="bg-white dark:bg-brand-gray-950 p-3 rounded-2xl border border-brand-gray-150 dark:border-brand-gray-900 inline-block shadow-sm animate-in fade-in zoom-in-95 duration-200">
      {/* 
        Official WCA Web Component from scramble-display npm package.
        Renders the exact 2D net drawing for all official events, 
        fully matching csTimer and qqTimer implementations.
      */}
      <scramble-display
        event={wcaEvent}
        scramble={scramble}
        style={{
          display: 'block',
          width: '140px',
          height: '110px',
          margin: '0 auto',
          background: 'transparent'
        }}
      />
    </div>
  )
})

export default CubePreview
