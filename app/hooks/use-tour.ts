'use client'

import { usePathname } from 'next/navigation'
import { useCallback } from 'react'

// ── Button presets ────────────────────────────────────────────────────────────
/* eslint-disable @typescript-eslint/no-explicit-any */
const BTN_BACK = { text: '← Anterior', action(this: any) { this.back() }, classes: 'shepherd-button-secondary' }
const BTN_NEXT = { text: 'Próximo →',  action(this: any) { this.next() } }
const BTN_DONE = { text: 'Concluir ✓', action(this: any) { this.complete() } }
const BTN_EXIT = { text: 'Sair',       action(this: any) { this.cancel() }, classes: 'shepherd-button-secondary' }
/* eslint-enable @typescript-eslint/no-explicit-any */

// ── Tour: Geral ───────────────────────────────────────────────────────────────
function stepsGeral() {
  return [
    {
      id: 'g-welcome',
      title: '👋 Bem-vindo ao DEV2B Agenda!',
      text: 'Vamos fazer um tour rápido pelas funcionalidades principais do sistema.',
      buttons: [BTN_EXIT, { ...BTN_NEXT, text: 'Começar →' }],
    },
    {
      id: 'g-sidebar',
      title: '📋 Menu de Navegação',
      text: 'No menu lateral você tem acesso a todas as áreas: Dashboard, Clientes, Agenda, Financeiro, Avisos e muito mais.',
      attachTo: { element: '[data-tour="d2b-sidebar-nav"]', on: 'right' },
      buttons: [BTN_BACK, BTN_NEXT],
    },
    {
      id: 'g-topbar',
      title: '🔝 Barra Superior',
      text: 'Na barra superior você alterna entre tema claro/escuro, acessa seus links de auto-agendamento e gerencia sua conta.',
      attachTo: { element: '[data-tour="d2b-topbar"]', on: 'bottom' },
      buttons: [BTN_BACK, BTN_NEXT],
    },
    {
      id: 'g-assinar',
      title: '💎 Plano DEV2B',
      text: 'Aqui você pode assinar um plano e desbloquear todos os recursos avançados da plataforma.',
      attachTo: { element: '[data-tour="d2b-btn-assinar"]', on: 'bottom' },
      buttons: [BTN_BACK, BTN_DONE],
    },
  ]
}

// ── Tour: Clientes ────────────────────────────────────────────────────────────
function stepsClientes() {
  return [
    {
      id: 'c-intro',
      title: '👥 Área de Clientes',
      text: 'Aqui você visualiza e gerencia todos os clientes da sua clínica em um só lugar.',
      buttons: [BTN_EXIT, { ...BTN_NEXT, text: 'Começar →' }],
    },
    {
      id: 'c-busca',
      title: '🔍 Pesquisa',
      text: 'Pesquise clientes pelo nome em tempo real. Você também pode filtrar por status de pagamento e profissional responsável.',
      attachTo: { element: '[data-tour="d2b-clientes-busca"]', on: 'bottom' },
      buttons: [BTN_BACK, BTN_NEXT],
    },
    {
      id: 'c-novo',
      title: '➕ Novo Cliente',
      text: 'Clique aqui para cadastrar um novo cliente: nome, telefone, e-mail, endereço, convênio e muito mais.',
      attachTo: { element: '[data-tour="d2b-clientes-novo"]', on: 'bottom-end' },
      buttons: [BTN_BACK, BTN_DONE],
    },
  ]
}

// ── Tour: Configurações > Mensagens ───────────────────────────────────────────
function stepsMensagens() {
  return [
    {
      id: 'm-intro',
      title: '⚙️ Configurações de Mensagens',
      text: 'Aqui você configura o WhatsApp da clínica e as opções de envio automático de mensagens para os pacientes.',
      buttons: [BTN_EXIT, { ...BTN_NEXT, text: 'Começar →' }],
    },
    {
      id: 'm-numero',
      title: '📱 Número WhatsApp',
      text: 'Informe o número do WhatsApp da sua clínica. Ele será usado para o envio de mensagens automáticas.',
      attachTo: { element: '[data-tour="d2b-msg-numero"]', on: 'bottom' },
      buttons: [BTN_BACK, BTN_NEXT],
    },
    {
      id: 'm-permitir',
      title: '👩‍⚕️ Permissões de Profissionais',
      text: 'Ative para permitir que profissionais visualizem o telefone dos pacientes e disparem mensagens diretamente.',
      attachTo: { element: '[data-tour="d2b-msg-permitir"]', on: 'bottom' },
      buttons: [BTN_BACK, BTN_NEXT],
    },
    {
      id: 'm-envio',
      title: '🤖 Envio Automático',
      text: 'Escolha se o sistema dispara mensagens para todos ou apenas para pacientes com risco de falta.',
      attachTo: { element: '[data-tour="d2b-msg-envio"]', on: 'bottom' },
      buttons: [BTN_BACK, BTN_NEXT],
    },
    {
      id: 'm-horario',
      title: '🕐 Horário de Disparo',
      text: 'Defina em qual horário do dia as mensagens automáticas serão enviadas.',
      attachTo: { element: '[data-tour="d2b-msg-horario"]', on: 'bottom' },
      buttons: [BTN_BACK, BTN_NEXT],
    },
    {
      id: 'm-salvar',
      title: '💾 Salvar Configurações',
      text: 'Após realizar as alterações, clique aqui para salvar. As configurações entram em vigor imediatamente.',
      attachTo: { element: '[data-tour="d2b-msg-salvar"]', on: 'top' },
      buttons: [BTN_BACK, BTN_DONE],
    },
  ]
}

// ── Hook principal ────────────────────────────────────────────────────────────
export function useTour() {
  const pathname = usePathname()

  const startTour = useCallback(async () => {
    const { default: Shepherd } = await import('shepherd.js')

    // Cancel any running tour
    if (Shepherd.activeTour) Shepherd.activeTour.cancel()

    const steps =
      pathname.startsWith('/dashboard/clientes') ? stepsClientes()
      : pathname.startsWith('/dashboard/configuracoes') ? stepsMensagens()
      : stepsGeral()

    const tour = new Shepherd.Tour({
      useModalOverlay: true,
      defaultStepOptions: {
        cancelIcon: { enabled: true },
        scrollTo: { behavior: 'smooth', block: 'center' },
        modalOverlayOpeningPadding: 8,
        modalOverlayOpeningRadius: 8,
      },
    })

    steps.forEach((step) => tour.addStep(step as Parameters<typeof tour.addStep>[0]))

    tour.start()
  }, [pathname])

  return { startTour }
}
