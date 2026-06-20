'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useCart } from '@/context/cart-context'
import { toast } from 'sonner'
import { getFeaturedProducts, getFeaturedCategories, getPosts, getCategories } from '@/lib/api'
import type { ApiProduct, ApiCategory, ApiPost } from '@/lib/types'

// ─── Shared ───────────────────────────────────────────────────────────────────

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  light = false,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  light?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className={`max-w-2xl ${align === 'center' ? 'mx-auto text-center' : ''}`}
    >
      {eyebrow && (
        <div className={`flex items-center gap-3 mb-6 ${align === 'center' ? 'justify-center' : ''}`}>
          <span className={`h-px w-10 ${light ? 'bg-white/40' : 'bg-rose-900/30'}`} />
          <p className="text-[11px] uppercase tracking-luxury shimmer-text font-medium">{eyebrow}</p>
          <span className={`h-px w-10 ${light ? 'bg-white/40' : 'bg-rose-900/30'}`} />
        </div>
      )}
      <h2 className={`font-display text-4xl md:text-6xl leading-[1.05] ${light ? 'text-white' : 'text-zinc-900'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-6 text-base md:text-lg leading-relaxed ${light ? 'text-white/70' : 'text-zinc-500'}`}>
          {subtitle}
        </p>
      )}
    </motion.div>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ heroImageUrl }: { heroImageUrl?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [0, 200])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section ref={ref} className="relative h-screen min-h-[700px] w-full overflow-hidden grain">
      {/* Background */}
      <motion.div style={{ y }} className="absolute inset-0">
        {heroImageUrl ? (
          <>
            <img
              src={heroImageUrl}
              alt="Yaseen Fabrics premium collection"
              className="h-[120%] w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/85 via-zinc-900/40 to-zinc-900/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/50 via-transparent to-transparent" />
          </>
        ) : (
          <div className="h-full w-full bg-stone-100">
            <div className="absolute top-0 right-0 w-[70vw] h-[70vw] rounded-full bg-rose-900/8 translate-x-1/3 -translate-y-1/4" />
            <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] rounded-full bg-rose-900/5 -translate-x-1/3 translate-y-1/3" />
          </div>
        )}
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 h-full flex flex-col justify-end pb-24 md:pb-32 px-6 lg:px-16 max-w-[1400px] mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className={`text-[11px] uppercase tracking-luxury mb-6 ${heroImageUrl ? 'text-white/80' : 'text-rose-900/80'}`}>
            ✦ Yaseen Fabrics — Premium Unstitched Collection ✦
          </p>
          <h1 className={`font-display text-5xl sm:text-7xl md:text-8xl lg:text-[8.5rem] leading-[0.95] max-w-5xl ${heroImageUrl ? 'text-white' : 'text-zinc-900'}`}>
            Woven with <em className="shimmer-text not-italic">Heritage</em>
          </h1>
          <p className={`mt-8 max-w-xl text-base md:text-lg leading-relaxed font-light ${heroImageUrl ? 'text-white/80' : 'text-zinc-600'}`}>
            For those who understand that elegance is never loud — only certain.
            Premium unstitched fabrics crafted by artisans devoted to their craft.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-rose-900 text-white text-[11px] uppercase tracking-luxury font-medium hover:bg-rose-950 hover:shadow-[0_0_40px_-8px_oklch(0.38_0.15_25/0.5)] transition-all duration-500"
            >
              Shop Now
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/shop"
              className={`inline-flex items-center gap-3 px-8 py-4 border text-[11px] uppercase tracking-luxury font-medium transition-all duration-500 ${
                heroImageUrl
                  ? 'border-white/40 text-white hover:bg-white/10'
                  : 'border-rose-900/40 text-rose-900 hover:bg-rose-900/5'
              }`}
            >
              Explore Collections
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 ${heroImageUrl ? 'text-white/50' : 'text-rose-900/50'}`}
      >
        <span className="text-[10px] uppercase tracking-luxury">Scroll</span>
        <div className={`h-12 w-px bg-gradient-to-b animate-float-slow ${heroImageUrl ? 'from-white/50 to-transparent' : 'from-rose-900/50 to-transparent'}`} />
      </motion.div>
    </section>
  )
}

// ─── Category Ring Slider ─────────────────────────────────────────────────────

function CategoryRingSlider({ categories, loading }: { categories: ApiCategory[]; loading: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showControls, setShowControls] = useState(false)

  // Check if we need to show scroll controls based on content width
  useEffect(() => {
    const checkOverflow = () => {
      if (scrollRef.current) {
        setShowControls(scrollRef.current.scrollWidth > scrollRef.current.clientWidth)
      }
    }
    checkOverflow()
    window.addEventListener('resize', checkOverflow)
    return () => window.removeEventListener('resize', checkOverflow)
  }, [categories, loading])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  return (
    <section className="py-20 md:py-28 bg-[#F4F8FB]">
      <div className="px-6 lg:px-12 max-w-[1400px] mx-auto">
        {/* Header matching screenshot */}
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#204E8A] mb-2">Browse</p>
          <h2 className="font-display text-4xl md:text-5xl text-[#0B1E36] font-semibold tracking-tight">
            Shop By Categories
          </h2>
        </div>

        {/* Slider Container */}
        <div className="relative group">
          {/* Left Arrow */}
          {showControls && (
            <button
              onClick={() => scroll('left')}
              className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 text-[#0B1E36] opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Scroll Area (hides native scrollbar using arbitrary tailwind variants) */}
          <div
            ref={scrollRef}
            className="flex gap-6 md:gap-10 overflow-x-auto snap-x snap-mandatory pb-6 pt-2 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {loading
              ? [...Array(5)].map((_, i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center gap-6 min-w-[200px]">
                    <Skeleton className="w-[220px] h-[220px] rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))
              : categories.map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className="group/ring flex-shrink-0 flex flex-col items-center gap-5 min-w-[200px] snap-start"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="w-[200px] h-[200px] md:w-[240px] md:h-[240px] rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-50 transition-transform duration-500 ease-out group-hover/ring:scale-105 group-hover/ring:shadow-[0_10px_40px_rgba(0,0,0,0.06)] overflow-hidden"
                  >
                    {cat.image?.url ? (
                      <img
                        src={cat.image.url}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/ring:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-100 rounded-full" />
                    )}
                  </motion.div>
                  <span className="text-[13px] font-semibold text-[#0B1E36] uppercase tracking-wider text-center transition-colors group-hover/ring:text-[#204E8A]">
                    {cat.name}
                  </span>
                </Link>
              ))}
          </div>

          {/* Right Arrow */}
          {showControls && (
            <button
              onClick={() => scroll('right')}
              className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 text-[#0B1E36] opacity-0 group-hover:opacity-100 transition-all hover:scale-105"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── Featured Collections ─────────────────────────────────────────────────────

function FeaturedCollections({ categories, loading }: { categories: ApiCategory[]; loading: boolean }) {
  return (
    <section className="py-28 md:py-40 px-6 lg:px-12 max-w-[1400px] mx-auto">
      <SectionHeading
        eyebrow="The Collections"
        title="Worlds Worth Wearing"
        subtitle="Each collection is its own atmosphere — a fabric, a season, a state of being."
      />

      <div className="mt-20 grid gap-6 md:grid-cols-3">
        {loading
          ? [...Array(3)].map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-none" />
            ))
          : categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
              >
                <Link
                  href={`/shop?category=${cat.slug}`}
                  className="group relative block aspect-[3/4] overflow-hidden bg-zinc-100"
                >
                  {cat.image?.url ? (
                    <img
                      src={cat.image.url}
                      alt={cat.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-zinc-200 to-zinc-300" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-zinc-900/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-rose-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 mix-blend-soft-light" />
                  <div className="absolute inset-x-0 bottom-0 p-8">
                    <p className="text-[10px] uppercase tracking-luxury text-rose-300 mb-3">
                      Yaseen Fabrics
                    </p>
                    <h3 className="font-display text-3xl md:text-4xl text-white mb-2">{cat.name}</h3>
                    {cat.description && (
                      <p className="text-sm text-white/70 italic font-light mb-5 line-clamp-2">{cat.description}</p>
                    )}
                    <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-luxury text-rose-300 luxury-underline">
                      View Collection <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
      </div>
    </section>
  )
}

// ─── Products Section ─────────────────────────────────────────────────────────

function ProductsSection({
  products,
  loading,
  onQuickAdd,
}: {
  products: ApiProduct[]
  loading: boolean
  onQuickAdd: (p: ApiProduct) => void
}) {
  return (
    <section className="py-28 md:py-40 px-6 lg:px-12 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
        <div>
          <p className="text-[11px] uppercase tracking-luxury shimmer-text mb-4">Atelier Selection</p>
          <h2 className="font-display text-4xl md:text-6xl text-zinc-900">Pieces of the Season</h2>
        </div>
        <Link
          href="/shop"
          className="text-[11px] uppercase tracking-luxury text-rose-900 luxury-underline self-start"
        >
          View All Pieces →
        </Link>
      </div>

      <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[3/4] w-full rounded-none" />
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          : products.map((p, i) => {
              const price = p.discounted_price ?? p.price
              const hasDiscount = p.discounted_price != null && p.discounted_price < p.price
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: i * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                  className="group"
                >
                  <Link href={`/product/${p.slug}`}>
                    <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100 mb-5">
                      {p.featured_image?.url ? (
                        <img
                          src={p.featured_image.url}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-[1.4s] ease-out group-hover:scale-110"
                        />
                      ) : (
                        <div className="h-full w-full bg-zinc-200" />
                      )}
                      {/* Bottom overlay + CTA on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                        <button
                          onClick={(e) => { e.preventDefault(); onQuickAdd(p) }}
                          className="w-full py-3 bg-rose-900 text-white text-[11px] uppercase tracking-luxury hover:bg-rose-950 transition-colors"
                        >
                          Add to Bag
                        </button>
                      </div>
                    </div>
                    <p className="text-[10px] uppercase tracking-luxury text-rose-900/70 mb-1">{p.categories?.[0]?.name}</p>
                    <h3 className="font-display text-xl text-zinc-900 mb-1 group-hover:text-rose-900 transition-colors duration-300 line-clamp-1">
                      {p.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-zinc-700">Rs {price.toLocaleString()}</span>
                      {hasDiscount && (
                        <span className="text-xs text-zinc-400 line-through">Rs {p.price.toLocaleString()}</span>
                      )}
                    </div>
                    {(p.average_rating ?? 0) > 0 && (
                      <div className="flex items-center gap-1 mt-1.5">
                        {[...Array(5)].map((_, j) => (
                          <Star key={j} className={`w-3 h-3 ${j < Math.floor(p.average_rating ?? 0) ? 'fill-amber-400 text-amber-400' : 'text-zinc-300'}`} />
                        ))}
                        <span className="text-xs text-zinc-400 ml-0.5">{(p.average_rating ?? 0).toFixed(1)}</span>
                      </div>
                    )}
                  </Link>
                </motion.div>
              )
            })}
      </div>
    </section>
  )
}

// ─── Why Yaseen Fabrics ───────────────────────────────────────────────────────

function WhyYaseenFabrics({ imageUrl }: { imageUrl?: string }) {
  const features = [
    {
      n: '01',
      t: 'Fabric of Heritage',
      d: 'Sourced from master weavers — silks, cottons, and premium blends that carry their own quiet age and character.',
    },
    {
      n: '02',
      t: 'Crafted with Precision',
      d: 'Every metre passes through quality control ensuring the weight, weave, and finish meet the standard of a discerning wardrobe.',
    },
    {
      n: '03',
      t: 'Restraint as Elegance',
      d: 'We curate what does not need to be loud. Texture, drape, and colour do the speaking.',
    },
  ]

  return (
    <section className="relative py-28 md:py-40 px-6 lg:px-12 grain bg-stone-50">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative aspect-[4/5] overflow-hidden"
        >
          {imageUrl ? (
            <img src={imageUrl} alt="Yaseen Fabrics craftsmanship" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-zinc-200 to-zinc-300" />
          )}
          <div className="absolute inset-0 bg-gradient-to-tr from-stone-50/40 via-transparent to-transparent" />
          <div className="absolute -bottom-px -right-px h-32 w-32 border-r-2 border-b-2 border-rose-900/40" />
          <div className="absolute -top-px -left-px h-32 w-32 border-l-2 border-t-2 border-rose-900/40" />
        </motion.div>

        <div>
          <p className="text-[11px] uppercase tracking-luxury shimmer-text mb-6">Why Yaseen Fabrics</p>
          <h2 className="font-display text-4xl md:text-6xl text-zinc-900 leading-[1.05] mb-8">
            A house built on <em className="text-rose-900 not-italic">patience</em>, fabric, and craft.
          </h2>
          <p className="text-zinc-500 leading-relaxed mb-12 max-w-lg">
            Yaseen Fabrics was founded with one belief — that true luxury is patient.
            It listens to the fabric, follows the hand, and never raises its voice.
          </p>
          <div className="space-y-8">
            {features.map((f, i) => (
              <motion.div
                key={f.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="flex gap-6 pb-8 border-b border-rose-900/10 last:border-0"
              >
                <span className="font-display text-3xl text-rose-900/60 shrink-0">{f.n}</span>
                <div>
                  <h3 className="font-display text-2xl text-zinc-900 mb-2">{f.t}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{f.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Lookbook ─────────────────────────────────────────────────────────────────

function Lookbook({ images }: { images: string[] }) {
  const [img1, img2, img3] = images

  if (!img1 && !img2 && !img3) return null

  return (
    <section className="py-28 md:py-40 px-6 lg:px-12 max-w-[1400px] mx-auto">
      <SectionHeading
        eyebrow="The Lookbook"
        title="Current Season"
        subtitle="An editorial study of the season — fabric meeting form."
      />
      <div className="mt-20 grid grid-cols-12 gap-3 md:gap-5">
        {img1 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="col-span-12 md:col-span-7 aspect-[4/5] overflow-hidden group bg-zinc-100"
          >
            <img src={img1} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.6s] group-hover:scale-105" />
          </motion.div>
        )}
        {img2 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="col-span-6 md:col-span-5 aspect-square overflow-hidden group bg-zinc-100"
          >
            <img src={img2} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.6s] group-hover:scale-105" />
          </motion.div>
        )}
        {img3 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="col-span-6 md:col-span-5 aspect-[4/5] overflow-hidden group bg-zinc-100"
          >
            <img src={img3} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-[1.6s] group-hover:scale-105" />
          </motion.div>
        )}
      </div>
    </section>
  )
}

// ─── Articles ─────────────────────────────────────────────────────────────────

function Articles({ posts, loading }: { posts: ApiPost[]; loading: boolean }) {
  return (
    <section className="py-28 md:py-40 px-6 lg:px-12 max-w-[1400px] mx-auto">
      <SectionHeading eyebrow="Journal" title="Style & Fabric Insights" />

      <div className="mt-20 grid gap-8 md:grid-cols-3">
        {loading
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-12 w-full" />
              </div>
            ))
          : posts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="aspect-[4/3] overflow-hidden mb-6 bg-zinc-100">
                    {post.featured_image?.url ? (
                      <img
                        src={post.featured_image.url}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-[1.4s] group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-zinc-100 to-zinc-200" />
                    )}
                  </div>
                  <p className="text-[10px] uppercase tracking-luxury text-rose-900 mb-3">
                    {post.reading_time ? `${post.reading_time} min read` : 'Journal'}
                  </p>
                  <h3 className="font-display text-2xl text-zinc-900 mb-3 group-hover:text-rose-900 transition-colors duration-300">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-zinc-500 leading-relaxed mb-5 line-clamp-2">{post.excerpt}</p>
                  )}
                  <span className="text-[11px] uppercase tracking-luxury text-rose-900 luxury-underline">Read More →</span>
                </Link>
              </motion.article>
            ))}
      </div>
    </section>
  )
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function Testimonials() {
  const items = [
    {
      name: 'Ahmed Hassan',
      role: 'Karachi',
      quote: 'I have not worn another house since the day my Yaseen Fabrics suit was stitched. It is the only thing in my closet that feels truly alive.',
    },
    {
      name: 'Muhammad Ali',
      role: 'Lahore',
      quote: 'The hand of the fabric, the weight of the cotton — it is craftsmanship you happen to dress in. Nothing else comes close.',
    },
    {
      name: 'Hassan Khan',
      role: 'Dubai',
      quote: 'There is a quiet presence around a Yaseen piece. People notice, but gently. That is the highest compliment a house can earn.',
    },
  ]

  return (
    <section className="py-28 md:py-40 px-6 lg:px-12 bg-stone-50 grain">
      <div className="max-w-[1100px] mx-auto">
        <SectionHeading eyebrow="In Their Words" title="Spoken by Our Patrons" />
        <div className="mt-20 grid gap-8 md:grid-cols-3">
          {items.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="border border-rose-900/15 p-10 hover:border-rose-900/35 transition-colors duration-500 bg-white/70 backdrop-blur-sm"
            >
              <div className="flex gap-1 text-amber-500 mb-6">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="h-3 w-3 fill-current" />
                ))}
              </div>
              <p className="font-display italic text-lg leading-relaxed text-zinc-700 mb-8">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div>
                <p className="text-sm text-rose-900 font-medium">{t.name}</p>
                <p className="text-[11px] uppercase tracking-luxury text-zinc-400 mt-1">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

function CtaBanner() {
  return (
    <section className="relative py-32 md:py-44 px-6 lg:px-12 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, oklch(0.38 0.15 25) 0%, oklch(0.28 0.10 25) 60%, oklch(0.22 0.08 25) 100%)',
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(ellipse at center, oklch(0.56 0.22 25 / 0.4), transparent 60%)',
        }}
      />
      <div className="absolute inset-0 grain" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
        className="relative max-w-3xl mx-auto text-center"
      >
        <p className="text-[11px] uppercase tracking-luxury shimmer-text mb-6">Private Invitation</p>
        <h2 className="font-display text-5xl md:text-7xl leading-[1.05] text-white">
          Experience <em className="shimmer-text not-italic">Luxury</em>
          <br />Like Never Before
        </h2>
        <p className="mt-8 text-lg text-white/70 max-w-xl mx-auto">
          Step into our collection. Discover premium unstitched fabrics reserved for those who know.
        </p>
        <Link
          href="/shop"
          className="group mt-12 inline-flex items-center gap-3 px-12 py-5 bg-white text-rose-900 text-[11px] uppercase tracking-luxury font-medium hover:bg-stone-100 hover:shadow-[0_0_60px_-10px_white/30] transition-all duration-500"
        >
          Shop Now
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { addItem } = useCart()
  const [featuredCategories, setFeaturedCategories] = useState<ApiCategory[]>([])
  const [allCategories, setAllCategories] = useState<ApiCategory[]>([])
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getFeaturedCategories().then((r) => setFeaturedCategories(r.data.slice(0, 3))),
      getCategories({ per_page: 20 }).then((r) => setAllCategories(r.data)),
      getFeaturedProducts().then((r) => setProducts(r.data.slice(0, 8))),
      getPosts({ per_page: 3, is_published: 1 }).then((r) => setPosts(r.data)),
    ]).finally(() => setLoading(false))
  }, [])

  const handleQuickAdd = (product: ApiProduct) => {
    const price = product.discounted_price ?? product.price
    addItem({
      id: String(product.id),
      product_id: product.id,
      product_variant_id: null,
      name: product.name,
      price,
      quantity: 1,
      image: product.featured_image?.url,
    })
    toast.success(`${product.name} added to cart!`, {
      description: `Rs ${price.toLocaleString()}`,
    })
  }

  // Collect images for hero and lookbook
  const heroImageUrl = products[0]?.featured_image?.url ?? featuredCategories[0]?.image?.url
  const lookbookImages = [
    products[1]?.featured_image?.url,
    products[2]?.featured_image?.url,
    products[3]?.featured_image?.url,
  ].filter((u): u is string => Boolean(u))
  const whyImageUrl = products[4]?.featured_image?.url ?? featuredCategories[1]?.image?.url

  return (
    <main className="w-full">
      <Hero heroImageUrl={heroImageUrl} />
      {/* Newly Added Ring Slider Component */}
      <CategoryRingSlider categories={allCategories} loading={loading} />
      <FeaturedCollections categories={featuredCategories} loading={loading} />
      <ProductsSection products={products.slice(0, 4)} loading={loading} onQuickAdd={handleQuickAdd} />
      <WhyYaseenFabrics imageUrl={whyImageUrl} />
      {/* <Lookbook images={lookbookImages} /> */}
      {/* <Articles posts={posts} loading={loading} /> */}
      <Testimonials />
      <CtaBanner />
    </main>
  )
}
