'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate login
    setTimeout(() => {
      setIsLoading(false)
      // In production, this would authenticate and redirect to /admin
      window.location.href = '/admin'
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Logo & Title */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6">
            <h1 className="font-serif text-3xl font-bold text-zinc-900">Yaseen Fabrics</h1>
          </Link>
          <p className="text-zinc-600 text-lg mb-2">Admin Dashboard</p>
          <p className="text-zinc-500 text-sm">Sign in to manage your business</p>
        </div>

        {/* Login Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6 bg-white rounded-lg p-8 border border-zinc-200"
        >
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-zinc-900">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@yaseen.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-zinc-300 focus:border-rose-900 focus:ring-rose-900/20"
            />
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-zinc-900">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-zinc-300 focus:border-rose-900 focus:ring-rose-900/20 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-700"
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#720026] hover:bg-[#5a001e] text-white py-3 font-medium transition-all duration-300"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <Link href="#" className="text-sm text-rose-900 hover:text-rose-950 transition-colors duration-300">
              Forgot your password?
            </Link>
          </div>
        </motion.form>

        {/* Footer Note */}
        <p className="text-center text-xs text-zinc-500 mt-8">
          Protected Admin Area. Unauthorized access is prohibited.
        </p>
      </motion.div>
    </div>
  )
}
