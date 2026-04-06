import { NextRequest, NextResponse } from 'next/server'

const API = process.env.API_URL

const DAY_MAP: Record<number, string> = {
  0: 'dom', 1: 'seg', 2: 'ter', 3: 'qua', 4: 'qui', 5: 'sex', 6: 'sab',
}

function parseTime(t: string | null | undefined): number | null {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

// GET /api/public/slots?usuarioId=X&dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const usuarioId = searchParams.get('usuarioId')
  const dataInicio = searchParams.get('dataInicio')
  const dataFim = searchParams.get('dataFim')

  if (!usuarioId || !dataInicio || !dataFim) {
    return NextResponse.json({ error: 'Parâmetros obrigatórios: usuarioId, dataInicio, dataFim' }, { status: 400 })
  }

  try {
    const userRes = await fetch(`${API}/api/v1/usuarios/${usuarioId}`, { cache: 'no-store' })
    if (!userRes.ok) return NextResponse.json({ error: 'Profissional não encontrado' }, { status: 404 })
    const usuario = await userRes.json()

    let agendaId: string | null = usuario.agendaId ?? null
    const duracao: number = usuario.duracaoSessao ?? 40
    const empresaId: string | null = usuario.empresaId ?? null

    // Se o usuário não tem agenda própria, busca a agenda da empresa
    if (!agendaId && empresaId) {
      const empRes = await fetch(`${API}/api/v1/empresas/${empresaId}`, { cache: 'no-store' })
      if (empRes.ok) {
        const empresa = await empRes.json()
        agendaId = empresa.agendaId ?? null
      }
    }

    let agenda: Record<string, unknown> | null = null
    if (agendaId) {
      const agRes = await fetch(`${API}/api/v1/agendas/${agendaId}`, { cache: 'no-store' })
      if (agRes.ok) agenda = await agRes.json()
    }

    let agendamentos: Array<{ usuarioId: string; inicio: string; fim: string }> = []
    if (empresaId) {
      const agUrl = `${API}/api/v1/agendamentos/empresa/${empresaId}?inicio=${dataInicio}T00:00:00&fim=${dataFim}T23:59:59`
      const agRes = await fetch(agUrl, { cache: 'no-store' })
      if (agRes.ok) {
        const all = await agRes.json()
        agendamentos = (all as Array<{ usuarioId: string; inicio: string; fim: string }>)
          .filter((a) => a.usuarioId === usuarioId)
      }
    }

    // Build slots per day
    const start = new Date(`${dataInicio}T00:00:00`)
    const end = new Date(`${dataFim}T23:59:59`)
    const result: Record<string, Array<{ time: string; blocked: boolean }>> = {}

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
      const dow = d.getDay()
      const prefix = DAY_MAP[dow]

      if (!agenda) {
        result[dateStr] = []
        continue
      }

      const aberto = agenda[`${prefix}Aberto`] as boolean | null
      if (!aberto) {
        result[dateStr] = []
        continue
      }

      const abertura = parseTime(agenda[`${prefix}Abertura`] as string)
      const fechamento = parseTime(agenda[`${prefix}Fechamento`] as string)
      if (abertura === null || fechamento === null) {
        result[dateStr] = []
        continue
      }

      const almocoAtivo = agenda['ativarHorarioAlmoco'] as boolean
      const almocoIni = parseTime(agenda['almocoInicio'] as string)
      const almocoFim = parseTime(agenda['almocoFim'] as string)

      // Occupied intervals (in minutes from midnight)
      const occupied: Array<[number, number]> = agendamentos
        .filter((a) => a.inicio.startsWith(dateStr))
        .map((a) => {
          const ini = new Date(a.inicio)
          const fim = new Date(a.fim)
          return [ini.getHours() * 60 + ini.getMinutes(), fim.getHours() * 60 + fim.getMinutes()] as [number, number]
        })

      const daySlots: Array<{ time: string; blocked: boolean }> = []
      for (let t = abertura; t + duracao <= fechamento; t += duracao) {
        // Skip lunch break entirely (not shown)
        if (almocoAtivo && almocoIni !== null && almocoFim !== null) {
          if (t < almocoFim && t + duracao > almocoIni) continue
        }
        const h = String(Math.floor(t / 60)).padStart(2, '0')
        const m = String(t % 60).padStart(2, '0')
        const busy = occupied.some(([ini, fim]) => t < fim && t + duracao > ini)
        daySlots.push({ time: `${h}:${m}`, blocked: busy })
      }

      result[dateStr] = daySlots
    }

    return NextResponse.json(result)
  } catch (err) {
    console.error('[public/slots] erro:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
