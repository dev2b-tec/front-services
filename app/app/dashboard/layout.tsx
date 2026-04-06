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
 */

import { auth } from '@/lib/auth'
import { SidebarProvider } from '@/components/shell/sidebar-context'
import { Sidebar } from '@/components/shell/sidebar'
import { Topbar } from '@/components/shell/topbar'

async function syncUsuario(nome: string, email: string, keycloakId: string) {
  try {
    await fetch(`${process.env.API_URL}/api/v1/usuarios/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, keycloakId }),
      cache: 'no-store',
    })
  } catch {
    // sync failures are non-fatal — user still accesses the dashboard
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  if (session?.user?.name && session.user.email && session.keycloakId) {
    await syncUsuario(session.user.name, session.user.email, session.keycloakId)
  }

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
