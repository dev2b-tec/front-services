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
import { useMenuAtivo } from '@/hooks/use-menu-ativo'

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
          <span className="text-[var(--d2b-text-primary)]">DEV</span>
          <span className="text-[#7C4DFF]">2B</span>
        </span>
      )}
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

/** Extrai a chave do menu a partir do href (ex: /dashboard/clientes → 'clientes') */
function getChave(href: string): string {
  const parts = href.replace(/\/$/, '').split('/')
  return parts[parts.length - 1] || 'dashboard'
}

export function Sidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar()
  const pathname = usePathname()
  const { isAtivo } = useMenuAtivo()

  // Filtra os navGroups conforme status do banco.
  // Grupos cujos todos os itens estão desligados (ex: Logística) são ocultados inteiramente.
  const visibleGroups = navGroups
    .map(group => ({
      ...group,
      items: group.items.filter(item => isAtivo(getChave(item.href))),
    }))
    .filter(group => group.items.length > 0)

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === href : pathname.startsWith(href)

  // ── Conteúdo interno (compartilhado entre desktop e mobile)
  const inner = (
    <div className="flex flex-col h-full">
      {/* Header: logo + fechar (mobile) / toggle (desktop) */}
      <div
        className={cn(
          'flex items-center h-14 px-3 flex-shrink-0 border-b',
          collapsed ? 'justify-center' : 'justify-between',
        )}
        style={{ borderColor: 'var(--d2b-border)' }}
      >
        <Logo collapsed={collapsed} />

        {/* Fechar no mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--d2b-text-secondary)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--d2b-text-primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--d2b-hover)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--d2b-text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
          aria-label="Fechar menu"
        >
          <X size={16} />
        </button>

        {/* Toggle collapse no desktop */}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="hidden md:flex p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--d2b-text-secondary)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--d2b-text-primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--d2b-hover)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--d2b-text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            aria-label="Recolher menu"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-4">
        {visibleGroups.map((group, gi) => (
          <div key={gi}>
            {/* Título do grupo */}
            {group.title && !collapsed && (
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--d2b-text-muted)' }}>
                {group.title}
              </p>
            )}
            {group.title && collapsed && (
              <div className="mx-auto mb-1 w-4 h-px" style={{ background: 'var(--d2b-border)' }} />
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
                        collapsed && 'justify-center px-0',
                      )}
                      style={{
                        color: active ? 'var(--d2b-text-primary)' : 'var(--d2b-text-secondary)',
                        background: active ? 'var(--d2b-active)' : 'transparent',
                      }}
                      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'var(--d2b-hover)'; (e.currentTarget as HTMLElement).style.color = 'var(--d2b-text-primary)' } }}
                      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--d2b-text-secondary)' } }}
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
                        <span className="pointer-events-none absolute left-full ml-2 z-50 hidden group-hover:flex items-center whitespace-nowrap rounded-md border px-2.5 py-1.5 text-xs font-medium shadow-xl"
                          style={{ background: 'var(--d2b-bg-elevated)', borderColor: 'var(--d2b-border-strong)', color: 'var(--d2b-text-primary)' }}>
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
      <div className="flex-shrink-0 border-t p-2" style={{ borderColor: 'var(--d2b-border)' }}>
        {collapsed ? (
          // Botão de expandir quando collapsed
          <button
            onClick={() => setCollapsed(false)}
            className="hidden md:flex w-full items-center justify-center p-2 rounded-lg transition-colors"
            style={{ color: 'var(--d2b-text-secondary)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--d2b-text-primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--d2b-hover)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--d2b-text-secondary)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            aria-label="Expandir menu"
          >
            <ChevronRight size={16} />
          </button>
        ) : (
          <div className="px-2 py-1.5">
            <p className="text-[10px]" style={{ color: 'var(--d2b-text-muted)' }}>DEV2B-AGENDA v1.0.0</p>
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
          'hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0 border-r transition-all duration-300 ease-in-out overflow-hidden',
          collapsed ? 'w-[56px]' : 'w-[220px]',
        )}
        style={{ background: 'var(--d2b-bg-surface)', borderColor: 'var(--d2b-border)' }}
      >
        {inner}
      </aside>

      {/* ── MOBILE: backdrop + drawer ────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 backdrop-blur-sm md:hidden"
          style={{ background: 'var(--d2b-overlay)' }}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-[220px] border-r flex flex-col transition-transform duration-300 ease-in-out md:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        style={{ background: 'var(--d2b-bg-surface)', borderColor: 'var(--d2b-border)' }}
      >
        {inner}
      </aside>
    </>
  )
}
