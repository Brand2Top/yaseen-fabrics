'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Search, X, Mail, MailOpen, Trash2, Loader2, Eye,
  Phone, Calendar, RefreshCw,
} from 'lucide-react'
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { getEnquiries, markEnquiryRead, markEnquiryUnread, deleteEnquiry } from '@/lib/api'
import type { Enquiry, EnquiryFilters, PaginationMeta } from '@/lib/types'

const PER_PAGE = 20

type ReadFilter = 'all' | 'unread' | 'read'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ─── View Dialog ──────────────────────────────────────────────────────────────

function EnquiryViewDialog({
  enquiry,
  onClose,
  onUpdate,
}: {
  enquiry: Enquiry | null
  onClose: () => void
  onUpdate: (updated: Enquiry) => void
}) {
  const [toggling, setToggling] = useState(false)

  const handleToggleRead = async () => {
    if (!enquiry) return
    setToggling(true)
    try {
      const updated = enquiry.is_read
        ? await markEnquiryUnread(enquiry.id)
        : await markEnquiryRead(enquiry.id)
      onUpdate(updated)
      toast.success(updated.is_read ? 'Marked as read' : 'Marked as unread')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setToggling(false)
    }
  }

  return (
    <Dialog open={!!enquiry} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl pr-6 leading-snug">
            {enquiry?.subject}
          </DialogTitle>
        </DialogHeader>

        {enquiry && (
          <div className="space-y-5 pt-1">
            {/* Sender info */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-400 w-14 flex-shrink-0">Name</span>
                <span className="font-medium text-zinc-900">{enquiry.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-400 w-14 flex-shrink-0">Email</span>
                <a
                  href={`mailto:${enquiry.email}`}
                  className="text-rose-900 hover:underline break-all"
                >
                  {enquiry.email}
                </a>
              </div>
              {enquiry.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-zinc-400 w-14 flex-shrink-0">Phone</span>
                  <span className="flex items-center gap-1.5 text-zinc-700">
                    <Phone size={13} className="text-zinc-400" />
                    {enquiry.phone}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-zinc-400 w-14 flex-shrink-0">Date</span>
                <span className="flex items-center gap-1.5 text-zinc-600">
                  <Calendar size={13} className="text-zinc-400" />
                  {formatDateTime(enquiry.created_at)}
                </span>
              </div>
            </div>

            {/* Message */}
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                Message
              </p>
              <div className="border border-zinc-200 rounded-lg p-4 bg-zinc-50 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                {enquiry.message}
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleRead}
                disabled={toggling}
                className="gap-2 text-xs"
              >
                {toggling ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : enquiry.is_read ? (
                  <Mail size={13} />
                ) : (
                  <MailOpen size={13} />
                )}
                {enquiry.is_read ? 'Mark as Unread' : 'Mark as Read'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const [page, setPage] = useState(1)

  const [viewEnquiry, setViewEnquiry] = useState<Enquiry | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Enquiry | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  // ─── Data loading ──────────────────────────────────────────────────────────

  const loadEnquiries = useCallback(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const filters: EnquiryFilters = { per_page: PER_PAGE, page }
    if (search) filters.search = search
    if (readFilter === 'unread') filters.is_read = false
    if (readFilter === 'read') filters.is_read = true

    getEnquiries(filters)
      .then((res) => {
        if (!cancelled) {
          setEnquiries(res.data)
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
  }, [search, readFilter, page])

  useEffect(() => {
    const cleanup = loadEnquiries()
    return cleanup
  }, [loadEnquiries])

  // ─── Auto-mark read on view dialog open ───────────────────────────────────

  useEffect(() => {
    if (!viewEnquiry || viewEnquiry.is_read) return

    markEnquiryRead(viewEnquiry.id)
      .then((updated) => {
        setViewEnquiry(updated)
        setEnquiries((prev) =>
          prev.map((e) => (e.id === updated.id ? updated : e))
        )
      })
      .catch(() => {})
  }, [viewEnquiry?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleOpenView = (enquiry: Enquiry) => {
    setViewEnquiry(enquiry)
  }

  const handleViewUpdate = (updated: Enquiry) => {
    setViewEnquiry(updated)
    setEnquiries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
  }

  const handleToggleRead = async (enquiry: Enquiry) => {
    setTogglingId(enquiry.id)
    try {
      const updated = enquiry.is_read
        ? await markEnquiryUnread(enquiry.id)
        : await markEnquiryRead(enquiry.id)
      setEnquiries((prev) => prev.map((e) => (e.id === updated.id ? updated : e)))
      toast.success(updated.is_read ? 'Marked as read' : 'Marked as unread')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteEnquiry(deleteTarget.id)
      toast.success('Enquiry deleted')
      setDeleteTarget(null)
      loadEnquiries()
    } catch {
      toast.error('Failed to delete enquiry')
    } finally {
      setDeleting(false)
    }
  }

  const totalPages = meta?.last_page ?? 1

  // ─── Render ───────────────────────────────────────────────────────────────

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
          <h1 className="text-3xl font-bold text-zinc-900">Enquiries</h1>
          <p className="text-zinc-600 mt-1 text-sm">
            {meta ? `${meta.total} enquiries total` : 'Customer messages and enquiries'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadEnquiries}
          className="gap-2 text-xs"
          disabled={loading}
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh
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
              placeholder="Search enquiries…"
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
            {(['all', 'unread', 'read'] as ReadFilter[]).map((v) => (
              <button
                key={v}
                onClick={() => { setReadFilter(v); setPage(1) }}
                className={`px-3 py-2 transition-colors capitalize ${
                  readFilter === v
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {v === 'all' ? 'All' : v === 'unread' ? 'Unread' : 'Read'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
        {error ? (
          <div className="text-center py-16 text-zinc-600">
            <p className="mb-3">Failed to load enquiries: {error}</p>
            <button onClick={loadEnquiries} className="text-rose-900 text-sm hover:underline">
              Try again
            </button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="text-zinc-600 font-semibold w-[28%]">Sender</TableHead>
                <TableHead className="text-zinc-600 font-semibold w-[30%]">Subject</TableHead>
                <TableHead className="text-zinc-600 font-semibold">Date</TableHead>
                <TableHead className="text-zinc-600 font-semibold text-center">Status</TableHead>
                <TableHead className="text-right text-zinc-600 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? [...Array(8)].map((_, i) => (
                    <TableRow key={i} className="border-zinc-100">
                      <TableCell>
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-44" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-16 mx-auto rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-7 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                : enquiries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16 text-zinc-500">
                        No enquiries found
                      </TableCell>
                    </TableRow>
                  )
                : enquiries.map((enquiry) => (
                    <TableRow
                      key={enquiry.id}
                      className="border-zinc-100 hover:bg-zinc-50 transition-colors"
                    >
                      {/* Sender */}
                      <TableCell>
                        <p className="text-sm font-medium text-zinc-900 line-clamp-1">
                          {enquiry.name}
                        </p>
                        <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                          {enquiry.email}
                        </p>
                      </TableCell>

                      {/* Subject */}
                      <TableCell>
                        <button
                          onClick={() => handleOpenView(enquiry)}
                          className="text-sm text-left hover:text-rose-900 transition-colors line-clamp-1 w-full"
                        >
                          <span className={enquiry.is_read ? 'text-zinc-600' : 'font-semibold text-zinc-900'}>
                            {enquiry.subject}
                          </span>
                        </button>
                      </TableCell>

                      {/* Date */}
                      <TableCell>
                        <span className="text-sm text-zinc-500 flex items-center gap-1.5">
                          <Calendar size={13} className="text-zinc-400 flex-shrink-0" />
                          {formatDate(enquiry.created_at)}
                        </span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        {enquiry.is_read ? (
                          <Badge className="bg-zinc-100 text-zinc-500 border-0 text-xs">
                            Read
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-100 text-rose-800 border-0 text-xs">
                            Unread
                          </Badge>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {/* View */}
                          <button
                            onClick={() => handleOpenView(enquiry)}
                            className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors"
                            title="View enquiry"
                          >
                            <Eye size={14} />
                          </button>

                          {/* Mark read/unread toggle */}
                          <button
                            onClick={() => handleToggleRead(enquiry)}
                            disabled={togglingId === enquiry.id}
                            className="p-1.5 rounded hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition-colors disabled:opacity-50"
                            title={enquiry.is_read ? 'Mark as unread' : 'Mark as read'}
                          >
                            {togglingId === enquiry.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : enquiry.is_read ? (
                              <Mail size={14} />
                            ) : (
                              <MailOpen size={14} />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(enquiry)}
                            className="p-1.5 rounded hover:bg-red-50 text-zinc-500 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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

      {/* View Dialog */}
      <EnquiryViewDialog
        enquiry={viewEnquiry}
        onClose={() => setViewEnquiry(null)}
        onUpdate={handleViewUpdate}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete enquiry?</AlertDialogTitle>
            <AlertDialogDescription>
              The enquiry from <strong>{deleteTarget?.name}</strong> regarding &quot;
              {deleteTarget?.subject}&quot; will be permanently deleted and cannot be recovered.
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
