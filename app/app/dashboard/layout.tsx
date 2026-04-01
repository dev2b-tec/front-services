/**
 * app/dashboard/layout.tsx — LAYOUT PAI DO SHELL
 *
 * Este é o componente pai. Ele envolve TODOS os microfrontends/páginas
 * dentro de /dashboard com o Topbar + Sidebar.
 *
 * Como funciona:
 *  - {children} é o slot onde cada página/microfrontend é renderizado
 *  - Basta criar app/dashboard/SEU_MODULO/page.tsx e ele já aparece aqui
 *  - O item de menu correspondente deve ser registrado em nav-config.ts
 *
 * Backend mínimo necessário para este layout:
 *  - NENHUM. O layout é 100% client-side.
 *  - Quando quiser adicionar auth, basta um createClient() aqui para
 *    verificar a sessão antes de renderizar o children.
 */

import { SidebarProvider } from '@/components/shell/sidebar-context'
import { Sidebar } from '@/components/shell/sidebar'
import { Topbar } from '@/components/shell/topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden bg-[#0D0520]">

        {/* ── Sidebar (menu lateral) ── */}
        <Sidebar />

        {/* ── Área principal ── */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

          {/* ── Topbar (menu superior) ── */}
          <Topbar />

          {/*
           * ── SLOT DOS MICROFRONTENDS ──────────────────────────────────
           *
           * Tudo que você criar dentro de /app/dashboard/ aparece aqui.
           *
           * Exemplo — para criar o módulo "Clientes":
           *   1. Crie: app/dashboard/clientes/page.tsx
           *   2. Adicione no nav-config.ts:
           *        { label: 'Clientes', href: '/dashboard/clientes', icon: Users }
           *   3. Pronto — o componente herda automaticamente este layout.
           *
           * O componente filho recebe o espaço disponível abaixo da Topbar
           * e à direita da Sidebar, com scroll independente.
           * ─────────────────────────────────────────────────────────────
           */}
          <main
            id="microfrontend-slot"
            className="flex-1 overflow-y-auto overflow-x-hidden"
          >
            {children}
          </main>

        </div>
      </div>
    </SidebarProvider>
  )
}
