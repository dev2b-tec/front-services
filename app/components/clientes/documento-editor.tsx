'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { useEffect, useRef, useState } from 'react'

// ─── Toolbar button ───────────────────────────────────────────────────────────

function ToolBtn({
  active,
  title,
  onClick,
  children,
}: {
  active?: boolean
  title: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={`w-7 h-7 flex items-center justify-center rounded-md transition-colors text-sm
        ${active ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
    >
      {children}
    </button>
  )
}

// ─── Color picker dropdown ────────────────────────────────────────────────────

const TEXT_COLORS = [
  '#1f2937', '#7c3aed', '#2563eb', '#dc2626', '#16a34a', '#d97706',
  '#ec4899', '#0891b2', '#65a30d', '#9f1239', '#1d4ed8', '#4338ca',
]
const HIGHLIGHT_COLORS = [
  '#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa',
]

function ColorPicker({ onColor, onHighlight }: { onColor: (c: string) => void; onHighlight: (c: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title="Cor do texto / Destaque"
        onMouseDown={(e) => { e.preventDefault(); setOpen((v) => !v) }}
        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
      >
        <span className="text-sm font-bold leading-none" style={{ textDecoration: 'underline' }}>A</span>
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-52">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Cor do texto</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {TEXT_COLORS.map((c) => (
              <button key={c} type="button" title={c}
                onMouseDown={(e) => { e.preventDefault(); onColor(c); setOpen(false) }}
                className="w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                style={{ background: c }}
              />
            ))}
          </div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Destaque</p>
          <div className="flex flex-wrap gap-1.5">
            {HIGHLIGHT_COLORS.map((c) => (
              <button key={c} type="button" title={c}
                onMouseDown={(e) => { e.preventDefault(); onHighlight(c); setOpen(false) }}
                className="w-5 h-5 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Heading selector ─────────────────────────────────────────────────────────

function HeadingSelect({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const options = [
    { label: 'Normal', value: 0 },
    { label: 'Título 1', value: 1 },
    { label: 'Título 2', value: 2 },
    { label: 'Título 3', value: 3 },
  ]

  const current = editor?.isActive('heading', { level: 1 }) ? 'Título 1'
    : editor?.isActive('heading', { level: 2 }) ? 'Título 2'
    : editor?.isActive('heading', { level: 3 }) ? 'Título 3'
    : 'Normal'

  useEffect(() => {
    function close(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); setOpen((v) => !v) }}
        className="flex items-center gap-1 h-7 px-2 rounded-md text-xs text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
      >
        {current}
        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden w-28">
          {options.map((o) => (
            <button key={o.value} type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                if (o.value === 0) editor?.chain().focus().setParagraph().run()
                else editor?.chain().focus().toggleHeading({ level: o.value as 1|2|3 }).run()
                setOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-sm transition-colors
                ${(o.value === 0 && current === 'Normal') || current === o.label
                  ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main editor component ────────────────────────────────────────────────────

interface DocumentoEditorProps {
  value: string
  onChange: (html: string) => void
  minHeight?: number
}

export function DocumentoEditor({ value, onChange, minHeight = 240 }: DocumentoEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none px-4 py-3 text-gray-900',
        style: `min-height: ${minHeight}px`,
      },
    },
  })

  // Sync external value changes (e.g., when a template is applied)
  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (current !== value) {
      editor.commands.setContent(value, false, { preserveWhitespace: 'full' })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (!editor) return null

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
        <HeadingSelect editor={editor} />
        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolBtn active={editor.isActive('bold')} title="Negrito" onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn active={editor.isActive('italic')} title="Itálico" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </ToolBtn>
        <ToolBtn active={editor.isActive('underline')} title="Sublinhado" onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span style={{ textDecoration: 'underline' }}>U</span>
        </ToolBtn>
        <ToolBtn active={editor.isActive('strike')} title="Tachado" onClick={() => editor.chain().focus().toggleStrike().run()}>
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </ToolBtn>

        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ColorPicker
          onColor={(c) => editor.chain().focus().setColor(c).run()}
          onHighlight={(c) => editor.chain().focus().toggleHighlight({ color: c }).run()}
        />
        <div className="w-px h-5 bg-gray-200 mx-1" />

        <ToolBtn active={editor.isActive({ textAlign: 'left' })} title="Alinhar à esquerda" onClick={() => editor.chain().focus().setTextAlign('left').run()}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="18" x2="18" y2="18"/></svg>
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'center' })} title="Centralizar" onClick={() => editor.chain().focus().setTextAlign('center').run()}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="6" y1="12" x2="18" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'right' })} title="Alinhar à direita" onClick={() => editor.chain().focus().setTextAlign('right').run()}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="9" y1="12" x2="21" y2="12"/><line x1="6" y1="18" x2="21" y2="18"/></svg>
        </ToolBtn>
        <ToolBtn active={editor.isActive({ textAlign: 'justify' })} title="Justificar" onClick={() => editor.chain().focus().setTextAlign('justify').run()}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </ToolBtn>

        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolBtn active={editor.isActive('bulletList')} title="Lista com marcadores" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
        </ToolBtn>
        <ToolBtn active={editor.isActive('orderedList')} title="Lista numerada" onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><text x="2" y="8" fontSize="7" fill="currentColor" stroke="none">1.</text><text x="2" y="14" fontSize="7" fill="currentColor" stroke="none">2.</text><text x="2" y="20" fontSize="7" fill="currentColor" stroke="none">3.</text></svg>
        </ToolBtn>

        <div className="w-px h-5 bg-gray-200 mx-1" />
        <ToolBtn title="Desfazer" onClick={() => editor.chain().focus().undo().run()}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
        </ToolBtn>
        <ToolBtn title="Refazer" onClick={() => editor.chain().focus().redo().run()}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
        </ToolBtn>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  )
}
