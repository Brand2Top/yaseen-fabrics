'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Eye,
  Search,
  X,
  Loader2,
  Calendar,
  Package,
  ChevronRight,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { getOrders, getOrderStatusCounts, getOrder, updateOrderStatus } from '@/lib/api'
import type {
  Order,
  OrderDetail,
  OrderStatus,
  OrderStatusCounts,
  PaginationMeta,
  OrderFilters,
} from '@/lib/types'

const PER_PAGE = 20

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-zinc-100 text-zinc-500',
}

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

const CHIP_COLORS: Record<string, string> = {
  all: 'bg-zinc-900 text-white',
  pending: 'bg-amber-500 text-white',
  processing: 'bg-blue-600 text-white',
  shipped: 'bg-purple-600 text-white',
  delivered: 'bg-green-600 text-white',
  cancelled: 'bg-zinc-400 text-white',
}

const CHIP_INACTIVE: Record<string, string> = {
  all: 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200',
  pending: 'bg-amber-50 text-amber-700 hover:bg-amber-100',
  processing: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
  shipped: 'bg-purple-50 text-purple-700 hover:bg-purple-100',
  delivered: 'bg-green-50 text-green-700 hover:bg-green-100',
  cancelled: 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatCurrency(amount: number) {
  return `Rs ${amount.toLocaleString('en-PK')}`
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge className={`${STATUS_BADGE_CLASS[status]} border-0 text-xs font-medium`}>
      {STATUS_LABELS[status]}
    </Badge>
  )
}

// ─── Order Detail Dialog ──────────────────────────────────────────────────────

