'use client'

import { useEffect, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export interface MensagemWs {
  id: string
  conversaId: string
  texto: string | null
  urlArquivo: string | null
  recebidaEm: string
  enviada: boolean
}

/**
 * Conecta ao WebSocket STOMP/SockJS do app-integration-watts e subscreve ao
 * tópico /topic/conversas/{conversaId}, entregando apenas mensagens RECEBIDAS
 * (enviada === false) via callback.
 *
 * O broker URL é: http(s)://<host>/ws  (negociado pelo SockJS)
 * Variável de ambiente: NEXT_PUBLIC_WATTS_WS_URL (ex: http://localhost:8012)
 */
export function useConversaWebSocket(
  conversaId: string | null,
  onMensagemRecebida: (msg: MensagemWs) => void,
) {
  const clientRef = useRef<Client | null>(null)
  const callbackRef = useRef(onMensagemRecebida)
  callbackRef.current = onMensagemRecebida

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate()
      clientRef.current = null
    }
  }, [])

  const connect = useCallback(() => {
    if (!conversaId) return

    disconnect()

    const base =
      process.env.NEXT_PUBLIC_WATTS_WS_URL ?? 'http://localhost:8012'

    const client = new Client({
      webSocketFactory: () => new SockJS(`${base}/ws`),
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe(`/topic/conversas/${conversaId}`, (frame) => {
          try {
            const msg: MensagemWs = JSON.parse(frame.body)
            // Só repassa mensagens recebidas do cliente — nunca as enviadas por nós
            if (!msg.enviada) {
              callbackRef.current(msg)
            }
          } catch {
            // ignora frames inválidos
          }
        })
      },
    })

    client.activate()
    clientRef.current = client
  }, [conversaId, disconnect])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])
}
