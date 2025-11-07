'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

interface MenuItem {
  id: string
  label: string
  iconSrc?: string // Optional image path
  iconSrcActive?: string // Active state icon
  iconEmoji?: string // Fallback emoji
  href: string
  active?: boolean
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  
  const menuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      iconSrc: '/assets/hom.svg',
      iconSrcActive: '/assets/home-fill.svg',
      iconEmoji: '🏠',
      href: '/dashboard'
    },
    {
      id: 'markets',
      label: 'Markets',
      iconSrc: '/assets/market.svg',
      iconSrcActive: '/assets/market-filled.svg',
      iconEmoji: '📈',
      href: '/markets'
    },
    {
      id: 'isi',
      label: 'ISI',
      iconSrc: '/assets/isi.svg',
      iconSrcActive: '/assets/isi-fill.svg',
      iconEmoji: '📊',
      href: '/isi'
    },
    { 
      id: 'meti', 
      label: 'METI', 
      iconSrc: '/assets/meti.svg',
      iconEmoji: '⏱', 
      href: '/meti' 
    },
    { 
      id: 'sentiment', 
      label: 'Sentiment Pulse', 
      iconSrc: '/assets/sentiment.svg',
      iconEmoji: '📡', 
      href: '/sentiment' 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      iconSrc: '/assets/settings.svg',
      iconEmoji: '⚙️', 
      href: '/settings' 
    },
  ]

  const IconComponent = ({ item, isActive }: { item: MenuItem, isActive?: boolean }) => {
    // Use filled icon when active, otherwise use regular icon
    const iconToUse = isActive && item.iconSrcActive ? item.iconSrcActive : item.iconSrc

    return (
      <>
        {iconToUse ? (
          <>
            <Image
              src={iconToUse}
              alt={`${item.label} icon`}
              width={24}
              height={24}
              className={` w-6 h-6 flex-shrink-0 transition-all ${isActive ? 'brightness-0 invert' : 'group-hover:brightness-0 group-hover:invert'}`}
              onError={(e) => {
                // Hide image on error and show emoji fallback
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                const fallback = parent?.querySelector('.emoji-fallback') as HTMLElement
                if (fallback) fallback.style.display = 'inline'
              }}
            />
            <span className="text-lg flex-shrink-0 emoji-fallback" style={{ display: 'none' }}>
              {item.iconEmoji}
            </span>
          </>
        ) : (
          <span className="text-lg flex-shrink-0">{item.iconEmoji}</span>
        )}
      </>
    )
  }

  return (
    <div className={`bg-[#1E1E1E] text-white transition-all duration-300 flex flex-col ${isCollapsed ? 'w-16' : 'w-64'} ${isCollapsed ? 'md:w-16' : 'md:w-64'} hidden md:flex border-r border-[#4B4B4B] relative`}>
      {/* Header */}
      <div className="px-4 border-b border-gray-700 relative flex items-center h-[84px]">
        <div className="flex items-center justify-center w-full">
          {isCollapsed ? (
            <Image
              src="/assets/kilwa-mini.svg"
              alt="Kilwa Mini"
              width={20}
              height={20}
              className="object-contain"
            />
          ) : (
            <Image
              src="/assets/kilwa-logo-dash.svg"
              alt="Kilwa"
              width={80}
              height={32}
              className="object-contain"
            />
          )}
        </div>

        {/* Toggle Button - positioned on the bottom border of header */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center border border-gray-300 z-10"
        >
          <svg 
            className={`w-4 h-4 text-gray-700 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12H5m0 0l7 7m-7-7l7-7" />
          </svg>
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center px-3 py-3 rounded-lg transition-colors group relative ${
                  pathname === item.href 
                    ? 'bg-[#323131] text-white' 
                    : 'text-[#989898] hover:bg-[#323131] hover:text-[#E5E5E5]'
                }`}
              >
                <div className="flex items-center justify-center w-5 h-5">
                  <IconComponent item={item} isActive={pathname === item.href} />
                </div>
                {!isCollapsed && (
                  <span className="ml-3 text-[16px] font-medium">{item.label}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-16 bg-gray-800 text-white px-2 py-1 rounded-md text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

 
    </div>
  )
}