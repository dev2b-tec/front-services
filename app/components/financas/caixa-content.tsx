'use client'

import { useState } from 'react'
import {
  ChevronDown, ChevronLeft, ChevronRight, Plus, Printer,
  TrendingUp, TrendingDown, Wallet, MoreHorizontal,
} from 'lucide-react'

const BTN_PRIMARY = 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'
const BTN_OUTLINE = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:border-[#7C4DFF] hover:text-[var(--d2b-text-primary)] bg-transparent transition-colors'
const BTN_GHOST  = 'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-[var(--d2b-text-secondary)] hover:bg-[var(--d2b-hover)] transition-colors'
const TH = 'text-left px-4 py-3 text-xs font-semibold text-[var(--d2b-text-secondary)] uppercase tracking-wide whitespace-nowrap border-b border-[var(--d2b-border)]'
const TD = 'px-4 py-3 text-sm text-[var(--d2b-text-primary)] whitespace-nowrap'

function fmtBRL(v: number) {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

type Movimento = {
  id: string
  data: string
  descricao: string
  tipo: 'entrada' | 'saida'
  categoria: string
  valor: number
  saldo: number
}

const MOCK_MOV: Movimento[] = [
  { id:'1', data:'08/04/2026', descricao:'Recebimento de cliente',   tipo:'entrada', categoria:'Vendas',          valor:2500.00, saldo:8320.00 },
  { id:'2', data:'08/04/2026', descricao:'Pagamento fornecedor A',   tipo:'saida',   categoria:'Fornecedores',     valor:1500.00, saldo:5820.00 },
  { id:'3', data:'07/04/2026', descricao:'Recebimento de serviço',   tipo:'entrada', categoria:'Serviços',         valor:800.00,  saldo:7320.00 },
  { id:'4', data:'07/04/2026', descricao:'Aluguel escritório',        tipo:'saida',   categoria:'Despesas Fixas',   valor:3200.00, saldo:6520.00 },
  { id:'5', data:'06/04/2026', descricao:'Venda PDV',                tipo:'entrada', categoria:'Vendas',           valor:450.00,  saldo:9720.00 },
  { id:'6', data:'06/04/2026', descricao:'Internet + Telefone',      tipo:'saida',   categoria:'Despesas Fixas',   valor:349.90,  saldo:9270.00 },
  { id:'7', data:'05/04/2026', descricao:'Nota de serviço emitida',  tipo:'entrada', categoria:'Serviços',         valor:1200.00, saldo:9619.90 },
]

const RESUMO = [
  { label: 'Saldo inicial',   valor: 6820.00,  color: 'text-[var(--d2b-text-primary)]' },
  { label: 'Total entradas',  valor: 4950.00,  color: 'text-emerald-500'               },
  { label: 'Total saídas',    valor: 5049.90,  color: 'text-red-500'                   },
  { label: 'Saldo final',     valor: 6720.10,  color: 'text-[#7C4DFF]'                 },
]

const DIAS = ['08/04','07/04','06/04','05/04','04/04']

export function CaixaContent() {
  const [diaIdx, setDiaIdx]   = useState(0)
  const [acoes, setAcoes]     = useState(false)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--d2b-bg-main)]">

      {/* Top bar */}
      <div className="shrink-0 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)] px-6 py-3 flex items-center justify-between gap-3">
        <span className="text-xs text-[var(--d2b-text-muted)]">
          início <span className="mx-1">≡</span> finanças <span className="mx-1">{'>'}</span>
          <span className="text-[var(--d2b-text-secondary)]">caixa</span>
        </span>
        <div className="flex items-center gap-2">
          <button className={BTN_GHOST}><Printer size={14} /> imprimir</button>
          <button className={BTN_OUTLINE}>
            <ChevronDown size={14} /> exportar
          </button>
          <button className={BTN_PRIMARY}>
            <Plus size={14} /> novo lançamento
          </button>
          <div className="relative">
            <button onClick={() => setAcoes(p => !p)} className={BTN_OUTLINE}>
              mais ações <MoreHorizontal size={14} />
            </button>
            {acoes && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-lg shadow-lg z-20 py-1">
                {['Abrir caixa','Fechar caixa','Sangria','Suprimento'].map(a => (
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

          {/* Cabeçalho */}
          <h1 className="text-xl font-bold text-[var(--d2b-text-primary)] mb-5">Caixa</h1>

          {/* Cards resumo */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {RESUMO.map(r => (
              <div key={r.label} className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl px-4 py-4">
                <p className="text-xs text-[var(--d2b-text-muted)] mb-1">{r.label}</p>
                <p className={`text-lg font-bold ${r.color}`}>R$ {fmtBRL(r.valor)}</p>
              </div>
            ))}
          </div>

          {/* Navegação dia */}
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setDiaIdx(p => Math.min(p + 1, DIAS.length - 1))}
              className="p-1.5 rounded-md hover:bg-[var(--d2b-hover)] text-[var(--d2b-text-secondary)]"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-[var(--d2b-text-primary)] min-w-[80px] text-center">
              {DIAS[diaIdx]}/2026
            </span>
            <button
              onClick={() => setDiaIdx(p => Math.max(p - 1, 0))}
              className="p-1.5 rounded-md hover:bg-[var(--d2b-hover)] text-[var(--d2b-text-secondary)]"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Tabela movimentos */}
          <div className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--d2b-bg-elevated)]">
                <tr>
                  <th className={TH}>Data</th>
                  <th className={TH}>Descrição</th>
                  <th className={TH}>Categoria</th>
                  <th className={TH + ' text-center'}>Tipo</th>
                  <th className={TH + ' text-right'}>Valor (R$)</th>
                  <th className={TH + ' text-right'}>Saldo (R$)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--d2b-border)]">
                {MOCK_MOV.map(m => (
                  <tr key={m.id} className="hover:bg-[var(--d2b-hover)] transition-colors">
                    <td className={TD + ' text-[var(--d2b-text-muted)]'}>{m.data}</td>
                    <td className={TD + ' font-medium'}>{m.descricao}</td>
                    <td className={TD}>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--d2b-bg-elevated)] text-[var(--d2b-text-secondary)] border border-[var(--d2b-border)]">
                        {m.categoria}
                      </span>
                    </td>
                    <td className={TD + ' text-center'}>
                      {m.tipo === 'entrada'
                        ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-500"><TrendingUp size={12}/> entrada</span>
                        : <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-500"><TrendingDown size={12}/> saída</span>
                      }
                    </td>
                    <td className={TD + ' text-right font-semibold ' + (m.tipo === 'entrada' ? 'text-emerald-500' : 'text-red-500')}>
                      {m.tipo === 'entrada' ? '+' : '-'} {fmtBRL(m.valor)}
                    </td>
                    <td className={TD + ' text-right text-[var(--d2b-text-primary)] font-medium'}>
                      {fmtBRL(m.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-[var(--d2b-bg-elevated)] border-t-2 border-[var(--d2b-border-strong)]">
                  <td colSpan={4} className="px-4 py-3 text-sm font-bold text-[var(--d2b-text-primary)]">
                    <span className="flex items-center gap-2"><Wallet size={14} /> Saldo do período</span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold text-[#7C4DFF]">
                    R$ {fmtBRL(6720.10)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
