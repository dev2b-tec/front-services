'use client'

import { useState } from 'react'
import {
  Search, Calendar, Plus, MoreHorizontal,
  ArrowUpDown, ChevronDown, Pencil, SlidersHorizontal,
} from 'lucide-react'

// ─── Shared styles ──────────────────────────────────────────────────────────
const INP =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors'

const INP_RO =
  'w-full bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-secondary)] outline-none'

const SEL =
  'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md ' +
  'px-3 py-2 text-sm text-[var(--d2b-text-primary)] ' +
  'focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'

const LBL = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'
const SEC = 'text-base font-semibold text-[var(--d2b-text-primary)] mb-4 mt-6 pb-2 border-b border-[var(--d2b-border)]'

const BTN_PRIMARY =
  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

const BTN_OUTLINE =
  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] ' +
  'text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'

const CHIP =
  'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs border border-[var(--d2b-border-strong)] ' +
  'text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] cursor-pointer transition-colors'

// ─── Types ──────────────────────────────────────────────────────────────────
type Tela = 'lista' | 'novo' | 'ver'

type ServicoTomado = {
  id: string
  numero: string
  dataEmissao: string
  situacao: string
  remetente: string
  valorTotal: number
  valorLiquido: number
}

// ─── Mock ────────────────────────────────────────────────────────────────────
const MOCK: ServicoTomado[] = [
  {
    id: '1', numero: '0001201', dataEmissao: '07/04/2026', situacao: 'REGULAR',
    remetente: 'JESSE', valorTotal: 1500, valorLiquido: 1500,
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// LISTA
// ═══════════════════════════════════════════════════════════════════════════
function ServicosTomadosLista({
  onNovo, onVer,
}: { onNovo: () => void; onVer: (id: string) => void }) {
  const [busca, setBusca] = useState('')

  const filtrados = MOCK.filter(s =>
    !busca || s.numero.includes(busca) || s.remetente.toLowerCase().includes(busca.toLowerCase())
  )

  const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'

  return (
    <div className="flex flex-col h-full">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-8 pt-8 pb-4 flex-wrap gap-3">
        <h2 className="text-xl font-semibold text-[var(--d2b-text-primary)]">Serviços Tomados</h2>
        <button onClick={onNovo} className={BTN_PRIMARY}>
          <Plus size={14} />
          incluir nota
        </button>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-2 px-8 pb-4 flex-wrap">
        <div className="flex items-center gap-2 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-lg px-3 h-9 w-80">
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Pesquise pelo número da nota ou remetente"
            className="bg-transparent text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] outline-none flex-1"
          />
          <Search size={13} className="text-[var(--d2b-text-muted)] shrink-0" />
        </div>
        <button className={CHIP}><SlidersHorizontal size={12} /></button>
        <button className={CHIP}><Calendar size={12} />por periodo</button>
        <button className={CHIP}>por situação</button>
        <button className={CHIP}><ArrowUpDown size={12} />data de emissão</button>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-x-auto px-8">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--d2b-border)]">
              <th className="px-3 py-3 w-8">
                <input type="checkbox" className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" />
              </th>
              <th className="w-6 px-1 py-3" />
              <th className={TH}>Número <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Data de Emissão <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Situação <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Remetente <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH + ' text-right'}>Valor Total <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH + ' text-right'}>Valor Líquido <ArrowUpDown size={10} className="inline mb-0.5 text-[var(--d2b-text-muted)]" /></th>
              <th className={TH}>Marcadores</th>
              <th className={TH}>Integrações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-3 py-14 text-center text-sm text-[var(--d2b-text-muted)]">
                  Nenhum serviço encontrado.
                </td>
              </tr>
            ) : filtrados.map(s => (
              <tr key={s.id} className="border-b border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] transition-colors group">
                <td className="px-3 py-3">
                  <input type="checkbox" className="w-4 h-4 rounded accent-[#7C4DFF] cursor-pointer" />
                </td>
                <td className="px-1 py-3">
                  <span className="text-xs text-[var(--d2b-text-muted)] opacity-0 group-hover:opacity-100 cursor-pointer select-none">···</span>
                </td>
                <td className="px-3 py-3">
                  <span
                    className="font-medium text-[var(--d2b-text-primary)] hover:text-[#7C4DFF] cursor-pointer transition-colors"
                    onClick={() => onVer(s.id)}
                  >
                    {s.numero}
                  </span>
                </td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{s.dataEmissao}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{s.situacao}</td>
                <td className="px-3 py-3 text-[var(--d2b-text-secondary)]">{s.remetente}</td>
                <td className="px-3 py-3 text-right text-[var(--d2b-text-primary)]">
                  {s.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-3 text-right text-[var(--d2b-text-primary)]">
                  {s.valorLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-3" />
                <td className="px-3 py-3" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// FORMULÁRIO (novo / editar)
// ═══════════════════════════════════════════════════════════════════════════
function ServicosTomadosForm({ onBack }: { onBack: () => void }) {
  const [condPgto,   setCondPgto]   = useState('')
  const [categoria,  setCategoria]  = useState('')
  const [descricao,  setDescricao]  = useState('')
  const [valor,      setValor]      = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [marcadores, setMarcadores] = useState('')

  // Impostos retidos
  const [baseIR,   setBaseIR]   = useState(''); const [aliqIR,   setAliqIR]   = useState('')
  const [baseINSS, setBaseINSS] = useState(''); const [aliqINSS, setAliqINSS] = useState('')
  const [baseISS,  setBaseISS]  = useState(''); const [aliqISS,  setAliqISS]  = useState('')
  const [aliqPIS,  setAliqPIS]  = useState(''); const [aliqCOF,  setAliqCOF]  = useState('')
  const [aliqCSLL, setAliqCSLL] = useState('')

  const calc = (base: string, aliq: string) => {
    const b = parseFloat(base) || 0
    const a = parseFloat(aliq) || 0
    return b && a ? `R$ ${((b * a) / 100).toFixed(2)}` : 'R$'
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="max-w-4xl px-8 pt-8 pb-8">
        <h1 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-6">Serviço Tomado</h1>

        {/* Cabeçalho do documento */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="md:col-span-2">
            <label className={LBL}>Número do documento</label>
            <input className={INP} placeholder="0001201" />
          </div>
          <div>
            <label className={LBL}>Série</label>
            <input className={INP} defaultValue="1" />
          </div>
          <div>
            <label className={LBL}>Situação</label>
            <div className="relative">
              <select className={SEL}><option>Regular</option><option>Cancelada</option><option>Denegada</option></select>
              <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
            </div>
          </div>
          <div>
            <label className={LBL}>Data de emissão</label>
            <div className="relative">
              <input type="text" className={INP + ' pr-9'} defaultValue="07/04/2026" />
              <Calendar size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={LBL}>Data de execução/entrada</label>
            <div className="relative">
              <input type="text" className={INP + ' pr-9'} defaultValue="07/04/2026" />
              <Calendar size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
            </div>
          </div>
        </div>

        {/* Remetente */}
        <h2 className={SEC}>Remetente</h2>
        <div className="space-y-3">
          <div>
            <label className={LBL}>Nome</label>
            <input className={INP} placeholder="" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={LBL}>Tipo de pessoa</label>
              <div className="relative">
                <select className={SEL}><option>Física</option><option>Jurídica</option></select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={LBL}>Contribuinte</label>
              <div className="relative">
                <select className={SEL}><option>0 - Não informado</option><option>1 - Contribuinte</option><option>2 - Não contribuinte</option></select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={LBL}>CPF</label>
              <input className={INP} placeholder="" />
            </div>
            <div>
              <label className={LBL}>Inc. Estadual</label>
              <input className={INP} placeholder="" />
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={LBL}>CEP</label>
              <div className="relative">
                <input className={INP + ' pr-8'} placeholder="" />
                <Search size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className={LBL}>Município</label>
              <input className={INP} placeholder="" />
            </div>
            <div>
              <label className={LBL}>UF</label>
              <div className="relative">
                <select className={SEL}><option>PE</option><option>SP</option><option>RJ</option></select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
          </div>
          <div>
            <label className={LBL}>Endereço</label>
            <input className={INP} placeholder="" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={LBL}>Bairro</label><input className={INP} /></div>
            <div><label className={LBL}>Número</label><input className={INP} /></div>
            <div><label className={LBL}>Complemento</label><input className={INP} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className={LBL}>Fone</label><input className={INP} /></div>
            <div><label className={LBL}>Email</label><input type="email" className={INP} /></div>
            <div><label className={LBL}>Inc. Municipal</label><input className={INP} /></div>
          </div>
        </div>

        {/* Serviços */}
        <h2 className={SEC}>Serviços</h2>
        <div className="space-y-3">
          <div>
            <label className={LBL}>Descrição</label>
            <textarea
              className={INP + ' min-h-[80px] resize-y'}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={LBL}>Valor</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span>
                <input
                  className={INP + ' pl-8'}
                  value={valor}
                  onChange={e => setValor(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className={LBL}>Natureza da base de cálculo do crédito</label>
              <div className="relative">
                <select className={SEL}>
                  <option>03 - Aquisição de serviços utilizados como insumo</option>
                  <option>01 - Aquisição de bens para revenda</option>
                  <option>02 - Aquisição de bens utilizados como insumo</option>
                </select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={LBL}>Origem do crédito</label>
              <div className="relative">
                <select className={SEL}><option value="">Selecione</option></select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Impostos Retidos */}
        <h2 className={SEC}>Impostos Retidos</h2>
        <div className="space-y-3">
          {/* IR */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LBL}>Base IR</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span><input className={INP + ' pl-8'} value={baseIR} onChange={e => setBaseIR(e.target.value)} /></div>
            </div>
            <div>
              <label className={LBL}>Alíquota IR</label>
              <div className="relative"><input className={INP + ' pr-7'} value={aliqIR} onChange={e => setAliqIR(e.target.value)} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">%</span></div>
            </div>
            <div>
              <label className={LBL}>Valor IR</label>
              <input className={INP_RO} readOnly value={calc(baseIR, aliqIR)} />
            </div>
          </div>
          {/* INSS */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LBL}>Base INSS</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span><input className={INP + ' pl-8'} value={baseINSS} onChange={e => setBaseINSS(e.target.value)} /></div>
            </div>
            <div>
              <label className={LBL}>Alíquota INSS</label>
              <div className="relative"><input className={INP + ' pr-7'} value={aliqINSS} onChange={e => setAliqINSS(e.target.value)} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">%</span></div>
            </div>
            <div>
              <label className={LBL}>Valor INSS</label>
              <input className={INP_RO} readOnly value={calc(baseINSS, aliqINSS)} />
            </div>
          </div>
          {/* ISS */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LBL}>Base ISS</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span><input className={INP + ' pl-8'} value={baseISS} onChange={e => setBaseISS(e.target.value)} /></div>
            </div>
            <div>
              <label className={LBL}>Alíquota ISS</label>
              <div className="relative"><input className={INP + ' pr-7'} value={aliqISS} onChange={e => setAliqISS(e.target.value)} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">%</span></div>
            </div>
            <div>
              <label className={LBL}>Valor ISS</label>
              <input className={INP_RO} readOnly value={calc(baseISS, aliqISS)} />
            </div>
          </div>
          {/* PIS / COFINS / CSLL */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <div>
              <label className={LBL}>Alíquota PIS</label>
              <div className="relative"><input className={INP + ' pr-7'} value={aliqPIS} onChange={e => setAliqPIS(e.target.value)} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">%</span></div>
            </div>
            <div>
              <label className={LBL}>Valor PIS</label>
              <input className={INP_RO} readOnly value="R$" />
            </div>
            <div>
              <label className={LBL}>Alíquota COFINS</label>
              <div className="relative"><input className={INP + ' pr-7'} value={aliqCOF} onChange={e => setAliqCOF(e.target.value)} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">%</span></div>
            </div>
            <div>
              <label className={LBL}>Valor COFINS</label>
              <input className={INP_RO} readOnly value="R$" />
            </div>
            <div>
              <label className={LBL}>Alíquota CSLL</label>
              <div className="relative"><input className={INP + ' pr-7'} value={aliqCSLL} onChange={e => setAliqCSLL(e.target.value)} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">%</span></div>
            </div>
            <div>
              <label className={LBL}>Valor CSLL</label>
              <input className={INP_RO} readOnly value="R$" />
            </div>
          </div>
        </div>

        {/* Impostos Creditados */}
        <h2 className={SEC}>Impostos Creditados</h2>
        <div className="space-y-3">
          {/* PIS/Pasep */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={LBL}>CST PIS/Pasep</label>
              <div className="relative">
                <select className={SEL}><option value="">Selecione</option></select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={LBL}>Base de cálculo PIS/Pasep</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span><input className={INP + ' pl-8'} /></div>
            </div>
            <div>
              <label className={LBL}>Alíquota PIS</label>
              <div className="relative"><input className={INP + ' pr-7'} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">%</span></div>
            </div>
            <div>
              <label className={LBL}>Valor PIS</label>
              <input className={INP_RO} readOnly value="R$" />
            </div>
          </div>
          {/* COFINS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className={LBL}>CST COFINS</label>
              <div className="relative">
                <select className={SEL}><option value="">Selecione</option></select>
                <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
              </div>
            </div>
            <div>
              <label className={LBL}>Base de cálculo COFINS</label>
              <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span><input className={INP + ' pl-8'} /></div>
            </div>
            <div>
              <label className={LBL}>Alíquota COFINS</label>
              <div className="relative"><input className={INP + ' pr-7'} /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">%</span></div>
            </div>
            <div>
              <label className={LBL}>Valor COFINS</label>
              <input className={INP_RO} readOnly value="R$" />
            </div>
          </div>
        </div>

        {/* Totais */}
        <h2 className={SEC}>Totais</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={LBL}>Valor total</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span><input className={INP_RO + ' pl-8'} readOnly value={valor ? `${parseFloat(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''} /></div>
          </div>
          <div>
            <label className={LBL}>Valor líquido</label>
            <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[var(--d2b-text-muted)]">R$</span><input className={INP_RO + ' pl-8'} readOnly value={valor ? `${parseFloat(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''} /></div>
          </div>
        </div>

        {/* Pagamento */}
        <h2 className={SEC}>Pagamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={LBL}>Condição de pagamento</label>
            <div className="flex items-center gap-2">
              <input
                className={INP + ' flex-1'}
                value={condPgto}
                onChange={e => setCondPgto(e.target.value)}
              />
              <button className={BTN_OUTLINE + ' shrink-0 text-xs'}>gerar parcelas</button>
            </div>
            <p className="text-xs text-[var(--d2b-text-muted)] mt-1">
              Número de parcelas ou prazos. Exemplos: 30 60, 3x ou 15 +2x
            </p>
          </div>
          <div>
            <label className={LBL}>Categoria</label>
            <div className="relative">
              <select className={SEL} value={categoria} onChange={e => setCategoria(e.target.value)}>
                <option value="">Selecione</option>
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)] pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Dados adicionais */}
        <h2 className={SEC}>Dados adicionais</h2>
        <div className="space-y-3">
          <div>
            <label className={LBL}>Observações</label>
            <textarea
              className={INP + ' min-h-[80px] resize-y'}
              value={observacoes}
              onChange={e => setObservacoes(e.target.value)}
            />
          </div>
          <div>
            <label className={LBL}>Marcadores</label>
            <input
              className={INP}
              value={marcadores}
              onChange={e => setMarcadores(e.target.value)}
            />
            <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Separados por vírgula ou tab</p>
          </div>
        </div>

        {/* Ações */}
        <div className="mt-8 flex items-center gap-4 pb-8">
          <button onClick={onBack} className={BTN_PRIMARY}>salvar</button>
          <button onClick={onBack} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] transition-colors">cancelar</button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// DETALHE (somente leitura)
// ═══════════════════════════════════════════════════════════════════════════
const MOCK_DETALHE = {
  numero: '0001201', serie: '1', situacao: 'Regular',
  dataEmissao: '07/04/2026', dataExecucao: '07/04/2026',
  nome: 'JESSE', tipoPessoa: 'Física', contribuinte: '0 – Não informado',
  cpf: '058.031.464-20', cep: '54.410-390', municipio: 'Jaboatão dos Guararapes',
  uf: 'PE', endereco: 'Rua José Braz Moscow', bairro: 'Piedade', numCasa: '62',
  complemento: '', fone: '', email: '', incMunicipal: '',
  descricao: 'Teste', valor: 1500,
  natureza: '03 - Aquisição de serviços utilizados como insumo',
}

function ServicosTomadosDetalhe({
  onBack, onEditar,
}: { onBack: () => void; onEditar: () => void }) {
  const d = MOCK_DETALHE
  const total = d.valor

  const LBL_V = 'text-xs text-[var(--d2b-text-muted)] mb-0.5'
  const VAL   = 'text-sm text-[var(--d2b-text-primary)]'
  const SEC_V = 'text-base font-semibold text-[var(--d2b-text-primary)] mb-3 mt-5 pb-2 border-b border-[var(--d2b-border)]'

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className={LBL_V}>{label}</p>
      <p className={VAL}>{value || '—'}</p>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)]">
        <button onClick={onBack} className="text-xs text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">
          ← voltar
        </button>
        <div className="flex items-center gap-2">
          <button onClick={onEditar} className={BTN_PRIMARY}>
            <Pencil size={13} />
            editar
          </button>
          <button className={BTN_OUTLINE}>
            ações <MoreHorizontal size={13} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-8 pb-8 max-w-4xl">
        <h1 className="text-xl font-semibold text-[var(--d2b-text-primary)] mb-5">Serviço Tomado</h1>

        {/* Cabeçalho readonly */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 border-b border-[var(--d2b-border)] pb-5">
          <div className="md:col-span-2"><Row label="Número do documento" value={d.numero} /></div>
          <Row label="Série" value={d.serie} />
          <Row label="Situação" value={d.situacao} />
          <Row label="Data de emissão" value={d.dataEmissao} />
          <div className="md:col-span-2"><Row label="Data de execução/entrada" value={d.dataExecucao} /></div>
        </div>

        {/* Remetente */}
        <h2 className={SEC_V}>Remetente</h2>
        <div className="space-y-4 border-b border-[var(--d2b-border)] pb-5">
          <Row label="Nome" value={d.nome} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Row label="Tipo de pessoa" value={d.tipoPessoa} />
            <Row label="Contribuinte" value={d.contribuinte} />
            <Row label="CPF" value={d.cpf} />
            <Row label="Inc. Estadual" value="" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Row label="CEP" value={d.cep} />
            <div className="md:col-span-2"><Row label="Município" value={d.municipio} /></div>
            <Row label="UF" value={d.uf} />
          </div>
          <Row label="Endereço" value={d.endereco} />
          <div className="grid grid-cols-3 gap-4">
            <Row label="Bairro" value={d.bairro} />
            <Row label="Número" value={d.numCasa} />            <Row label="Complemento" value={d.complemento} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Row label="Fone" value={d.fone} />
            <Row label="Email" value={d.email} />
            <Row label="Inc. Municipal" value={d.incMunicipal} />
          </div>
        </div>

        {/* Serviços */}
        <h2 className={SEC_V}>Serviços</h2>
        <div className="space-y-4 border-b border-[var(--d2b-border)] pb-5">
          <Row label="Descrição" value={d.descricao} />
          <div className="grid grid-cols-2 gap-4">
            <Row label="Valor" value={d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} />
            <Row label="Natureza da base de cálculo do crédito" value={d.natureza} />
          </div>
        </div>

        {/* Totais */}
        <h2 className={SEC_V}>Totais</h2>
        <div className="grid grid-cols-2 gap-4">
          <Row label="Valor total" value={total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} />
          <Row label="Valor líquido" value={total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} />
        </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════════════
export function ServicosTomadosContent() {
  const [tela, setTela]       = useState<Tela>('lista')
  const [itemId, setItemId]   = useState<string | null>(null)

  if (tela === 'novo') {
    return <ServicosTomadosForm onBack={() => setTela('lista')} />
  }

  if (tela === 'ver' && itemId) {
    return (
      <ServicosTomadosDetalhe
        onBack={() => { setItemId(null); setTela('lista') }}
        onEditar={() => setTela('novo')}
      />
    )
  }

  return (
    <ServicosTomadosLista
      onNovo={() => setTela('novo')}
      onVer={id => { setItemId(id); setTela('ver') }}
    />
  )
}
