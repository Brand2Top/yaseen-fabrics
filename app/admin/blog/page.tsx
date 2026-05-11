'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, X, Loader2, Clock, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { getAdminPosts, deletePost } from '@/lib/api'
import type { ApiPost, PaginationMeta, PostFilters } from '@/lib/types'

const PER_PAGE = 15

type StatusFilter = 'all' | 'published' | 'drafts'

function getPostStatus(post: ApiPost): 'published' | 'scheduled' | 'draft' {
  if (!post.is_published) return 'draft'
  if (post.published_at && new Date(post.published_at) > new Date()) return 'scheduled'
  return 'published'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function AdminBlogPage() {
  const router = useRouter()
  const [posts, setPosts] = useState<ApiPost[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(1)

  const [deleteTarget, setDeleteTarget] = useState<ApiPost | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadPosts = useCallback(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const filters: PostFilters = { per_page: PER_PAGE, page }
    if (search) filters.search = search
    if (statusFilter === 'published') filters.is_published = 1
    if (statusFilter === 'drafts') filters.is_published = 0

    getAdminPosts(filters)
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
  }, [search, statusFilter, page])

  useEffect(() => {
    const cleanup = loadPosts()
    return cleanup
  }, [loadPosts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deletePost(deleteTarget.id)
      toast.success(`"${deleteTarget.title}" deleted`)
      setDeleteTarget(null)
      loadPosts()
    } catch {
      toast.error('Failed to delete post')
    } finally {
      setDeleting(false)
    }
  }

  const totalPages = meta?.last_page ?? 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Blog</h1>
          <p className="text-zinc-600 mt-1 text-sm">
            {meta ? `${meta.total} posts total` : 'Manage blog posts'}
          </p>
        </div>
        <Button
          onClick={() => router.push('/admin/blog/new')}
          className="bg-rose-900 hover:bg-rose-950 text-white gap-2"
        >
          <Plus size={16} />
          New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-zinc-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search posts…"
              className="pl-9 pr-8"
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

          <div className="flex border border-zinc-200 rounded-lg overflow-hidden text-sm">
            {(['all', 'published', 'drafts'] as StatusFilter[]).map((v) => (
              <button
                key={v}
                onClick={() => { setStatusFilter(v); setPage(1) }}
                className={`px-3 py-2 transition-colors capitalize ${
                  statusFilter === v
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
        {error ? (
          <div className="text-center py-16 text-zinc-600">
            <p className="mb-3">Failed to load posts: {error}</p>
            <button onClick={loadPosts} className="text-rose-900 text-sm hover:underline">
              Try again
            </button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="text-zinc-600 font-semibold w-[50%]">Post</TableHead>
                <TableHead className="text-zinc-600 font-semibold text-center">Status</TableHead>
                <TableHead className="text-zinc-600 font-semibold">Date</TableHead>
                <TableHead className="text-right text-zinc-600 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? [...Array(8)].map((_, i) => (
                    <TableRow key={i} className="border-zinc-100">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-14 h-10 rounded flex-shrink-0" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-5 w-20 mx-auto rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-7 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                : posts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-16 text-zinc-500">
                        No posts found
                      </TableCell>
                    </TableRow>
                  )
                : posts.map((post) => {
                    const status = getPostStatus(post)

                    return (
                      <TableRow
                        key={post.id}
                        className="border-zinc-100 hover:bg-zinc-50 transition-colors"
                      >
                        {/* Title */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-10 rounded bg-zinc-100 flex-shrink-0 overflow-hidden">
                              {post.featured_image?.url && (
                                <img
                                  src={post.featured_image.url}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-900 line-clamp-1">
                                {post.title}
                              </p>
                              {post.excerpt && (
                                <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                                  {post.excerpt}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          {status === 'published' && (
                            <Badge className="bg-green-100 text-green-800 border-0 text-xs">
                              Published
                            </Badge>
                          )}
                          {status === 'scheduled' && (
                            <Badge className="bg-amber-100 text-amber-800 border-0 text-xs gap-1">
                              <Clock size={10} />
                              Scheduled
                            </Badge>
                          )}
                          {status === 'draft' && (
                            <Badge className="bg-zinc-100 text-zinc-600 border-0 text-xs">
                              Draft
                            </Badge>
                          )}
                        </TableCell>

                        {/* Date */}
                        <TableCell>
                          <span className="text-sm text-zinc-500 flex items-center gap-1.5">
                            <Calendar size={13} className="text-zinc-400" />
                            {formatDate(
                              post.published_at ?? post.updated_at ?? post.created_at
                            )}
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => router.push(`/admin/blog/${post.id}/edit`)}
                              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(post)}
                              className="p-1.5 rounded hover:bg-red-50 text-zinc-600 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100">
            <p className="text-xs text-zinc-500">
              Page {page} of {totalPages} · {meta?.total} total
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="h-8 px-3 text-xs"
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 px-3 text-xs"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>&quot;{deleteTarget?.title}&quot;</strong> will be permanently deleted,
              including its featured image.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  Deleting…
                </span>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
