import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

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
    icon: '/favicon.ico',
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
        {/* anti-flash: aplica o tema ANTES do React montar, evita piscar */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var d=localStorage.getItem('d2b-theme')!=='light';var r=document.documentElement.style;if(d){r.setProperty('--d2b-bg-main','#0D0520');r.setProperty('--d2b-bg-surface','#120328');r.setProperty('--d2b-bg-elevated','#150830');r.setProperty('--d2b-text-primary','#F5F0FF');r.setProperty('--d2b-topbar-bg','rgba(18,3,40,0.80)');}else{r.setProperty('--d2b-bg-main','#FFFFFF');r.setProperty('--d2b-bg-surface','#FFFFFF');r.setProperty('--d2b-bg-elevated','#F3F4F6');r.setProperty('--d2b-text-primary','#111827');r.setProperty('--d2b-topbar-bg','rgba(255,255,255,0.95)');}}catch(e){}})();` }} />
        <script dangerouslySetInnerHTML={{ __html: `window.__ENV__=${JSON.stringify({ whatsApiUrl: process.env.NEXT_PUBLIC_WHATS_API_URL ?? '' })};` }} />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
