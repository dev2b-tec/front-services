'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Mic, Square, Loader2, Play, Pause } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { EspecialidadeValue } from './seletor-especialidade'

interface ModalGravacaoAudioProps {
  tipo: 'relato' | 'atendimento'
  especialidade: EspecialidadeValue
  empresaId: string
  usuarioId?: string
  onClose: () => void
  onTextoGerado: (texto: string) => void
}

export function ModalGravacaoAudio({ 
  tipo, 
  especialidade, 
  empresaId, 
  usuarioId,
  onClose, 
  onTextoGerado 
}: ModalGravacaoAudioProps) {
  const { toast } = useToast()
  const [gravando, setGravando] = useState(false)
  const [processando, setProcessando] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [duracao, setDuracao] = useState(0)
  const [tocando, setTocando] = useState(false)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const intervaloRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const titulo = tipo === 'relato' ? 'Gravar Relato' : 'Gravar Atendimento'
  const descricao = tipo === 'relato' 
    ? 'Grave o relato do paciente para gerar automaticamente um resumo'
    : 'Grave as anotações do atendimento para gerar automaticamente um resumo'

  useEffect(() => {
    return () => {
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current)
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  async function iniciarGravacao() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setGravando(true)
      setDuracao(0)

      intervaloRef.current = setInterval(() => {
        setDuracao(prev => prev + 1)
      }, 1000)
    } catch (error) {
      toast({
        title: 'Erro ao acessar microfone',
        description: 'Verifique as permissões do navegador.',
        variant: 'destructive'
      })
    }
  }

  function pararGravacao() {
    if (mediaRecorderRef.current && gravando) {
      mediaRecorderRef.current.stop()
      setGravando(false)
      if (intervaloRef.current) {
        clearInterval(intervaloRef.current)
      }
    }
  }

  function togglePlayPause() {
    if (!audioRef.current) return

    if (tocando) {
      audioRef.current.pause()
      setTocando(false)
    } else {
      audioRef.current.play()
      setTocando(true)
    }
  }

  async function processarAudio() {
    if (!audioBlob) return

    setProcessando(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'audio.webm')
      formData.append('tipo', tipo)
      formData.append('especialidade', especialidade)
      formData.append('empresaId', empresaId)
      if (usuarioId) formData.append('usuarioId', usuarioId)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/evolucoes/ia/processar-audio`, {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        onTextoGerado(data.texto)
        toast({
          title: 'Sucesso!',
          description: `${tipo === 'relato' ? 'Relato' : 'Atendimento'} processado com IA.`,
        })
        onClose()
      } else {
        toast({
          title: 'Erro ao processar',
          description: 'Não foi possível processar o áudio.',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro de conexão',
        description: 'Verifique sua conexão e tente novamente.',
        variant: 'destructive'
      })
    } finally {
      setProcessando(false)
    }
  }

  function formatarTempo(segundos: number): string {
    const mins = Math.floor(segundos / 60)
    const secs = segundos % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-[var(--d2b-bg-elevated)] border border-[var(--d2b-border-strong)] rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--d2b-border)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <Mic size={20} className="text-[#7C4DFF]" />
            <span className="text-lg font-semibold text-[var(--d2b-text-primary)]">
              {titulo}
            </span>
          </div>
          <button 
            onClick={onClose}
            disabled={gravando || processando}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--d2b-text-muted)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-6">
          <p className="text-sm text-[var(--d2b-text-secondary)]">
            {descricao}
          </p>

          {/* Área de gravação */}
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            {/* Visualizador de gravação */}
            <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              gravando 
                ? 'bg-red-500/20 border-4 border-red-500 animate-pulse' 
                : 'bg-[#7C4DFF]/10 border-4 border-[#7C4DFF]/30'
            }`}>
              <Mic size={48} className={gravando ? 'text-red-500' : 'text-[#7C4DFF]'} />
            </div>

            {/* Timer */}
            <div className="text-3xl font-mono font-bold text-[var(--d2b-text-primary)]">
              {formatarTempo(duracao)}
            </div>

            {/* Botões de controle */}
            <div className="flex items-center gap-3">
              {!gravando && !audioBlob && (
                <button
                  onClick={iniciarGravacao}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#7C4DFF] hover:bg-[#5B21B6] text-white text-sm font-medium transition-colors"
                >
                  <Mic size={18} />
                  Iniciar Gravação
                </button>
              )}

              {gravando && (
                <button
                  onClick={pararGravacao}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
                >
                  <Square size={18} />
                  Parar Gravação
                </button>
              )}

              {audioBlob && !gravando && (
                <>
                  <button
                    onClick={togglePlayPause}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl border border-[var(--d2b-border-strong)] text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] text-sm font-medium transition-colors"
                  >
                    {tocando ? <Pause size={18} /> : <Play size={18} />}
                    {tocando ? 'Pausar' : 'Reproduzir'}
                  </button>
                  <button
                    onClick={() => {
                      setAudioBlob(null)
                      setAudioUrl(null)
                      setDuracao(0)
                    }}
                    className="px-4 py-3 rounded-xl border border-[var(--d2b-border-strong)] text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] hover:bg-[var(--d2b-hover)] text-sm font-medium transition-colors"
                  >
                    Regravar
                  </button>
                </>
              )}
            </div>

            {/* Player de áudio oculto */}
            {audioUrl && (
              <audio
                ref={audioRef}
                src={audioUrl}
                onEnded={() => setTocando(false)}
                className="hidden"
              />
            )}
          </div>

          {/* Aviso */}
          <div className="bg-[#7C4DFF]/5 border border-[#7C4DFF]/20 rounded-xl p-4">
            <p className="text-xs text-[var(--d2b-text-muted)]">
              <strong className="text-[var(--d2b-text-secondary)]">Dica:</strong> Fale de forma clara e pausada para melhor qualidade na transcrição.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--d2b-border)] flex-shrink-0">
          <button
            onClick={onClose}
            disabled={gravando || processando}
            className="px-4 py-2 text-sm text-[var(--d2b-text-secondary)] hover:text-[var(--d2b-text-primary)] font-medium transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button
            onClick={processarAudio}
            disabled={!audioBlob || gravando || processando}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
          >
            {processando ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Processando...
              </>
            ) : (
              'Processar Áudio'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
