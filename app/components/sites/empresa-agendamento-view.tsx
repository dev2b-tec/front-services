'use client'

import Image from 'next/image'
import Link from 'next/link'

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-500 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          {empresa.logoUrl && (
            <Image
              src={empresa.logoUrl}
              alt={empresa.nome}
              width={100}
              height={50}
              className="object-contain shrink-0"
            />
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{empresa.nome}</h1>
            {(empresa.logradouro || empresa.cidade) && (
              <p className="text-sm text-gray-400 mt-0.5">
                {[empresa.logradouro, empresa.numero, empresa.bairro, empresa.cidade]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </div>
        </div>

        <p className="text-sm text-purple-600 font-semibold mb-5">
          Selecione um profissional e horário
        </p>

        {profs.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-12">
            Nenhum profissional disponível no momento.
          </p>
        ) : (
          <div className="space-y-3">
            {profs.map((prof) => (
              <Link
                key={prof.id}
                href={`/sites/profissional/agendamento/${prof.id}`}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
              >
                {prof.fotoUrl ? (
                  <Image
                    src={prof.fotoUrl}
                    alt={prof.nome}
                    width={48}
                    height={48}
                    className="rounded-full object-cover w-12 h-12 border-2 border-purple-100 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-lg font-bold shrink-0">
                    {prof.nome.charAt(0)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm group-hover:text-purple-700 transition-colors">
                    {prof.nome}
                  </p>
                  {(prof.tipo || prof.especialidade) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[prof.tipo, prof.especialidade].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  {prof.duracaoSessao && (
                    <p className="text-xs text-gray-400">{prof.duracaoSessao} min</p>
                  )}
                  <p className="text-xs text-purple-500 font-medium mt-0.5 group-hover:text-purple-700">
                    Agendar →
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
