'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Sliders } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'

// Product data
const products = [
  {
    id: 1,
    name: 'Royal Egyptian Cotton',
    category: 'Cotton',
    price: 8499,
    image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&h=600&fit=crop',
    rating: 4.8,
    reviews: 124,
  },
  {
    id: 2,
    name: 'Premium Lawn Collection',
    category: 'Lawn',
    price: 4299,
    image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500&h=600&fit=crop',
    rating: 4.7,
    reviews: 89,
  },
  {
    id: 3,
    name: 'Classic Wash & Wear',
    category: 'Wash & Wear',
    price: 3799,
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop',
    rating: 4.6,
    reviews: 156,
  },
  {
    id: 4,
    name: 'Luxury Karandi Fabric',
    category: 'Karandi',
    price: 12999,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=600&fit=crop',
    rating: 4.9,
    reviews: 72,
  },
  {
    id: 5,
    name: 'Summer Lawn Pearl',
    category: 'Lawn',
    price: 4899,
    image: 'https://images.unsplash.com/photo-1620799140409-112921af0a11?w=500&h=600&fit=crop',
    rating: 4.7,
    reviews: 95,
  },
  {
    id: 6,
    name: 'Premium Cotton Blend',
    category: 'Cotton',
    price: 7499,
    image: 'https://images.unsplash.com/photo-1550777278-95d786f59d6b?w=500&h=600&fit=crop',
    rating: 4.8,
    reviews: 142,
  },
  {
    id: 7,
    name: 'Everyday Wash & Wear',
    category: 'Wash & Wear',
    price: 3299,
    image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=600&fit=crop',
    rating: 4.5,
    reviews: 203,
  },
  {
    id: 8,
    name: 'Luxury Karandi Supreme',
    category: 'Karandi',
    price: 14999,
    image: 'https://images.unsplash.com/photo-1548883416-bdee2539b30f?w=500&h=600&fit=crop',
    rating: 4.9,
    reviews: 58,
  },
  {
    id: 9,
    name: 'Egyptian Cotton Deluxe',
    category: 'Cotton',
    price: 9999,
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=600&fit=crop',
    rating: 5,
    reviews: 110,
  },
]

const colors = [
  { name: 'Navy', hex: '#001f3f' },
  { name: 'Charcoal', hex: '#36454f' },
  { name: 'White', hex: '#ffffff' },
  { name: 'Cream', hex: '#fffdd0' },
  { name: 'Maroon', hex: '#720026' },
  { name: 'Black', hex: '#000000' },
]

function ProductCard({ product }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group"
    >
      <Link href={`/product/${product.id}`}>
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="relative overflow-hidden bg-zinc-100 h-72">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>

          <div className="p-6">
            <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2 font-medium">
              {product.category}
            </p>
            <h3 className="font-serif text-lg font-medium text-zinc-900 mb-2 line-clamp-2 hover:text-rose-900 transition-colors duration-300">
              {product.name}
            </h3>

            <div className="flex items-center gap-1 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < Math.floor(product.rating)
                        ? 'text-amber-400'
                        : 'text-zinc-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs text-zinc-600">
                ({product.reviews})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-serif text-lg text-zinc-900">
                Rs {product.price.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="px-6 pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="w-full py-2 text-sm font-medium text-white bg-rose-900 hover:bg-rose-950 transition-all duration-300 rounded">
              Quick Add
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function ShopPage() {
  const [sortBy, setSortBy] = useState('featured')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [priceRange, setPriceRange] = useState([0, 20000])

  const categories = ['Lawn', 'Cotton', 'Wash & Wear', 'Karandi']

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  let filteredProducts = products

  if (selectedCategories.length > 0) {
    filteredProducts = filteredProducts.filter((p) =>
      selectedCategories.includes(p.category)
    )
  }

  filteredProducts = filteredProducts.filter(
    (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
  )

  if (sortBy === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price)
  } else if (sortBy === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price)
  } else if (sortBy === 'rating') {
    filteredProducts.sort((a, b) => b.rating - a.rating)
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-600">
            <Link href="/" className="hover:text-zinc-900">Home</Link>
            <span>/</span>
            <span className="text-zinc-900">Collections</span>
          </div>
          <h1 className="font-serif text-4xl text-zinc-900 mb-2">
            Premium Collections
          </h1>
          <p className="text-zinc-600">Discover our curated selection of luxury unstitched fabrics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8">
          {/* Sidebar Filters - Hidden on Mobile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-1/4 flex-shrink-0"
          >
            <div className="sticky top-24 space-y-6">
              <div>
                <h3 className="font-serif text-lg text-zinc-900 mb-4 flex items-center gap-2">
                  <Sliders className="w-5 h-5" />
                  Filters
                </h3>
              </div>

              <Accordion type="single" collapsible defaultValue="categories" className="space-y-2">
                {/* Categories Filter */}
                <AccordionItem value="categories">
                  <AccordionTrigger className="text-sm font-medium text-zinc-900 hover:text-zinc-600">
                    Fabric Type
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-3">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center gap-3">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryChange(category)}
                          className="border-zinc-300"
                        />
                        <label
                          htmlFor={category}
                          className="text-sm text-zinc-600 cursor-pointer"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>

                {/* Price Filter */}
                <AccordionItem value="price">
                  <AccordionTrigger className="text-sm font-medium text-zinc-900 hover:text-zinc-600">
                    Price Range
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-3">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-600">
                        Rs {priceRange[0].toLocaleString()} — Rs {priceRange[1].toLocaleString()}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="20000"
                        step="500"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full h-1 bg-zinc-300 rounded cursor-pointer accent-zinc-900"
                      />
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Color Filter */}
                <AccordionItem value="colors">
                  <AccordionTrigger className="text-sm font-medium text-zinc-900 hover:text-zinc-600">
                    Color Family
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-3">
                    <div className="flex flex-wrap gap-3">
                      {colors.map((color) => (
                        <button
                          key={color.name}
                          className="group relative"
                          title={color.name}
                        >
                          <div
                            className="w-8 h-8 rounded-full border-2 border-zinc-300 hover:border-zinc-900 transition-all hover:scale-110"
                            style={{ backgroundColor: color.hex }}
                          />
                          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs whitespace-nowrap text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            {color.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-200"
            >
              <p className="text-sm text-zinc-600">
                Showing <span className="font-semibold text-zinc-900">{filteredProducts.length}</span> results
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className="text-sm text-zinc-600">Sort by:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {filteredProducts.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center gap-2 py-8"
            >
              <Button variant="outline" disabled className="px-3 py-2">
                ← Previous
              </Button>
              <button className="px-3 py-2 bg-zinc-900 text-white rounded text-sm font-medium">
                1
              </button>
              <button className="px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded text-sm font-medium">
                2
              </button>
              <button className="px-3 py-2 text-zinc-600 hover:bg-zinc-100 rounded text-sm font-medium">
                3
              </button>
              <Button variant="outline" className="px-3 py-2">
                Next →
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
