'use client'

import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import MarketsContent from '@/components/markets/MarketsContent'

export default function MarketsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    const email = localStorage.getItem('user_email') || localStorage.getItem('userEmail') || 'user@example.com'
    setUserEmail(email)
  }, [])

  const getUsernameFromEmail = (email: string) => {
    if (!email || !email.includes('@')) return 'User'
    const [localPart] = email.split('@')
    return localPart
  }

  const getInitialsFromEmail = (email: string) => {
    if (!email || !email.includes('@')) return 'US'
    const [localPart] = email.split('@')
    return localPart.slice(0, 2).toUpperCase()
  }

  const getTruncatedUsername = (email: string) => {
    const username = getUsernameFromEmail(email)
    return username.length > 5 ? username.slice(0, 5) + '...' : username
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
          userName={getUsernameFromEmail(userEmail)}
          userInitials={getInitialsFromEmail(userEmail)}
          truncatedName={getTruncatedUsername(userEmail)}
        />

        {/* Markets Content Area - Scrollable */}
        <div className="flex-1 overflow-auto">
          <MarketsContent />
        </div>
      </div>
    </div>
  )
}