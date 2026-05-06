'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Heart, Share2, Truck, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const productData = {
  1: {
    name: 'Royal Egyptian Cotton',
    price: 8499,
    rating: 4.8,
    reviews: 124,
    description:
      'Experience the ultimate luxury with our Royal Egyptian Cotton. Crafted from premium long-staple cotton, this fabric offers exceptional softness and breathability. Perfect for sophisticated formal wear with an elegant drape that enhances any traditional design.',
    images: [
      'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1548883416-bdee2539b30f?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=800&fit=crop',
    ],
    colors: [
      { name: 'Navy', hex: '#001f3f' },
      { name: 'Charcoal', hex: '#36454f' },
      { name: 'White', hex: '#ffffff' },
      { name: 'Maroon', hex: '#720026' },
    ],
    specifications: {
      Material: '100% Egyptian Cotton',
      Season: 'All Season',
      Width: '52" (1.3m)',
      Weight: '180 GSM',
      Weave: 'Twill',
    },
  },
  2: {
    name: 'Premium Lawn Collection',
    price: 4299,
    rating: 4.7,
    reviews: 89,
    description:
      'Embrace comfort and style with our Premium Lawn Collection. This lightweight fabric is ideal for summer wear with its breathable nature and vibrant color palette. Perfect for casual and formal occasions throughout the warm season.',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=800&fit=crop',
      'https://images.unsplash.com/photo-1620799140409-112921af0a11?w=600&h=800&fit=crop',
    ],
    colors: [
      { name: 'Sky Blue', hex: '#87CEEB' },
      { name: 'Sage Green', hex: '#9DC183' },
      { name: 'Ivory', hex: '#FFFFF0' },
      { name: 'Peach', hex: '#FFDAB9' },
    ],
    specifications: {
      Material: '100% Cotton Lawn',
      Season: 'Summer',
      Width: '54" (1.37m)',
      Weight: '120 GSM',
      Weave: 'Plain',
    },
  },
}

export default function ProductDetailPage({ params }) {
  const product = productData[params.id] || productData[1]
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedLength, setSelectedLength] = useState('5')
  const [selectedColor, setSelectedColor] = useState(product.colors[0].name)
  const [quantity, setQuantity] = useState(1)

  const lengths = ['4.5', '5', '5.5', '6']

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <Link href="/" className="hover:text-zinc-900">Home</Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-zinc-900">Collections</Link>
            <span>/</span>
            <span className="text-zinc-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-12">
          {/* Left: Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-24 h-fit"
          >
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative bg-zinc-100 rounded-lg overflow-hidden aspect-square">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Thumbnail Grid */}
              <div className="grid grid-cols-2 gap-3">
                {product.images.map((image, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`relative rounded-lg overflow-hidden aspect-square border-2 transition-all ${
                      selectedImage === i
                        ? 'border-zinc-900'
                        : 'border-zinc-200 hover:border-zinc-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Header Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-serif text-3xl text-zinc-900 mb-3">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(product.rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-zinc-600">
                        {product.rating} ({product.reviews} reviews)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-3 rounded-lg border border-zinc-300 hover:border-zinc-900 text-zinc-900 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-3 rounded-lg border border-zinc-300 hover:border-zinc-900 text-zinc-900 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="font-serif text-2xl text-zinc-900 mb-4">
                Rs {product.price.toLocaleString()}
              </p>

              <p className="text-zinc-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Selections */}
            <div className="space-y-6 pt-6 border-t border-zinc-200">
              {/* Length Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-3">
                  Length (Meters)
                </label>
                <ToggleGroup type="single" value={selectedLength} onValueChange={setSelectedLength}>
                  {lengths.map((length) => (
                    <ToggleGroupItem
                      key={length}
                      value={length}
                      className="border-2 border-zinc-300 data-[state=on]:border-zinc-900 data-[state=on]:bg-zinc-900 data-[state=on]:text-white"
                    >
                      {length}m
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-3">
                  Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                        selectedColor === color.name
                          ? 'border-zinc-900 ring-2 ring-zinc-900 ring-offset-2'
                          : 'border-zinc-300 hover:border-zinc-600'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
                <p className="text-sm text-zinc-600 mt-2">
                  Selected: <span className="font-medium text-zinc-900">{selectedColor}</span>
                </p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-4 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 border border-zinc-300 rounded hover:bg-zinc-100"
                  >
                    −
                  </button>
                  <span className="text-lg font-medium w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 border border-zinc-300 rounded hover:bg-zinc-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3 pt-6 border-t border-zinc-200">
              <button className="w-full bg-rose-900 text-white py-4 rounded-lg font-medium text-lg hover:bg-rose-950 transition-colors shadow-md hover:shadow-lg">
                Add to Cart
              </button>
              <button className="w-full border-2 border-zinc-900 text-zinc-900 py-4 rounded-lg font-medium hover:bg-zinc-900 hover:text-white transition-colors">
                Buy Now
              </button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="flex gap-3 p-4 bg-white rounded-lg border border-zinc-200">
                <Truck className="w-5 h-5 text-zinc-900 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-zinc-900">Free Shipping</p>
                  <p className="text-zinc-600">Orders over Rs 2500</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-white rounded-lg border border-zinc-200">
                <RotateCcw className="w-5 h-5 text-zinc-900 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-zinc-900">Easy Returns</p>
                  <p className="text-zinc-600">30-day guarantee</p>
                </div>
              </div>
            </div>

            {/* Accordions */}
            <Accordion type="single" collapsible defaultValue="care" className="pt-6 border-t border-zinc-200">
              <AccordionItem value="care">
                <AccordionTrigger className="text-sm font-medium text-zinc-900">
                  Fabric Care
                </AccordionTrigger>
                <AccordionContent className="text-sm text-zinc-600">
                  <ul className="space-y-2">
                    <li>• Hand wash or machine wash on gentle cycle</li>
                    <li>• Use cold water for best results</li>
                    <li>• Iron on medium heat while slightly damp</li>
                    <li>• Avoid bleach and harsh detergents</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="delivery">
                <AccordionTrigger className="text-sm font-medium text-zinc-900">
                  Delivery & Returns
                </AccordionTrigger>
                <AccordionContent className="text-sm text-zinc-600">
                  <p className="mb-3">
                    Standard delivery takes 3-5 business days. Free shipping on orders over Rs 2500.
                  </p>
                  <p>
                    We offer a 30-day returns policy. Items must be unused and in original packaging.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="specs">
                <AccordionTrigger className="text-sm font-medium text-zinc-900">
                  Product Specifications
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 text-sm">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-zinc-600">{key}</span>
                        <span className="font-medium text-zinc-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
