'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  ChartBarIcon, 
  CogIcon, 
  MapIcon, 
  DocumentChartBarIcon,
  BoltIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: ChartBarIcon },
  // { name: 'Country Analysis', href: '/countries', icon: MapIcon },
  // { name: 'Comparisons', href: '/compare', icon: DocumentChartBarIcon },
  // { name: 'ETL Pipelines', href: '/pipelines', icon: BoltIcon },
  // { name: 'Settings', href: '/settings', icon: CogIcon },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="bg-gray-900 min-h-0 flex-1 flex flex-col">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
            <h1 className="text-white text-xl font-bold">Kilwa Analytics</h1>
          </div>
          
          {/* Navigation */}
          <nav className="mt-5 px-2 space-y-1 flex-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <div className="bg-gray-900 px-4 py-2 flex justify-between items-center">
          <h1 className="text-white text-lg font-bold">Kilwa Analytics</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-400 hover:text-white"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="bg-gray-900 px-2 py-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md',
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}