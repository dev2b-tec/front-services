# Guia de Integração - Componentes de IA

## 📦 Componentes Criados

### 1. **SeletorEspecialidade** (`seletor-especialidade.tsx`)
Dropdown com 17 especialidades médicas.

```tsx
import { SeletorEspecialidade, type EspecialidadeValue } from '@/components/clientes/seletor-especialidade'

const [especialidade, setEspecialidade] = useState<EspecialidadeValue>('PADRAO')

<SeletorEspecialidade 
  value={especialidade}
  onChange={setEspecialidade}
  label="Especialidade"
  className="w-64"
/>
```

### 2. **ModalSugestaoIA** (`modal-sugestao-ia.tsx`)
Modal para gerar sugestões de IA baseadas em texto.

```tsx
import { ModalSugestaoIA } from '@/components/clientes/modal-sugestao-ia'

const [modalSugestaoOpen, setModalSugestaoOpen] = useState(false)
const [textoAtual, setTextoAtual] = useState('')

{modalSugestaoOpen && (
  <ModalSugestaoIA
    textoAtual={textoAtual}
    especialidade={especialidade}
    empresaId={empresaId}
    usuarioId={usuarioId}
    onClose={() => setModalSugestaoOpen(false)}
    onAceitar={(sugestao) => {
      setTextoAtual(sugestao)
      // ou qualquer outra lógica
    }}
  />
)}
```

### 3. **BotoesIAAudio** (`botoes-ia-audio.tsx`)
Botões Relato e Atendimento com tooltips integrados.

```tsx
import { BotoesIAAudio } from '@/components/clientes/botoes-ia-audio'

<BotoesIAAudio
  especialidade={especialidade}
  empresaId={empresaId}
  usuarioId={usuarioId}
  onTextoGerado={(texto, tipo) => {
    if (tipo === 'relato') {
      setComentariosGerais(texto)
    } else {
      setConduta(texto)
    }
  }}
/>
```

### 4. **BotaoComTooltip** (`botao-com-tooltip.tsx`)
Wrapper para adicionar tooltip em qualquer botão.

```tsx
import { BotaoComTooltip } from '@/components/clientes/botao-com-tooltip'

<BotaoComTooltip 
  tooltip="Grave um relato de até 5 minutos para gerar um resumo de atendimento"
  side="top"
>
  <button className="...">
    Meu Botão
  </button>
</BotaoComTooltip>
```

## 🎯 Exemplo de Integração Completa no Modal de Evolução

```tsx
export function NovaEvolucaoModal({ ... }) {
  const [especialidade, setEspecialidade] = useState<EspecialidadeValue>('PADRAO')
  const [modalSugestaoOpen, setModalSugestaoOpen] = useState(false)
  const [comentariosGerais, setComentariosGerais] = useState('')
  
  return (
    <div className="...modal...">
      {/* Header com seletor de especialidade */}
      <div className="flex items-center gap-4 px-7 pt-5">
        <SeletorEspecialidade 
          value={especialidade}
          onChange={setEspecialidade}
          className="w-64"
        />
      </div>

      {/* Aba Comentários Gerais */}
      {activeTab === 'comentarios' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label>Comentários Gerais</label>
            
            {/* Botão Sugestão */}
            <BotaoComTooltip tooltip="Gere sugestões de melhoria para o texto">
              <button onClick={() => setModalSugestaoOpen(true)}>
                Sugestão
              </button>
            </BotaoComTooltip>
          </div>
          
          <textarea 
            value={comentariosGerais}
            onChange={(e) => setComentariosGerais(e.target.value)}
          />
        </div>
      )}

      {/* Botões Relato e Atendimento no footer */}
      <div className="footer flex items-center gap-3">
        <BotoesIAAudio
          especialidade={especialidade}
          empresaId={empresaId}
          usuarioId={usuarioId}
          onTextoGerado={(texto, tipo) => {
            if (tipo === 'relato') {
              setComentariosGerais(texto)
            }
          }}
        />
        
        {/* Botão Resumo Gravado com tooltip */}
        <BotaoComTooltip tooltip="Os resumos gerados por IA podem conter erros. Antes de salvá-lo, verifique e edite o conteúdo se necessário">
          <button>Resumo gravado</button>
        </BotaoComTooltip>
      </div>

      {/* Modal de Sugestão */}
      {modalSugestaoOpen && (
        <ModalSugestaoIA
          textoAtual={comentariosGerais}
          especialidade={especialidade}
          empresaId={empresaId}
          onClose={() => setModalSugestaoOpen(false)}
          onAceitar={(sugestao) => setComentariosGerais(sugestao)}
        />
      )}
    </div>
  )
}
```

## 📝 Tooltips Sugeridos

### Botão "Resumo gravado"
```
"Os resumos gerados por IA podem conter erros. Antes de salvá-lo, verifique e edite o conteúdo se necessário"
```

### Botão "Relato"
```
"Grave ou cole o relato do paciente para gerar automaticamente um resumo de consulta"
```

### Botão "Atendimento"
```
"Capture o áudio do seu atendimento para gerar automaticamente um resumo de consulta"
```

### Botão "Sugestão"
```
"Gere sugestões de melhoria para o texto baseadas na especialidade selecionada"
```

### Seletor de Especialidade
```
"Selecione a especialidade para gerar prompts mais adequados ao seu contexto profissional"
```

## 🔗 Endpoints Backend

- `POST /api/v1/evolucoes/ia/relato` - Processar relato
- `POST /api/v1/evolucoes/ia/atendimento` - Processar atendimento
- `POST /api/v1/evolucoes/ia/sugestao` - Gerar sugestão
- `POST /api/v1/evolucoes/ia/gerar-resumo` - Gerar resumo (já existente)

## 🎨 Especialidades Disponíveis

1. Padrão
2. Médico
3. Nutricionista
4. Ginecologista
5. Pediatra
6. Ortopedista
7. Cardiologista
8. Oftalmologista
9. Psicanalista
10. Terapeuta
11. Dermatologia
12. Psicólogo
13. Fisioterapia
14. Endocrinologia
15. Gastroenterologia
16. Geriatria
