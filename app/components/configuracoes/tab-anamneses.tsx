'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, GripVertical, ChevronDown, FileText, Pencil, BookOpen } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { UsuarioData, EmpresaData } from '@/app/dashboard/configuracoes/page'

interface TabAnamnesesProps {
  initialUsuario?: UsuarioData | null
  initialEmpresa?: EmpresaData | null
}

interface Pergunta {
  id?: string
  texto: string
  tipoResposta: string
  ordem: number
  ativa: boolean
}

interface Anamnese {
  id: string
  titulo: string
  empresaId: string
  perguntas: Pergunta[]
}

export function TabAnamneses({ initialUsuario, initialEmpresa }: TabAnamnesesProps) {
  const { toast } = useToast()
  const [anamneses, setAnamneses] = useState<Anamnese[]>([])
  const [loading, setLoading] = useState(true)
  const [anamneseSelecionada, setAnamneseSelecionada] = useState<Anamnese | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  
  // Dialog Nova Anamnese
  const [dialogNovaOpen, setDialogNovaOpen] = useState(false)
  const [novoTitulo, setNovoTitulo] = useState('')
  
  // Dialog Nova Pergunta
  const [dialogPerguntaOpen, setDialogPerguntaOpen] = useState(false)
  const [novaPergunta, setNovaPergunta] = useState('')
  const [novoTipoResposta, setNovoTipoResposta] = useState('AMBOS')

  // Edição de pergunta
  const [editingPerguntaIndex, setEditingPerguntaIndex] = useState<number | null>(null)
  const [editPerguntaTexto, setEditPerguntaTexto] = useState('')
  const [editPerguntaTipo, setEditPerguntaTipo] = useState('AMBOS')

  useEffect(() => {
    if (initialEmpresa?.id) {
      carregarAnamneses()
    }
  }, [initialEmpresa?.id])

  useEffect(() => {
    if (anamneses.length > 0 && !anamneseSelecionada) {
      setAnamneseSelecionada(anamneses[0])
    }
  }, [anamneses])

  const carregarAnamneses = async () => {
    if (!initialEmpresa?.id) return
    
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/anamneses/empresa/${initialEmpresa.id}`)
      if (res.ok) {
        const data = await res.json()
        setAnamneses(data)
      }
    } catch (error) {
      console.error('Erro ao carregar anamneses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCriarAnamnese = async () => {
    if (!novoTitulo.trim() || !initialEmpresa?.id) return
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/anamneses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: novoTitulo,
          empresaId: initialEmpresa.id,
          perguntas: []
        }),
      })

      if (res.ok) {
        toast({ title: 'Anamnese criada com sucesso!' })
        carregarAnamneses()
        setDialogNovaOpen(false)
        setNovoTitulo('')
      } else {
        toast({ title: 'Erro ao criar anamnese', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao criar anamnese:', error)
      toast({ title: 'Erro ao criar anamnese', variant: 'destructive' })
    }
  }

  const handleCriarPadrao = async () => {
    if (!initialEmpresa?.id) return
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/anamneses/empresa/${initialEmpresa.id}/padrao`, {
        method: 'POST',
      })
      if (res.ok) {
        toast({ title: 'Anamnese padrão criada com sucesso!' })
        carregarAnamneses()
      } else {
        toast({ title: 'Erro ao criar anamnese padrão', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Erro ao criar anamnese padrão', variant: 'destructive' })
    }
  }

  const handleAdicionarPergunta = async () => {
    if (!novaPergunta.trim() || !anamneseSelecionada) return

    const novasPerguntas = [
      ...anamneseSelecionada.perguntas,
      {
        texto: novaPergunta,
        tipoResposta: novoTipoResposta,
        ordem: anamneseSelecionada.perguntas.length,
        ativa: true
      }
    ]

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/anamneses/${anamneseSelecionada.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perguntas: novasPerguntas }),
      })

      if (res.ok) {
        toast({ title: 'Pergunta adicionada com sucesso!' })
        carregarAnamneses()
        setDialogPerguntaOpen(false)
        setNovaPergunta('')
        setNovoTipoResposta('AMBOS')
      } else {
        toast({ title: 'Erro ao adicionar pergunta', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao adicionar pergunta:', error)
      toast({ title: 'Erro ao adicionar pergunta', variant: 'destructive' })
    }
  }

  const handleRemoverPergunta = async (perguntaIndex: number) => {
    if (!anamneseSelecionada) return

    const novasPerguntas = anamneseSelecionada.perguntas.filter((_, i) => i !== perguntaIndex)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/anamneses/${anamneseSelecionada.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perguntas: novasPerguntas }),
      })

      if (res.ok) {
        toast({ title: 'Pergunta removida com sucesso!' })
        carregarAnamneses()
      } else {
        toast({ title: 'Erro ao remover pergunta', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao remover pergunta:', error)
      toast({ title: 'Erro ao remover pergunta', variant: 'destructive' })
    }
  }

  const handleAtualizarPergunta = async (index: number) => {
    if (!anamneseSelecionada || !editPerguntaTexto.trim()) return

    const novasPerguntas = [...anamneseSelecionada.perguntas]
    novasPerguntas[index] = {
      ...novasPerguntas[index],
      texto: editPerguntaTexto,
      tipoResposta: editPerguntaTipo
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/anamneses/${anamneseSelecionada.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ perguntas: novasPerguntas }),
      })

      if (res.ok) {
        toast({ title: 'Pergunta atualizada com sucesso!' })
        carregarAnamneses()
        setEditingPerguntaIndex(null)
      } else {
        toast({ title: 'Erro ao atualizar pergunta', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao atualizar pergunta:', error)
      toast({ title: 'Erro ao atualizar pergunta', variant: 'destructive' })
    }
  }

  const handleDeletarAnamnese = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta anamnese?')) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/anamneses/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        toast({ title: 'Anamnese excluída com sucesso!' })
        carregarAnamneses()
        if (anamneseSelecionada?.id === id) {
          setAnamneseSelecionada(null)
        }
      } else {
        toast({ title: 'Erro ao excluir anamnese', variant: 'destructive' })
      }
    } catch (error) {
      console.error('Erro ao excluir anamnese:', error)
      toast({ title: 'Erro ao excluir anamnese', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-bold text-[var(--d2b-text-primary)]">Anamneses da Clínica</h2>
          <p className="text-xs text-[var(--d2b-text-secondary)] mt-1">
            Crie e edite diferentes anamneses para os prontuários da clínica.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleCriarPadrao}
            disabled={loading || anamneses.length > 0}
            title={anamneses.length > 0 ? 'Já existem anamneses cadastradas' : 'Criar anamnese padrão com perguntas prontas'}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] text-sm font-semibold transition-colors hover:border-[#7C4DFF] hover:text-[#7C4DFF] disabled:opacity-40 disabled:pointer-events-none"
          >
            <BookOpen size={16} />
            Anamnese Padrão
          </button>
          <button
            onClick={() => setDialogNovaOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold transition-colors"
          >
            <Plus size={16} />
            Nova Anamnese
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-[var(--d2b-text-secondary)]">Carregando...</div>
      ) : anamneses.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)]">
          <FileText size={48} className="mx-auto mb-4 text-[var(--d2b-text-muted)]" />
          <p className="text-sm text-[var(--d2b-text-secondary)]">Nenhuma anamnese cadastrada</p>
          <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Clique em "Nova Anamnese" para começar</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Dropdown de seleção de anamnese */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] hover:border-[#7C4DFF] transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-[#7C4DFF]" />
                <span className="text-sm font-semibold text-[var(--d2b-text-primary)]">
                  {anamneseSelecionada?.titulo || 'Selecione uma anamnese'}
                </span>
              </div>
              <ChevronDown size={18} className={`text-[var(--d2b-text-secondary)] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute z-10 w-full mt-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] shadow-xl overflow-hidden">
                {anamneses.map(anamnese => (
                  <button
                    key={anamnese.id}
                    onClick={() => {
                      setAnamneseSelecionada(anamnese)
                      setDropdownOpen(false)
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-[var(--d2b-hover)] transition-colors ${
                      anamneseSelecionada?.id === anamnese.id ? 'bg-[var(--d2b-hover)]' : ''
                    }`}
                  >
                    <span className="text-sm text-[var(--d2b-text-primary)]">{anamnese.titulo}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletarAnamnese(anamnese.id)
                      }}
                      className="p-1.5 rounded hover:bg-[rgba(239,68,68,0.15)] text-[var(--d2b-text-secondary)] hover:text-[#EF4444] transition-colors"
                      title="Excluir anamnese"
                    >
                      <Trash2 size={14} />
                    </button>
                  </button>
                ))}
              </div>
            )}
          </div>

          {anamneseSelecionada && (
            <>
              {/* Seção de Perguntas Ativas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-[var(--d2b-text-primary)]">Perguntas Ativas</h3>
                  <button
                    onClick={() => setDialogPerguntaOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-xs font-semibold transition-colors"
                  >
                    <Plus size={14} />
                    Nova Pergunta
                  </button>
                </div>

                {anamneseSelecionada.perguntas.length > 0 ? (
                  <div className="space-y-2">
                    {anamneseSelecionada.perguntas.map((pergunta, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg border border-[var(--d2b-border)] bg-[var(--d2b-bg-surface)] hover:border-[var(--d2b-border-strong)] transition-colors"
                      >
                        <GripVertical size={16} className="text-[var(--d2b-text-muted)] shrink-0" />
                        
                        {editingPerguntaIndex === index ? (
                          <div className="flex-1 flex items-center gap-3">
                            <input
                              type="text"
                              value={editPerguntaTexto}
                              onChange={(e) => setEditPerguntaTexto(e.target.value)}
                              className="flex-1 px-3 py-1.5 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                            />
                            <select
                              value={editPerguntaTipo}
                              onChange={(e) => setEditPerguntaTipo(e.target.value)}
                              className="px-3 py-1.5 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
                            >
                              <option value="AMBOS">Ambos</option>
                              <option value="SIM_NAO">Sim/Não</option>
                              <option value="CAMPO_ABERTO">Campo Aberto</option>
                            </select>
                            <button
                              onClick={() => handleAtualizarPergunta(index)}
                              className="px-3 py-1.5 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-xs font-semibold"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={() => setEditingPerguntaIndex(null)}
                              className="px-3 py-1.5 rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] text-xs font-semibold"
                            >
                              Cancelar
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <p className="text-sm text-[var(--d2b-text-primary)]">{pergunta.texto}</p>
                            </div>

                            <select
                              value={pergunta.tipoResposta}
                              onChange={async (e) => {
                                const novasPerguntas = [...anamneseSelecionada.perguntas]
                                novasPerguntas[index] = { ...novasPerguntas[index], tipoResposta: e.target.value }
                                
                                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/anamneses/${anamneseSelecionada.id}`, {
                                  method: 'PATCH',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ perguntas: novasPerguntas }),
                                })
                                
                                if (res.ok) {
                                  carregarAnamneses()
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)] text-[var(--d2b-text-secondary)] text-xs focus:outline-none focus:border-[#7C4DFF] cursor-pointer"
                            >
                              <option value="AMBOS">Ambos</option>
                              <option value="SIM_NAO">Sim/Não</option>
                              <option value="CAMPO_ABERTO">Campo Aberto</option>
                            </select>

                            <button
                              onClick={() => {
                                setEditingPerguntaIndex(index)
                                setEditPerguntaTexto(pergunta.texto)
                                setEditPerguntaTipo(pergunta.tipoResposta)
                              }}
                              className="p-1.5 rounded hover:bg-[var(--d2b-hover)] text-[var(--d2b-text-secondary)] hover:text-[#7C4DFF] transition-colors"
                              title="Editar"
                            >
                              <Pencil size={14} />
                            </button>

                            <button
                              onClick={() => handleRemoverPergunta(index)}
                              className="p-1.5 rounded hover:bg-[rgba(239,68,68,0.15)] text-[var(--d2b-text-secondary)] hover:text-[#EF4444] transition-colors"
                              title="Remover"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center rounded-lg border border-dashed border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-main)]">
                    <p className="text-sm text-[var(--d2b-text-secondary)]">Nenhuma pergunta cadastrada</p>
                    <p className="text-xs text-[var(--d2b-text-muted)] mt-1">Clique em "Nova Pergunta" para adicionar</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Dialog Nova Anamnese */}
      <Dialog open={dialogNovaOpen} onOpenChange={setDialogNovaOpen}>
        <DialogContent className="max-w-md bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[var(--d2b-text-primary)]">Nova Anamnese</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-[var(--d2b-text-primary)] mb-2">Título da Anamnese</label>
              <input
                type="text"
                value={novoTitulo}
                onChange={(e) => setNovoTitulo(e.target.value)}
                placeholder="Ex: Anamnese Padrão"
                className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF]"
              />
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDialogNovaOpen(false)}
                className="px-4 py-2 rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleCriarAnamnese}
                className="px-6 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold"
              >
                Salvar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Nova Pergunta */}
      <Dialog open={dialogPerguntaOpen} onOpenChange={setDialogPerguntaOpen}>
        <DialogContent className="max-w-md bg-[var(--d2b-bg-main)] border border-[var(--d2b-border-strong)]">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[var(--d2b-text-primary)]">Nova Pergunta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-[var(--d2b-text-primary)] mb-2">Digite a pergunta</label>
              <textarea
                value={novaPergunta}
                onChange={(e) => setNovaPergunta(e.target.value)}
                placeholder="Ex: Possui contato de emergência?"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm placeholder:text-[var(--d2b-text-muted)] focus:outline-none focus:border-[#7C4DFF] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--d2b-text-primary)] mb-2">Tipo de Resposta</label>
              <select
                value={novoTipoResposta}
                onChange={(e) => setNovoTipoResposta(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--d2b-border-strong)] bg-[var(--d2b-bg-surface)] text-[var(--d2b-text-primary)] text-sm focus:outline-none focus:border-[#7C4DFF]"
              >
                <option value="AMBOS">Ambos</option>
                <option value="SIM_NAO">Sim/Não</option>
                <option value="CAMPO_ABERTO">Campo Aberto</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDialogPerguntaOpen(false)}
                className="px-4 py-2 rounded-lg border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] text-sm font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleAdicionarPergunta}
                className="px-6 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-semibold"
              >
                Ativar
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
