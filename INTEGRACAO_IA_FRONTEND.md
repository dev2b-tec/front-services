# 🎨 Integração IA no Frontend - Guia Completo

## 📍 **Pontos de Integração Identificados**

Após análise do `front-services`, identifiquei **3 pontos principais** onde os botões de IA devem ser adicionados:

---

## 1️⃣ **Tab Evoluções - Botão "Gerar Resumo com IA"**

### **Arquivo:** `components/clientes/tab-evolucoes.tsx`

### **Onde adicionar:**
No modal `NovaEvolucaoModal`, na aba "Resumo AI" (linha ~544-560)

### **O que fazer:**

#### **A. Adicionar import do hook useIA**
```typescript
// No topo do arquivo, adicionar:
import { useIA } from '@/hooks/use-ia'
```

#### **B. Dentro do componente NovaEvolucaoModal, adicionar:**
```typescript
// Após a linha 232 (const [saving, setSaving] = useState(false))
const { gerarResumoEvolucao, loading: loadingIA } = useIA()
const [empresaId, setEmpresaId] = useState<string>('') // Pegar do contexto/props
```

#### **C. Criar função para gerar resumo:**
```typescript
// Após a função getConteudo (linha ~265)
async function handleGerarResumoIA() {
  const resumo = await gerarResumoEvolucao({
    comentariosGerais: conteudos.comentariosGerais,
    conduta: conteudos.conduta,
    examesRealizados: conteudos.examesRealizados,
    prescricao: conteudos.prescricao,
    empresaId: empresaId, // Pegar do contexto
    usuarioId: undefined, // Opcional
  })

  if (resumo) {
    setConteudos((prev) => ({ ...prev, resumoAi: resumo }))
    toast({ 
      title: '✨ Resumo gerado!', 
      description: 'O resumo foi gerado com IA. Revise antes de salvar.' 
    })
  }
}
```

#### **D. Adicionar botão na interface (linha ~547):**

**LOCALIZAÇÃO EXATA:** Logo após a linha 547 onde tem o ícone de microfone

```typescript
{abaAtiva === 'Resumo AI' && (
  <>
    <p className="text-xs text-[var(--d2b-text-muted)] mt-0.5">
      * Os resumos gerados por IA podem conter erros. Antes de salvá-lo, verifique e edite o conteúdo se necessário
    </p>
    
    {/* ADICIONAR ESTE BOTÃO AQUI: */}
    <div className="mt-3 flex items-center gap-2">
      <button
        onClick={handleGerarResumoIA}
        disabled={loadingIA || (!conteudos.comentariosGerais && !conteudos.conduta && !conteudos.examesRealizados && !conteudos.prescricao)}
        className="flex items-center gap-2 bg-gradient-to-r from-[#7C4DFF] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#7C4DFF] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-lg shadow-purple-500/20"
      >
        {loadingIA ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            Gerando...
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            </svg>
            ✨ Gerar Resumo com IA
          </>
        )}
      </button>
      
      {!conteudos.comentariosGerais && !conteudos.conduta && !conteudos.examesRealizados && !conteudos.prescricao && (
        <p className="text-xs text-amber-400">
          Preencha pelo menos um campo (Comentários, Conduta, Exames ou Prescrição) para gerar o resumo
        </p>
      )}
    </div>
  </>
)}
```

---

## 2️⃣ **Tab Anamnese - Botão "Analisar com IA"**

### **Arquivo:** `components/clientes/tab-anamnese.tsx`

### **Onde adicionar:**
No botão "Salvar Anamnese" (linha ~366-375)

### **O que fazer:**

#### **A. Adicionar import:**
```typescript
import { useIA } from '@/hooks/use-ia'
```

#### **B. Adicionar hook e função:**
```typescript
// Dentro do componente TabAnamnese, após linha 116
const { gerarResumoEvolucao, loading: loadingIA } = useIA()

async function analisarComIA() {
  // Montar texto com todas as respostas
  const respostasTexto = modeloSelecionado?.perguntas
    .map((p, i) => {
      const resp = respostas[p.id]
      if (!resp || (!resp.texto && resp.opcao === 'NENHUM')) return null
      return `${i + 1}. ${p.texto}\nResposta: ${resp.opcao !== 'NENHUM' ? resp.opcao : ''} ${resp.texto || ''}`
    })
    .filter(Boolean)
    .join('\n\n')

  if (!respostasTexto) {
    toast({ title: 'Preencha a anamnese primeiro', variant: 'destructive' })
    return
  }

  // Chamar IA (criar novo método no hook ou usar o existente adaptado)
  toast({ 
    title: '✨ Análise em desenvolvimento', 
    description: 'Funcionalidade será implementada em breve' 
  })
}
```

#### **C. Adicionar botão (linha ~366):**
```typescript
{/* Save */}
<div className="flex justify-end gap-3 pt-2 pb-4">
  <button
    onClick={analisarComIA}
    disabled={loadingIA || perguntas.length === 0}
    className="flex items-center gap-2 bg-gradient-to-r from-[#7C4DFF] to-[#5B21B6] hover:from-[#5B21B6] hover:to-[#7C4DFF] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-purple-500/20"
  >
    {loadingIA ? (
      <>
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        Analisando...
      </>
    ) : (
      <>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4"/>
          <path d="M12 8h.01"/>
        </svg>
        ✨ Analisar com IA
      </>
    )}
  </button>
  
  <button
    onClick={salvar}
    disabled={salvando || perguntas.length === 0}
    className="flex items-center gap-2 bg-[#7C4DFF] hover:bg-[#5B21B6] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
  >
    {salvando ? <RefreshCw size={14} className="animate-spin" /> : null}
    Salvar Anamnese
  </button>
</div>
```

