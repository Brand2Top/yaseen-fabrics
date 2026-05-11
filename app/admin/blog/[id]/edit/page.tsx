'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Upload, X, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { TiptapEditor } from '@/components/tiptap-editor'
import { getAdminPost, updatePost, uploadMedia, deleteMedia } from '@/lib/api'
import type { ApiImage } from '@/lib/types'

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const postId = parseInt(id)

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [slugManual, setSlugManual] = useState(false)
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [saving, setSaving] = useState(false)

  const [featuredImage, setFeaturedImage] = useState<ApiImage | null>(null)
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null)
  const [uploadingFeatured, setUploadingFeatured] = useState(false)
  const [deletingFeatured, setDeletingFeatured] = useState(false)

  useEffect(() => {
    setLoading(true)
    getAdminPost(postId)
      .then((post) => {
        setTitle(post.title)
        setSlug(post.slug)
        setSlugManual(true)
        setExcerpt(post.excerpt ?? '')
        setContent(post.content)
        setIsPublished(post.is_published)
        if (post.published_at) {
          setScheduledAt(new Date(post.published_at).toISOString().slice(0, 16))
        }
        setFeaturedImage(post.featured_image ?? null)
      })
      .catch((err: Error) => setLoadError(err.message))
      .finally(() => setLoading(false))
  }, [postId])

  const handleTitleChange = (val: string) => {
    setTitle(val)
    if (!slugManual) setSlug(slugify(val))
  }

  const handleSave = async (publish: boolean) => {
    if (!title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      await updatePost(postId, {
        title: title.trim(),
        slug: slug.trim() || undefined,
        excerpt: excerpt.trim() || null,
        content,
        is_published: publish,
        published_at: publish && scheduledAt ? new Date(scheduledAt).toISOString() : null,
      })
      setIsPublished(publish)
      toast.success(publish ? 'Post published!' : 'Saved as draft')
    } catch (err) {
      const e = err as Error & { errors?: Record<string, string[]> }
      toast.error(e.errors ? Object.values(e.errors).flat()[0] : 'Failed to save post')
    } finally {
      setSaving(false)
    }
  }

  const handleFeaturedUpload = useCallback(async (file: File) => {
    const preview = URL.createObjectURL(file)
    setFeaturedPreview(preview)
    setUploadingFeatured(true)
    try {
      if (featuredImage) await deleteMedia(featuredImage.id)
      const media = await uploadMedia(file, 'Post', postId, 'featured')
      setFeaturedImage({ id: media.id, url: media.url })
      toast.success('Featured image uploaded')
    } catch {
      toast.error('Failed to upload image')
    } finally {
      URL.revokeObjectURL(preview)
      setFeaturedPreview(null)
      setUploadingFeatured(false)
    }
  }, [postId, featuredImage])

  const handleFeaturedDelete = async () => {
    if (!featuredImage) return
    setDeletingFeatured(true)
    try {
      await deleteMedia(featuredImage.id)
      setFeaturedImage(null)
      toast.success('Featured image removed')
    } catch {
      toast.error('Failed to remove image')
    } finally {
      setDeletingFeatured(false)
    }
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <p className="text-zinc-500">{loadError}</p>
        <Link href="/admin/blog" className="text-rose-900 text-sm hover:underline">
          Back to Blog
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/admin/blog"
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 transition-colors flex-shrink-0"
          >
            <ArrowLeft size={15} />
            Blog
          </Link>
          <span className="text-zinc-300">/</span>
          <span className="text-sm font-medium text-zinc-700 truncate">
            {loading ? 'Loading…' : title || 'Edit Post'}
          </span>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={saving || loading}
            onClick={() => handleSave(false)}
            className="text-xs h-8 gap-1.5"
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            Save Draft
          </Button>
          <Button
            size="sm"
            disabled={saving || loading}
            onClick={() => handleSave(true)}
            className="bg-rose-900 hover:bg-rose-950 text-white text-xs h-8 gap-1.5"
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            Publish
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex gap-6 items-start">
        {/* Left: editor */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
            {loading ? (
              <>
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-4 w-40" />
                <div className="border-t border-zinc-100" />
                <Skeleton className="h-64 w-full" />
              </>
            ) : (
              <>
                <input
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Post title…"
                  className="w-full text-3xl font-serif font-bold text-zinc-900 border-0 outline-none placeholder:text-zinc-300 bg-transparent"
                />

                <div className="flex items-center gap-2 pb-1">
                  <span className="text-xs text-zinc-400 flex-shrink-0">Slug:</span>
                  <input
                    value={slug}
                    onChange={(e) => { setSlugManual(true); setSlug(e.target.value) }}
                    className="flex-1 text-xs text-zinc-500 border-0 outline-none bg-transparent font-mono focus:text-zinc-900 transition-colors"
                  />
                </div>

                <div className="border-t border-zinc-100" />

                <TiptapEditor
                  key={postId}
                  content={content}
                  onChange={setContent}
                  placeholder="Start writing your post…"
                />
              </>
            )}
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {/* Excerpt */}
          <div className="bg-white rounded-lg border border-zinc-200 p-4 space-y-2">
            <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Excerpt</h3>
            {loading ? (
              <Skeleton className="h-20 w-full rounded-md" />
            ) : (
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Short description shown in listing…"
                rows={3}
                className="w-full text-sm text-zinc-700 resize-none border border-zinc-200 rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 transition-colors"
              />
            )}
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-lg border border-zinc-200 p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Featured Image</h3>

            {loading ? (
              <Skeleton className="aspect-video w-full rounded-lg" />
            ) : (
              <>
                {(featuredPreview || featuredImage?.url) && (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100">
                    <img
                      src={featuredPreview ?? featuredImage!.url}
                      alt="Featured"
                      className="w-full h-full object-cover"
                    />
                    {(uploadingFeatured || deletingFeatured) && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                        <Loader2 size={20} className="animate-spin text-zinc-600" />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) { handleFeaturedUpload(f); e.target.value = '' }
                      }}
                    />
                    <span className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors text-zinc-600 cursor-pointer">
                      <Upload size={12} />
                      {featuredImage ? 'Replace' : 'Upload'}
                    </span>
                  </label>
                  {featuredImage && (
                    <button
                      onClick={handleFeaturedDelete}
                      disabled={deletingFeatured}
                      className="px-2.5 py-1.5 text-xs border border-zinc-200 rounded-md hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-zinc-500 disabled:opacity-40"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Publish Settings */}
          <div className="bg-white rounded-lg border border-zinc-200 p-4 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Publish Settings</h3>

            {loading ? (
              <Skeleton className="h-8 w-full rounded-md" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="edit-is-published" className="text-sm text-zinc-700 cursor-pointer">
                    Published
                  </Label>
                  <Switch
                    id="edit-is-published"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                </div>

                {isPublished && (
                  <div className="space-y-1.5">
                    <Label className="text-xs text-zinc-500 flex items-center gap-1">
                      <Calendar size={11} />
                      Schedule date (optional)
                    </Label>
                    <input
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full text-xs border border-zinc-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-rose-900/20 focus:border-rose-900 transition-colors"
                    />
                    <p className="text-xs text-zinc-400">
                      Leave blank to publish immediately.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
