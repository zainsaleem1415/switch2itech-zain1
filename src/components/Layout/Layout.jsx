import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const Layout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden transition-colors duration-300">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onMenuClick={() => setMobileSidebarOpen((prev) => !prev)} />

        <main className="flex-1 overflow-x-hidden overflow-y-auto p-1 sm:p-2 md:p-2 lg:p-2 bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
