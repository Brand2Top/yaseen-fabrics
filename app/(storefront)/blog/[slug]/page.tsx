'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, Calendar } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { getPost } from '@/lib/api'
import type { ApiPostDetail } from '@/lib/types'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = use(params)
  const [post, setPost] = useState<ApiPostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getPost(slug)
      .then(setPost)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Skeleton className="w-full aspect-[21/9]" />
        <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-40 mt-2" />
          <div className="space-y-3 mt-8">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className={`h-4 ${i % 4 === 3 ? 'w-2/3' : 'w-full'}`} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-500">{error ?? 'Post not found.'}</p>
        <Link href="/blog" className="text-rose-900 text-sm underline">
          Back to Blog
        </Link>
      </div>
    )
  }

  return (
    <article className="min-h-screen bg-white">
      {/* Featured image */}
      {post.featured_image?.url && (
        <div className="w-full aspect-[21/9] overflow-hidden bg-zinc-100">
          <motion.img
            src={post.featured_image.url}
            alt={post.title}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          />
        </div>
      )}

      {/* Article */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-rose-900 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to Blog
        </Link>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {formatDate(post.published_at ?? post.created_at)}
            </span>
            {post.reading_time && (
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {post.reading_time} min read
              </span>
            )}
          </div>

          {post.excerpt && (
            <p className="mt-5 text-lg text-zinc-600 leading-relaxed border-l-4 border-rose-900 pl-4 italic">
              {post.excerpt}
            </p>
          )}
        </motion.header>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-zinc-100">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-900 hover:text-rose-700 transition-colors"
          >
            <ArrowLeft size={14} />
            More articles
          </Link>
        </div>
      </div>
    </article>
  )
}
