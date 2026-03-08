import React from 'react'
import Top from './Top'
import Main from './Main'

const Team = () => {
  return (
    <div className="min-h-screen bg-background p-1 sm:p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        <Top />
        <Main />
      </div>
    </div>
  )
}

export default Team
