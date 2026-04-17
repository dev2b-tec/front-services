'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { useEffect } from 'react'

// ─── Variables ────────────────────────────────────────────────────────────────

const VARIAVEIS = [
  { label: '#nome_paciente#', title: 'Nome do paciente' },
  { label: '#nome_profissional#', title: 'Nome do profissional' },
  { label: '#data_e_hora_agendamento#', title: 'Data e hora do agendamento' },
  { label: '#link_de_confirmacao#', title: 'Link de confirmação do agendamento' },
]

/** Converte texto plano (com \n) para HTML compatível com TipTap */
export function textoParaHtml(texto: string): string {
  if (!texto || texto.trim() === '') return '<p></p>'
  if (/<[a-z]/.test(texto)) return texto // já é HTML
  return texto
    .split('\n')
    .map((linha) => `<p>${linha === '' ? '<br>' : linha.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`)
    .join('')
}

/** Converte HTML do TipTap para texto plano com quebras de linha (\n) */
export function htmlParaTexto(html: string): string {
  if (!html || html.trim() === '') return ''
  if (!/<[a-z]/.test(html)) return html // já é texto plano
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n')
    .replace(/<p>/gi, '')
    .replace(/<\/p>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
}

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
        ${active
          ? 'bg-[rgba(124,77,255,0.15)] text-[#7C4DFF]'
          : 'text-[var(--d2b-text-muted)] hover:bg-[var(--d2b-bg-elevated)] hover:text-[var(--d2b-text-primary)]'
        }`}
    >
      {children}
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface MensagemEditorProps {
  value: string
  onChange: (html: string) => void
  minHeight?: number
}

export function MensagemEditor({ value, onChange, minHeight = 180 }: MensagemEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit, Underline],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] leading-relaxed',
        style: `min-height: ${minHeight}px`,
      },
    },
  })

  // Sync when the selected message type changes
  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  if (!editor) return null

  function insertVar(label: string) {
    editor?.chain().focus().insertContent(label).run()
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--d2b-border-strong)' }}
    >
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b"
        style={{
          borderColor: 'var(--d2b-border-strong)',
          background: 'var(--d2b-bg-elevated)',
        }}
      >
        {/* Formatação */}
        <ToolBtn active={editor.isActive('bold')} title="Negrito (WhatsApp: *texto*)" onClick={() => editor.chain().focus().toggleBold().run()}>
          <strong>B</strong>
        </ToolBtn>
        <ToolBtn active={editor.isActive('italic')} title="Itálico (WhatsApp: _texto_)" onClick={() => editor.chain().focus().toggleItalic().run()}>
          <em>I</em>
        </ToolBtn>
        <ToolBtn active={editor.isActive('underline')} title="Sublinhado" onClick={() => editor.chain().focus().toggleUnderline().run()}>
          <span style={{ textDecoration: 'underline' }}>U</span>
        </ToolBtn>
        <ToolBtn active={editor.isActive('strike')} title="Tachado (WhatsApp: ~texto~)" onClick={() => editor.chain().focus().toggleStrike().run()}>
          <span style={{ textDecoration: 'line-through' }}>S</span>
        </ToolBtn>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--d2b-border-strong)' }} />

        <ToolBtn title="Desfazer" onClick={() => editor.chain().focus().undo().run()}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
        </ToolBtn>
        <ToolBtn title="Refazer" onClick={() => editor.chain().focus().redo().run()}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/></svg>
        </ToolBtn>

        {/* Variáveis */}
        <div className="w-px h-5 mx-1" style={{ background: 'var(--d2b-border-strong)' }} />
        <span className="text-[10px] font-semibold uppercase tracking-wide px-1" style={{ color: 'var(--d2b-text-muted)' }}>
          Inserir variável:
        </span>
        {VARIAVEIS.map((v) => (
          <button
            key={v.label}
            type="button"
            title={v.title}
            onMouseDown={(e) => { e.preventDefault(); insertVar(v.label) }}
            className="h-6 px-2 rounded-md text-[10px] font-mono transition-colors"
            style={{
              background: 'rgba(124,77,255,0.1)',
              color: '#7C4DFF',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(124,77,255,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(124,77,255,0.1)')}
          >
            {v.label}
          </button>
        ))}
      </div>

      {/* Editor area */}
      <div
        style={{ background: 'var(--d2b-bg-main)' }}
        className="[&_.tiptap]:outline-none [&_.tiptap_p]:min-h-[1.4em] [&_.tiptap_p]:my-0.5"
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
