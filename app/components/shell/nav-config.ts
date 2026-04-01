/**
 * nav-config.ts — CONFIGURAÇÃO CENTRAL DE NAVEGAÇÃO
 *
 * Para adicionar um novo microfrontend ao menu:
 * 1. Crie sua página em: app/dashboard/SEU_MODULO/page.tsx
 * 2. Adicione um item aqui com { label, href, icon }
 * 3. O Sidebar vai renderizar automaticamente.
 *
 * O campo `icon` recebe qualquer componente LucideIcon.
 */

import {
  LayoutDashboard,
  Calendar,
  Bell,
  Users,
  UserCog,
  Settings,
  DollarSign,
  Megaphone,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  badge?: string        // ex: "12" para notificações
  children?: NavItem[]  // sub-menu (nível 2)
}

export type NavGroup = {
  title?: string        // título do grupo (opcional)
  items: NavItem[]
}

/**
 * EDITE AQUI para adicionar/remover itens do menu.
 * Cada grupo pode ter um título opcional para separar seções.
 */
export const navGroups: NavGroup[] = [
  {
    // Sem título = primeiro grupo, sem separador
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
      },
      {
        label: 'Calendário',
        href: '/dashboard/calendario',
        icon: Calendar,
      },
      {
        label: 'Avisos',
        href: '/dashboard/avisos',
        icon: Bell,
      },
    ],
  },
  {
    title: 'Operações',
    items: [
      {
        label: 'Clientes',
        href: '/dashboard/clientes',
        icon: Users,
        badge: '3',
      },
      {
        label: 'Usuários',
        href: '/dashboard/usuarios',
        icon: UserCog,
      },
    ],
  },
  {
    title: 'Financeiro',
    items: [
      {
        label: 'Financeiro',
        href: '/dashboard/financeiro',
        icon: DollarSign,
      },
      {
        label: 'Marketing',
        href: '/dashboard/marketing',
        icon: Megaphone,
      },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        label: 'Configurações',
        href: '/dashboard/configuracoes',
        icon: Settings,
      },
    ],
  },
]
