'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, Search, Bell, User, LogOut } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AdminSidebar } from '@/components/admin-sidebar'
import { getAdminToken, getAdminUser, clearAdminSession, type AdminUser } from '@/lib/auth'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === '/admin/login'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [user, setUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    if (isLoginPage) return

    const token = getAdminToken()
    if (!token) {
      router.replace('/admin/login')
      return
    }
    setUser(getAdminUser())
    setAuthChecked(true)
  }, [isLoginPage, router])

  const handleLogout = () => {
    clearAdminSession()
    router.replace('/admin/login')
  }

  if (isLoginPage) return <>{children}</>

  // Blank screen while we check localStorage to avoid flash
  if (!authChecked) {
    return <div className="min-h-screen bg-zinc-50" />
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
            {/* Mobile Menu */}
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

            {/* Search */}
            <div className="hidden sm:flex flex-1 mx-4 max-w-md">
              <div className="relative w-full">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <Input
                  type="text"
                  placeholder="Search orders, customers..."
                  className="pl-10 bg-zinc-50 border-zinc-200 text-sm"
                />
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-4">
              <button className="relative text-zinc-600 hover:text-zinc-900 transition-colors">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-900 rounded-full" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 text-zinc-900 hover:text-rose-900 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-rose-900/20 flex items-center justify-center">
                      <User size={16} className="text-rose-900" />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium">
                      {user?.name ?? 'Admin'}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {user?.email && (
                    <>
                      <div className="px-3 py-2">
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut size={14} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
