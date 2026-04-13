'use client'

import { useState } from 'react'
import {
  Copy, QrCode, ArrowUpRight, ArrowDownLeft, Smartphone,
  MoreHorizontal, Eye, EyeOff, Plus, ChevronDown, Search,
} from 'lucide-react'

const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const BTN_GHOST  = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors'
const TH = 'text-left px-4 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wide whitespace-nowrap border-b border-[var(--d2b-border)]'
const TD = 'px-4 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'
const INP = 'w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] transition-colors'

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

type Transacao = {
  id: string
  data: string
  descricao: string
  tipo: 'entrada' | 'saida'
  valor: number
  status: 'concluido' | 'pendente' | 'cancelado'
}

const MOCK_TX: Transacao[] = [
  { id:'1', data:'08/04/2026 14:32', descricao:'Pix recebido — Jesse Santos',    tipo:'entrada', valor:850.00,  status:'concluido' },
  { id:'2', data:'08/04/2026 11:15', descricao:'Transferência enviada — Forn. A', tipo:'saida',   valor:1500.00, status:'concluido' },
  { id:'3', data:'07/04/2026 09:50', descricao:'Pix recebido — Maria Oliveira',   tipo:'entrada', valor:300.00,  status:'concluido' },
  { id:'4', data:'07/04/2026 08:00', descricao:'Pagamento conta de luz',          tipo:'saida',   valor:420.00,  status:'concluido' },
  { id:'5', data:'06/04/2026 16:45', descricao:'Pix recebido — João Alves',       tipo:'entrada', valor:1200.00, status:'concluido' },
  { id:'6', data:'06/04/2026 14:00', descricao:'Transferência pendente',          tipo:'saida',   valor:600.00,  status:'pendente'  },
]

const PIX_KEYS = [
  { tipo: 'CPF',    chave: '058.031.484-20' },
  { tipo: 'E-mail', chave: 'empresa@dev2b.com.br' },
  { tipo: 'Celular',chave: '+55 81 9 9999-0000' },
]

