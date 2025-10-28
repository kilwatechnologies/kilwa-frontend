'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import METIContent from '@/components/meti/METIContent'
import { loadUserData, getFormattedName, getUserInitials, getUsernameFromEmail, type UserData } from '@/lib/userUtils'

export default function METIPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed')
      return saved ? JSON.parse(saved) : false
    }
    return false
  })
  const [userData, setUserData] = useState<UserData>({ email: '', firstName: '', lastName: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed))
  }, [sidebarCollapsed])

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await loadUserData()
      setUserData(data)
      setLoading(false)
    }
    fetchUserData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

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
          profilePicture={userData.profilePicture}
        />
        
     

        {/* METI Content Area - Scrollable */}
        <div className="flex-1 overflow-auto">
          <METIContent />
        </div>
      </div>
    </div>
  )
}
