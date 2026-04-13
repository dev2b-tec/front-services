'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Lightbulb, Star, MessageCircle, ThumbsUp, ChevronLeft,
  Plus, X, Search, Paperclip, CheckCircle2, Loader2,
  ImageOff, User
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IdeiaApi {
  id: string
  titulo: string
  descricao: string
  situacao: 'MODERACAO' | 'NOVA' | 'EM_ESTUDO' | 'DESENVOLVIDA'
  categorias: string[]
  empresaId: string
  nomeEmpresa: string
  ideiaLegal: boolean
  totalVotos: number
  totalComentarios: number
  numero: number
  createdAt: string
  imageUrls: string[]
  jaVotou: boolean
}

export interface ComentarioApi {
  id: string
  texto: string
  nomeEmpresa: string
  createdAt: string
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORIAS = [
  'Agendamento', 'Cadastros', 'Clientes', 'Configuracoes', 'Documentos',
  'Financeiro', 'Integracoes', 'Marketing', 'Performance', 'Relatorios',
  'Seguranca', 'Servicos', 'Sites', 'Suprimentos', 'Usabilidade', 'Vendas',
]

const SITUACAO_LABEL: Record<string, string> = {
  MODERACAO: 'Moderacao',
  NOVA: 'Nova',
  EM_ESTUDO: 'Em estudo',
  DESENVOLVIDA: 'Desenvolvida',
}

const SITUACAO_COLOR: Record<string, string> = {
  MODERACAO: '#FF9800',
  NOVA: '#4CAF50',
  EM_ESTUDO: '#2196F3',
  DESENVOLVIDA: '#7C4DFF',
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── IdeiaCard ────────────────────────────────────────────────────────────────

function IdeiaCard({ ideia, onClick }: { ideia: IdeiaApi; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl border p-5 transition-all duration-200 flex flex-col gap-3 hover:border-[var(--d2b-brand)]"
      style={{ background: 'var(--d2b-bg-elevated)', borderColor: 'var(--d2b-border)' }}
    >
      {/* Icon + title */}
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: 'var(--d2b-brand-dim)' }}
        >
          <Lightbulb size={18} style={{ color: '#7C4DFF' }} />
        </div>
        <h3 className="text-sm font-semibold leading-tight line-clamp-2" style={{ color: 'var(--d2b-text-primary)' }}>
          {ideia.titulo}
        </h3>
      </div>

      {/* Badge */}
      <div className="flex items-center gap-2 flex-wrap">
        {ideia.ideiaLegal && (
          <span
            className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md"
            style={{ color: '#7C4DFF', background: 'var(--d2b-brand-dim)' }}
          >
            <Star size={10} fill="var(--d2b-brand)" />
            IDEIA LEGAL
          </span>
        )}
        <span className="text-[10px] font-semibold" style={{ color: 'var(--d2b-text-muted)' }}>
          Nº {String(ideia.numero).padStart(5, '0')}
        </span>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-1">
        {ideia.categorias.slice(0, 3).map(cat => (
          <span
            key={cat}
            className="text-[11px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'var(--d2b-brand-dim)', color: 'var(--d2b-text-secondary)' }}
          >
            {cat}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-auto pt-1">
        <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--d2b-text-muted)' }}>
          <ThumbsUp size={11} /> {ideia.totalVotos}
        </span>
        <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--d2b-text-muted)' }}>
          <MessageCircle size={11} /> {ideia.totalComentarios}
        </span>
        <span
          className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full"
          style={{
            color: SITUACAO_COLOR[ideia.situacao] ?? 'var(--d2b-text-muted)',
            background: `${SITUACAO_COLOR[ideia.situacao] ?? '#888'}1A`,
          }}
        >
          {SITUACAO_LABEL[ideia.situacao] ?? ideia.situacao}
        </span>
      </div>
    </button>
  )
}

// ─── SeletorCategorias ────────────────────────────────────────────────────────

function SeletorCategorias({
  selected,
  onChange,
  onClose,
}: {
  selected: string[]
  onChange: (cats: string[]) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<string[]>(selected)
  const filtered = CATEGORIAS.filter(c => c.toLowerCase().includes(query.toLowerCase()))

  function toggle(cat: string) {
    if (draft.includes(cat)) setDraft(draft.filter(c => c !== cat))
    else if (draft.length < 3) setDraft([...draft, cat])
  }

  return (
    <div
      className="absolute right-0 top-0 w-80 rounded-2xl shadow-2xl z-50 flex flex-col border"
      style={{ background: 'var(--d2b-bg-elevated)', borderColor: 'var(--d2b-border-strong)', maxHeight: '500px' }}
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--d2b-text-primary)' }}>
            Selecione as categorias da ideia
          </p>
          <p className="text-xs" style={{ color: 'var(--d2b-text-muted)' }}>Selecione até 3 categorias</p>
        </div>
        <button onClick={onClose} style={{ color: 'var(--d2b-text-muted)' }} className="hover:opacity-70">
          <X size={16} />
        </button>
      </div>

      <div className="px-4 pb-2">
        <div
          className="flex items-center gap-2 border rounded-xl px-3 py-2"
          style={{ borderColor: 'var(--d2b-border-strong)', background: 'var(--d2b-bg-main)' }}
        >
          <Search size={14} style={{ color: 'var(--d2b-text-muted)' }} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar categoria"
            className="text-sm w-full outline-none bg-transparent"
            style={{ color: 'var(--d2b-text-primary)' }}
          />
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        <p className="text-xs font-medium px-5 pt-2 pb-1" style={{ color: 'var(--d2b-text-muted)' }}>
          Categorias
        </p>
        {filtered.map(cat => (
          <label key={cat} className="flex items-center gap-3 px-5 py-2.5 cursor-pointer hover:bg-[var(--d2b-hover)]">
            <input
              type="checkbox"
              checked={draft.includes(cat)}
              onChange={() => toggle(cat)}
              disabled={!draft.includes(cat) && draft.length >= 3}
              className="accent-[#7C4DFF] w-4 h-4"
            />
            <span className="text-sm" style={{ color: 'var(--d2b-text-primary)' }}>{cat}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3 px-4 py-3 border-t" style={{ borderColor: 'var(--d2b-border)' }}>
        <button
          onClick={() => { onChange(draft); onClose() }}
          className="flex-1 bg-[#7C4DFF] text-white text-sm font-semibold py-2 rounded-xl hover:bg-[#5B21B6] transition-colors"
        >
          Selecionar categorias
        </button>
        <button onClick={onClose} className="text-sm px-3 hover:opacity-70" style={{ color: 'var(--d2b-text-secondary)' }}>
          cancelar
        </button>
      </div>
    </div>
  )
}

// ─── NovaIdeiaForm ────────────────────────────────────────────────────────────

function NovaIdeiaForm({
  empresaId,
  onSuccess,
  onCancel,
}: {
  empresaId: string
  onSuccess: () => void
  onCancel: () => void
}) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [categorias, setCategorias] = useState<string[]>([])
  const [imagens, setImagens] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [showCats, setShowCats] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFiles(files: FileList | null) {
    if (!files) return
    const arr = Array.from(files).slice(0, 5 - imagens.length)
    const newFiles = [...imagens, ...arr]
    setImagens(newFiles)
    setImagePreviews(newFiles.map(f => URL.createObjectURL(f)))
  }

  async function handleSubmit() {
    if (!titulo.trim()) return
    setLoading(true)
    try {
      const form = new FormData()
      form.append('titulo', titulo.trim())
      form.append('descricao', descricao.trim())
      form.append('empresaId', empresaId)
      categorias.forEach(c => form.append('categorias', c))
      imagens.forEach(img => form.append('imagens', img))
      const res = await fetch('/api/v1/ideias', { method: 'POST', body: form })
      if (res.ok) setSuccess(true)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-6">
        <CheckCircle2 size={56} style={{ color: '#7C4DFF' }} />
        <div className="text-center">
          <h2 className="text-xl font-bold" style={{ color: 'var(--d2b-text-primary)' }}>
            Sua ideia foi cadastrada e está aguardando moderação
          </h2>
          <p className="text-sm mt-2" style={{ color: 'var(--d2b-text-secondary)' }}>
            O desenvolvimento da sua sugestão está sujeito às seguintes etapas:
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--d2b-text-muted)' }}>
            Após a moderação você poderá compartilhar sua ideia com a comunidade.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-center mt-2">
          {['cadastro', 'moderação', 'comunidade', 'avaliação', 'desenvolvimento'].map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-px" style={{ background: 'var(--d2b-border)' }} />}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: i <= 1 ? 'var(--d2b-brand)' : 'var(--d2b-bg-elevated)',
                    color: i <= 1 ? '#fff' : 'var(--d2b-text-muted)',
                  }}
                >
                  {i === 0 ? <CheckCircle2 size={14} /> : i + 1}
                </div>
                <span
                  className="text-xs"
                  style={{ color: i <= 1 ? 'var(--d2b-text-primary)' : 'var(--d2b-text-muted)' }}
                >
                  {step}
                </span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={onSuccess} className="mt-4 text-sm hover:opacity-70 underline" style={{ color: 'var(--d2b-text-muted)' }}>
          fechar
        </button>
      </div>
    )
  }

  const INPUT = 'w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors bg-transparent focus:border-[#7C4DFF]'
  const INPUT_STYLE = { borderColor: 'var(--d2b-border-strong)', color: 'var(--d2b-text-primary)' }

  return (
    <div className="py-8 px-6 relative">
      <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--d2b-text-primary)' }}>
        Adicionar uma nova ideia
      </h1>
      <p className="text-sm mb-8" style={{ color: '#7C4DFF' }}>
        Faça a sua sugestão para soluções ainda melhores na Plataforma DEV2B
      </p>

      <div className="flex gap-10">
        {/* Left: form */}
        <div className="flex-1 flex flex-col gap-6">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7C4DFF' }}>
              Título da nova ideia
            </label>
            <input maxLength={100} value={titulo} onChange={e => setTitulo(e.target.value)} className={INPUT} style={INPUT_STYLE} />
            <p className="text-[11px] mt-1" style={{ color: 'var(--d2b-text-muted)' }}>{titulo.length}/100</p>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7C4DFF' }}>
              Descreva sua ideia
            </label>
            <textarea rows={4} value={descricao} onChange={e => setDescricao(e.target.value)} className={`${INPUT} resize-none`} style={INPUT_STYLE} />
          </div>

          <div className="relative">
            <div className="border rounded-xl p-4" style={{ borderColor: 'var(--d2b-border)' }}>
              <button
                type="button"
                onClick={() => setShowCats(!showCats)}
                className="flex items-center gap-2 text-sm hover:opacity-70 transition-opacity"
                style={{ color: 'var(--d2b-text-secondary)' }}
              >
                <Plus size={16} /> Adicionar categorias de ideias
              </button>
              {categorias.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {categorias.map(cat => (
                    <span
                      key={cat}
                      className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                      style={{ background: 'var(--d2b-brand-dim)', color: 'var(--d2b-text-secondary)' }}
                    >
                      {cat}
                      <button onClick={() => setCategorias(categorias.filter(c => c !== cat))}><X size={11} /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            {showCats && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowCats(false)} />
                <div className="z-50" style={{ position: 'absolute', top: 0, right: '-20rem' }}>
                  <SeletorCategorias
                    selected={categorias}
                    onChange={cats => setCategorias(cats)}
                    onClose={() => setShowCats(false)}
                  />
                </div>
              </>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: '#7C4DFF' }}>
              Imagens da minha ideia
            </label>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 text-sm border rounded-lg px-4 py-2 transition-colors hover:border-[#7C4DFF] hover:text-[#7C4DFF]"
              style={{ borderColor: 'var(--d2b-border)', color: 'var(--d2b-text-secondary)' }}
            >
              <Paperclip size={14} /> anexar imagens
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
            {imagePreviews.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="w-20 h-20 object-cover rounded-lg border" style={{ borderColor: 'var(--d2b-border)' }} />
                    <button
                      onClick={() => {
                        const newImgs = imagens.filter((_, idx) => idx !== i)
                        setImagens(newImgs)
                        setImagePreviews(newImgs.map(f => URL.createObjectURL(f)))
                      }}
                      className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center"
                    >
                      <X size={9} />
                    </button>
                    <p
                      className="text-[10px] text-center mt-1 cursor-pointer"
                      style={{ color: '#7C4DFF' }}
                      onClick={() => {
                        const newImgs = imagens.filter((_, idx) => idx !== i)
                        setImagens(newImgs)
                        setImagePreviews(newImgs.map(f => URL.createObjectURL(f)))
                      }}
                    >
                      remover anexo
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: hints */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-6 text-sm" style={{ color: 'var(--d2b-text-secondary)' }}>
          <div>
            <p className="font-medium mb-1" style={{ color: 'var(--d2b-text-primary)' }}>Dica:</p>
            <p>
              Inclua o módulo específico seguido da solução proposta. Por exemplo:{' '}
              <strong style={{ color: 'var(--d2b-text-primary)' }}>
                &quot;Agendamento: Confirmação automática&quot;
              </strong>
            </p>
          </div>
          <div><p>Descreva em detalhes as necessidades que geraram essa ideia. Se possível, forneça exemplos ou casos de uso.</p></div>
          <div><p>Selecione até 3 categorias. Isso facilita para outros usuários encontrarem sua sugestão.</p></div>
          <div><p>Ao fornecer detalhes claros, você ajuda nossa equipe a compreender melhor o contexto e as necessidades envolvidas.</p></div>
        </div>
      </div>

      <div className="flex justify-end gap-4 mt-8 pt-6 border-t" style={{ borderColor: 'var(--d2b-border)' }}>
        <button onClick={onCancel} className="text-sm hover:opacity-70" style={{ color: 'var(--d2b-text-muted)' }}>cancelar</button>
        <button
          onClick={handleSubmit}
          disabled={loading || !titulo.trim()}
          className="flex items-center gap-2 bg-[#7C4DFF] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          cadastrar ideia
        </button>
      </div>
    </div>
  )
}

// ─── IdeiaDetail ──────────────────────────────────────────────────────────────

function IdeiaDetail({
  ideia,
  empresaId,
  onBack,
  onUpdated,
}: {
  ideia: IdeiaApi
  empresaId: string
  onBack: () => void
  onUpdated: (ideia: IdeiaApi) => void
}) {
  const [comentarios, setComentarios] = useState<ComentarioApi[]>([])
  const [novoComentario, setNovoComentario] = useState('')
  const [loadingVoto, setLoadingVoto] = useState(false)
  const [loadingComentario, setLoadingComentario] = useState(false)

  useEffect(() => {
    fetch(`/api/v1/ideias/${ideia.id}/comentarios`)
      .then(r => r.ok ? r.json() : [])
      .then(setComentarios)
      .catch(() => setComentarios([]))
  }, [ideia.id])

  async function votar() {
    setLoadingVoto(true)
    try {
      const res = await fetch(`/api/v1/ideias/${ideia.id}/votar?empresaId=${empresaId}`, { method: 'POST' })
      if (res.ok) onUpdated(await res.json())
    } finally { setLoadingVoto(false) }
  }

  async function enviarComentario() {
    if (!novoComentario.trim()) return
    setLoadingComentario(true)
    try {
      const res = await fetch(`/api/v1/ideias/${ideia.id}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: novoComentario.trim(), empresaId }),
      })
      if (res.ok) { setComentarios([...comentarios, await res.json()]); setNovoComentario('') }
    } finally { setLoadingComentario(false) }
  }

  return (
    <div className="py-8 px-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm mb-6 hover:opacity-70" style={{ color: '#7C4DFF' }}>
        <ChevronLeft size={16} /> voltar
      </button>

      <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--d2b-text-primary)' }}>{ideia.titulo}</h1>
      <p className="text-sm mb-4" style={{ color: '#7C4DFF' }}>
        Ideia Nº {String(ideia.numero).padStart(5, '0')}
      </p>

      {ideia.descricao && (
        <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--d2b-text-secondary)' }}>{ideia.descricao}</p>
      )}

      <div className="flex items-center gap-2 mb-6 text-sm">
        <span style={{ color: 'var(--d2b-text-muted)' }}>Ideia por:</span>
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--d2b-brand)' }}>
          <User size={12} className="text-white" />
        </div>
        <span className="font-medium" style={{ color: 'var(--d2b-text-primary)' }}>{ideia.nomeEmpresa}</span>
      </div>

      {ideia.imageUrls?.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-6">
          {ideia.imageUrls.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt="" className="w-32 h-32 object-cover rounded-xl border" style={{ borderColor: 'var(--d2b-border)' }} />
          ))}
        </div>
      )}

      {/* Metadata box */}
      <div className="border rounded-2xl p-5 mb-8" style={{ borderColor: 'var(--d2b-border)' }}>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium" style={{ color: 'var(--d2b-text-muted)' }}>situação</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: SITUACAO_COLOR[ideia.situacao] ?? 'var(--d2b-text-muted)' }} />
              <span className="text-sm" style={{ color: 'var(--d2b-text-primary)' }}>
                {SITUACAO_LABEL[ideia.situacao] ?? ideia.situacao}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium" style={{ color: 'var(--d2b-text-muted)' }}>categorias</p>
            <div className="flex flex-wrap gap-1">
              {ideia.categorias.map(cat => (
                <span
                  key={cat}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--d2b-brand-dim)', color: 'var(--d2b-text-secondary)' }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium" style={{ color: 'var(--d2b-text-muted)' }}>{ideia.totalVotos} votos</p>
            <button
              onClick={votar}
              disabled={loadingVoto}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-1.5 rounded-xl transition-colors"
              style={ideia.jaVotou
                ? { background: 'var(--d2b-bg-elevated)', color: 'var(--d2b-text-muted)' }
                : { background: 'var(--d2b-brand)', color: '#fff' }
              }
            >
              {loadingVoto ? <Loader2 size={12} className="animate-spin" /> : <ThumbsUp size={13} />}
              {ideia.jaVotou ? 'votado' : 'votar'}
            </button>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium" style={{ color: 'var(--d2b-text-muted)' }}>ideia legal</p>
            <Star
              size={22}
              fill={ideia.ideiaLegal ? 'var(--d2b-brand)' : 'none'}
              stroke={ideia.ideiaLegal ? 'var(--d2b-brand)' : 'var(--d2b-border-strong)'}
            />
          </div>
        </div>
      </div>

      {/* Comments */}
      <div>
        <h2
          className="text-base font-semibold mb-1 border-b pb-2"
          style={{ color: 'var(--d2b-text-primary)', borderColor: 'var(--d2b-border)' }}
        >
          Comentários
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--d2b-text-secondary)' }}>
          {comentarios.length > 0
            ? `O que outros usuários estão comentando · ${comentarios.length} comentários`
            : 'Seja o primeiro a comentar'}
        </p>
        <div className="flex flex-col gap-4 mb-6">
          {comentarios.map(c => (
            <div key={c.id} className="rounded-xl p-4" style={{ background: 'var(--d2b-bg-elevated)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--d2b-brand)' }}>
                  <User size={12} className="text-white" />
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--d2b-text-primary)' }}>{c.nomeEmpresa}</span>
                <span className="text-[10px] ml-auto" style={{ color: 'var(--d2b-text-muted)' }}>{formatDate(c.createdAt)}</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--d2b-text-secondary)' }}>{c.texto}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <textarea
            rows={2}
            value={novoComentario}
            onChange={e => setNovoComentario(e.target.value)}
            placeholder="Escreva um comentário..."
            className="flex-1 border rounded-xl px-3 py-2 text-sm outline-none resize-none transition-colors bg-transparent focus:border-[#7C4DFF]"
            style={{ borderColor: 'var(--d2b-border-strong)', color: 'var(--d2b-text-primary)' }}
          />
          <button
            onClick={enviarComentario}
            disabled={loadingComentario || !novoComentario.trim()}
            className="self-end flex items-center gap-2 bg-[#7C4DFF] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-[#5B21B6] disabled:opacity-50 transition-colors"
          >
            {loadingComentario ? <Loader2 size={14} className="animate-spin" /> : 'Enviar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CanalIdeias (main) ───────────────────────────────────────────────────────

type Tab = 'todas' | 'novas' | 'minhas' | 'em_estudo' | 'desenvolvidas'
type View = 'list' | 'detail' | 'new'

export function CanalIdeias({ empresaId }: { empresaId: string }) {
  const [view, setView] = useState<View>('list')
  const [tab, setTab] = useState<Tab>('todas')
  const [ideias, setIdeias] = useState<IdeiaApi[]>([])
  const [selectedIdeia, setSelectedIdeia] = useState<IdeiaApi | null>(null)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (view !== 'list') return
    setLoading(true)
    const params = new URLSearchParams({ empresaId, page: String(page - 1), size: '12' })
    if (tab !== 'todas') params.set('filtro', tab)
    fetch(`/api/v1/ideias?${params}`)
      .then(r => r.ok ? r.json() : { content: [], totalPages: 1 })
      .then(data => {
        if (Array.isArray(data)) { setIdeias(data); setTotalPages(1) }
        else { setIdeias(data.content ?? []); setTotalPages(data.totalPages ?? 1) }
      })
      .catch(() => setIdeias([]))
      .finally(() => setLoading(false))
  }, [view, tab, page, empresaId])

  function handleNewSuccess() { setView('list'); setTab('minhas'); setPage(1) }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'todas', label: 'todas as ideias' },
    { key: 'novas', label: 'novas ideias' },
    { key: 'minhas', label: 'minhas ideias' },
    { key: 'em_estudo', label: 'em estudo' },
    { key: 'desenvolvidas', label: 'desenvolvidas' },
  ]

  if (view === 'detail' && selectedIdeia) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--d2b-bg-surface)' }}>
        <IdeiaDetail
          ideia={selectedIdeia}
          empresaId={empresaId}
          onBack={() => setView('list')}
          onUpdated={updated => {
            setSelectedIdeia(updated)
            setIdeias(prev => prev.map(i => i.id === updated.id ? updated : i))
          }}
        />
      </div>
    )
  }

  if (view === 'new') {
    return (
      <div className="min-h-screen" style={{ background: 'var(--d2b-bg-surface)' }}>
        <div className="px-4 pt-4 pb-2 border-b" style={{ borderColor: 'var(--d2b-border)' }}>
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm hover:opacity-70" style={{ color: '#7C4DFF' }}>
            <ChevronLeft size={16} /> voltar
          </button>
          <p className="text-xs mt-1" style={{ color: 'var(--d2b-text-muted)' }}>
            <span className="cursor-pointer hover:underline" style={{ color: 'var(--d2b-text-secondary)' }} onClick={() => setView('list')}>
              início
            </span>{' '}canal de ideias
          </p>
        </div>
        <NovaIdeiaForm empresaId={empresaId} onSuccess={handleNewSuccess} onCancel={() => setView('list')} />
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--d2b-bg-main)' }}>
      {/* Sticky header */}
      <div
        className="sticky top-0 z-10 border-b px-6 py-3"
        style={{ background: 'var(--d2b-bg-surface)', borderColor: 'var(--d2b-border)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb size={18} style={{ color: '#7C4DFF' }} />
            <h1 className="text-sm font-semibold" style={{ color: 'var(--d2b-text-primary)' }}>Canal de Ideias</h1>
          </div>
          <button
            onClick={() => setView('new')}
            className="flex items-center gap-2 bg-[#7C4DFF] text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-[#5B21B6] transition-colors"
          >
            <Plus size={14} /> Nova ideia
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setPage(1) }}
              className={[
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
                tab === t.key
                  ? 'bg-[#7C4DFF] border-[#7C4DFF] !text-white'
                  : 'bg-transparent border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)]',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>

        <h2 className="text-lg font-semibold mb-4 capitalize" style={{ color: 'var(--d2b-text-primary)' }}>
          {TABS.find(t => t.key === tab)?.label ?? 'Todas as ideias'}
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={28} className="animate-spin" style={{ color: '#7C4DFF' }} />
          </div>
        ) : ideias.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3" style={{ color: 'var(--d2b-text-muted)' }}>
            <ImageOff size={36} />
            <p className="text-sm">Nenhuma ideia encontrada</p>
            <button onClick={() => setView('new')} className="text-xs hover:underline" style={{ color: '#7C4DFF' }}>
              Cadastrar primeira ideia
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ideias.map(ideia => (
              <IdeiaCard key={ideia.id} ideia={ideia} onClick={() => { setSelectedIdeia(ideia); setView('detail') }} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className="w-8 h-8 rounded-lg text-sm font-medium transition-colors"
                style={page === p
                  ? { background: 'var(--d2b-brand)', color: '#fff' }
                  : { color: 'var(--d2b-text-secondary)', background: 'var(--d2b-bg-elevated)' }
                }
              >
                {p}
              </button>
            ))}
            {totalPages > 6 && (
              <button
                onClick={() => setPage(Math.min(page + 1, totalPages))}
                className="w-8 h-8 rounded-lg text-sm"
                style={{ color: 'var(--d2b-text-secondary)', background: 'var(--d2b-bg-elevated)' }}
              >
                →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

