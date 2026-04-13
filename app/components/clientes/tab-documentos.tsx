'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, Plus, X } from 'lucide-react'
import { DocumentoEditor } from '@/components/clientes/documento-editor'
// ─── Types ────────────────────────────────────────────────────────────────────

type Documento = {
  id: string
  usuarioId?: string
  profissional: string
  titulo: string
  conteudo: string
  tipo: string
  permProf: boolean
  permAssist: boolean
  criadoEm: string
}

// ─── Templates ───────────────────────────────────────────────────────────────

const TEMPLATE_DECLARACAO = `Declaração\n\nDeclaro para os devidos fins, que o(a) Sr.(a) #nome_do_paciente# esteve no consultório para (finalidade) no dia #data_de_hoje# das 00:00 às 00:00 horas realização de tratamento/acompanhamento/avaliação psicológico.\n\n#endereço_do_profissional#, #data_de_hoje#\n\n\n\nNOME COMPLETO`
const TEMPLATE_ATESTADO   = `Atestado Médico\n\nAtesto para os devidos fins que o(a) paciente #nome_do_paciente# esteve sob meus cuidados no dia #data_de_hoje#.\n\n#endereço_do_profissional#, #data_de_hoje#\n\n\n\nNOME COMPLETO`
const TEMPLATE_RECIBO     = `Recibo\n\nRecebi de #nome_do_paciente# a importância referente aos serviços prestados na data de #data_de_hoje#.\n\nValor: R$ ___________\n\n#endereço_do_profissional#, #data_de_hoje#\n\n\n\nNOME COMPLETO`

const TIPOS_DOC = [
  { id: 'branco',     label: 'Documento em branco',          template: '',                  badge: false },
  { id: 'declaracao', label: 'Declaração de Comparecimento', template: TEMPLATE_DECLARACAO, badge: true  },
  { id: 'atestado',   label: 'Atestado',                     template: TEMPLATE_ATESTADO,   badge: true  },
  { id: 'recibo',     label: 'Recibo',                       template: TEMPLATE_RECIBO,     badge: true  },
]

// Quill toolbar configuration (minimal, suitable for document editing)
const QUILL_MODULES = {
  toolbar: [],
}
const QUILL_FORMATS: string[] = []

// ─── Component ────────────────────────────────────────────────────────────────

