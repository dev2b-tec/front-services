'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  ReactFlow, Background, Controls, MiniMap, addEdge,
  useNodesState, useEdgesState, Handle, Position,
  type Node, type Edge, type Connection, type NodeProps,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  MessageSquare, GitBranch, CheckCircle2, Trash2, Save,
  Bot, Anchor, Paperclip, Hash, Type, Puzzle, CornerDownRight,
  GitMerge, MapPin, List, FileText, Download, Globe, Code, Terminal,
  Timer, ChevronDown, ChevronRight, Plus, X, Loader2, PenLine, type LucideIcon,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { EmpresaData } from '@/app/dashboard/configuracoes/page'

const WHATS_API_URL = process.env.NEXT_PUBLIC_WHATS_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? ''

type Fluxo = { id: string; nome: string; descricao?: string; ativo: boolean; fluxo: { nodes: Node[]; edges: Edge[] } }

// ─── Data type ────────────────────────────────────────────────────────────────
type NodeData = {
  label: string
  mensagem?: string
  opcoes?: string[]
  variavel?: string
  operador?: string
  valor?: string
  nomeVariavel?: string
  valorVariavel?: string
  prompt?: string
  variavelSaida?: string
  tipoEntrada?: string
  tipoAnexo?: string
  urlAnexo?: string
  legenda?: string
  duracao?: number
  unidadeDelay?: string
  destino?: string
  nomeFluxo?: string
  nomeAncora?: string
  url?: string
  metodo?: string
  headersJson?: string
  bodyJson?: string
  variavelResposta?: string
  codigo?: string
  nota?: string
  tipoIntegracao?: string
  acaoIntegracao?: string
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
const nb = (sel: boolean) =>
  `bg-white dark:bg-[#1e1e2e] rounded-xl shadow-md border-2 min-w-[190px] max-w-[250px] transition-all ${
    sel ? 'border-[#7C4DFF] shadow-[0_0_0_3px_#7C4DFF22]' : 'border-[#e2e2e2] dark:border-[#3a3a4a]'
  }`
const H = '!border-white !w-3 !h-3'

function Hdr({ bg, tc, icon, title }: { bg: string; tc: string; icon: React.ReactNode; title: string }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 border-b border-black/5 ${bg} rounded-t-xl`}>
      {icon}
      <span className={`text-[10px] font-semibold uppercase tracking-wide ${tc}`}>{title}</span>
    </div>
  )
}
function Body({ children }: { children: React.ReactNode }) {
  return <div className="px-3 py-2">{children}</div>
}
function Preview({ text, ph }: { text?: string; ph: string }) {
  return (
    <p className={`text-xs leading-snug line-clamp-2 ${text ? 'text-[var(--d2b-text-secondary)]' : 'text-[var(--d2b-text-muted)] italic'}`}>
      {text || ph}
    </p>
  )
}

// ─── Node components ──────────────────────────────────────────────────────────
function NodeInicio({ data }: NodeProps) {
  const d = data as NodeData
  return (
    <div className="bg-[#7C4DFF] text-white rounded-xl px-4 py-3 min-w-[160px] shadow-lg border-2 border-purple-400/60 flex items-center gap-2">
      <Bot size={16} />
      <span className="text-xs font-bold">{d.label}</span>
      <Handle type="source" position={Position.Bottom} className={`${H} !bg-white`} />
    </div>
  )
}

function NodeMensagem({ data, selected }: NodeProps) {
  const d = data as NodeData
  return (
    <div className={nb(selected)}>
      <Hdr bg="bg-blue-50 dark:bg-blue-950/30" tc="text-blue-600 dark:text-blue-400" icon={<MessageSquare size={12} className="text-blue-500" />} title="Mensagem" />
      <Body><Preview text={d.mensagem} ph="Defina a mensagem..." /></Body>
      <Handle type="target" position={Position.Top} className={`${H} !bg-blue-400`} />
      <Handle type="source" position={Position.Bottom} className={`${H} !bg-blue-400`} />
    </div>
  )
}

function NodeAnexo({ data, selected }: NodeProps) {
  const d = data as NodeData
  const em: Record<string, string> = { imagem: '🖼️', video: '🎥', documento: '📄', audio: '🔊' }
  return (
    <div className={nb(selected)}>
      <Hdr bg="bg-blue-50 dark:bg-blue-950/30" tc="text-blue-600 dark:text-blue-400" icon={<Paperclip size={12} className="text-blue-500" />} title="Anexo" />
      <Body>
        <div className="flex items-center gap-1.5">
          <span>{em[d.tipoAnexo ?? ''] ?? '📎'}</span>
          <Preview text={d.urlAnexo} ph="URL do arquivo..." />
        </div>
        {d.legenda && <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1 truncate">{d.legenda}</p>}
      </Body>
      <Handle type="target" position={Position.Top} className={`${H} !bg-blue-400`} />
      <Handle type="source" position={Position.Bottom} className={`${H} !bg-blue-400`} />
    </div>
  )
}

function NodeLocalizacao({ data, selected }: NodeProps) {
  const d = data as NodeData
  return (
    <div className={nb(selected)}>
      <Hdr bg="bg-blue-50 dark:bg-blue-950/30" tc="text-blue-600 dark:text-blue-400" icon={<MapPin size={12} className="text-blue-500" />} title="Localização" />
      <Body><Preview text={d.mensagem} ph="Mensagem de solicitação..." /></Body>
      <Handle type="target" position={Position.Top} className={`${H} !bg-blue-400`} />
      <Handle type="source" position={Position.Bottom} className={`${H} !bg-blue-400`} />
    </div>
  )
}

function NodeMenu({ data, selected }: NodeProps) {
  const d = data as NodeData
  const opcoes = d.opcoes ?? []
  return (
    <div className={nb(selected)}>
      <Hdr bg="bg-amber-50 dark:bg-amber-950/30" tc="text-amber-600 dark:text-amber-400" icon={<List size={12} className="text-amber-500" />} title="Menu" />
      <Body>
        <p className="text-[10px] text-[var(--d2b-text-muted)] mb-1.5">{d.mensagem || 'Escolha uma opção:'}</p>
        <div className="space-y-1">
          {opcoes.map((op, i) => (
            <div key={i} className="relative flex items-center gap-2 pr-3">
              <span className="text-[9px] font-bold text-amber-500 bg-amber-100 dark:bg-amber-900/40 w-4 h-4 rounded flex items-center justify-center shrink-0">{i + 1}</span>
              <span className="text-[10px] text-[var(--d2b-text-secondary)] truncate">{op}</span>
              <Handle type="source" position={Position.Right} id={`op-${i}`} className={`${H} !bg-amber-400`} />
            </div>
          ))}
          {opcoes.length === 0 && <p className="text-[10px] text-[var(--d2b-text-muted)] italic">Adicione opções...</p>}
        </div>
      </Body>
      <Handle type="target" position={Position.Top} className={`${H} !bg-amber-400`} />
    </div>
  )
}

function NodeEntradaDados({ data, selected }: NodeProps) {
  const d = data as NodeData
  return (
    <div className={nb(selected)}>
      <Hdr bg="bg-amber-50 dark:bg-amber-950/30" tc="text-amber-600 dark:text-amber-400" icon={<Type size={12} className="text-amber-500" />} title="Entrada de dados" />
      <Body>
        <Preview text={d.prompt} ph="Pergunta ao usuário..." />
        {d.variavelSaida && <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1 font-mono">{`→ {{${d.variavelSaida}}}`}</p>}
      </Body>
      <Handle type="target" position={Position.Top} className={`${H} !bg-amber-400`} />
      <Handle type="source" position={Position.Bottom} className={`${H} !bg-amber-400`} />
    </div>
  )
}

function NodeReceberAnexo({ data, selected }: NodeProps) {
  const d = data as NodeData
  return (
    <div className={nb(selected)}>
      <Hdr bg="bg-amber-50 dark:bg-amber-950/30" tc="text-amber-600 dark:text-amber-400" icon={<Download size={12} className="text-amber-500" />} title="Receber Anexo" />
      <Body>
        <Preview text={d.mensagem} ph="Aguardando envio de arquivo..." />
        {d.variavelSaida && <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1 font-mono">{`→ {{${d.variavelSaida}}}`}</p>}
      </Body>
      <Handle type="target" position={Position.Top} className={`${H} !bg-amber-400`} />
      <Handle type="source" position={Position.Bottom} className={`${H} !bg-amber-400`} />
    </div>
  )
}

function NodeAncora({ data, selected }: NodeProps) {
  const d = data as NodeData
  return (
    <div className={`${nb(selected)} min-w-[140px]`}>
      <Hdr bg="bg-indigo-50 dark:bg-indigo-950/30" tc="text-indigo-600 dark:text-indigo-400" icon={<Anchor size={12} className="text-indigo-500" />} title="Âncora" />
      <Body><p className="text-xs font-mono text-indigo-500">#{d.nomeAncora || d.label}</p></Body>
      <Handle type="source" position={Position.Bottom} className={`${H} !bg-indigo-400`} />
    </div>
  )
}

function NodeCondicao({ data, selected }: NodeProps) {
  const d = data as NodeData
  return (
    <div className={nb(selected)}>
      <Hdr bg="bg-indigo-50 dark:bg-indigo-950/30" tc="text-indigo-600 dark:text-indigo-400" icon={<GitBranch size={12} className="text-indigo-500" />} title="Condição" />
      <Body>
        <p className="text-xs font-mono bg-[var(--d2b-bg-elevated)] rounded px-2 py-1 text-[var(--d2b-text-secondary)]">
          {d.variavel ? `{{${d.variavel}}} ${d.operador ?? '=='} "${d.valor ?? '?'}"` : 'Configure a condição...'}
        </p>
        <div className="flex justify-between mt-2 text-[10px] font-semibold">
          <span className="text-green-500">✓ Verdadeiro</span>
          <span className="text-red-400">✗ Falso</span>
        </div>
      </Body>
      <Handle type="target" position={Position.Top} className={`${H} !bg-indigo-400`} />
      <Handle type="source" position={Position.Bottom} id="verdadeiro" style={{ left: '30%' }} className={`${H} !bg-green-400`} />
      <Handle type="source" position={Position.Bottom} id="falso"      style={{ left: '70%' }} className={`${H} !bg-red-400`} />
    </div>
  )
}

function NodeIrPara({ data, selected }: NodeProps) {
  const d = data as NodeData
  return (
    <div className={`${nb(selected)} min-w-[150px]`}>
      <Hdr bg="bg-indigo-50 dark:bg-indigo-950/30" tc="text-indigo-600 dark:text-indigo-400" icon={<CornerDownRight size={12} className="text-indigo-500" />} title="Ir Para" />
      <Body><p className="text-xs font-mono text-indigo-500">→ #{d.destino || '...'}</p></Body>
      <Handle type="target" position={Position.Top} className={`${H} !bg-indigo-400`} />
    </div>
  )
}

function NodeIrParaFluxo({ data, selected }: NodeProps) {
  const d = data as NodeData
  return (
    <div className={`${nb(selected)} min-w-[160px]`}>
      <Hdr bg="bg-indigo-50 dark:bg-indigo-950/30" tc="text-indigo-600 dark:text-indigo-400" icon={<GitMerge size={12} className="text-indigo-500" />} title="Ir para Fluxo" />
      <Body><Preview text={d.nomeFluxo} ph="Nome do fluxo..." /></Body>
      <Handle type="target" position={Position.Top} className={`${H} !bg-indigo-400`} />
    </div>
  )
}

function NodeSmartDelay({ data, selected }: NodeProps) {
  const d = data as NodeData
  return (
    <div className={`${nb(selected)} min-w-[150px]`}>
      <Hdr bg="bg-indigo-50 dark:bg-indigo-950/30" tc="text-indigo-600 dark:text-indigo-400" icon={<Timer size={12} className="text-indigo-500" />} title="Smart Delay" />
      <Body>
        <p className="text-sm font-bold text-center text-[var(--d2b-text-primary)]">
          {d.duracao ?? '?'} <span className="text-xs font-normal text-[var(--d2b-text-muted)]">{d.unidadeDelay ?? 'segundos'}</span>
        </p>
      </Body>
      <Handle type="target" position={Position.Top} className={`${H} !bg-indigo-400`} />
      <Handle type="source" position={Position.Bottom} className={`${H} !bg-indigo-400`} />
    </div>
  )
}

function NodeDefinirValor({ data, selected }: NodeProps) {
  const d = data as NodeData
  return (
    <div className={nb(selected)}>
      <Hdr bg="bg-teal-50 dark:bg-teal-950/30" tc="text-teal-600 dark:text-teal-400" icon={<Hash size={12} className="text-teal-500" />} title="Definir valor" />
      <Body>
        <p className="text-xs font-mono bg-[var(--d2b-bg-elevated)] rounded px-2 py-1 text-[var(--d2b-text-secondary)]">
          {d.nomeVariavel ? `{{${d.nomeVariavel}}} = ${d.valorVariavel ?? '?'}` : 'Configure a variável...'}
        </p>
      </Body>
      <Handle type="target" position={Position.Top} className={`${H} !bg-teal-400`} />
      <Handle type="source" position={Position.Bottom} className={`${H} !bg-teal-400`} />
    </div>
  )
}

function NodeScript({ data, selected }: NodeProps) {
  const d = data as NodeData
  return (
    <div className={nb(selected)}>
      <Hdr bg="bg-teal-50 dark:bg-teal-950/30" tc="text-teal-600 dark:text-teal-400" icon={<Code size={12} className="text-teal-500" />} title="Script" />
      <Body>
        <pre className="text-[10px] font-mono bg-[var(--d2b-bg-elevated)] rounded px-2 py-1 line-clamp-3 whitespace-pre-wrap text-[var(--d2b-text-secondary)]">
          {d.codigo || '// Código JavaScript...'}
        </pre>
      </Body>
      <Handle type="target" position={Position.Top} className={`${H} !bg-teal-400`} />
      <Handle type="source" position={Position.Bottom} className={`${H} !bg-teal-400`} />
    </div>
  )
}

function NodeRpa({ data, selected }: NodeProps) {
  const d = data as NodeData
  return (
    <div className={nb(selected)}>
      <Hdr bg="bg-teal-50 dark:bg-teal-950/30" tc="text-teal-600 dark:text-teal-400" icon={<Terminal size={12} className="text-teal-500" />} title="RPA" />
      <Body><Preview text={d.mensagem} ph="Descreva a automação RPA..." /></Body>
      <Handle type="target" position={Position.Top} className={`${H} !bg-teal-400`} />
      <Handle type="source" position={Position.Bottom} className={`${H} !bg-teal-400`} />
    </div>
  )
}

function NodeRequisicaoUrl({ data, selected }: NodeProps) {
  const d = data as NodeData
  const mc: Record<string, string> = { GET: 'text-blue-500', POST: 'text-green-500', PUT: 'text-amber-500', PATCH: 'text-orange-500', DELETE: 'text-red-500' }
  return (
    <div className={nb(selected)}>
      <Hdr bg="bg-green-50 dark:bg-green-950/30" tc="text-green-600 dark:text-green-400" icon={<Globe size={12} className="text-green-500" />} title="Requisição de URL" />
      <Body>
        <div className="flex items-center gap-1.5">
          <span className={`text-[10px] font-bold shrink-0 ${mc[d.metodo ?? 'GET'] ?? 'text-blue-500'}`}>{d.metodo ?? 'GET'}</span>
          <Preview text={d.url} ph="https://..." />
        </div>
        {d.variavelResposta && <p className="text-[10px] text-[var(--d2b-text-muted)] mt-1 font-mono">{`→ {{${d.variavelResposta}}}`}</p>}
        <div className="flex justify-between mt-2 text-[10px] font-semibold">
          <span className="text-green-500">✓ Sucesso</span>
          <span className="text-red-400">✗ Erro</span>
        </div>
      </Body>
      <Handle type="target" position={Position.Top} className={`${H} !bg-green-400`} />
      <Handle type="source" position={Position.Bottom} id="sucesso" style={{ left: '30%' }} className={`${H} !bg-green-400`} />
      <Handle type="source" position={Position.Bottom} id="erro"    style={{ left: '70%' }} className={`${H} !bg-red-400`} />
    </div>
  )
}

function NodeIntegracoes({ data, selected }: NodeProps) {
  const d = data as NodeData
  return (
    <div className={nb(selected)}>
      <Hdr bg="bg-green-50 dark:bg-green-950/30" tc="text-green-600 dark:text-green-400" icon={<Puzzle size={12} className="text-green-500" />} title="Integrações" />
      <Body>
        <Preview
          text={d.tipoIntegracao ? `${d.tipoIntegracao}${d.acaoIntegracao ? ` → ${d.acaoIntegracao}` : ''}` : undefined}
          ph="Selecione integração..."
        />
      </Body>
      <Handle type="target" position={Position.Top} className={`${H} !bg-green-400`} />
      <Handle type="source" position={Position.Bottom} className={`${H} !bg-green-400`} />
    </div>
  )
}

function NodeNota({ data, selected }: NodeProps) {
  const d = data as NodeData
  return (
    <div className={nb(selected)}>
      <Hdr bg="bg-slate-50 dark:bg-slate-800/50" tc="text-slate-500" icon={<FileText size={12} className="text-slate-400" />} title="Nota de atendimento" />
      <Body><Preview text={d.nota} ph="Nota interna..." /></Body>
      <Handle type="target" position={Position.Top} className={`${H} !bg-slate-400`} />
      <Handle type="source" position={Position.Bottom} className={`${H} !bg-slate-400`} />
    </div>
  )
}

function NodeFim({ data, selected }: NodeProps) {
  const d = data as NodeData
  return (
    <div className={`${nb(selected)} min-w-[130px]`}>
      <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
        <CheckCircle2 size={14} className="text-slate-400" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{d.label}</span>
      </div>
      <Handle type="target" position={Position.Top} className={`${H} !bg-slate-400`} />
    </div>
  )
}

// ─── Registry ─────────────────────────────────────────────────────────────────
const NODE_TYPES = {
  inicio: NodeInicio, mensagem: NodeMensagem, anexo: NodeAnexo, localizacao: NodeLocalizacao,
  menu: NodeMenu, entrada_dados: NodeEntradaDados, receber_anexo: NodeReceberAnexo,
  ancora: NodeAncora, condicao: NodeCondicao, ir_para: NodeIrPara, ir_para_fluxo: NodeIrParaFluxo, smart_delay: NodeSmartDelay,
  definir_valor: NodeDefinirValor, script: NodeScript, rpa: NodeRpa,
  requisicao_url: NodeRequisicaoUrl, integracoes: NodeIntegracoes, nota: NodeNota, fim: NodeFim,
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const NODE_DEFAULTS: Record<string, Partial<NodeData>> = {
  mensagem:       { label: 'Mensagem',           mensagem: '' },
  anexo:          { label: 'Anexo',              tipoAnexo: 'imagem', urlAnexo: '', legenda: '' },
  localizacao:    { label: 'Localização',        mensagem: 'Envie sua localização:' },
  menu:           { label: 'Menu',               mensagem: 'Escolha uma opção:', opcoes: ['Opção 1', 'Opção 2'] },
  entrada_dados:  { label: 'Entrada de dados',   prompt: '', variavelSaida: 'resposta', tipoEntrada: 'texto' },
  receber_anexo:  { label: 'Receber Anexo',      mensagem: 'Envie o arquivo:', variavelSaida: 'arquivo' },
  ancora:         { label: 'Âncora',             nomeAncora: 'ancora_1' },
  condicao:       { label: 'Condição',           variavel: '', operador: '==', valor: '' },
  ir_para:        { label: 'Ir Para',            destino: '' },
  ir_para_fluxo:  { label: 'Ir para Fluxo',      nomeFluxo: '' },
  smart_delay:    { label: 'Smart Delay',        duracao: 5, unidadeDelay: 'segundos' },
  definir_valor:  { label: 'Definir valor',      nomeVariavel: '', valorVariavel: '' },
  script:         { label: 'Script',             codigo: '// Código JavaScript\nreturn true;' },
  rpa:            { label: 'RPA',                mensagem: '' },
  requisicao_url: { label: 'Requisição de URL',  url: '', metodo: 'GET', variavelResposta: 'resposta' },
  integracoes:    { label: 'Integrações',        tipoIntegracao: 'MERCADO_PAGO', acaoIntegracao: '' },
  nota:           { label: 'Nota de atendimento', nota: '' },
  fim:            { label: 'Fim' },
}

// ─── Panel categories ─────────────────────────────────────────────────────────
type PanelItem = { type: string; label: string; Icon: LucideIcon; color: string }
const CATEGORIES: { id: string; label: string; items: PanelItem[] }[] = [
  { id: 'conteudo', label: 'Conteúdo', items: [
    { type: 'mensagem',    label: 'Mensagem',    Icon: MessageSquare, color: 'text-blue-500' },
    { type: 'anexo',       label: 'Anexo',       Icon: Paperclip,     color: 'text-blue-500' },
    { type: 'localizacao', label: 'Localização', Icon: MapPin,        color: 'text-blue-500' },
  ]},
  { id: 'interacao', label: 'Interação', items: [
    { type: 'menu',          label: 'Menu',            Icon: List,     color: 'text-amber-500' },
    { type: 'entrada_dados', label: 'Entrada de dados', Icon: Type,   color: 'text-amber-500' },
    { type: 'receber_anexo', label: 'Receber Anexo',   Icon: Download, color: 'text-amber-500' },
  ]},
  { id: 'logica', label: 'Lógica', items: [
    { type: 'ancora',        label: 'Âncora',        Icon: Anchor,          color: 'text-indigo-500' },
    { type: 'condicao',      label: 'Condição',      Icon: GitBranch,       color: 'text-indigo-500' },
    { type: 'ir_para',       label: 'Ir Para',       Icon: CornerDownRight, color: 'text-indigo-500' },
    { type: 'ir_para_fluxo', label: 'Ir para Fluxo', Icon: GitMerge,       color: 'text-indigo-500' },
    { type: 'smart_delay',   label: 'Smart Delay',   Icon: Timer,           color: 'text-indigo-500' },
  ]},
  { id: 'proc', label: 'Processamento', items: [
    { type: 'definir_valor', label: 'Definir valor', Icon: Hash,     color: 'text-teal-500' },
    { type: 'script',        label: 'Script',        Icon: Code,     color: 'text-teal-500' },
    { type: 'rpa',           label: 'RPA',           Icon: Terminal, color: 'text-teal-500' },
  ]},
  { id: 'externo', label: 'Externo', items: [
    { type: 'requisicao_url', label: 'Requisição de URL', Icon: Globe,  color: 'text-green-500' },
    { type: 'integracoes',    label: 'Integrações',       Icon: Puzzle, color: 'text-green-500' },
  ]},
  { id: 'outros', label: 'Outros', items: [
    { type: 'nota', label: 'Nota',  Icon: FileText,     color: 'text-slate-400' },
    { type: 'fim',  label: 'Fim',   Icon: CheckCircle2, color: 'text-slate-400' },
  ]},
]

// ─── Property panel helpers ───────────────────────────────────────────────────
type Setter = (k: keyof NodeData, v: unknown) => void

function Inp({ label, value, onChange, type = 'text', placeholder, mono }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; mono?: boolean
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-[var(--d2b-text-muted)]">{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        className={`w-full text-xs px-2.5 py-1.5 rounded-lg border border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)] text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] ${mono ? 'font-mono' : ''}`} />
    </div>
  )
}
function Txt({ label, value, onChange, rows = 3, placeholder, mono }: {
  label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string; mono?: boolean
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-[var(--d2b-text-muted)]">{label}</label>
      <textarea value={value} rows={rows} placeholder={placeholder} onChange={e => onChange(e.target.value)}
        className={`w-full text-xs px-2.5 py-1.5 rounded-lg border border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)] text-[var(--d2b-text-primary)] resize-none focus:outline-none focus:border-[#7C4DFF] ${mono ? 'font-mono' : ''}`} />
    </div>
  )
}
function Sel({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-[var(--d2b-text-muted)]">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)] text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF]">
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

function renderProps(node: Node, set: Setter) {
  const d = node.data as NodeData
  switch (node.type) {
    case 'mensagem':
      return <Txt label="Mensagem" value={d.mensagem ?? ''} onChange={v => set('mensagem', v)} placeholder="Texto que o bot irá enviar..." />
    case 'anexo':
      return (<>
        <Sel label="Tipo" value={d.tipoAnexo ?? 'imagem'} onChange={v => set('tipoAnexo', v)}
          options={[{ value: 'imagem', label: '🖼️ Imagem' }, { value: 'video', label: '🎥 Vídeo' }, { value: 'documento', label: '📄 Documento' }, { value: 'audio', label: '🔊 Áudio' }]} />
        <Inp label="URL do arquivo" value={d.urlAnexo ?? ''} onChange={v => set('urlAnexo', v)} placeholder="https://..." />
        <Inp label="Legenda" value={d.legenda ?? ''} onChange={v => set('legenda', v)} placeholder="Descrição..." />
      </>)
    case 'localizacao':
      return <Inp label="Mensagem" value={d.mensagem ?? ''} onChange={v => set('mensagem', v)} placeholder="Envie sua localização:" />
    case 'menu':
      return (<>
        <Inp label="Mensagem" value={d.mensagem ?? ''} onChange={v => set('mensagem', v)} placeholder="Escolha uma opção:" />
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-[var(--d2b-text-muted)]">Opções</label>
          {(d.opcoes ?? []).map((op, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-amber-500 w-4 text-center shrink-0">{i + 1}</span>
              <input value={op} onChange={e => { const n = [...(d.opcoes ?? [])]; n[i] = e.target.value; set('opcoes', n) }}
                className="flex-1 text-xs px-2 py-1 rounded-lg border border-[var(--d2b-border)] bg-[var(--d2b-bg-elevated)] text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF]" />
              <button onClick={() => set('opcoes', (d.opcoes ?? []).filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><X size={12} /></button>
            </div>
          ))}
          <button onClick={() => set('opcoes', [...(d.opcoes ?? []), 'Nova opção'])} className="flex items-center gap-1 text-[10px] text-[#7C4DFF] hover:underline mt-1">
            <Plus size={11} /> Adicionar opção
          </button>
        </div>
      </>)
    case 'entrada_dados':
      return (<>
        <Txt label="Pergunta ao usuário" value={d.prompt ?? ''} onChange={v => set('prompt', v)} placeholder="Como posso te chamar?" />
        <Sel label="Tipo" value={d.tipoEntrada ?? 'texto'} onChange={v => set('tipoEntrada', v)}
          options={[{ value: 'texto', label: 'Texto' }, { value: 'numero', label: 'Número' }, { value: 'email', label: 'E-mail' }, { value: 'telefone', label: 'Telefone' }, { value: 'data', label: 'Data' }, { value: 'cpf', label: 'CPF' }]} />
        <Inp label="Salvar em variável" value={d.variavelSaida ?? ''} onChange={v => set('variavelSaida', v)} placeholder="nome_usuario" mono />
      </>)
    case 'receber_anexo':
      return (<>
        <Txt label="Mensagem" value={d.mensagem ?? ''} onChange={v => set('mensagem', v)} placeholder="Envie o arquivo:" />
        <Inp label="Salvar em variável" value={d.variavelSaida ?? ''} onChange={v => set('variavelSaida', v)} placeholder="arquivo_recebido" mono />
      </>)
    case 'ancora':
      return <Inp label="Nome da âncora" value={d.nomeAncora ?? ''} onChange={v => set('nomeAncora', v)} placeholder="ancora_1" mono />
    case 'condicao':
      return (<>
        <Inp label="Variável" value={d.variavel ?? ''} onChange={v => set('variavel', v)} placeholder="nome_usuario" mono />
        <Sel label="Operador" value={d.operador ?? '=='} onChange={v => set('operador', v)}
          options={[
            { value: '==', label: '== igual a' }, { value: '!=', label: '!= diferente de' },
            { value: '>', label: '> maior que' }, { value: '<', label: '< menor que' },
            { value: '>=', label: '>= maior ou igual' }, { value: '<=', label: '<= menor ou igual' },
            { value: 'contains', label: 'contém' }, { value: 'not_contains', label: 'não contém' },
            { value: 'exists', label: 'existe' }, { value: 'not_exists', label: 'não existe' },
          ]} />
        {!['exists', 'not_exists'].includes(d.operador ?? '') &&
          <Inp label="Valor" value={d.valor ?? ''} onChange={v => set('valor', v)} placeholder="valor esperado" />}
        <p className="text-[10px] text-[var(--d2b-text-muted)] bg-[var(--d2b-bg-elevated)] rounded px-2 py-1.5 leading-relaxed">
          Saída esquerda → <span className="text-green-500 font-semibold">Verdadeiro</span><br />
          Saída direita → <span className="text-red-400 font-semibold">Falso</span>
        </p>
      </>)
    case 'ir_para':
      return <Inp label="Âncora de destino" value={d.destino ?? ''} onChange={v => set('destino', v)} placeholder="ancora_1" mono />
    case 'ir_para_fluxo':
      return <Inp label="Nome do fluxo" value={d.nomeFluxo ?? ''} onChange={v => set('nomeFluxo', v)} placeholder="fluxo_agendamento" />
    case 'smart_delay':
      return (<>
        <Inp label="Duração" value={String(d.duracao ?? 5)} type="number" onChange={v => set('duracao', Number(v))} />
        <Sel label="Unidade" value={d.unidadeDelay ?? 'segundos'} onChange={v => set('unidadeDelay', v)}
          options={[{ value: 'segundos', label: 'Segundos' }, { value: 'minutos', label: 'Minutos' }, { value: 'horas', label: 'Horas' }, { value: 'dias', label: 'Dias' }]} />
      </>)
    case 'definir_valor':
      return (<>
        <Inp label="Nome da variável" value={d.nomeVariavel ?? ''} onChange={v => set('nomeVariavel', v)} placeholder="minha_variavel" mono />
        <Inp label="Valor" value={d.valorVariavel ?? ''} onChange={v => set('valorVariavel', v)} placeholder="valor ou {{outra_var}}" />
      </>)
    case 'script':
      return <Txt label="Código JavaScript" value={d.codigo ?? ''} onChange={v => set('codigo', v)} rows={8} placeholder="// return valor" mono />
    case 'rpa':
      return <Txt label="Descrição da automação" value={d.mensagem ?? ''} onChange={v => set('mensagem', v)} placeholder="Descreva o processo a ser automatizado..." />
    case 'requisicao_url':
      return (<>
        <Sel label="Método HTTP" value={d.metodo ?? 'GET'} onChange={v => set('metodo', v)}
          options={['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => ({ value: m, label: m }))} />
        <Inp label="URL" value={d.url ?? ''} onChange={v => set('url', v)} placeholder="https://api.exemplo.com/..." />
        <Inp label="Salvar resposta em" value={d.variavelResposta ?? ''} onChange={v => set('variavelResposta', v)} placeholder="resposta_api" mono />
        <Txt label="Headers (JSON)" value={d.headersJson ?? ''} onChange={v => set('headersJson', v)} rows={3} placeholder={'{"Authorization": "Bearer {{token}}"}'}  mono />
        {['POST', 'PUT', 'PATCH'].includes(d.metodo ?? '') &&
          <Txt label="Body (JSON)" value={d.bodyJson ?? ''} onChange={v => set('bodyJson', v)} rows={4} placeholder={'{"campo": "{{variavel}}"}'} mono />}
        <p className="text-[10px] text-[var(--d2b-text-muted)] bg-[var(--d2b-bg-elevated)] rounded px-2 py-1.5 leading-relaxed">
          Saída esquerda → <span className="text-green-500 font-semibold">Sucesso</span><br />
          Saída direita → <span className="text-red-400 font-semibold">Erro</span>
        </p>
      </>)
    case 'integracoes':
      return (<>
        <Sel label="Integração" value={d.tipoIntegracao ?? ''} onChange={v => set('tipoIntegracao', v)}
          options={[{ value: 'MERCADO_PAGO', label: 'Mercado Pago' }, { value: 'SMTP', label: 'SMTP / E-mail' }, { value: 'WHATSAPP', label: 'WhatsApp' }, { value: 'WEBHOOK', label: 'Webhook' }]} />
        <Inp label="Ação" value={d.acaoIntegracao ?? ''} onChange={v => set('acaoIntegracao', v)} placeholder="Ex: gerar_cobranca" />
      </>)
    case 'nota':
      return <Txt label="Nota interna" value={d.nota ?? ''} onChange={v => set('nota', v)} placeholder="Esta nota não é enviada ao usuário..." />
    default:
      return null
  }
}

function PainelPropriedades({ node, onChange, onDelete }: {
  node: Node | null
  onChange: (id: string, data: Partial<NodeData>) => void
  onDelete: (id: string) => void
}) {
  if (!node) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--d2b-text-muted)] px-4 text-center">
        <Bot size={28} className="opacity-20" />
        <p className="text-[11px]">Clique em um nó para editar suas propriedades</p>
      </div>
    )
  }
  const d = node.data as NodeData
  const set: Setter = (k, v) => onChange(node.id, { [k]: v })
  return (
    <div className="p-3 space-y-3 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-[var(--d2b-text-muted)] uppercase tracking-wide">Propriedades</span>
        {node.id !== 'inicio' && (
          <button onClick={() => onDelete(node.id)} className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-600">
            <Trash2 size={11} /> Excluir
          </button>
        )}
      </div>
      <Inp label="Nome do nó" value={d.label ?? ''} onChange={v => set('label', v)} />
      <div className="border-t border-[var(--d2b-border)] pt-3 space-y-3">
        {renderProps(node, set)}
      </div>
    </div>
  )
}

// ─── Initial flow ─────────────────────────────────────────────────────────────
const INITIAL_NODES: Node[] = [
  { id: 'inicio', type: 'inicio',       position: { x: 240, y: 20  }, data: { label: 'Início do fluxo' }, deletable: false },
  { id: 'n1',     type: 'mensagem',     position: { x: 160, y: 120 }, data: { label: 'Boas-vindas', mensagem: 'Olá! Bem-vindo à nossa clínica 😊 Como posso te ajudar?' } },
  { id: 'n2',     type: 'menu',         position: { x: 60,  y: 270 }, data: { label: 'Menu principal', mensagem: 'Escolha uma opção:', opcoes: ['Agendar consulta', 'Falar com atendente', 'Encerrar atendimento'] } },
  { id: 'n3',     type: 'entrada_dados', position: { x: -120, y: 490 }, data: { label: 'Nome do paciente', prompt: 'Qual é o seu nome?', variavelSaida: 'nome_paciente', tipoEntrada: 'texto' } },
  { id: 'n4',     type: 'nota',         position: { x: 160, y: 490 }, data: { label: 'Fila de atendimento', nota: 'Paciente solicitou atendente humano' } },
  { id: 'n5',     type: 'fim',          position: { x: 380, y: 490 }, data: { label: 'Encerrar' } },
]
const INITIAL_EDGES: Edge[] = [
  { id: 'e1', source: 'inicio', target: 'n1', animated: true, style: { stroke: '#7C4DFF' } },
  { id: 'e2', source: 'n1', target: 'n2', style: { stroke: '#94a3b8' } },
  { id: 'e3', source: 'n2', target: 'n3', sourceHandle: 'op-0', style: { stroke: '#f59e0b' } },
  { id: 'e4', source: 'n2', target: 'n4', sourceHandle: 'op-1', style: { stroke: '#f59e0b' } },
  { id: 'e5', source: 'n2', target: 'n5', sourceHandle: 'op-2', style: { stroke: '#f59e0b' } },
]

let nodeCounter = 100

// ─── Main ─────────────────────────────────────────────────────────────────────
export function TabChatbot({ initialEmpresa }: { initialEmpresa?: EmpresaData | null }) {
  const empresaId = initialEmpresa?.id
  const { toast } = useToast()

  // fluxo list & selection
  const [fluxos, setFluxos] = useState<Fluxo[]>([])
  const [fluxoAtual, setFluxoAtual] = useState<Fluxo | null>(null)
  const [loadingFluxos, setLoadingFluxos] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [novoNome, setNovoNome] = useState('')
  const [criandoNovo, setCriandoNovo] = useState(false)

  // flow editor state
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES)
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  // load fluxos list
  useEffect(() => {
    if (!empresaId) return
    setLoadingFluxos(true)
    fetch(`${WHATS_API_URL}/api/v1/chatbot/empresa/${empresaId}/fluxos`, { credentials: 'include' })
      .then(r => r.ok ? r.json() : [])
      .then((data: Fluxo[]) => {
        setFluxos(data)
        if (data.length > 0) abrirFluxo(data[0])
      })
      .catch(() => {})
      .finally(() => setLoadingFluxos(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empresaId])

  function abrirFluxo(f: Fluxo) {
    setFluxoAtual(f)
    const saved = f.fluxo
    const savedNodes = saved?.nodes?.length ? saved.nodes : INITIAL_NODES
    setNodes(savedNodes)
    setEdges(saved?.edges?.length ? saved.edges : INITIAL_EDGES)
    setSelectedNode(null)
    // Garante que o contador começa acima do maior ID já existente no fluxo
    const maxId = savedNodes.reduce((max, n) => {
      const match = n.id.match(/^node-(\d+)$/)
      return match ? Math.max(max, parseInt(match[1], 10)) : max
    }, 100)
    nodeCounter = maxId
  }

  const [loadingAtivo, setLoadingAtivo] = useState(false)

  async function toggleAtivo() {
    if (!empresaId || !fluxoAtual) return
    const novoAtivo = !fluxoAtual.ativo
    setLoadingAtivo(true)
    try {
      // Se está ativando, desativa todos os outros primeiro
      if (novoAtivo) {
        await Promise.all(
          fluxos.filter(f => f.id !== fluxoAtual.id && f.ativo).map(f =>
            fetch(`${WHATS_API_URL}/api/v1/chatbot/empresa/${empresaId}/fluxos/${f.id}`, {
              method: 'PUT', credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ nome: f.nome, descricao: f.descricao, ativo: false, fluxo: f.fluxo }),
            })
          )
        )
        setFluxos(prev => prev.map(f => f.id === fluxoAtual.id ? f : { ...f, ativo: false }))
      }
      // Atualiza o fluxo atual
      const res = await fetch(`${WHATS_API_URL}/api/v1/chatbot/empresa/${empresaId}/fluxos/${fluxoAtual.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: fluxoAtual.nome, descricao: fluxoAtual.descricao, ativo: novoAtivo, fluxo: { nodes, edges } }),
      })
      if (!res.ok) throw new Error()
      const saved: Fluxo = await res.json()
      setFluxoAtual(saved)
      setFluxos(prev => prev.map(f => f.id === saved.id ? saved : f))
      toast({ title: novoAtivo ? 'Chatbot ativado!' : 'Chatbot desativado' })
    } catch {
      toast({ title: 'Erro ao alterar status do chatbot', variant: 'destructive' })
    } finally {
      setLoadingAtivo(false)
    }
  }

  async function salvar() {
    if (!empresaId) return
    setSalvando(true)
    try {
      const body = { fluxo: { nodes, edges } }
      let res: Response
      if (fluxoAtual) {
        res = await fetch(`${WHATS_API_URL}/api/v1/chatbot/empresa/${empresaId}/fluxos/${fluxoAtual.id}`, {
          method: 'PUT', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, nome: fluxoAtual.nome }),
        })
      } else {
        res = await fetch(`${WHATS_API_URL}/api/v1/chatbot/empresa/${empresaId}/fluxos`, {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...body, nome: novoNome || 'Novo fluxo' }),
        })
      }
      if (!res.ok) throw new Error()
      const saved: Fluxo = await res.json()
      setFluxoAtual(saved)
      setFluxos(prev => prev.some(f => f.id === saved.id) ? prev.map(f => f.id === saved.id ? saved : f) : [saved, ...prev])
      toast({ title: 'Fluxo salvo com sucesso!' })
    } catch {
      toast({ title: 'Erro ao salvar fluxo', variant: 'destructive' })
    } finally {
      setSalvando(false)
    }
  }

  async function criarNovo() {
    if (!empresaId || !novoNome.trim()) return
    setSalvando(true)
    try {
      const res = await fetch(`${WHATS_API_URL}/api/v1/chatbot/empresa/${empresaId}/fluxos`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: novoNome.trim(), fluxo: { nodes: INITIAL_NODES, edges: INITIAL_EDGES } }),
      })
      if (!res.ok) throw new Error()
      const criado: Fluxo = await res.json()
      setFluxos(prev => [criado, ...prev])
      abrirFluxo(criado)
      setNovoNome('')
      setCriandoNovo(false)
      toast({ title: 'Fluxo criado!' })
    } catch {
      toast({ title: 'Erro ao criar fluxo', variant: 'destructive' })
    } finally {
      setSalvando(false)
    }
  }

  async function deletarFluxo(id: string) {
    if (!empresaId) return
    try {
      await fetch(`${WHATS_API_URL}/api/v1/chatbot/empresa/${empresaId}/fluxos/${id}`, {
        method: 'DELETE', credentials: 'include',
      })
      const restantes = fluxos.filter(f => f.id !== id)
      setFluxos(restantes)
      if (fluxoAtual?.id === id) {
        if (restantes.length > 0) abrirFluxo(restantes[0])
        else { setFluxoAtual(null); setNodes(INITIAL_NODES); setEdges(INITIAL_EDGES) }
      }
      toast({ title: 'Fluxo excluído' })
    } catch {
      toast({ title: 'Erro ao excluir fluxo', variant: 'destructive' })
    }
  }

  const onConnect = useCallback((c: Connection) => setEdges(es => addEdge({ ...c, style: { stroke: '#94a3b8' } }, es)), [setEdges])
  const onNodeClick = useCallback((_: React.MouseEvent, n: Node) => setSelectedNode(n), [])
  const onPaneClick = useCallback(() => setSelectedNode(null), [])

  const updateNode = useCallback((id: string, data: Partial<NodeData>) => {
    setNodes(ns => ns.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n))
    setSelectedNode(p => p?.id === id ? { ...p, data: { ...p.data, ...data } } : p)
  }, [setNodes])

  const deleteNode = useCallback((id: string) => {
    setNodes(ns => ns.filter(n => n.id !== id))
    setEdges(es => es.filter(e => e.source !== id && e.target !== id))
    setSelectedNode(null)
  }, [setNodes, setEdges])

  const addNode = useCallback((type: string) => {
    const id = `node-${++nodeCounter}`
    setNodes(ns => [...ns, {
      id, type,
      position: { x: 80 + Math.random() * 300, y: 80 + Math.random() * 200 },
      data: { ...(NODE_DEFAULTS[type] ?? { label: 'Novo nó' }) },
    }])
  }, [setNodes])

  return (
    <div className="flex flex-col h-full -m-8">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div>
            <h2 className="text-sm font-bold text-[var(--d2b-text-primary)]">Chatbot</h2>
            <p className="text-xs text-[var(--d2b-text-muted)]">Monte o fluxo de conversa do seu chatbot</p>
          </div>
          {/* Fluxo selector */}
          {fluxos.length > 0 && (
            <select
              value={fluxoAtual?.id ?? ''}
              onChange={e => { const f = fluxos.find(x => x.id === e.target.value); if (f) abrirFluxo(f) }}
              className="text-xs border border-[var(--d2b-border)] rounded-lg px-2 py-1.5 bg-[var(--d2b-bg-elevated)] text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] max-w-[200px]">
              {fluxos.map(f => <option key={f.id} value={f.id}>{f.ativo ? '● ' : '○ '}{f.nome}</option>)}
            </select>
          )}
          {loadingFluxos && <Loader2 size={14} className="animate-spin text-[var(--d2b-text-muted)]" />}
          {/* Toggle ativo */}
          {fluxoAtual && (
            <button
              onClick={toggleAtivo}
              disabled={loadingAtivo}
              title={fluxoAtual.ativo ? 'Clique para desativar o chatbot' : 'Clique para ativar este chatbot'}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                fluxoAtual.ativo
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-[var(--d2b-bg-elevated)] border-[var(--d2b-border)] text-[var(--d2b-text-muted)] hover:bg-[var(--d2b-hover)]'
              }`}>
              {loadingAtivo
                ? <Loader2 size={11} className="animate-spin" />
                : <span className={`w-2 h-2 rounded-full ${fluxoAtual.ativo ? 'bg-emerald-500' : 'bg-gray-300'}`} />}
              {fluxoAtual.ativo ? 'Ativo' : 'Inativo'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Criar novo fluxo */}
          {criandoNovo ? (
            <div className="flex items-center gap-1.5">
              <input autoFocus value={novoNome} onChange={e => setNovoNome(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') criarNovo(); if (e.key === 'Escape') setCriandoNovo(false) }}
                placeholder="Nome do fluxo"
                className="text-xs border border-[var(--d2b-border)] rounded-lg px-2.5 py-1.5 bg-[var(--d2b-bg-elevated)] text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] w-36" />
              <button onClick={criarNovo} disabled={!novoNome.trim() || salvando}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-[#7C4DFF] text-white hover:bg-[#6c3de0] disabled:opacity-50 transition-colors">
                {salvando ? <Loader2 size={12} className="animate-spin" /> : 'Criar'}
              </button>
              <button onClick={() => setCriandoNovo(false)} className="text-xs px-2 py-1.5 rounded-lg border border-[var(--d2b-border)] text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors">
                <X size={13} />
              </button>
            </div>
          ) : (
            <button onClick={() => setCriandoNovo(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--d2b-border)] text-xs text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors">
              <PenLine size={13} /> Novo fluxo
            </button>
          )}
          {fluxoAtual && (
            <button onClick={() => deletarFluxo(fluxoAtual.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-xs text-red-500 hover:bg-red-50 transition-colors">
              <Trash2 size={13} /> Excluir
            </button>
          )}
          <button onClick={salvar} disabled={salvando}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C4DFF] text-white text-xs font-medium hover:bg-[#6c3de0] disabled:opacity-60 transition-colors">
            {salvando ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Salvar fluxo
          </button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left panel */}
        <div className="w-44 shrink-0 border-r border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] overflow-y-auto [&::-webkit-scrollbar]:w-0">
          {CATEGORIES.map(cat => (
            <div key={cat.id}>
              <button onClick={() => setCollapsed(c => ({ ...c, [cat.id]: !c[cat.id] }))}
                className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold text-[var(--d2b-text-muted)] uppercase tracking-wide hover:bg-[var(--d2b-hover)] transition-colors">
                {cat.label}
                {collapsed[cat.id] ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              </button>
              {!collapsed[cat.id] && (
                <div className="px-2 pb-2 space-y-1">
                  {cat.items.map(({ type, label, Icon, color }) => (
                    <button key={type} onClick={() => addNode(type)}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs border border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors text-left">
                      <Icon size={13} className={color} />
                      <span className="text-[var(--d2b-text-primary)] truncate">{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div className="flex-1 min-w-0">
          <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
            onConnect={onConnect} onNodeClick={onNodeClick} onPaneClick={onPaneClick}
            nodeTypes={NODE_TYPES} fitView deleteKeyCode="Delete" className="bg-[var(--d2b-bg-base)]">
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="var(--d2b-border)" />
            <Controls className="!border-[var(--d2b-border)] !bg-[var(--d2b-bg-surface)] !shadow-md" />
            <MiniMap className="!border-[var(--d2b-border)] !bg-[var(--d2b-bg-surface)] !rounded-xl overflow-hidden"
              nodeColor={n => {
                if (n.type === 'inicio') return '#7C4DFF'
                if (['mensagem','anexo','localizacao'].includes(n.type??'')) return '#3b82f6'
                if (['menu','entrada_dados','receber_anexo'].includes(n.type??'')) return '#f59e0b'
                if (['ancora','condicao','ir_para','ir_para_fluxo','smart_delay'].includes(n.type??'')) return '#6366f1'
                if (['definir_valor','script','rpa'].includes(n.type??'')) return '#14b8a6'
                if (['requisicao_url','integracoes'].includes(n.type??'')) return '#22c55e'
                return '#94a3b8'
              }} />
          </ReactFlow>
        </div>

        {/* Right panel */}
        <div className="w-56 shrink-0 border-l border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)]">
          <PainelPropriedades node={selectedNode} onChange={updateNode} onDelete={deleteNode} />
        </div>
      </div>
    </div>
  )
}

