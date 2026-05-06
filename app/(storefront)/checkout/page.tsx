'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group'

const checkoutItems = [
  {
    id: 1,
    name: 'Royal Egyptian Cotton',
    price: 8499,
    quantity: 1,
    length: '5m',
    color: 'Navy',
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=80&h=80&fit=crop',
  },
  {
    id: 2,
    name: 'Premium Lawn Collection',
    price: 4299,
    quantity: 2,
    length: '4.5m',
    color: 'Sky Blue',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=80&h=80&fit=crop',
  },
]

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    postalCode: '',
  })

  const [shippingMethod, setShippingMethod] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [promoCode, setPromoCode] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const subtotal = checkoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shippingCost = shippingMethod === 'express' ? 500 : 0
  const total = subtotal + shippingCost

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Minimal Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/" className="font-serif text-xl text-zinc-900 hover:text-zinc-600">
            Yaseen Fabrics
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Form (60%) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Contact Section */}
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-zinc-200 hover:shadow-md transition-shadow duration-300">
              <h2 className="font-serif text-xl font-bold text-zinc-900 mb-6">Contact Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="email" className="text-sm font-medium text-zinc-900">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className="mt-2 border-zinc-300"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Label htmlFor="phone" className="text-sm font-medium text-zinc-900">
                    Mobile Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+92 300 1234567"
                    className="mt-2 border-zinc-300"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Section */}
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-zinc-200 hover:shadow-md transition-shadow duration-300">
              <h2 className="font-serif text-xl font-bold text-zinc-900 mb-6">Delivery Address</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-zinc-900">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Muhammad"
                      className="mt-2 border-zinc-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-zinc-900">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Khan"
                      className="mt-2 border-zinc-300"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-sm font-medium text-zinc-900">
                    Street Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className="mt-2 border-zinc-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium text-zinc-900">
                      City
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Karachi"
                      className="mt-2 border-zinc-300"
                    />
                  </div>
                  <div>
                    <Label htmlFor="postalCode" className="text-sm font-medium text-zinc-900">
                      Postal Code
                    </Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      placeholder="75500"
                      className="mt-2 border-zinc-300"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-zinc-200 hover:shadow-md transition-shadow duration-300">
              <h2 className="font-serif text-xl font-bold text-zinc-900 mb-6">Shipping Method</h2>
              <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:border-zinc-300">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="flex-1 cursor-pointer font-medium text-zinc-900">
                      <div className="flex items-center justify-between">
                        <span>Standard Delivery</span>
                        <span className="text-sm font-normal text-green-700">Free</span>
                      </div>
                      <p className="text-xs text-zinc-600 font-normal mt-1">3-5 business days</p>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:border-zinc-300">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="flex-1 cursor-pointer font-medium text-zinc-900">
                      <div className="flex items-center justify-between">
                        <span>Express Delivery</span>
                        <span className="text-sm font-normal text-zinc-900">Rs 500</span>
                      </div>
                      <p className="text-xs text-zinc-600 font-normal mt-1">1-2 business days</p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-lg p-6 sm:p-8 border border-zinc-200 hover:shadow-md transition-shadow duration-300">
              <h2 className="font-serif text-xl font-bold text-zinc-900 mb-6">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:border-zinc-300">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod" className="flex-1 cursor-pointer font-medium text-zinc-900">
                      Cash on Delivery (COD)
                      <p className="text-xs text-zinc-600 font-normal mt-1">Pay when you receive your order</p>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border border-zinc-200 rounded-lg cursor-pointer hover:border-zinc-300">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer font-medium text-zinc-900">
                      Credit/Debit Card
                      <p className="text-xs text-zinc-600 font-normal mt-1">Secure payment with your card</p>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Complete Order Button */}
            <button className="w-full bg-rose-900 text-white py-4 rounded-lg font-medium text-lg hover:bg-rose-950 transition-all duration-300 shadow-md hover:shadow-lg">
              Complete Order
            </button>
          </motion.div>

          {/* Right: Order Summary (40%) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:sticky lg:top-24 lg:h-fit"
          >
            <div className="bg-white border border-zinc-200 rounded-lg p-6 sm:p-8 space-y-6 hover:shadow-md transition-shadow duration-300">
              <h2 className="font-serif text-xl font-bold text-zinc-900">Order Summary</h2>

              {/* Items */}
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b border-zinc-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900 line-clamp-2">
                        {item.name}
                      </p>
                      <p className="text-xs text-zinc-600 mt-1">
                        Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-serif text-zinc-900 mt-2">
                        Rs {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-2 border border-zinc-300 rounded text-sm placeholder:text-zinc-400 focus:outline-none focus:border-zinc-900 bg-white"
                />
                <button className="px-4 py-2 text-sm font-medium text-zinc-900 border border-zinc-300 rounded hover:bg-white transition-colors">
                  Apply
                </button>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-3 py-4 border-t border-zinc-300">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-700">Subtotal</span>
                  <span className="font-medium text-zinc-900">Rs {subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-zinc-700">Shipping</span>
                  <span className="font-medium text-zinc-900">
                    {shippingCost === 0 ? 'Free' : `Rs ${shippingCost}`}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-zinc-700">Discount</span>
                  <span className="font-medium text-green-700">—</span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between pt-4 border-t border-zinc-300">
                <span className="font-serif text-lg text-zinc-900">Total</span>
                <span className="font-serif text-2xl font-bold text-zinc-900">
                  Rs {total.toLocaleString()}
                </span>
              </div>

              <p className="text-xs text-zinc-600 italic">
                Taxes included. Shipping and discounts calculated at checkout.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
