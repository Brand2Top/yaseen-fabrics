'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/context/cart-context'
import { toast } from 'sonner'

// Hero Section
function HeroSection() {
  return (
    <section className="relative w-full h-[600px] md:h-[700px] bg-gradient-to-br from-zinc-100 via-zinc-50 to-white overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 right-20 w-96 h-96 bg-rose-900 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center justify-center px-4">
        <motion.div
          className="text-center max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-zinc-900 mb-4 leading-tight text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Elevate Your Style
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-zinc-600 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Premium unstitched fabrics crafted for the discerning gentleman
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link href="/shop">
              <Button className="bg-rose-900 hover:bg-rose-950 text-white px-10 py-6 rounded-sm transition-colors duration-300">
                Explore Now
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// Collections Section
function CollectionsSection() {
  const collections = [
    {
      id: 1,
      name: 'Lawn',
      description: 'Breathable summer essentials',
      image: 'https://images.unsplash.com/photo-1608231387042-2142a120dae1?w=500&h=600&fit=crop'
    },
    {
      id: 2,
      name: 'Cotton',
      description: 'Premium Egyptian Cotton',
      image: 'https://images.unsplash.com/photo-1589330189881-8a898e13da57?w=500&h=600&fit=crop'
    },
    {
      id: 3,
      name: 'Wash & Wear',
      description: 'Effortless everyday comfort',
      image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&h=600&fit=crop'
    },
  ]

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-zinc-900 mb-4 text-balance">
            Explore Collections
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Discover our curated selection of premium unstitched fabrics
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {collections.map((collection, index) => (
            <motion.div
              key={collection.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
              className="group relative h-[400px] rounded-lg overflow-hidden cursor-pointer"
            >
              <img
                src={collection.image}
                alt={collection.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="font-serif text-3xl font-bold text-white mb-2">
                  {collection.name}
                </h3>
                <p className="text-white/90 mb-4">{collection.description}</p>
                <Link href="/shop">
                  <button className="inline-flex items-center gap-2 text-white hover:gap-3 transition-all duration-300">
                    Explore <ChevronRight size={18} />
                  </button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Best Sellers Section
function BestSellersSection() {
  const { addItem } = useCart()
  
  const bestSellers = [
    {
      id: '1',
      name: 'Royal Egyptian Cotton',
      price: 8499,
      rating: 4.8,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=300&h=300&fit=crop',
      badge: 'Bestseller'
    },
    {
      id: '2',
      name: 'Premium Lawn Collection',
      price: 4299,
      rating: 4.9,
      reviews: 243,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=300&h=300&fit=crop',
      badge: 'New'
    },
    {
      id: '3',
      name: 'Summer Breeze Karandi',
      price: 5899,
      rating: 4.7,
      reviews: 98,
      image: 'https://images.unsplash.com/photo-1608231387042-2142a120dae1?w=300&h=300&fit=crop',
      badge: 'Bestseller'
    },
    {
      id: '4',
      name: 'Elite Wash & Wear',
      price: 3899,
      rating: 4.6,
      reviews: 189,
      image: 'https://images.unsplash.com/photo-1589330189881-8a898e13da57?w=300&h=300&fit=crop',
      badge: 'New'
    },
  ]

  const handleQuickAdd = (product: typeof bestSellers[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    })
    toast.success(`${product.name} added to cart!`, {
      description: `Rs ${product.price.toLocaleString()}`,
    })
  }

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-zinc-900 mb-4 text-balance">
            Best Sellers
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Curated favorites from our most loyal customers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestSellers.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
              className="group bg-white border border-zinc-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative h-64 bg-zinc-100 overflow-hidden">
                {/* Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-rose-900 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    {product.badge}
                  </span>
                </div>

                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Details */}
              <div className="p-6">
                <Link href={`/product/${product.id}`}>
                  <h3 className="font-medium text-zinc-900 mb-2 hover:text-rose-900 transition-colors duration-300 line-clamp-2 cursor-pointer">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={`${
                          i < Math.floor(product.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-zinc-600 ml-1">
                    {product.rating} ({product.reviews})
                  </span>
                </div>

                {/* Price */}
                <p className="font-serif text-lg font-bold text-zinc-900 mb-4">
                  Rs {product.price.toLocaleString()}
                </p>

                {/* Quick Add Button */}
                <div className="flex gap-3">
                  <Link href={`/product/${product.id}`} className="flex-1">
                    <Button variant="outline" className="w-full text-zinc-900 border-zinc-300 hover:border-zinc-900 hover:bg-zinc-50 transition-all duration-300">
                      View
                    </Button>
                  </Link>
                  <button
                    onClick={() => handleQuickAdd(product)}
                    className="flex-1 bg-rose-900 text-white hover:bg-rose-950 transition-all duration-300 font-medium py-2 rounded"
                  >
                    Quick Add
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Reviews Section
function ReviewsSection() {
  const reviews = [
    {
      id: 1,
      author: 'Ahmed Hassan',
      rating: 5,
      text: 'Absolutely premium quality. The Egyptian Cotton exceeded my expectations in every way.',
      initials: 'AH'
    },
    {
      id: 2,
      author: 'Muhammad Ali',
      rating: 5,
      text: 'Best fabric I&apos;ve ever purchased. Delivery was quick and packaging was immaculate.',
      initials: 'MA'
    },
    {
      id: 3,
      author: 'Hassan Khan',
      rating: 5,
      text: 'Customer service is exceptional. The team helped me choose the perfect fabric.',
      initials: 'HK'
    },
  ]

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-zinc-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-zinc-900 mb-4 text-balance">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Real reviews from satisfied customers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
              className="bg-white p-8 rounded-lg border border-zinc-200 hover:shadow-md transition-all duration-300"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-zinc-700 mb-6 leading-relaxed">{review.text}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-900 text-white flex items-center justify-center font-semibold text-sm">
                  {review.initials}
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 text-sm">{review.author}</p>
                  <p className="text-zinc-600 text-xs">Verified Customer</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Style Guides Section
function StyleGuidesSection() {
  const guides = [
    {
      id: 1,
      title: 'How to Choose Your Length',
      excerpt: 'Learn the ideal fabric length for different styles and body types.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop'
    },
    {
      id: 2,
      title: 'Fabric Care 101',
      excerpt: 'Master the art of caring for your premium fabrics for longevity.',
      image: 'https://images.unsplash.com/photo-1582716743212-827c9e760c23?w=300&h=300&fit=crop'
    },
    {
      id: 3,
      title: 'Color Matching Guide',
      excerpt: 'Discover color palettes that complement your skin tone perfectly.',
      image: 'https://images.unsplash.com/photo-1595526514017-a82e7f773908?w=300&h=300&fit=crop'
    },
  ]

  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-white" id="guides">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: '-100px' }}
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-zinc-900 mb-4 text-balance">
            Style Guides
          </h2>
          <p className="text-lg text-zinc-600 max-w-2xl mx-auto">
            Expert tips to help you make the most of your purchase
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {guides.map((guide, index) => (
            <motion.a
              key={guide.id}
              href="#"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
              className="group"
            >
              <div className="mb-4 overflow-hidden rounded-lg h-48 bg-zinc-100 border border-zinc-200">
                <img
                  src={guide.image}
                  alt={guide.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="font-semibold text-zinc-900 mb-2 group-hover:text-rose-900 transition-colors duration-300 text-balance">
                {guide.title}
              </h3>
              <p className="text-sm text-zinc-600 mb-4">{guide.excerpt}</p>
              <div className="flex items-center gap-1 text-zinc-900 group-hover:gap-2 transition-all duration-300">
                <span className="text-sm font-medium">Read More</span>
                <ChevronRight size={16} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}

// Final CTA Section
function FinalCTASection() {
  return (
    <section className="py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-rose-900">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
            Ready to Elevate Your Wardrobe?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Browse our complete collection of premium unstitched fabrics
          </p>
          <Link href="/shop">
            <Button className="bg-white text-rose-900 hover:bg-zinc-100 px-10 py-3 text-lg font-medium transition-all duration-300">
              Shop Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <main className="w-full">
      <HeroSection />
      <CollectionsSection />
      <BestSellersSection />
      <ReviewsSection />
      <StyleGuidesSection />
      <FinalCTASection />
    </main>
  )
}
