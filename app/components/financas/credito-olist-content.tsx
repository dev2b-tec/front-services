'use client'

import { useState } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Eye, Volume2 } from 'lucide-react'

const BTN_PRIMARY = 'flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white bg-[#7C4DFF] hover:bg-[#5B21B6] transition-colors'

const FAQ_ITEMS = [
  'O que significa antecipar recebíveis?',
  'Como funciona?',
  'O que preciso para antecipar as vendas?',
  'Como faço para assinar os documentos?',
  'Como meus clientes vão pagar os boletos?',
  'Meu cliente não pagou o boleto. E agora?',
]

function Stepper() {
  return (
    <div className="shrink-0 bg-[var(--d2b-bg-elevated)] border-b border-[var(--d2b-border)] px-6 py-2 flex items-center gap-2 text-xs">
      <span className="text-[#7C4DFF] font-bold">✦ Etapa atual</span>
      <span className="text-[var(--d2b-text-secondary)]">Configure a emissão da nota fiscal</span>
      <div className="ml-auto flex items-center gap-3">
        <span className="text-[var(--d2b-text-muted)] font-semibold">1 de 4</span>
        <div className="flex gap-0.5">
          <div className="w-6 h-1.5 rounded-full bg-[#7C4DFF]" />
          <div className="w-6 h-1.5 rounded-full bg-[var(--d2b-border-strong)]" />
          <div className="w-6 h-1.5 rounded-full bg-[var(--d2b-border-strong)]" />
          <div className="w-6 h-1.5 rounded-full bg-[var(--d2b-border-strong)]" />
        </div>
        <button className="text-[#7C4DFF] hover:underline font-medium">acessar o guia</button>
      </div>
    </div>
  )
}

