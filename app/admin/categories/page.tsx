'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, X, Upload, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
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
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadMedia,
  deleteMedia,
} from '@/lib/api'
import type { ApiCategory, CreateCategoryBody } from '@/lib/types'

const toSlug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const EMPTY_FORM: CreateCategoryBody = {
  name: '',
  slug: '',
  description: '',
  is_featured: false,
}

type ModalTab = 'general' | 'image'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FieldError({ errors, field }: { errors: Record<string, string[]>; field: string }) {
  const msgs = errors[field]
  if (!msgs?.length) return null
  return <p className="text-xs text-red-600 mt-1">{msgs[0]}</p>
}

// ─── CategoryFormModal ────────────────────────────────────────────────────────

function CategoryFormModal({
  open,
  onClose,
  editing,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  editing: ApiCategory | null
  onSaved: () => void
}) {
  const [activeTab, setActiveTab] = useState<ModalTab>('general')
  const [savedCategory, setSavedCategory] = useState<ApiCategory | null>(null)
  const category = editing ?? savedCategory

  // ─── General tab ────────────────────────────────
  const [form, setForm] = useState<CreateCategoryBody>(EMPTY_FORM)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  // ─── Image tab ──────────────────────────────────
  const [currentImage, setCurrentImage] = useState<{ id: number; url: string } | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deletingImage, setDeletingImage] = useState(false)

  // ─── Init on open / close ──────────────────────
  useEffect(() => {
    if (!open) {
      setSavedCategory(null)
      setActiveTab('general')
      setCurrentImage(null)
      setImagePreview(null)
      return
    }
    setFieldErrors({})
    if (editing) {
      setForm({
        name: editing.name,
        slug: editing.slug,
        description: editing.description ?? '',
        is_featured: editing.is_featured,
      })
      setSlugManuallyEdited(true)
      setCurrentImage(editing.image ?? null)
    } else {
      setForm(EMPTY_FORM)
      setSlugManuallyEdited(false)
    }
  }, [open, editing])

  const set = <K extends keyof CreateCategoryBody>(key: K, value: CreateCategoryBody[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleNameChange = (name: string) => {
    set('name', name)
    if (!slugManuallyEdited) set('slug', toSlug(name))
  }

  const handleSlugChange = (slug: string) => {
    setSlugManuallyEdited(true)
    set('slug', slug)
  }

  // ─── General submit ────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    setSubmitting(true)
    try {
      if (editing) {
        await updateCategory(editing.id, form)
        toast.success('Category updated')
        onSaved()
        onClose()
      } else {
        const created = await createCategory(form)
        toast.success('Category created — add an image next')
        setSavedCategory(created)
        setCurrentImage(created.image ?? null)
        setActiveTab('image')
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

  // ─── Image handlers ────────────────────────────
  const handleImageUpload = async (file: File) => {
    if (!category) return
    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
    setUploading(true)
    try {
      if (currentImage) {
        await deleteMedia(currentImage.id)
      }
      const media = await uploadMedia(file, 'Category', category.id, 'image')
      setCurrentImage({ id: media.id, url: media.url })
      onSaved()
      toast.success('Image uploaded')
    } catch {
      toast.error('Failed to upload image')
    } finally {
      URL.revokeObjectURL(previewUrl)
      setImagePreview(null)
      setUploading(false)
    }
  }

  const handleImageDelete = async () => {
    if (!currentImage) return
    setDeletingImage(true)
    try {
      await deleteMedia(currentImage.id)
      setCurrentImage(null)
      onSaved()
      toast.success('Image removed')
    } catch {
      toast.error('Failed to delete image')
    } finally {
      setDeletingImage(false)
    }
  }

  // Determine what to display in image section
  const displaySrc = uploading && imagePreview ? imagePreview : currentImage?.url ?? null
  const isBusy = uploading || deletingImage

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {editing ? 'Edit Category' : savedCategory ? 'Category Created' : 'Add Category'}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ModalTab)}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="image" disabled={!category}>Image</TabsTrigger>
          </TabsList>

          {/* ── General ─────────────────────────────── */}
          <TabsContent value="general" className="pt-4">
            <form id="category-form" onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="text-sm font-medium">Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Category name"
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
                  placeholder="category-slug"
                  className="mt-1 font-mono text-sm"
                  required
                />
                <FieldError errors={fieldErrors} field="slug" />
              </div>

              <div>
                <Label className="text-sm font-medium">Description</Label>
                <Textarea
                  value={form.description ?? ''}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Short category description..."
                  rows={3}
                  className="mt-1 resize-none"
                />
                <FieldError errors={fieldErrors} field="description" />
              </div>

              <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg">
                <Label className="text-sm font-medium cursor-pointer">Featured</Label>
                <Switch
                  checked={form.is_featured}
                  onCheckedChange={(v) => set('is_featured', v)}
                />
              </div>
            </form>
          </TabsContent>

          {/* ── Image ───────────────────────────────── */}
          <TabsContent value="image" className="pt-4">
            {!category ? (
              <div className="text-center py-8 text-zinc-500 text-sm">
                Create the category first to upload an image.
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-900">Category Image</h3>

                {displaySrc ? (
                  <div className="flex items-start gap-4">
                    <div className="relative group w-32 h-32 flex-shrink-0">
                      <img
                        src={displaySrc}
                        alt="Category"
                        className={`w-32 h-32 object-cover rounded-lg border border-zinc-200 transition-opacity ${
                          isBusy ? 'opacity-50' : ''
                        }`}
                      />
                      {isBusy && (
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg">
                          <Loader2 size={20} className="animate-spin text-zinc-600" />
                        </div>
                      )}
                      {!isBusy && (
                        <button
                          onClick={handleImageDelete}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {!isBusy && (
                      <div>
                        <p className="text-xs text-zinc-500 mb-2">Current image</p>
                        <label className="cursor-pointer inline-flex items-center gap-1.5 text-sm px-3 py-1.5 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors">
                          <Upload size={14} />
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              e.target.files?.[0] && handleImageUpload(e.target.files[0])
                            }
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <label className="cursor-pointer block border-2 border-dashed border-zinc-200 rounded-lg p-8 text-center hover:border-zinc-400 transition-colors">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 size={24} className="animate-spin text-zinc-400" />
                        <p className="text-sm text-zinc-600">Uploading…</p>
                      </div>
                    ) : (
                      <>
                        <Upload size={24} className="mx-auto mb-2 text-zinc-400" />
                        <p className="text-sm text-zinc-600">Click to upload category image</p>
                        <p className="text-xs text-zinc-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files?.[0] && handleImageUpload(e.target.files[0])
                      }
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2 pt-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            {activeTab === 'general' && !savedCategory ? 'Cancel' : 'Close'}
          </Button>
          {activeTab === 'general' && (
            <Button
              type="submit"
              form="category-form"
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
                'Create Category'
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ApiCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')

  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiCategory | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const loadCategories = useCallback(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    getAdminCategories(search ? { search } : {})
      .then((res) => {
        if (!cancelled) setCategories(res.data)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [search])

  useEffect(() => {
    const cleanup = loadCategories()
    return cleanup
  }, [loadCategories])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
  }

  const handleToggleFeatured = async (cat: ApiCategory) => {
    setTogglingId(cat.id)
    try {
      const updated = await updateCategory(cat.id, {
        name: cat.name,
        slug: cat.slug,
        description: cat.description ?? '',
        is_featured: !cat.is_featured,
      })
      setCategories((prev) => prev.map((c) => (c.id === cat.id ? updated : c)))
      toast.success(
        updated.is_featured
          ? `"${updated.name}" is now featured`
          : `"${updated.name}" removed from featured`
      )
    } catch {
      toast.error('Failed to update category')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteCategory(deleteTarget.id)
      toast.success(`"${deleteTarget.name}" deleted`)
      setDeleteTarget(null)
      loadCategories()
    } catch {
      toast.error('Failed to delete category')
    } finally {
      setDeleting(false)
    }
  }

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
          <h1 className="text-3xl font-bold text-zinc-900">Categories</h1>
          <p className="text-zinc-600 mt-1 text-sm">
            {!loading && `${categories.length} categories total`}
          </p>
        </div>
        <Button
          onClick={() => { setEditingCategory(null); setShowForm(true) }}
          className="bg-rose-900 hover:bg-rose-950 text-white gap-2"
        >
          <Plus size={16} />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-zinc-200 p-4">
        <form onSubmit={handleSearch} className="relative max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
          />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search categories..."
            className="pl-9 pr-8"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setSearch('') }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              <X size={14} className="text-zinc-400 hover:text-zinc-700" />
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-zinc-200 overflow-hidden">
        {error ? (
          <div className="text-center py-16 text-zinc-600">
            <p className="mb-3">Failed to load categories: {error}</p>
            <button onClick={loadCategories} className="text-rose-900 text-sm hover:underline">
              Try again
            </button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="text-zinc-600 font-semibold w-[45%]">Category</TableHead>
                <TableHead className="text-zinc-600 font-semibold text-center">Products</TableHead>
                <TableHead className="text-zinc-600 font-semibold text-center">Featured</TableHead>
                <TableHead className="text-right text-zinc-600 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? [...Array(6)].map((_, i) => (
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
                      <TableCell><Skeleton className="h-4 w-8 mx-auto" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12 mx-auto rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-7 w-16 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-16 text-zinc-500">
                        No categories found
                      </TableCell>
                    </TableRow>
                  )
                : categories.map((cat) => (
                    <TableRow
                      key={cat.id}
                      className="border-zinc-100 hover:bg-zinc-50 transition-colors"
                    >
                      {/* Name + image */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-zinc-100 flex-shrink-0 overflow-hidden">
                            {cat.image?.url && (
                              <img
                                src={cat.image.url}
                                alt={cat.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{cat.name}</p>
                            <p className="text-xs text-zinc-400 font-mono">{cat.slug}</p>
                            {cat.description && (
                              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                                {cat.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Products count */}
                      <TableCell className="text-center">
                        <span className="text-sm text-zinc-700 font-medium">
                          {cat.products_count}
                        </span>
                      </TableCell>

                      {/* Featured toggle */}
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {togglingId === cat.id ? (
                            <Loader2 size={16} className="animate-spin text-zinc-400" />
                          ) : (
                            <Switch
                              checked={cat.is_featured}
                              onCheckedChange={() => handleToggleFeatured(cat)}
                              className="data-[state=checked]:bg-rose-900"
                            />
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditingCategory(cat); setShowForm(true) }}
                            className="p-1.5 rounded hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(cat)}
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
      </div>

      {/* Create / Edit Modal */}
      <CategoryFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        editing={editingCategory}
        onSaved={loadCategories}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2">
                <p>
                  You are about to delete{' '}
                  <strong>&quot;{deleteTarget?.name}&quot;</strong>.
                </p>
                {deleteTarget && deleteTarget.products_count > 0 && (
                  <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-amber-800 text-sm">
                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>
                      This category has{' '}
                      <strong>{deleteTarget.products_count} product{deleteTarget.products_count !== 1 ? 's' : ''}</strong>.
                      Deleting it will also delete all its products permanently.
                    </span>
                  </div>
                )}
              </div>
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
