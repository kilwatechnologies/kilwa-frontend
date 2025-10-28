'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import ZwadiAIModal from './ZwadiAIModal'

interface DashboardHeaderProps {
  userName: string
  userInitials?: string
  truncatedName?: string
  onMobileMenuToggle?: () => void
  profilePicture?: string
  userPlan?: string
}

export default function DashboardHeader({ userName, userInitials, truncatedName, onMobileMenuToggle, profilePicture, userPlan = 'free' }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showZwadiModal, setShowZwadiModal] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    // Clear any stored tokens or user data
    localStorage.clear()
    sessionStorage.clear()
    // Redirect to home/login page
    window.location.href = '/'
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="bg-black border-b border-gray-700 px-6 h-[84px] flex items-center">
      <div className="flex items-center justify-between w-full">
        {/* Mobile menu button + Title */}
        <div className="flex items-center">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden p-2 hover:bg-gray-800 rounded-lg mr-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-semibold text-white">
              Welcome, {truncatedName}
            </h1>
          
          </div>
        </div>

        {/* Right side - Search and Profile */}
        <div className="flex items-center space-x-4">
          {/* Search */}
   

          {/* Ask Zawadi AI Button */}
          <button
            onClick={() => setShowZwadiModal(true)}
            className="flex items-center px-4 py-2 bg-transparent text-white rounded-lg border  transition-colors text-sm"
          >
            <Image
              src="/assets/zwadi.svg"
              alt="Kilwa Mini"
              width={20}
              height={20}
              className="object-contain mr-2"
            />
            <span className="hidden sm:inline">Ask Zawadi AI</span>
            <span className="sm:hidden">AI</span>
          </button>

          {/* User Profile */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center hover:bg-gray-800 rounded-lg px-3 py-2 transition-colors"
            >
              {profilePicture ? (
                <img
                  src={profilePicture}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-orange-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {userInitials || userName.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="ml-3 text-right">
                <div className="text-sm font-medium text-white">{truncatedName || userName}</div>
                <div className="text-xs text-gray-300 mr-1.5 capitalize">{userPlan}</div>
              </div>
              <svg
                className={`ml-2 w-4 h-4 text-gray-400 transition-transform ${showUserDropdown ? 'rotate-180' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50">
                <div className="py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Zwadi AI Modal */}
      <ZwadiAIModal
        isOpen={showZwadiModal}
        onClose={() => setShowZwadiModal(false)}
      />
    </header>
  )
}