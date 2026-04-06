import { NextRequest, NextResponse } from 'next/server'

const API = process.env.API_URL

// POST /api/public/bookings
// body: { usuarioId, empresaId, pacienteId?, pacienteNome, pacienteEmail?, pacienteTelefone, servicoId?, observacoes?, inicio, fim }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const { pacienteNome, pacienteTelefone, empresaId, usuarioId, inicio, fim } = body

    if (!pacienteNome || !pacienteTelefone || !empresaId || !usuarioId || !inicio || !fim) {
      return NextResponse.json({ error: 'Campos obrigatórios ausentes' }, { status: 400 })
    }

    // Build servicos list if a servicoId was provided
    const servicos = body.servicoId
      ? [{ servicoId: body.servicoId, quantidade: 1, valorUnitario: 0 }]
      : undefined

    const payload: Record<string, unknown> = {
      empresaId,
      usuarioId,
      pacienteId: body.pacienteId ?? undefined,
      pacienteNome,
      inicio,
      fim,
      observacoes: body.observacoes ?? null,
      servicos,
    }

    const res = await fetch(`${API}/api/v1/agendamentos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: err }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('[public/bookings] erro:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
