'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Eye, EyeOff, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminLogin } from '@/lib/api'
import { setAdminSession, getDeviceName } from '@/lib/auth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [retryAfter, setRetryAfter] = useState(0) // seconds remaining on rate-limit

  // Countdown timer for rate-limited state
  useEffect(() => {
    if (retryAfter <= 0) return
    const id = setInterval(() => {
      setRetryAfter((s) => {
        if (s <= 1) { clearInterval(id); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [retryAfter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (retryAfter > 0) return
    setIsLoading(true)
    setError(null)

    try {
      const deviceName = getDeviceName()
      const res = await adminLogin(email, password, deviceName)
      setAdminSession(res.token, res.user)
      router.replace('/admin')
    } catch (err: unknown) {
      if (err instanceof Error) {
        const asRateLimit = err as Error & { retryAfter?: number }
        if (asRateLimit.retryAfter) {
          setRetryAfter(asRateLimit.retryAfter)
          setError(`Too many attempts. Try again in ${asRateLimit.retryAfter}s.`)
        } else {
          setError(err.message || 'Invalid credentials. Please try again.')
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isDisabled = isLoading || retryAfter > 0

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6">
            <h1 className="font-serif text-3xl font-bold text-zinc-900">Yaseen Fabrics</h1>
          </Link>
          <p className="text-zinc-600 text-lg mb-2">Admin Dashboard</p>
          <p className="text-zinc-500 text-sm">Sign in to manage your business</p>
        </div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6 bg-white rounded-lg p-8 border border-zinc-200"
        >
          {error && (
            <div
              className={`border text-sm px-4 py-3 rounded flex items-start gap-2 ${
                retryAfter > 0
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
            >
              {retryAfter > 0 && <Clock size={15} className="mt-0.5 flex-shrink-0" />}
              <span>
                {retryAfter > 0
                  ? `Too many attempts. Try again in ${retryAfter}s.`
                  : error}
              </span>
            </div>
          )}

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
              disabled={isDisabled}
              autoComplete="email"
              className="border-zinc-300 focus:border-rose-900 focus:ring-rose-900/20"
            />
          </div>

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
                disabled={isDisabled}
                autoComplete="current-password"
                className="border-zinc-300 focus:border-rose-900 focus:ring-rose-900/20 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isDisabled}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-700 disabled:opacity-50"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isDisabled}
            className="w-full bg-[#720026] hover:bg-[#5a001e] text-white py-3 font-medium transition-all duration-300 disabled:opacity-60"
          >
            {isLoading ? 'Signing In…' : retryAfter > 0 ? `Retry in ${retryAfter}s` : 'Sign In'}
          </Button>
        </motion.form>

        <p className="text-center text-xs text-zinc-500 mt-8">
          Protected Admin Area. Unauthorized access is prohibited.
        </p>
      </motion.div>
    </div>
  )
}
