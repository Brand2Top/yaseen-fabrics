'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { CheckCircle, Loader2, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { useCart } from '@/context/cart-context'
import { checkout } from '@/lib/api'
import type { CheckoutCustomer, CheckoutResponse } from '@/lib/types'

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormFields {
  name: string
  email: string
  phone: string
  address: string
}

type FormErrors = Partial<Record<keyof FormFields, string>>

const EMPTY_FORM: FormFields = { name: '', email: '', phone: '', address: '' }

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, total, coupon, clearCart } = useCart()

  const [form, setForm] = useState<FormFields>(EMPTY_FORM)
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [orderResult, setOrderResult] = useState<CheckoutResponse | null>(null)

  // Redirect to shop if cart is empty
  useEffect(() => {
    if (items.length === 0 && !orderResult) {
      router.replace('/shop')
    }
  }, [items.length, orderResult, router])

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const set = <K extends keyof FormFields>(key: K, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const validate = (): boolean => {
    const next: FormErrors = {}
    if (!form.name.trim()) next.name = 'Full name is required'
    if (!form.email.trim()) {
      next.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = 'Enter a valid email address'
    }
    if (!form.phone.trim()) next.phone = 'Phone number is required'
    if (!form.address.trim()) next.address = 'Delivery address is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const placeOrder = async () => {
    if (!validate()) return

    setSubmitting(true)
    try {
      const customer: CheckoutCustomer = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      }
      const result = await checkout({
        customer,
        items: items.map((i) => ({
          product_id: i.product_id,
          product_variant_id: i.product_variant_id ?? null,
          quantity: i.quantity,
        })),
        shipping_method: 'Standard Delivery',
        shipping_cost: 0,
        ...(coupon?.code ? { coupon_code: coupon.code } : {}),
      })
      clearCart()
      setOrderResult(result)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    placeOrder()
  }

  // ─── Input class helper ────────────────────────────────────────────────────

  const inputCls = (field: keyof FormFields) =>
    `w-full px-3.5 py-2.5 text-sm border rounded-lg bg-white text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 transition-colors ${
      errors[field] ? 'border-red-400' : 'border-zinc-200'
    }`

  // ─── Success state ─────────────────────────────────────────────────────────

  if (orderResult) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-zinc-200 rounded-xl p-8 sm:p-12 max-w-md w-full text-center shadow-sm"
        >
          <div className="flex justify-center mb-5">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle size={40} className="text-green-600" />
            </div>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-zinc-500 text-sm mb-8">
            Order #{orderResult.order_id}
          </p>

          {/* Final amounts */}
          <div className="space-y-2 text-sm mb-8 border-t border-zinc-100 pt-6">
            <div className="flex justify-between">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-medium text-zinc-900">
                Rs {orderResult.subtotal.toLocaleString()}
              </span>
            </div>

            {orderResult.discount_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-zinc-500">Discount</span>
                <span className="font-medium text-green-700">
                  − Rs {orderResult.discount_amount.toLocaleString()}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-zinc-500">Shipping</span>
              <span className="font-medium text-zinc-900">Free</span>
            </div>

            <div className="flex justify-between pt-3 border-t border-zinc-100 mt-2">
              <span className="font-semibold text-zinc-900">Total</span>
              <span className="font-serif font-bold text-xl text-zinc-900">
                Rs {orderResult.total_amount.toLocaleString()}
              </span>
            </div>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-rose-900 hover:bg-rose-950 rounded-lg transition-colors w-full"
          >
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    )
  }

  // ─── Main checkout layout ──────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page title */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest text-rose-900 uppercase mb-2">
            Checkout
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
            Complete Your Order
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-8 gap-8 items-start">
          {/* ─── Left: Customer Details (5/8) ─────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-5"
          >
            <form onSubmit={handleSubmit} noValidate>
              <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-zinc-900 mb-6">
                  Customer Details
                </h2>

                <div className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                      Full Name <span className="text-rose-900">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      placeholder="Muhammad Ali"
                      className={inputCls('name')}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                      Email <span className="text-rose-900">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      placeholder="you@example.com"
                      className={inputCls('email')}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                      Phone <span className="text-rose-900">*</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="+92 300 1234567"
                      className={inputCls('phone')}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-xs text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-900 mb-1.5">
                      Delivery Address <span className="text-rose-900">*</span>
                    </label>
                    <textarea
                      value={form.address}
                      onChange={(e) => set('address', e.target.value)}
                      placeholder="House #, Street, City, Province"
                      rows={3}
                      className={`${inputCls('address')} resize-none`}
                    />
                    {errors.address && (
                      <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Place Order — visible on mobile below the form card */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-white bg-rose-900 hover:bg-rose-950 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed lg:hidden"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Placing Order…
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </form>
          </motion.div>

          {/* ─── Right: Order Summary (3/8) ────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="lg:col-span-3 lg:sticky lg:top-24"
          >
            <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="font-serif text-xl font-bold text-zinc-900">
                Order Summary
              </h2>

              {/* Cart items */}
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded flex-shrink-0 bg-zinc-100"
                        unoptimized
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-zinc-100 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 line-clamp-2">
                        {item.name}
                      </p>
                      {item.length && (
                        <p className="text-xs text-zinc-500 mt-0.5">{item.length}</p>
                      )}
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {item.quantity} × Rs {item.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-zinc-900 flex-shrink-0">
                      Rs {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-zinc-200" />

              {/* Coupon badge */}
              {coupon && coupon.valid && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-sm">
                  <Tag size={14} className="text-green-700 flex-shrink-0" />
                  <span className="font-medium text-green-800">{coupon.code}</span>
                  {coupon.description && (
                    <span className="text-green-700 truncate">{coupon.description}</span>
                  )}
                </div>
              )}

              {/* Cost breakdown */}
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Subtotal</span>
                  <span className="font-medium text-zinc-900">
                    Rs {subtotal.toLocaleString()}
                  </span>
                </div>

                {coupon && coupon.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Discount</span>
                    <span className="font-medium text-green-700">
                      − Rs {coupon.discountAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-zinc-500">Shipping</span>
                  <span className="font-medium text-green-700">Free</span>
                </div>
              </div>

              <div className="border-t border-zinc-200" />

              {/* Total */}
              <div className="flex justify-between items-center">
                <span className="font-serif text-base font-semibold text-zinc-900">Total</span>
                <span className="font-serif text-2xl font-bold text-zinc-900">
                  Rs {total.toLocaleString()}
                </span>
              </div>

              {/* Place Order button — desktop */}
              <button
                type="button"
                disabled={submitting}
                onClick={placeOrder}
                className="hidden lg:flex w-full items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-white bg-rose-900 hover:bg-rose-950 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Placing Order…
                  </>
                ) : (
                  'Place Order'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
