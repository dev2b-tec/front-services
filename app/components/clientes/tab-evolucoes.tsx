'use client'

import { useState, useEffect } from 'react'
import {
  Plus, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ChevronsLeft, ChevronsRight, Pencil, Trash2, X, Printer,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// ─── Types ───────────────────────────────────────────────────────────────────

export type EvolucaoApi = {
  id: string
  pacienteId: string
  titulo: string | null
  profissional: string
  data: string
  assinado: boolean
  resumoAi: string | null
  comentariosGerais: string | null
  conduta: string | null
  examesRealizados: string | null
  prescricao: string | null
}

// ─── Constants ────────────────────────────────────────────────────────────────

const ABAS_EVOLUCAO = ['Resumo AI', 'Comentários Gerais', 'Conduta', 'Exames Realizados', 'Prescrição', 'Odontograma', 'Anexos']
const PAGE_SIZES = [10, 25, 50]
const MAX_CHARS = 20000

// ─── Odontograma ─────────────────────────────────────────────────────────────

const TEETH_UPPER: [number, number][] = [
  [18,270],[17,283],[16,296],[15,309],[14,321],[13,334],[12,347],[11,357],
  [21,3],[22,16],[23,28],[24,41],[25,54],[26,66],[27,79],[28,90],
]
const TEETH_LOWER: [number, number][] = [
  [38,90],[37,103],[36,116],[35,128],[34,141],[33,154],[32,166],[31,177],
  [41,183],[42,195],[43,207],[44,219],[45,231],[46,244],[47,256],[48,270],
]

function ToothCircle({ num, cx, cy, selected, onClick }: {
  num: number; cx: number; cy: number; selected: boolean; onClick: () => void
}) {
  return (
    <g onClick={onClick} className="cursor-pointer">
      <circle cx={cx} cy={cy} r={11}
        fill={selected ? 'rgba(124,77,255,0.25)' : 'rgba(21,8,48,0.8)'}
        stroke={selected ? '#7C4DFF' : 'rgba(124,77,255,0.35)'} strokeWidth={1.2} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize={8}
        fill={selected ? '#C084FC' : '#A78BCC'} fontWeight={selected ? '700' : '400'}>
        {num}
      </text>
    </g>
  )
}

function OdontogramaView() {
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [painelOpen, setPainelOpen] = useState(false)
  const [denteAtivo, setDenteAtivo] = useState<number | ''>('')
  const [denteDropOpen, setDenteDropOpen] = useState(false)
  const [descricao, setDescricao] = useState('')
  const W = 460; const H = 420
  const CX = W / 2; const CY = H / 2
  const RU = 138; const RL = 154

  const ALL_TEETH = [
    ...TEETH_UPPER.map(([n]) => n),
    ...TEETH_LOWER.map(([n]) => n),
  ].sort((a, b) => a - b)

  function toXY(angleDeg: number, r: number): [number, number] {
    const rad = (angleDeg - 90) * Math.PI / 180
    return [CX + r * Math.cos(rad), CY + r * Math.sin(rad)]
  }

  function toggleTooth(n: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(n) ? next.delete(n) : next.add(n)
      return next
    })
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)]">Odontograma</h3>
          <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">Preencha o odontograma adicionando informações a cada dente que desejar.</p>
        </div>
        <button
          onClick={() => setPainelOpen((v) => !v)}
          className="flex items-center gap-1.5 bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0"
        >
          <Plus size={12} /> Adicionar Dente
        </button>
      </div>
      <div className="flex-1 flex gap-4 overflow-hidden">
        <div className={`flex items-center justify-center transition-all ${painelOpen ? 'flex-shrink-0' : 'flex-1'}`}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <circle cx={CX} cy={CY} r={178} fill="rgba(21,8,48,0.5)" stroke="rgba(124,77,255,0.15)" strokeWidth={1} />
            <circle cx={CX} cy={CY} r={118} fill="rgba(13,5,32,0.6)" stroke="rgba(124,77,255,0.10)" strokeWidth={1} />
            <line x1={CX} y1={CY - 178} x2={CX} y2={CY - 118} stroke="rgba(124,77,255,0.18)" strokeWidth={1} />
            <line x1={CX} y1={CY + 118} x2={CX} y2={CY + 178} stroke="rgba(124,77,255,0.18)" strokeWidth={1} />
            <line x1={CX - 178} y1={CY} x2={CX - 118} y2={CY} stroke="rgba(124,77,255,0.18)" strokeWidth={1} />
            <line x1={CX + 118} y1={CY} x2={CX + 178} y2={CY} stroke="rgba(124,77,255,0.18)" strokeWidth={1} />
            <text x={CX} y={CY - 40} textAnchor="middle" fontSize={9} fill="#6B4E8A" letterSpacing={1}>Maxilar superior</text>
            <text x={CX} y={CY + 52} textAnchor="middle" fontSize={9} fill="#6B4E8A" letterSpacing={1}>Maxilar inferior</text>
            <text x={22} y={CY + 4} textAnchor="middle" fontSize={8} fill="#6B4E8A" transform={`rotate(-90 22 ${CY})`}>DIREITA</text>
            <text x={W - 14} y={CY + 4} textAnchor="middle" fontSize={8} fill="#6B4E8A" transform={`rotate(90 ${W - 14} ${CY})`}>ESQUERDA</text>
            {TEETH_UPPER.map(([num, angle]) => {
              const [x, y] = toXY(angle, RU)
              return <ToothCircle key={num} num={num} cx={x} cy={y} selected={selected.has(num)} onClick={() => toggleTooth(num)} />
            })}
            {TEETH_LOWER.map(([num, angle]) => {
              const [x, y] = toXY(angle, RL)
              return <ToothCircle key={num} num={num} cx={x} cy={y} selected={selected.has(num)} onClick={() => toggleTooth(num)} />
            })}
          </svg>
        </div>
        {painelOpen && (
          <div className="flex-1 flex flex-col justify-center space-y-4 pl-4 border-l border-[var(--d2b-border)]">
            <p className="text-sm font-semibold text-[#7C4DFF]">Preencha os dados para adicionar ao Odontograma</p>
            <div className="relative">
              <button
                onClick={() => setDenteDropOpen((v) => !v)}
                className="w-full flex items-center justify-between bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-2.5 text-sm text-[var(--d2b-text-primary)] hover:border-[#7C4DFF] transition-colors"
              >
                <span className={denteAtivo === '' ? 'text-[#3D2A5A]' : 'text-[var(--d2b-text-primary)]'}>
                  {denteAtivo === '' ? 'Selecionar dente' : `Dente ${denteAtivo}`}
                </span>
                <ChevronDown size={13} className="text-[var(--d2b-text-muted)]" />
              </button>
              {denteDropOpen && (
                <div className="absolute z-30 top-full mt-1 left-0 right-0 max-h-48 overflow-y-auto bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl">
                  {ALL_TEETH.map((n) => (
                    <button key={n} onClick={() => { setDenteAtivo(n); setDenteDropOpen(false) }}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${denteAtivo === n ? 'text-[#7C4DFF] bg-[var(--d2b-hover)]' : 'text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}>
                      Dente {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <textarea rows={5} placeholder="Descrição" value={descricao}
                onChange={(e) => setDescricao(e.target.value.slice(0, MAX_CHARS))}
                className="w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-primary)] placeholder-[#3D2A5A] focus:outline-none focus:border-[#7C4DFF] resize-none transition-colors"
              />
              <p className="text-xs text-[#7C4DFF] mt-1">Máximo de 20000 caracteres.</p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => { setPainelOpen(false); setDenteAtivo(''); setDescricao('') }}
                className="px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
                Cancelar
              </button>
              <button onClick={() => { setPainelOpen(false); setDenteAtivo(''); setDescricao('') }}
                className="px-5 py-2 bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold rounded-xl transition-colors">
                Adicionar
              </button>
            </div>
          </div>
        )}
      </div>
      {selected.size > 0 && (
        <p className="text-xs text-[var(--d2b-text-secondary)] mt-2 text-center">
          Dentes selecionados: {Array.from(selected).sort((a, b) => a - b).join(', ')}
        </p>
      )}
    </div>
  )
}

// ─── Conteúdo por aba ─────────────────────────────────────────────────────────

type AbaConteudos = {
  resumoAi: string
  comentariosGerais: string
  conduta: string
  examesRealizados: string
  prescricao: string
}

function buildConteudos(e?: EvolucaoApi | null): AbaConteudos {
  return {
    resumoAi: e?.resumoAi ?? '',
    comentariosGerais: e?.comentariosGerais ?? '',
    conduta: e?.conduta ?? '',
    examesRealizados: e?.examesRealizados ?? '',
    prescricao: e?.prescricao ?? '',
  }
}

function abaKey(aba: string): keyof AbaConteudos | null {
  const map: Record<string, keyof AbaConteudos> = {
    'Resumo AI': 'resumoAi',
    'Comentários Gerais': 'comentariosGerais',
    'Conduta': 'conduta',
    'Exames Realizados': 'examesRealizados',
    'Prescrição': 'prescricao',
  }
  return map[aba] ?? null
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface NovaEvolucaoModalProps {
  pacienteId: string
  evolucao?: EvolucaoApi | null   // se fornecido → modo edição
  onClose: () => void
  onSaved: (e: EvolucaoApi) => void
}

export function NovaEvolucaoModal({ pacienteId, evolucao, onClose, onSaved }: NovaEvolucaoModalProps) {
  const { toast } = useToast()
  const isEdit = !!evolucao

  const today = new Date().toISOString().split('T')[0]

  const [titulo, setTitulo] = useState(evolucao?.titulo ?? '')
  const [profissional, setProfissional] = useState(evolucao?.profissional ?? 'JESSE DOS SANTOS BEZERRA')
  const [profOpen, setProfOpen] = useState(false)
  const [data, setData] = useState(evolucao?.data ?? today)
  const [assinado, setAssinado] = useState(evolucao?.assinado ?? false)
  const [abaAtiva, setAbaAtiva] = useState('Resumo AI')
  const [conteudos, setConteudos] = useState<AbaConteudos>(buildConteudos(evolucao))
  const [modeloOpen, setModeloOpen] = useState(false)
  const [modelo, setModelo] = useState('Padrão')
  const [saving, setSaving] = useState(false)

  // Abas customizadas
  const [abasCustom, setAbasCustom] = useState<{ id: number; titulo: string; conteudo: string }[]>([])
  const [abaIdCounter, setAbaIdCounter] = useState(0)
  const [novaAbaOpen, setNovaAbaOpen] = useState(false)
  const [novaAbaTitulo, setNovaAbaTitulo] = useState('')
  const [novaAbaErro, setNovaAbaErro] = useState(false)
  const [editarAbaOpen, setEditarAbaOpen] = useState(false)
  const [editarAbaId, setEditarAbaId] = useState<number | null>(null)
  const [editarAbaTitulo, setEditarAbaTitulo] = useState('')
  const [editarAbaErro, setEditarAbaErro] = useState(false)

  // Anexos
  const [anexoArquivo, setAnexoArquivo] = useState('')
  const [anexoSearch, setAnexoSearch] = useState('')
  const [anexoPagina, setAnexoPagina] = useState(1)
  const [anexoPageSize, setAnexoPageSize] = useState(5)
  const [anexoPageSizeOpen, setAnexoPageSizeOpen] = useState(false)
  const anexos: { nome: string }[] = []
  const anexosFiltrados = anexos.filter((a) => a.nome.toLowerCase().includes(anexoSearch.toLowerCase()))
  const anexosTotalPags = Math.max(1, Math.ceil(anexosFiltrados.length / anexoPageSize))

  const PROFISSIONAIS = ['JESSE DOS SANTOS BEZERRA', 'Dr. Carlos Oliveira', 'Dra. Ana Lima']

  function setConteudo(aba: string, value: string) {
    const k = abaKey(aba)
    if (k) setConteudos((prev) => ({ ...prev, [k]: value.slice(0, MAX_CHARS) }))
  }

  function getConteudo(aba: string): string {
    const k = abaKey(aba)
    return k ? conteudos[k] : ''
  }

  async function handleSave() {
    if (!profissional || !data) {
      toast({ title: 'Profissional e data são obrigatórios', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const body = {
        pacienteId,
        titulo: titulo || null,
        profissional,
        data,
        assinado,
        resumoAi: conteudos.resumoAi || null,
        comentariosGerais: conteudos.comentariosGerais || null,
        conduta: conteudos.conduta || null,
        examesRealizados: conteudos.examesRealizados || null,
        prescricao: conteudos.prescricao || null,
      }
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/evolucoes/${evolucao!.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/evolucoes`
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error('Erro ao salvar')
      const saved: EvolucaoApi = await res.json()
      toast({ title: isEdit ? 'Evolução atualizada!' : 'Evolução registrada!' })
      onSaved(saved)
      onClose()
    } catch {
      toast({ title: 'Erro ao salvar evolução', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-5xl h-[92vh] bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-[var(--d2b-border)] flex-shrink-0">
          <span className="text-lg font-semibold text-[var(--d2b-text-primary)]">
            {isEdit ? 'Editar evolução' : 'Registrar nova evolução'}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--d2b-text-muted)]">{assinado ? 'Assinado' : 'Não Assinado'}</span>
              <button
                onClick={() => setAssinado((v) => !v)}
                className={`relative w-9 h-5 rounded-full transition-colors ${assinado ? 'bg-[#7C4DFF]' : 'bg-[#3D2A5A]'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${assinado ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <button className="w-6 h-6 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </button>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Top fields */}
        <div className="flex items-end gap-4 px-7 pt-5 pb-5 border-b border-[var(--d2b-border)] flex-shrink-0">
          <div className="flex-1">
            <label className="block text-xs font-medium text-[var(--d2b-text-muted)] mb-1.5">Título</label>
            <input
              type="text"
              placeholder="Ex Consulta, Exame, Sessão"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-primary)] placeholder-[#3D2A5A] focus:outline-none focus:border-[#7C4DFF] transition-colors"
            />
          </div>
          <div className="w-64">
            <label className="block text-xs font-medium text-[var(--d2b-text-muted)] mb-1.5">Profissional <span className="text-[#7C4DFF]">*</span></label>
            <div className="relative">
              <button
                onClick={() => setProfOpen((v) => !v)}
                className="w-full flex items-center justify-between bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-primary)] hover:border-[#7C4DFF] transition-colors"
              >
                <span className="truncate text-left">{profissional}</span>
                <ChevronDown size={13} className="text-[var(--d2b-text-muted)] flex-shrink-0" />
              </button>
              {profOpen && (
                <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl overflow-hidden">
                  {PROFISSIONAIS.map((p) => (
                    <button key={p} onClick={() => { setProfissional(p); setProfOpen(false) }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${profissional === p ? 'text-[#7C4DFF] bg-[var(--d2b-hover)]' : 'text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="w-44">
            <label className="block text-xs font-medium text-[var(--d2b-text-muted)] mb-1.5">Data <span className="text-[#7C4DFF]">*</span></label>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
            />
          </div>
        </div>

        {/* Body: left sidebar + content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left tab sidebar */}
          <div className="w-52 flex-shrink-0 border-r border-[var(--d2b-border)] flex flex-col py-3 overflow-y-auto">
            {ABAS_EVOLUCAO.map((aba) => (
              <button key={aba} onClick={() => setAbaAtiva(aba)}
                className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center gap-2.5 ${
                  abaAtiva === aba
                    ? 'text-[#7C4DFF] bg-[var(--d2b-hover)] font-semibold border-r-2 border-[#7C4DFF]'
                    : 'text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'
                }`}
              >
                {aba === 'Anexos' && <span>📁</span>}
                {aba}
              </button>
            ))}
            {abasCustom.map((aba) => (
              <button key={aba.id} onClick={() => setAbaAtiva(`custom-${aba.id}`)}
                className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center gap-2.5 ${
                  abaAtiva === `custom-${aba.id}`
                    ? 'text-[#7C4DFF] bg-[var(--d2b-hover)] font-semibold border-r-2 border-[#7C4DFF]'
                    : 'text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'
                }`}
              >
                {aba.titulo}
              </button>
            ))}
            <button
              onClick={() => { setNovaAbaTitulo(''); setNovaAbaErro(false); setNovaAbaOpen(true) }}
              className="w-full text-left px-5 py-3 text-sm text-[#7C4DFF] hover:bg-[var(--d2b-hover)] transition-colors flex items-center gap-1.5"
            >
              <Plus size={13} /> Nova Aba
            </button>
          </div>

          {/* Content area */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            {abaAtiva.startsWith('custom-') ? (() => {
              const id = parseInt(abaAtiva.replace('custom-', ''))
              const aba = abasCustom.find((a) => a.id === id)
              if (!aba) return null
              return (
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setEditarAbaId(id); setEditarAbaTitulo(aba.titulo); setEditarAbaErro(false); setEditarAbaOpen(true) }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:border-[#7C4DFF] transition-colors"
                      title="Editar aba"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button
                      onClick={() => { setAbasCustom((prev) => prev.filter((a) => a.id !== id)); setAbaAtiva('Resumo AI') }}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-muted)] hover:text-red-400 hover:border-red-400 transition-colors"
                      title="Apagar aba"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                  <textarea
                    placeholder="Descrição da nova aba"
                    value={aba.conteudo}
                    onChange={(e) => setAbasCustom((prev) => prev.map((a) => a.id === id ? { ...a, conteudo: e.target.value } : a))}
                    className="flex-1 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-5 py-4 text-sm text-[var(--d2b-text-primary)] placeholder-[#3D2A5A] focus:outline-none focus:border-[#7C4DFF] resize-none transition-colors leading-relaxed min-h-[300px]"
                  />
                </div>
              )
            })() : abaAtiva === 'Odontograma' ? (
              <OdontogramaView />
            ) : abaAtiva === 'Anexos' ? (
              <div className="flex-1 flex flex-col gap-5">
                <div>
                  <div className="flex items-center gap-0 rounded-xl overflow-hidden border border-[var(--d2b-border-strong)]">
                    <label className="flex-shrink-0 cursor-pointer bg-[var(--d2b-bg-elevated)] hover:bg-[var(--d2b-hover)] transition-colors px-5 py-3 text-sm font-medium text-[var(--d2b-text-primary)] border-r border-[var(--d2b-border-strong)]">
                      Selecione o arquivo
                      <input type="file" className="hidden" onChange={(e) => setAnexoArquivo(e.target.files?.[0]?.name ?? '')} />
                    </label>
                    <span className="flex-1 px-4 text-sm text-[var(--d2b-text-muted)] truncate bg-[var(--d2b-bg-elevated)]">
                      {anexoArquivo || 'nome do arquivo selecionado'}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--d2b-text-muted)] mt-1.5">Máximo de 15MB por arquivo.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-[var(--d2b-text-secondary)]">
                    Resultados por página:
                    <div className="relative">
                      <button onClick={() => setAnexoPageSizeOpen((v) => !v)}
                        className="flex items-center gap-1 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-lg px-3 py-1.5 text-sm text-[var(--d2b-text-primary)] hover:border-[#7C4DFF] transition-colors min-w-[60px] justify-between">
                        {anexoPageSize} <ChevronDown size={12} className="text-[var(--d2b-text-muted)]" />
                      </button>
                      {anexoPageSizeOpen && (
                        <div className="absolute z-30 top-full mt-1 left-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl overflow-hidden">
                          {[5, 10, 25].map((n) => (
                            <button key={n} onClick={() => { setAnexoPageSize(n); setAnexoPagina(1); setAnexoPageSizeOpen(false) }}
                              className={`w-full text-left px-4 py-2 text-sm transition-colors ${anexoPageSize === n ? 'text-[#7C4DFF] bg-[var(--d2b-hover)]' : 'text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}>{n}</button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-lg px-3 py-1.5 ml-auto">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--d2b-text-muted)]"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input value={anexoSearch} onChange={(e) => { setAnexoSearch(e.target.value); setAnexoPagina(1) }}
                      placeholder="Pesquisar"
                      className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder-[#6B4E8A] focus:outline-none w-40" />
                  </div>
                </div>
                <div className="flex-1 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl overflow-hidden flex flex-col">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--d2b-border)]">
                        <th className="text-left px-5 py-3 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase">Nome do Arquivo</th>
                        <th className="px-4 py-3 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase text-right">Visualizar</th>
                        <th className="px-4 py-3 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase text-right">Download</th>
                        <th className="px-4 py-3 text-xs font-semibold text-[var(--d2b-text-muted)] tracking-widest uppercase text-right">Apagar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {anexosFiltrados.length === 0 ? (
                        <tr><td colSpan={4} className="text-center py-10 text-[#7C4DFF] text-sm">Nenhum registro encontrado</td></tr>
                      ) : (
                        anexosFiltrados.slice((anexoPagina - 1) * anexoPageSize, anexoPagina * anexoPageSize).map((a, i) => (
                          <tr key={i} className="border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors">
                            <td className="px-5 py-3 text-[var(--d2b-text-primary)]">{a.nome}</td>
                            <td className="px-4 py-3 text-right">
                              <button className="text-[#7C4DFF] hover:text-[var(--d2b-text-secondary)] transition-colors">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button className="text-[#7C4DFF] hover:text-[var(--d2b-text-secondary)] transition-colors">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                              </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button className="text-[var(--d2b-text-muted)] hover:text-red-400 transition-colors">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  <div className="flex items-center justify-center gap-2 py-3 border-t border-[var(--d2b-border)] mt-auto">
                    <button onClick={() => setAnexoPagina(1)} disabled={anexoPagina === 1} className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] disabled:opacity-30 transition-colors text-xs">«</button>
                    <button onClick={() => setAnexoPagina((p) => Math.max(1, p - 1))} disabled={anexoPagina === 1} className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] disabled:opacity-30 transition-colors text-xs">‹</button>
                    <button onClick={() => setAnexoPagina((p) => Math.min(anexosTotalPags, p + 1))} disabled={anexoPagina === anexosTotalPags} className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] disabled:opacity-30 transition-colors text-xs">›</button>
                    <button onClick={() => setAnexoPagina(anexosTotalPags)} disabled={anexoPagina === anexosTotalPags} className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] disabled:opacity-30 transition-colors text-xs">»</button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <label className="block text-xs font-medium text-[var(--d2b-text-muted)] mb-3">{abaAtiva}</label>
                <textarea
                  placeholder={abaAtiva === 'Resumo AI' ? 'Resumos automáticos' : 'Digite aqui...'}
                  value={getConteudo(abaAtiva)}
                  onChange={(e) => setConteudo(abaAtiva, e.target.value)}
                  className="flex-1 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-5 py-4 text-sm text-[var(--d2b-text-primary)] placeholder-[#3D2A5A] focus:outline-none focus:border-[#7C4DFF] resize-none transition-colors leading-relaxed"
                />
                <p className="text-xs text-[var(--d2b-text-muted)] mt-1.5">Máximo de {MAX_CHARS.toLocaleString('pt-BR')} caracteres.</p>
                {abaAtiva === 'Resumo AI' && (
                  <>
                    <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">* Os resumos gerados por IA podem conter erros. Antes de salvá-lo, verifique e edite o conteúdo se necessário</p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs text-[var(--d2b-text-secondary)]">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                        Resumo gravado
                      </div>
                      <div className="relative">
                        <button onClick={() => setModeloOpen((v) => !v)}
                          className="flex items-center gap-1 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-lg px-2.5 py-1 text-xs text-[var(--d2b-text-primary)] hover:border-[#7C4DFF] transition-colors">
                          {modelo} <ChevronDown size={11} className="text-[var(--d2b-text-muted)]" />
                        </button>
                        {modeloOpen && (
                          <div className="absolute z-30 top-full mt-1 left-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl overflow-hidden">
                            {['Padrão', 'Clínico', 'Resumido'].map((m) => (
                              <button key={m} onClick={() => { setModelo(m); setModeloOpen(false) }}
                                className={`w-full text-left px-4 py-2 text-xs transition-colors ${modelo === m ? 'text-[#7C4DFF] bg-[var(--d2b-hover)]' : 'text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}>{m}</button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-[#7C4DFF] border border-[var(--d2b-border-strong)] bg-[var(--d2b-hover)] px-3 py-1.5 rounded-lg hover:bg-[var(--d2b-hover)] transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                        Relato
                      </button>
                      <button className="flex items-center gap-1.5 text-xs font-semibold text-[#7C4DFF] border border-[var(--d2b-border-strong)] bg-[var(--d2b-hover)] px-3 py-1.5 rounded-lg hover:bg-[var(--d2b-hover)] transition-colors">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                        Atendimento
                      </button>
                      <div className="ml-auto text-xs text-[var(--d2b-text-muted)]">
                        <span className="font-medium text-[var(--d2b-text-secondary)]">Créditos:</span> Relatos disponíveis: 5 / 5 &nbsp; Atendimentos disponíveis: 5 / 5
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-7 py-5 border-t border-[var(--d2b-border)] flex-shrink-0">
          <button className="flex items-center gap-1.5 text-xs font-bold text-[#7C4DFF] border border-[var(--d2b-border-strong)] px-3 py-2 rounded-lg hover:bg-[var(--d2b-hover)] transition-colors">
            ✦ Resumir Histórico
          </button>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
            >
              {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Salvar Evolução'}
            </button>
          </div>
        </div>

        {/* Modal: Nova Aba */}
        {novaAbaOpen && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-2xl">
            <div className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-2xl shadow-2xl w-[480px] p-7">
              <div className="flex items-center justify-between mb-6">
                <span className="text-base font-semibold text-[var(--d2b-text-primary)]">Adicionar nova aba</span>
                <button onClick={() => setNovaAbaOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
                  <X size={15} />
                </button>
              </div>
              <input autoFocus type="text" placeholder="Título da nova aba" value={novaAbaTitulo}
                onChange={(e) => { setNovaAbaTitulo(e.target.value); setNovaAbaErro(false) }}
                className={`w-full bg-[var(--d2b-bg-elevated)] border rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-primary)] placeholder-[#3D2A5A] focus:outline-none transition-colors ${novaAbaErro ? 'border-red-500' : 'border-[var(--d2b-border-strong)] focus:border-[#7C4DFF]'}`}
              />
              {novaAbaErro && <p className="text-xs text-red-400 mt-1.5">Deve ter no mínimo 1 caracter</p>}
              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => setNovaAbaOpen(false)} className="px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors border border-[var(--d2b-border-strong)] rounded-xl hover:border-[var(--d2b-border-strong)]">
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (!novaAbaTitulo.trim()) { setNovaAbaErro(true); return }
                    const id = abaIdCounter + 1
                    setAbaIdCounter(id)
                    setAbasCustom((prev) => [...prev, { id, titulo: novaAbaTitulo.trim(), conteudo: '' }])
                    setAbaAtiva(`custom-${id}`)
                    setNovaAbaOpen(false)
                  }}
                  className="px-5 py-2 bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Editar Aba */}
        {editarAbaOpen && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 rounded-2xl">
            <div className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-2xl shadow-2xl w-[480px] p-7">
              <div className="flex items-center justify-between mb-6">
                <span className="text-base font-semibold text-[var(--d2b-text-primary)]">Editar aba</span>
                <button onClick={() => setEditarAbaOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors">
                  <X size={15} />
                </button>
              </div>
              <input autoFocus type="text" placeholder="Título da aba" value={editarAbaTitulo}
                onChange={(e) => { setEditarAbaTitulo(e.target.value); setEditarAbaErro(false) }}
                className={`w-full bg-[var(--d2b-bg-elevated)] border rounded-xl px-4 py-3 text-sm text-[var(--d2b-text-primary)] placeholder-[#3D2A5A] focus:outline-none transition-colors ${editarAbaErro ? 'border-red-500' : 'border-[var(--d2b-border-strong)] focus:border-[#7C4DFF]'}`}
              />
              {editarAbaErro && <p className="text-xs text-red-400 mt-1.5">Deve ter no mínimo 1 caracter</p>}
              <div className="flex items-center justify-end gap-3 mt-6">
                <button onClick={() => setEditarAbaOpen(false)} className="px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors border border-[var(--d2b-border-strong)] rounded-xl hover:border-[var(--d2b-border-strong)]">
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (!editarAbaTitulo.trim()) { setEditarAbaErro(true); return }
                    setAbasCustom((prev) => prev.map((a) => a.id === editarAbaId ? { ...a, titulo: editarAbaTitulo.trim() } : a))
                    setEditarAbaOpen(false)
                  }}
                  className="px-5 py-2 bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Diálogo de confirmação de exclusão ──────────────────────────────────────

function ConfirmarExclusaoDialog({
  open, onConfirm, onCancel,
}: { open: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-2xl shadow-2xl w-[380px] p-7">
        <p className="text-base font-semibold text-[var(--d2b-text-primary)] mb-2">Excluir evolução</p>
        <p className="text-sm text-[var(--d2b-text-secondary)] mb-6">Essa ação não pode ser desfeita. Deseja continuar?</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-sm text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] rounded-xl hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors">
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Tab principal ────────────────────────────────────────────────────────────

export function TabEvolucoes({ pacienteId }: { pacienteId: string }) {
  const { toast } = useToast()
  const [evolucoes, setEvolucoes] = useState<EvolucaoApi[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [profFiltro, setProfFiltro] = useState('')
  const [profOpen, setProfOpen] = useState(false)
  const [dataFiltro, setDataFiltro] = useState('')
  const [pagina, setPagina] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [pageSizeOpen, setPageSizeOpen] = useState(false)
  const [sort, setSort] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'data', dir: 'desc' })
  const [novaOpen, setNovaOpen] = useState(false)
  const [editando, setEditando] = useState<EvolucaoApi | null>(null)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  const PROFISSIONAIS = Array.from(new Set(evolucoes.map((e) => e.profissional)))

  useEffect(() => {
    carregarEvolucoes()
  }, [pacienteId])

  async function carregarEvolucoes() {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/evolucoes/paciente/${pacienteId}`)
      if (res.ok) {
        const data = await res.json()
        setEvolucoes(data)
      }
    } catch {
      toast({ title: 'Erro ao carregar evoluções', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!excluindoId) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/evolucoes/${excluindoId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error()
      setEvolucoes((prev) => prev.filter((e) => e.id !== excluindoId))
      toast({ title: 'Evolução excluída' })
    } catch {
      toast({ title: 'Erro ao excluir evolução', variant: 'destructive' })
    } finally {
      setExcluindoId(null)
    }
  }

  function onSaved(saved: EvolucaoApi) {
    setEvolucoes((prev) => {
      const idx = prev.findIndex((e) => e.id === saved.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = saved
        return updated
      }
      return [saved, ...prev]
    })
  }

  function toggleSort(col: string) {
    setSort((s) => s.col === col ? { col, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { col, dir: 'asc' })
  }

  function SortIcon({ col }: { col: string }) {
    if (sort.col !== col) return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--d2b-text-muted)]"><path d="M7 15l5 5 5-5"/><path d="M7 9l5-5 5 5"/></svg>
    return sort.dir === 'asc'
      ? <ChevronUp size={11} className="text-[#7C4DFF]" />
      : <ChevronDown size={11} className="text-[#7C4DFF]" />
  }

  function formatDate(d: string) {
    if (!d) return ''
    const [y, m, day] = d.split('-')
    return `${day}/${m}/${y}`
  }

  const filtered = evolucoes
    .filter((e) =>
      (!busca || (e.titulo ?? '').toLowerCase().includes(busca.toLowerCase())) &&
      (!profFiltro || e.profissional === profFiltro) &&
      (!dataFiltro || e.data === dataFiltro)
    )
    .sort((a, b) => {
      const dir = sort.dir === 'asc' ? 1 : -1
      if (sort.col === 'titulo') return dir * (a.titulo ?? '').localeCompare(b.titulo ?? '')
      if (sort.col === 'profissional') return dir * a.profissional.localeCompare(b.profissional)
      if (sort.col === 'data') return dir * a.data.localeCompare(b.data)
      return 0
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paged = filtered.slice((pagina - 1) * pageSize, pagina * pageSize)

  return (
    <div className="flex-1 overflow-y-auto">
      {novaOpen && (
        <NovaEvolucaoModal
          pacienteId={pacienteId}
          onClose={() => setNovaOpen(false)}
          onSaved={onSaved}
        />
      )}
      {editando && (
        <NovaEvolucaoModal
          pacienteId={pacienteId}
          evolucao={editando}
          onClose={() => setEditando(null)}
          onSaved={onSaved}
        />
      )}
      <ConfirmarExclusaoDialog
        open={!!excluindoId}
        onConfirm={handleDelete}
        onCancel={() => setExcluindoId(null)}
      />

      {/* Sub-header */}
      <div className="px-6 pt-5 pb-4 border-b border-[var(--d2b-border)] flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-[var(--d2b-text-primary)]">Evoluções</h2>
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-elevated)] text-[#7C4DFF] hover:border-[#7C4DFF] transition-colors" title="Imprimir">
            <Printer size={15} />
          </button>
          <button onClick={() => setNovaOpen(true)} className="flex items-center gap-1.5 bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
            <Plus size={12} /> Nova Evolução
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-4 flex items-center gap-3 flex-wrap">
        <input type="text" placeholder="Título" value={busca} onChange={(e) => setBusca(e.target.value)}
          className="flex-1 min-w-[160px] bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder-[#3D2A5A] focus:outline-none focus:border-[#7C4DFF] transition-colors"
        />
        <div className="relative w-52">
          <button onClick={() => setProfOpen((v) => !v)}
            className="w-full flex items-center justify-between bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-2.5 text-sm transition-colors hover:border-[#7C4DFF]">
            <span className={profFiltro ? 'text-[var(--d2b-text-primary)]' : 'text-[#3D2A5A]'}>{profFiltro || 'Profissional'}</span>
            <ChevronDown size={13} className="text-[var(--d2b-text-muted)]" />
          </button>
          {profOpen && (
            <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl overflow-hidden">
              <button onClick={() => { setProfFiltro(''); setProfOpen(false) }} className="w-full text-left px-4 py-2.5 text-sm text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors">
                Todos
              </button>
              {PROFISSIONAIS.map((p) => (
                <button key={p} onClick={() => { setProfFiltro(p); setProfOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${profFiltro === p ? 'text-[#7C4DFF] bg-[var(--d2b-hover)]' : 'text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
        <input type="date" value={dataFiltro} onChange={(e) => setDataFiltro(e.target.value)}
          className="w-44 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl px-4 py-2.5 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors"
        />
        <button onClick={() => { setBusca(''); setProfFiltro(''); setDataFiltro(''); setPagina(1) }}
          className="px-4 py-2.5 text-sm text-[var(--d2b-text-secondary)] border border-[var(--d2b-border-strong)] rounded-xl hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] transition-colors">
          Limpar
        </button>
      </div>

      {/* Table */}
      <div className="px-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--d2b-border)]">
              <th className="text-left pb-3 w-20">
                <span className="text-xs font-bold text-[var(--d2b-text-muted)] uppercase tracking-wider">Ações</span>
              </th>
              {[{ col: 'titulo', label: 'Título' }, { col: 'profissional', label: 'Profissional' }, { col: 'data', label: 'Data' }].map(({ col, label }) => (
                <th key={col} className="text-left pb-3">
                  <button onClick={() => toggleSort(col)} className="flex items-center gap-1 text-xs font-bold text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-secondary)] uppercase tracking-wider transition-colors">
                    {label} <SortIcon col={col} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="py-10 text-center text-sm text-[var(--d2b-text-muted)]">Carregando...</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={4} className="py-10 text-center text-sm text-[var(--d2b-text-muted)]">Nenhum registro encontrado</td></tr>
            ) : (
              paged.map((e, i) => (
                <tr key={e.id} className={`border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors ${i === paged.length - 1 ? 'border-b-0' : ''}`}>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setEditando(e)}
                        className="w-7 h-7 rounded-md bg-[var(--d2b-hover)] hover:bg-[var(--d2b-hover)] flex items-center justify-center text-[#7C4DFF] transition-colors"
                        title="Editar">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => setExcluindoId(e.id)}
                        className="w-7 h-7 rounded-md bg-[rgba(239,68,68,0.10)] hover:bg-[rgba(239,68,68,0.22)] flex items-center justify-center text-[#EF4444] transition-colors"
                        title="Excluir">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-sm text-[var(--d2b-text-primary)]">{e.titulo || <span className="text-[var(--d2b-text-muted)] italic">Sem título</span>}</td>
                  <td className="py-3 pr-4 text-sm text-[var(--d2b-text-secondary)]">{e.profissional}</td>
                  <td className="py-3 text-sm text-[var(--d2b-text-secondary)]">{formatDate(e.data)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 flex items-center justify-center gap-1">
        <button onClick={() => setPagina(1)} disabled={pagina === 1} className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] disabled:opacity-30 transition-colors">
          <ChevronsLeft size={14} />
        </button>
        <button onClick={() => setPagina((p) => Math.max(1, p - 1))} disabled={pagina === 1} className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] disabled:opacity-30 transition-colors">
          <ChevronLeft size={14} />
        </button>
        <span className="w-7 h-7 rounded-full bg-[#7C4DFF] text-white text-xs font-bold flex items-center justify-center">{pagina}</span>
        <button onClick={() => setPagina((p) => Math.min(totalPages, p + 1))} disabled={pagina === totalPages} className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] disabled:opacity-30 transition-colors">
          <ChevronRight size={14} />
        </button>
        <button onClick={() => setPagina(totalPages)} disabled={pagina === totalPages} className="w-7 h-7 flex items-center justify-center rounded text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] disabled:opacity-30 transition-colors">
          <ChevronsRight size={14} />
        </button>
        <div className="relative ml-2">
          <button onClick={() => setPageSizeOpen((v) => !v)}
            className="flex items-center gap-1 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-lg px-2.5 py-1 text-sm text-[var(--d2b-text-primary)] hover:border-[#7C4DFF] transition-colors">
            {pageSize} <ChevronDown size={12} className="text-[var(--d2b-text-muted)]" />
          </button>
          {pageSizeOpen && (
            <div className="absolute z-20 bottom-full mb-1 right-0 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-xl shadow-xl overflow-hidden">
              {PAGE_SIZES.map((s) => (
                <button key={s} onClick={() => { setPageSize(s); setPagina(1); setPageSizeOpen(false) }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${s === pageSize ? 'text-[#7C4DFF] bg-[var(--d2b-hover)]' : 'text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]'}`}>
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
