'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import ISIContent from '@/components/isi/ISIContent'
import { loadUserData, getFormattedName, getUserInitials, getUsernameFromEmail, type UserData } from '@/lib/userUtils'

export default function ISIPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userData, setUserData] = useState<UserData>({ email: '', firstName: '', lastName: '' })

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await loadUserData()
      setUserData(data)
    }
    fetchUserData()
  }, [])

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
        <DashboardHeader
          userName={getUsernameFromEmail(userData.email)}
          userInitials={getUserInitials(userData)}
          truncatedName={getFormattedName(userData)}
        />

        {/* ISI Content Area - Scrollable */}
        <div className="flex-1 overflow-auto">
          <ISIContent />
        </div>
      </div>
    </div>
  )
}