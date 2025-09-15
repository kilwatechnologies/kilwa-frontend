'use client'

import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import ISIContent from '@/components/isi/ISIContent'

export default function ISIPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="h-screen flex bg-black overflow-hidden">
      {/* Sidebar - Fixed */}
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header - Fixed */}
        <DashboardHeader userName="Rachel T" />
        
        {/* ISI Content Area - Scrollable */}
        <div className="flex-1 overflow-auto">
          <ISIContent />
        </div>
      </div>
    </div>
  )
}