'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Plus, Pencil, Trash2, Search, X, ChevronUp, ChevronDown,
  Upload, Star, CheckCircle, XCircle, Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
  getProduct,
  uploadMedia,
  deleteMedia,
  getAdminReviews,
  moderateReview,
  deleteAdminReview,
} from '@/lib/api'
import type {
  ApiProduct,
  ApiProductDetail,
  ApiCategory,
  PaginationMeta,
  SortOption,
  CreateProductBody,
  AdminReview,
  ReviewStatus,
  ReviewFilters,
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
type ModalTab = 'general' | 'media' | 'reviews'
type ReviewFilterTab = ReviewStatus | 'all'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FieldError({ errors, field }: { errors: Record<string, string[]>; field: string }) {
  const msgs = errors[field]
  if (!msgs?.length) return null
  return <p className="text-xs text-red-600 mt-1">{msgs[0]}</p>
}

// ─── ProductFormModal ─────────────────────────────────────────────────────────

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
  const [activeTab, setActiveTab] = useState<ModalTab>('general')
  const [savedProductId, setSavedProductId] = useState<number | null>(null)
  const productId = editing?.id ?? savedProductId

  // ─── General tab ────────────────────────────────
  const [form, setForm] = useState<CreateProductBody>(EMPTY_FORM)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [descriptionLoading, setDescriptionLoading] = useState(false)

  // ─── Product detail (for media + description) ───
  const [productDetail, setProductDetail] = useState<ApiProductDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  // ─── Media tab ──────────────────────────────────
  const [uploadingFeatured, setUploadingFeatured] = useState(false)
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [galleryPreviews, setGalleryPreviews] = useState<{ key: string; url: string }[]>([])
  const [deletingMediaId, setDeletingMediaId] = useState<number | null>(null)

  // ─── Reviews tab ────────────────────────────────
  const [reviews, setReviews] = useState<AdminReview[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [reviewStatusFilter, setReviewStatusFilter] = useState<ReviewFilterTab>('all')
  const [moderatingId, setModeratingId] = useState<number | null>(null)
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null)

  // ─── Init on open / close ──────────────────────
  useEffect(() => {
    if (!open) {
      setSavedProductId(null)
      setActiveTab('general')
      setProductDetail(null)
      setReviews([])
      setFeaturedPreview(null)
      setGalleryPreviews([])
      return
    }
    setFieldErrors({})
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
      setDescriptionLoading(true)
      getProduct(editing.id)
        .then((detail) => {
          setForm((prev) => ({ ...prev, description: detail.description ?? '' }))
          setProductDetail(detail)
        })
        .catch(() => {})
        .finally(() => setDescriptionLoading(false))
    } else {
      setForm(EMPTY_FORM)
      setSlugManuallyEdited(false)
    }
  }, [open, editing])

  // Load detail when switching to Media tab for new product
  useEffect(() => {
    if (activeTab !== 'media' || !productId) return
    if (productDetail?.id === productId) return
    setDetailLoading(true)
    getProduct(productId)
      .then(setProductDetail)
      .catch(() => {})
      .finally(() => setDetailLoading(false))
  }, [activeTab, productId, productDetail?.id])

  // Load reviews when switching to Reviews tab or changing filter
  useEffect(() => {
    if (activeTab !== 'reviews' || !productId) return
    setReviewsLoading(true)
    const filters: ReviewFilters = { product_id: productId, per_page: 20 }
    if (reviewStatusFilter !== 'all') filters.status = reviewStatusFilter as ReviewStatus
    getAdminReviews(filters)
      .then((res) => setReviews(res.data))
      .catch(() => {})
      .finally(() => setReviewsLoading(false))
  }, [activeTab, productId, reviewStatusFilter])

  // ─── General handlers ──────────────────────────
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
        onSaved()
        onClose()
      } else {
        const newProduct = await createProduct(form)
        toast.success('Product created — add images next')
        setSavedProductId(newProduct.id)
        setActiveTab('media')
        onSaved()
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        const e = err as Error & { errors?: Record<string, string[]> }
        if (e.errors) setFieldErrors(e.errors)
        toast.error(err.message)
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ─── Media handlers ────────────────────────────
  const refreshMedia = useCallback(async () => {
    if (!productId) return
    const updated = await getProduct(productId)
    setProductDetail(updated)
  }, [productId])

  const handleFeaturedUpload = async (file: File) => {
    if (!productId) return
    const previewUrl = URL.createObjectURL(file)
    setFeaturedPreview(previewUrl)
    setUploadingFeatured(true)
    try {
      await uploadMedia(file, 'Product', productId, 'featured')
      await refreshMedia()
      toast.success('Featured image uploaded')
    } catch {
      toast.error('Failed to upload image')
    } finally {
      URL.revokeObjectURL(previewUrl)
      setFeaturedPreview(null)
      setUploadingFeatured(false)
    }
  }

  const handleGalleryUpload = async (files: FileList) => {
    if (!productId) return
    const previews = Array.from(files).map((f) => ({
      key: Math.random().toString(36).slice(2),
      url: URL.createObjectURL(f),
    }))
    setGalleryPreviews(previews)
    setUploadingGallery(true)
    try {
      for (const file of Array.from(files)) {
        await uploadMedia(file, 'Product', productId, 'gallery')
      }
      await refreshMedia()
      toast.success(
        files.length > 1 ? `${files.length} images added to gallery` : 'Image added to gallery'
      )
    } catch {
      toast.error('Failed to upload images')
    } finally {
      previews.forEach((p) => URL.revokeObjectURL(p.url))
      setGalleryPreviews([])
      setUploadingGallery(false)
    }
  }

  const handleDeleteMedia = async (mediaId: number) => {
    setDeletingMediaId(mediaId)
    try {
      await deleteMedia(mediaId)
      await refreshMedia()
      toast.success('Image removed')
    } catch {
      toast.error('Failed to delete image')
    } finally {
      setDeletingMediaId(null)
    }
  }

  // ─── Review handlers ───────────────────────────
  const handleModerateReview = async (id: number, status: ReviewStatus) => {
    setModeratingId(id)
    try {
      await moderateReview(id, status)
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
      toast.success(status === 'Approved' ? 'Review approved' : 'Review rejected')
    } catch {
      toast.error('Failed to update review')
    } finally {
      setModeratingId(null)
    }
  }

  const handleDeleteReview = async (id: number) => {
    setDeletingReviewId(id)
    try {
      await deleteAdminReview(id)
      setReviews((prev) => prev.filter((r) => r.id !== id))
      toast.success('Review deleted')
    } catch {
      toast.error('Failed to delete review')
    } finally {
      setDeletingReviewId(null)
    }
  }

  // ─── Featured image display logic ─────────────
  const featuredImgSrc = uploadingFeatured && featuredPreview
    ? featuredPreview
    : productDetail?.featured_image?.url ?? null
  const featuredImgId = productDetail?.featured_image?.id ?? null
  const showFeaturedImage = !!featuredImgSrc

  // ─── Render ────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {editing ? 'Edit Product' : savedProductId ? 'Product Created' : 'Add Product'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ModalTab)}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="media" disabled={!productId}>Media</TabsTrigger>
            <TabsTrigger value="reviews" disabled={!productId}>Reviews</TabsTrigger>
          </TabsList>

          {/* ── General ─────────────────────────────── */}
          <TabsContent value="general" className="pt-4">
            <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
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

              <div>
                <Label className="text-sm font-medium">
                  Description *{' '}
                  {descriptionLoading && (
                    <span className="text-xs text-zinc-400 font-normal">Loading…</span>
                  )}
                </Label>
                <Textarea
                  value={form.description ?? ''}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Full product description..."
                  rows={4}
                  className="mt-1 resize-none"
                  required
                  disabled={descriptionLoading}
                />
                <FieldError errors={fieldErrors} field="description" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg">
                  <Label className="text-sm font-medium cursor-pointer">Active</Label>
                  <Switch checked={form.is_active} onCheckedChange={(v) => set('is_active', v)} />
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
          </TabsContent>

          {/* ── Media ───────────────────────────────── */}
          <TabsContent value="media" className="pt-4 space-y-6">
            {detailLoading ? (
              <div className="py-12 flex items-center justify-center gap-2 text-zinc-500 text-sm">
                <Loader2 size={16} className="animate-spin" />
                Loading media…
              </div>
            ) : (
              <>
                {/* Featured image */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-3">Featured Image</h3>
                  {showFeaturedImage ? (
                    <div className="flex items-start gap-4">
                      <div className="relative group w-32 h-32 flex-shrink-0">
                        <img
                          src={featuredImgSrc!}
                          alt="Featured"
                          className={`w-32 h-32 object-cover rounded-lg border border-zinc-200 transition-opacity ${
                            uploadingFeatured || deletingMediaId === featuredImgId
                              ? 'opacity-50'
                              : ''
                          }`}
                        />
                        {(uploadingFeatured || deletingMediaId === featuredImgId) && (
                          <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                            <Loader2 size={20} className="animate-spin text-zinc-600" />
                          </div>
                        )}
                        {!uploadingFeatured &&
                          featuredImgId !== null &&
                          deletingMediaId !== featuredImgId && (
                            <button
                              onClick={() => handleDeleteMedia(featuredImgId!)}
                              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={12} />
                            </button>
                          )}
                      </div>

                      {!uploadingFeatured &&
                        featuredImgId !== null &&
                        deletingMediaId !== featuredImgId && (
                          <div>
                            <p className="text-xs text-zinc-500 mb-2">Current featured image</p>
                            <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm px-3 py-1.5 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
                              <Upload size={14} />
                              Replace
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  e.target.files?.[0] && handleFeaturedUpload(e.target.files[0])
                                }
                              />
                            </label>
                          </div>
                        )}
                    </div>
                  ) : (
                    <label className="cursor-pointer block border-2 border-dashed border-zinc-200 rounded-lg p-8 text-center hover:border-zinc-400 transition-colors">
                      {uploadingFeatured ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2 size={24} className="animate-spin text-zinc-400" />
                          <p className="text-sm text-zinc-600">Uploading…</p>
                        </div>
                      ) : (
                        <>
                          <Upload size={24} className="mx-auto mb-2 text-zinc-400" />
                          <p className="text-sm text-zinc-600">Click to upload featured image</p>
                          <p className="text-xs text-zinc-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          e.target.files?.[0] && handleFeaturedUpload(e.target.files[0])
                        }
                        disabled={uploadingFeatured}
                      />
                    </label>
                  )}
                </div>

                {/* Gallery */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-900 mb-3">Gallery</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {/* Existing gallery images */}
                    {(productDetail?.gallery ?? []).map((img) => (
                      <div key={img.id} className="relative group aspect-square">
                        <img
                          src={img.url}
                          alt="Gallery"
                          className={`w-full h-full object-cover rounded-lg border border-zinc-200 transition-opacity ${
                            deletingMediaId === img.id ? 'opacity-50' : ''
                          }`}
                        />
                        {deletingMediaId === img.id ? (
                          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/30">
                            <Loader2 size={16} className="animate-spin text-zinc-600" />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleDeleteMedia(img.id)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    ))}

                    {/* Optimistic upload previews */}
                    {galleryPreviews.map((p) => (
                      <div key={p.key} className="relative aspect-square">
                        <img
                          src={p.url}
                          alt="Uploading"
                          className="w-full h-full object-cover rounded-lg border border-zinc-200 opacity-50"
                        />
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                          <Loader2 size={16} className="animate-spin text-zinc-600" />
                        </div>
                      </div>
                    ))}

                    {/* Add photos button */}
                    <label
                      className={`cursor-pointer aspect-square border-2 border-dashed border-zinc-200 rounded-lg flex flex-col items-center justify-center hover:border-zinc-400 transition-colors ${
                        uploadingGallery ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      <Upload size={20} className="text-zinc-400 mb-1" />
                      <span className="text-xs text-zinc-500">Add photos</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) =>
                          e.target.files?.length && handleGalleryUpload(e.target.files)
                        }
                        disabled={uploadingGallery}
                      />
                    </label>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* ── Reviews ─────────────────────────────── */}
          <TabsContent value="reviews" className="pt-4">
            <div className="flex gap-1 mb-4 border border-zinc-200 rounded-lg overflow-hidden w-fit text-sm">
              {(['all', 'Pending', 'Approved', 'Rejected'] as ReviewFilterTab[]).map((status) => (
                <button
                  key={status}
                  onClick={() => setReviewStatusFilter(status)}
                  className={`px-3 py-1.5 transition-colors ${
                    reviewStatusFilter === status
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>

            {reviewsLoading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 text-zinc-500 text-sm">No reviews found</div>
            ) : (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div key={review.id} className="border border-zinc-200 rounded-lg p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-zinc-900">{review.name}</span>
                          {review.email && (
                            <span className="text-xs text-zinc-400">{review.email}</span>
                          )}
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                              review.status === 'Approved'
                                ? 'bg-green-100 text-green-800'
                                : review.status === 'Rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {review.status}
                          </span>
                        </div>
                        {review.rating > 0 && (
                          <div className="flex items-center gap-0.5 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={
                                  i < review.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-zinc-300'
                                }
                              />
                            ))}
                          </div>
                        )}
                        {review.message && (
                          <p className="text-xs text-zinc-600 mt-1 line-clamp-2">
                            {review.message}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {review.status !== 'Approved' && (
                          <button
                            onClick={() => handleModerateReview(review.id, 'Approved')}
                            disabled={moderatingId === review.id}
                            className="p-1.5 rounded hover:bg-green-50 text-zinc-400 hover:text-green-700 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}
                        {review.status !== 'Rejected' && (
                          <button
                            onClick={() => handleModerateReview(review.id, 'Rejected')}
                            disabled={moderatingId === review.id}
                            className="p-1.5 rounded hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          disabled={deletingReviewId === review.id}
                          className="p-1.5 rounded hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingReviewId === review.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-zinc-400 mt-2">
                      {new Date(review.created_at).toLocaleDateString('en-PK', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            {activeTab === 'general' && !savedProductId ? 'Cancel' : 'Close'}
          </Button>
          {activeTab === 'general' && (
            <Button
              type="submit"
              form="product-form"
              disabled={submitting || descriptionLoading}
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
                'Create Product'
              )}
            </Button>
          )}
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

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [page, setPage] = useState(1)

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

    return () => {
      cancelled = true
    }
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
          onClick={() => { setEditingProduct(null); setShowForm(true) }}
          className="bg-rose-900 hover:bg-rose-950 text-white gap-2"
        >
          <Plus size={16} />
          Add Product
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

          <div className="flex border border-zinc-200 rounded-lg overflow-hidden text-sm">
            {(['all', '1', '0'] as ActiveFilter[]).map((v) => (
              <button
                key={v}
                onClick={() => { setActiveFilter(v); setPage(1) }}
                className={`px-3 py-2 transition-colors ${
                  activeFilter === v ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                {v === 'all' ? 'All' : v === '1' ? 'Active' : 'Inactive'}
              </button>
            ))}
          </div>

          <Select
            value={sortBy}
            onValueChange={(v) => { setSortBy(v as SortOption); setPage(1) }}
          >
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
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-zinc-100 flex-shrink-0 overflow-hidden">
                              {product.featured_image?.url && (
                                <img
                                  src={product.featured_image.url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-900 line-clamp-1">
                                {product.name}
                              </p>
                              <p className="text-xs text-zinc-400 font-mono">{product.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-zinc-600">{product.category.name}</span>
                        </TableCell>
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
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setEditingProduct(product); setShowForm(true) }}
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
