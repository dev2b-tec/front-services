import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

interface GerarResumoEvolucaoParams {
  comentariosGerais?: string
  conduta?: string
  examesRealizados?: string
  prescricao?: string
  empresaId: string
  usuarioId?: string
}

interface GerarResumoResponse {
  resumo: string
}

export function useIA() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  async function gerarResumoEvolucao(params: GerarResumoEvolucaoParams): Promise<string | null> {
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/evolucoes/ia/gerar-resumo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (!res.ok) {
        throw new Error('Erro ao gerar resumo')
      }

      const data: GerarResumoResponse = await res.json()
      
      toast({
        title: '✨ Resumo gerado com IA',
        description: 'O resumo foi gerado com sucesso!',
      })

      return data.resumo
    } catch (error) {
      toast({
        title: 'Erro ao gerar resumo',
        description: 'Não foi possível gerar o resumo com IA. Tente novamente.',
        variant: 'destructive',
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    gerarResumoEvolucao,
    loading,
  }
}
