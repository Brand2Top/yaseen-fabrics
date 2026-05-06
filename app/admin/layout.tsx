'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Search, Bell, User } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AdminSidebar } from '@/components/admin-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Show login page without sidebar/header
  if (isLoginPage) {
    return children
  }

  return (
    <div className="flex h-screen bg-zinc-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed w-64 h-screen left-0 top-0 z-50">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-zinc-200 sticky top-0 z-40">
          <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Left: Mobile Menu Button */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu size={24} className="text-zinc-900" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0 bg-white">
                <AdminSidebar onLinkClick={() => setIsMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* Center: Search Bar */}
            <div className="hidden sm:flex flex-1 mx-4 max-w-md">
              <div className="relative w-full">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search orders, customers..."
                  className="pl-10 bg-zinc-50 border-zinc-200 text-sm"
                />
              </div>
            </div>

            {/* Right: Icons & User Menu */}
            <div className="flex items-center gap-4">
              {/* Notification Bell */}
              <button className="relative text-zinc-600 hover:text-zinc-900 transition-colors duration-300">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-900 rounded-full" />
              </button>

              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 text-zinc-900 hover:text-rose-900 transition-colors duration-300">
                    <div className="w-8 h-8 rounded-full bg-rose-900/20 flex items-center justify-center">
                      <User size={16} className="text-rose-900" />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">Admin</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Account Settings</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
