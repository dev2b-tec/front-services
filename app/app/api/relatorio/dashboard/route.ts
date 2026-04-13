import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const API = process.env.API_URL

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.redirect(new URL('/api/auth/signin', req.url))
  }

  const { searchParams } = new URL(req.url)
  const empresaId = searchParams.get('empresaId')
  const usuarioId = searchParams.get('usuarioId')

  if (!empresaId) {
    return NextResponse.json({ error: 'empresaId obrigatório' }, { status: 400 })
  }

  const url = new URL(`${API}/api/v1/dashboard/empresa/${empresaId}/relatorio`)
  if (usuarioId) url.searchParams.set('usuarioId', usuarioId)

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json({ error: 'Erro ao gerar relatório' }, { status: res.status })
    }
    const buffer = await res.arrayBuffer()
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="relatorio-dashboard.pdf"',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Backend indisponível' }, { status: 503 })
  }
}
