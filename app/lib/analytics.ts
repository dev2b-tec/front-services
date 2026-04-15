/**
 * analytics.ts — Utilitários de rastreamento Google Analytics (GA4)
 *
 * ─── PARA A EQUIPE DE NEGÓCIOS ────────────────────────────────────────────────
 *
 * Este arquivo centraliza TODOS os eventos que enviamos ao Google Analytics.
 * Para adicionar um novo evento:
 *   1. Crie uma função aqui seguindo o padrão das existentes
 *   2. Chame a função no componente onde o evento acontece
 *   3. O dado aparece automaticamente no painel GA4 em "Eventos"
 *
 * Onde visualizar:
 *   → analytics.google.com  →  Relatórios  →  Engajamento  →  Eventos
 *
 * Convenção de nomes:
 *   - snake_case para nomes de eventos  (ex: "agenda_criada")
 *   - Parâmetros descritivos em português
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { sendGAEvent as _sendGAEvent } from '@next/third-parties/google'

// ── Helper interno ────────────────────────────────────────────────────────────
function track(evento: string, parametros?: Record<string, string | number | boolean>) {
  try {
    _sendGAEvent('event', evento, parametros ?? {})
  } catch {
    // GA não carregado (adblocker, SSR) — falha silenciosa
  }
}

// ── Navegação / Sessão ────────────────────────────────────────────────────────

/** Usuário fez login com sucesso */
export function trackLogin(metodo = 'keycloak') {
  track('login', { method: metodo })
}

/** Usuário fez logout */
export function trackLogout() {
  track('logout')
}

// ── Agendamentos ──────────────────────────────────────────────────────────────

/** Novo agendamento criado */
export function trackAgendamentoCriado(empresaId: string) {
  track('agendamento_criado', { empresa_id: empresaId })
}

/** Agendamento cancelado */
export function trackAgendamentoCancelado(motivo?: string) {
  track('agendamento_cancelado', { motivo: motivo ?? 'nao_informado' })
}

// ── Clientes ──────────────────────────────────────────────────────────────────

/** Novo cliente cadastrado */
export function trackClienteCadastrado(empresaId: string) {
  track('cliente_cadastrado', { empresa_id: empresaId })
}

/** Perfil de cliente visualizado */
export function trackClienteVisualizado() {
  track('cliente_visualizado')
}

// ── Comunicação / Mensagens ───────────────────────────────────────────────────

/** Disparo automático de mensagens ativado */
export function trackDisparoAtivado() {
  track('disparo_automatico_ativado')
}

/** Mensagem disparada manualmente */
export function trackMensagemDisparada(tipo: string) {
  track('mensagem_disparada', { tipo })
}

// ── Financeiro ────────────────────────────────────────────────────────────────

/** Movimento financeiro registrado */
export function trackMovimentoFinanceiro(tipo: 'receita' | 'despesa', valor: number) {
  track('movimento_financeiro', { tipo, valor })
}

// ── Assinatura / Plano ────────────────────────────────────────────────────────

/** Usuário clicou em "Assine um plano" */
export function trackCliqueAssinarPlano() {
  track('clique_assinar_plano')
}

/** Assinatura concluída */
export function trackAssinaturaConcluida(plano: string) {
  track('assinatura_concluida', { plano })
}

// ── IA ────────────────────────────────────────────────────────────────────────

/** Resumo IA gerado para paciente */
export function trackResumoIAGerado() {
  track('resumo_ia_gerado')
}

// ── Notas Compartilhadas ──────────────────────────────────────────────────────

/** Nova nota compartilhada criada */
export function trackNotaCriada() {
  track('nota_compartilhada_criada')
}