---

## 3️⃣ **Tab Documentos - Botão "Sugestão com IA"**

### **Arquivo:** `components/clientes/tab-documentos.tsx`

### **Onde adicionar:**
No modal de novo documento (linha ~166-179)

### **O que fazer:**

#### **A. Adicionar import:**
```typescript
import { useIA } from '@/hooks/use-ia'
```

#### **B. Adicionar hook:**
```typescript
// Dentro do componente TabDocumentos
const { gerarResumoEvolucao, loading: loadingIA } = useIA()
```

#### **C. Adicionar botão no modal de criar documento:**

**LOCALIZAÇÃO:** Próximo ao campo de conteúdo do documento (linha ~176)

```typescript
{/* Adicionar botão acima do textarea de conteúdo */}
<div className="flex items-center justify-between mb-2">
  <label className="text-xs font-medium text-[var(--d2b-text-muted)]">Conteúdo</label>
  <button
    onClick={() => {
      toast({ 
        title: '✨ Sugestão em desenvolvimento', 
        description: 'Funcionalidade será implementada em breve' 
      })
    }}
    disabled={loadingIA}
    className="flex items-center gap-1.5 text-xs text-[#7C4DFF] hover:text-[#5B21B6] transition-colors"
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    </svg>
    ✨ Sugerir com IA
  </button>
</div>
```

---

## 🔧 **Configuração Necessária**

### **1. Variável de Ambiente**

Adicionar no arquivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8011
```

### **2. Hook useIA criado**

Arquivo: `hooks/use-ia.ts` ✅ **JÁ CRIADO**

---

## 📊 **Resumo dos Arquivos a Modificar**

| Arquivo | Modificação | Status |
|---------|-------------|--------|
| `hooks/use-ia.ts` | Hook para chamadas de IA | ✅ Criado |
| `components/clientes/tab-evolucoes.tsx` | Botão "Gerar Resumo com IA" | ⏳ Pendente |
| `components/clientes/tab-anamnese.tsx` | Botão "Analisar com IA" | ⏳ Pendente |
| `components/clientes/tab-documentos.tsx` | Botão "Sugestão com IA" | ⏳ Pendente |

---

## 🎨 **Design dos Botões**

Todos os botões seguem o padrão:
- **Cor:** Gradiente roxo (`from-[#7C4DFF] to-[#5B21B6]`)
- **Ícone:** Microfone ou sparkles (✨)
- **Estado loading:** Spinner animado
- **Shadow:** `shadow-lg shadow-purple-500/20`
- **Hover:** Inverte gradiente

---

## 🚀 **Como Testar**

### **1. Iniciar serviços backend:**
```bash
# Terminal 1 - app-integration-ia
cd app-integration-ia/app
./mvnw spring-boot:run

# Terminal 2 - app-agenda
cd app-agenda/app
./mvnw spring-boot:run
```

### **2. Iniciar frontend:**
```bash
cd front-services/app
npm run dev
```

### **3. Testar:**
1. Acessar `http://localhost:3001`
2. Ir em **Clientes** → Selecionar um paciente
3. Ir na aba **Evoluções**
4. Clicar em **+ Nova Evolução**
5. Preencher campos (Comentários, Conduta, etc.)
6. Ir na aba **Resumo AI**
7. Clicar em **✨ Gerar Resumo com IA**

---

## ⚠️ **Importante**

### **Obter empresaId:**

O `empresaId` precisa ser passado para o hook. Você pode:

**Opção 1:** Pegar do contexto/session
```typescript
import { useSession } from 'next-auth/react'

const { data: session } = useSession()
const empresaId = session?.user?.empresaId
```

**Opção 2:** Passar como prop do componente pai
```typescript
// No componente ClienteDetalheView, passar:
<NovaEvolucaoModal 
  pacienteId={pacienteId}
  empresaId={empresaId} // Adicionar esta prop
  onClose={...}
  onSaved={...}
/>
```

---

## 📝 **Próximos Passos**

1. ✅ Hook `useIA` criado
2. ⏳ Modificar `tab-evolucoes.tsx` (adicionar botão)
3. ⏳ Modificar `tab-anamnese.tsx` (adicionar botão)
4. ⏳ Modificar `tab-documentos.tsx` (adicionar botão)
5. ⏳ Testar integração completa
6. ⏳ Ajustar UX/feedback visual

---

## 🎯 **Resultado Final**

Quando concluído, o usuário poderá:

1. **Em Evoluções:** Preencher campos e clicar em "Gerar Resumo com IA" para obter um resumo profissional automático
2. **Em Anamneses:** Analisar respostas e receber insights clínicos
3. **Em Documentos:** Gerar sugestões de atestados, receitas e relatórios

Tudo isso usando **gpt-4o** com cálculo automático de custos! 🚀
