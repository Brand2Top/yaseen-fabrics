'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ShieldCheck, User, KeyRound, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { changePassword, logoutAll } from '@/lib/api'
import {
  getAdminUser,
  clearAdminSession,
  type AdminUser,
} from '@/lib/auth'

// ─── Password strength checker ────────────────────────────────────────────────

function checkStrength(p: string) {
  return {
    length: p.length >= 8,
    upper: /[A-Z]/.test(p),
    lower: /[a-z]/.test(p),
    number: /[0-9]/.test(p),
    symbol: /[^A-Za-z0-9]/.test(p),
  }
}

const REQUIREMENTS = [
  { key: 'length', label: 'At least 8 characters' },
  { key: 'upper', label: 'One uppercase letter' },
  { key: 'lower', label: 'One lowercase letter' },
  { key: 'number', label: 'One number' },
  { key: 'symbol', label: 'One special character' },
] as const

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null
  const checks = checkStrength(password)
  const passed = Object.values(checks).filter(Boolean).length

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i < passed
                ? passed <= 2
                  ? 'bg-red-500'
                  : passed <= 3
                  ? 'bg-amber-400'
                  : 'bg-green-500'
                : 'bg-zinc-200'
            }`}
          />
        ))}
      </div>
      <ul className="space-y-0.5">
        {REQUIREMENTS.map(({ key, label }) => (
          <li
            key={key}
            className={`text-xs flex items-center gap-1.5 ${
              checks[key] ? 'text-green-600' : 'text-zinc-400'
            }`}
          >
            <span className="text-[10px]">{checks[key] ? '✓' : '○'}</span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Change Password Card ─────────────────────────────────────────────────────

function ChangePasswordCard() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNext, setShowNext] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    if (next !== confirm) {
      setFieldErrors({ password_confirmation: ['Passwords do not match'] })
      return
    }

    setSubmitting(true)
    try {
      const res = await changePassword({
        current_password: current,
        password: next,
        password_confirmation: confirm,
      })
      toast.success(res.message ?? 'Password updated successfully.')
      setCurrent('')
      setNext('')
      setConfirm('')
    } catch (err: unknown) {
      if (err instanceof Error) {
        const asValidation = err as Error & { errors?: Record<string, string[]> }
        if (asValidation.errors) {
          setFieldErrors(asValidation.errors)
          toast.error(err.message)
        } else {
          toast.error(err.message)
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  const FieldError = ({ field }: { field: string }) => {
    const msgs = fieldErrors[field]
    if (!msgs?.length) return null
    return (
      <ul className="mt-1 space-y-0.5">
        {msgs.map((m) => (
          <li key={m} className="text-xs text-red-600">{m}</li>
        ))}
      </ul>
    )
  }

  return (
    <Card className="bg-white border-zinc-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <KeyRound size={18} className="text-rose-900" />
          <CardTitle className="text-lg">Change Password</CardTitle>
        </div>
        <CardDescription>
          Use a strong password with a mix of letters, numbers, and symbols.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-sm">
          {/* Current password */}
          <div>
            <Label className="text-sm font-medium">Current Password</Label>
            <div className="relative mt-1">
              <Input
                type={showCurrent ? 'text' : 'password'}
                value={current}
                onChange={(e) => setCurrent(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Your current password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <FieldError field="current_password" />
          </div>

          <Separator />

          {/* New password */}
          <div>
            <Label className="text-sm font-medium">New Password</Label>
            <div className="relative mt-1">
              <Input
                type={showNext ? 'text' : 'password'}
                value={next}
                onChange={(e) => setNext(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="New password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNext((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                {showNext ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <PasswordStrength password={next} />
            <FieldError field="password" />
          </div>

          {/* Confirm password */}
          <div>
            <Label className="text-sm font-medium">Confirm New Password</Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Repeat new password"
              className="mt-1"
            />
            {confirm && next && confirm !== next && (
              <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
            )}
            <FieldError field="password_confirmation" />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="bg-rose-900 hover:bg-rose-950 text-white"
          >
            {submitting ? 'Updating…' : 'Update Password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

// ─── Sessions Card ────────────────────────────────────────────────────────────

function SessionsCard() {
  const router = useRouter()
  const [revoking, setRevoking] = useState(false)

  const handleLogoutAll = async () => {
    setRevoking(true)
    try {
      await logoutAll()
      toast.success('All other sessions have been revoked.')
      // Current session is also revoked by logoutAll, so sign out locally too
      clearAdminSession()
      router.replace('/admin/login')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to revoke sessions.')
    } finally {
      setRevoking(false)
    }
  }

  return (
    <Card className="bg-white border-zinc-200">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-rose-900" />
          <CardTitle className="text-lg">Active Sessions</CardTitle>
        </div>
        <CardDescription>
          Sign out of all other devices and browser sessions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-600 max-w-prose">
          If you believe your account has been compromised, or you want to sign out of all other
          devices, click the button below. This revokes every active token except your current
          session.
        </p>
        <Button
          variant="outline"
          onClick={handleLogoutAll}
          disabled={revoking}
          className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-400 gap-2"
        >
          <LogOut size={15} />
          {revoking ? 'Revoking…' : 'Logout All Devices'}
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [user, setUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    setUser(getAdminUser())
  }, [])

  const formatDate = (iso?: string | null) => {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-2xl"
    >
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Settings</h1>
        <p className="text-zinc-600 mt-2 text-sm">Manage your account and security preferences.</p>
      </div>

      {/* Account Info */}
      <Card className="bg-white border-zinc-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User size={18} className="text-rose-900" />
            <CardTitle className="text-lg">Account</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between items-center py-2 border-b border-zinc-100">
              <dt className="text-zinc-500">Name</dt>
              <dd className="font-medium text-zinc-900">{user?.name ?? '—'}</dd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-100">
              <dt className="text-zinc-500">Email</dt>
              <dd className="font-medium text-zinc-900">{user?.email ?? '—'}</dd>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-zinc-100">
              <dt className="text-zinc-500">Last login</dt>
              <dd className="text-zinc-700">{formatDate(user?.last_login_at)}</dd>
            </div>
            <div className="flex justify-between items-center py-2">
              <dt className="text-zinc-500">Member since</dt>
              <dd className="text-zinc-700">{formatDate(user?.created_at)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <ChangePasswordCard />

      <SessionsCard />
    </motion.div>
  )
}
