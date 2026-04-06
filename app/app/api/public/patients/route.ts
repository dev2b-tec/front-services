import { NextRequest, NextResponse } from 'next/server'

const API = process.env.API_URL

// GET /api/public/patients?empresaId=X&telefone=Y&dataNascimento=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const empresaId = searchParams.get('empresaId')
  const telefone = searchParams.get('telefone')
  const dataNascimento = searchParams.get('dataNascimento')

  if (!empresaId || !telefone || !dataNascimento) {
    return NextResponse.json({ error: 'Parâmetros obrigatórios: empresaId, telefone, dataNascimento' }, { status: 400 })
  }

  try {
    // digits only for matching
    const digits = telefone.replace(/\D/g, '')

    const res = await fetch(
      `${API}/api/v1/pacientes/empresa/${empresaId}/buscar?q=${encodeURIComponent(digits)}`,
      { cache: 'no-store' }
    )
    if (!res.ok) return NextResponse.json(null)

    const pacientes: Array<{ dataNascimento?: string; telefone?: string }> = await res.json()

    // filter by birth date match
    const match = pacientes.find((p) => {
      const bd = p.dataNascimento // "YYYY-MM-DD" or [year,month,day]
      const bdStr = Array.isArray(bd)
        ? `${bd[0]}-${String(bd[1]).padStart(2,'0')}-${String(bd[2]).padStart(2,'0')}`
        : bd
      return bdStr === dataNascimento
    })

    return NextResponse.json(match ?? null)
  } catch (err) {
    console.error('[public/patients] erro:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

// POST /api/public/patients  — cria paciente
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const res = await fetch(`${API}/api/v1/pacientes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('[public/patients POST] erro:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