function OrderDetailDialog({
  orderId,
  open,
  onOpenChange,
  onStatusUpdated,
}: {
  orderId: number | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onStatusUpdated: () => void
}) {
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | ''>('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!open || orderId === null) {
      setDetail(null)
      setDetailError(null)
      setSelectedStatus('')
      return
    }
    let cancelled = false
    setLoadingDetail(true)
    setDetailError(null)
    getOrder(orderId)
      .then((d) => {
        if (!cancelled) {
          setDetail(d)
          setSelectedStatus('')
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setDetailError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false)
      })
    return () => { cancelled = true }
  }, [open, orderId])

  const handleUpdateStatus = async () => {
    if (!detail || !selectedStatus) return
    setUpdating(true)
    try {
      const updated = await updateOrderStatus(detail.id, selectedStatus as OrderStatus)
      setDetail(updated)
      setSelectedStatus('')
      toast.success(`Order #${detail.id} status updated to ${STATUS_LABELS[updated.status]}`)
      onStatusUpdated()
    } catch {
      toast.error('Failed to update order status')
    } finally {
      setUpdating(false)
    }
  }

  const nextStatuses = detail ? NEXT_STATUSES[detail.status] : []
  const isTerminal = detail ? nextStatuses.length === 0 : false

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl font-bold text-zinc-900">
              {detail ? `Order #${detail.id}` : 'Order Detail'}
            </DialogTitle>
            {detail && <StatusBadge status={detail.status} />}
          </div>
        </DialogHeader>

        {loadingDetail && (
          <div className="space-y-4 py-4">
            <Skeleton className="h-5 w-48" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
            </div>
            <Skeleton className="h-40 w-full" />
          </div>
        )}

        {detailError && (
          <div className="py-8 text-center text-zinc-500">
            <p className="text-sm">Failed to load order: {detailError}</p>
          </div>
        )}

        {detail && !loadingDetail && (
          <div className="space-y-6 py-2">
            {/* Customer & Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Customer
                </h3>
                <div className="space-y-1.5 text-sm">
                  <p className="font-medium text-zinc-900">{detail.customer.name}</p>
                  <p className="text-zinc-500">{detail.customer.email}</p>
                  <p className="text-zinc-500">{detail.customer.phone}</p>
                  <p className="text-zinc-500">{detail.customer.address}</p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                  Shipping
                </h3>
                <div className="space-y-1.5 text-sm">
                  <p className="font-medium text-zinc-900">{detail.shipping_name}</p>
                  <p className="text-zinc-500">{detail.shipping_phone}</p>
                  <p className="text-zinc-500">{detail.shipping_address}</p>
                  <p className="inline-flex items-center gap-1 text-zinc-500">
                    <ChevronRight size={12} className="text-zinc-400" />
                    {detail.shipping_method}
                  </p>
                </div>
              </div>
            </div>

            {/* Promotion badge */}
            {detail.promotion && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Promotion applied:</span>
                <Badge className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium">
                  {detail.promotion.name}
                  {detail.promotion.code && (
                    <span className="ml-1 font-mono">({detail.promotion.code})</span>
                  )}
                </Badge>
              </div>
            )}

            {/* Items table */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Items
              </h3>
              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                      <TableHead className="text-zinc-500 font-semibold text-xs">Product</TableHead>
                      <TableHead className="text-zinc-500 font-semibold text-xs text-center w-20">Qty</TableHead>
                      <TableHead className="text-zinc-500 font-semibold text-xs text-right w-28">Unit Price</TableHead>
                      <TableHead className="text-zinc-500 font-semibold text-xs text-right w-28">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {detail.items.map((item) => (
                      <TableRow key={item.id} className="border-zinc-100">
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded bg-zinc-100 flex-shrink-0 overflow-hidden">
                              {item.product.featured_image?.url ? (
                                <img
                                  src={item.product.featured_image.url}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package size={16} className="text-zinc-400" />
                                </div>
                              )}
                            </div>
                            <div className="space-y-1 min-w-0">
                              <p className="text-sm font-medium text-zinc-900 line-clamp-1">
                                {item.product.name}
                              </p>
                              {item.variant && (
                                <div className="flex flex-wrap gap-1">
                                  {item.variant.attributes.map((attr, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center text-xs bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded"
                                    >
                                      {attr.attribute}: {attr.value}
                                    </span>
                                  ))}
                                  <span className="inline-flex items-center text-xs bg-zinc-50 text-zinc-400 border border-zinc-200 px-1.5 py-0.5 rounded font-mono">
                                    {item.variant.sku}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm text-zinc-700">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right text-sm text-zinc-700">
                          {formatCurrency(item.unit_price)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-zinc-900 font-medium">
                          {formatCurrency(item.total_price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Totals */}
                <div className="border-t border-zinc-100 bg-zinc-50 px-4 py-3 space-y-1.5">
                  <div className="flex justify-between text-sm text-zinc-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(detail.subtotal)}</span>
                  </div>
                  {detail.discount_amount > 0 && (
                    <div className="flex justify-between text-sm text-green-700">
                      <span>Discount</span>
                      <span>- {formatCurrency(detail.discount_amount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-zinc-600">
                    <span>Shipping ({detail.shipping_method})</span>
                    <span>{formatCurrency(detail.shipping_cost)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-zinc-900 pt-1.5 border-t border-zinc-200">
                    <span>Total</span>
                    <span>{formatCurrency(detail.total_amount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status update footer */}
            <div className="border-t border-zinc-100 pt-4">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Update Status
              </h3>
              {isTerminal ? (
                <p className="text-sm text-zinc-500 italic">
                  This order is in a terminal state and cannot be updated.
                </p>
              ) : (
                <div className="flex items-center gap-3">
                  <Select
                    value={selectedStatus}
                    onValueChange={(v) => setSelectedStatus(v as OrderStatus)}
                    disabled={updating}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select next status…" />
                    </SelectTrigger>
                    <SelectContent>
                      {nextStatuses.map((s) => (
                        <SelectItem key={s} value={s}>
                          {STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleUpdateStatus}
                    disabled={!selectedStatus || updating}
                    className="bg-rose-900 hover:bg-rose-950 text-white gap-2"
                  >
                    {updating ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Updating…
                      </>
                    ) : (
                      'Update Status'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type StatusChip = 'all' | OrderStatus

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [statusCounts, setStatusCounts] = useState<OrderStatusCounts | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [activeChip, setActiveChip] = useState<StatusChip>('all')
  const [page, setPage] = useState(1)

  const [detailId, setDetailId] = useState<number | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Load status counts
  const loadStatusCounts = useCallback(() => {
    getOrderStatusCounts()
      .then(setStatusCounts)
      .catch(() => { /* silently fail */ })
  }, [])

  // Load orders list
  const loadOrders = useCallback(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const filters: OrderFilters = { per_page: PER_PAGE, page }
    if (search) filters.search = search
    if (activeChip !== 'all') filters.status = activeChip
    if (dateFrom) filters.date_from = dateFrom
    if (dateTo) filters.date_to = dateTo

    getOrders(filters)
      .then((res) => {
        if (!cancelled) {
          setOrders(res.data)
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
  }, [search, activeChip, dateFrom, dateTo, page])

  useEffect(() => {
    const cleanup = loadOrders()
    return cleanup
  }, [loadOrders])

  useEffect(() => {
    loadStatusCounts()
  }, [loadStatusCounts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleChipClick = (chip: StatusChip) => {
    setActiveChip(chip)
    setPage(1)
  }

  const handleStatusUpdated = () => {
    loadOrders()
    loadStatusCounts()
  }

  const openDetail = (id: number) => {
    setDetailId(id)
    setDialogOpen(true)
  }

  const totalPages = meta?.last_page ?? 1

  const chips: { key: StatusChip; label: string; count: number | null }[] = [
    { key: 'all', label: 'All', count: statusCounts?.total ?? null },
    { key: 'pending', label: 'Pending', count: statusCounts?.pending ?? null },
    { key: 'processing', label: 'Processing', count: statusCounts?.processing ?? null },
    { key: 'shipped', label: 'Shipped', count: statusCounts?.shipped ?? null },
    { key: 'delivered', label: 'Delivered', count: statusCounts?.delivered ?? null },
    { key: 'cancelled', label: 'Cancelled', count: statusCounts?.cancelled ?? null },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900">Orders</h1>
        <p className="text-zinc-600 mt-1 text-sm">
          {statusCounts
            ? `${statusCounts.total} orders total`
            : 'Manage and track customer orders'}
        </p>
      </div>

      {/* Status count chips */}
      <div className="flex flex-wrap gap-2">
        {chips.map(({ key, label, count }) => {
          const isActive = activeChip === key
          return (
            <button
              key={key}
              onClick={() => handleChipClick(key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isActive ? CHIP_COLORS[key] : CHIP_INACTIVE[key]
              }`}
            >
              {label}
              {count !== null && (
                <span
                  className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white/20' : 'bg-black/10'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-lg border border-zinc-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email, or order ID…"
              className="pl-9 pr-8"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  setSearch('')
                  setPage(1)
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2"
              >
                <X size={14} className="text-zinc-400 hover:text-zinc-700" />
              </button>
            )}
          </form>

          {/* Date range */}
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Calendar size={14} className="text-zinc-400 flex-shrink-0" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
              className="h-9 w-36 text-xs"
              placeholder="From"
            />
            <span className="text-zinc-400">–</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
              className="h-9 w-36 text-xs"
              placeholder="To"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); setPage(1) }}
                className="text-zinc-400 hover:text-zinc-700"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
        {error ? (
          <div className="text-center py-16 text-zinc-600">
            <p className="mb-3 text-sm">Failed to load orders: {error}</p>
            <button onClick={loadOrders} className="text-rose-900 text-sm hover:underline">
              Try again
            </button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="text-zinc-600 font-semibold w-24">Order ID</TableHead>
                <TableHead className="text-zinc-600 font-semibold">Customer</TableHead>
                <TableHead className="text-zinc-600 font-semibold text-center w-20">Items</TableHead>
                <TableHead className="text-zinc-600 font-semibold text-right w-32">Total</TableHead>
                <TableHead className="text-zinc-600 font-semibold text-center w-32">Status</TableHead>
                <TableHead className="text-zinc-600 font-semibold w-32">Date</TableHead>
                <TableHead className="text-right text-zinc-600 font-semibold w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? [...Array(8)].map((_, i) => (
                    <TableRow key={i} className="border-zinc-100">
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-36" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20 ml-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 mx-auto rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-7 w-8 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                : orders.length === 0
                  ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-16 text-zinc-500">
                        <div className="flex flex-col items-center gap-2">
                          <Package size={32} className="text-zinc-300" />
                          <p className="text-sm">No orders found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                  : orders.map((order) => (
                      <TableRow
                        key={order.id}
                        className="border-zinc-100 hover:bg-zinc-50 transition-colors"
                      >
                        {/* Order ID */}
                        <TableCell>
                          <span className="text-sm font-mono font-medium text-zinc-700">
                            #{order.id}
                          </span>
                        </TableCell>

                        {/* Customer */}
                        <TableCell>
                          <div>
                            <p className="text-sm font-medium text-zinc-900">
                              {order.customer.name}
                            </p>
                            <p className="text-xs text-zinc-400 mt-0.5">
                              {order.customer.email}
                            </p>
                          </div>
                        </TableCell>

                        {/* Items count */}
                        <TableCell className="text-center">
                          <span className="text-sm text-zinc-700">{order.items_count}</span>
                        </TableCell>

                        {/* Total */}
                        <TableCell className="text-right">
                          <span className="text-sm font-semibold text-zinc-900">
                            {formatCurrency(order.total_amount)}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          <StatusBadge status={order.status} />
                        </TableCell>

                        {/* Date */}
                        <TableCell>
                          <span className="text-sm text-zinc-500 flex items-center gap-1.5">
                            <Calendar size={13} className="text-zinc-400 flex-shrink-0" />
                            {formatDate(order.created_at)}
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center justify-end">
                            <button
                              onClick={() => openDetail(order.id)}
                              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
                              title="View order"
                            >
                              <Eye size={15} />
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

      {/* Order Detail Dialog */}
      <OrderDetailDialog
        orderId={detailId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onStatusUpdated={handleStatusUpdated}
      />
    </motion.div>
  )
}
