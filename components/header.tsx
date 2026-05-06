'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react'
import { useCart } from '@/context/cart-context'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'

// Announcement Bar Component
function AnnouncementBar() {
  return (
    <div className="bg-zinc-900 text-white text-sm py-3 overflow-hidden">
      <motion.div
        className="flex gap-8"
        animate={{ x: [0, -1000] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      >
        {[0, 1, 2].map((i) => (
          <span key={i} className="whitespace-nowrap">
            ✦ Free Shipping Nationwide ✦ Limited Time Sale ✦ New Arrivals Live ✦
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// Navbar Component
function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { setIsOpen, items } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Collections', href: '/shop' },
    { label: 'Best Sellers', href: '/shop' },
    { label: 'Style Guides', href: '#guides' },
    { label: 'About', href: '#' },
  ]

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'backdrop-blur-md bg-white/80 shadow-sm'
          : 'backdrop-blur-md bg-white/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="font-serif text-xl font-bold text-zinc-900 hover:text-rose-900 transition-colors duration-300">
            Yaseen Fabrics
          </Link>

          {/* Navigation Links - Hidden on Mobile */}
          <div className="hidden md:flex gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Icons */}
          <div className="flex items-center gap-4 md:gap-6">
            <button className="text-zinc-900 hover:text-rose-900 transition-colors duration-300">
              <Search size={20} />
            </button>
            <button className="text-zinc-900 hover:text-rose-900 transition-colors duration-300">
              <User size={20} />
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="relative text-zinc-900 hover:text-rose-900 transition-colors duration-300"
            >
              <ShoppingBag size={20} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-900 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {items.length}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <button className="text-zinc-900 hover:text-rose-900 transition-colors duration-300">
                  <Menu size={20} />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-zinc-50">
                <div className="space-y-8 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-lg text-zinc-900 hover:text-rose-900 font-medium transition-colors duration-300"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

export function Header() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
    </>
  )
}