export function CreditoOlistContent() {
  const [email, setEmail] = useState('jessebezerra@hotmail.com.br')
  const [whatsapp, setWhatsapp] = useState('(99)99999-9999')
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[var(--d2b-bg-main)]">

      {/* Top breadcrumb */}
      <div className="shrink-0 bg-[var(--d2b-bg-surface)] border-b border-[var(--d2b-border)] px-6 py-2 flex items-center gap-1 text-xs text-[var(--d2b-text-muted)]">
        <span>início</span>
        <span className="mx-1">≡</span>
        <span>finanças</span>
        <span className="mx-1 text-[var(--d2b-text-muted)]">{'>'}</span>
        <span className="text-[var(--d2b-text-secondary)] font-medium">crédito da olist</span>
      </div>

      {/* Stepper */}
      <Stepper />

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex gap-8 px-8 py-6 max-w-6xl mx-auto w-full">

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">

            {/* Title */}
            <h1 className="text-2xl font-bold text-[var(--d2b-text-primary)] mb-1">Antecipação de recebíveis</h1>
            <p className="text-sm text-[var(--d2b-text-secondary)] mb-6 max-w-xl leading-relaxed">
              Receba agora o valor das suas vendas a prazo. Tenha dinheiro para pagar fornecedores à vista e cobrir despesas.
              Processo rápido. 100% digital e sem envio de documentos.
            </p>

            {/* Benefit cards */}
            <p className="text-base font-bold text-[var(--d2b-text-primary)] mb-4">Suas vendas viram dinheiro em minutos</p>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: '⚡', title: 'Antecipe agora e receba no mesmo dia' },
                { icon: '🧾', title: 'Vendas no boleto ou cartão de crédito' },
                { icon: '✅', title: 'Sem burocracia e 100% digital' },
              ].map((c) => (
                <div key={c.title} className="flex flex-col items-center text-center gap-2 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl p-4">
                  <span className="text-2xl">{c.icon}</span>
                  <p className="text-xs font-medium text-[var(--d2b-text-primary)] leading-snug">{c.title}</p>
                </div>
              ))}
            </div>

            {/* Video / promo banner */}
            <div className="relative bg-[#e8e8f0] rounded-2xl flex items-center justify-center mb-6 h-56 overflow-hidden">
              {/* Slider arrows */}
              <button className="absolute left-4 bg-white/70 rounded-full p-1.5 hover:bg-white transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="absolute right-20 bg-white/70 rounded-full p-1.5 hover:bg-white transition-colors">
                <ChevronRight size={16} />
              </button>

              {/* Center text */}
              <div className="flex items-center gap-3 text-2xl font-bold text-[var(--d2b-text-primary)]">
                <span>🔔</span>
                <span>Você tem</span>
                <span className="bg-emerald-500 text-white px-3 py-1 rounded-full">ofertas</span>
                <span>pré-aprovadas</span>
              </div>

              {/* Bottom controls */}
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button className="flex items-center gap-1.5 bg-white/70 hover:bg-white border border-[var(--d2b-border)] rounded-full px-3 py-1.5 text-xs font-medium text-[var(--d2b-text-secondary)] transition-colors">
                  Mais vídeos
                </button>
                <button className="flex items-center gap-1.5 bg-[#333] text-white rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:bg-black">
                  <Volume2 size={12} /> ativar som
                </button>
              </div>

              {/* Prev/next dots bottom-left */}
              <div className="absolute bottom-4 left-4 flex items-center gap-1.5">
                <button className="bg-white/60 hover:bg-white rounded-full p-1.5 text-[var(--d2b-text-muted)]">
                  <ChevronLeft size={14} />
                </button>
                <button className="bg-white/60 hover:bg-white rounded-full p-1.5 text-[var(--d2b-text-muted)]">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Antecipação não é empréstimo */}
            <p className="text-xs font-semibold text-[var(--d2b-text-muted)] uppercase tracking-wide mb-1">Sem letras miúdas</p>
            <h2 className="text-lg font-bold text-[var(--d2b-text-primary)] mb-2">Antecipação não é um empréstimo</h2>
            <p className="text-sm text-[var(--d2b-text-secondary)] mb-4 max-w-xl leading-relaxed">
              Adiante um dinheiro que já é seu, de vendas que sua empresa já realizou via boleto ou cartão de crédito.
              Você não cria novas dívidas e foge das burocracias e taxas de um empréstimo tradicional, como IOF.
            </p>
            <div className="bg-[#e8e8f0] rounded-2xl h-48 mb-8 flex items-center justify-center">
              <span className="text-4xl">💰</span>
            </div>

            {/* Como funciona */}
            <p className="text-xs font-semibold text-[var(--d2b-text-muted)] uppercase tracking-wide mb-1">Como funciona</p>
            <h2 className="text-lg font-bold text-[var(--d2b-text-primary)] mb-4">Receba seu dinheiro em 3 passos</h2>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { num: '01', title: 'Escolha o valor', desc: 'Digite o valor que seu negócio precisa para iniciar a simulação. Quer um valor ainda maior? Adicione mais parcelas manualmente.' },
                { num: '02', title: 'Simule as condições', desc: 'Confira o valor líquido a receber e todos os custos da operação de forma 100% transparente antes de confirmar.' },
                { num: '03', title: 'Finalize e receba', desc: 'Após assinar os documentos online, o dinheiro é transferido para sua conta no mesmo dia útil.' },
              ].map((s) => (
                <div key={s.num} className="bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl overflow-hidden">
                  <div className="bg-[#e8e8f0] h-28 flex items-center justify-center">
                    <span className="text-3xl font-black text-[var(--d2b-text-muted)] opacity-30">{s.num}</span>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-[var(--d2b-text-primary)] mb-1">{s.title}</p>
                    <p className="text-xs text-[var(--d2b-text-muted)] leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Crédito da Olist */}
            <p className="text-xs font-semibold text-[var(--d2b-text-muted)] uppercase tracking-wide mb-1">Crédito da Olist</p>
            <h2 className="text-lg font-bold text-[var(--d2b-text-primary)] mb-2">Você recebe o seu dinheiro e a gente cuida do resto</h2>
            <p className="text-sm text-[var(--d2b-text-secondary)] mb-8 max-w-xl leading-relaxed">
              O Crédito da Olist é a solução que torna a antecipação de recebíveis rápida, 100% digital, sem IOF.
              Após você receber o dinheiro, nós assumimos a operação: entramos em contato com os seus clientes para
              enviar os novos boletos e cuidamos da gestão da cobrança em caso de não pagamento.
            </p>

            {/* FAQ */}
            <p className="text-xs font-semibold text-[var(--d2b-text-muted)] uppercase tracking-wide mb-1">Perguntas frequentes</p>
            <h2 className="text-lg font-bold text-[var(--d2b-text-primary)] mb-4">Respostas rápidas para suas dúvidas</h2>
            <div className="border border-[var(--d2b-border)] rounded-xl overflow-hidden mb-10">
              {FAQ_ITEMS.map((q, i) => (
                <div key={i} className="border-b last:border-b-0 border-[var(--d2b-border)]">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    {q}
                    <ChevronDown size={16} className={`shrink-0 text-[var(--d2b-text-muted)] transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4 text-sm text-[var(--d2b-text-secondary)] leading-relaxed">
                      Para mais informações, acesse a central de ajuda do ERP.
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

          {/* ── Sidebar ── */}
          <div className="w-72 shrink-0">
            <div className="sticky top-0 bg-[var(--d2b-bg-surface)] border border-[var(--d2b-border)] rounded-xl p-5">
              <h3 className="text-base font-bold text-[var(--d2b-text-primary)] mb-2 leading-snug">
                Qual tal estar entre os primeiros a antecipar recebíveis?
              </h3>
              <p className="text-xs text-[var(--d2b-text-muted)] mb-4 leading-relaxed">
                lançamento em primeira mão, informe seu melhor e-mail e WhatsApp.
              </p>

              <div className="mb-3">
                <label className="block text-xs font-medium text-[var(--d2b-text-secondary)] mb-1">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#7C4DFF]/40"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-[var(--d2b-text-secondary)] mb-1">Whatsapp</label>
                <input
                  type="tel"
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  className="w-full bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)] rounded-md px-3 py-2 text-sm text-[var(--d2b-text-primary)] focus:outline-none focus:ring-2 focus:ring-[#7C4DFF]/40"
                />
              </div>

              <button className={BTN_PRIMARY + ' w-full mb-3'}>
                registrar interesse
              </button>

              <button className="w-full text-xs text-[#7C4DFF] hover:underline text-center">
                Saiba como funciona a antecipação de recebíveis
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
