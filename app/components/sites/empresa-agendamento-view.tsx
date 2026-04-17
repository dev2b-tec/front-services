'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, ChevronRight } from 'lucide-react'

interface ProfissionalData {
  id: string
  nome: string
  fotoUrl?: string
  tipo?: string
  especialidade?: string
  duracaoSessao?: number
}

interface EmpresaData {
  id: string
  nome: string
  logoUrl?: string
  logradouro?: string
  numero?: string
  bairro?: string
  cidade?: string
}

export default function EmpresaAgendamentoView({
  empresa,
  profissionais,
}: {
  empresa: EmpresaData
  profissionais: unknown[]
}) {
  const profs = profissionais as ProfissionalData[]
  const address = [empresa.logradouro, empresa.numero, empresa.cidade].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen bg-[#F8F7FF]">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 sm:px-6">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          {empresa.logoUrl ? (
            <Image
              src={empresa.logoUrl}
              alt={empresa.nome}
              width={100}
              height={44}
              className="object-contain shrink-0 h-11 w-auto"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-[#7C4DFF]/10 flex items-center justify-center text-[#7C4DFF] font-bold text-base shrink-0">
              {empresa.nome?.charAt(0) ?? '?'}
            </div>
          )}
          <div className="min-w-0">
            {empresa.nome && (
              <h1 className="font-bold text-gray-900 text-base leading-tight truncate">{empresa.nome}</h1>
            )}
            {address && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                <MapPin size={11} className="shrink-0 text-[#7C4DFF]" />
                {address}
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 sm:px-6">
        <p className="text-xs font-bold text-[#7C4DFF] uppercase tracking-widest mb-5">
          Selecione um profissional
        </p>

        {profs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <p className="text-gray-400 text-sm">Nenhum profissional disponível no momento.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {profs.map((prof) => (
              <Link
                key={prof.id}
                href={`/sites/profissional/agendamento/${prof.id}`}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:border-[#7C4DFF]/40 hover:shadow-md active:scale-[0.99] transition-all group"
              >
                {prof.fotoUrl ? (
                  <Image
                    src={prof.fotoUrl}
                    alt={prof.nome}
                    width={56}
                    height={56}
                    className="rounded-full object-cover w-14 h-14 shrink-0 border-2 border-[#7C4DFF]/10"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-[#7C4DFF]/10 flex items-center justify-center text-[#7C4DFF] text-xl font-bold shrink-0">
                    {prof.nome.charAt(0)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm group-hover:text-[#7C4DFF] transition-colors leading-snug">
                    {prof.nome}
                  </p>
                  {(prof.tipo || prof.especialidade) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[prof.tipo, prof.especialidade].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {prof.duracaoSessao && (
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1.5">
                      <Clock size={10} className="shrink-0" />
                      {prof.duracaoSessao} min de atendimento
                    </p>
                  )}
                </div>

                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#7C4DFF] bg-[#7C4DFF]/10 px-3 py-2 rounded-xl group-hover:bg-[#7C4DFF] group-hover:text-white transition-colors whitespace-nowrap">
                    Agendar
                    <ChevronRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
