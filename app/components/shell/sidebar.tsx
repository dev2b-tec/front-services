'use client'

/**
 * sidebar.tsx — Menu lateral esquerdo colapsável
 *
 * Comportamento:
 * - Desktop: expansível/colapsável pelo botão de toggle
 * - Mobile: drawer sobreposto acionado pelo botão na Topbar
 * - Estado sincronizado via Context (sidebar-context.tsx)
 *
 * Para adicionar itens de menu, edite: components/shell/nav-config.ts
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from './sidebar-context'
import { navGroups } from './nav-config'

// ─── Logo DEV2B ─────────────────────────────────────────────────────────────

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Hexágono */}
      <div className="relative flex-shrink-0 w-8 h-8 brand-glow-sm">
        <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none">
          <polygon
            points="16,2 28,9 28,23 16,30 4,23 4,9"
            fill="#7C4DFF"
            opacity="0.15"
            stroke="#7C4DFF"
            strokeWidth="1.5"
          />
          <polygon
            points="16,6 25,11 25,21 16,26 7,21 7,11"
            fill="#7C4DFF"
          />
          <text
            x="16"
            y="20"
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fontFamily="Inter, sans-serif"
            fill="#F5F0FF"
            letterSpacing="-0.5"
          >
            D2B
          </text>
        </svg>
      </div>

      {/* Nome — some quando collapsed */}
      {!collapsed && (
        <span className="text-base font-bold tracking-tight leading-none">
          <span className="text-[#F5F0FF]">DEV</span>
          <span className="text-[#7C4DFF]">2B</span>
        </span>
      )}
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

export function Sidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar()
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  // ── Conteúdo interno (compartilhado entre desktop e mobile)
  const inner = (
    <div className="flex flex-col h-full">
      {/* Header: logo + fechar (mobile) / toggle (desktop) */}
      <div
        className={cn(
          'flex items-center h-14 px-3 flex-shrink-0 border-b border-[rgba(124,77,255,0.12)]',
          collapsed ? 'justify-center' : 'justify-between',
        )}
      >
        <Logo collapsed={collapsed} />

        {/* Fechar no mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors"
          aria-label="Fechar menu"
        >
          <X size={16} />
        </button>

        {/* Toggle collapse no desktop */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="hidden md:flex p-1.5 rounded-lg text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors"
            aria-label="Recolher menu"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {/* Título do grupo */}
            {group.title && !collapsed && (
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest text-[#6B4E8A]">
                {group.title}
              </p>
            )}
            {group.title && collapsed && (
              <div className="mx-auto mb-1 w-4 h-px bg-[rgba(124,77,255,0.18)]" />
            )}

            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href)
                const Icon = item.icon

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-all duration-150',
                        active
                          ? 'bg-[rgba(124,77,255,0.18)] text-[#F5F0FF]'
                          : 'text-[#A78BCC] hover:bg-[rgba(124,77,255,0.10)] hover:text-[#F5F0FF]',
                        collapsed && 'justify-center px-0',
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      {/* Indicador ativo */}
                      {active && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full bg-[#7C4DFF]" />
                      )}

                      <Icon
                        size={18}
                        className={cn(
                          'flex-shrink-0 transition-colors',
                          active ? 'text-[#7C4DFF]' : 'text-current',
                        )}
                      />

                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge && (
                            <span className="flex-shrink-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#7C4DFF] text-[10px] font-bold text-white flex items-center justify-center">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}

                      {/* Tooltip no collapsed */}
                      {collapsed && (
                        <span className="pointer-events-none absolute left-full ml-2 z-50 hidden group-hover:flex items-center whitespace-nowrap rounded-md bg-[#150830] border border-[rgba(124,77,255,0.25)] px-2.5 py-1.5 text-xs font-medium text-[#F5F0FF] shadow-xl">
                          {item.label}
                          {item.badge && (
                            <span className="ml-1.5 min-w-[16px] h-4 px-1 rounded-full bg-[#7C4DFF] text-[9px] font-bold text-white flex items-center justify-center">
                              {item.badge}
                            </span>
                          )}
                        </span>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-[rgba(124,77,255,0.12)] p-2">
        {collapsed ? (
          // Botão de expandir quando collapsed
          <button
            onClick={() => setCollapsed(false)}
            className="hidden md:flex w-full items-center justify-center p-2 rounded-lg text-[#A78BCC] hover:text-[#F5F0FF] hover:bg-[rgba(124,77,255,0.12)] transition-colors"
            aria-label="Expandir menu"
          >
            <ChevronRight size={16} />
          </button>
        ) : (
          <div className="px-2 py-1.5">
            <p className="text-[10px] text-[#6B4E8A]">DEV2B v1.0.0</p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* ── DESKTOP sidebar ─────────────────────────────── */}
      <aside
        className={cn(
          'hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0 bg-[#120328] border-r border-[rgba(124,77,255,0.18)] transition-all duration-300 ease-in-out overflow-hidden',
          collapsed ? 'w-[56px]' : 'w-[220px]',
        )}
      >
        {inner}
      </aside>

      {/* ── MOBILE: backdrop + drawer ────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-[220px] bg-[#120328] border-r border-[rgba(124,77,255,0.18)] flex flex-col transition-transform duration-300 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {inner}
      </aside>
    </>
  )
}
