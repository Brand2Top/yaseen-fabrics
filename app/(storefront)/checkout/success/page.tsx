'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const mockOrderData = {
  orderNumber: '#YF-84920',
  customerName: 'Ahmed Hassan',
  date: new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' }),
  estimatedDelivery: '3-5 Business Days',
  items: [
    {
      id: 1,
      name: 'Royal Egyptian Cotton',
      quantity: 1,
      price: 8499,
      image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=80&h=80&fit=crop',
    },
    {
      id: 2,
      name: 'Premium Lawn Collection',
      quantity: 2,
      price: 4299,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=80&h=80&fit=crop',
    },
  ],
  subtotal: 17097,
  shipping: 0,
  total: 17097,
  email: 'ahmed@example.com',
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-zinc-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Success Animation */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 bg-rose-900/10 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <CheckCircle2 className="w-24 h-24 text-rose-900 relative z-10" strokeWidth={1.5} />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-zinc-900 mb-4 text-balance">
            Thank you for your order, {mockOrderData.customerName}.
          </h1>
          <p className="text-lg text-zinc-600 leading-relaxed">
            We've received your order and are getting it ready to be shipped. A confirmation email has been sent to{' '}
            <span className="font-semibold text-zinc-900">{mockOrderData.email}</span>.
          </p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          className="bg-white border border-zinc-200 rounded-lg p-8 mb-8 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {/* Order Info Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-zinc-200">
            <div>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-2">Order Number</p>
              <p className="font-serif text-2xl font-bold text-zinc-900">{mockOrderData.orderNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-2">Order Date</p>
              <p className="font-serif text-2xl font-bold text-zinc-900">{mockOrderData.date}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500 uppercase tracking-wide mb-2">Estimated Delivery</p>
              <p className="font-serif text-2xl font-bold text-zinc-900">{mockOrderData.estimatedDelivery}</p>
            </div>
          </div>

          {/* Items Summary */}
          <div className="mb-8 pb-8 border-b border-zinc-200">
            <h3 className="font-serif text-xl font-bold text-zinc-900 mb-6">Order Summary</h3>
            <div className="space-y-4">
              {mockOrderData.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg bg-zinc-100"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-zinc-900">{item.name}</p>
                    <p className="text-sm text-zinc-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium text-zinc-900">
                    Rs {(item.price * item.quantity).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Subtotal</span>
              <span className="font-medium text-zinc-900">Rs {mockOrderData.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-600">Shipping</span>
              <span className="font-medium text-green-700">Free</span>
            </div>
            <div className="flex justify-between py-4 border-t border-zinc-200 pt-4">
              <span className="font-serif text-lg font-bold text-zinc-900">Total</span>
              <span className="font-serif text-lg font-bold text-zinc-900">
                Rs {mockOrderData.total.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Call to Action Buttons */}
        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link href="/shop" className="flex-1 sm:flex-none">
            <Button className="w-full bg-rose-900 hover:bg-rose-950 text-white px-8 py-3 transition-all duration-300">
              Continue Shopping
            </Button>
          </Link>
          <button className="flex-1 sm:flex-none px-8 py-3 border-2 border-zinc-900 text-zinc-900 font-medium rounded-lg hover:bg-zinc-50 transition-all duration-300">
            Track Order Status
          </button>
        </motion.div>
      </div>
    </div>
  )
}
