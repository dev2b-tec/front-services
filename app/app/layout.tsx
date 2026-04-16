import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Providers } from '@/components/providers'
import './globals.css'

// ─────────────────────────────────────────────────────────────────────────────
// 📊 Google Analytics — ID da propriedade GA4
// Para trocar a propriedade: altere apenas GA_ID abaixo.
// O componente <GoogleAnalytics> injeta o script gtag.js automaticamente
// em todas as páginas, de forma otimizada (carrega após a página interativa).
// ─────────────────────────────────────────────────────────────────────────────
const GA_ID = 'G-23KCEFL8J5'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'DEV2B — Gestão de Negócios',
  description: 'Plataforma SaaS de gestão de negócios DEV2B. Controle total do seu negócio em um único lugar.',
  generator: 'v0.app',
  applicationName: 'DEV2B',
  keywords: ['saas', 'gestão', 'negócios', 'crm', 'financeiro', 'dev2b'],
  icons: {
    icon: '/icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0D0520',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Script de inicialização do tema — roda antes da hidratação para evitar flash */}
        {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: `(function(){try{var d=localStorage.getItem('d2b-theme')!=='light';var r=document.documentElement.style;if(d){r.setProperty('--d2b-bg-main','#0D0520');r.setProperty('--d2b-bg-surface','#120328');r.setProperty('--d2b-bg-elevated','#150830');r.setProperty('--d2b-text-primary','#F5F0FF');r.setProperty('--d2b-topbar-bg','rgba(18,3,40,0.80)');}else{r.setProperty('--d2b-bg-main','#FFFFFF');r.setProperty('--d2b-bg-surface','#FFFFFF');r.setProperty('--d2b-bg-elevated','#F3F4F6');r.setProperty('--d2b-text-primary','#111827');r.setProperty('--d2b-topbar-bg','rgba(255,255,255,0.95)');}}catch(e){}})();` }}
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        {/* Vercel Analytics — métricas de performance */}
        <Analytics />
        {/* Google Analytics GA4 — rastreamento de usuários e eventos */}
        <GoogleAnalytics gaId={GA_ID} />
      </body>
    </html>
  )
}
