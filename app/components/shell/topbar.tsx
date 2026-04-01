'use client'

/**
 * topbar.tsx — Barra superior fixa
 *
 * Contém:
 *  - Botão de abrir menu mobile (hamburger)
 *  - Título/breadcrumb dinâmico baseado na rota atual
 *  - Campo de busca
 *  - Avatar/usuário placeholder (sem backend)
 */

import { Menu, Search, Bell } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useSidebar } from './sidebar-context'
import { navGroups } from './nav-config'

// Resolve o label da rota atual percorrendo o nav-config
function usePageTitle() {
  const pathname = usePathname()
  for (const group of navGroups) {
    for (const item of group.items) {
      if (item.href === '/dashboard' && pathname === '/dashboard') return item.label
      if (item.href !== '/dashboard' && pathname.startsWith(item.href)) return item.label
    }
  }
  return 'DEV2B'
}

export function Topbar() {
  const { setMobileOpen } = useSidebar()
  const title = usePageTitle()

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-[#120328]/80 backdrop-blur-md border-b border-[rgba(124,77,255,0.18)]">

      {/* Hamburger — só mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden flex-shrink-0 p-2 rounded-lg text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Título da página atual */}
      <h1 className="text-sm font-semibold text-[#F5F0FF] truncate mr-auto">
        {title}
      </h1>

      {/* Busca */}
      <div className="hidden sm:flex items-center gap-2 bg-[#0D0520] border border-[rgba(124,77,255,0.18)] rounded-lg px-3 py-1.5 w-48 lg:w-64 focus-within:border-[#7C4DFF] transition-colors">
        <Search size={14} className="text-[#6B4E8A] flex-shrink-0" />
        <input
          type="text"
          placeholder="Buscar..."
          className="bg-transparent text-xs text-[#F5F0FF] placeholder:text-[#6B4E8A] outline-none w-full"
        />
      </div>

      {/* Notificações */}
      <button
        className="relative flex-shrink-0 p-2 rounded-lg text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors"
        aria-label="Notificações"
      >
        <Bell size={18} />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#7C4DFF]" />
      </button>

      {/* Avatar usuário */}
      <div className="flex-shrink-0 flex items-center gap-2 pl-1">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C4DFF] to-[#C084FC] flex items-center justify-center text-xs font-bold text-white select-none">
          U
        </div>
      </div>
    </header>
  )
}
