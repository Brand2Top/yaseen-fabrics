'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Plus, Minus, Tag, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useCart } from '@/context/cart-context'
import { toast } from 'sonner'

export function CartSidebar() {
  const {
    isOpen, setIsOpen,
    items, updateQuantity, removeItem,
    subtotal, total, coupon, couponLoading, applyCoupon, clearCoupon,
  } = useCart()

  const [couponInput, setCouponInput] = useState('')

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return
    try {
      await applyCoupon(couponInput)
      setCouponInput('')
      toast.success('Coupon applied!')
    } catch (err) {
      const e = err as Error
      toast.error(e.message || 'Invalid coupon code')
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:w-96 bg-white p-0 flex flex-col" side="right">
        <SheetHeader className="border-b border-zinc-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-serif text-xl">Your Cart</SheetTitle>
            <span className="text-sm text-zinc-600 font-normal">
              {items.length} item{items.length !== 1 ? 's' : ''}
            </span>
          </div>
        </SheetHeader>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-zinc-600 mb-4">Your cart is empty</p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-zinc-900 hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <motion.div className="space-y-6">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-4 pb-6 border-b border-zinc-100"
                >
                  <div className="flex-shrink-0 w-20 h-20 bg-zinc-100 rounded-lg overflow-hidden">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-zinc-900 text-sm mb-1 line-clamp-2">
                      {item.name}
                    </h3>
                    {item.length && (
                      <p className="text-xs text-zinc-500 mb-2">Length: {item.length}m</p>
                    )}
                    <p className="font-serif text-sm text-zinc-900 font-semibold">
                      Rs {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-zinc-400 hover:text-red-600 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-1 bg-zinc-100 rounded">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-zinc-600 hover:text-zinc-900"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-sm font-medium text-zinc-900 w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-zinc-600 hover:text-zinc-900"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-zinc-200 bg-white p-6 space-y-4"
          >
            {/* Coupon */}
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-green-700" />
                  <div>
                    <p className="text-xs font-semibold text-green-800">{coupon.code}</p>
                    <p className="text-xs text-green-600">{coupon.description}</p>
                  </div>
                </div>
                <button onClick={clearCoupon} className="text-green-600 hover:text-green-800">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="Promo code"
                  className="flex-1 px-3 py-2 border border-zinc-300 rounded text-sm placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                  className="px-4 py-2 text-sm font-medium text-zinc-900 border border-zinc-300 rounded hover:bg-zinc-50 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {couponLoading ? <Loader2 size={12} className="animate-spin" /> : null}
                  Apply
                </button>
              </div>
            )}

            {/* Breakdown */}
            <div className="space-y-2 py-3 border-t border-zinc-200">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Subtotal</span>
                <span className="font-medium text-zinc-900">Rs {subtotal.toLocaleString()}</span>
              </div>
              {coupon && coupon.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-green-700">Discount ({coupon.code})</span>
                  <span className="font-medium text-green-700">−Rs {coupon.discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600">Shipping</span>
                <span className="font-medium text-green-700">Free</span>
              </div>
            </div>

            <div className="flex justify-between py-3 border-t border-zinc-200">
              <span className="font-serif text-lg text-zinc-900">Total</span>
              <span className="font-serif text-lg font-bold text-zinc-900">
                Rs {total.toLocaleString()}
              </span>
            </div>

            <Link href="/checkout" onClick={() => setIsOpen(false)}>
              <Button className="w-full bg-rose-900 text-white hover:bg-rose-950">
                Proceed to Checkout
              </Button>
            </Link>

            <button
              onClick={() => setIsOpen(false)}
              className="w-full py-2 text-zinc-900 font-medium hover:text-zinc-600 transition-colors text-sm"
            >
              Continue Shopping
            </button>
          </motion.div>
        )}
      </SheetContent>
    </Sheet>
  )
}
