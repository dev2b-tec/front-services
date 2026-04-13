import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowLeft } from 'lucide-react'

interface BlogPost {
  id: string
  titulo: string
  dataPublicacao?: string
  status: string
  conteudo?: string
  imagemUrl?: string
}

interface SiteConfig {
  tituloPagina?: string
  slogan?: string
  corPrincipal?: string
  logoUrl?: string
}

function formatDate(iso?: string) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function BlogPostView({
  siteConfig,
  post,
  usuarioId,
}: {
  siteConfig: SiteConfig
  post: BlogPost
  usuarioId: string
}) {
  const cor = siteConfig.corPrincipal || '#00B4A6'

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          {siteConfig.logoUrl ? (
            <Image src={siteConfig.logoUrl} alt="Logo" width={120} height={40} className="h-10 w-auto object-contain" />
          ) : (
            <span className="text-lg font-bold" style={{ color: cor }}>{siteConfig.tituloPagina || 'Meu Site'}</span>
          )}
          <div className="flex items-center gap-4 text-sm font-medium text-gray-600">
            <Link href={`/sites/blog/${usuarioId}`} className="hover:text-gray-900 transition-colors">Blog</Link>
            <Link
              href={`/sites/profissional/${usuarioId}`}
              className="px-4 py-2 rounded-full text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ backgroundColor: cor }}
            >Agendar</Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Back */}
        <Link
          href={`/sites/blog/${usuarioId}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Voltar ao blog
        </Link>

        {/* Cover image */}
        {post.imagemUrl && (
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-8">
            <Image src={post.imagemUrl} alt={post.titulo} fill className="object-cover" priority />
          </div>
        )}

        {/* Meta */}
        {post.dataPublicacao && (
          <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
            <Calendar size={11} /> {formatDate(post.dataPublicacao)}
          </p>
        )}

        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-8 leading-tight">{post.titulo}</h1>

        {/* Body */}
        {post.conteudo && (
          <div className="prose prose-gray max-w-none text-gray-700 leading-relaxed whitespace-pre-line">
            {post.conteudo}
          </div>
        )}

        {/* CTA */}
        <div className="mt-14 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href={`/sites/blog/${usuarioId}`} className="text-sm text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1">
            <ArrowLeft size={13} /> Ver todas as publicações
          </Link>
          <Link
            href={`/sites/profissional/${usuarioId}`}
            className="px-6 py-3 rounded-full text-white font-semibold text-sm shadow hover:opacity-90 transition-opacity"
            style={{ backgroundColor: cor }}
          >Agendar Consulta</Link>
        </div>
      </article>
    </div>
  )
}