export function TabDocumentos({
  pacienteId,
  pacienteNome,
  empresaId,
  onVoltar,
}: {
  pacienteId: string
  pacienteNome: string
  empresaId: string
  onVoltar: () => void
}) {
  const [docs, setDocs] = useState<Documento[]>([])
  const [pagina, setPagina] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageSizeOpen, setPageSizeOpen] = useState(false)
  const [sort, setSort] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'titulo', dir: 'asc' })

  // Profissionais da empresa
  const [usuarios, setUsuarios] = useState<Array<{ id: string; nome: string }>>([])

  // Modais
  const [visualizarId, setVisualizarId] = useState<string | null>(null)
  const [excluirId, setExcluirId] = useState<string | null>(null)

  // Novo documento
  const [novoOpen, setNovoOpen] = useState(false)
  const [novoTitulo, setNovoTitulo] = useState('')
  const [novoProf, setNovoProf] = useState<{ id: string; nome: string } | null>(null)
  const [novoProfOpen, setNovoProfOpen] = useState(false)
  const [novoPermProf, setNovoPermProf] = useState(true)
  const [novoPermAssist, setNovoPermAssist] = useState(true)
  const [novoAssinaturaProf, setNovoAssinaturaProf] = useState(false)
  const [novoAssinaturaPac, setNovoAssinaturaPac] = useState(false)
  const [novoLogo, setNovoLogo] = useState(false)
  const [novoTemplate, setNovoTemplate] = useState(false)
  const [novoConteudo, setNovoConteudo] = useState('')
  const [novoErros, setNovoErros] = useState<Record<string, string>>({})
  const [salvandoNovo, setSalvandoNovo] = useState(false)

  // Editar
  const [editarOpen, setEditarOpen] = useState(false)
  const [editarId, setEditarId] = useState<string | null>(null)
  const [editTitulo, setEditTitulo] = useState('')
  const [editProf, setEditProf] = useState<{ id: string; nome: string } | null>(null)
  const [editProfOpen, setEditProfOpen] = useState(false)
  const [editPermProf, setEditPermProf] = useState(true)
  const [editPermAssist, setEditPermAssist] = useState(true)
  const [editConteudo, setEditConteudo] = useState('')
  const [editErros, setEditErros] = useState<Record<string, string>>({})
  const [salvando, setSalvando] = useState(false)

  // ── Load docs
  useEffect(() => {
    if (!pacienteId) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documentos/paciente/${pacienteId}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: Array<{
        id: string; usuarioId?: string; usuarioNome?: string
        titulo: string; conteudo?: string; tipo: string
        permProf: boolean; permAssist: boolean; createdAt: string
      }>) => {
        setDocs(data.map((d) => ({
          id: d.id,
          usuarioId: d.usuarioId,
          profissional: d.usuarioNome ?? '',
          titulo: d.titulo,
          conteudo: d.conteudo ?? '',
          tipo: d.tipo,
          permProf: d.permProf,
          permAssist: d.permAssist,
          criadoEm: new Date(d.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        })))
      })
      .catch(() => {})
  }, [pacienteId])

  // ── Load profissionais
  useEffect(() => {
    if (!empresaId) return
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/usuarios/empresa/${empresaId}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data: Array<{ id: string; nome: string }>) => setUsuarios(data))
      .catch(() => {})
  }, [empresaId])

  // ── Helpers
  function toggleSort(col: string) {
    setSort((s) => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })
  }

  function SortIcon({ col }: { col: string }) {
    return (
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        className={col === sort.col ? 'opacity-100 text-[#7C4DFF]' : 'opacity-40'}>
        {col === sort.col && sort.dir === 'asc'
          ? <><path d="M7 15l5 5 5-5"/><path d="M7 9l5-5 5 5" opacity="0.3"/></>
          : col === sort.col
          ? <><path d="M7 15l5 5 5-5" opacity="0.3"/><path d="M7 9l5-5 5 5"/></>
          : <><path d="M7 15l5 5 5-5"/><path d="M7 9l5-5 5 5"/></>}
      </svg>
    )
  }

  const sorted = [...docs].sort((a, b) => {
    const dir = sort.dir === 'asc' ? 1 : -1
    if (sort.col === 'titulo')      return a.titulo.localeCompare(b.titulo) * dir
    if (sort.col === 'profissional') return a.profissional.localeCompare(b.profissional) * dir
    if (sort.col === 'criadoEm')    return a.criadoEm.localeCompare(b.criadoEm) * dir
    return 0
  })
  const totalPags = Math.max(1, Math.ceil(sorted.length / pageSize))
  const slice = sorted.slice((pagina - 1) * pageSize, pagina * pageSize)

  function openEditar(doc: Documento) {
    const prof = doc.usuarioId ? { id: doc.usuarioId, nome: doc.profissional } : null
    setEditarId(doc.id)
    setEditTitulo(doc.titulo)
    setEditProf(prof)
    setEditPermProf(doc.permProf)
    setEditPermAssist(doc.permAssist)
    setEditConteudo(doc.conteudo)
    setEditErros({})
    setEditarOpen(true)
  }

  function openNovo() {
    setNovoTitulo('')
    setNovoProf(null)
    setNovoProfOpen(false)
    setNovoPermProf(true)
    setNovoPermAssist(true)
    setNovoAssinaturaProf(false)
    setNovoAssinaturaPac(false)
    setNovoLogo(false)
    setNovoTemplate(false)
    setNovoConteudo('')
    setNovoErros({})
    setNovoOpen(true)
  }

  function resolveHashtags(html: string, prof: { id: string; nome: string } | null): string {
    const hoje = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
    return html
      .replace(/#nome_do_paciente#/g, pacienteNome)
      .replace(/#data_de_hoje#/g, hoje)
      .replace(/#endereço_do_profissional#/g, prof?.nome ?? '')
      .replace(/#[^#<\s]+#/g, '')
  }

  async function salvarNovoDocumento() {
    const erros: Record<string, string> = {}
    if (!novoTitulo.trim()) erros.titulo = 'Campo obrigatório'
    if (!novoProf)          erros.prof   = 'Campo obrigatório'
    if (Object.keys(erros).length > 0) { setNovoErros(erros); return }

    const conteudoFinal = resolveHashtags(novoConteudo, novoProf)
    setSalvandoNovo(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documentos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresaId, pacienteId,
          usuarioId: novoProf!.id,
          titulo: novoTitulo.trim(),
          conteudo: conteudoFinal,
          tipo: 'branco',
          permProf: novoPermProf,
          permAssist: novoPermAssist,
        }),
      })
      if (!res.ok) throw new Error()
      const criado: { id: string; usuarioId?: string; usuarioNome?: string; titulo: string; conteudo?: string; tipo: string; permProf: boolean; permAssist: boolean; createdAt: string } = await res.json()
      const ts = new Date(criado.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
      setDocs((prev) => [...prev, {
        id: criado.id, usuarioId: criado.usuarioId,
        profissional: criado.usuarioNome ?? novoProf!.nome,
        titulo: criado.titulo, conteudo: criado.conteudo ?? conteudoFinal,
        tipo: criado.tipo, permProf: criado.permProf, permAssist: criado.permAssist, criadoEm: ts,
      }])
      setNovoOpen(false)
    } catch {
      setNovoErros({ titulo: 'Erro ao salvar. Tente novamente.' })
    } finally {
      setSalvandoNovo(false)
    }
  }

  async function salvarDocumento() {
    const erros: Record<string, string> = {}
    if (!editTitulo.trim()) erros.titulo = 'Campo obrigatório'
    if (Object.keys(erros).length > 0) { setEditErros(erros); return }

    const conteudoFinal = resolveHashtags(editConteudo, editProf)

    setSalvando(true)
    try {
      if (editarId !== null) {
        // Atualizar
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documentos/${editarId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usuarioId: editProf?.id,
            titulo: editTitulo.trim(),
            conteudo: conteudoFinal,
            permProf: editPermProf,
            permAssist: editPermAssist,
          }),
        })
        if (!res.ok) throw new Error()
        const updated: { id: string; usuarioId?: string; usuarioNome?: string; titulo: string; conteudo?: string; tipo: string; permProf: boolean; permAssist: boolean; createdAt: string } = await res.json()
        setDocs((prev) => prev.map((d) => d.id === editarId ? {
          ...d,
          usuarioId: updated.usuarioId,
          profissional: updated.usuarioNome ?? editProf?.nome ?? '',
          titulo: updated.titulo,
          conteudo: updated.conteudo ?? conteudoFinal,
          permProf: updated.permProf,
          permAssist: updated.permAssist,
        } : d))
      } else {
        // Criar
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documentos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            empresaId,
            pacienteId,
            usuarioId: editProf?.id,
            titulo: editTitulo.trim(),
            conteudo: conteudoFinal,
            tipo: 'branco',
            permProf: editPermProf,
            permAssist: editPermAssist,
          }),
        })
        if (!res.ok) throw new Error()
        const criado: { id: string; usuarioId?: string; usuarioNome?: string; titulo: string; conteudo?: string; tipo: string; permProf: boolean; permAssist: boolean; createdAt: string } = await res.json()
        const now = new Date(criado.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
        setDocs((prev) => [...prev, {
          id: criado.id,
          usuarioId: criado.usuarioId,
          profissional: criado.usuarioNome ?? editProf?.nome ?? '',
          titulo: criado.titulo,
          conteudo: criado.conteudo ?? conteudoFinal,
          tipo: criado.tipo,
          permProf: criado.permProf,
          permAssist: criado.permAssist,
          criadoEm: now,
        }])
      }
      setEditarOpen(false)
    } catch {
      setEditErros({ titulo: 'Erro ao salvar. Tente novamente.' })
    } finally {
      setSalvando(false)
    }
  }

  // ── Visualizar: strip HTML tags for plain text content, render raw for html
  function renderConteudo(conteudo: string) {
    // If content has HTML tags (from Quill), render as HTML; otherwise pre-wrap plain text
    const hasHtml = /<[a-z][\s\S]*>/i.test(conteudo)
    if (hasHtml) {
      return <div className="text-gray-900 text-sm leading-relaxed prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: conteudo }} />
    }
    return <div className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap font-serif">{conteudo}</div>
  }

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col gap-5 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--d2b-text-primary)]">Documentos</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={openNovo}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Plus size={14} /> Novo Documento
          </button>
          <button onClick={onVoltar} className="px-4 py-1.5 text-sm text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] rounded-xl hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors">
            Voltar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--d2b-border)]">
              <th className="text-left px-5 py-3.5 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase w-40">Ações</th>
              <th className="text-left px-5 py-3.5">
                <button onClick={() => toggleSort('titulo')} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase hover:text-[var(--d2b-text-secondary)] transition-colors">
                  Título <SortIcon col="titulo" />
                </button>
              </th>
              <th className="text-left px-5 py-3.5">
                <button onClick={() => toggleSort('profissional')} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase hover:text-[var(--d2b-text-secondary)] transition-colors">
                  Profissional <SortIcon col="profissional" />
                </button>
              </th>
              <th className="text-left px-5 py-3.5">
                <button onClick={() => toggleSort('criadoEm')} className="flex items-center gap-1.5 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase hover:text-[var(--d2b-text-secondary)] transition-colors">
                  Criado Em <SortIcon col="criadoEm" />
                </button>
              </th>
              <th className="text-right px-5 py-3.5 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase leading-tight">Assinatura<br/>Prof. / Paci.</th>
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-[var(--d2b-text-muted)] text-sm">Nenhum documento encontrado</td></tr>
            ) : (
              slice.map((doc) => (
                <tr key={doc.id} className="border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setVisualizarId(doc.id)} className="w-7 h-7 flex items-center justify-center rounded-full border border-[var(--d2b-border-strong)] text-[#7C4DFF] hover:bg-[var(--d2b-hover)] transition-colors" title="Visualizar">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button className="w-7 h-7 flex items-center justify-center rounded-full border border-[var(--d2b-border-strong)] text-[#7C4DFF] hover:bg-[var(--d2b-hover)] transition-colors" title="Download">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </button>
                      <button onClick={() => openEditar(doc)} className="w-7 h-7 flex items-center justify-center rounded-full border border-[var(--d2b-border-strong)] text-[#7C4DFF] hover:bg-[var(--d2b-hover)] transition-colors" title="Editar">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button onClick={() => setExcluirId(doc.id)} className="w-7 h-7 flex items-center justify-center rounded-full border border-[rgba(255,100,100,0.30)] text-red-400 hover:bg-[rgba(255,100,100,0.12)] transition-colors" title="Excluir">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-[var(--d2b-text-primary)]">{doc.titulo}</td>
                  <td className="px-5 py-3.5 text-[var(--d2b-text-primary)]">{doc.profissional}</td>
                  <td className="px-5 py-3.5 text-[var(--d2b-text-primary)]">{doc.criadoEm}</td>
                  <td className="px-5 py-3.5 text-right text-[var(--d2b-text-muted)]">– | –</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-2 py-3 border-t border-[var(--d2b-border)]">
          <button onClick={() => setPagina(1)} disabled={pagina === 1} className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] disabled:opacity-30 transition-colors text-xs">«</button>
          <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1} className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] disabled:opacity-30 transition-colors text-xs">‹</button>
          {Array.from({ length: Math.min(totalPags, 5) }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPagina(p)}
              className={`w-7 h-7 flex items-center justify-center rounded-full text-xs transition-colors ${pagina === p ? 'bg-[#7C4DFF] text-white font-semibold' : 'text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]'}`}>{p}
            </button>
          ))}
          <button onClick={() => setPagina((p) => Math.min(totalPags, p + 1))} disabled={pagina === totalPags} className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] disabled:opacity-30 transition-colors text-xs">›</button>
          <button onClick={() => setPagina(totalPags)} disabled={pagina === totalPags} className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] disabled:opacity-30 transition-colors text-xs">»</button>
          <div className="relative ml-1">
            <button onClick={() => setPageSizeOpen((v) => !v)} className="flex items-center gap-1 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-lg px-3 py-1 text-sm text-[var(--d2b-text-primary)] hover:border-[#7C4DFF] transition-colors">
              {pageSize} <ChevronDown size={11} className="text-[var(--d2b-text-muted)]" />
            </button>
            {pageSizeOpen && (
              <div className="absolute z-30 bottom-full mb-1 left-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl overflow-hidden">
                {[10, 25, 50].map((n) => (
                  <button key={n} onClick={() => { setPageSize(n); setPagina(1); setPageSizeOpen(false) }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${pageSize === n ? 'text-[#7C4DFF] bg-[var(--d2b-hover)]' : 'text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}>{n}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal: Visualizar ───────────────────────────────────────────────── */}
      {visualizarId !== null && (() => {
        const doc = docs.find((d) => d.id === visualizarId)
        if (!doc) return null
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-7 py-4 border-b border-gray-200">
                <span className="text-base font-semibold text-gray-900">{doc.titulo}</span>
                <button onClick={() => setVisualizarId(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                  <X size={15} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-16 py-12">
                {renderConteudo(doc.conteudo)}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Modal: Excluir ─────────────────────────────────────────────────── */}
      {excluirId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900 mb-1">Excluir Documento</p>
                <p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
              </div>
              <button onClick={() => setExcluirId(null)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0">
                <X size={15} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/documentos/${excluirId}`, { method: 'DELETE' })
                  setDocs((prev) => prev.filter((d) => d.id !== excluirId))
                  setExcluirId(null)
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >Deletar</button>
              <button onClick={() => setExcluirId(null)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Novo Documento ──────────────────────────────────────────── */}
      {novoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
              <span className="text-base font-semibold text-gray-900">Novo Documento</span>
              <button onClick={() => setNovoOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-5">
              <p className="text-sm font-semibold text-gray-700">Informações do Documento</p>

              {/* Título + Profissional */}
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">Título <span className="text-purple-600">*</span></label>
                    <input autoFocus type="text" placeholder="Título do documento" value={novoTitulo}
                      onChange={(e) => { setNovoTitulo(e.target.value); setNovoErros((p) => ({ ...p, titulo: '' })) }}
                      className={`w-full border rounded-lg px-3 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none transition-colors ${novoErros.titulo ? 'border-red-400' : 'border-gray-300 focus:border-purple-500'}`}
                    />
                  </div>
                  {novoErros.titulo && <p className="text-xs text-red-500 mt-1">{novoErros.titulo}</p>}
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">Profissional <span className="text-purple-600">*</span></label>
                    <div className="relative">
                      <button onClick={() => setNovoProfOpen((v) => !v)}
                        className={`w-full flex items-center justify-between border rounded-lg px-3 py-3 text-sm hover:border-purple-500 transition-colors ${novoErros.prof ? 'border-red-400' : 'border-gray-300'} ${novoProf ? 'text-gray-900' : 'text-gray-400'}`}>
                        <span className="truncate text-left">{novoProf?.nome ?? 'Selecione um profissional'}</span>
                        <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />
                      </button>
                      {novoProfOpen && (
                        <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                          {usuarios.map((u) => (
                            <button key={u.id} onClick={() => { setNovoProf(u); setNovoProfOpen(false); setNovoErros((e) => ({ ...e, prof: '' })) }}
                              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${novoProf?.id === u.id ? 'text-purple-600 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>{u.nome}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {novoErros.prof && <p className="text-xs text-red-500 mt-1">{novoErros.prof}</p>}
                </div>
              </div>

              {/* Permissões */}
              <div>
                <p className="text-xs text-gray-500 mb-3">Permissões deste documento</p>
                <div className="flex flex-col gap-2.5">
                  {([
                    { label: 'Permitir que outros profissionais visualizem esse documento', on: novoPermProf,      set: setNovoPermProf },
                    { label: 'Permitir que assistentes visualizem esse documento',          on: novoPermAssist,    set: setNovoPermAssist },
                    { label: 'Solicitar assinatura do profissional ?',                      on: novoAssinaturaProf, set: setNovoAssinaturaProf },
                    { label: 'Solicitar assinatura do paciente ?',                          on: novoAssinaturaPac, set: setNovoAssinaturaPac },
                  ] as const).map(({ label, on, set }) => (
                    <label key={label} className="flex items-center gap-3 cursor-pointer">
                      <button onClick={() => set((v: boolean) => !v)} className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-purple-600' : 'bg-gray-300'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                      <span className="text-sm text-gray-600">{label}</span>
                    </label>
                  ))}
                  <p className="text-sm text-gray-500 pl-0.5">
                    Créditos: 5{' '}
                    <a href="/dashboard/configuracoes?tab=creditos" className="text-purple-600 underline hover:text-purple-700 transition-colors text-sm">Comprar Créditos</a>
                  </p>
                  {([
                    { label: 'Adicionar o logo da clínica no documento ?', on: novoLogo,     set: setNovoLogo },
                    { label: 'Salvar como template ?',                      on: novoTemplate, set: setNovoTemplate },
                  ] as const).map(({ label, on, set }) => (
                    <label key={label} className="flex items-center gap-3 cursor-pointer">
                      <button onClick={() => set((v: boolean) => !v)} className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-purple-600' : 'bg-gray-300'}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
                      </button>
                      <span className="text-sm text-gray-600">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <DocumentoEditor value={novoConteudo} onChange={setNovoConteudo} minHeight={200} />

              <p className="text-xs text-gray-400 leading-relaxed">
                Adicione variáveis inserindo hashtag(#) no campo de texto onde desejar. Elas serão substituídas automaticamente com seus valores no momento de criação do documento.
              </p>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100">
              <button onClick={() => setNovoOpen(false)} className="px-5 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:border-gray-300 hover:text-gray-700 transition-colors">Voltar</button>
              <button onClick={salvarNovoDocumento} disabled={salvandoNovo}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors">
                {salvandoNovo ? 'Salvando…' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Edição de Documento ─────────────────────────────────────── */}
      {editarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100">
              <span className="text-base font-semibold text-gray-900">Edição de Documento</span>
              <button onClick={() => setEditarOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                <X size={15} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-5">
              <p className="text-sm font-semibold text-gray-700">Informações do Documento</p>
              <div className="flex gap-4">
                {/* Título */}
                <div className="flex-1 relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">Título <span className="text-purple-600">*</span></label>
                  <input type="text" value={editTitulo}
                    onChange={(e) => { setEditTitulo(e.target.value); setEditErros((p) => ({ ...p, titulo: '' })) }}
                    className={`w-full border rounded-lg px-3 py-3 text-sm text-gray-900 focus:outline-none transition-colors ${editErros.titulo ? 'border-red-400' : 'border-gray-300 focus:border-purple-500'}`}
                  />
                  {editErros.titulo && <p className="text-xs text-red-500 mt-1">{editErros.titulo}</p>}
                </div>
                {/* Profissional */}
                <div className="flex-1 relative">
                  <label className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">Profissional <span className="text-purple-600">*</span></label>
                  <div className="relative">
                    <button onClick={() => setEditProfOpen((v) => !v)}
                      className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-3 text-sm text-gray-900 hover:border-purple-500 transition-colors">
                      <span className={`truncate text-left ${editProf ? '' : 'text-gray-400'}`}>{editProf?.nome ?? 'Selecione um profissional'}</span>
                      <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />
                    </button>
                    {editProfOpen && (
                      <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                        {usuarios.map((u) => (
                          <button key={u.id} onClick={() => { setEditProf(u); setEditProfOpen(false) }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${editProf?.id === u.id ? 'text-purple-600 bg-purple-50' : 'text-gray-700 hover:bg-gray-50'}`}>{u.nome}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Permissões */}
              <div>
                <p className="text-xs text-gray-500 mb-3">Permissões deste documento</p>
                <div className="flex flex-col gap-2.5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button onClick={() => setEditPermProf((v) => !v)} className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${editPermProf ? 'bg-purple-600' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${editPermProf ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                    <span className="text-sm text-gray-600">Permitir que outros profissionais visualizem esse documento</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <button onClick={() => setEditPermAssist((v) => !v)} className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${editPermAssist ? 'bg-purple-600' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${editPermAssist ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                    <span className="text-sm text-gray-600">Permitir que assistentes visualizem esse documento</span>
                  </label>
                </div>
              </div>

              <DocumentoEditor value={editConteudo} onChange={setEditConteudo} minHeight={260} />

              <p className="text-xs text-gray-400 leading-relaxed">
                Adicione variáveis inserindo hashtag(#) no campo de texto onde desejar. Elas serão substituídas automaticamente com seus valores no momento de criação do documento.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 px-7 py-5 border-t border-gray-100">
              <button onClick={() => setEditarOpen(false)} className="px-5 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:border-gray-300 hover:text-gray-700 transition-colors">Voltar</button>
              <button
                onClick={salvarDocumento}
                disabled={salvando}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
              >{salvando ? 'Salvando…' : 'Salvar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