export function ContaDigitalContent() {
  const [saldoVisivel, setSaldoVisivel] = useState(true)
  const [search, setSearch]            = useState('')
  const [acoes, setAcoes]              = useState(false)
  const [copiado, setCopiado]          = useState<string | null>(null)

  const copiar = (v: string) => {
    setCopiado(v)
    setTimeout(() => setCopiado(null), 1500)
  }

  const tx = MOCK_TX.filter(t =>
    !search || t.descricao.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--d2b-bg-main)]">

      {/* Top bar */}
      <div className="shrink-0 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)] px-6 py-3 flex items-center justify-between gap-3">
        <span className="text-xs text-[var(--d2b-text-muted)]">
          início <span className="mx-1">≡</span> finanças <span className="mx-1">{'>'}</span>
          <span className="text-[var(--d2b-text-secondary)]">conta digital</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-2 py-1 rounded-full bg-[#7C4DFF] text-white">pix grátis</span>
          <div className="relative">
            <button onClick={() => setAcoes(p => !p)} className={BTN_OUTLINE}>
              mais ações <MoreHorizontal size={14} />
            </button>
            {acoes && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-lg shadow-lg z-20 py-1">
                {['Extrato completo','Comprovantes','Configurar conta'].map(a => (
                  <button key={a} onClick={() => setAcoes(false)}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)]">{a}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-5">

          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-5">Conta Digital</h1>

          {/* Cartão saldo */}
          <div className="mb-6 bg-gradient-to-br from-[#7C4DFF] to-[#4527A0] rounded-2xl p-6 text-white max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-widest text-purple-200 mb-1">Saldo disponível</p>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold">
                {saldoVisivel ? `R$ ${fmtBRL(12480.50)}` : 'R$ ••••••'}
              </span>
              <button onClick={() => setSaldoVisivel(p => !p)} className="text-purple-200 hover:text-white">
                {saldoVisivel ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>
            </div>
            <p className="text-xs text-purple-200">Ag. 0001 · CC 123456-7</p>
          </div>

          {/* Ações rápidas */}
          <div className="flex items-center gap-3 mb-6">
            <button className={BTN_PRIMARY + ' rounded-xl px-5 py-3 flex-col items-center gap-1.5 h-auto'}>
              <ArrowUpRight size={20} />
              <span className="text-xs">Transferir</span>
            </button>
            <button className={BTN_OUTLINE + ' rounded-xl px-5 py-3 flex-col items-center gap-1.5 h-auto border-[var(--d2b-border)]'}>
              <QrCode size={20} />
              <span className="text-xs">Pix</span>
            </button>
            <button className={BTN_OUTLINE + ' rounded-xl px-5 py-3 flex-col items-center gap-1.5 h-auto border-[var(--d2b-border)]'}>
              <ArrowDownLeft size={20} />
              <span className="text-xs">Receber</span>
            </button>
            <button className={BTN_OUTLINE + ' rounded-xl px-5 py-3 flex-col items-center gap-1.5 h-auto border-[var(--d2b-border)]'}>
              <Smartphone size={20} />
              <span className="text-xs">Recarga</span>
            </button>
          </div>

          {/* Chaves Pix */}
          <div className="mb-6 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--d2b-border)]">
              <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">Chaves Pix</p>
              <button className={BTN_GHOST + ' text-xs'}><Plus size={12}/> adicionar chave</button>
            </div>
            <div className="divide-y divide-[var(--d2b-border)]">
              {PIX_KEYS.map(k => (
                <div key={k.chave} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-xs text-[var(--d2b-text-muted)]">{k.tipo}</p>
                    <p className="text-sm font-medium text-[var(--d2b-text-primary)]">{k.chave}</p>
                  </div>
                  <button
                    onClick={() => copiar(k.chave)}
                    className="text-[var(--d2b-text-muted)] hover:text-[#7C4DFF] transition-colors"
                    title="Copiar"
                  >
                    {copiado === k.chave
                      ? <span className="text-xs text-emerald-500 font-medium">copiado!</span>
                      : <Copy size={14}/>
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Extrato */}
          <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--d2b-border)]">
              <p className="text-sm font-semibold text-[var(--d2b-text-primary)]">Últimas transações</p>
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--d2b-text-muted)]"/>
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar transação" className={INP + ' pl-8 py-1.5 w-52'} />
              </div>
            </div>
            <table className="w-full">
              <thead className="bg-[var(--d2b-bg-elevated)]">
                <tr>
                  <th className={TH}>Data / Hora</th>
                  <th className={TH}>Descrição</th>
                  <th className={TH + ' text-center'}>Status</th>
                  <th className={TH + ' text-right'}>Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--d2b-border)]">
                {tx.map(t => (
                  <tr key={t.id} className="hover:bg-[var(--d2b-hover)] transition-colors">
                    <td className={TD + ' text-[var(--d2b-text-muted)] text-xs'}>{t.data}</td>
                    <td className={TD}>{t.descricao}</td>
                    <td className={TD + ' text-center'}>
                      <span className={[
                        'text-xs font-semibold px-2 py-0.5 rounded-full',
                        t.status === 'concluido' ? 'bg-[rgba(34,197,94,0.12)] text-emerald-500' :
                        t.status === 'pendente'  ? 'bg-[rgba(234,179,8,0.12)] text-yellow-500' :
                                                   'bg-[rgba(239,68,68,0.12)] text-red-500',
                      ].join(' ')}>
                        {t.status}
                      </span>
                    </td>
                    <td className={TD + ' text-right font-semibold ' + (t.tipo === 'entrada' ? 'text-emerald-500' : 'text-red-500')}>
                      {t.tipo === 'entrada' ? '+' : '-'} R$ {fmtBRL(t.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
