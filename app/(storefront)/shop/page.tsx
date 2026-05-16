'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sliders, Search, X } from 'lucide-react'
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
import { Skeleton } from '@/components/ui/skeleton'
import { getProducts, getCategories } from '@/lib/api'
import type { ApiProduct, ApiCategory, PaginationMeta, SortOption } from '@/lib/types'

const PER_PAGE = 9

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A → Z' },
  { value: 'name_desc', label: 'Name: Z → A' },
]

function ProductCardSkeleton() {
  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
      <Skeleton className="h-72 w-full" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: ApiProduct }) {
  const imageUrl = product.featured_image?.url
  const hasDiscount =
    product.discounted_price != null && product.discounted_price < product.price

  return (
    <motion.div whileHover={{ y: -4 }} className="group">
      <Link href={`/product/${product.slug}`}>
        <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="relative overflow-hidden bg-zinc-100 h-72">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm">
                No image
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            {product.is_featured && (
              <div className="absolute top-3 left-3 bg-rose-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Featured
              </div>
            )}
            {!product.is_active && (
              <div className="absolute top-3 right-3 bg-zinc-800 text-white text-xs font-medium px-2 py-1 rounded">
                Unavailable
              </div>
            )}
          </div>

          <div className="p-6">
            <p className="text-xs text-zinc-600 uppercase tracking-widest mb-2 font-medium">
              {product.category.name}
            </p>
            <h3 className="font-serif text-lg font-medium text-zinc-900 mb-2 line-clamp-2 hover:text-rose-900 transition-colors duration-300">
              {product.name}
            </h3>

            {(product.average_rating ?? 0) > 0 && (
              <div className="flex items-center gap-1 mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < Math.floor(product.average_rating ?? 0)
                          ? 'text-amber-400'
                          : 'text-zinc-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <span className="text-xs text-zinc-600">({product.reviews_count})</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              {hasDiscount ? (
                <>
                  <span className="font-serif text-lg text-zinc-900">
                    Rs {product.discounted_price!.toLocaleString()}
                  </span>
                  <span className="font-serif text-sm text-zinc-400 line-through">
                    Rs {product.price.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="font-serif text-lg text-zinc-900">
                  Rs {product.price.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="w-full py-2 text-sm font-medium text-white bg-rose-900 hover:bg-rose-950 transition-all duration-300 rounded">
              View Product
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function ShopContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [maxPrice, setMaxPrice] = useState(20000)
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const catSlug = searchParams.get('category')
    getCategories()
      .then((res) => {
        setCategories(res.data)
        if (catSlug) {
          const match = res.data.find((c) => c.slug === catSlug)
          if (match) setSelectedCategoryId(match.id)
        }
      })
      .catch(() => {})
  }, [searchParams])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const filters: Parameters<typeof getProducts>[0] = {
      sort: sortBy,
      per_page: PER_PAGE,
      page: currentPage,
    }
    if (selectedCategoryId) filters.category_id = selectedCategoryId
    if (maxPrice < 20000) filters.max_price = maxPrice
    if (search) filters.search = search

    getProducts(filters)
      .then((res) => {
        if (!cancelled) {
          setProducts(res.data)
          setMeta(res.meta)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedCategoryId, maxPrice, sortBy, search, currentPage])

  const handleCategoryToggle = (id: number) => {
    setSelectedCategoryId((prev) => (prev === id ? null : id))
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption)
    setCurrentPage(1)
  }

  const handleMaxPriceChange = (value: number) => {
    setMaxPrice(value)
    setCurrentPage(1)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setCurrentPage(1)
  }

  const clearSearch = () => {
    setSearch('')
    setSearchInput('')
    setCurrentPage(1)
  }

  const clearAllFilters = () => {
    setSelectedCategoryId(null)
    setMaxPrice(20000)
    setSearch('')
    setSearchInput('')
    setCurrentPage(1)
  }

  const totalPages = meta?.last_page ?? 1
  const hasActiveFilters = selectedCategoryId !== null || maxPrice < 20000 || search !== ''

  const paginationItems = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
    .reduce<(number | string)[]>((acc, p, i, arr) => {
      if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…')
      acc.push(p)
      return acc
    }, [])

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Page header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-600">
            <Link href="/" className="hover:text-zinc-900">Home</Link>
            <span>/</span>
            <span className="text-zinc-900">Collections</span>
          </div>
          <h1 className="font-serif text-4xl text-zinc-900 mb-2">Premium Collections</h1>
          <p className="text-zinc-600">Discover our curated selection of luxury unstitched fabrics</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-64 flex-shrink-0"
          >
            <div className="sticky top-24 space-y-6">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-zinc-900" />
                <h3 className="font-serif text-lg text-zinc-900">Filters</h3>
              </div>

              {/* Search */}
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search fabrics..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 border border-zinc-200 rounded text-sm focus:outline-none focus:border-zinc-900"
                />
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
                {search && (
                  <button type="button" onClick={clearSearch} className="absolute right-2.5 top-2.5">
                    <X className="w-4 h-4 text-zinc-400 hover:text-zinc-700" />
                  </button>
                )}
              </form>

              <Accordion type="single" collapsible defaultValue="categories" className="space-y-2">
                {/* Category filter */}
                <AccordionItem value="categories">
                  <AccordionTrigger className="text-sm font-medium text-zinc-900 hover:text-zinc-600">
                    Fabric Type
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 pt-3">
                    {categories.length === 0 ? (
                      <div className="space-y-2">
                        {[...Array(4)].map((_, i) => (
                          <Skeleton key={i} className="h-5 w-full" />
                        ))}
                      </div>
                    ) : (
                      categories.map((cat) => (
                        <div key={cat.id} className="flex items-center gap-3">
                          <Checkbox
                            id={`cat-${cat.id}`}
                            checked={selectedCategoryId === cat.id}
                            onCheckedChange={() => handleCategoryToggle(cat.id)}
                            className="border-zinc-300"
                          />
                          <label
                            htmlFor={`cat-${cat.id}`}
                            className="text-sm text-zinc-600 cursor-pointer flex-1 flex items-center justify-between"
                          >
                            <span>{cat.name}</span>
                            {cat.products_count > 0 && (
                              <span className="text-zinc-400 text-xs">{cat.products_count}</span>
                            )}
                          </label>
                        </div>
                      ))
                    )}
                  </AccordionContent>
                </AccordionItem>

                {/* Price filter */}
                <AccordionItem value="price">
                  <AccordionTrigger className="text-sm font-medium text-zinc-900 hover:text-zinc-600">
                    Price Range
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4 pt-3">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-zinc-600">
                        Up to Rs {maxPrice.toLocaleString()}
                      </p>
                      <input
                        type="range"
                        min="0"
                        max="20000"
                        step="500"
                        value={maxPrice}
                        onChange={(e) => handleMaxPriceChange(parseInt(e.target.value))}
                        className="w-full h-1 bg-zinc-300 rounded cursor-pointer accent-zinc-900"
                      />
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>Rs 0</span>
                        <span>Rs 20,000</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-rose-900 hover:text-rose-950 font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </motion.div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Top bar */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-200"
            >
              <p className="text-sm text-zinc-600">
                {loading ? (
                  <Skeleton className="h-4 w-28 inline-block" />
                ) : (
                  <>
                    Showing{' '}
                    <span className="font-semibold text-zinc-900">
                      {meta?.total ?? products.length}
                    </span>{' '}
                    results
                  </>
                )}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-600 hidden sm:inline">Sort by:</span>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </motion.div>

            {/* Error state */}
            {error && !loading && (
              <div className="text-center py-20">
                <p className="text-zinc-600 mb-4">Failed to load products.</p>
                <button
                  onClick={() => setCurrentPage((p) => p)}
                  className="text-sm text-rose-900 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Product grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {loading
                ? [...Array(PER_PAGE)].map((_, i) => <ProductCardSkeleton key={i} />)
                : products.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
            </div>

            {/* Empty state */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-20">
                <p className="font-serif text-xl text-zinc-900 mb-2">No products found</p>
                <p className="text-zinc-600 text-sm mb-4">Try adjusting your filters</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-rose-900 hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2 py-8"
              >
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                  className="px-3 py-2"
                >
                  ← Previous
                </Button>

                {paginationItems.map((p, i) =>
                  p === '…' ? (
                    <span key={`ellipsis-${i}`} className="px-2 text-zinc-400 select-none">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p as number)}
                      className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                        currentPage === p
                          ? 'bg-zinc-900 text-white'
                          : 'text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-2"
                >
                  Next →
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ShopPage() {
  return (
    <Suspense>
      <ShopContent />
    </Suspense>
  )
}
