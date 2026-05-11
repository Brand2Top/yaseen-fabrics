'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, X, Clock, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { getPosts } from '@/lib/api'
import type { ApiPost, PaginationMeta } from '@/lib/types'

const PER_PAGE = 9

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function BlogCard({ post, index }: { post: ApiPost; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <div className="bg-white rounded-xl overflow-hidden border border-zinc-100 hover:border-zinc-200 hover:shadow-md transition-all duration-300 h-full flex flex-col">
          {/* Image */}
          <div className="aspect-[16/9] bg-zinc-100 overflow-hidden flex-shrink-0">
            {post.featured_image?.url ? (
              <img
                src={post.featured_image.url}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-100 to-zinc-200 flex items-center justify-center">
                <span className="text-zinc-300 text-4xl font-serif">YF</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
              <span>{formatDate(post.published_at ?? post.created_at)}</span>
              {post.reading_time && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {post.reading_time} min read
                  </span>
                </>
              )}
            </div>

            <h2 className="font-serif text-lg font-bold text-zinc-900 leading-snug mb-2 group-hover:text-rose-900 transition-colors line-clamp-2">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3 flex-1">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center gap-1 text-xs font-medium text-rose-900 mt-4">
              Read article
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}

function BlogCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-zinc-100">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <div className="space-y-1.5 pt-1">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-5/6" />
          <Skeleton className="h-3.5 w-4/6" />
        </div>
      </div>
    </div>
  )
}

export default function BlogPage() {
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    getPosts({ per_page: PER_PAGE, page, ...(search ? { search } : {}) })
      .then((res) => {
        if (!cancelled) {
          setPosts(res.data)
          setMeta(res.meta)
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [page, search])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const totalPages = meta?.last_page ?? 1

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero */}
      <section className="bg-white border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <p className="text-xs font-semibold tracking-widest text-rose-900 uppercase mb-4">
              Our Blog
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-zinc-900 leading-tight mb-4">
              Stories, Style & Craft
            </h1>
            <p className="text-zinc-500 text-lg">
              Guides, style tips, and behind-the-scenes from Yaseen Fabrics.
            </p>
          </motion.div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative mt-8 max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search articles…"
              className="w-full pl-9 pr-8 py-2.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 transition-colors"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <X size={14} className="text-zinc-400 hover:text-zinc-700" />
              </button>
            )}
          </form>
        </div>
      </section>

      {/* Posts grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 mb-4">Failed to load posts.</p>
            <button
              onClick={() => { setPage(1); setSearch('') }}
              className="text-rose-900 text-sm underline"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(PER_PAGE)].map((_, i) => <BlogCardSkeleton key={i} />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">No articles found.</p>
            {search && (
              <button
                onClick={() => { setSearchInput(''); setSearch(''); setPage(1) }}
                className="text-rose-900 text-sm underline mt-2"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <BlogCard key={post.id} post={post} index={i} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-100 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-zinc-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-100 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
