'use client'

import { useState } from 'react'
import { Search, Filter, Printer, Plus, ArrowLeft, MoreHorizontal, Trash2, Settings } from 'lucide-react'

const TH = 'text-left px-3 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wider whitespace-nowrap'
const TD = 'px-3 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'
const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const INP = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors'
const LBL = 'block text-xs text-[var(--d2b-text-secondary)] mb-1'
const SEL = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:border-[#7C4DFF] transition-colors appearance-none'

type NfcTab = 'todas' | 'pendentes' | 'emitidas' | 'canceladas'
type Tela   = 'lista' | 'nova' | 'detalhe'

const NFC_TABS: { id: NfcTab; label: string; dot?: string }[] = [
  { id: 'todas',     label: 'todas' },
  { id: 'pendentes', label: 'pendentes', dot: '#F59E0B' },
  { id: 'emitidas',  label: 'emitidas',  dot: '#10B981' },
  { id: 'canceladas',label: 'canceladas',dot: '#9CA3AF' },
]

const MOCK_NOTAS = [
  {
    id: '000001',
    serie: '1',
    numero: '000001',
    status: 'pendente',
    destinatario: 'BS TECNOLOGIA LTDA',
    natureza: '(NFC-e) Venda de mercadorias de terceiros',
    emissao: '07/04/2026',
    total: 'R$ 15,00',
  },
]

export function NFCContent() {
  const [tela, setTela]     = useState<Tela>('lista')
  const [tab, setTab]       = useState<NfcTab>('todas')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<typeof MOCK_NOTAS[0] | null>(null)
  const [consomidorFinal, setConsumidorFinal] = useState(true)
  const [cpf, setCpf]       = useState('')
  const [formaPg, setFormaPg] = useState('Selecione')

  /* ── Detalhe / View ── */
  if (tela === 'detalhe' && selected) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setTela('lista')} className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline">
              <ArrowLeft size={14} /> voltar
            </button>
            <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas notas fiscais consumidor</span>
          </div>
          <div className="flex items-center gap-2">
            <button className={BTN_PRIMARY}><Settings size={14} /> editar</button>
            <button className={BTN_OUTLINE}><MoreHorizontal size={14} /> ações</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 max-w-3xl mx-auto w-full">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-1">Nota fiscal para Consumidor Final</h1>
          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 mb-6">
            pendente
          </span>

          <div className="border border-[var(--d2b-border)] rounded-xl p-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-[var(--d2b-border)]">
              <div><label className={LBL}>Série</label><p className="text-sm text-[var(--d2b-text-primary)]">{selected.serie}</p></div>
              <div><label className={LBL}>Número</label><p className="text-sm font-semibold text-[#7C4DFF]">{selected.numero}</p></div>
            </div>
            <div className="pb-4 border-b border-[var(--d2b-border)]">
              <label className={LBL}>Natureza da operação</label>
              <p className="text-sm text-[var(--d2b-text-primary)]">{selected.natureza}</p>
            </div>
            <div className="flex items-center gap-2 pb-4 border-b border-[var(--d2b-border)]">
              <span className="text-sm text-green-600">✓</span>
              <span className="text-sm text-[var(--d2b-text-primary)]">Consumidor final</span>
            </div>
            <div className="pb-4 border-b border-[var(--d2b-border)]">
              <label className={LBL}>Intermediador</label>
              <p className="text-sm text-[var(--d2b-text-primary)]">Sem intermediador</p>
            </div>

            {/* Itens */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Itens</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-[var(--d2b-text-secondary)] border-b border-[var(--d2b-border)]">
                    <th className="text-left py-2 font-semibold">Nº</th>
                    <th className="text-left py-2 font-semibold">Produto ou serviço</th>
                    <th className="text-left py-2 font-semibold">Código (SKU)</th>
                    <th className="text-left py-2 font-semibold">Un</th>
                    <th className="text-left py-2 font-semibold">Qtde</th>
                    <th className="text-right py-2 font-semibold">Preço un</th>
                    <th className="text-right py-2 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-[var(--d2b-text-muted)] border-b border-[var(--d2b-border)]">
                    <td colSpan={7} className="py-3 text-center text-xs">Nenhum item adicionado</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Cálculo do imposto */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Cálculo do imposto</h3>
              <div className="grid grid-cols-4 gap-3 text-sm">
                {[
                  ['Valor ICMS', 'R$ 0,00'], ['Valor IPI', 'R$ 0,00'],
                  ['Total Produtos', 'R$ 0,00'], ['Vlr aprox. imp.', 'R$ 0,00'],
                  ['Valor do Frete', 'R$ 0,00'], ['Outras Despesas', 'R$ 0,00'],
                  ['Total do FCP', 'R$ 0,00'], ['Total do FCP ST', 'R$ 0,00'],
                  ['Total FCP ST Ret anteriormente', 'R$ 0,00'], ['Total da Nota', 'R$ 0,00'],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p className={LBL}>{l}</p>
                    <p className="text-[var(--d2b-text-primary)]">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagamento */}
            <div>
              <div className="flex gap-4 border-b border-[var(--d2b-border)] mb-3">
                {['Pagamento', 'Pagamento integrado'].map(t => (
                  <button key={t} className={`pb-2 text-sm font-medium border-b-2 -mb-px transition-colors ${t === 'Pagamento' ? 'border-[#7C4DFF] text-[#7C4DFF]' : 'border-transparent text-[var(--d2b-text-muted)]'}`}>{t}</button>
                ))}
              </div>
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Pagamento</h3>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                <span className="font-semibold bg-amber-500 text-white text-xs rounded px-1.5 py-0.5 mr-2">Novidade</span>
                Agora você pode receber com <span className="text-[#7C4DFF] cursor-pointer">🔗 link de pagamento</span> pela conta digital da olist
              </div>
            </div>

            {/* Dados adicionais */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Dados adicionais</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><label className={LBL}>Depósito</label><p className="text-[var(--d2b-text-primary)]">Padrão</p></div>
                <div><label className={LBL}>Observações</label><p className="text-[var(--d2b-text-muted)]">—</p></div>
                <div className="col-span-2"><label className={LBL}>Observações do sistema</label><p className="text-[var(--d2b-text-muted)]">—</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ── Nova NFC-e ── */
  if (tela === 'nova') {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setTela('lista')} className="flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline">
              <ArrowLeft size={14} /> voltar
            </button>
            <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas notas fiscais consumidor</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 max-w-3xl mx-auto w-full">
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-6">Nota fiscal para Consumidor Final</h1>

          <div className="border border-[var(--d2b-border)] rounded-xl p-5 flex flex-col gap-5">
            {/* Header fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={LBL}>Série</label>
                <input className={INP} placeholder="1" defaultValue="1" />
              </div>
              <div>
                <label className={LBL}>Número</label>
                <input className={INP} placeholder="000001" defaultValue="000001" />
              </div>
            </div>

            <div>
              <label className={LBL}>Natureza da operação</label>
              <input className={INP} defaultValue="(NFC-e) Venda de mercadorias de terceiros para consumidor final" />
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={consomidorFinal}
                  onChange={e => setConsumidorFinal(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-[#7C4DFF] transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </label>
              <span className="text-sm text-[var(--d2b-text-primary)]">Consumidor final</span>
            </div>

            {consomidorFinal && (
              <div>
                <label className={LBL}>CPF/CNPJ <span className="text-[var(--d2b-text-muted)]">(opcional)</span></label>
                <input className={INP} value={cpf} onChange={e => setCpf(e.target.value)} placeholder="" />
              </div>
            )}

            <div>
              <label className={LBL}>Intermediador</label>
              <div className="relative">
                <select className={SEL}>
                  <option>Sem intermediador</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
              </div>
            </div>

            <div>
              <label className={LBL}>Vendedor <span className="text-[var(--d2b-text-muted)]">(opcional)</span></label>
              <input className={INP} placeholder="" />
            </div>

            {/* Itens */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Itens</h3>
              <table className="w-full text-sm border-b border-[var(--d2b-border)]">
                <thead>
                  <tr className="text-xs text-[var(--d2b-text-secondary)] border-b border-[var(--d2b-border)]">
                    <th className="text-left py-2 font-semibold">Nº</th>
                    <th className="text-left py-2 font-semibold">Produto ou serviço</th>
                    <th className="text-left py-2 font-semibold">Código (SKU)</th>
                    <th className="text-left py-2 font-semibold">Un</th>
                    <th className="text-left py-2 font-semibold">Qtde</th>
                    <th className="text-right py-2 font-semibold">Preço un</th>
                    <th className="text-right py-2 font-semibold">Total</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-3 text-[var(--d2b-text-muted)] text-xs">1</td>
                    <td className="py-3 pr-2">
                      <input className={INP + ' w-full'} placeholder="Pesquise por descrição, código (SKU) ou..." />
                    </td>
                    <td className="py-3 pr-2 w-24"><input className={INP} /></td>
                    <td className="py-3 pr-2 w-16"><input className={INP} /></td>
                    <td className="py-3 pr-2 w-16"><input className={INP} /></td>
                    <td className="py-3 pr-2 w-24"><input className={INP} /></td>
                    <td className="py-3 pr-2 w-24"><input className={INP} /></td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button className="text-xs text-[#7C4DFF] hover:underline">salvar</button>
                        <button className="text-[var(--d2b-text-muted)] hover:text-red-500"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <button className="mt-2 flex items-center gap-1 text-sm text-[#7C4DFF] hover:underline">
                <Plus size={13} /> adicionar item
              </button>
            </div>

            {/* Cálculo do imposto */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Cálculo do imposto</h3>
              <div className="grid grid-cols-4 gap-3 text-sm">
                {[
                  ['Valor ICMS', '0,00'], ['Valor IPI', '0,00'],
                  ['Total Produtos', '0,00'], ['Vlr aprox. imp.', '0,00'],
                  ['Valor do Frete', '0,00'], ['Outras Despesas', ''],
                  ['Desconto', ''], ['Total do FCP', '0,00'],
                  ['Total do FCP ST', '0,00'], ['Total FCP ST Ret anteriormente', '0,00'],
                  ['Total da Nota', '0,00'],
                ].map(([l, v]) => (
                  <div key={l}>
                    <label className={LBL}>{l}</label>
                    <input className={INP + ' bg-[var(--d2b-bg-elevated)]'} value={`R$ ${v}`} readOnly />
                  </div>
                ))}
              </div>
            </div>

            {/* Pagamento */}
            <div>
              <div className="flex gap-4 border-b border-[var(--d2b-border)] mb-3">
                {['Pagamento', 'Pagamento integrado'].map((t, i) => (
                  <button key={t} className={`pb-2 text-sm font-medium border-b-2 -mb-px transition-colors ${i === 0 ? 'border-[#7C4DFF] text-[#7C4DFF]' : 'border-transparent text-[var(--d2b-text-muted)]'}`}>{t}</button>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
                <span className="font-semibold bg-amber-500 text-white text-xs rounded px-1.5 py-0.5 mr-2">Novidade</span>
                Agora você pode receber com <span className="text-[#7C4DFF] cursor-pointer">🔗 link de pagamento</span> pela conta digital da olist
              </div>
              <div className="mt-3">
                <h4 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-2">Pagamento</h4>
                <label className={LBL}>Forma de recebimento</label>
                <div className="relative">
                  <select value={formaPg} onChange={e => setFormaPg(e.target.value)} className={SEL}>
                    <option>Selecione</option>
                    <option>Dinheiro</option>
                    <option>Cartão de crédito</option>
                    <option>Cartão de débito</option>
                    <option>Pix</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
                </div>
              </div>
            </div>

            {/* Dados adicionais */}
            <div>
              <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)] mb-3">Dados adicionais</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LBL}>Depósito</label>
                  <div className="relative">
                    <select className={SEL}><option>Padrão</option></select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]">▾</span>
                  </div>
                </div>
                <div>
                  <label className={LBL}>Observações</label>
                  <textarea className={INP + ' resize-none'} rows={3} />
                </div>
                <div className="col-span-2">
                  <label className={LBL}>Observações do sistema</label>
                  <textarea className={INP + ' resize-none bg-[var(--d2b-bg-elevated)]'} rows={2} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* footer actions */}
          <div className="flex items-center gap-3 mt-6 pb-6">
            <button className={BTN_PRIMARY}>salvar</button>
            <button onClick={() => setTela('lista')} className="text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]">cancelar</button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Lista ── */
  const rows = tab === 'pendentes' ? MOCK_NOTAS : []

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* alert bar */}
      <div className="px-6 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 shrink-0">
        Você está no ambiente para testes de notas fiscais.{' '}
        <button className="text-[#7C4DFF] font-semibold">alterar ambiente</button>{' '}
        para gerar notas com valor fiscal.
      </div>

      {/* top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] shrink-0">
        <span className="text-xs text-[var(--d2b-text-muted)]">início ≡ vendas notas fiscais consumidor</span>
        <div className="flex items-center gap-2">
          <button className={BTN_OUTLINE}><Settings size={14} /> autorizar pendentes</button>
          <button className={BTN_OUTLINE}><Printer size={14} /> imprimir DANFEs</button>
          <button onClick={() => setTela('nova')} className={BTN_PRIMARY}>
            <Plus size={14} /> incluir nota consumidor
          </button>
          <button className={BTN_OUTLINE}><MoreHorizontal size={14} /> mais ações</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-4">Notas Fiscais para Consumidor</h1>

        {/* reform notice */}
        <div className="flex items-start gap-3 p-3 mb-4 bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border)] rounded-xl">
          <span className="text-lg">🔒</span>
          <div className="flex-1 text-sm text-[var(--d2b-text-secondary)]">
            <strong className="text-[var(--d2b-text-primary)]">Atenção:</strong> empresas do regime normal devem emitir notas fiscais com os novos campos da Reforma Tributária a partir de 05/01/2026.
            Desde já você poderá configurar e testar suas emissões de notas com os novos tributos tanto em ambiente de homologação quanto de produção.
          </div>
          <button className="flex items-center gap-1.5 text-sm text-[#7C4DFF] hover:underline whitespace-nowrap">
            <Settings size={13} /> configurar novos tributos
          </button>
        </div>

        {/* filters */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisa..."
              className="w-full pl-8 pr-3 py-2 text-sm bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
            />
          </div>
          <button className={BTN_OUTLINE}><span className="text-base">📅</span> Últimos 30 dias</button>
          <button className={BTN_OUTLINE}><Filter size={13} /> filtros</button>
          <button className="text-sm text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]">limpar filtros</button>
        </div>

        {/* tabs */}
        <div className="flex gap-1 border-b border-[var(--d2b-border)] mb-4">
          {NFC_TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors -mb-px',
                tab === t.id
                  ? 'border-[#7C4DFF] text-[#7C4DFF]'
                  : 'border-transparent text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)]',
              ].join(' ')}
            >
              {t.dot && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.dot }} />}
              {t.label}
            </button>
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col md:flex-row items-center gap-8 justify-center py-12">
            <div className="w-48 h-36 bg-blue-100 rounded-xl flex items-center justify-center text-4xl">📋</div>
            <div className="max-w-xs">
              <p className="text-xs text-[var(--d2b-text-secondary)] mb-1">Primeiros passos</p>
              <h3 className="text-base font-bold text-[var(--d2b-text-primary)] mb-2">Configure a emissão de notas com facilidade usando seu Certificado Digital</h3>
              <p className="text-sm text-[var(--d2b-text-secondary)] mb-4">O Sistema ERP da Olist usa o arquivo do seu Certificado para buscar os dados e configurar, de forma rápida e automática, tudo o que você precisa para começar a emitir notas.</p>
              <button className={BTN_PRIMARY}>› configurar</button>
              <p className="mt-3 text-sm text-[#7C4DFF] cursor-pointer hover:underline">Utilizo Notas Fiscais de Serviços</p>
            </div>
          </div>
        ) : (
          <div className="border border-[var(--d2b-border)] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--d2b-bg-elevated)]">
                <tr>
                  <th className="w-8 px-3 py-3"><input type="checkbox" className="rounded" /></th>
                  <th className={TH}>Número</th>
                  <th className={TH}>Status</th>
                  <th className={TH}>Destinatário</th>
                  <th className={TH}>Emissão</th>
                  <th className={TH}>Total</th>
                  <th className="w-8 px-3 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map(n => (
                  <tr
                    key={n.id}
                    className="border-t border-[var(--d2b-border)] hover:bg-[var(--d2b-hover)] cursor-pointer transition-colors"
                    onClick={() => { setSelected(n); setTela('detalhe') }}
                  >
                    <td className="px-3 py-3"><input type="checkbox" className="rounded" onClick={e => e.stopPropagation()} /></td>
                    <td className={TD}>{n.numero}</td>
                    <td className={TD}>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 capitalize">{n.status}</span>
                    </td>
                    <td className={TD}>{n.destinatario}</td>
                    <td className={TD}>{n.emissao}</td>
                    <td className={TD}>{n.total}</td>
                    <td className="px-3 py-3">
                      <button className="text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)]"><MoreHorizontal size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
