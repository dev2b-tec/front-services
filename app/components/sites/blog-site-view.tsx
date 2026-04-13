'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Phone, Mail, Globe, Instagram, Facebook, Linkedin, Youtube, ArrowRight } from 'lucide-react'

interface BlogPost {
  id: string
  titulo: string
  dataPublicacao?: string
  status: string
  conteudo?: string
  imagemUrl?: string
}

interface SiteConfig {
  id: string
  usuarioId: string
  tituloPagina?: string
  slogan?: string
  sobreMim?: string
  servicos?: string
  corPrincipal?: string
  logoUrl?: string
  perfilUrl?: string
  bannerUrl?: string
  whatsapp?: string
  emailContato?: string
  telefone?: string
  websiteLink?: string
  instagram?: string
  facebook?: string
  linkedin?: string
  youtube?: string
  posts?: BlogPost[]
}

function formatDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function excerpt(html?: string, max = 140) {
  if (!html) return ''
  const plain = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return plain.length > max ? plain.slice(0, max) + '…' : plain
}

export default function BlogSiteView({
  siteConfig,
  usuarioId,
}: {
  siteConfig: SiteConfig
  usuarioId: string
}) {
  const cor = siteConfig.corPrincipal || '#00B4A6'
  const publishedPosts = (siteConfig.posts ?? []).filter((p) => p.status === 'PUBLICADO')

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          {siteConfig.logoUrl ? (
            <Image
              src={siteConfig.logoUrl}
              alt="Logo"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
            />
          ) : (
            <span className="text-lg font-bold" style={{ color: cor }}>
              {siteConfig.tituloPagina || 'Meu Site'}
            </span>
          )}
          <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
            <a href="#sobre" className="hover:text-gray-900 transition-colors hidden sm:block">Sobre</a>
            <a href="#blog" className="hover:text-gray-900 transition-colors hidden sm:block">Blog</a>
            <Link
              href={`/sites/profissional/${usuarioId}`}
              className="px-4 py-2 rounded-full text-white text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ backgroundColor: cor }}
            >
              Agendar
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero Banner ─── */}
      <section className="relative h-72 sm:h-96 overflow-hidden bg-gray-200">
        {siteConfig.bannerUrl ? (
          <Image
            src={siteConfig.bannerUrl}
            alt="Banner"
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${cor}33, ${cor}88)` }} />
        )}
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white drop-shadow-lg">
            {siteConfig.tituloPagina || 'Bem-vindo'}
          </h1>
          {siteConfig.slogan && (
            <p className="mt-3 text-base sm:text-lg text-white/90 max-w-xl">{siteConfig.slogan}</p>
          )}
          <Link
            href={`/sites/profissional/${usuarioId}`}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity"
            style={{ backgroundColor: cor }}
          >
            Agendar Consulta <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ─── Sobre + Perfil ─── */}
      {siteConfig.sobreMim && (
        <section id="sobre" className="max-w-5xl mx-auto px-4 py-14 flex flex-col sm:flex-row gap-10 items-start">
          {siteConfig.perfilUrl && (
            <Image
              src={siteConfig.perfilUrl}
              alt="Foto de perfil"
              width={180}
              height={180}
              className="rounded-2xl object-cover shrink-0 shadow-md w-36 h-36 sm:w-44 sm:h-44"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sobre Mim</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{siteConfig.sobreMim}</p>
          </div>
        </section>
      )}

      {/* ─── CTA Bar ─── */}
      <section className="py-10 px-4" style={{ backgroundColor: cor + '18' }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-lg font-semibold text-gray-800">
            {siteConfig.servicos
              ? siteConfig.servicos.split('\n')[0]
              : 'Pronto para cuidar da sua saúde?'}
          </p>
          <Link
            href={`/sites/profissional/${usuarioId}`}
            className="px-7 py-3 rounded-full text-white font-semibold text-sm shadow hover:opacity-90 transition-opacity shrink-0"
            style={{ backgroundColor: cor }}
          >
            Agendar agora
          </Link>
        </div>
      </section>

      {/* ─── Blog ─── */}
      {publishedPosts.length > 0 && (
        <section id="blog" className="max-w-5xl mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Publicações Recentes</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publishedPosts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col"
              >
                {post.imagemUrl ? (
                  <Image
                    src={post.imagemUrl}
                    alt={post.titulo}
                    width={400}
                    height={200}
                    className="w-full h-44 object-cover"
                  />
                ) : (
                  <div className="w-full h-44 flex items-center justify-center" style={{ backgroundColor: cor + '22' }}>
                    <Calendar size={36} style={{ color: cor }} strokeWidth={1.5} />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  {post.dataPublicacao && (
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <Calendar size={11} /> {formatDate(post.dataPublicacao)}
                    </p>
                  )}
                  <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">{post.titulo}</h3>
                  {post.conteudo && (
                    <p className="text-sm text-gray-500 line-clamp-3 flex-1">{excerpt(post.conteudo)}</p>
                  )}
                  <div className="mt-4">
                    <Link
                      href={`/sites/blog/${usuarioId}/${post.id}`}
                      className="text-xs font-semibold hover:opacity-75 transition-opacity"
                      style={{ color: cor }}
                    >Ler mais →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ─── Footer ─── */}
      <footer className="border-t border-gray-100 py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-sm text-gray-400">
            {siteConfig.tituloPagina && <p className="font-semibold text-gray-600 mb-1">{siteConfig.tituloPagina}</p>}
            {siteConfig.emailContato && (
              <p className="flex items-center gap-1.5"><Mail size={12} />{siteConfig.emailContato}</p>
            )}
            {siteConfig.telefone && (
              <p className="flex items-center gap-1.5 mt-1"><Phone size={12} />{siteConfig.telefone}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {siteConfig.instagram && (
              <a href={siteConfig.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 hover:border-gray-400 transition-colors text-gray-500 hover:text-gray-700">
                <Instagram size={16} />
              </a>
            )}
            {siteConfig.facebook && (
              <a href={siteConfig.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 hover:border-gray-400 transition-colors text-gray-500 hover:text-gray-700">
                <Facebook size={16} />
              </a>
            )}
            {siteConfig.linkedin && (
              <a href={siteConfig.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 hover:border-gray-400 transition-colors text-gray-500 hover:text-gray-700">
                <Linkedin size={16} />
              </a>
            )}
            {siteConfig.youtube && (
              <a href={siteConfig.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 hover:border-gray-400 transition-colors text-gray-500 hover:text-gray-700">
                <Youtube size={16} />
              </a>
            )}
            {siteConfig.websiteLink && (
              <a href={siteConfig.websiteLink} target="_blank" rel="noreferrer" aria-label="Website"
                className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 hover:border-gray-400 transition-colors text-gray-500 hover:text-gray-700">
                <Globe size={16} />
              </a>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-gray-300 mt-6">
          Powered by <span className="font-semibold">DEV2B</span>
        </p>
      </footer>
    </div>
  )
}
