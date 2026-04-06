import { NextRequest, NextResponse } from 'next/server'

const API = process.env.API_URL

// GET /api/public/services?empresaId=X
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const empresaId = searchParams.get('empresaId')

  if (!empresaId) {
    return NextResponse.json({ error: 'Parâmetro obrigatório: empresaId' }, { status: 400 })
  }

  try {
    const res = await fetch(`${API}/api/v1/servicos/empresa/${empresaId}/ativos`, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json([])
    return NextResponse.json(await res.json())
  } catch (err) {
    console.error('[public/services] erro:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
