'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '@/lib/api'
import type {
  Promotion,
  PromotionType,
  DiscountType,
  RuleType,
  CreatePromotionBody,
  PaginationMeta,
  PromotionFilters,
} from '@/lib/types'

const PER_PAGE = 15

// ─── Type filter tabs ─────────────────────────────────────────────────────────

type TypeFilter = 'all' | PromotionType

const TYPE_TABS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'coupon', label: 'Coupon' },
  { value: 'auto_rule', label: 'Auto Rule' },
  { value: 'bundle', label: 'Bundle' },
]

// ─── Type badge ───────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: PromotionType }) {
  const map: Record<PromotionType, { bg: string; label: string }> = {
    coupon:    { bg: 'bg-blue-100 text-blue-800',   label: 'Coupon' },
    auto_rule: { bg: 'bg-purple-100 text-purple-800', label: 'Auto Rule' },
    bundle:    { bg: 'bg-amber-100 text-amber-800',  label: 'Bundle' },
  }
  const { bg, label } = map[type]
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bg}`}>{label}</span>
  )
}

// ─── Discount display ─────────────────────────────────────────────────────────

function discountLabel(p: Promotion): string {
  if (p.discount_type === 'percentage') return `${p.discount_value}% off`
  return `Rs ${p.discount_value.toLocaleString()} off`
}

// ─── Empty form factory ───────────────────────────────────────────────────────

function emptyForm(type: PromotionType): CreatePromotionBody {
  return {
    type,
    name: '',
    code: null,
    discount_type: 'percentage',
    discount_value: 0,
    max_discount_amount: null,
    ends_at: null,
    max_uses: null,
    max_uses_per_customer: null,
    rule_type: type === 'auto_rule' ? 'quantity' : null,
    rule_quantity: null,
    rule_spend_amount: null,
    rule_category_constraint: null,
    bundle_buy_qty: null,
    bundle_get_qty: null,
    bundle_same_product: null,
    bundle_free_product_id: null,
    eligible_products: [],
  }
}

// ─── PromotionFormModal ───────────────────────────────────────────────────────

function PromotionFormModal({
  open,
  onClose,
  editing,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  editing: Promotion | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<CreatePromotionBody>(emptyForm('coupon'))
  const [submitting, setSubmitting] = useState(false)

  // Seed form when modal opens / editing changes
  useEffect(() => {
    if (!open) return
    if (editing) {
      const { id: _id, is_active: _ia, created_at: _ca, updated_at: _ua, ...rest } = editing
      setForm({ ...rest, eligible_products: [] })
    } else {
      setForm(emptyForm('coupon'))
    }
  }, [open, editing])

  // Typed setter
  const set = <K extends keyof CreatePromotionBody>(key: K, value: CreatePromotionBody[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  // When type changes reset type-specific fields
  const handleTypeChange = (t: PromotionType) => {
    setForm((prev) => ({
      ...emptyForm(t),
      // keep common fields
      name: prev.name,
      discount_type: prev.discount_type,
      discount_value: prev.discount_value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      // Coerce empty strings to null for optional numeric fields
      const body: CreatePromotionBody = {
        ...form,
        max_discount_amount: form.max_discount_amount || null,
        max_uses: form.max_uses || null,
        max_uses_per_customer: form.max_uses_per_customer || null,
        rule_quantity: form.rule_quantity || null,
        rule_spend_amount: form.rule_spend_amount || null,
        bundle_buy_qty: form.bundle_buy_qty || null,
        bundle_get_qty: form.bundle_get_qty || null,
        bundle_free_product_id: form.bundle_free_product_id || null,
        ends_at: form.ends_at || null,
        code: form.type === 'coupon' ? (form.code || null) : null,
      }
      if (editing) {
        await updatePromotion(editing.id, body)
        toast.success('Promotion updated')
      } else {
        await createPromotion(body)
        toast.success('Promotion created')
      }
      onSaved()
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const isCoupon   = form.type === 'coupon'
  const isAutoRule = form.type === 'auto_rule'
  const isBundle   = form.type === 'bundle'

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {editing ? 'Edit Promotion' : 'New Promotion'}
          </DialogTitle>
        </DialogHeader>

        <form id="promo-form" onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* ── Type selector ─────────────────────────────── */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Type</Label>
            <div className="flex border border-zinc-200 rounded-lg overflow-hidden text-sm w-full">
              {(['coupon', 'auto_rule', 'bundle'] as PromotionType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`flex-1 py-2 transition-colors ${
                    form.type === t
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {t === 'coupon' ? 'Coupon' : t === 'auto_rule' ? 'Auto Rule' : 'Bundle'}
                </button>
              ))}
            </div>
          </div>

          {/* ── Common: Name ──────────────────────────────── */}
          <div>
            <Label className="text-sm font-medium">Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Promotion name"
              className="mt-1"
              required
            />
          </div>

          {/* ── Common: Discount ─────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium">Discount Type *</Label>
              <Select
                value={form.discount_type}
                onValueChange={(v) => set('discount_type', v as DiscountType)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed_amount">Fixed Amount (Rs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">
                Discount Value *{' '}
                <span className="text-zinc-400 font-normal">
                  {form.discount_type === 'percentage' ? '%' : 'Rs'}
                </span>
              </Label>
              <Input
                type="number"
                min="0"
                step={form.discount_type === 'percentage' ? '1' : '0.01'}
                value={form.discount_value || ''}
                onChange={(e) => set('discount_value', parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="mt-1"
                required
              />
            </div>
          </div>

          {/* ── Coupon-specific ───────────────────────────── */}
          {isCoupon && (
            <>
              <div>
                <Label className="text-sm font-medium">Code *</Label>
                <Input
                  value={form.code ?? ''}
                  onChange={(e) => set('code', e.target.value.toUpperCase())}
                  placeholder="SUMMER20"
                  className="mt-1 font-mono tracking-wider"
                  required
                />
              </div>

              {form.discount_type === 'percentage' && (
                <div>
                  <Label className="text-sm font-medium">
                    Max Discount Amount (Rs){' '}
                    <span className="text-zinc-400 font-normal text-xs">optional</span>
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.max_discount_amount ?? ''}
                    onChange={(e) =>
                      set('max_discount_amount', e.target.value ? parseFloat(e.target.value) : null)
                    }
                    placeholder="e.g. 500"
                    className="mt-1"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">
                    Max Uses{' '}
                    <span className="text-zinc-400 font-normal text-xs">optional</span>
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.max_uses ?? ''}
                    onChange={(e) =>
                      set('max_uses', e.target.value ? parseInt(e.target.value) : null)
                    }
                    placeholder="Unlimited"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Max Per Customer{' '}
                    <span className="text-zinc-400 font-normal text-xs">optional</span>
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.max_uses_per_customer ?? ''}
                    onChange={(e) =>
                      set('max_uses_per_customer', e.target.value ? parseInt(e.target.value) : null)
                    }
                    placeholder="Unlimited"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Expires At{' '}
                  <span className="text-zinc-400 font-normal text-xs">optional</span>
                </Label>
                <Input
                  type="date"
                  value={form.ends_at ? form.ends_at.split('T')[0] : ''}
                  onChange={(e) =>
                    set('ends_at', e.target.value ? `${e.target.value}T23:59:59Z` : null)
                  }
                  className="mt-1"
                />
              </div>
            </>
          )}

          {/* ── Auto Rule-specific ────────────────────────── */}
          {isAutoRule && (
            <>
              <div>
                <Label className="text-sm font-medium mb-2 block">Rule Type *</Label>
                <div className="flex border border-zinc-200 rounded-lg overflow-hidden text-sm w-fit">
                  {(['quantity', 'spend'] as RuleType[]).map((rt) => (
                    <button
                      key={rt}
                      type="button"
                      onClick={() => {
                        set('rule_type', rt)
                        set('rule_quantity', null)
                        set('rule_spend_amount', null)
                        set('rule_category_constraint', null)
                      }}
                      className={`px-4 py-2 transition-colors ${
                        form.rule_type === rt
                          ? 'bg-zinc-900 text-white'
                          : 'text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      {rt === 'quantity' ? 'Quantity' : 'Spend'}
                    </button>
                  ))}
                </div>
              </div>

              {form.rule_type === 'quantity' && (
                <>
                  <div>
                    <Label className="text-sm font-medium">Min Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={form.rule_quantity ?? ''}
                      onChange={(e) =>
                        set('rule_quantity', e.target.value ? parseInt(e.target.value) : null)
                      }
                      placeholder="e.g. 3"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">
                      Category Constraint{' '}
                      <span className="text-zinc-400 font-normal text-xs">optional</span>
                    </Label>
                    <Select
                      value={form.rule_category_constraint ?? ''}
                      onValueChange={(v) =>
                        set('rule_category_constraint', v as 'same' | 'any' | null || null)
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="None" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="any">Any category</SelectItem>
                        <SelectItem value="same">Same category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {form.rule_type === 'spend' && (
                <div>
                  <Label className="text-sm font-medium">Min Spend Amount (Rs) *</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.rule_spend_amount ?? ''}
                    onChange={(e) =>
                      set('rule_spend_amount', e.target.value ? parseFloat(e.target.value) : null)
                    }
                    placeholder="e.g. 5000"
                    className="mt-1"
                    required
                  />
                </div>
              )}
            </>
          )}

          {/* ── Bundle-specific ───────────────────────────── */}
          {isBundle && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium">Buy Qty *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.bundle_buy_qty ?? ''}
                    onChange={(e) =>
                      set('bundle_buy_qty', e.target.value ? parseInt(e.target.value) : null)
                    }
                    placeholder="e.g. 2"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Get Qty *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.bundle_get_qty ?? ''}
                    onChange={(e) =>
                      set('bundle_get_qty', e.target.value ? parseInt(e.target.value) : null)
                    }
                    placeholder="e.g. 1"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg">
                <div>
                  <Label className="text-sm font-medium cursor-pointer">Same Product</Label>
                  <p className="text-xs text-zinc-400 mt-0.5">Free item is the same as the qualifying product</p>
                </div>
                <Switch
                  checked={form.bundle_same_product ?? false}
                  onCheckedChange={(v) => {
                    set('bundle_same_product', v)
                    if (v) set('bundle_free_product_id', null)
                  }}
                  className="data-[state=checked]:bg-rose-900"
                />
              </div>

              {!form.bundle_same_product && (
                <div>
                  <Label className="text-sm font-medium">
                    Free Product ID{' '}
                    <span className="text-zinc-400 font-normal text-xs">optional</span>
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.bundle_free_product_id ?? ''}
                    onChange={(e) =>
                      set(
                        'bundle_free_product_id',
                        e.target.value ? parseInt(e.target.value) : null
                      )
                    }
                    placeholder="Product ID"
                    className="mt-1"
                  />
                </div>
              )}
            </>
          )}
        </form>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="promo-form"
            disabled={submitting}
            className="bg-rose-900 hover:bg-rose-950 text-white"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </span>
            ) : editing ? (
              'Save Changes'
            ) : (
              'Create Promotion'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PromoCodesPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [page, setPage] = useState(1)

  const [showForm, setShowForm] = useState(false)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const loadPromotions = useCallback(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const filters: PromotionFilters = { per_page: PER_PAGE, page }
    if (search) filters.search = search
    if (typeFilter !== 'all') filters.type = typeFilter as PromotionType

    getPromotions(filters)
      .then((res) => {
        if (!cancelled) {
          setPromotions(res.data)
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
  }, [search, typeFilter, page])

  useEffect(() => {
    const cleanup = loadPromotions()
    return cleanup
  }, [loadPromotions])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleToggleActive = async (promo: Promotion) => {
    setTogglingId(promo.id)
    try {
      const { id: _id, created_at: _ca, updated_at: _ua, ...rest } = promo
      // is_active is excluded from CreatePromotionBody by type, but the API accepts it on update
      const updated = await updatePromotion(
        promo.id,
        { ...rest, is_active: !promo.is_active, eligible_products: [] } as CreatePromotionBody
      )
      setPromotions((prev) => prev.map((p) => (p.id === promo.id ? updated : p)))
      toast.success(!promo.is_active ? 'Promotion activated' : 'Promotion deactivated')
    } catch {
      toast.error('Failed to update promotion')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deletePromotion(deleteTarget.id)
      toast.success(`"${deleteTarget.name}" deleted`)
      setDeleteTarget(null)
      loadPromotions()
    } catch {
      toast.error('Failed to delete promotion')
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
          <h1 className="text-3xl font-bold text-zinc-900">Promo Codes</h1>
          <p className="text-zinc-600 mt-1 text-sm">
            {meta ? `${meta.total} promotion${meta.total !== 1 ? 's' : ''} total` : 'Manage discounts and promotional campaigns'}
          </p>
        </div>
        <Button
          onClick={() => { setEditingPromotion(null); setShowForm(true) }}
          className="bg-rose-900 hover:bg-rose-950 text-white gap-2"
        >
          <Plus size={16} />
          New Promotion
        </Button>
      </div>

      {/* Filter bar */}
      <div className="bg-white rounded-lg border border-zinc-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search promotions..."
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

          {/* Type tabs */}
          <div className="flex border border-zinc-200 rounded-lg overflow-hidden text-sm">
            {TYPE_TABS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setTypeFilter(value); setPage(1) }}
                className={`px-3 py-2 transition-colors ${
                  typeFilter === value ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
        {error ? (
          <div className="text-center py-16 text-zinc-600">
            <p className="mb-3">Failed to load promotions: {error}</p>
            <button onClick={loadPromotions} className="text-rose-900 text-sm hover:underline">
              Try again
            </button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="text-zinc-600 font-semibold">Name</TableHead>
                <TableHead className="text-zinc-600 font-semibold">Type</TableHead>
                <TableHead className="text-zinc-600 font-semibold">Code</TableHead>
                <TableHead className="text-zinc-600 font-semibold">Discount</TableHead>
                <TableHead className="text-zinc-600 font-semibold text-center">Status</TableHead>
                <TableHead className="text-zinc-600 font-semibold">Expires</TableHead>
                <TableHead className="text-right text-zinc-600 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? [...Array(8)].map((_, i) => (
                    <TableRow key={i} className="border-zinc-100">
                      <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell>
                        <div className="flex flex-col items-center gap-1.5">
                          <Skeleton className="h-5 w-14 rounded-full mx-auto" />
                          <Skeleton className="h-5 w-8 rounded-full mx-auto" />
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-7 w-14 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                : promotions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-16 text-zinc-500">
                        No promotions found
                      </TableCell>
                    </TableRow>
                  )
                : promotions.map((promo) => (
                    <TableRow
                      key={promo.id}
                      className="border-zinc-100 hover:bg-zinc-50 transition-colors"
                    >
                      {/* Name */}
                      <TableCell>
                        <p className="text-sm font-medium text-zinc-900">{promo.name}</p>
                      </TableCell>

                      {/* Type */}
                      <TableCell>
                        <TypeBadge type={promo.type} />
                      </TableCell>

                      {/* Code */}
                      <TableCell>
                        {promo.code ? (
                          <span className="font-mono text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                            {promo.code}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </TableCell>

                      {/* Discount */}
                      <TableCell>
                        <span className="text-sm text-zinc-700">{discountLabel(promo)}</span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <Badge
                            className={
                              promo.is_active
                                ? 'bg-green-100 text-green-800 border-0 text-xs'
                                : 'bg-zinc-100 text-zinc-600 border-0 text-xs'
                            }
                          >
                            {promo.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <div className="flex justify-center">
                            {togglingId === promo.id ? (
                              <Loader2 size={14} className="animate-spin text-zinc-400" />
                            ) : (
                              <Switch
                                checked={promo.is_active}
                                onCheckedChange={() => handleToggleActive(promo)}
                                className="data-[state=checked]:bg-rose-900 scale-75"
                              />
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Expires */}
                      <TableCell>
                        {promo.ends_at ? (
                          <span className="text-xs text-zinc-600">
                            {new Date(promo.ends_at).toLocaleDateString('en-PK', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        ) : (
                          <span className="text-xs text-zinc-400">Never</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditingPromotion(promo); setShowForm(true) }}
                            className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(promo)}
                            className="p-1.5 rounded hover:bg-red-50 text-zinc-600 hover:text-red-600 transition-colors"
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
                className="h-8 w-8 p-0"
              >
                <ChevronLeft size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <PromotionFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        editing={editingPromotion}
        onSaved={loadPromotions}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete promotion?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>&quot;{deleteTarget?.name}&quot;</strong> will be permanently deleted and can
              no longer be applied to orders.
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
