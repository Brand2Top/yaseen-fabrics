'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { validateCoupon } from '@/lib/api'

export interface CartItem {
  id: string
  product_id: number
  product_variant_id?: number | null
  name: string
  price: number
  quantity: number
  image?: string
  variantLabel?: string
}

interface CouponState {
  code: string
  description: string
  discountAmount: number
  valid: boolean
}

interface CartContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  subtotal: number
  coupon: CouponState | null
  couponLoading: boolean
  applyCoupon: (code: string) => Promise<void>
  clearCoupon: () => void
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [items, setItems] = useState<CartItem[]>([])
  const [coupon, setCoupon] = useState<CouponState | null>(null)
  const [couponLoading, setCouponLoading] = useState(false)

  const addItem = (newItem: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === newItem.id)
      if (existing) {
        return prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        )
      }
      return [...prev, newItem]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) { removeItem(id); return }
    setItems((prev) =>
      prev.map((item) => item.id === id ? { ...item, quantity } : item)
    )
  }

  const clearCart = () => {
    setItems([])
    setCoupon(null)
    setIsOpen(false)
  }

  const applyCoupon = useCallback(async (code: string) => {
    if (!code.trim()) return
    setCouponLoading(true)
    try {
      const result = await validateCoupon(
        code.trim().toUpperCase(),
        items.map((i) => ({
          product_id: i.product_id,
          product_variant_id: i.product_variant_id ?? null,
          quantity: i.quantity,
        }))
      )
      if (!result.valid || !result.promotion) {
        throw new Error(result.error ?? 'Invalid promo code')
      }
      setCoupon({
        code: result.promotion.code,
        description: result.promotion.description,
        discountAmount: result.promotion.discount_amount,
        valid: true,
      })
    } finally {
      setCouponLoading(false)
    }
  }, [items])

  const clearCoupon = () => setCoupon(null)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = Math.max(0, subtotal - (coupon?.discountAmount ?? 0))

  return (
    <CartContext.Provider
      value={{
        isOpen,
        setIsOpen,
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        coupon,
        couponLoading,
        applyCoupon,
        clearCoupon,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
