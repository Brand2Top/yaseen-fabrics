'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, X, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
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
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from '@/lib/api'
import type {
  ApiProduct,
  ApiCategory,
  PaginationMeta,
  SortOption,
  CreateProductBody,
} from '@/lib/types'

const PER_PAGE = 15

const toSlug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const EMPTY_FORM: CreateProductBody = {
  category_id: 0,
  name: '',
  slug: '',
  description: '',
  price: 0,
  discounted_price: null,
  stock: 0,
  is_active: true,
  is_featured: false,
}

type ActiveFilter = 'all' | '1' | '0'

// ─── Subcomponents ────────────────────────────────────────────────────────────

function FieldError({ errors, field }: { errors: Record<string, string[]>; field: string }) {
  const msgs = errors[field]
  if (!msgs?.length) return null
  return <p className="text-xs text-red-600 mt-1">{msgs[0]}</p>
}

function ProductFormModal({
  open,
  onClose,
  editing,
  categories,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  editing: ApiProduct | null
  categories: ApiCategory[]
  onSaved: () => void
}) {
  const [form, setForm] = useState<CreateProductBody>(EMPTY_FORM)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (!open) return
    if (editing) {
      setForm({
        category_id: editing.category.id,
        name: editing.name,
        slug: editing.slug,
        description: '',
        price: editing.price,
        discounted_price: editing.discounted_price ?? null,
        stock: editing.stock,
        is_active: editing.is_active,
        is_featured: editing.is_featured,
      })
      setSlugManuallyEdited(true)
    } else {
      setForm(EMPTY_FORM)
      setSlugManuallyEdited(false)
    }
    setFieldErrors({})
  }, [open, editing])

  const set = <K extends keyof CreateProductBody>(key: K, value: CreateProductBody[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleNameChange = (name: string) => {
    set('name', name)
    if (!slugManuallyEdited) set('slug', toSlug(name))
  }

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true)
    set('slug', slug)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    if (!form.category_id) {
      setFieldErrors({ category_id: ['Please select a category'] })
      return
    }

    setSubmitting(true)
    try {
      if (editing) {
        await updateProduct(editing.id, form)
        toast.success('Product updated')
      } else {
        await createProduct(form)
        toast.success('Product created')
      }
      onSaved()
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error && (err as { errors?: Record<string, string[]> }).errors) {
        setFieldErrors((err as { errors: Record<string, string[]> }).errors)
        toast.error(err.message)
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {editing ? 'Edit Product' : 'Add Product'}
          </DialogTitle>
        </DialogHeader>

        <form id="product-form" onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Name */}
          <div>
            <Label className="text-sm font-medium">Name *</Label>
            <Input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Product name"
              className="mt-1"
              required
            />
            <FieldError errors={fieldErrors} field="name" />
          </div>

          {/* Slug */}
          <div>
            <Label className="text-sm font-medium">Slug *</Label>
            <Input
              value={form.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="product-slug"
              className="mt-1 font-mono text-sm"
              required
            />
            <FieldError errors={fieldErrors} field="slug" />
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm font-medium">Category *</Label>
            <Select
              value={form.category_id ? String(form.category_id) : ''}
              onValueChange={(v) => set('category_id', parseInt(v))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={fieldErrors} field="category_id" />
          </div>

          {/* Price + Discounted Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Price (Rs) *</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.price || ''}
                onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                placeholder="2500"
                className="mt-1"
                required
              />
              <FieldError errors={fieldErrors} field="price" />
            </div>
            <div>
              <Label className="text-sm font-medium">Discounted Price (Rs)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.discounted_price ?? ''}
                onChange={(e) => {
                  const v = e.target.value
                  set('discounted_price', v === '' ? null : parseFloat(v))
                }}
                placeholder="Optional"
                className="mt-1"
              />
              <FieldError errors={fieldErrors} field="discounted_price" />
            </div>
          </div>

          {/* Stock */}
          <div>
            <Label className="text-sm font-medium">Stock *</Label>
            <Input
              type="number"
              min="0"
              value={form.stock || ''}
              onChange={(e) => set('stock', parseInt(e.target.value) || 0)}
              placeholder="42"
              className="mt-1"
              required
            />
            <FieldError errors={fieldErrors} field="stock" />
          </div>

          {/* Description */}
          <div>
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Full product description..."
              rows={3}
              className="mt-1 resize-none"
            />
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg">
              <Label className="text-sm font-medium cursor-pointer">Active</Label>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => set('is_active', v)}
              />
            </div>
            <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg">
              <Label className="text-sm font-medium cursor-pointer">Featured</Label>
              <Switch
                checked={form.is_featured}
                onCheckedChange={(v) => set('is_featured', v)}
              />
            </div>
          </div>
        </form>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="product-form"
            disabled={submitting}
            className="bg-rose-900 hover:bg-rose-950 text-white"
          >
            {submitting ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [meta, setMeta] = useState<PaginationMeta | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [page, setPage] = useState(1)

  // Modals
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiProduct | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadProducts = useCallback(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const filters: Parameters<typeof getAdminProducts>[0] = {
      sort: sortBy,
      per_page: PER_PAGE,
      page,
    }
    if (search) filters.search = search
    if (activeFilter !== 'all') filters.is_active = parseInt(activeFilter) as 1 | 0

    getAdminProducts(filters)
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

    return () => { cancelled = true }
  }, [search, activeFilter, sortBy, page])

  useEffect(() => {
    const cleanup = loadProducts()
    return cleanup
  }, [loadProducts])

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {})
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleActiveFilterChange = (v: ActiveFilter) => {
    setActiveFilter(v)
    setPage(1)
  }

  const openCreate = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const openEdit = (product: ApiProduct) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProduct(deleteTarget.id)
      toast.success(`"${deleteTarget.name}" deleted`)
      setDeleteTarget(null)
      loadProducts()
    } catch {
      toast.error('Failed to delete product')
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
          <h1 className="text-3xl font-bold text-zinc-900">Products</h1>
          <p className="text-zinc-600 mt-1 text-sm">
            {meta ? `${meta.total} products total` : 'Manage inventory and pricing'}
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-rose-900 hover:bg-rose-950 text-white gap-2"
        >
          <Plus size={16} />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-zinc-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products..."
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

          {/* Active filter tabs */}
          <div className="flex border border-zinc-200 rounded-lg overflow-hidden text-sm">
            {(['all', '1', '0'] as ActiveFilter[]).map((v) => (
              <button
                key={v}
                onClick={() => handleActiveFilterChange(v)}
                className={`px-3 py-2 transition-colors ${
                  activeFilter === v
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {v === 'all' ? 'All' : v === '1' ? 'Active' : 'Inactive'}
              </button>
            ))}
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortOption); setPage(1) }}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="price_asc">Price: Low → High</SelectItem>
              <SelectItem value="price_desc">Price: High → Low</SelectItem>
              <SelectItem value="rating">Top Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
        {error ? (
          <div className="text-center py-16 text-zinc-600">
            <p className="mb-3">Failed to load products: {error}</p>
            <button onClick={loadProducts} className="text-rose-900 text-sm hover:underline">
              Try again
            </button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="text-zinc-600 font-semibold w-[40%]">Product</TableHead>
                <TableHead className="text-zinc-600 font-semibold">Category</TableHead>
                <TableHead className="text-zinc-600 font-semibold">Price</TableHead>
                <TableHead className="text-zinc-600 font-semibold text-center">Stock</TableHead>
                <TableHead className="text-zinc-600 font-semibold text-center">Status</TableHead>
                <TableHead className="text-right text-zinc-600 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? [...Array(PER_PAGE)].map((_, i) => (
                    <TableRow key={i} className="border-zinc-100">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-10 h-10 rounded flex-shrink-0" />
                          <div className="space-y-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-10 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-14 mx-auto rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-7 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-16 text-zinc-500">
                        No products found
                      </TableCell>
                    </TableRow>
                  )
                : products.map((product) => {
                    const hasDiscount =
                      product.discounted_price != null &&
                      product.discounted_price < product.price

                    return (
                      <TableRow
                        key={product.id}
                        className="border-zinc-100 hover:bg-zinc-50 transition-colors"
                      >
                        {/* Product name + image */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-zinc-100 flex-shrink-0 overflow-hidden">
                              {product.featured_image?.url ? (
                                <img
                                  src={product.featured_image.url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : null}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-900 line-clamp-1">
                                {product.name}
                              </p>
                              <p className="text-xs text-zinc-400 font-mono">{product.slug}</p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Category */}
                        <TableCell>
                          <span className="text-sm text-zinc-600">{product.category.name}</span>
                        </TableCell>

                        {/* Price */}
                        <TableCell>
                          {hasDiscount ? (
                            <div>
                              <span className="text-sm font-semibold text-zinc-900">
                                Rs {product.discounted_price!.toLocaleString()}
                              </span>
                              <span className="text-xs text-zinc-400 line-through ml-1.5">
                                Rs {product.price.toLocaleString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm font-semibold text-zinc-900">
                              Rs {product.price.toLocaleString()}
                            </span>
                          )}
                        </TableCell>

                        {/* Stock */}
                        <TableCell className="text-center">
                          <span
                            className={`text-sm font-medium ${
                              product.stock === 0
                                ? 'text-red-600'
                                : product.stock <= 10
                                ? 'text-amber-600'
                                : 'text-zinc-900'
                            }`}
                          >
                            {product.stock}
                          </span>
                        </TableCell>

                        {/* Status */}
                        <TableCell className="text-center">
                          <div className="flex flex-col items-center gap-1">
                            <Badge
                              className={
                                product.is_active
                                  ? 'bg-green-100 text-green-800 border-0 text-xs'
                                  : 'bg-zinc-100 text-zinc-600 border-0 text-xs'
                              }
                            >
                              {product.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {product.is_featured && (
                              <Badge className="bg-rose-100 text-rose-800 border-0 text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEdit(product)}
                              className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(product)}
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
                className="h-8 w-8 p-0"
              >
                <ChevronUp className="rotate-[-90deg]" size={14} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="h-8 w-8 p-0"
              >
                <ChevronDown className="rotate-[-90deg]" size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <ProductFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        editing={editingProduct}
        categories={categories}
        onSaved={loadProducts}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>&quot;{deleteTarget?.name}&quot;</strong> will be soft-deleted and hidden
              from the store. This can be reversed by re-activating the product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}
