'use client'

import { useState } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import MarketsContent from '@/components/markets/MarketsContent'

export default function MarketsPage() {
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
        
        {/* Markets Content Area - Scrollable */}
        <div className="flex-1 overflow-auto">
          <MarketsContent />
        </div>
      </div>
    </div>
  )
}