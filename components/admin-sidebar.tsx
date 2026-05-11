'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutGrid,
  ShoppingCart,
  Package,
  Layers,
  BookOpen,
  Users,
  Tag,
  Settings,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react'
import Link from 'next/link'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getEnquiryUnreadCount } from '@/lib/api'

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutGrid },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: Layers },
  { label: 'Blog', href: '/admin/blog', icon: BookOpen },
  { label: 'Enquiries', href: '/admin/enquiries', icon: Inbox },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Promo Codes', href: '/admin/promo-codes', icon: Tag },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

interface AdminSidebarProps {
  onLinkClick?: () => void
}

export function AdminSidebar({ onLinkClick }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [activeLink, setActiveLink] = useState('/admin')
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchCount = () => {
      getEnquiryUnreadCount()
        .then((res) => setUnreadCount(res.count))
        .catch(() => {})
    }
    fetchCount()
    const interval = setInterval(fetchCount, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <TooltipProvider>
      <motion.div
        initial={{ width: 256 }}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-white border-r border-zinc-200 h-screen flex flex-col p-6 fixed left-0 top-0"
      >
        {/* Logo */}
        <Link href="/admin" className="mb-12 block overflow-hidden">
          <motion.div
            animate={{ opacity: isCollapsed ? 0 : 1, height: isCollapsed ? 0 : 'auto' }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="font-serif text-xl font-bold text-zinc-900 whitespace-nowrap">
              Yaseen Fabrics
            </h1>
            <p className="text-xs text-zinc-500 mt-1 whitespace-nowrap">Admin Dashboard</p>
          </motion.div>

          {/* Collapsed Logo Icon */}
          {isCollapsed && (
            <div className="flex items-center justify-center w-full">
              <div className="w-8 h-8 rounded-lg bg-rose-900/20 flex items-center justify-center">
                <span className="text-rose-900 font-bold text-sm">YF</span>
              </div>
            </div>
          )}
        </Link>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeLink === item.href
            const IconComponent = item.icon

            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    onClick={() => {
                      setActiveLink(item.href)
                      onLinkClick?.()
                    }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'bg-rose-900/10 text-rose-900'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <div className="relative flex-shrink-0">
                      <IconComponent size={20} />
                      {item.href === '/admin/enquiries' && unreadCount > 0 && isCollapsed && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-0.5 bg-rose-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="font-medium text-sm whitespace-nowrap flex-1 flex items-center justify-between"
                      >
                        {item.label}
                        {item.href === '/admin/enquiries' && unreadCount > 0 && (
                          <span className="ml-2 min-w-[20px] h-5 px-1 bg-rose-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </motion.span>
                    )}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="bg-zinc-900 text-white border-0">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-zinc-200 pt-4 space-y-4">
          {/* Collapse Toggle */}
          <motion.button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-all duration-300 ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight size={20} />
            ) : (
              <>
                <ChevronLeft size={20} />
                <span className="text-sm font-medium whitespace-nowrap">Collapse</span>
              </>
            )}
          </motion.button>

          {/* Copyright */}
          {!isCollapsed && (
            <p className="text-xs text-zinc-500 text-center">Yaseen Fabrics © 2024</p>
          )}
        </div>
      </motion.div>
    </TooltipProvider>
  )
}
