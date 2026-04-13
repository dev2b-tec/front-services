'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, ChevronDown, Search, Plus, Upload } from 'lucide-react'

// ─── Shared styles ──────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

const SEL =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2.5 text-sm text-[var(--d2b-text-primary)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'

const LBL = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'

const SECTION_TITLE = 'text-base font-semibold text-[var(--d2b-text-primary)] mb-4'

const BTN_PRIMARY =
  'flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

// ─── Tipos de aba ───────────────────────────────────────────────────────────
type AbaId = 'dados-gerais' | 'dados-complementares' | 'anexos' | 'observacoes'

const ABAS: { id: AbaId; label: string }[] = [
  { id: 'dados-gerais',          label: 'dados gerais'          },
  { id: 'dados-complementares',  label: 'dados complementares'  },
  { id: 'anexos',                label: 'anexos'                },
  { id: 'observacoes',           label: 'observações'           },
]

const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
             'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

// ─── Tipo de contato (multi-select simplificado) ─────────────────────────────
type TipoContato = 'Cliente' | 'Fornecedor' | 'Transportador' | 'Outro'
const TIPOS_CONTATO: TipoContato[] = ['Cliente', 'Fornecedor', 'Transportador', 'Outro']

function TipoContatoSelect({
  selecionados, onChange,
}: {
  selecionados: TipoContato[]
  onChange: (v: TipoContato[]) => void
}) {
  const [aberto, setAberto] = useState(false)
  const toggle = (t: TipoContato) => {
    onChange(selecionados.includes(t) ? selecionados.filter(x => x !== t) : [...selecionados, t])
  }
  const label = selecionados.length === 0
    ? 'Selecione'
    : `${selecionados.length} selecionada(s)`

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setAberto(o => !o)}
        className={INP + ' flex items-center justify-between text-left'}
      >
        <span className={selecionados.length === 0 ? 'text-[var(--d2b-text-muted)]' : ''}>{label}</span>
        <ChevronDown size={13} className="text-[var(--d2b-text-muted)] shrink-0" />
      </button>
      {aberto && (
        <div className="absolute z-20 top-full left-0 mt-1 w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-md shadow-lg overflow-hidden">
          {TIPOS_CONTATO.map(t => (
            <label key={t} className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-[var(--d2b-hover)] cursor-pointer">
              <input
                type="checkbox"
                checked={selecionados.includes(t)}
                onChange={() => toggle(t)}
                className="w-4 h-4 accent-[#7C4DFF] rounded"
              />
              <span className="text-sm text-[var(--d2b-text-primary)]">{t}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Seção colapsável ────────────────────────────────────────────────────────
function Divisor({ title }: { title: string }) {
  return (
    <div className="border-t border-[var(--d2b-border)] mt-6 mb-5">
      <h3 className="text-base font-semibold text-[var(--d2b-text-primary)] mt-4">{title}</h3>
    </div>
  )
}

// ─── Aba: Dados Gerais ───────────────────────────────────────────────────────
function AbaDadosGerais() {
  const [tipoPessoa,    setTipoPessoa]    = useState('Pessoa Jurídica')
  const [contribuinte,  setContribuinte]  = useState('9 - Não Contribuinte, que pode')
  const [tiposContato,  setTiposContato]  = useState<TipoContato[]>(['Cliente'])

  return (
    <div className="space-y-5">
      {/* Nome / Fantasia / Código */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className={LBL}>Nome</label>
          <input className={INP} placeholder="Nome ou Razão Social do contato" />
        </div>
        <div>
          <label className={LBL}>Fantasia</label>
          <input className={INP} placeholder="" />
        </div>
        <div>
          <label className={LBL}>Código</label>
          <input className={INP} placeholder="Opcional" />
        </div>
      </div>

      {/* Tipo pessoa / CNPJ / Contribuinte / Inscrição Estadual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className={LBL}>Tipo de pessoa</label>
          <div className="relative">
            <select className={SEL} value={tipoPessoa} onChange={e => setTipoPessoa(e.target.value)}>
              <option>Pessoa Jurídica</option>
              <option>Pessoa Física</option>
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
          </div>
        </div>
        <div>
          <label className={LBL}>{tipoPessoa === 'Pessoa Física' ? 'CPF' : 'CNPJ'}</label>
          <div className="relative">
            <input className={INP + ' pr-9'} placeholder="" />
            <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] cursor-pointer" />
          </div>
        </div>
        <div>
          <label className={LBL}>Contribuinte</label>
          <div className="relative">
            <select className={SEL} value={contribuinte} onChange={e => setContribuinte(e.target.value)}>
              <option>1 - Contribuinte ICMS</option>
              <option>2 - Contribuinte isento</option>
              <option>9 - Não Contribuinte, que pode</option>
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
          </div>
        </div>
        <div>
          <label className={LBL}>Inscrição Estadual</label>
          <input className={INP} placeholder="" />
        </div>
      </div>

      {/* Inscrição Municipal / Tipo de contato */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className={LBL}>Inscrição Municipal</label>
          <input className={INP} placeholder="" />
        </div>
        <div className="md:col-span-2">
          <label className={LBL}>Tipo de contato</label>
          <TipoContatoSelect selecionados={tiposContato} onChange={setTiposContato} />
        </div>
      </div>

      {/* ── Endereço ─────────────────────────────────────────────────── */}
      <Divisor title="Endereço" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className={LBL}>CEP</label>
          <div className="relative">
            <input className={INP + ' pr-9'} placeholder="" />
            <Search size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] cursor-pointer hover:text-[#7C4DFF]" />
          </div>
        </div>
        <div className="md:col-span-2">
          <label className={LBL}>Município</label>
          <input className={INP} placeholder="" />
        </div>
        <div>
          <label className={LBL}>UF</label>
          <div className="relative">
            <select className={SEL}>
              <option value="">Selecione</option>
              {UFS.map(u => <option key={u}>{u}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
          </div>
        </div>
      </div>
      <div>
        <label className={LBL}>Endereço</label>
        <input className={INP} placeholder="" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={LBL}>Bairro</label>
          <input className={INP} placeholder="" />
        </div>
        <div>
          <label className={LBL}>Número</label>
          <input className={INP} placeholder="" />
        </div>
        <div>
          <label className={LBL}>Complemento</label>
          <input className={INP} placeholder="" />
        </div>
      </div>
      <label className="flex items-center gap-2.5 cursor-pointer">
        <input type="checkbox" className="w-4 h-4 rounded accent-[#7C4DFF]" />
        <span className="text-sm text-[var(--d2b-text-secondary)]">
          Possui endereço de cobrança diferente do endereço principal
        </span>
      </label>

      {/* ── Contato ──────────────────────────────────────────────────── */}
      <Divisor title="Contato" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={LBL}>Telefone</label>
          <input className={INP} placeholder="" />
        </div>
        <div>
          <label className={LBL}>Telefone Adicional</label>
          <input className={INP} placeholder="" />
        </div>
        <div>
          <label className={LBL}>Celular</label>
          <input className={INP} placeholder="" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={LBL}>WebSite</label>
          <input className={INP} placeholder="" />
        </div>
        <div>
          <label className={LBL}>E-mail</label>
          <input type="email" className={INP} placeholder="" />
        </div>
        <div>
          <label className={LBL}>E-mail para envio de NFE</label>
          <input type="email" className={INP} placeholder="" />
        </div>
      </div>
      <div>
        <label className={LBL}>Observações do contato</label>
        <textarea className={INP + ' min-h-[72px] resize-y'} placeholder="" />
      </div>

      {/* ── Pessoas de Contato ────────────────────────────────────────  */}
      <Divisor title="Pessoas de Contato" />
      <div className="rounded-lg border border-[var(--d2b-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)]">
              {['Nome', 'Setor', 'Email', 'Telefone', 'Ramal'].map(h => (
                <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-3 py-3">
                <button className="flex items-center gap-1.5 text-sm text-[#7C4DFF] hover:text-[#A98EFF] transition-colors">
                  <Plus size={14} />
                  adicionar contato
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Aba: Dados Complementares ───────────────────────────────────────────────
function AbaDadosComplementares() {
  const [regimeTrib, setRegimeTrib] = useState('Não informado')
  const [statusCRM,  setStatusCRM]  = useState('Cliente')
  const [listaPrecо, setListaPreco] = useState('')

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={LBL}>Código de regime tributário</label>
          <div className="relative">
            <select className={SEL} value={regimeTrib} onChange={e => setRegimeTrib(e.target.value)}>
              <option>Não informado</option>
              <option>Simples Nacional</option>
              <option>Lucro Presumido</option>
              <option>Lucro Real</option>
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
          </div>
        </div>
        <div>
          <label className={LBL}>Inscrição Suframa</label>
          <input className={INP} placeholder="" />
        </div>
      </div>
      <div className="max-w-xs">
        <label className={LBL}>Data de nascimento</label>
        <div className="relative">
          <input type="date" className={INP + ' pr-9'} />
        </div>
      </div>
      <div>
        <label className={LBL}>Status no CRM</label>
        <div className="relative max-w-sm">
          <select className={SEL} value={statusCRM} onChange={e => setStatusCRM(e.target.value)}>
            <option>Cliente</option>
            <option>Lead</option>
            <option>Prospect</option>
            <option>Inativo</option>
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
        </div>
        <p className="text-xs text-[var(--d2b-text-muted)] mt-1">
          Estágio deste cliente na gestão do relacionamento com clientes (CRM)
        </p>
      </div>
      <div>
        <label className={LBL}>Vendedor</label>
        <input className={INP + ' max-w-sm'} placeholder="" />
        <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Vendedor padrão para este cliente</p>
      </div>
      <div>
        <label className={LBL}>Condição de pagamento</label>
        <input className={INP + ' max-w-sm'} placeholder="" />
        <p className="text-xs text-[var(--d2b-text-muted)] mt-1">
          Número de parcelas ou prazos padrão. Exemplos: 30 60, 3x ou 15 +2x
        </p>
      </div>
      <div>
        <label className={LBL}>Data de criação</label>
        <input type="date" className={INP + ' max-w-[180px]'} />
      </div>

      <div className="border-t border-[var(--d2b-border)] mt-6 mb-5">
        <h3 className="text-base font-semibold text-[var(--d2b-text-primary)] mt-4 mb-4">Lista de preço</h3>
        <div className="relative max-w-xs">
          <select className={SEL} value={listaPrecо} onChange={e => setListaPreco(e.target.value)}>
            <option value="">Selecione</option>
          </select>
          <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
        </div>
      </div>

      <div className="border-t border-[var(--d2b-border)] mt-6 mb-5">
        <h3 className="text-base font-semibold text-[var(--d2b-text-primary)] mt-4 mb-4">Financeiro</h3>
        <div className="max-w-xs">
          <label className={LBL}>Limite de crédito</label>
          <input className={INP} placeholder="" />
          <p className="text-xs text-[var(--d2b-text-muted)] mt-1">
            O limite de crédito depende de uma permissão específica.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Aba: Anexos ─────────────────────────────────────────────────────────────
function AbaAnexos() {
  return (
    <div>
      <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[#7C4DFF] text-sm font-medium text-[#7C4DFF] hover:bg-[#7C4DFF]/8 cursor-pointer transition-colors">
        <Upload size={14} />
        procurar arquivo
        <input type="file" className="hidden" />
      </label>
      <p className="text-xs text-[var(--d2b-text-muted)] mt-2">
        O tamanho do arquivo não deve ultrapassar 2Mb
      </p>
    </div>
  )
}

// ─── Aba: Observações ────────────────────────────────────────────────────────
function AbaObservacoes() {
  return (
    <div>
      <h3 className={SECTION_TITLE}>Observações</h3>
      <textarea
        className={INP + ' min-h-[160px] resize-y'}
        placeholder=""
      />
    </div>
  )
}

// ─── Props ───────────────────────────────────────────────────────────────────
interface ClienteFornecedorFormProps {
  id?: string
}

// ─── ClienteFornecedorForm ────────────────────────────────────────────────────
export function ClienteFornecedorForm({ id }: ClienteFornecedorFormProps) {
  const router  = useRouter()
  const [aba, setAba] = useState<AbaId>('dados-gerais')

  function handleVoltar() { router.push('/dashboard/cadastros') }
  function handleSalvar() { router.push('/dashboard/cadastros') }

  return (
    <div className="flex flex-col h-full">

      {/* ── Barra de topo ── */}
      <div className="flex items-center gap-3 px-8 py-4 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)]">
        <button
          onClick={handleVoltar}
          className="flex items-center gap-1.5 text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] transition-colors"
        >
          <ArrowLeft size={14} />
          voltar
        </button>
        <nav className="flex items-center gap-1 text-xs text-[var(--d2b-text-muted)]">
          <span>início</span>
          <ChevronRight size={12} />
          <span>cadastros</span>
          <ChevronRight size={12} />
          <span className="text-[var(--d2b-text-secondary)]">clientes e fornecedores</span>
        </nav>
      </div>

      {/* ── Corpo ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl px-8 py-8">

          <h1 className="text-2xl font-semibold text-[var(--d2b-text-primary)] mb-5">Contato</h1>

          {/* ── Abas ── */}
          <div className="flex items-end gap-0 border-b border-[var(--d2b-border)] mb-7">
            {ABAS.map(a => (
              <button
                key={a.id}
                onClick={() => setAba(a.id)}
                className={[
                  'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
                  aba === a.id
                    ? 'border-[#7C4DFF] text-[var(--d2b-text-primary)]'
                    : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
                ].join(' ')}
              >
                {a.label}
              </button>
            ))}
          </div>

          {/* ── Conteúdo da aba ── */}
          {aba === 'dados-gerais'         && <AbaDadosGerais />}
          {aba === 'dados-complementares' && <AbaDadosComplementares />}
          {aba === 'anexos'               && <AbaAnexos />}
          {aba === 'observacoes'          && <AbaObservacoes />}

          {/* ── Ações ── */}
          <div className="pt-6 mt-8 border-t border-[var(--d2b-border)] flex items-center gap-4">
            <button onClick={handleSalvar} className={BTN_PRIMARY}>
              salvar
            </button>
            <button
              onClick={handleVoltar}
              className="text-sm font-medium text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors"
            >
              cancelar
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
