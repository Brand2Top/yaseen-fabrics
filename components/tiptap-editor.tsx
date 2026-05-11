'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TiptapImage from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useRef, useCallback } from 'react'
import {
  Bold, Italic, Heading2, Heading3, List, ListOrdered,
  Quote, Minus, ImageIcon, Undo, Redo,
} from 'lucide-react'
import { toast } from 'sonner'
import { uploadPostImage } from '@/lib/api'

interface TiptapEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = 'Write your post…',
  className,
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage.configure({
        HTMLAttributes: { class: 'max-w-full rounded-lg my-4' },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: 'outline-none' } },
    immediatelyRender: false,
  })

  const handleImageFile = useCallback(
    async (file: File) => {
      if (!editor) return
      try {
        const { url } = await uploadPostImage(file)
        editor.chain().focus().setImage({ src: url }).run()
      } catch {
        toast.error('Failed to upload image')
      }
    },
    [editor]
  )

  if (!editor) return null

  function Btn({
    onClick,
    active,
    disabled,
    title,
    children,
  }: {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    title: string
    children: React.ReactNode
  }) {
    return (
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault()
          onClick()
        }}
        disabled={disabled}
        title={title}
        className={`p-1.5 rounded transition-colors ${
          active
            ? 'bg-zinc-900 text-white'
            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
        } disabled:opacity-30`}
      >
        {children}
      </button>
    )
  }

  return (
    <div className={`border border-zinc-200 rounded-lg overflow-hidden ${className ?? ''}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-2 border-b border-zinc-200 bg-zinc-50">
        <Btn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={15} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={15} />
        </Btn>

        <div className="w-px h-5 bg-zinc-200 mx-1" />

        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={15} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={15} />
        </Btn>

        <div className="w-px h-5 bg-zinc-200 mx-1" />

        <Btn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <List size={15} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Ordered list"
        >
          <ListOrdered size={15} />
        </Btn>

        <div className="w-px h-5 bg-zinc-200 mx-1" />

        <Btn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote size={15} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Divider"
        >
          <Minus size={15} />
        </Btn>

        <div className="w-px h-5 bg-zinc-200 mx-1" />

        <Btn onClick={() => fileInputRef.current?.click()} title="Insert image">
          <ImageIcon size={15} />
        </Btn>

        <div className="flex-1" />

        <Btn
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={15} />
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={15} />
        </Btn>
      </div>

      {/* Content */}
      <div className="p-4">
        <EditorContent editor={editor} />
      </div>

      {/* Hidden image input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            handleImageFile(file)
            e.target.value = ''
          }
        }}
      />
    </div>
  )
}
