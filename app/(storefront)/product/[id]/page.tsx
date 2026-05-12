'use client'

import { useState, useEffect, use } from 'react'
import { motion } from 'framer-motion'
import { Star, Heart, Share2, Truck, RotateCcw } from 'lucide-react'
import Link from 'next/link'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { getProduct, postReview, getCategoryProducts } from '@/lib/api'
import type { ApiProductDetail, ApiProduct, ApiReview, ProductNote } from '@/lib/types'
import { useCart } from '@/context/cart-context'

const LENGTHS = ['4.5', '5', '5.5', '6']

function StarPicker({
  value,
  onChange,
}: {
  value: number | null
  onChange: (v: number) => void
}) {
  const [hovered, setHovered] = useState<number | null>(null)
  const display = hovered ?? value

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(null)}
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`w-6 h-6 transition-colors ${display && star <= display
              ? 'fill-amber-400 text-amber-400'
              : 'text-zinc-300'
              }`}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewForm({
  productId,
  onReviewAdded,
}: {
  productId: number
  onReviewAdded: (review: ApiReview) => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [rating, setRating] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }
    if (!rating && !message.trim()) {
      toast.error('Please provide a rating or a review message')
      return
    }

    setSubmitting(true)
    try {
      const newReview = await postReview(productId, {
        name: name.trim(),
        ...(email.trim() && { email: email.trim() }),
        ...(rating && { rating }),
        ...(message.trim() && { message: message.trim() }),
      })
      onReviewAdded(newReview)
      toast.success('Review submitted! It will appear once approved.')
      setName('')
      setEmail('')
      setRating(null)
      setMessage('')
    } catch {
      toast.error('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-serif text-lg text-zinc-900">Write a Review</h4>

      <div>
        <label className="text-xs text-zinc-500 mb-1.5 block">Your Rating</label>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-3 py-2 border border-zinc-200 rounded text-sm focus:outline-none focus:border-zinc-900 transition-colors"
          />
        </div>
        <div>
          <label className="text-xs text-zinc-500 mb-1 block">Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-zinc-200 rounded text-sm focus:outline-none focus:border-zinc-900 transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-zinc-500 mb-1 block">Review (optional)</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your experience with this fabric..."
          rows={3}
          className="w-full px-3 py-2 border border-zinc-200 rounded text-sm focus:outline-none focus:border-zinc-900 transition-colors resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="px-8 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded hover:bg-zinc-800 transition-colors disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  )
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { addItem } = useCart()
  const [product, setProduct] = useState<ApiProductDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedLength, setSelectedLength] = useState('5')
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState<ApiReview[]>([])
  const [similarProducts, setSimilarProducts] = useState<ApiProduct[]>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getProduct(id)
      .then((data) => {
        if (!cancelled) {
          setProduct(data)
          setReviews(data.reviews ?? [])
          setSelectedImage(0)
          setQuantity(1)

          if (data.category?.slug) {
            getCategoryProducts(data.category.slug, { per_page: 9 })
              .then((res) => {
                if (!cancelled) {
                  setSimilarProducts(res.data.filter((p) => p.id !== data.id))
                }
              })
              .catch(() => {})
          }
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
  }, [id])

  if (loading) return <LoadingSkeleton />

  if (error || !product) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-xl text-zinc-900 mb-2">Product not found</p>
          <p className="text-zinc-500 text-sm mb-6">{error}</p>
          <Link href="/shop" className="text-rose-900 hover:underline text-sm font-medium">
            ← Back to Shop
          </Link>
        </div>
      </div>
    )
  }

  const allImages = [
    ...(product.featured_image ? [product.featured_image] : []),
    ...(product.gallery ?? []),
  ]

  const hasDiscount =
    product.discounted_price != null && product.discounted_price < product.price

  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discounted_price!) / product.price) * 100)
    : 0

  const handleAddToCart = () => {
    addItem({
      id: String(product.id),
      product_id: product.id,
      product_variant_id: null,
      name: product.name,
      price: product.discounted_price ?? product.price,
      quantity,
      image: product.featured_image?.url,
      length: selectedLength,
    })
    toast.success(`${product.name} added to cart!`, {
      description: `Rs ${(product.discounted_price ?? product.price).toLocaleString()} · ${selectedLength}m`,
    })
  }

  const handleReviewAdded = (review: ApiReview) => {
    setReviews((prev) => [review, ...prev])
  }

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
            <Link
              href={`/shop?category=${product.category?.slug}`}
              className="hover:text-zinc-900"
            >
              {product.category?.name}
            </Link>
            <span>/</span>
            <span className="text-zinc-900 line-clamp-1">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="sticky top-24 h-fit"
          >
            <div className="space-y-4">
              <div className="relative bg-zinc-100 rounded-lg overflow-hidden aspect-square">
                {allImages[selectedImage] ? (
                  <img
                    src={allImages[selectedImage].url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    No image
                  </div>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {allImages.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={`relative rounded-lg overflow-hidden aspect-square border-2 transition-all ${selectedImage === i
                        ? 'border-zinc-900'
                        : 'border-zinc-200 hover:border-zinc-400'
                        }`}
                    >
                      <img
                        src={img.url}
                        alt={`${product.name} view ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 pr-4">
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-2 font-medium">
                    {product.category?.name}
                  </p>
                  <h1 className="font-serif text-3xl text-zinc-900 mb-3">{product.name}</h1>

                  {(product.average_rating ?? 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(product.average_rating ?? 0)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-300'
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-zinc-600">
                        {(product.average_rating ?? 0).toFixed(1)} ({product.reviews_count}{' '}
                        {product.reviews_count === 1 ? 'review' : 'reviews'})
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button className="p-3 rounded-lg border border-zinc-300 hover:border-zinc-900 text-zinc-900 transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="p-3 rounded-lg border border-zinc-300 hover:border-zinc-900 text-zinc-900 transition-colors">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-4">
                {hasDiscount ? (
                  <>
                    <span className="font-serif text-2xl text-zinc-900">
                      Rs {product.discounted_price!.toLocaleString()}
                    </span>
                    <span className="font-serif text-lg text-zinc-400 line-through">
                      Rs {product.price.toLocaleString()}
                    </span>
                    <span className="text-xs bg-rose-100 text-rose-900 font-semibold px-2 py-0.5 rounded">
                      {discountPercent}% OFF
                    </span>
                  </>
                ) : (
                  <span className="font-serif text-2xl text-zinc-900">
                    Rs {product.price.toLocaleString()}
                  </span>
                )}
              </div>

              {product.description && (
                <p className="text-zinc-600 leading-relaxed">{product.description}</p>
              )}

              {product.stock > 0 && product.stock <= 10 && (
                <p className="text-amber-600 text-sm mt-3">
                  Only {product.stock} left in stock — order soon
                </p>
              )}
              {product.stock === 0 && (
                <p className="text-red-600 text-sm mt-3 font-medium">Out of stock</p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-6 pt-6 border-t border-zinc-200">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-3">
                  Length (Meters)
                </label>
                <ToggleGroup
                  type="single"
                  value={selectedLength}
                  onValueChange={(v) => v && setSelectedLength(v)}
                >
                  {LENGTHS.map((length) => (
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

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-3">Quantity</label>
                <div className="flex items-center gap-4 w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 border border-zinc-300 rounded hover:bg-zinc-100 transition-colors"
                  >
                    −
                  </button>
                  <span className="text-lg font-medium w-8 text-center">{quantity}</span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock > 0 ? product.stock : 99, quantity + 1))
                    }
                    className="px-3 py-2 border border-zinc-300 rounded hover:bg-zinc-100 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-6 border-t border-zinc-200">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full bg-rose-900 text-white py-4 rounded-lg font-medium text-lg hover:bg-rose-950 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="w-full border-2 border-zinc-900 text-zinc-900 py-4 rounded-lg font-medium hover:bg-zinc-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>

            {/* Info cards */}
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

            {/* Product Notes */}
            {(product.notes as ProductNote[]).length > 0 && (
              <div className="pt-6 border-t border-zinc-200 space-y-3">
                <h3 className="text-sm font-medium text-zinc-900">Product Notes</h3>
                {(product.notes as ProductNote[]).map((note) => (
                  <div key={note.id} className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                    <p className="text-sm font-medium text-zinc-900 mb-1">{note.title}</p>
                    <p className="text-sm text-zinc-600 leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div>
            )}

            <Accordion
              type="single"
              collapsible
              defaultValue="care"
              className="pt-6 border-t border-zinc-200"
            >
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
                    Standard delivery takes 3–5 business days. Free shipping on orders over Rs 2500.
                  </p>
                  <p>
                    We offer a 30-day returns policy. Items must be unused and in original packaging.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </motion.div>
        </div>

        {/* ── Reviews Section ──────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-20 pt-12 border-t border-zinc-200"
        >
          <div className="flex items-baseline gap-3 mb-8">
            <h2 className="font-serif text-2xl text-zinc-900">
              Customer Reviews
            </h2>
            {reviews.length > 0 && (
              <span className="text-sm text-zinc-500">({reviews.length})</span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Reviews list */}
            <div>
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="pb-6 border-b border-zinc-100 last:border-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-sm font-medium text-zinc-900">
                            {review.name}
                          </span>
                          {review.rating > 0 && (
                            <div className="flex gap-0.5 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${i < Math.floor(review.rating)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-zinc-200'
                                    }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-zinc-400 flex-shrink-0">
                          {new Date(review.created_at).toLocaleDateString('en-PK', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      {review.message && (
                        <p className="text-sm text-zinc-600 leading-relaxed">{review.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-zinc-500">
                  <Star className="w-8 h-8 mx-auto mb-3 text-zinc-200" />
                  <p className="text-sm">No reviews yet — be the first!</p>
                </div>
              )}
            </div>

            {/* Write a review */}
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <ReviewForm productId={product.id} onReviewAdded={handleReviewAdded} />
            </div>
          </div>
        </motion.div>

        {/* ── Similar Products ─────────────────────────────────────────────── */}
        {similarProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-20 pt-12 border-t border-zinc-200"
          >
            <div className="flex items-baseline justify-between mb-8">
              <h2 className="font-serif text-2xl text-zinc-900">You May Also Like</h2>
              <Link
                href={`/shop?category=${product.category?.slug}`}
                className="text-sm text-rose-900 hover:underline font-medium"
              >
                View all {product.category?.name} →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
              {similarProducts.slice(0, 8).map((p) => {
                const price = p.discounted_price ?? p.price
                const hasOffer = p.discounted_price != null && p.discounted_price < p.price
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="group bg-white rounded-xl border border-zinc-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-square bg-zinc-100 overflow-hidden">
                      {p.featured_image?.url ? (
                        <img
                          src={p.featured_image.url}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-zinc-900 line-clamp-1 mb-1">
                        {p.name}
                      </p>
                      {(p.average_rating ?? 0) > 0 && (
                        <div className="flex items-center gap-1 mb-1.5">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < Math.floor(p.average_rating ?? 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-zinc-200'
                                  }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-zinc-400">{(p.average_rating ?? 0).toFixed(1)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-zinc-900">
                          Rs {price.toLocaleString()}
                        </span>
                        {hasOffer && (
                          <span className="text-xs text-zinc-400 line-through">
                            Rs {p.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
