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
  MessageSquare,
  Package,
  Warehouse,
  ShoppingBag,
  Briefcase,
  Landmark,
  Lightbulb,
  type LucideIcon,
} from 'lucide-react'

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  badge?: string        // ex: "12" para notificações
  permission?: string   // ex: 'relatorios.read' — item oculto se usuário não tem permissão
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
    title: 'Início',
    items: [
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        permission: 'relatorios.read',
      },
      {
        label: 'Calendário',
        href: '/dashboard/calendario',
        icon: Calendar,
      },
    ],
  },
  {
    title: 'Operações',
    items: [
      {
        label: 'Cadastros',
        href: '/dashboard/cadastros',
        icon: Package,
      },
      {
        label: 'Clientes',
        href: '/dashboard/clientes',
        icon: Users,
      },
      {
        label: 'Usuários',
        href: '/dashboard/usuarios',
        icon: UserCog,
      },
    ],
  },
  {
    title: 'Comunicação',
    items: [
      {
        label: 'Avisos',
        href: '/dashboard/avisos',
        icon: Bell,
      },
      {
        label: 'Chat',
        href: '/dashboard/chat',
        icon: MessageSquare,
      },
      {
        label: 'Marketing',
        href: '/dashboard/marketing',
        icon: Megaphone,
      },
    ],
  },
  {
    title: 'Faturamento',
    items: [
      {
        label: 'Financeiro',
        href: '/dashboard/financeiro',
        icon: DollarSign,
      },
      {
        label: 'Finanças',
        href: '/dashboard/financas',
        icon: Landmark,
      },
      {
        label: 'Vendas',
        href: '/dashboard/vendas',
        icon: ShoppingBag,
      },
    ],
  },
  {
    title: 'Logística',
    items: [
      {
        label: 'Suprimentos',
        href: '/dashboard/suprimentos',
        icon: Warehouse,
      },
      {
        label: 'Serviços',
        href: '/dashboard/servicos',
        icon: Briefcase,
      },
    ],
  },
  {
    title: 'Ideias',
    items: [
      {
        label: 'Canal de Ideias',
        href: '/dashboard/ideias',
        icon: Lightbulb,
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
