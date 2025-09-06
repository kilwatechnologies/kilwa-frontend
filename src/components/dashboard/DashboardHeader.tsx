'use client'

import Image from 'next/image'
import { useState } from 'react'

interface DashboardHeaderProps {
  userName: string
  onMobileMenuToggle?: () => void
}

export default function DashboardHeader({ userName, onMobileMenuToggle }: DashboardHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="bg-black border-b border-gray-700 px-6 py-6">
      <div className="flex items-center justify-between">
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
              Welcome, {userName}
            </h1>
          
          </div>
        </div>

        {/* Right side - Search and Profile */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search ISI scores, signals, or insights"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 bg-transparent border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
            />
          </div>

          {/* Ask Zawadi AI Button */}
          <button className="flex items-center px-4 py-2 bg-transparent text-white rounded-lg border  transition-colors text-sm">
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
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="ml-3 text-right">
              <div className="text-sm font-medium text-white">{userName}</div>
              <div className="text-xs text-gray-300 mr-1.5">Premium</div>
            </div>
            <svg className="ml-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </header>
  )
}